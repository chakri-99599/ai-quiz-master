import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Brain, Zap, BookOpen, FileText, Target, BarChart3, Award, ArrowRight, ChevronRight, Clock, Layers } from "lucide-react";

const FeatureCard = ({ icon: Icon, title, desc, delay }: { icon: any; title: string; desc: string; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="group rounded-2xl border border-border bg-card p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300"
  >
    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl gradient-primary text-primary-foreground">
      <Icon className="h-5 w-5" />
    </div>
    <h3 className="font-display text-lg font-semibold mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
  </motion.div>
);

const StepCard = ({ num, title, desc, delay }: { num: string; title: string; desc: string; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="text-center"
  >
    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full gradient-accent text-accent-foreground font-display text-xl font-bold">
      {num}
    </div>
    <h3 className="font-display text-lg font-semibold mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground">{desc}</p>
  </motion.div>
);

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold">QuizMind AI</span>
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <Button onClick={() => navigate("/dashboard")} className="gradient-primary text-primary-foreground">
                Dashboard <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate("/auth")}>Sign In</Button>
                <Button onClick={() => navigate("/auth")} className="gradient-primary text-primary-foreground">Get Started</Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="gradient-hero pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, hsla(234, 85%, 55%, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 50%, hsla(170, 75%, 42%, 0.2) 0%, transparent 50%)' }} />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/5 px-4 py-1.5 text-sm text-primary-foreground/80 mb-6">
              <Zap className="h-3.5 w-3.5" /> Powered by AI
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
              AI Self-Assessment<br />
              <span className="text-gradient-accent">Platform</span>
            </h1>
            <p className="text-lg text-primary-foreground/70 mb-8 max-w-xl mx-auto">
              Generate quizzes on any topic, upload documents, paste content, and get AI-powered feedback to accelerate your learning.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" onClick={() => navigate(user ? "/dashboard" : "/auth")} className="gradient-accent text-accent-foreground text-base px-8">
                Start Learning <ChevronRight className="ml-1 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })} className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="font-display text-3xl font-bold text-center mb-12">
            How It Works
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <StepCard num="1" title="Choose Input" desc="Enter a topic, paste content, or upload a PDF document" delay={0.1} />
            <StepCard num="2" title="Generate Quiz" desc="AI creates questions tailored to your difficulty level" delay={0.2} />
            <StepCard num="3" title="Get Results" desc="Review answers with AI explanations and track progress" delay={0.3} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="font-display text-3xl font-bold text-center mb-4">
            Powerful Features
          </motion.h2>
          <p className="text-center text-muted-foreground mb-12 max-w-lg mx-auto">
            Everything you need for effective self-assessment and learning
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <FeatureCard icon={Brain} title="AI Quiz Generation" desc="Generate questions on any topic with adjustable difficulty levels" delay={0.1} />
            <FeatureCard icon={FileText} title="PDF & Text Input" desc="Upload PDFs or paste content to generate contextual quizzes" delay={0.15} />
            <FeatureCard icon={BookOpen} title="Learning & Test Modes" desc="Learn with instant feedback or challenge yourself in test mode" delay={0.2} />
            <FeatureCard icon={Target} title="Knowledge Gap Detection" desc="Identify weak areas and get personalized study recommendations" delay={0.25} />
            <FeatureCard icon={Clock} title="Timed Quizzes" desc="Challenge yourself with per-question timers and countdowns" delay={0.3} />
            <FeatureCard icon={Layers} title="Adaptive Difficulty" desc="Questions adjust based on your performance automatically" delay={0.35} />
            <FeatureCard icon={BarChart3} title="Progress Tracking" desc="Visualize your improvement with charts and analytics" delay={0.4} />
            <FeatureCard icon={Award} title="Certificates" desc="Download completion certificates for your achievements" delay={0.45} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display text-3xl font-bold text-primary-foreground mb-4">Ready to Test Your Knowledge?</h2>
            <p className="text-primary-foreground/70 mb-8 max-w-md mx-auto">Join now and start generating AI-powered quizzes in seconds.</p>
            <Button size="lg" onClick={() => navigate(user ? "/dashboard" : "/auth")} className="gradient-accent text-accent-foreground px-8">
              Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border bg-background">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 QuizMind AI. Built for learning.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
