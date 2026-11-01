import React, { useState } from 'react';
import {
  TrendingUp,
  Calendar,
  CheckCircle2,
  Sparkles,
  Flame,
  Plus,
  Trash2,
  BookOpen,
  ArrowRight,
  Shield,
  Activity,
} from 'lucide-react';
import { MoodEntry, PersonalGoal } from '../../types';
import { MOOD_CONFIG } from '../../data/initialData';
import { storage } from '../../services/storage';
import { HabitTransformScreen } from './HabitTransformScreen';
import { JournalScreen } from './JournalScreen';

interface GrowthScreenProps {
  userId: string;
  moodEntries: MoodEntry[];
  onOpenJournal?: () => void;
  initialSubTab?: 'stats' | 'habits' | 'journal';
}

export const GrowthScreen: React.FC<GrowthScreenProps> = ({
  userId,
  moodEntries,
  initialSubTab = 'stats',
}) => {
  const [subTab, setSubTab] = useState<'stats' | 'habits' | 'journal'>(initialSubTab);
  const [goals, setGoals] = useState<PersonalGoal[]>(() => storage.getGoals(userId));
  const [newGoalText, setNewGoalText] = useState('');
  const [showAddGoal, setShowAddGoal] = useState(false);

  // Statistics
  const activityRecords = storage.getActivityRecords(userId);
  const habits = storage.getHabits(userId);
  const habitRecords = storage.getHabitRecords();
  const journals = storage.getJournals(userId);

  // Calculate mood counts
  const moodCounts: Record<string, number> = {};
  moodEntries.forEach((m) => {
    moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1;
  });

  const handleToggleGoal = (id: string) => {
    storage.toggleGoal(id);
    setGoals(storage.getGoals(userId));
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;
    storage.addGoal(userId, newGoalText);
    setGoals(storage.getGoals(userId));
    setNewGoalText('');
    setShowAddGoal(false);
  };

  const handleDeleteGoal = (id: string) => {
    storage.deleteGoal(id);
    setGoals(storage.getGoals(userId));
  };

  // Reversible sorted entries for the chart (oldest to newest)
  const chartEntries = [...moodEntries].slice(0, 7).reverse();

  if (subTab === 'habits') {
    return (
      <div className="space-y-3">
        <div className="px-4 pt-2 max-w-md mx-auto">
          <div className="flex bg-purple-100/70 p-1 rounded-2xl text-xs font-semibold">
            <button
              onClick={() => setSubTab('stats')}
              className="flex-1 py-1.5 rounded-xl text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
            >
              Analytics
            </button>
            <button
              onClick={() => setSubTab('habits')}
              className="flex-1 py-1.5 rounded-xl bg-white text-purple-700 shadow-sm transition-all cursor-pointer"
            >
              Habit Swaps
            </button>
            <button
              onClick={() => setSubTab('journal')}
              className="flex-1 py-1.5 rounded-xl text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
            >
              Journal
            </button>
          </div>
        </div>
        <HabitTransformScreen userId={userId} />
      </div>
    );
  }

  if (subTab === 'journal') {
    return (
      <div className="space-y-3">
        <div className="px-4 pt-2 max-w-md mx-auto">
          <div className="flex bg-purple-100/70 p-1 rounded-2xl text-xs font-semibold">
            <button
              onClick={() => setSubTab('stats')}
              className="flex-1 py-1.5 rounded-xl text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
            >
              Analytics
            </button>
            <button
              onClick={() => setSubTab('habits')}
              className="flex-1 py-1.5 rounded-xl text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
            >
              Habit Swaps
            </button>
            <button
              onClick={() => setSubTab('journal')}
              className="flex-1 py-1.5 rounded-xl bg-white text-purple-700 shadow-sm transition-all cursor-pointer"
            >
              Journal
            </button>
          </div>
        </div>
        <JournalScreen userId={userId} onBack={() => setSubTab('stats')} />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24 px-4 pt-3 max-w-md mx-auto animate-in fade-in duration-200">
      {/* Sub Tabs */}
      <div className="flex bg-purple-100/70 p-1 rounded-2xl text-xs font-semibold">
        <button
          onClick={() => setSubTab('stats')}
          className="flex-1 py-1.5 rounded-xl bg-white text-purple-700 shadow-sm transition-all cursor-pointer"
        >
          Analytics
        </button>
        <button
          onClick={() => setSubTab('habits')}
          className="flex-1 py-1.5 rounded-xl text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
        >
          Habit Swaps
        </button>
        <button
          onClick={() => setSubTab('journal')}
          className="flex-1 py-1.5 rounded-xl text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
        >
          Journal
        </button>
      </div>

      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Growth & Progress</h1>
          <p className="text-xs text-slate-500">Track your healing journey and personal milestones</p>
        </div>
        <button
          onClick={() => setSubTab('journal')}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 font-semibold text-xs border border-purple-200/60 transition-all cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Journal ({journals.length})</span>
        </button>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-white p-3.5 rounded-2xl border border-purple-100 shadow-sm text-center">
          <span className="text-2xl font-black text-purple-600">{moodEntries.length}</span>
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">
            Check-ins
          </span>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-purple-100 shadow-sm text-center">
          <span className="text-2xl font-black text-indigo-600">{activityRecords.length}</span>
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">
            Coping Done
          </span>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-purple-100 shadow-sm text-center">
          <span className="text-2xl font-black text-emerald-600">{habitRecords.length}</span>
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">
            Habit Logs
          </span>
        </div>
      </div>

      {/* Mood History Chart (SVG Visualization) */}
      <div className="bg-white p-4 rounded-3xl border border-purple-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Mood Intensity Trend (1 - 10)
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Recent Check-ins</span>
        </div>

        {chartEntries.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No mood logs to display yet.</p>
        ) : (
          <div className="pt-2">
            {/* SVG line and points */}
            <div className="relative h-40 w-full bg-slate-50/50 rounded-2xl p-3 border border-slate-100 flex flex-col justify-between">
              {/* Reference Grid lines */}
              <div className="absolute inset-x-3 top-3 border-b border-dashed border-slate-200 text-[9px] text-slate-400 font-mono">
                10 Intense
              </div>
              <div className="absolute inset-x-3 top-1/2 border-b border-dashed border-slate-200 text-[9px] text-slate-400 font-mono">
                5 Moderate
              </div>
              <div className="absolute inset-x-3 bottom-8 border-b border-dashed border-slate-200 text-[9px] text-slate-400 font-mono">
                1 Mild
              </div>

              {/* Chart SVG */}
              <svg className="w-full h-28 overflow-visible z-10" viewBox="0 0 300 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Calculate points */}
                {(() => {
                  const points = chartEntries.map((entry, index) => {
                    const x = chartEntries.length > 1 ? (index / (chartEntries.length - 1)) * 280 + 10 : 150;
                    // Invert: 10 intensity is at top (y = 10), 1 is at bottom (y = 85)
                    const y = 90 - ((entry.intensity - 1) / 9) * 80;
                    return { x, y, entry };
                  });

                  const pathD = points.reduce(
                    (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
                    ''
                  );

                  return (
                    <>
                      <path d={pathD} fill="none" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" />
                      {points.map((p, i) => (
                        <g key={i}>
                          <circle cx={p.x} cy={p.y} r="5" fill="#8B5CF6" stroke="#FFFFFF" strokeWidth="2" />
                          <text
                            x={p.x}
                            y={p.y - 8}
                            textAnchor="middle"
                            fontSize="9"
                            fontWeight="bold"
                            fill="#6D28D9"
                          >
                            {p.entry.intensity}
                          </text>
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>

              {/* X Axis Date labels */}
              <div className="flex justify-between items-center text-[9px] text-slate-500 font-medium px-2 pt-1 border-t border-slate-200 z-10">
                {chartEntries.map((entry, i) => {
                  const d = new Date(entry.created_at);
                  return (
                    <span key={i} className="flex flex-col items-center">
                      <span>{d.toLocaleDateString('en-US', { weekday: 'narrow' })}</span>
                      <span className="text-[8px] text-purple-600 font-bold">{entry.mood.slice(0, 3)}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Emotion Distribution Pills */}
        <div className="pt-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
            Emotion Breakdown
          </span>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(moodCounts).map(([mName, count]) => {
              const cfg = (MOOD_CONFIG as Record<string, any>)[mName];
              return (
                <div
                  key={mName}
                  className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-purple-50 text-purple-800 border border-purple-100 text-xs font-medium"
                >
                  <span>{cfg?.emoji || '🌿'}</span>
                  <span>{mName}</span>
                  <span className="text-[10px] font-bold bg-white px-1.5 py-0.2 rounded-full text-purple-600">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Personal Goals Tracker */}
      <div className="bg-white p-4 rounded-3xl border border-purple-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Personal Goals & Micro-Habits
            </h3>
          </div>
          <button
            onClick={() => setShowAddGoal(!showAddGoal)}
            className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center space-x-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Goal</span>
          </button>
        </div>

        {showAddGoal && (
          <form onSubmit={handleAddGoal} className="flex items-center space-x-2 pt-1">
            <input
              type="text"
              value={newGoalText}
              onChange={(e) => setNewGoalText(e.target.value)}
              placeholder="e.g. 5 mins mindful breathing every morning"
              className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
              autoFocus
            />
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-purple-600 text-white font-semibold text-xs cursor-pointer hover:bg-purple-700"
            >
              Add
            </button>
          </form>
        )}

        <div className="space-y-2">
          {goals.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">No personal goals set yet.</p>
          ) : (
            goals.map((g) => (
              <div
                key={g.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-purple-200 transition-all"
              >
                <div
                  onClick={() => handleToggleGoal(g.id)}
                  className="flex items-center space-x-2.5 cursor-pointer flex-1 pr-2"
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                      g.completed ? 'bg-emerald-600 text-white' : 'border-2 border-slate-300'
                    }`}
                  >
                    {g.completed && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                  <span
                    className={`text-xs ${
                      g.completed ? 'line-through text-slate-400' : 'text-slate-700 font-medium'
                    }`}
                  >
                    {g.title}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteGoal(g.id)}
                  className="text-slate-300 hover:text-rose-500 p-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Weekly Activity Summary */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 space-y-2">
        <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center space-x-1.5">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>Weekly Growth Reflection</span>
        </h4>
        <p className="text-xs text-slate-600 leading-relaxed">
          You are building consistency in recognizing your emotional state. Research shows that simply naming an intense emotion reduces amygdala activation by up to 40%. Keep going one day at a time!
        </p>
      </div>
    </div>
  );
};
