import Header from '../components/Header';
import Footer from '../components/Footer';
import FarmerForm from '../components/FarmerForm';

interface MainAppProps {
  loginId: string;
  userName: string;
  onLogout: () => void;
}

export default function MainApp({ loginId, userName, onLogout }: MainAppProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      <Header loginId={loginId} onLogout={onLogout} />
      
      <main className="flex-1 container mx-auto px-4 py-6 sm:py-8 max-w-2xl">
        <FarmerForm loginId={loginId} userName={userName} />
      </main>

      <Footer />
    </div>
  );
}
