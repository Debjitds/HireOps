import { useSessions } from '@/hooks/useSessions';
import { SessionCard } from '@/components/cards/SessionCard';
import { GlassCard } from '@/components/cards/GlassCard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Clock, Sparkles, Mic } from 'lucide-react';
import { motion } from 'motion/react';

export default function History() {
  const { allSessions, loading } = useSessions();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Clock className="w-7 h-7 text-electric" />
            Interview History
          </h1>
          <p className="text-muted-foreground mt-1">
            Review past sessions and track your progress
          </p>
        </div>
        <Button
          onClick={() => navigate('/setup')}
          className="bg-electric hover:bg-electric/90 text-white gap-2 cursor-pointer"
        >
          <Mic className="w-4 h-4" /> New Interview
        </Button>
      </motion.div>

      {loading ? (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="glass-card p-5 h-44 animate-pulse" />
          ))}
        </div>
      ) : allSessions.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid gap-4"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}
        >
          {allSessions.map((session, i) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <SessionCard session={session} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <GlassCard className="text-center py-16">
          <Sparkles className="w-12 h-12 text-electric/40 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No interview history</h3>
          <p className="text-muted-foreground text-sm mb-6">
            Complete your first interview to see your history here.
          </p>
          <Button
            onClick={() => navigate('/setup')}
            className="bg-electric hover:bg-electric/90 text-white cursor-pointer"
          >
            Start Your First Interview
          </Button>
        </GlassCard>
      )}
    </div>
  );
}
