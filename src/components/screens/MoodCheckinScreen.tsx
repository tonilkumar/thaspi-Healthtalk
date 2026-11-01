import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Clock,
  History,
  Info,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MoodEntry, MoodType } from '../../types';
import { MOOD_CONFIG } from '../../data/initialData';
import { storage } from '../../services/storage';

interface MoodCheckinScreenProps {
  userId: string;
  onSaved: (entry: MoodEntry) => void;
  onClose?: () => void;
  previousEntries: MoodEntry[];
}

export const MoodCheckinScreen: React.FC<MoodCheckinScreenProps> = ({
  userId,
  onSaved,
  onClose,
  previousEntries,
}) => {
  const [selectedMood, setSelectedMood] = useState<MoodType>('Calm');
  const [intensity, setIntensity] = useState<number>(6);
  const [note, setNote] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'checkin' | 'history'>('checkin');
  const [successToast, setSuccessToast] = useState(false);

  const moodsList: MoodType[] = [
    'Happy',
    'Calm',
    'Neutral',
    'Sad',
    'Anxious',
    'Stressed',
    'Lonely',
    'Tired',
  ];

  const getIntensityDescriptor = (val: number) => {
    if (val <= 2) return 'Very subtle & mild';
    if (val <= 4) return 'Gentle presence';
    if (val <= 6) return 'Moderate & noticeable';
    if (val <= 8) return 'Elevated & demanding attention';
    return 'Very intense & overpowering';
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const entry = storage.addMoodEntry(userId, selectedMood, intensity, note);
    try {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#8B5CF6', '#A78BFA', '#34D399'],
      });
    } catch {
      // ignore
    }
    setSuccessToast(true);
    setTimeout(() => {
      onSaved(entry);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/60 via-white to-purple-50/40 pb-20 px-4 pt-3 max-w-md mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-purple-100">
        <div className="flex items-center space-x-2">
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-purple-100 text-slate-500 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-lg font-extrabold text-slate-800">Smart Mood Check-in</h1>
            <p className="text-[11px] text-slate-400">Notice, label, and honor what you feel</p>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex bg-purple-100/70 p-0.5 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('checkin')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === 'checkin' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500'
            }`}
          >
            Check In
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center space-x-1 ${
              activeTab === 'history' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500'
            }`}
          >
            <History className="w-3 h-3" />
            <span>History ({previousEntries.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'checkin' ? (
        <form onSubmit={handleSave} className="space-y-5 pt-4">
          {/* Mood Selector Grid */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              1. Select your predominant emotion
            </label>
            <div className="grid grid-cols-4 gap-2">
              {moodsList.map((mood) => {
                const config = MOOD_CONFIG[mood];
                const isSelected = selectedMood === mood;

                return (
                  <button
                    key={mood}
                    type="button"
                    onClick={() => setSelectedMood(mood)}
                    className={`p-3 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/25 scale-105'
                        : 'bg-white border-slate-200/80 hover:border-purple-300 text-slate-700'
                    }`}
                  >
                    <span className="text-2xl mb-1 filter drop-shadow-sm">{config.emoji}</span>
                    <span className="text-xs font-semibold">{mood}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-purple-600 italic px-1">
              &quot;{MOOD_CONFIG[selectedMood].description}&quot;
            </p>
          </div>

          {/* Intensity Slider 1 - 10 */}
          <div className="bg-white p-4 rounded-3xl border border-purple-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                2. Rate Emotional Intensity
              </label>
              <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold">
                <span>{intensity}</span>
                <span className="text-[10px] text-purple-500">/ 10</span>
              </div>
            </div>

            <input
              type="range"
              min="1"
              max="10"
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />

            <div className="flex justify-between text-[10px] font-medium text-slate-400">
              <span>1 (Subtle)</span>
              <span className="font-semibold text-purple-700">{getIntensityDescriptor(intensity)}</span>
              <span>10 (Overwhelming)</span>
            </div>
          </div>

          {/* Optional Reflections / Notes */}
          <div className="bg-white p-4 rounded-3xl border border-purple-100 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                3. What&apos;s on your mind? (Optional)
              </label>
              <span className="text-[10px] text-slate-400">Private</span>
            </div>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Studying for organic chemistry exam, feel tension in my shoulders..."
              className="w-full text-xs p-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-slate-50/50"
            />
            <p className="text-[10px] text-slate-400 flex items-center space-x-1">
              <Info className="w-3 h-3 text-slate-400" />
              <span>Logging thoughts helps build emotional self-awareness over time.</span>
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-xs shadow-xl shadow-purple-500/25 flex items-center justify-center space-x-2 transition-all cursor-pointer transform active:scale-95"
          >
            {successToast ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Mood Saved to HealPath!</span>
              </>
            ) : (
              <>
                <span>Save Today&apos;s Mood Check-in</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        /* Previous Mood Entries History Timeline */
        <div className="pt-4 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Previous Mood History ({previousEntries.length} entries)
          </h2>

          {previousEntries.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-3xl border border-purple-100 p-6 space-y-2">
              <Sparkles className="w-8 h-8 text-purple-300 mx-auto" />
              <p className="text-xs font-semibold text-slate-700">No previous check-ins yet</p>
              <p className="text-[11px] text-slate-400">
                Log your first check-in to begin tracking your emotional journey.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {previousEntries.map((entry) => {
                const config = MOOD_CONFIG[entry.mood];
                const dateObj = new Date(entry.created_at);

                return (
                  <div
                    key={entry.id}
                    className="p-3.5 rounded-2xl bg-white border border-purple-100 shadow-sm flex items-start space-x-3"
                  >
                    <span className="text-2xl shrink-0 p-1 rounded-xl bg-purple-50">
                      {config?.emoji || '🌿'}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-800">{entry.mood}</span>
                          <span className="text-[10px] font-semibold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded-full">
                            {entry.intensity}/10
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}{' '}
                            {dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                          </span>
                        </span>
                      </div>
                      {entry.note && (
                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed bg-slate-50 p-2 rounded-xl border border-slate-100">
                          {entry.note}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
