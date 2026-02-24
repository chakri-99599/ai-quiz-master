import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Brain, ArrowLeft, Trophy, Clock, Target, Calendar, BarChart3 } from "lucide-react";

const QuizHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    const { data } = await supabase
      .from("quiz_history")
      .select("*")
      .order("created_at", { ascending: false });
    setHistory(data || []);
    setLoading(false);
  };

  const avgScore = history.length > 0
    ? Math.round(history.reduce((sum, h) => sum + (h.score / h.total_questions) * 100, 0) / history.length)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <Brain className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-base font-bold">QuizMind AI</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold mb-2">Quiz History</h1>
          <p className="text-muted-foreground mb-8">Review your past performance</p>

          {/* Stats */}
          {history.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              <Card>
                <CardContent className="pt-4 text-center">
                  <div className="text-2xl font-bold font-display">{history.length}</div>
                  <div className="text-xs text-muted-foreground">Quizzes Taken</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <div className="text-2xl font-bold font-display text-accent">{avgScore}%</div>
                  <div className="text-xs text-muted-foreground">Avg Score</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <div className="text-2xl font-bold font-display text-primary">
                    {history.length > 0 ? Math.round((history[0].score / history[0].total_questions) * 100) : 0}%
                  </div>
                  <div className="text-xs text-muted-foreground">Latest</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* History list */}
          {loading ? (
            <p className="text-center text-muted-foreground">Loading...</p>
          ) : history.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">No quiz history yet. Take your first quiz!</p>
                <Button onClick={() => navigate("/dashboard")} className="mt-4 gradient-primary text-primary-foreground">
                  Start Quiz
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {history.map((h, i) => {
                const acc = Math.round((h.score / h.total_questions) * 100);
                const mins = h.time_taken ? Math.floor(h.time_taken / 60) : 0;
                const secs = h.time_taken ? h.time_taken % 60 : 0;
                return (
                  <motion.div key={h.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h3 className="font-display font-semibold">{h.topic}</h3>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(h.created_at).toLocaleDateString()}</span>
                              <span className="capitalize">{h.difficulty}</span>
                              <span className="capitalize">{h.mode}</span>
                              {h.time_taken && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {mins}:{secs.toString().padStart(2, "0")}</span>}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold font-display ${acc >= 70 ? "text-success" : acc >= 50 ? "text-warning" : "text-destructive"}`}>
                              {acc}%
                            </div>
                            <div className="text-xs text-muted-foreground">{h.score}/{h.total_questions}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default QuizHistory;
