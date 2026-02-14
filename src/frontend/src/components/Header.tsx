import { Settings, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import SettingsDialog from './SettingsDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGetSubmissionCount } from '../hooks/useQueries';

interface HeaderProps {
  loginId: string;
  onLogout: () => void;
}

export default function Header({ loginId, onLogout }: HeaderProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { data: submissionCount, refetch } = useGetSubmissionCount(loginId);

  // Fetch submission count on mount
  useEffect(() => {
    refetch();
  }, [refetch]);

  return (
    <>
      <header className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg">
        <div className="container max-w-4xl mx-auto px-4 py-5 sm:py-7">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-5">
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
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 transition-colors rounded-lg"
                onClick={() => setIsSettingsOpen(true)}
                aria-label="Open settings"
              >
                <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 transition-colors rounded-lg"
                onClick={onLogout}
                aria-label="Logout"
              >
                <LogOut className="w-5 h-5 sm:w-6 sm:h-6" />
              </Button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2.5 text-sm">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 font-medium px-3 py-1">
              ID: {loginId}
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 font-medium px-3 py-1">
              Submissions: {submissionCount}
            </Badge>
          </div>
        </div>
      </header>
      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </>
  );
}
