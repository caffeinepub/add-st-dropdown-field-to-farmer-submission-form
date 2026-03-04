import { SearchableSelect } from "@/components/SearchableSelect";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const ST_OPTIONS = ["Ahilyanagar", "Pune", "Nashik", "Solapur", "Sangli"];

const MGO_HEADQUARTERS_MAP: Record<string, string[]> = {
  Ahilyanagar: ["Shrigondha", "Tisgaon", "Shrirampur", "Shevgaon"],
  Pune: ["Indapur", "Nira", "Narayangaon", "Rajguru Nagar"],
  Nashik: ["Chandwad", "Pimplegaon", "Ozar", "Niphad"],
  Solapur: ["Malshiras", "Jeur", "Sangola"],
  Sangli: ["Kawthemahakal"],
};

interface LoginPageProps {
  onLogin: (loginId: string, st: string, mgoHQ: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [loginId, setLoginId] = useState("");
  const [name, setName] = useState("");
  const [st, setSt] = useState("");
  const [mgoHQ, setMgoHQ] = useState("");

  const availableMgoHQ = st ? MGO_HEADQUARTERS_MAP[st] || [] : [];

  const handleStChange = (value: string) => {
    setSt(value);
    setMgoHQ("");
  };

  const handleLogin = () => {
    if (!loginId.trim()) {
      toast.error("Please enter your Login ID");
      return;
    }
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!st) {
      toast.error("Please select your ST");
      return;
    }
    if (!mgoHQ) {
      toast.error("Please select your MGO Headquarters");
      return;
    }

    sessionStorage.setItem("userName", name.trim());
    sessionStorage.setItem("userST", st);
    sessionStorage.setItem("userMGOHQ", mgoHQ);

    onLogin(loginId.trim(), st, mgoHQ);
    toast.success("Login successful!");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
      <header className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg">
        <div className="container max-w-4xl mx-auto px-4 py-5 sm:py-7">
          <div className="flex items-center justify-center gap-3 sm:gap-5">
            <img
              src="/assets/image.png"
              alt="Shriram Farm Solutions Logo"
              className="h-16 sm:h-20 md:h-24 lg:h-28 max-h-[112px] w-auto object-contain drop-shadow-md"
            />
            <div>
              <h1 className="text-base sm:text-lg font-semibold tracking-tight text-white/95">
                Farmer Data Collection
              </h1>
              <p className="text-black text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-bold mt-1 tracking-tight">
                Shriram Farm Solutions
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md shadow-medium border-slate-200 bg-white">
          <CardHeader className="space-y-2 pb-6">
            <CardTitle className="text-2xl sm:text-3xl text-center text-slate-900 font-display">
              Welcome
            </CardTitle>
            <CardDescription className="text-center text-slate-600 text-base">
              Please login to continue with data collection
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Login ID */}
            <div className="space-y-2.5">
              <Label
                htmlFor="loginId"
                className="text-sm font-semibold text-slate-700"
              >
                Login ID <span className="text-red-500">*</span>
              </Label>
              <Input
                data-ocid="login.loginid.input"
                id="loginId"
                type="text"
                placeholder="Enter your mobile number or ID"
                className="h-12 text-base border-slate-300 focus:border-teal-500 focus:ring-teal-500 transition-colors"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>

            {/* Name */}
            <div className="space-y-2.5">
              <Label
                htmlFor="name"
                className="text-sm font-semibold text-slate-700"
              >
                Your Name <span className="text-red-500">*</span>
              </Label>
              <Input
                data-ocid="login.name.input"
                id="name"
                type="text"
                placeholder="Enter your full name"
                className="h-12 text-base border-slate-300 focus:border-teal-500 focus:ring-teal-500 transition-colors"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>

            {/* ST */}
            <div className="space-y-2.5">
              <Label className="text-sm font-semibold text-slate-700">
                ST <span className="text-red-500">*</span>
              </Label>
              <SearchableSelect
                options={ST_OPTIONS}
                value={st}
                onValueChange={handleStChange}
                placeholder="Select your ST"
                emptyMessage="No ST found"
              />
            </div>

            {/* MGO Headquarters */}
            <div className="space-y-2.5">
              <Label className="text-sm font-semibold text-slate-700">
                MGO Headquarters <span className="text-red-500">*</span>
              </Label>
              <SearchableSelect
                options={availableMgoHQ}
                value={mgoHQ}
                onValueChange={setMgoHQ}
                placeholder={st ? "Select MGO Headquarters" : "Select ST first"}
                emptyMessage="No MGO Headquarters found"
                disabled={!st}
              />
            </div>

            <Button
              data-ocid="login.submit_button"
              onClick={handleLogin}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-md transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
            >
              <LogIn className="mr-2 h-5 w-5" />
              Login
            </Button>

            <p className="text-xs text-center text-slate-500 mt-5 leading-relaxed">
              By logging in, you agree to use this application for authorized
              data collection purposes only.
            </p>
          </CardContent>
        </Card>
      </main>

      <footer className="bg-white border-t border-slate-200 py-5">
        <div className="container max-w-2xl mx-auto px-4 text-center text-xs text-slate-500">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-600 hover:text-teal-700 font-medium transition-colors"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
