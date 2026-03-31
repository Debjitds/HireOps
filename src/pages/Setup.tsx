import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { createSession, getPersonas } from '@/services/sessionService';
import { GlassCard } from '@/components/cards/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Loader2, Mic, ArrowRight, Briefcase, BookOpen, Gauge, Globe, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface Persona {
  id: string;
  name: string;
  description: string | null;
  tone: string;
  strictness_level: number;
}

const ROLES = ['Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Data Scientist', 'Product Manager', 'DevOps Engineer', 'QA Engineer', 'UI/UX Designer', 'System Architect'];
const TOPICS = ['React', 'Node.js', 'Python', 'Java', 'System Design', 'Data Structures', 'Algorithms', 'Behavioral', 'SQL', 'Machine Learning', 'Cloud Computing', 'API Design'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const LANGUAGES = ['English', 'Hindi', 'Spanish', 'French', 'German', 'Japanese', 'Chinese', 'Korean', 'Arabic', 'Portuguese'];

export default function Setup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(false);

  const [role, setRole] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [language, setLanguage] = useState('English');
  const [personaId, setPersonaId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');

  useEffect(() => {
    getPersonas().then(setPersonas).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !role || !topic) return;

    setLoading(true);
    try {
      const session = await createSession({
        userId: user.id,
        role,
        topic,
        difficulty,
        language,
        personaId,
        companyName: companyName || undefined,
        jobTitle: jobTitle || undefined,
        customInstructions: customInstructions || undefined,
      });
      navigate(`/interview/${session.id}`);
    } catch (err) {
      console.error('Failed to create session:', err);
      setLoading(false);
    }
  };

  const selectedPersona = personas.find(p => p.id === personaId);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold">Setup Interview</h1>
        <p className="text-muted-foreground mt-1">
          Configure your practice session. The AI will tailor questions to your preferences.
        </p>
      </motion.div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Main form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-6"
          >
            {/* Required fields */}
            <GlassCard hover={false}>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-electric" />
                Interview Details
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="role">Target Role *</Label>
                  <Select value={role} onValueChange={(v) => { if (v) setRole(v); }}>
                    <SelectTrigger id="role" className="bg-secondary/50 cursor-pointer">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map(r => (
                        <SelectItem key={r} value={r} className="cursor-pointer">{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic / Domain *</Label>
                  <Select value={topic} onValueChange={(v) => { if (v) setTopic(v); }}>
                    <SelectTrigger id="topic" className="bg-secondary/50 cursor-pointer">
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent>
                      {TOPICS.map(t => (
                        <SelectItem key={t} value={t} className="cursor-pointer">{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </GlassCard>

            <GlassCard hover={false}>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Gauge className="w-5 h-5 text-cyan" />
                Difficulty & Language
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select value={difficulty} onValueChange={(v) => { if (v) setDifficulty(v); }}>
                    <SelectTrigger id="difficulty" className="bg-secondary/50 cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTIES.map(d => (
                        <SelectItem key={d} value={d} className="cursor-pointer">{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">
                    <Globe className="w-4 h-4 inline mr-1" />
                    Conversation Language
                  </Label>
                  <Select value={language} onValueChange={(v) => { if (v) setLanguage(v); }}>
                    <SelectTrigger id="language" className="bg-secondary/50 cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map(l => (
                        <SelectItem key={l} value={l} className="cursor-pointer">{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </GlassCard>

            {/* Persona selection */}
            <GlassCard hover={false}>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-violet" />
                Interviewer Persona
              </h2>
              {personas.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {personas.map(persona => (
                    <button
                      key={persona.id}
                      type="button"
                      onClick={() => setPersonaId(persona.id === personaId ? null : persona.id)}
                      className={cn(
                        'p-4 rounded-xl border text-left transition-all cursor-pointer',
                        persona.id === personaId
                          ? 'border-electric bg-electric/10'
                          : 'border-border/50 bg-secondary/30 hover:border-border'
                      )}
                    >
                      <p className="font-medium text-sm">{persona.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{persona.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Tone: {persona.tone} · Strictness: {persona.strictness_level}/10
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Loading personas...</p>
              )}
            </GlassCard>

            {/* Optional fields */}
            <GlassCard hover={false}>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-success" />
                Optional Details
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <Input
                    id="company"
                    placeholder="e.g. Google"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    className="bg-secondary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    placeholder="e.g. Senior SDE"
                    value={jobTitle}
                    onChange={e => setJobTitle(e.target.value)}
                    className="bg-secondary/50"
                  />
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <Label htmlFor="instructions">Custom Instructions</Label>
                <Textarea
                  id="instructions"
                  placeholder="Any special focus areas, topics to avoid, or instructions for the interviewer..."
                  value={customInstructions}
                  onChange={e => setCustomInstructions(e.target.value)}
                  className="bg-secondary/50 min-h-[80px] resize-none"
                />
              </div>
            </GlassCard>
          </motion.div>

          {/* Sidebar summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="space-y-4"
          >
            <GlassCard glow="blue" hover={false} className="sticky top-20">
              <h3 className="font-semibold mb-4">Session Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Role</span>
                  <span className="font-medium">{role || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Topic</span>
                  <span className="font-medium">{topic || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Difficulty</span>
                  <span className="font-medium">{difficulty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Language</span>
                  <span className="font-medium">{language}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Persona</span>
                  <span className="font-medium">{selectedPersona?.name || 'Default'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Questions</span>
                  <span className="font-medium">5</span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={!role || !topic || loading}
                className="w-full mt-6 bg-electric hover:bg-electric/90 text-white gap-2 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    Start Interview
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </GlassCard>
          </motion.div>
        </div>
      </form>
    </div>
  );
}
