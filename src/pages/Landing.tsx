import { TopNav } from '@/components/layout/TopNav';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  Brain,
  Globe,
  BarChart3,
  Clock,
  ArrowRight,
  Sparkles,
  MessageSquare,
  Target,
  Users,
  Zap,
} from 'lucide-react';
import { motion } from 'motion/react';
import { GlassCard } from '@/components/cards/GlassCard';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <TopNav isPublic />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-24">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.12) 0%, rgba(139,92,246,0.06) 40%, transparent 70%)',
          }}
        />

        <div className="relative z-10 text-center px-4" style={{ maxWidth: 'min(900px, 95vw)', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-6 bg-electric/10 text-electric border-electric/20 px-4 py-1.5">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              AI-Powered Interview Practice
            </Badge>

            <h1
              className="font-bold leading-tight tracking-tight"
              style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)' }}
            >
              Practice Interviews{' '}
              <span className="text-gradient-blue">That Feel Real</span>
            </h1>

            <p
              className="text-muted-foreground mt-4 mx-auto leading-relaxed"
              style={{ maxWidth: 'min(600px, 90%)', fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}
            >
              Voice-first adaptive interview simulator with AI feedback.
              Speak your answers, get scored instantly, and improve faster.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
              <Button
                size="lg"
                onClick={() => navigate('/auth')}
                className="bg-electric hover:bg-electric/90 text-white gap-2 cursor-pointer px-8"
              >
                <Mic className="w-5 h-5" />
                Start Practicing
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="cursor-pointer gap-2"
              >
                Learn More <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>

          {/* Hero visual - Dashboard preview */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-12 sm:mt-16"
          >
            <div className="glass-card p-4 glow-blue mx-auto" style={{ maxWidth: '720px' }}>
              <div className="rounded-lg bg-surface/80 border border-border/30 p-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-danger/60" />
                  <div className="w-3 h-3 rounded-full bg-warning/60" />
                  <div className="w-3 h-3 rounded-full bg-success/60" />
                  <span className="text-xs text-muted-foreground ml-2">HireOps Interview</span>
                </div>
                <div className="glass-card p-4 text-left">
                  <p className="text-xs text-electric mb-1">Question 3/5 · Scenario</p>
                  <p className="text-sm font-medium">
                    "How would you design a rate limiter for a high-traffic API endpoint?"
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-electric/20 flex items-center justify-center">
                    <Mic className="w-5 h-5 text-electric" />
                  </div>
                  <div className="flex-1 h-2 rounded-full bg-secondary">
                    <div className="h-full w-3/5 rounded-full bg-electric" />
                  </div>
                  <Badge className="bg-success/20 text-success border-success/20">7.8</Badge>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="py-8 border-y border-border/20">
        <div className="flex flex-wrap items-center justify-center gap-8 px-4" style={{ maxWidth: 'min(900px, 95vw)', margin: '0 auto' }}>
          {[
            { label: '5 Scoring Dimensions', icon: Target },
            { label: 'Adaptive Follow-ups', icon: Brain },
            { label: 'Multilingual', icon: Globe },
            { label: 'Voice-First', icon: Mic },
          ].map(({ label, icon: Icon }) => (
            <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon className="w-4 h-4 text-electric" />
              {label}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 sm:py-24 px-4">
        <div style={{ maxWidth: 'min(1100px, 95vw)', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-3">
              Everything You Need to{' '}
              <span className="text-gradient-blue">Ace Your Interview</span>
            </h2>
            <p className="text-muted-foreground" style={{ maxWidth: '500px', margin: '0 auto' }}>
              Practice with AI that adapts to your performance and speaks like a real interviewer.
            </p>
          </motion.div>

          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {[
              {
                icon: Mic,
                title: 'Voice-First Practice',
                description: 'Answer questions by speaking naturally. Built-in mic input with real-time transcription.',
                accent: 'blue',
              },
              {
                icon: Brain,
                title: 'Adaptive Follow-ups',
                description: 'AI adjusts question difficulty based on your performance. Strong? Go deeper. Struggling? Get support.',
                accent: 'violet',
              },
              {
                icon: Globe,
                title: 'Multilingual Support',
                description: 'Practice in English, Hindi, Spanish, French, and more. Questions and feedback adapt to your language.',
                accent: 'cyan',
              },
              {
                icon: BarChart3,
                title: 'Instant Scoring',
                description: 'Get scored on clarity, structure, technical depth, relevance, and confidence after each answer.',
                accent: 'green',
              },
              {
                icon: Clock,
                title: 'Session History',
                description: 'Track your progress over time. Review past sessions, scores, and improvement trends.',
                accent: 'amber',
              },
              {
                icon: MessageSquare,
                title: 'Spoken Feedback',
                description: 'Hear your final review spoken aloud. The AI delivers actionable improvement advice.',
                accent: 'blue',
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <GlassCard className="h-full">
                  <div className={`p-2.5 rounded-xl w-fit mb-3 bg-${feature.accent === 'green' ? 'success' : feature.accent === 'amber' ? 'warning' : feature.accent}/10`}>
                    <feature.icon className={`w-5 h-5 text-${feature.accent === 'green' ? 'success' : feature.accent === 'amber' ? 'warning' : feature.accent}`} />
                  </div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 sm:py-24 px-4 border-t border-border/20">
        <div style={{ maxWidth: 'min(900px, 95vw)', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-3">How It Works</h2>
            <p className="text-muted-foreground">Three simple steps to better interviews.</p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { step: '01', title: 'Configure', desc: 'Choose your role, topic, difficulty, language, and interviewer style.' },
              { step: '02', title: 'Practice', desc: 'Answer questions by voice or text. Get adaptive follow-ups in real time.' },
              { step: '03', title: 'Improve', desc: 'Review your scores, feedback, and improvement roadmap after each session.' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.15 }}
              >
                <GlassCard className="text-center h-full">
                  <span className="text-4xl font-bold text-electric/20">{item.step}</span>
                  <h3 className="text-lg font-semibold mt-2 mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section id="use-cases" className="py-16 sm:py-24 px-4 border-t border-border/20">
        <div style={{ maxWidth: 'min(1000px, 95vw)', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-3">Built for Every Interview</h2>
          </motion.div>

          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            {[
              { icon: Zap, title: 'SDE Prep', desc: 'Technical rounds, system design, DSA' },
              { icon: Users, title: 'HR Interviews', desc: 'Behavioral, situational, culture fit' },
              { icon: Target, title: 'Product Roles', desc: 'Product sense, estimation, strategy' },
              { icon: Sparkles, title: 'Custom Practice', desc: 'Any role, any topic, any company' },
            ].map((uc, i) => (
              <motion.div
                key={uc.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
              >
                <GlassCard className="text-center h-full">
                  <uc.icon className="w-6 h-6 text-electric mx-auto mb-2" />
                  <h3 className="font-semibold text-sm mb-1">{uc.title}</h3>
                  <p className="text-xs text-muted-foreground">{uc.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 px-4 border-t border-border/20">
        <div className="text-center" style={{ maxWidth: 'min(600px, 90vw)', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-3">Ready to Practice?</h2>
            <p className="text-muted-foreground mb-6">
              Start your first AI-powered mock interview in under a minute.
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/auth')}
              className="bg-electric hover:bg-electric/90 text-white gap-2 cursor-pointer px-8"
            >
              <Mic className="w-5 h-5" />
              Start Free Interview
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/20 py-8 px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4" style={{ maxWidth: 'min(1100px, 95vw)', margin: '0 auto' }}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-electric flex items-center justify-center">
              <Mic className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold">HireOps</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Built for interview confidence. Voice-first. AI-powered.
          </p>
        </div>
      </footer>
    </div>
  );
}
