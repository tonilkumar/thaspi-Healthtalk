import React, { useState } from 'react';
import {
  Search,
  Wind,
  Compass,
  Zap,
  ListChecks,
  Smartphone,
  HeartHandshake,
  Activity,
  BookOpen,
  Volume2,
  VolumeX,
  Play,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { CopingActivity } from '../../types';
import { storage } from '../../services/storage';

interface CopingHubScreenProps {
  userId: string;
  onOpenActivity: (activity: CopingActivity) => void;
}

export const CopingHubScreen: React.FC<CopingHubScreenProps> = ({ userId, onOpenActivity }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [playingSound, setPlayingSound] = useState<string | null>(null);

  const activities = storage.getCopingActivities();
  const activityRecords = storage.getActivityRecords(userId);

  const categories = [
    'All',
    'Stress',
    'Overthinking',
    'Loneliness',
    'Low motivation',
    'Academic pressure',
    'Excessive scrolling',
  ];

  // Ambient sound generator using Web Audio API (white noise, rain hum, pink noise, bell)
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const soundSourceRef = React.useRef<any>(null);

  const toggleSound = (soundType: string) => {
    if (playingSound === soundType) {
      // stop
      if (soundSourceRef.current) {
        try {
          soundSourceRef.current.stop();
        } catch {
          // ignore
        }
      }
      setPlayingSound(null);
      return;
    }

    // Stop previous
    if (soundSourceRef.current) {
      try {
        soundSourceRef.current.stop();
      } catch {
        // ignore
      }
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = audioContextRef.current || new AudioCtx();
      audioContextRef.current = ctx;

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Generate soothing noise or chime
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      if (soundType === 'rain') {
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = data[i];
          data[i] *= 0.15;
        }
      } else if (soundType === 'binaural') {
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.sin((2 * Math.PI * 174 * i) / ctx.sampleRate) * 0.1;
        }
      } else {
        // gentle ocean / brown noise
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + 0.05 * white) / 1.05;
          lastOut = data[i];
          data[i] *= 0.2;
        }
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.3, ctx.currentTime);

      noise.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
      soundSourceRef.current = noise;
      setPlayingSound(soundType);
    } catch (err) {
      console.warn('Audio not allowed or supported', err);
    }
  };

  const filtered = activities.filter((act) => {
    const matchesCategory = selectedCategory === 'All' || act.category === selectedCategory;
    const matchesQuery =
      act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const getActivityIcon = (iconName: string) => {
    switch (iconName) {
      case 'Wind':
        return <Wind className="w-5 h-5 text-purple-600" />;
      case 'Compass':
        return <Compass className="w-5 h-5 text-indigo-600" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-amber-600" />;
      case 'ListChecks':
        return <ListChecks className="w-5 h-5 text-emerald-600" />;
      case 'SmartphoneOff':
        return <Smartphone className="w-5 h-5 text-rose-600" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-5 h-5 text-pink-600" />;
      case 'Activity':
        return <Activity className="w-5 h-5 text-sky-600" />;
      default:
        return <BookOpen className="w-5 h-5 text-purple-600" />;
    }
  };

  return (
    <div className="space-y-4 pb-24 px-4 pt-3 max-w-md mx-auto animate-in fade-in duration-200">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Coping Hub</h1>
            <p className="text-xs text-slate-500">
              Science-backed micro-exercises for instant emotional grounding
            </p>
          </div>
          <span className="text-xs font-semibold text-purple-700 bg-purple-100 px-2.5 py-1 rounded-full">
            {activityRecords.length} Completed
          </span>
        </div>

        {/* Search Input */}
        <div className="relative mt-3">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search e.g. breathing, stress, focus, sleep..."
            className="w-full text-xs pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
      </div>

      {/* Ambient Sound Sanctuary */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-900 to-indigo-900 text-white shadow-md space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Volume2 className="w-4 h-4 text-purple-300" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-200">
              Calm Sound Sanctuary
            </h3>
          </div>
          {playingSound && (
            <span className="text-[10px] text-emerald-400 font-medium flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Playing {playingSound}</span>
            </span>
          )}
        </div>
        <p className="text-[11px] text-purple-200">
          Play gentle ambient noise while you study, meditate, or practice deep breathing.
        </p>
        <div className="flex space-x-2 pt-0.5">
          <button
            onClick={() => toggleSound('rain')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
              playingSound === 'rain'
                ? 'bg-purple-500 text-white border-purple-400 shadow-sm'
                : 'bg-white/10 hover:bg-white/20 border-white/10 text-purple-100'
            }`}
          >
            🌧️ Rain Mist
          </button>
          <button
            onClick={() => toggleSound('ocean')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
              playingSound === 'ocean'
                ? 'bg-purple-500 text-white border-purple-400 shadow-sm'
                : 'bg-white/10 hover:bg-white/20 border-white/10 text-purple-100'
            }`}
          >
            🌊 Soft Wave
          </button>
          <button
            onClick={() => toggleSound('binaural')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
              playingSound === 'binaural'
                ? 'bg-purple-500 text-white border-purple-400 shadow-sm'
                : 'bg-white/10 hover:bg-white/20 border-white/10 text-purple-100'
            }`}
          >
            🔔 174Hz Calm
          </button>
        </div>
      </div>

      {/* Challenge Category Filter Pills */}
      <div className="overflow-x-auto no-scrollbar flex space-x-1.5 py-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/20'
                : 'bg-white hover:bg-purple-50 text-slate-600 border border-slate-200/80'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Coping Activities Grid */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-purple-100 p-6 space-y-2">
            <Sparkles className="w-8 h-8 text-purple-300 mx-auto" />
            <p className="text-xs font-semibold text-slate-700">No activities found</p>
            <p className="text-[11px] text-slate-400">Try adjusting your category or search filter.</p>
          </div>
        ) : (
          filtered.map((activity) => {
            const hasDone = activityRecords.some((r) => r.activity_id === activity.id);

            return (
              <div
                key={activity.id}
                className="bg-white p-4 rounded-3xl border border-purple-100 hover:border-purple-300 shadow-sm hover:shadow-md transition-all space-y-3 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="p-2.5 rounded-2xl bg-purple-50 group-hover:bg-purple-100 transition-colors shrink-0">
                      {getActivityIcon(activity.icon)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider bg-purple-50 px-2 py-0.5 rounded-full">
                          {activity.category}
                        </span>
                        <span className="text-xs text-slate-400">• {activity.duration}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-800 mt-1">
                        {activity.title}
                      </h3>
                    </div>
                  </div>

                  {hasDone && (
                    <span
                      title="You have completed this exercise"
                      className="text-emerald-600 bg-emerald-50 p-1 rounded-full border border-emerald-200 shrink-0"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {activity.description}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-slate-50">
                  <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 font-medium">
                    <span>{activity.steps.length} guided steps</span>
                  </div>
                  <button
                    onClick={() => onOpenActivity(activity)}
                    className="py-1.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-sm shadow-purple-500/20 flex items-center space-x-1 transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start Activity</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
