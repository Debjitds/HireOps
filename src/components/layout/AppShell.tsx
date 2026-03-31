import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { cn } from '@/lib/utils';
import { TooltipProvider } from '@/components/ui/tooltip';

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        <div
          className={cn(
            'transition-all duration-300',
            collapsed ? 'ml-16' : 'ml-60'
          )}
        >
          <TopNav />
          <main className="p-6" style={{ maxWidth: 'min(1200px, 100%)' }}>
            <Outlet />
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
