import React, { useState } from 'react';
import {
  Sparkles,
  Mail,
  Lock,
  User,
  ArrowRight,
  Target,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuthScreenProps {
  initialMode?: 'login' | 'register';
  onBackToLanding?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  initialMode = 'login',
  onBackToLanding,
}) => {
  const { login, register, quickLoginDemo } = useAuth();
  const [isLogin, setIsLogin] = useState<boolean>(initialMode === 'login');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [wellnessGoal, setWellnessGoal] = useState('Manage exam anxiety and build healthier bedtime habits');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const goalOptions = [
    'Manage exam anxiety and build healthier bedtime habits',
    'Stop excessive phone doomscrolling and regain focus',
    'Overcome procrastination and academic low motivation',
    'Navigate feelings of loneliness and self-doubt',
    'Cultivate mindful breathing and everyday calm',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        if (!email.trim()) {
          setError('Please provide your email address.');
          setLoading(false);
          return;
        }
        const res = await login(email, password);
        if (!res.success) {
          setError(res.error || 'Login failed. Please check your credentials.');
        }
      } else {
        if (!name.trim()) {
          setError('Please enter your full name.');
          setLoading(false);
          return;
        }
        if (!email.trim() || !email.includes('@')) {
          setError('Please enter a valid email address.');
          setLoading(false);
          return;
        }
        if (password && password.length < 6) {
          setError('Password should be at least 6 characters.');
          setLoading(false);
          return;
        }
        if (password && password !== confirmPassword) {
          setError('Passwords do not match.');
          setLoading(false);
          return;
        }
        const res = await register(name, email, password, wellnessGoal);
        if (!res.success) {
          setError(res.error || 'Registration failed.');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-50/40 p-4 sm:p-6 flex flex-col justify-center max-w-md mx-auto">
      {/* Header & Logo */}
      <div className="text-center mb-6">
        {onBackToLanding && (
          <button
            onClick={onBackToLanding}
            className="text-xs text-purple-600 hover:text-purple-800 font-medium mb-3 inline-block cursor-pointer"
          >
            ← Back to Overview
          </button>
        )}
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-lg shadow-purple-500/25 mb-3">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">
          {isLogin ? 'Welcome Back to HealPath' : 'Join HealPath Community'}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {isLogin
            ? 'Sign in to access your mood log, AI companion & habits'
            : 'Your personal space to understand, cope, heal & grow'}
        </p>

        {/* Tab Switcher */}
        <div className="flex bg-purple-100/70 p-1 rounded-2xl max-w-xs mx-auto mt-4">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              isLogin ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              !isLogin ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Register
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-3xl border border-purple-100 shadow-xl shadow-purple-500/5 space-y-4">
        {!isLogin && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Rivera"
                className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                required={!isLogin}
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@university.edu"
              className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
              required
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-700">Password</label>
            {isLogin && (
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-[11px] text-purple-600 hover:text-purple-800 font-medium cursor-pointer"
              >
                Forgot?
              </button>
            )}
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
            />
          </div>
        </div>

        {!isLogin && (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Emotional Wellness Goal
              </label>
              <div className="relative">
                <Target className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <select
                  value={wellnessGoal}
                  onChange={(e) => setWellnessGoal(e.target.value)}
                  className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all bg-white appearance-none"
                >
                  {goalOptions.map((opt, i) => (
                    <option key={i} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-xs shadow-lg shadow-purple-500/25 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-60"
        >
          <span>{loading ? 'Please wait...' : isLogin ? 'Sign In to HealPath' : 'Create My Account'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Quick 1-Click Evaluator Demo Accounts */}
      <div className="mt-6 pt-4 border-t border-purple-100 text-center">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          ⚡ 1-Click Student Demo Accounts
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            type="button"
            onClick={() => quickLoginDemo('Alex Rivera', 'alex.student@healpath.edu')}
            className="text-[11px] px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/60 font-medium transition-all cursor-pointer"
          >
            Alex Rivera (Sophomore)
          </button>
          <button
            type="button"
            onClick={() => quickLoginDemo('Maya Lin', 'maya.freshman@healpath.edu')}
            className="text-[11px] px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/60 font-medium transition-all cursor-pointer"
          >
            Maya Lin (Freshman)
          </button>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-purple-100">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm">Reset Password</h3>
              <button
                onClick={() => {
                  setShowForgotModal(false);
                  setResetEmailSent(false);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {!resetEmailSent ? (
              <>
                <p className="text-xs text-slate-600">
                  Enter your email address and we&apos;ll send you instructions to safely reset your HealPath password.
                </p>
                <input
                  type="email"
                  placeholder="student@university.edu"
                  defaultValue={email}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <button
                  type="button"
                  onClick={() => setResetEmailSent(true)}
                  className="w-full py-2.5 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 cursor-pointer"
                >
                  Send Recovery Link
                </button>
              </>
            ) : (
              <div className="text-center py-3 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs font-semibold text-slate-800">Recovery Link Sent!</p>
                <p className="text-[11px] text-slate-500">
                  Please check your inbox. You can also sign in directly using the 1-click student demo profile.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setResetEmailSent(false);
                  }}
                  className="mt-2 text-xs text-purple-600 font-semibold"
                >
                  Return to Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
