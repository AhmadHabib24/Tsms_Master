'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-[#1e1e1e] border border-yellow-500/30 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-bottom-5">
      <div className="p-4 flex gap-4 items-start">
        <div className="bg-yellow-500/20 text-yellow-500 p-2.5 rounded-xl shrink-0">
          <Download size={24} />
        </div>
        <div className="flex-1">
          <h3 className="text-white font-bold mb-1">Install TSMS Master</h3>
          <p className="text-sm text-gray-400">Install this app on your device for a faster, better, and full-screen experience.</p>
          
          <div className="mt-3 flex gap-2">
            <button 
              onClick={handleInstallClick}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded-lg transition-colors text-sm"
            >
              Install App
            </button>
            <button 
              onClick={() => setShowPrompt(false)}
              className="px-4 py-2 bg-[#2a2a2a] hover:bg-[#333333] text-gray-300 font-medium rounded-lg transition-colors text-sm"
            >
              Maybe Later
            </button>
          </div>
        </div>
        <button onClick={() => setShowPrompt(false)} className="text-gray-500 hover:text-white shrink-0">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
