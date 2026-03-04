import { useState } from "react";
import FarmerForm from "../components/FarmerForm";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Leaderboard from "../components/Leaderboard";

interface MainAppProps {
  loginId: string;
  userName: string;
  userST: string;
  userMGOHQ: string;
  onLogout: () => void;
}

export default function MainApp({
  loginId,
  userName,
  userST,
  userMGOHQ,
  onLogout,
}: MainAppProps) {
  const [view, setView] = useState<"form" | "leaderboard">("form");

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      <Header
        loginId={loginId}
        onLogout={onLogout}
        onShowLeaderboard={() => setView("leaderboard")}
      />

      <main className="flex-1 container mx-auto px-4 py-6 sm:py-8 max-w-2xl">
        {view === "form" ? (
          <FarmerForm
            loginId={loginId}
            userName={userName}
            lockedST={userST}
            lockedMGOHQ={userMGOHQ}
          />
        ) : (
          <Leaderboard
            onBack={() => setView("form")}
            currentLoginId={loginId}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
