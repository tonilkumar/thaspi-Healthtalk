import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  PhoneCall,
  Smartphone,
  Maximize2,
  X,
  ShieldAlert,
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BottomNav } from './components/layout/BottomNav';
import { LandingScreen } from './components/screens/LandingScreen';
import { AuthScreen } from './components/screens/AuthScreen';
import { HomeScreen } from './components/screens/HomeScreen';
import { TalkSpaceScreen } from './components/screens/TalkSpaceScreen';
import { CopingHubScreen } from './components/screens/CopingHubScreen';
import { GrowthScreen } from './components/screens/GrowthScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { MoodCheckinScreen } from './components/screens/MoodCheckinScreen';
import { CopingActivityModal } from './components/coping/CopingActivityModal';
import { STUDENT_HELPLINES } from './data/initialData';
import { CopingActivity, MoodEntry, NavigationTab } from './types';
import { storage } from './services/storage';
import { PWAInstallBanner } from './components/pwa/PWAInstallBanner';
import { Download } from 'lucide-react';
import { usePWAInstall } from './hooks/usePWAInstall';

function MainApp() {
  const { user, loading } = useAuth();

  // Navigation & View States
  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');
  const [authView, setAuthView] = useState<'none' | 'login' | 'register'>('none');
  const [isMobilePreviewMode, setIsMobilePreviewMode] = useState<boolean>(true);

  // Active Modals
  const [showMoodModal, setShowMoodModal] = useState<boolean>(false);
  const [activeActivity, setActiveActivity] = useState<CopingActivity | null>(null);
  const [showSOSModal, setShowSOSModal] = useState<boolean>(false);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);
  const { isInstallable, install } = usePWAInstall();

  // Reactive data
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);

  useEffect(() => {
    if (user) {
      setMoodEntries(storage.getMoodEntries(user.id));
    }
  }, [user]);

  // Handle cross-tab storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      if (user) {
        setMoodEntries(storage.getMoodEntries(user.id));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f7fd]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center animate-bounce shadow-lg shadow-purple-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="text-sm font-semibold text-purple-800 tracking-tight">Loading HealPath...</span>
        </div>
      </div>
    );
  }

  // Not logged in: Show Landing or Auth
  if (!user) {
    if (authView === 'login' || authView === 'register') {
      return (
        <AuthScreen
          initialMode={authView}
          onBackToLanding={() => setAuthView('none')}
        />
      );
    }
    return (
      <LandingScreen
        onGetStarted={() => setAuthView('register')}
        onLoginClick={() => setAuthView('login')}
      />
    );
  }

  const latestMood = moodEntries[0];

  return (
    <div className="min-h-screen bg-slate-100/80 flex flex-col items-center justify-start text-slate-800 selection:bg-purple-200">
      {/* Top Device Bar (Visible on desktop for mobile preview toggle) */}
      <div className="w-full max-w-md hidden sm:flex items-center justify-between px-4 py-2 text-[11px] text-slate-400 font-medium">
        <div className="flex items-center space-x-1.5 text-purple-700">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span className="font-bold">HealPath Mobile Preview</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMobilePreviewMode(!isMobilePreviewMode)}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-purple-700 shadow-2xs transition-colors cursor-pointer"
            title="Toggle responsive screen frame"
          >
            {isMobilePreviewMode ? (
              <>
                <Maximize2 className="w-3 h-3" />
                <span>Full Width</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3 h-3" />
                <span>Mobile Frame</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Mobile Shell (360px–430px mobile viewport or full width if toggled) */}
      <div
        className={`w-full bg-[#f8f7fd] min-h-screen relative flex flex-col transition-all duration-300 ${
          isMobilePreviewMode
            ? 'max-w-md sm:rounded-[36px] sm:my-3 sm:shadow-2xl sm:border-[6px] sm:border-slate-800/90 sm:ring-8 sm:ring-purple-200/40 overflow-hidden'
            : 'max-w-2xl'
        }`}
      >
        {/* Mobile PWA Install / Shortcut Banner */}
        <PWAInstallBanner />

        {/* Mobile Top Header */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md px-4 py-2.5 border-b border-purple-100 flex items-center justify-between shadow-2xs">
          <div
            onClick={() => setCurrentTab('home')}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-sm shadow-purple-500/20">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-slate-900 block leading-tight">
                HealPath
              </span>
              <span className="text-[9px] font-semibold text-purple-600 tracking-wider uppercase block">
                Emotional Wellness
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            {/* Quick Install Mobile App Trigger */}
            <button
              onClick={() => setShowInstallModal(true)}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-[10px] font-bold transition-colors cursor-pointer"
              title="Install HealPath as Mobile App"
            >
              <Download className="w-3 h-3 text-purple-600" />
              <span>Install</span>
            </button>

            {/* Quick Emergency Helpline Trigger */}
            <button
              onClick={() => setShowSOSModal(true)}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold transition-colors cursor-pointer"
              title="Crisis Support & Student Helplines"
            >
              <PhoneCall className="w-3 h-3 text-rose-600 animate-pulse" />
              <span>SOS</span>
            </button>
          </div>
        </header>

        {/* Dynamic Screen View */}
        <main className="flex-1 overflow-x-hidden pb-20">
          {currentTab === 'home' && (
            <HomeScreen
              onNavigate={(tab) => setCurrentTab(tab)}
              onOpenMoodModal={() => setShowMoodModal(true)}
              onOpenActivityModal={(act) => setActiveActivity(act)}
              latestMood={latestMood}
              recentMoods={moodEntries}
            />
          )}

          {currentTab === 'talk' && (
            <TalkSpaceScreen
              userName={user.name}
              userMood={latestMood}
              onOpenCopingActivity={(act) => setActiveActivity(act)}
            />
          )}

          {currentTab === 'cope' && (
            <CopingHubScreen
              userId={user.id}
              onOpenActivity={(act) => setActiveActivity(act)}
            />
          )}

          {currentTab === 'growth' && (
            <GrowthScreen
              userId={user.id}
              moodEntries={moodEntries}
              onOpenJournal={() => {}}
            />
          )}

          {currentTab === 'profile' && <ProfileScreen />}
        </main>

        {/* Fixed Mobile Bottom Navigation */}
        <BottomNav
          currentTab={currentTab}
          onTabChange={(tab) => setCurrentTab(tab)}
        />

        {/* Global Modal: Smart Mood Check-in */}
        {showMoodModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-2 sm:p-4">
            <div className="w-full max-w-md bg-white rounded-3xl max-h-[92vh] overflow-y-auto no-scrollbar shadow-2xl border border-purple-100">
              <MoodCheckinScreen
                userId={user.id}
                previousEntries={moodEntries}
                onSaved={(newEntry) => {
                  setMoodEntries([newEntry, ...moodEntries]);
                  setShowMoodModal(false);
                }}
                onClose={() => setShowMoodModal(false)}
              />
            </div>
          </div>
        )}

        {/* Global Modal: Coping Activity Interactive Player */}
        {activeActivity && (
          <CopingActivityModal
            activity={activeActivity}
            userId={user.id}
            onClose={() => setActiveActivity(null)}
            onCompleted={() => {
              // Reload records if needed
            }}
          />
        )}

        {/* Global Modal: Student SOS & Emergency Helplines */}
        {showSOSModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl border border-rose-100">
              <div className="flex items-center justify-between pb-2 border-b border-rose-100">
                <div className="flex items-center space-x-2 text-rose-800">
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                  <h3 className="text-sm font-bold">24/7 Student Helplines</h3>
                </div>
                <button
                  onClick={() => setShowSOSModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                If you are going through an intense emotional crisis, thoughts of self-harm, or severe distress, please connect with trained compassionate counselors immediately. You do not have to carry this alone.
              </p>

              <div className="space-y-2.5">
                {STUDENT_HELPLINES.map((h, i) => (
                  <div key={i} className="p-3 rounded-2xl bg-rose-50/60 border border-rose-100 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{h.name}</span>
                      <span className="text-rose-700 bg-white px-2 py-0.5 rounded-full shadow-2xs font-mono font-bold">
                        {h.contact}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">{h.detail}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowSOSModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
              >
                Return to HealPath
              </button>
            </div>
          </div>
        )}

        {/* Global Modal: Install App / Add Shortcut */}
        {showInstallModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl border border-purple-100 text-slate-800">
              <div className="flex items-center justify-between pb-2 border-b border-purple-100">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-xl bg-purple-100 text-purple-700">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold">Install HealPath Mobile App</h3>
                </div>
                <button
                  onClick={() => setShowInstallModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Add HealPath directly to your smartphone&apos;s home screen to experience it as a native mobile app with instant 1-tap launching and no browser URL bar:
              </p>

              {isInstallable ? (
                <div className="space-y-3">
                  <button
                    onClick={async () => {
                      await install();
                      setShowInstallModal(false);
                    }}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-purple-500/25 flex items-center justify-center space-x-2 cursor-pointer transition-all active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install Now to Device</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3 bg-purple-50/60 p-3.5 rounded-2xl border border-purple-100 text-xs text-slate-700">
                  <div className="flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      1
                    </span>
                    <span className="leading-relaxed">
                      On iPhone (Safari), tap the <strong className="text-purple-900">Share icon</strong> (box with arrow). On Android (Chrome), tap <strong className="text-purple-900">Menu (⋮)</strong>.
                    </span>
                  </div>

                  <div className="flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      2
                    </span>
                    <span className="leading-relaxed">
                      Tap <strong className="text-purple-900">&quot;Add to Home Screen&quot;</strong> or <strong className="text-purple-900">&quot;Install App&quot;</strong>.
                    </span>
                  </div>

                  <div className="flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      3
                    </span>
                    <span className="leading-relaxed">
                      Confirm by tapping <strong className="text-purple-900">Add</strong>. HealPath now launches in standalone full-screen mode like a native app!
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowInstallModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
