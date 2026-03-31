import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { GlassCard } from '@/components/cards/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { UserCircle, Globe, Save, Loader2, LogOut, Mail, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

const LANGUAGES = ['English', 'Hindi', 'Spanish', 'French', 'German', 'Japanese', 'Chinese', 'Korean', 'Arabic', 'Portuguese'];

export default function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('English');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setFullName(data.full_name || '');
          setPreferredLanguage(data.preferred_language || 'English');
        }
        setProfileLoading(false);
      });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    setSaved(false);
    try {
      await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          email: user.email!,
          full_name: fullName || null,
          preferred_language: preferredLanguage,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-electric animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ maxWidth: 'min(640px, 100%)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <UserCircle className="w-7 h-7 text-electric" />
          Account
        </h1>
        <p className="text-muted-foreground mt-1">Manage your profile and preferences</p>
      </motion.div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <GlassCard hover={false}>
          <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">
                <Mail className="w-4 h-4 inline mr-1" /> Email
              </Label>
              <Input
                id="email"
                value={user?.email || ''}
                disabled
                className="bg-secondary/50 opacity-60"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Your full name"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="bg-secondary/50"
              />
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Preferences Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <GlassCard hover={false}>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyan" /> Preferences
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="defaultLanguage">Default Language</Label>
              <Select value={preferredLanguage} onValueChange={(v) => { if (v) setPreferredLanguage(v); }}>
                <SelectTrigger id="defaultLanguage" className="bg-secondary/50 cursor-pointer">
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
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Button
          onClick={handleSave}
          disabled={loading}
          className="bg-electric hover:bg-electric/90 text-white gap-2 cursor-pointer"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <Check className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saved ? 'Saved!' : 'Save Preferences'}
        </Button>
      </motion.div>

      <Separator className="bg-border/30" />

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <GlassCard hover={false}>
          <h2 className="text-lg font-semibold mb-4">Session</h2>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="text-danger border-danger/30 hover:bg-danger/10 gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </Button>
        </GlassCard>
      </motion.div>
    </div>
  );
}
