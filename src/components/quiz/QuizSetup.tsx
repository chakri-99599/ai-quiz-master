import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { Type, FileText, Upload, BookOpen, Target, Clock, ChevronRight, Sparkles } from "lucide-react";

interface QuizSetupProps {
  topic: string;
  setTopic: (v: string) => void;
  difficulty: string;
  setDifficulty: (v: string) => void;
  mode: "learning" | "test";
  setMode: (v: "learning" | "test") => void;
  inputMethod: "topic" | "paste" | "pdf";
  setInputMethod: (v: "topic" | "paste" | "pdf") => void;
  pastedContent: string;
  setPastedContent: (v: string) => void;
  numQuestions: number;
  setNumQuestions: (v: number) => void;
  timerEnabled: boolean;
  setTimerEnabled: (v: boolean) => void;
  timePerQuestion: number;
  setTimePerQuestion: (v: number) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  generateQuiz: () => void;
}

const difficulties = [
  { value: "beginner", label: "Beginner", color: "bg-success/10 text-success border-success/20" },
  { value: "intermediate", label: "Intermediate", color: "bg-warning/10 text-warning border-warning/20" },
  { value: "advanced", label: "Advanced", color: "bg-destructive/10 text-destructive border-destructive/20" },
];

const QuizSetup = ({
  topic, setTopic, difficulty, setDifficulty, mode, setMode,
  inputMethod, setInputMethod, pastedContent, setPastedContent,
  numQuestions, setNumQuestions, timerEnabled, setTimerEnabled,
  timePerQuestion, setTimePerQuestion, handleFileUpload, generateQuiz,
}: QuizSetupProps) => {
  const canGenerate = inputMethod === "topic" ? topic.trim().length > 0 : pastedContent.trim().length > 0;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl font-bold mb-2">Create Your Quiz</h1>
        <p className="text-muted-foreground">Choose how you want to generate your quiz</p>
      </div>

      {/* Input Method */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-lg">Input Method</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {([
              { value: "topic", icon: Type, label: "Topic" },
              { value: "paste", icon: FileText, label: "Paste Content" },
              { value: "pdf", icon: Upload, label: "Upload PDF" },
            ] as const).map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => setInputMethod(value)}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${inputMethod === value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}
              >
                <Icon className={`h-5 w-5 ${inputMethod === value ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>

          <div className="mt-4">
            {inputMethod === "topic" && (
              <Input placeholder="e.g. Machine Learning, World History, Organic Chemistry..." value={topic} onChange={(e) => setTopic(e.target.value)} className="text-base" />
            )}
            {inputMethod === "paste" && (
              <div className="space-y-3">
                <Input placeholder="Topic name (optional)" value={topic} onChange={(e) => setTopic(e.target.value)} />
                <Textarea placeholder="Paste your content here... (notes, articles, study material)" value={pastedContent} onChange={(e) => setPastedContent(e.target.value)} rows={6} />
              </div>
            )}
            {inputMethod === "pdf" && (
              <div className="space-y-3">
                <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-border p-8 hover:border-primary/30 transition-colors">
                  <label className="cursor-pointer text-center">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Click to upload PDF</span>
                    <input type="file" accept=".pdf,.txt" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
                {pastedContent && <p className="text-sm text-accent">✓ File loaded successfully</p>}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Difficulty */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" /> Difficulty
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {difficulties.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDifficulty(d.value)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${difficulty === d.value ? d.color + " border-current" : "border-border text-muted-foreground hover:text-foreground"}`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Mode */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" /> Mode
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {(["learning", "test"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-all ${mode === m ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
                >
                  {m === "learning" ? "📖 Learning" : "📝 Test"}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Questions count */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg">Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {[5, 10, 15, 20].map((n) => (
                <button
                  key={n}
                  onClick={() => setNumQuestions(n)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${numQuestions === n ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Timer */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Timer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Enable Timer</Label>
              <Switch checked={timerEnabled} onCheckedChange={setTimerEnabled} />
            </div>
            {timerEnabled && (
              <div className="flex gap-2">
                {[15, 30, 45, 60].map((s) => (
                  <button
                    key={s}
                    onClick={() => setTimePerQuestion(s)}
                    className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-all ${timePerQuestion === s ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"}`}
                  >
                    {s}s
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Generate */}
      <Button onClick={generateQuiz} disabled={!canGenerate} size="lg" className="w-full gradient-primary text-primary-foreground text-base">
        <Sparkles className="mr-2 h-5 w-5" /> Generate Quiz
      </Button>
    </motion.div>
  );
};

export default QuizSetup;
