import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import LoginPage from "./pages/LoginPage";
import MainApp from "./pages/MainApp";

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
  const [loginId, setLoginId] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [userST, setUserST] = useState<string>("");
  const [userMGOHQ, setUserMGOHQ] = useState<string>("");

  // Check for existing session on mount
  useEffect(() => {
    const storedLoginId = sessionStorage.getItem("loginId");
    const storedName = sessionStorage.getItem("userName");
    const storedST = sessionStorage.getItem("userST");
    const storedMGOHQ = sessionStorage.getItem("userMGOHQ");
    if (storedLoginId && storedName && storedST && storedMGOHQ) {
      setLoginId(storedLoginId);
      setUserName(storedName);
      setUserST(storedST);
      setUserMGOHQ(storedMGOHQ);
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (id: string, st: string, mgoHQ: string) => {
    const storedName = sessionStorage.getItem("userName") || "";
    setLoginId(id);
    setUserName(storedName);
    setUserST(st);
    setUserMGOHQ(mgoHQ);
    setIsLoggedIn(true);
    sessionStorage.setItem("loginId", id);
    // userST and userMGOHQ are already stored by LoginPage
  };

  const handleLogout = () => {
    setLoginId("");
    setUserName("");
    setUserST("");
    setUserMGOHQ("");
    setIsLoggedIn(false);
    sessionStorage.removeItem("loginId");
    sessionStorage.removeItem("userName");
    sessionStorage.removeItem("userST");
    sessionStorage.removeItem("userMGOHQ");
    queryClient.clear();
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
      >
        {!isLoggedIn ? (
          <LoginPage onLogin={handleLogin} />
        ) : (
          <MainApp
            loginId={loginId}
            userName={userName}
            userST={userST}
            userMGOHQ={userMGOHQ}
            onLogout={handleLogout}
          />
        )}
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
