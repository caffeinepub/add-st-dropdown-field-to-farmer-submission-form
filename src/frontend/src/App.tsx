import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import MainApp from './pages/MainApp';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginId, setLoginId] = useState<string>('');
  const [userName, setUserName] = useState<string>('');

  // Check for existing session on mount
  useEffect(() => {
    const storedLoginId = sessionStorage.getItem('loginId');
    const storedName = sessionStorage.getItem('userName');
    if (storedLoginId && storedName) {
      setLoginId(storedLoginId);
      setUserName(storedName);
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (id: string) => {
    const storedName = sessionStorage.getItem('userName') || '';
    setLoginId(id);
    setUserName(storedName);
    setIsLoggedIn(true);
    sessionStorage.setItem('loginId', id);
    // userName is already stored by LoginPage component
  };

  const handleLogout = () => {
    setLoginId('');
    setUserName('');
    setIsLoggedIn(false);
    sessionStorage.removeItem('loginId');
    sessionStorage.removeItem('userName');
    queryClient.clear();
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        {!isLoggedIn ? (
          <LoginPage onLogin={handleLogin} />
        ) : (
          <MainApp loginId={loginId} userName={userName} onLogout={handleLogout} />
        )}
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
