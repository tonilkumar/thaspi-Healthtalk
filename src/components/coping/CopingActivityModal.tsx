import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Wind,
  Compass,
  Zap,
  ListChecks,
  Smartphone,
  HeartHandshake,
  Activity,
  BookOpen,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CopingActivity } from '../../types';
import { storage } from '../../services/storage';

interface CopingActivityModalProps {
  activity: CopingActivity;
  userId: string;
  onClose: () => void;
  onCompleted?: () => void;
}

export const CopingActivityModal: React.FC<CopingActivityModalProps> = ({
  activity,
  userId,
  onClose,
  onCompleted,
}) => {
  // Activity execution states
  const [activeStep, setActiveStep] = useState<number>(0);
  const [completed, setCompleted] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<'Helpful' | 'Not Helpful' | null>(null);

  // Breathing exercise state
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [breathCount, setBreathCount] = useState<number>(4);
  const [isBreathingRunning, setIsBreathingRunning] = useState<boolean>(false);
  const [cyclesCompleted, setCyclesCompleted] = useState<number>(0);

  // 5-Minute Timer state
  const [timerSeconds, setTimerSeconds] = useState<number>(300); // 5 mins = 300s
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [customTask, setCustomTask] = useState<string>('');

  // 5-4-3-2-1 Grounding responses
  const [groundingInputs, setGroundingInputs] = useState<string[]>(['', '', '', '', '']);

  // Microstep checklist
  const [microsteps, setMicrosteps] = useState<{ text: string; done: boolean }[]>([
    { text: 'Clear physical desk and open only required notebook/tab', done: false },
    { text: 'Write down the single most essential concept or heading', done: false },
    { text: 'Spend 5 minutes drafting thoughts without grading yourself', done: false },
  ]);

  // Breathing loop timer
  useEffect(() => {
    let interval: any = null;
    if (isBreathingRunning && activity.type === 'breathing') {
      interval = setInterval(() => {
        setBreathCount((prev) => {
          if (prev > 1) {
            return prev - 1;
          } else {
            // Transition phase
            setBreathPhase((currentPhase) => {
              if (currentPhase === 'Inhale') return 'Hold';
              if (currentPhase === 'Hold') return 'Exhale';
              if (currentPhase === 'Exhale') return 'Rest';
              // Completed 1 cycle
              setCyclesCompleted((c) => c + 1);
              return 'Inhale';
            });
            return 4; // 4 seconds per phase
          }
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBreathingRunning, activity.type]);

  // 5-Minute timer loop
  useEffect(() => {
    let timerInterval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      timerInterval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            handleFinishActivity();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerInterval);
  }, [isTimerRunning, timerSeconds]);

  const handleFinishActivity = () => {
    setCompleted(true);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#8B5CF6', '#A78BFA', '#34D399', '#60A5FA'],
      });
    } catch {
      // ignore
    }
    storage.recordActivityCompletion(userId, activity.id);
    if (onCompleted) onCompleted();
  };

  const handleFeedback = (val: 'Helpful' | 'Not Helpful') => {
    setFeedback(val);
    storage.recordActivityCompletion(userId, activity.id, val);
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getActivityIcon = () => {
    switch (activity.icon) {
      case 'Wind':
        return <Wind className="w-6 h-6 text-purple-600" />;
      case 'Compass':
        return <Compass className="w-6 h-6 text-indigo-600" />;
      case 'Zap':
        return <Zap className="w-6 h-6 text-amber-600" />;
      case 'ListChecks':
        return <ListChecks className="w-6 h-6 text-emerald-600" />;
      case 'SmartphoneOff':
        return <Smartphone className="w-6 h-6 text-rose-600" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-6 h-6 text-pink-600" />;
      case 'Activity':
        return <Activity className="w-6 h-6 text-sky-600" />;
      default:
        return <BookOpen className="w-6 h-6 text-purple-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl flex flex-col border border-purple-100">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-5 py-4 border-b border-purple-50 flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-purple-50">{getActivityIcon()}</div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-600 bg-purple-100/60 px-2 py-0.5 rounded-full">
                  {activity.category}
                </span>
                <span className="text-xs text-slate-400">• {activity.duration}</span>
              </div>
              <h2 className="text-base font-bold text-slate-800 leading-tight mt-0.5">
                {activity.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-5 space-y-6">
          <p className="text-sm text-slate-600 leading-relaxed bg-purple-50/50 p-3.5 rounded-2xl border border-purple-100/60">
            {activity.description}
          </p>

          {/* Interactive Mode 1: Box Breathing */}
          {activity.type === 'breathing' && (
            <div className="flex flex-col items-center justify-center py-6 bg-gradient-to-b from-purple-50/60 to-white rounded-3xl border border-purple-100/80">
              <div className="relative flex items-center justify-center w-52 h-52">
                {/* Visual pulse ring */}
                <div
                  className={`absolute rounded-full transition-all duration-1000 ease-in-out ${
                    breathPhase === 'Inhale'
                      ? 'w-48 h-48 bg-purple-200/50 scale-110 shadow-lg shadow-purple-200/50'
                      : breathPhase === 'Hold'
                      ? 'w-44 h-44 bg-indigo-200/50'
                      : breathPhase === 'Exhale'
                      ? 'w-36 h-36 bg-purple-100/70 scale-90'
                      : 'w-32 h-32 bg-slate-100'
                  }`}
                />
                {/* Center Core */}
                <div className="relative z-10 flex flex-col items-center justify-center w-32 h-32 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-xl shadow-purple-500/20">
                  <span className="text-xs font-medium uppercase tracking-widest text-purple-200">
                    {breathPhase}
                  </span>
                  <span className="text-4xl font-extrabold mt-0.5">{breathCount}</span>
                </div>
              </div>

              <div className="mt-5 text-center">
                <p className="text-xs text-purple-700 font-medium">
                  {cyclesCompleted > 0 ? `${cyclesCompleted} cycles completed` : 'Rhythmic 4-count flow'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Inhale (4s) • Hold (4s) • Exhale (4s) • Pause (4s)
                </p>
              </div>

              <div className="flex items-center space-x-3 mt-4">
                <button
                  onClick={() => setIsBreathingRunning(!isBreathingRunning)}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm shadow-md shadow-purple-600/20 transition-all cursor-pointer"
                >
                  {isBreathingRunning ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>Pause Breath</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>{cyclesCompleted > 0 ? 'Resume Rhythm' : 'Begin Breathing'}</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setIsBreathingRunning(false);
                    setBreathPhase('Inhale');
                    setBreathCount(4);
                    setCyclesCompleted(0);
                  }}
                  className="p-2.5 rounded-full border border-purple-200 text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
                  title="Reset"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Interactive Mode 2: 5-4-3-2-1 Grounding */}
          {activity.type === 'grounding' && (
            <div className="space-y-4">
              <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                    Sensory Anchors
                  </span>
                  <span className="text-xs text-indigo-500 font-medium">
                    Step {activeStep + 1} of 5
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-slate-800">
                  {activity.steps[activeStep]}
                </h4>
                <div className="mt-3">
                  <input
                    type="text"
                    value={groundingInputs[activeStep] || ''}
                    onChange={(e) => {
                      const updated = [...groundingInputs];
                      updated[activeStep] = e.target.value;
                      setGroundingInputs(updated);
                    }}
                    placeholder="Type what you notice or keep in mind..."
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-indigo-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div className="flex items-center justify-between mt-4">
                  <button
                    disabled={activeStep === 0}
                    onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
                    className="text-xs text-slate-500 hover:text-slate-800 disabled:opacity-40 cursor-pointer font-medium"
                  >
                    Previous
                  </button>
                  <div className="flex space-x-1.5">
                    {[0, 1, 2, 3, 4].map((dot) => (
                      <span
                        key={dot}
                        className={`w-2 h-2 rounded-full transition-all ${
                          dot === activeStep
                            ? 'bg-indigo-600 w-4'
                            : dot < activeStep
                            ? 'bg-indigo-300'
                            : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  {activeStep < 4 ? (
                    <button
                      onClick={() => setActiveStep((s) => Math.min(4, s + 1))}
                      className="text-xs text-indigo-600 font-semibold hover:text-indigo-800 cursor-pointer"
                    >
                      Next Step →
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-emerald-600">All Anchors Complete!</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Interactive Mode 3: 5-Minute Timer (Low motivation) */}
          {activity.type === 'timer' && (
            <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-b from-amber-50/50 to-white rounded-3xl border border-amber-200/60">
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2">
                Five-Minute Rule Action Sprint
              </span>

              <div className="text-5xl font-extrabold text-amber-900 tracking-tight font-mono my-3">
                {formatTimer(timerSeconds)}
              </div>

              <div className="w-full max-w-xs mb-4">
                <input
                  type="text"
                  value={customTask}
                  onChange={(e) => setCustomTask(e.target.value)}
                  placeholder="Task: e.g. Open doc and write 2 lines"
                  className="w-full text-xs text-center px-3 py-2 rounded-xl border border-amber-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="flex items-center space-x-2 px-6 py-2.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm shadow-md shadow-amber-600/20 transition-all cursor-pointer"
                >
                  {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isTimerRunning ? 'Pause' : 'Start 5 Mins'}</span>
                </button>
                <button
                  onClick={() => {
                    setIsTimerRunning(false);
                    setTimerSeconds(300);
                  }}
                  className="p-2.5 rounded-full border border-amber-200 text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-3 text-center">
                Give yourself full permission to quit after 5 minutes if you wish.
              </p>
            </div>
          )}

          {/* Interactive Mode 4: Micro-Steps */}
          {activity.type === 'microsteps' && (
            <div className="space-y-3">
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                Bite-Sized Action Steps
              </span>
              {microsteps.map((step, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    const next = [...microsteps];
                    next[idx].done = !next[idx].done;
                    setMicrosteps(next);
                  }}
                  className={`flex items-start space-x-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    step.done
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-white border-slate-200 hover:border-purple-200'
                  }`}
                >
                  <div
                    className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                      step.done ? 'bg-emerald-600 text-white' : 'border-2 border-slate-300'
                    }`}
                  >
                    {step.done && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                  <span
                    className={`text-xs leading-relaxed flex-1 ${
                      step.done ? 'line-through text-slate-400' : 'text-slate-700'
                    }`}
                  >
                    {step.text}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Steps list */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Guided Process
            </h4>
            <div className="space-y-2">
              {activity.steps.map((st, i) => (
                <div key={i} className="flex items-start space-x-2.5 text-xs text-slate-600">
                  <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed mt-0.5">{st}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Completion & Feedback Section */}
          <div className="pt-2 border-t border-slate-100 space-y-4">
            {!completed ? (
              <button
                onClick={handleFinishActivity}
                className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-lg shadow-purple-500/25 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Mark Activity Completed</span>
              </button>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center space-y-3">
                <div className="flex items-center justify-center space-x-1.5 text-emerald-700 font-semibold text-sm">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Activity Recorded! Proud of you.</span>
                </div>
                <p className="text-xs text-emerald-600">
                  Was this exercise helpful for your headspace right now?
                </p>
                <div className="flex items-center justify-center space-x-3">
                  <button
                    onClick={() => handleFeedback('Helpful')}
                    className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      feedback === 'Helpful'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-100/50'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Helpful</span>
                  </button>
                  <button
                    onClick={() => handleFeedback('Not Helpful')}
                    className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      feedback === 'Not Helpful'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    <span>Not Helpful</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
