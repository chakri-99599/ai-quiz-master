import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { action, topic, content, difficulty, questions, userAnswers, numQuestions } = await req.json();

    let systemPrompt = "";
    let userPrompt = "";

    if (action === "generate_quiz") {
      systemPrompt = `You are an expert quiz generator. Generate exactly ${numQuestions || 5} multiple choice questions. Each question must have exactly 4 options labeled A, B, C, D. Adjust complexity based on difficulty level: ${difficulty || 'intermediate'}.

IMPORTANT: You MUST respond by calling the generate_quiz function with the questions array. Do not respond with plain text.`;
      
      if (content) {
        userPrompt = `Generate a quiz based on this content:\n\n${content.substring(0, 8000)}\n\nDifficulty: ${difficulty || 'intermediate'}`;
      } else {
        userPrompt = `Generate a quiz about: ${topic}\nDifficulty: ${difficulty || 'intermediate'}`;
      }

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          tools: [{
            type: "function",
            function: {
              name: "generate_quiz",
              description: "Generate quiz questions with multiple choice answers",
              parameters: {
                type: "object",
                properties: {
                  questions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        question: { type: "string" },
                        options: {
                          type: "object",
                          properties: {
                            A: { type: "string" },
                            B: { type: "string" },
                            C: { type: "string" },
                            D: { type: "string" },
                          },
                          required: ["A", "B", "C", "D"],
                        },
                        correctAnswer: { type: "string", enum: ["A", "B", "C", "D"] },
                        explanation: { type: "string" },
                      },
                      required: ["question", "options", "correctAnswer", "explanation"],
                    },
                  },
                },
                required: ["questions"],
              },
            },
          }],
          tool_choice: { type: "function", function: { name: "generate_quiz" } },
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        const t = await response.text();
        console.error("AI error:", response.status, t);
        throw new Error("AI generation failed");
      }

      const data = await response.json();
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall) {
        const parsed = JSON.parse(toolCall.function.arguments);
        return new Response(JSON.stringify({ questions: parsed.questions }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("No tool call in response");

    } else if (action === "summarize") {
      systemPrompt = "You are a helpful assistant. Provide a clear, concise summary of the given content in 3-5 bullet points.";
      userPrompt = `Summarize this content:\n\n${content?.substring(0, 8000)}`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
      });

      if (!response.ok) throw new Error("Summarization failed");
      const data = await response.json();
      const summary = data.choices?.[0]?.message?.content || "Unable to generate summary.";
      return new Response(JSON.stringify({ summary }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else if (action === "analyze_results") {
      systemPrompt = `You are an educational analyst. Analyze quiz performance and provide insights. Respond by calling the analyze_results function.`;
      userPrompt = `Analyze these quiz results:
Topic: ${topic}
Questions and answers: ${JSON.stringify(questions?.map((q: any, i: number) => ({
  question: q.question,
  correctAnswer: q.correctAnswer,
  userAnswer: userAnswers?.[i],
  isCorrect: q.correctAnswer === userAnswers?.[i],
})))}`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          tools: [{
            type: "function",
            function: {
              name: "analyze_results",
              description: "Analyze quiz results and provide insights",
              parameters: {
                type: "object",
                properties: {
                  strengths: { type: "array", items: { type: "string" } },
                  weaknesses: { type: "array", items: { type: "string" } },
                  recommendations: { type: "array", items: { type: "string" } },
                  performanceLevel: { type: "string", enum: ["Excellent", "Good", "Average", "Needs Improvement"] },
                },
                required: ["strengths", "weaknesses", "recommendations", "performanceLevel"],
              },
            },
          }],
          tool_choice: { type: "function", function: { name: "analyze_results" } },
        }),
      });

      if (!response.ok) throw new Error("Analysis failed");
      const data = await response.json();
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall) {
        return new Response(JSON.stringify(JSON.parse(toolCall.function.arguments)), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("No analysis generated");
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
