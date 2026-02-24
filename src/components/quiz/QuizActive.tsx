import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import type { Question } from "@/pages/Dashboard";

interface QuizActiveProps {
  questions: Question[];
  currentQuestion: number;
  userAnswers: (string | null)[];
  mode: "learning" | "test";
  timerEnabled: boolean;
  timePerQuestion: number;
  onAnswer: (answer: string) => void;
  onNext: () => void;
  onPrev: () => void;
  onFinish: () => void;
}

const QuizActive = ({
  questions, currentQuestion, userAnswers, mode, timerEnabled, timePerQuestion,
  onAnswer, onNext, onPrev, onFinish,
}: QuizActiveProps) => {
  const [timer, setTimer] = useState(timePerQuestion);
  const [showFeedback, setShowFeedback] = useState(false);

  const q = questions[currentQuestion];
  const selected = userAnswers[currentQuestion];
  const isLast = currentQuestion === questions.length - 1;
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const answered = userAnswers.filter((a) => a !== null).length;

  useEffect(() => {
    if (!timerEnabled) return;
    setTimer(timePerQuestion);
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (isLast) onFinish();
          else onNext();
          return timePerQuestion;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentQuestion, timerEnabled, timePerQuestion]);

  useEffect(() => {
    setShowFeedback(false);
  }, [currentQuestion]);

  const handleSelect = (key: string) => {
    onAnswer(key);
    if (mode === "learning") {
      setShowFeedback(true);
    }
  };

  const isCorrect = selected === q.correctAnswer;

  const getOptionStyle = (key: string) => {
    if (!showFeedback && mode === "learning") {
      return selected === key
        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
        : "border-border hover:border-primary/30";
    }
    if (showFeedback && mode === "learning") {
      if (key === q.correctAnswer) return "border-success bg-success/10 ring-2 ring-success/20";
      if (key === selected && key !== q.correctAnswer) return "border-destructive bg-destructive/10 ring-2 ring-destructive/20";
      return "border-border opacity-50";
    }
    // Test mode
    return selected === key
      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
      : "border-border hover:border-primary/30";
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Question {currentQuestion + 1} of {questions.length}</span>
          <span className="text-muted-foreground">{answered} answered</span>
        </div>
        <Progress value={progress} className="h-2" />
        {timerEnabled && (
          <div className="flex items-center gap-2 justify-end">
            <Clock className={`h-4 w-4 ${timer <= 5 ? "text-destructive" : "text-muted-foreground"}`} />
            <span className={`text-sm font-mono font-medium ${timer <= 5 ? "text-destructive" : "text-muted-foreground"}`}>
              {timer}s
            </span>
          </div>
        )}
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div key={currentQuestion} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
          <Card>
            <CardContent className="pt-6">
              <h2 className="font-display text-xl font-semibold mb-6">{q.question}</h2>
              <div className="space-y-3">
                {(Object.entries(q.options) as [string, string][]).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => handleSelect(key)}
                    disabled={showFeedback}
                    className={`w-full text-left rounded-xl border-2 p-4 transition-all ${getOptionStyle(key)}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-current/20 text-sm font-bold">
                        {key}
                      </span>
                      <span className="text-sm pt-0.5">{value}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Learning mode feedback */}
              {showFeedback && mode === "learning" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-3">
                  <div className={`flex items-center gap-2 text-sm font-medium ${isCorrect ? "text-success" : "text-destructive"}`}>
                    {isCorrect ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                    {isCorrect ? "Correct!" : `Incorrect. The correct answer is ${q.correctAnswer}.`}
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-4 text-sm text-muted-foreground">
                    <strong className="text-foreground">Explanation:</strong> {q.explanation}
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onPrev} disabled={currentQuestion === 0}>
          <ChevronLeft className="mr-1 h-4 w-4" /> Previous
        </Button>
        <div className="flex gap-1.5">
          {questions.map((_, i) => (
            <div key={i} className={`h-2 w-2 rounded-full transition-all ${i === currentQuestion ? "bg-primary w-6" : userAnswers[i] ? "bg-accent" : "bg-border"}`} />
          ))}
        </div>
        {isLast ? (
          <Button onClick={onFinish} className="gradient-primary text-primary-foreground" disabled={answered < questions.length}>
            <Check className="mr-1 h-4 w-4" /> Finish
          </Button>
        ) : (
          <Button onClick={() => { setShowFeedback(false); onNext(); }}>
            Next <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default QuizActive;
