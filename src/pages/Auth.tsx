import { AuthForm } from '@/components/forms/AuthForm';
import { TopNav } from '@/components/layout/TopNav';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Mic } from 'lucide-react';

export default function Auth() {
  const { user, loading } = useAuth();

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <TopNav isPublic />

      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-30 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
        }}
      />

      <main className="flex items-center justify-center min-h-screen pt-16">
        <div className="relative z-10">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-electric/20 flex items-center justify-center">
              <Mic className="w-6 h-6 text-electric" />
            </div>
          </div>
          <AuthForm />
        </div>
      </main>
    </div>
  );
}
