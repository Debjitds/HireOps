import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppShell } from '@/components/layout/AppShell';
import { ProtectedRoute } from '@/routes/ProtectedRoute';

// Pages
import Landing from '@/pages/Landing';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Setup from '@/pages/Setup';
import Interview from '@/pages/Interview';
import Results from '@/pages/Results';
import History from '@/pages/History';
import Account from '@/pages/Account';

function App() {
  return (
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />

          {/* Protected routes with AppShell */}
          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/setup" element={<Setup />} />
            <Route path="/results/:sessionId" element={<Results />} />
            <Route path="/history" element={<History />} />
            <Route path="/account" element={<Account />} />
          </Route>

          {/* Interview room - full screen, no AppShell */}
          <Route
            path="/interview/:sessionId"
            element={
              <ProtectedRoute>
                <Interview />
              </ProtectedRoute>
            }
          />
        </Routes>

        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'hsl(222 47% 11%)',
              border: '1px solid hsl(217 33% 17% / 0.5)',
              color: 'hsl(210 40% 98%)',
            },
          }}
        />
      </BrowserRouter>
    </TooltipProvider>
  );
}

export default App;
