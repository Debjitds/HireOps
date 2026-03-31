import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Mail, Lock, User } from 'lucide-react';

export function AuthForm() {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const [activeTab, setActiveTab] = useState<string>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (activeTab === 'login') {
        await login(email, password);
        navigate(from, { replace: true });
      } else {
        const data = await signup(email, password, fullName);
        // If email confirmation is disabled, user is auto-confirmed and session exists
        if (data.session) {
          navigate(from, { replace: true });
        } else {
          setSuccessMessage('Account created! Check your email to confirm, then log in.');
          setActiveTab('login');
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-8 w-full" style={{ maxWidth: 'min(420px, 90vw)' }}>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Welcome to HireOps</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Practice interviews with AI-powered feedback
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setError(null); setSuccessMessage(null); }}>
        <TabsList className="grid w-full grid-cols-2 bg-secondary/50">
          <TabsTrigger value="login" className="cursor-pointer">Log In</TabsTrigger>
          <TabsTrigger value="signup" className="cursor-pointer">Sign Up</TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <TabsContent value="signup" className="mt-0 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10 bg-secondary/50 border-border"
                />
              </div>
            </div>
          </TabsContent>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-secondary/50 border-border"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 bg-secondary/50 border-border"
                required
                minLength={6}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-lg bg-success/10 border border-success/20 text-success text-sm">
              {successMessage}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-electric hover:bg-electric/90 text-white cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            {activeTab === 'login' ? 'Log In' : 'Create Account'}
          </Button>
        </form>
      </Tabs>
    </div>
  );
}
