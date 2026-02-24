import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, LogOut, FileText, Type, Upload, BookOpen, Target, Clock, ChevronRight, History, BarChart3, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import QuizSetup from "@/components/quiz/QuizSetup";
import QuizActive from "@/components/quiz/QuizActive";
import QuizResults from "@/components/quiz/QuizResults";

export type Question = {
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correctAnswer: string;
  explanation: string;
};

export type QuizState = "setup" | "loading" | "summary" | "active" | "results";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [quizState, setQuizState] = useState<QuizState>("setup");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [mode, setMode] = useState<"learning" | "test">("test");
  const [inputMethod, setInputMethod] = useState<"topic" | "paste" | "pdf">("topic");
  const [pastedContent, setPastedContent] = useState("");
  const [summary, setSummary] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [loadingStep, setLoadingStep] = useState(0);
  const [timePerQuestion, setTimePerQuestion] = useState(30);
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [startTime, setStartTime] = useState<number>(0);
  const [analysis, setAnalysis] = useState<any>(null);

  const loadingSteps = ["Reading content...", "Analyzing information...", "Generating questions...", "Preparing quiz..."];

  useEffect(() => {
    if (!user) navigate("/auth");
  }, [user, navigate]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== "application/pdf") {
      toast({ title: "Invalid file", description: "Please upload a PDF file.", variant: "destructive" });
      return;
    }
    // Read as text (basic extraction)
    const reader = new FileReader();
    reader.onload = async () => {
      const text = reader.result as string;
      // For PDFs we'll extract text on the AI side via content
      setPastedContent(`[PDF Content from: ${file.name}]\n${text.substring(0, 10000)}`);
      setTopic(file.name.replace(".pdf", ""));
      toast({ title: "File loaded", description: `${file.name} has been loaded.` });
    };
    reader.readAsText(file);
  };

  const generateSummary = async (content: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("quiz-ai", {
        body: { action: "summarize", content },
      });
      if (error) throw error;
      return data.summary;
    } catch {
      return null;
    }
  };

  const generateQuiz = async () => {
    setQuizState("loading");
    setLoadingStep(0);

    const interval = setInterval(() => {
      setLoadingStep((prev) => Math.min(prev + 1, loadingSteps.length - 1));
    }, 1500);

    try {
      const content = inputMethod === "topic" ? undefined : pastedContent;
      
      // Generate summary first if content provided
      if (content) {
        const sum = await generateSummary(content);
        if (sum) {
          setSummary(sum);
          setQuizState("summary");
          clearInterval(interval);
          return;
        }
      }

      await startQuizGeneration(content);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to generate quiz", variant: "destructive" });
      setQuizState("setup");
    } finally {
      clearInterval(interval);
    }
  };

  const startQuizGeneration = async (content?: string) => {
    setQuizState("loading");
    setLoadingStep(2);

    const loadInterval = setInterval(() => {
      setLoadingStep((prev) => Math.min(prev + 1, loadingSteps.length - 1));
    }, 1500);

    try {
      const { data, error } = await supabase.functions.invoke("quiz-ai", {
        body: {
          action: "generate_quiz",
          topic: topic || "General Knowledge",
          content,
          difficulty,
          numQuestions,
        },
      });

      clearInterval(loadInterval);

      if (error) throw error;
      if (!data.questions?.length) throw new Error("No questions generated");

      setQuestions(data.questions);
      setUserAnswers(new Array(data.questions.length).fill(null));
      setCurrentQuestion(0);
      setStartTime(Date.now());
      setQuizState("active");
    } catch (err: any) {
      clearInterval(loadInterval);
      toast({ title: "Error", description: err.message || "Failed to generate quiz", variant: "destructive" });
      setQuizState("setup");
    }
  };

  const handleAnswer = (answer: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = answer;
    setUserAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const finishQuiz = async () => {
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    const score = questions.reduce((acc, q, i) => acc + (q.correctAnswer === userAnswers[i] ? 1 : 0), 0);

    // Save to history
    try {
      await supabase.from("quiz_history").insert({
        user_id: user!.id,
        topic: topic || "General Knowledge",
        difficulty,
        mode,
        score,
        total_questions: questions.length,
        time_taken: timeTaken,
        questions: questions as any,
        results: { userAnswers, score, timeTaken } as any,
      });
    } catch (e) {
      console.error("Failed to save quiz:", e);
    }

    // Analyze results
    try {
      const { data } = await supabase.functions.invoke("quiz-ai", {
        body: {
          action: "analyze_results",
          topic,
          questions,
          userAnswers,
        },
      });
      setAnalysis(data);
    } catch (e) {
      console.error("Analysis failed:", e);
    }

    setQuizState("results");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <Brain className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-base font-bold">QuizMind AI</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/history")}>
              <History className="h-4 w-4 mr-1" /> History
            </Button>
            <Button variant="ghost" size="sm" onClick={async () => { await signOut(); navigate("/"); }}>
              <LogOut className="h-4 w-4 mr-1" /> Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <AnimatePresence mode="wait">
          {quizState === "setup" && (
            <QuizSetup
              key="setup"
              topic={topic}
              setTopic={setTopic}
              difficulty={difficulty}
              setDifficulty={setDifficulty}
              mode={mode}
              setMode={setMode}
              inputMethod={inputMethod}
              setInputMethod={setInputMethod}
              pastedContent={pastedContent}
              setPastedContent={setPastedContent}
              numQuestions={numQuestions}
              setNumQuestions={setNumQuestions}
              timerEnabled={timerEnabled}
              setTimerEnabled={setTimerEnabled}
              timePerQuestion={timePerQuestion}
              setTimePerQuestion={setTimePerQuestion}
              handleFileUpload={handleFileUpload}
              generateQuiz={generateQuiz}
            />
          )}

          {quizState === "loading" && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-20">
              <div className="relative mb-8">
                <div className="h-20 w-20 rounded-full gradient-primary animate-pulse-glow flex items-center justify-center">
                  <Brain className="h-10 w-10 text-primary-foreground" />
                </div>
              </div>
              <div className="space-y-3 text-center">
                {loadingSteps.map((step, i) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0.3 }}
                    animate={{ opacity: i <= loadingStep ? 1 : 0.3 }}
                    className="flex items-center gap-2 text-sm"
                  >
                    {i <= loadingStep ? (
                      <Loader2 className={`h-4 w-4 ${i < loadingStep ? 'text-accent' : 'animate-spin text-primary'}`} />
                    ) : (
                      <div className="h-4 w-4" />
                    )}
                    <span className={i <= loadingStep ? "text-foreground" : "text-muted-foreground"}>{step}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {quizState === "summary" && (
            <motion.div key="summary" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="font-display">Content Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="prose prose-sm max-w-none text-foreground">
                    <p className="whitespace-pre-wrap text-muted-foreground">{summary}</p>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={() => startQuizGeneration(pastedContent)} className="gradient-primary text-primary-foreground">
                      Generate Quiz <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={() => setQuizState("setup")}>
                      Back to Setup
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {quizState === "active" && (
            <QuizActive
              key="active"
              questions={questions}
              currentQuestion={currentQuestion}
              userAnswers={userAnswers}
              mode={mode}
              timerEnabled={timerEnabled}
              timePerQuestion={timePerQuestion}
              onAnswer={handleAnswer}
              onNext={nextQuestion}
              onPrev={prevQuestion}
              onFinish={finishQuiz}
            />
          )}

          {quizState === "results" && (
            <QuizResults
              key="results"
              questions={questions}
              userAnswers={userAnswers}
              topic={topic}
              difficulty={difficulty}
              startTime={startTime}
              analysis={analysis}
              onRestart={() => setQuizState("setup")}
              userName={user.user_metadata?.full_name || user.email || "Student"}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Dashboard;
