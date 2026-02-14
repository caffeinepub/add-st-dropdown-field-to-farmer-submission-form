import { Smartphone, FileSpreadsheet, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="container max-w-2xl mx-auto px-4 py-5">
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-600 mb-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-teal-600" />
            <span className="font-medium">Mobile Friendly</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-teal-600" />
            <span className="font-medium">Google Sheets Integration</span>
          </div>
        </div>
        <div className="text-center text-xs text-slate-500">
          © {new Date().getFullYear()}. Built with <Heart className="w-3 h-3 inline text-red-500 fill-red-500" /> using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-600 hover:text-teal-700 font-medium transition-colors"
          >
            caffeine.ai
          </a>
        </div>
      </div>
    </footer>
  );
}
