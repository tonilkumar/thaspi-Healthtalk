import React from 'react';
import { Home, MessageCircleHeart, Shield, Sprout, User } from 'lucide-react';
import { NavigationTab } from '../../types';

interface BottomNavProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const tabs: { id: NavigationTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'talk', label: 'Talk', icon: MessageCircleHeart },
    { id: 'cope', label: 'Cope', icon: Shield },
    { id: 'growth', label: 'Growth', icon: Sprout },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-purple-100 shadow-[0_-4px_20px_rgba(139,92,246,0.06)] px-3 py-2">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'text-purple-700 font-semibold scale-105'
                  : 'text-slate-400 hover:text-slate-600 font-normal'
              }`}
              aria-label={tab.label}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-purple-100 text-purple-700 shadow-sm'
                    : 'bg-transparent text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-[11px] mt-0.5 tracking-tight ${isActive ? 'font-medium' : ''}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
