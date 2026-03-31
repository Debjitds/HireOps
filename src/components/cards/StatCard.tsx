import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: 'blue' | 'cyan' | 'violet' | 'green' | 'amber';
  className?: string;
}

const accentStyles = {
  blue: { bg: 'bg-electric/10', text: 'text-electric', border: 'border-electric/20' },
  cyan: { bg: 'bg-cyan/10', text: 'text-cyan', border: 'border-cyan/20' },
  violet: { bg: 'bg-violet/10', text: 'text-violet', border: 'border-violet/20' },
  green: { bg: 'bg-success/10', text: 'text-success', border: 'border-success/20' },
  amber: { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/20' },
};

export function StatCard({ label, value, icon: Icon, accent = 'blue', className }: StatCardProps) {
  const style = accentStyles[accent];

  return (
    <div
      className={cn(
        'glass-card p-5 flex items-start gap-4 glass-card-hover transition-all duration-200',
        className
      )}
    >
      <div className={cn('p-2.5 rounded-xl', style.bg)}>
        <Icon className={cn('w-5 h-5', style.text)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold mt-0.5">{value}</p>
      </div>
    </div>
  );
}
