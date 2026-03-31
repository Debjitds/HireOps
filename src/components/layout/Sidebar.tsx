import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard,
  Mic,
  Clock,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/setup', icon: Mic, label: 'Start Interview' },
  { to: '/history', icon: Clock, label: 'History' },
  { to: '/account', icon: UserCircle, label: 'Account' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate('/');
    } catch {
      setLoggingOut(false);
    }
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen flex flex-col border-r border-border/50 bg-sidebar transition-all duration-300',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-16 border-b border-border/50">
        <div className="w-8 h-8 rounded-lg bg-electric flex items-center justify-center shrink-0">
          <Mic className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold text-foreground tracking-tight">
            HireOps
          </span>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 flex flex-col gap-1 px-2 py-4">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer',
                isActive
                  ? 'bg-electric/10 text-electric'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )
            }
          >
            <Icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom area */}
      <div className="px-2 pb-4 space-y-1">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          title={collapsed ? 'Logout' : undefined}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>{loggingOut ? 'Logging out...' : 'Logout'}</span>}
        </button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="w-full flex items-center justify-center cursor-pointer"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>
    </aside>
  );
}
