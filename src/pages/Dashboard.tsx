import { useAuth } from '@/hooks/useAuth';
import { useSessions } from '@/hooks/useSessions';
import { StatCard } from '@/components/cards/StatCard';
import { SessionCard } from '@/components/cards/SessionCard';
import { GlassCard } from '@/components/cards/GlassCard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  BarChart3,
  Globe,
  AlertTriangle,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Dashboard() {
  const { user } = useAuth();
  const { recentSessions, stats, loading } = useSessions();
  const navigate = useNavigate();

  const firstName = user?.user_metadata?.full_name?.split(' ')[0]
    || user?.email?.split('@')[0]
    || 'there';

  return (
    <div className="space-y-8">
      {/* Greeting + CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {firstName}</h1>
          <p className="text-muted-foreground mt-1">
            Ready for your next interview practice?
          </p>
        </div>
        <Button
          size="lg"
          onClick={() => navigate('/setup')}
          className="bg-electric hover:bg-electric/90 text-white gap-2 cursor-pointer shrink-0"
        >
          <Mic className="w-4 h-4" />
          Start Interview
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid gap-4"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}
      >
        <StatCard
          label="Total Interviews"
          value={stats.totalSessions}
          icon={Mic}
          accent="blue"
        />
        <StatCard
          label="Average Score"
          value={stats.averageScore !== null ? stats.averageScore.toFixed(1) : '—'}
          icon={BarChart3}
          accent="cyan"
        />
        <StatCard
          label="Language"
          value={stats.preferredLanguage}
          icon={Globe}
          accent="violet"
        />
        <StatCard
          label="Weak Area"
          value={stats.topWeakArea || 'None yet'}
          icon={AlertTriangle}
          accent="amber"
        />
      </motion.div>

      {/* Recent Sessions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Sessions</h2>
          {recentSessions.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/history')}
              className="text-muted-foreground hover:text-foreground gap-1 cursor-pointer"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>

        {loading ? (
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-card p-5 h-40 animate-pulse" />
            ))}
          </div>
        ) : recentSessions.length > 0 ? (
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {recentSessions.map(session => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        ) : (
          <GlassCard className="text-center py-12">
            <Sparkles className="w-10 h-10 text-electric/50 mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-1">No interviews yet</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Start your first AI-powered interview practice
            </p>
            <Button
              onClick={() => navigate('/setup')}
              className="bg-electric hover:bg-electric/90 text-white cursor-pointer"
            >
              Start Interview
            </Button>
          </GlassCard>
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          {[
            { label: 'New Interview', icon: Mic, to: '/setup', accent: 'bg-electric/10 text-electric' },
            { label: 'View History', icon: Clock, to: '/history', accent: 'bg-violet/10 text-violet' },
            { label: 'Account Settings', icon: BarChart3, to: '/account', accent: 'bg-cyan/10 text-cyan' },
          ].map(action => (
            <button
              key={action.to}
              onClick={() => navigate(action.to)}
              className="glass-card glass-card-hover p-4 flex items-center gap-3 transition-all cursor-pointer group text-left"
            >
              <div className={`p-2 rounded-lg ${action.accent}`}>
                <action.icon className="w-5 h-5" />
              </div>
              <span className="font-medium text-sm">{action.label}</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:text-foreground transition-colors" />
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
