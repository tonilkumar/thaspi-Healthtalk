import React from 'react';
import {
  Sparkles,
  ArrowRight,
  MessageCircleHeart,
  Wind,
  CheckCircle2,
  BookOpen,
  Repeat,
  TrendingUp,
  Heart,
  Flame,
  Shield,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CopingActivity, MoodEntry, NavigationTab } from '../../types';
import { MOOD_CONFIG } from '../../data/initialData';
import { storage } from '../../services/storage';

interface HomeScreenProps {
  onNavigate: (tab: NavigationTab) => void;
  onOpenMoodModal: () => void;
  onOpenActivityModal: (activity: CopingActivity) => void;
  latestMood?: MoodEntry;
  recentMoods: MoodEntry[];
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  onOpenMoodModal,
  onOpenActivityModal,
  latestMood,
  recentMoods,
}) => {
  const { user } = useAuth();

  // Get habits & records
  const habits = user ? storage.getHabits(user.id) : [];
  const habitRecords = storage.getHabitRecords();
  const todayStr = new Date().toISOString().split('T')[0];
  const todayHabitsDone = habits.filter((h) =>
    habitRecords.some((r) => r.habit_id === h.id && r.date === todayStr && r.completed)
  ).length;

  // Activity records
  const activityRecords = user ? storage.getActivityRecords(user.id) : [];
  const allActivities = storage.getCopingActivities();

  // Pick recommendation based on recent mood
  const getRecommendedActivity = (): CopingActivity => {
    if (!latestMood) return allActivities[0];
    const m = latestMood.mood;
    if (m === 'Stressed' || m === 'Anxious') {
      return allActivities.find((a) => a.category === 'Stress') || allActivities[0];
    }
    if (m === 'Lonely') {
      return allActivities.find((a) => a.category === 'Loneliness') || allActivities[5];
    }
    if (m === 'Tired' || m === 'Neutral') {
      return allActivities.find((a) => a.id === 'act-7') || allActivities[0];
    }
    return allActivities.find((a) => a.category === 'Overthinking') || allActivities[1];
  };

  const recommendedActivity = getRecommendedActivity();

  // Check if checked in today
  const isCheckedInToday = latestMood && latestMood.created_at.startsWith(todayStr);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-5 pb-24 px-4 pt-3 max-w-md mx-auto animate-in fade-in duration-200">
      {/* Top Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-medium text-purple-600 flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            <span>UNDERSTAND • COPE • HEAL • GROW</span>
          </span>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight mt-0.5">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'Friend'} ✨
          </h1>
        </div>
        <div
          onClick={() => onNavigate('profile')}
          className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-purple-500/20 cursor-pointer"
        >
          {user?.name ? user.name.charAt(0).toUpperCase() : 'H'}
        </div>
      </div>

      {/* Today's Mood Check-in Card */}
      <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700 rounded-3xl p-5 text-white shadow-xl shadow-purple-500/20 relative overflow-hidden">
        {/* Decorative background shapes */}
        <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-indigo-400/20 blur-lg pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-200 bg-white/15 px-2.5 py-1 rounded-full">
              {isCheckedInToday ? "Today's Mood Logged" : 'Daily Emotional Check-in'}
            </span>
            <span className="text-xs text-purple-200 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </span>
          </div>

          {isCheckedInToday && latestMood ? (
            <div className="flex items-center space-x-3.5 pt-1">
              <span className="text-4xl filter drop-shadow">
                {MOOD_CONFIG[latestMood.mood]?.emoji || '🌿'}
              </span>
              <div>
                <h3 className="text-lg font-bold">
                  Feeling {latestMood.mood} ({latestMood.intensity}/10)
                </h3>
                <p className="text-xs text-purple-100 line-clamp-1 italic mt-0.5">
                  &ldquo;{latestMood.note || MOOD_CONFIG[latestMood.mood]?.description}&rdquo;
                </p>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-bold">How is your heart feeling right now?</h3>
              <p className="text-xs text-purple-100 mt-1">
                Take 30 seconds to name your emotion without judgment.
              </p>
            </div>
          )}

          <div className="pt-2 flex items-center space-x-2.5">
            <button
              onClick={onOpenMoodModal}
              className="flex-1 py-2.5 px-4 rounded-xl bg-white text-purple-800 font-semibold text-xs shadow-md hover:bg-purple-50 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span>{isCheckedInToday ? 'Update Mood Check-in' : 'Check In My Mood'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('talk')}
              className="py-2.5 px-3 rounded-xl bg-purple-500/40 hover:bg-purple-500/60 text-white font-medium text-xs border border-white/20 transition-all flex items-center space-x-1 cursor-pointer"
            >
              <MessageCircleHeart className="w-3.5 h-3.5" />
              <span>TalkSpace</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Pills Grid */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <button
          onClick={() => onNavigate('talk')}
          className="p-3 rounded-2xl bg-white border border-purple-100 hover:border-purple-300 shadow-sm transition-all flex flex-col items-center cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-purple-50 group-hover:bg-purple-100 text-purple-600 flex items-center justify-center mb-1 transition-colors">
            <MessageCircleHeart className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-semibold text-slate-700">Talk AI</span>
        </button>

        <button
          onClick={() => onOpenActivityModal(allActivities[0])}
          className="p-3 rounded-2xl bg-white border border-purple-100 hover:border-purple-300 shadow-sm transition-all flex flex-col items-center cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-50 group-hover:bg-indigo-100 text-indigo-600 flex items-center justify-center mb-1 transition-colors">
            <Wind className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-semibold text-slate-700">Breathing</span>
        </button>

        <button
          onClick={() => onNavigate('growth')}
          className="p-3 rounded-2xl bg-white border border-purple-100 hover:border-purple-300 shadow-sm transition-all flex flex-col items-center cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-50 group-hover:bg-emerald-100 text-emerald-600 flex items-center justify-center mb-1 transition-colors">
            <Repeat className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-semibold text-slate-700">Habits</span>
        </button>

        <button
          onClick={() => onNavigate('growth')}
          className="p-3 rounded-2xl bg-white border border-purple-100 hover:border-purple-300 shadow-sm transition-all flex flex-col items-center cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-sky-50 group-hover:bg-sky-100 text-sky-600 flex items-center justify-center mb-1 transition-colors">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-semibold text-slate-700">Journal</span>
        </button>
      </div>

      {/* Recommended Coping Activity Card */}
      <div className="p-4 rounded-3xl bg-white border border-purple-100/90 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <Shield className="w-4 h-4 text-purple-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Recommended Coping Activity
            </h3>
          </div>
          <span className="text-[11px] text-purple-600 font-semibold">
            {recommendedActivity.duration}
          </span>
        </div>

        <div className="flex items-start space-x-3 bg-purple-50/50 p-3.5 rounded-2xl border border-purple-100/60">
          <div className="p-2.5 rounded-xl bg-purple-100 text-purple-700 shrink-0">
            <Wind className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold text-purple-600 uppercase bg-purple-100 px-2 py-0.5 rounded-full">
                {recommendedActivity.category}
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-800 mt-1">
              {recommendedActivity.title}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
              {recommendedActivity.description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => onNavigate('cope')}
            className="text-xs font-semibold text-purple-600 hover:text-purple-800 cursor-pointer"
          >
            Explore all coping tools →
          </button>
          <button
            onClick={() => onOpenActivityModal(recommendedActivity)}
            className="py-1.5 px-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-sm cursor-pointer transition-colors"
          >
            Start Now
          </button>
        </div>
      </div>

      {/* Habit Transformation Summary */}
      <div className="p-4 rounded-3xl bg-white border border-purple-100/90 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <Repeat className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Habit Transformation
            </h3>
          </div>
          <div className="flex items-center space-x-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Active Habits</span>
          </div>
        </div>

        <p className="text-xs text-slate-500">
          Core idea: <strong className="text-slate-700">Replace, Don&apos;t Just Remove.</strong> Today&apos;s completions: {todayHabitsDone} of {habits.length}.
        </p>

        <div className="space-y-2">
          {habits.slice(0, 2).map((habit) => {
            const isDone = habitRecords.some(
              (r) => r.habit_id === habit.id && r.date === todayStr && r.completed
            );
            return (
              <div
                key={habit.id}
                onClick={() => {
                  storage.toggleHabitRecord(habit.id, todayStr);
                  // force rerender
                  window.dispatchEvent(new Event('storage'));
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isDone
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                    : 'bg-slate-50/70 border-slate-200/80 hover:border-purple-200 text-slate-700'
                }`}
              >
                <div className="flex-1 pr-2">
                  <div className="text-[11px] text-slate-400 line-through truncate">
                    {habit.habit_name}
                  </div>
                  <div className="text-xs font-semibold flex items-center space-x-1.5 text-slate-800">
                    <span className="text-emerald-600">↳</span>
                    <span className="truncate">{habit.replacement_activity}</span>
                  </div>
                </div>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                    isDone ? 'bg-emerald-600 text-white' : 'border-2 border-slate-300'
                  }`}
                >
                  {isDone && <CheckCircle2 className="w-4 h-4" />}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => onNavigate('growth')}
          className="w-full text-center text-xs text-purple-600 font-semibold hover:text-purple-800 pt-1 cursor-pointer"
        >
          View all habit swaps & streaks →
        </button>
      </div>

      {/* Healing Journey Summary Stats */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-white p-3.5 rounded-2xl border border-purple-100 shadow-sm text-center">
          <span className="text-2xl font-extrabold text-purple-600">{recentMoods.length}</span>
          <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-tight mt-0.5">
            Mood Logs
          </span>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-purple-100 shadow-sm text-center">
          <span className="text-2xl font-extrabold text-indigo-600">{activityRecords.length}</span>
          <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-tight mt-0.5">
            Activities Done
          </span>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-purple-100 shadow-sm text-center">
          <span className="text-2xl font-extrabold text-emerald-600">{habits.length}</span>
          <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-tight mt-0.5">
            Habits Active
          </span>
        </div>
      </div>
    </div>
  );
};
