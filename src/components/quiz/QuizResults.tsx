import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Trophy, CheckCircle2, XCircle, Clock, BarChart3, ArrowRight, Download, RotateCcw, Target, TrendingUp, AlertTriangle } from "lucide-react";
import type { Question } from "@/pages/Dashboard";

interface QuizResultsProps {
  questions: Question[];
  userAnswers: (string | null)[];
  topic: string;
  difficulty: string;
  startTime: number;
  analysis: any;
  onRestart: () => void;
  userName: string;
}

const QuizResults = ({ questions, userAnswers, topic, difficulty, startTime, analysis, onRestart, userName }: QuizResultsProps) => {
  const score = questions.reduce((acc, q, i) => acc + (q.correctAnswer === userAnswers[i] ? 1 : 0), 0);
  const total = questions.length;
  const accuracy = Math.round((score / total) * 100);
  const timeTaken = Math.round((Date.now() - startTime) / 1000);
  const mins = Math.floor(timeTaken / 60);
  const secs = timeTaken % 60;

  const getLevel = () => {
    if (accuracy >= 90) return { label: "Excellent", color: "text-success", icon: Trophy };
    if (accuracy >= 70) return { label: "Good", color: "text-accent", icon: TrendingUp };
    if (accuracy >= 50) return { label: "Average", color: "text-warning", icon: Target };
    return { label: "Needs Improvement", color: "text-destructive", icon: AlertTriangle };
  };

  const level = getLevel();

  const downloadCertificate = () => {
    const cert = `
╔══════════════════════════════════════════════╗
║                                              ║
║         CERTIFICATE OF COMPLETION            ║
║                                              ║
║  This certifies that                         ║
║                                              ║
║  ${userName.padEnd(42)}║
║                                              ║
║  has successfully completed the quiz on      ║
║                                              ║
║  Topic: ${(topic || "General Knowledge").padEnd(36)}║
║  Score: ${(score + "/" + total + " (" + accuracy + "%)").padEnd(36)}║
║  Level: ${difficulty.padEnd(36)}║
║  Date:  ${new Date().toLocaleDateString().padEnd(36)}║
║                                              ║
║  Performance: ${(level.label).padEnd(30)}║
║                                              ║
║              QuizMind AI                     ║
╚══════════════════════════════════════════════╝
    `.trim();

    const blob = new Blob([cert], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `QuizMind_Certificate_${topic || "quiz"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Score Hero */}
      <Card className="overflow-hidden">
        <div className="gradient-hero p-8 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary-foreground/10 backdrop-blur">
              <level.icon className={`h-10 w-10 text-primary-foreground`} />
            </div>
          </motion.div>
          <h2 className="font-display text-3xl font-bold text-primary-foreground mb-1">{level.label}</h2>
          <p className="text-primary-foreground/70 text-lg">{accuracy}% Accuracy</p>
        </div>
        <CardContent className="py-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold font-display text-foreground">{score}/{total}</div>
              <div className="text-xs text-muted-foreground">Score</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-display text-success">{score}</div>
              <div className="text-xs text-muted-foreground">Correct</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-display text-destructive">{total - score}</div>
              <div className="text-xs text-muted-foreground">Wrong</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-display text-foreground">{mins}:{secs.toString().padStart(2, "0")}</div>
              <div className="text-xs text-muted-foreground">Time</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis */}
      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysis.strengths?.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-base flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" /> Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5">
                  {analysis.strengths.map((s: string, i: number) => (
                    <li key={i} className="text-sm text-muted-foreground">• {s}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          {analysis.weaknesses?.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning" /> Areas to Improve
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5">
                  {analysis.weaknesses.map((w: string, i: number) => (
                    <li key={i} className="text-sm text-muted-foreground">• {w}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          {analysis.recommendations?.length > 0 && (
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" /> Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5">
                  {analysis.recommendations.map((r: string, i: number) => (
                    <li key={i} className="text-sm text-muted-foreground">• {r}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Question Review */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">Question Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.map((q, i) => {
            const correct = q.correctAnswer === userAnswers[i];
            return (
              <div key={i} className={`rounded-xl border p-4 ${correct ? "border-success/20 bg-success/5" : "border-destructive/20 bg-destructive/5"}`}>
                <div className="flex items-start gap-3 mb-2">
                  {correct ? <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" /> : <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />}
                  <div>
                    <p className="text-sm font-medium">{q.question}</p>
                    <div className="mt-2 space-y-1 text-xs">
                      <p><span className="text-muted-foreground">Your answer:</span> <span className={correct ? "text-success font-medium" : "text-destructive font-medium"}>{userAnswers[i] ? `${userAnswers[i]}: ${q.options[userAnswers[i] as keyof typeof q.options]}` : "Not answered"}</span></p>
                      {!correct && <p><span className="text-muted-foreground">Correct:</span> <span className="text-success font-medium">{q.correctAnswer}: {q.options[q.correctAnswer as keyof typeof q.options]}</span></p>}
                      <p className="text-muted-foreground mt-1">{q.explanation}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={onRestart} className="flex-1 gradient-primary text-primary-foreground">
          <RotateCcw className="mr-2 h-4 w-4" /> New Quiz
        </Button>
        <Button onClick={downloadCertificate} variant="outline" className="flex-1">
          <Download className="mr-2 h-4 w-4" /> Download Certificate
        </Button>
      </div>
    </motion.div>
  );
};

export default QuizResults;
