import React from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Brain,
  Sprout,
  Heart,
  MessageCircleHeart,
  Compass,
  Repeat,
  CheckCircle2,
} from 'lucide-react';
import { HealPathLogo } from '../common/HealPathLogo';

interface LandingScreenProps {
  onGetStarted: () => void;
  onLoginClick: () => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ onGetStarted, onLoginClick }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100/60 via-[#f8f7fd] to-white pb-16">
      {/* Top Bar */}
      <header className="px-6 py-4 flex items-center justify-between">
        <HealPathLogo size="md" variant="full" />
        <button
          onClick={onLoginClick}
          className="text-xs font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3.5 py-1.5 rounded-full transition-all cursor-pointer"
        >
          Sign In
        </button>
      </header>

      {/* Hero Section */}
      <section className="px-6 pt-6 pb-8 text-center space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-100/80 text-purple-700 text-xs font-medium border border-purple-200/50">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Designed for Students & Young Adults</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">
          Find your calm in the{' '}
          <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            academic storm.
          </span>
        </h1>

        <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
          Navigate college deadlines, overthinking spirals, and daily emotional hurdles with empathetic AI guidance and science-backed micro-coping tools.
        </p>

        {/* Core Pillars */}
        <div className="bg-white/80 backdrop-blur-sm p-3.5 rounded-2xl border border-purple-100 shadow-sm max-w-sm mx-auto flex items-center justify-between text-xs font-semibold text-purple-900">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span>UNDERSTAND</span>
          </span>
          <span className="text-purple-300">→</span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>COPE</span>
          </span>
          <span className="text-purple-300">→</span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            <span>HEAL</span>
          </span>
          <span className="text-purple-300">→</span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>GROW</span>
          </span>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={onGetStarted}
            className="w-full max-w-xs mx-auto py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-xl shadow-purple-600/25 flex items-center justify-center space-x-2 transition-all cursor-pointer transform active:scale-95"
          >
            <span>Begin Your Healing Journey</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-[11px] text-slate-400 mt-2">Free, confidential & private. No credit card.</p>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="px-6 space-y-3 max-w-md mx-auto">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          How HealPath Helps You Every Day
        </h2>

        {/* Card 1 */}
        <div className="p-4 rounded-2xl bg-white border border-purple-100/80 shadow-sm flex items-start space-x-3.5">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 shrink-0">
            <MessageCircleHeart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">TalkSpace Companion</h3>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Empathetic HealPath AI to vent, reflect, and unpack academic pressure without fear of judgment.
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-4 rounded-2xl bg-white border border-indigo-100/80 shadow-sm flex items-start space-x-3.5">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Coping Hub & Guided Breath</h3>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Actionable 5-minute techniques: Box Breathing, 5-4-3-2-1 Sensory Grounding, and Micro-Task Chunking.
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-4 rounded-2xl bg-white border border-emerald-100/80 shadow-sm flex items-start space-x-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
            <Repeat className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Habit Transformation</h3>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              &quot;Replace, Don&apos;t Just Remove.&quot; Turn late-night phone doomscrolling into nourishing, relaxing rituals.
            </p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="p-4 rounded-2xl bg-white border border-sky-100/80 shadow-sm flex items-start space-x-3.5">
          <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 shrink-0">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Smart Mood & Growth Analytics</h3>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Track emotional waves, identify personal triggers, and celebrate daily healing milestones.
            </p>
          </div>
        </div>
      </section>

      {/* Trust & Safety Banner */}
      <section className="px-6 mt-6 max-w-md mx-auto">
        <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100 text-xs text-slate-600 flex items-center space-x-2.5">
          <ShieldCheck className="w-5 h-5 text-purple-600 shrink-0" />
          <span className="leading-tight">
            Non-clinical peer wellness companion. Your journal reflections remain strictly private on your device.
          </span>
        </div>
      </section>
    </div>
  );
};
