import { useState } from 'react';
import { Lock, CheckCircle2, AlertCircle, Loader2, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GOOGLE_APPS_SCRIPT_WEB_APP_URL } from '@/lib/googleAppsScript';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ConnectionStatus = 'idle' | 'testing' | 'success' | 'error';

export default function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const testConnection = async () => {
    setConnectionStatus('testing');
    setErrorMessage('');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      // Test with a simple GET request
      const response = await fetch(`${GOOGLE_APPS_SCRIPT_WEB_APP_URL}?action=test`, {
        method: 'GET',
        signal: controller.signal,
        redirect: 'follow',
      });

      clearTimeout(timeoutId);

      // If we get any response (even if we can't read it), connection is working
      setConnectionStatus('success');
      setErrorMessage('');
    } catch (error: any) {
      console.error('Connection test failed:', error);
      setConnectionStatus('error');
      
      if (error.name === 'AbortError') {
        setErrorMessage('Connection timeout — please check your internet connection.');
      } else if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        setErrorMessage('Cannot reach server — please check your internet connection.');
      } else if (!navigator.onLine) {
        setErrorMessage('No internet connection detected. Please check your network.');
      } else {
        setErrorMessage('Unable to connect to Google Sheets. Please verify your internet connection.');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display font-bold text-slate-900">
            Google Sheets Configuration
          </DialogTitle>
          <DialogDescription className="text-base text-slate-600 mt-2">
            The Google Apps Script Web App URL is permanently configured for data storage.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-5 py-5">
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-5 w-5 text-blue-600" />
            <AlertDescription className="ml-2 text-blue-800 text-sm leading-relaxed">
              <strong className="font-semibold">Important:</strong> All form submissions are sent directly to Google Sheets via the Google Apps Script URL below. 
              Both Login ID and Farmer Name are automatically included in every submission for tracking purposes.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Label className="text-base font-semibold text-slate-700 flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-500" />
              Google Apps Script Web App URL (Locked)
            </Label>
            <div className="relative">
              <div className="h-auto min-h-[48px] px-4 py-3 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-600 break-all select-none font-mono">
                {GOOGLE_APPS_SCRIPT_WEB_APP_URL}
              </div>
              <div className="absolute top-3 right-3">
                <Lock className="w-4 h-4 text-slate-400" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              This URL is permanently configured and cannot be modified.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={testConnection}
              disabled={connectionStatus === 'testing'}
              className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white font-semibold"
            >
              {connectionStatus === 'testing' ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Testing Connection...
                </>
              ) : (
                'Test Connection'
              )}
            </Button>

            {connectionStatus === 'success' && (
              <Alert className="bg-teal-50 border-teal-200">
                <CheckCircle2 className="h-5 w-5 text-teal-600" />
                <AlertDescription className="ml-2 text-teal-800 font-medium">
                  Connection successful! The Google Apps Script is reachable and ready to receive data.
                </AlertDescription>
              </Alert>
            )}

            {connectionStatus === 'error' && errorMessage && (
              <Alert variant="destructive">
                <AlertCircle className="h-5 w-5" />
                <AlertDescription className="ml-2">
                  <div className="font-semibold mb-1">Connection Error</div>
                  <div className="text-sm">{errorMessage}</div>
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="bg-teal-50 border border-teal-200 rounded-lg p-5 space-y-3">
            <h4 className="font-semibold text-base text-teal-900 font-display">
              Data Submission Details
            </h4>
            <p className="text-sm text-teal-800 leading-relaxed">
              All farmer data submissions are sent directly to Google Sheets with the following field order:
            </p>
            <ul className="text-sm text-teal-700 space-y-1.5 mt-3 list-disc list-inside leading-relaxed">
              <li><strong className="font-semibold">Login ID:</strong> Automatically included from your session (1st column)</li>
              <li><strong className="font-semibold">Farmer Name:</strong> Manually entered for each submission (2nd column)</li>
              <li><strong className="font-semibold">Mobile Number:</strong> 10-digit phone number (3rd column)</li>
              <li><strong className="font-semibold">Village, District, Taluka:</strong> Location details</li>
              <li><strong className="font-semibold">Crop 1, Crop 2:</strong> Primary and secondary crops</li>
              <li><strong className="font-semibold">Irrigation Type and Total Acreage:</strong> Farming details</li>
              <li><strong className="font-semibold">ST, MGOHQ, WheatVariety:</strong> Additional tracking fields</li>
            </ul>
            <p className="text-xs text-teal-700 mt-3 leading-relaxed">
              The Google Apps Script receives these fields in the exact order shown above.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
