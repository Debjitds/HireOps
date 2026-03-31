import { cn } from '@/lib/utils';
import { motion, type HTMLMotionProps } from 'motion/react';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  glow?: 'blue' | 'cyan' | 'violet' | 'none';
  hover?: boolean;
}

export function GlassCard({
  children,
  className,
  glow = 'none',
  hover = true,
  ...props
}: GlassCardProps) {
  const glowClasses = {
    blue: 'glow-blue',
    cyan: 'glow-cyan',
    violet: 'glow-violet',
    none: '',
  };

  return (
    <motion.div
      className={cn(
        'glass-card p-6',
        hover && 'glass-card-hover transition-all duration-200',
        glowClasses[glow],
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
