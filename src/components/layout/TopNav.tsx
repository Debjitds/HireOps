import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Mic } from 'lucide-react';

interface TopNavProps {
  isPublic?: boolean;
}

export function TopNav({ isPublic = false }: TopNavProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (isPublic) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center justify-between h-16 px-6" style={{ maxWidth: 'min(1280px, 95vw)', margin: '0 auto' }}>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-electric flex items-center justify-center">
              <Mic className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">HireOps</span>
          </button>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Features</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">How It Works</a>
            <a href="#use-cases" className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Use Cases</a>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <Button
                onClick={() => navigate('/dashboard')}
                className="bg-electric hover:bg-electric/90 text-white cursor-pointer"
              >
                Dashboard
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/auth')}
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Log in
                </Button>
                <Button
                  onClick={() => navigate('/auth')}
                  className="bg-electric hover:bg-electric/90 text-white cursor-pointer"
                >
                  Start Interview
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
    );
  }

  // In-app top nav
  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : user?.email?.[0]?.toUpperCase() || '?';

  return (
    <header className="sticky top-0 z-30 border-b border-border/30 bg-background/80 backdrop-blur-xl">
      <div className="flex items-center justify-between h-14 px-6">
        <div />
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden sm:block">
            {user?.email}
          </span>
          <Avatar
            className="w-8 h-8 cursor-pointer"
            onClick={() => navigate('/account')}
          >
            <AvatarFallback className="bg-electric/20 text-electric text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
