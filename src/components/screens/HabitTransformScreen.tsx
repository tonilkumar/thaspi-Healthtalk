import React, { useState } from 'react';
import {
  Plus,
  Repeat,
  Flame,
  CheckCircle2,
  Trash2,
  Sparkles,
  Info,
  Calendar,
  X,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Habit } from '../../types';
import { PRESET_HABIT_INSPIRATIONS } from '../../data/initialData';
import { storage } from '../../services/storage';

interface HabitTransformScreenProps {
  userId: string;
}

export const HabitTransformScreen: React.FC<HabitTransformScreenProps> = ({ userId }) => {
  const [habits, setHabits] = useState<Habit[]>(() => storage.getHabits(userId));
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Form states for new habit
  const [habitName, setHabitName] = useState('');
  const [trigger, setTrigger] = useState('');
  const [replacement, setReplacement] = useState('');

  // Past 7 days dates
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      dateStr: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      dayNumber: d.getDate(),
      isToday: i === 6,
    };
  });

  const habitRecords = storage.getHabitRecords();

  const handleToggleHabit = (habitId: string, dateStr: string) => {
    const isNowDone = storage.toggleHabitRecord(habitId, dateStr);
    setHabits([...storage.getHabits(userId)]);

    if (isNowDone) {
      try {
        confetti({
          particleCount: 35,
          spread: 45,
          origin: { y: 0.7 },
          colors: ['#10B981', '#34D399', '#6EE7B7'],
        });
      } catch {
        // ignore
      }
    }
  };

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitName.trim() || !trigger.trim() || !replacement.trim()) return;

    storage.addHabit(userId, habitName, trigger, replacement);
    setHabits(storage.getHabits(userId));
    setHabitName('');
    setTrigger('');
    setReplacement('');
    setShowAddModal(false);
  };

  const handleApplyPreset = (p: { habit_name: string; trigger: string; replacement_activity: string }) => {
    setHabitName(p.habit_name);
    setTrigger(p.trigger);
    setReplacement(p.replacement_activity);
  };

  const handleDelete = (id: string) => {
    storage.deleteHabit(id);
    setHabits(storage.getHabits(userId));
  };

  // Calculate streak for a habit
  const calculateStreak = (habitId: string): number => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const str = d.toISOString().split('T')[0];
      const done = habitRecords.some((r) => r.habit_id === habitId && r.date === str && r.completed);
      if (done) {
        streak++;
      } else if (i > 0) {
        // Break streak if not today
        break;
      }
    }
    return streak;
  };

  return (
    <div className="space-y-4 pb-24 px-4 pt-3 max-w-md mx-auto animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">
            Habit Transformation
          </h1>
          <p className="text-xs text-slate-500">
            Replace unhealthy loops with nourishing micro-habits
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md shadow-purple-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Habit</span>
        </button>
      </div>

      {/* Philosophy Card: Replace Don't Just Remove */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-purple-700 to-indigo-800 text-white shadow-lg space-y-2 relative overflow-hidden">
        <div className="flex items-center space-x-2 text-purple-200">
          <Sparkles className="w-4 h-4 text-purple-300" />
          <span className="text-[11px] font-bold uppercase tracking-wider">The Golden Rule</span>
        </div>
        <h3 className="text-base font-bold leading-tight">
          &quot;Replace, Don&apos;t Just Remove.&quot;
        </h3>
        <p className="text-xs text-purple-100/90 leading-relaxed">
          The brain craves dopamine. When you try to eliminate an unwanted habit without an attractive substitute, your mind resists. Giving your brain an enjoyable healthy substitute makes lasting change effortless.
        </p>
      </div>

      {/* Habit List */}
      <div className="space-y-3">
        {habits.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-3xl border border-purple-100 p-6 space-y-3">
            <Repeat className="w-8 h-8 text-purple-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No habit replacements yet</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Start by identifying one unwanted habit you would like to swap with a healthier routine.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="py-2 px-4 rounded-xl bg-purple-600 text-white font-semibold text-xs shadow-sm hover:bg-purple-700 cursor-pointer"
            >
              Add My First Habit
            </button>
          </div>
        ) : (
          habits.map((habit) => {
            const streak = calculateStreak(habit.id);

            return (
              <div
                key={habit.id}
                className="bg-white p-4 rounded-3xl border border-purple-100 shadow-sm space-y-3"
              >
                {/* Unwanted -> Replacement Row */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1 pr-2">
                    <div className="text-xs text-rose-500/80 font-medium line-through">
                      ✕ {habit.habit_name}
                    </div>
                    <div className="text-sm font-bold text-emerald-700 flex items-center space-x-1.5">
                      <span>✓ {habit.replacement_activity}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
                      <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>{streak}d</span>
                    </div>
                    <button
                      onClick={() => handleDelete(habit.id)}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 transition-colors cursor-pointer"
                      title="Delete habit"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Trigger detail */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-700">Trigger:</span> {habit.trigger}
                </div>

                {/* 7-Day Matrix */}
                <div>
                  <div className="flex items-center justify-between mb-1.5 text-[10px] text-slate-400 font-semibold uppercase tracking-wider px-1">
                    <span>Past 7 Days</span>
                    <span>Tap to log</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1.5">
                    {days.map((d) => {
                      const isDone = habitRecords.some(
                        (r) => r.habit_id === habit.id && r.date === d.dateStr && r.completed
                      );

                      return (
                        <button
                          key={d.dateStr}
                          type="button"
                          onClick={() => handleToggleHabit(habit.id, d.dateStr)}
                          className={`flex flex-col items-center py-2 px-1 rounded-xl transition-all cursor-pointer border ${
                            isDone
                              ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                              : d.isToday
                              ? 'bg-purple-50 border-purple-300 text-purple-700'
                              : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-purple-200'
                          }`}
                        >
                          <span className="text-[10px] uppercase font-bold">{d.dayName}</span>
                          <span className="text-xs font-extrabold mt-0.5">{d.dayNumber}</span>
                          <span className="mt-1">
                            {isDone ? (
                              <CheckCircle2 className="w-3.5 h-3.5 fill-white text-emerald-600" />
                            ) : (
                              <span className="w-2 h-2 rounded-full bg-slate-300 block" />
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Habit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl p-5 space-y-4 border border-purple-100">
            <div className="flex items-center justify-between pb-2 border-b border-purple-50">
              <h2 className="text-sm font-bold text-slate-800">Transform a New Habit</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Presets Quick Picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 block">
                ⚡ Quick Presets
              </label>
              <div className="flex space-x-1.5 overflow-x-auto no-scrollbar py-1">
                {PRESET_HABIT_INSPIRATIONS.map((preset, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="text-[11px] px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200/60 whitespace-nowrap cursor-pointer transition-colors"
                  >
                    {preset.habit_name.split(' ')[0]} → {preset.replacement_activity.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCreateHabit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  1. The Unwanted Habit
                </label>
                <input
                  type="text"
                  value={habitName}
                  onChange={(e) => setHabitName(e.target.value)}
                  placeholder="e.g. Scrolling TikTok for 45 mins in bed"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  2. The Trigger
                </label>
                <input
                  type="text"
                  value={trigger}
                  onChange={(e) => setTrigger(e.target.value)}
                  placeholder="e.g. Tired at night, brain wants quick stimulation"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  3. Healthier Replacement
                </label>
                <input
                  type="text"
                  value={replacement}
                  onChange={(e) => setReplacement(e.target.value)}
                  placeholder="e.g. Reading 5 pages of a sci-fi book or listening to rain audio"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-emerald-50/30"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-xs shadow-md shadow-purple-500/25 flex items-center justify-center space-x-2 cursor-pointer transition-all"
              >
                <span>Save Habit Transformation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
