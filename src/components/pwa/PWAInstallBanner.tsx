import React, { useState } from 'react';
import {
  Download,
  Share,
  PlusSquare,
  Smartphone,
  X,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // If already running as standalone mobile app or dismissed, don't show the top banner
  if (isInstalled || dismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      // General instructions modal
      setShowIOSModal(true);
    }
  };

  return (
    <>
      <div className="bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 text-white px-3.5 py-2.5 shadow-md flex items-center justify-between z-30 relative animate-in slide-in-from-top duration-300">
        <div className="flex items-center space-x-2.5 min-w-0 pr-2">
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
            <Smartphone className="w-4 h-4 text-purple-200" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold leading-tight truncate">
              Install HealPath Mobile App
            </p>
            <p className="text-[10px] text-purple-200 truncate">
              Add shortcut to home screen for 1-tap full-screen access
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 shrink-0">
          <button
            onClick={handleInstallClick}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white text-purple-800 hover:bg-purple-50 font-bold text-xs shadow-sm cursor-pointer transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-purple-700" />
            <span>Install</span>
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-lg text-purple-200 hover:text-white cursor-pointer"
            title="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Guided Add to Home Screen Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl border border-purple-100 text-slate-800">
            <div className="flex items-center justify-between pb-2 border-b border-purple-100">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-xl bg-purple-100 text-purple-700">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold">Add Shortcut to Home Screen</h3>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Transform HealPath into a native-feeling mobile app with full-screen experience and zero browser address bars:
            </p>

            <div className="space-y-3 bg-purple-50/60 p-3.5 rounded-2xl border border-purple-100 text-xs text-slate-700">
              <div className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  1
                </span>
                <span className="leading-relaxed">
                  Tap the <strong className="text-purple-900">Share</strong> icon (iOS Safari) or <strong className="text-purple-900">Menu (⋮)</strong> in Chrome.
                </span>
              </div>

              <div className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  2
                </span>
                <span className="leading-relaxed">
                  Scroll down and select <strong className="text-purple-900">&quot;Add to Home Screen&quot;</strong> or <strong className="text-purple-900">&quot;Install App&quot;</strong>.
                </span>
              </div>

              <div className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  3
                </span>
                <span className="leading-relaxed">
                  Tap <strong className="text-purple-900">Add</strong>. HealPath will now appear as an app icon alongside your other mobile apps!
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors cursor-pointer"
            >
              Got It!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
