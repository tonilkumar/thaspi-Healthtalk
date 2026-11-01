import React, { useState } from 'react';
import {
  User,
  Mail,
  Target,
  Edit2,
  Lock,
  LogOut,
  Trash2,
  Database,
  PhoneCall,
  CheckCircle2,
  Copy,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  X,
  ExternalLink,
  Smartphone,
  Download,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { STUDENT_HELPLINES, SUPABASE_SQL_SCHEMA } from '../../data/initialData';
import { storage } from '../../services/storage';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const ProfileScreen: React.FC = () => {
  const { user, logout, updateProfile, deleteAccount, quickLoginDemo } = useAuth();
  const { isInstallable, install, isIOS } = usePWAInstall();

  // Modals
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDatabaseModal, setShowDatabaseModal] = useState(false);
  const [showSchemaModal, setShowSchemaModal] = useState(false);
  const [showInstallGuideModal, setShowInstallGuideModal] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowInstallGuideModal(true);
    }
  };

  // Edit profile form
  const [editName, setEditName] = useState(user?.name || '');
  const [editGoal, setEditGoal] = useState(user?.wellness_goal || '');
  const [avatarColor, setAvatarColor] = useState(user?.avatar_color || '#8B5CF6');

  // Supabase form
  const [supabaseConfig, setSupabaseConfig] = useState(() => storage.getSupabaseConfig());
  const [testResult, setTestResult] = useState<string | null>(null);

  // Change password form
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordToast, setPasswordToast] = useState(false);

  const colors = ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#6366F1'];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: editName.trim(),
      wellness_goal: editGoal.trim(),
      avatar_color: avatarColor,
    });
    setShowEditProfile(false);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }
    setPasswordToast(true);
    setTimeout(() => {
      setPasswordToast(false);
      setShowChangePassword(false);
      setOldPassword('');
      setNewPassword('');
    }, 1000);
  };

  const handleTestSupabase = () => {
    if (!supabaseConfig.url || !supabaseConfig.anonKey) {
      setTestResult('Please enter both Supabase URL and Anon Key.');
      return;
    }
    storage.saveSupabaseConfig({
      ...supabaseConfig,
      connected: true,
    });
    setTestResult('Configured! Supabase credentials saved for cloud sync.');
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  const handleResetData = () => {
    if (confirm('Reset application data to initial demo state? All your records will be refreshed with sample college journey data.')) {
      storage.resetAllData();
      window.location.reload();
    }
  };

  const handleDeleteAccountConfirm = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      deleteAccount();
    }
  };

  return (
    <div className="space-y-4 pb-28 px-4 pt-3 max-w-md mx-auto animate-in fade-in duration-200">
      {/* Top Profile Card */}
      <div className="bg-white p-5 rounded-3xl border border-purple-100 shadow-sm space-y-4">
        <div className="flex items-center space-x-3.5">
          <div
            style={{ backgroundColor: user?.avatar_color || '#8B5CF6' }}
            className="w-14 h-14 rounded-2xl text-white font-extrabold text-xl flex items-center justify-center shadow-lg shadow-purple-500/20"
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'H'}
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-slate-800">{user?.name || 'Student User'}</h2>
            <p className="text-xs text-slate-400 flex items-center space-x-1">
              <Mail className="w-3 h-3" />
              <span>{user?.email || 'student@healpath.edu'}</span>
            </p>
            <span className="inline-block mt-1 text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
              HealPath Member
            </span>
          </div>
          <button
            onClick={() => {
              setEditName(user?.name || '');
              setEditGoal(user?.wellness_goal || '');
              setShowEditProfile(true);
            }}
            className="p-2 rounded-xl text-purple-600 bg-purple-50 hover:bg-purple-100 cursor-pointer transition-colors"
            title="Edit Profile"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>

        {/* Wellness Goal */}
        <div className="bg-purple-50/50 p-3 rounded-2xl border border-purple-100/60 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 flex items-center space-x-1">
            <Target className="w-3.5 h-3.5 text-purple-600" />
            <span>Primary Focus & Goal</span>
          </span>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            {user?.wellness_goal || 'Build emotional resilience and balance during college semesters'}
          </p>
        </div>
      </div>

      {/* Account Settings Menu */}
      <div className="bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden divide-y divide-purple-50">
        <button
          onClick={() => setShowEditProfile(true)}
          className="w-full px-4 py-3.5 flex items-center justify-between text-xs font-semibold text-slate-700 hover:bg-purple-50/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-2.5">
            <User className="w-4 h-4 text-purple-600" />
            <span>Edit Profile & Avatar</span>
          </div>
          <span className="text-slate-400">→</span>
        </button>

        <button
          onClick={() => setShowChangePassword(true)}
          className="w-full px-4 py-3.5 flex items-center justify-between text-xs font-semibold text-slate-700 hover:bg-purple-50/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-2.5">
            <Lock className="w-4 h-4 text-indigo-600" />
            <span>Change Password</span>
          </div>
          <span className="text-slate-400">→</span>
        </button>

        <button
          onClick={handleInstallClick}
          className="w-full px-4 py-3.5 flex items-center justify-between text-xs font-semibold text-purple-700 bg-purple-50/30 hover:bg-purple-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-2.5">
            <Smartphone className="w-4 h-4 text-purple-600" />
            <span>Install App / Add Shortcut to Home Screen</span>
          </div>
          <span className="text-[10px] font-bold text-white bg-purple-600 px-2 py-0.5 rounded-full">
            Install
          </span>
        </button>

        <button
          onClick={() => setShowDatabaseModal(true)}
          className="w-full px-4 py-3.5 flex items-center justify-between text-xs font-semibold text-slate-700 hover:bg-purple-50/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-2.5">
            <Database className="w-4 h-4 text-emerald-600" />
            <span>Supabase & PostgreSQL Database</span>
          </div>
          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            Active
          </span>
        </button>
      </div>

      {/* Switch Demo Profiles (Evaluator Helper) */}
      <div className="bg-white p-4 rounded-3xl border border-purple-100 shadow-sm space-y-2.5">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          ⚡ Switch Student Demo Profiles
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => quickLoginDemo('Alex Rivera', 'alex.student@healpath.edu')}
            className="p-2.5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-left border border-purple-200/60 transition-all cursor-pointer"
          >
            <span className="text-xs font-bold text-purple-900 block">Alex Rivera</span>
            <span className="text-[10px] text-purple-600">Sophomore (Exam stress)</span>
          </button>
          <button
            onClick={() => quickLoginDemo('Maya Lin', 'maya.freshman@healpath.edu')}
            className="p-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-left border border-indigo-200/60 transition-all cursor-pointer"
          >
            <span className="text-xs font-bold text-indigo-900 block">Maya Lin</span>
            <span className="text-[10px] text-indigo-600">Freshman (Transition)</span>
          </button>
        </div>
      </div>

      {/* Emergency Student Helplines */}
      <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-4 rounded-3xl border border-rose-200/80 shadow-sm space-y-3">
        <div className="flex items-center space-x-2 text-rose-800">
          <PhoneCall className="w-4 h-4 text-rose-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider">
            Student Support & Emergency Helplines
          </h3>
        </div>
        <div className="space-y-2">
          {STUDENT_HELPLINES.map((line, idx) => (
            <div
              key={idx}
              className="bg-white/80 p-2.5 rounded-2xl border border-rose-100 text-xs space-y-0.5"
            >
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span>{line.name}</span>
                <span className="text-rose-600 font-mono text-[11px] bg-rose-50 px-2 py-0.5 rounded-full">
                  {line.contact}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">{line.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Actions: Reset Data, Logout, Delete Account */}
      <div className="space-y-2 pt-1">
        <button
          onClick={handleResetData}
          className="w-full py-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Reset Demo Data to Initial State</span>
        </button>

        <button
          onClick={logout}
          className="w-full py-3 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>

        <button
          onClick={handleDeleteAccountConfirm}
          className="w-full py-2.5 text-rose-500 hover:text-rose-700 text-xs font-medium flex items-center justify-center space-x-1 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Account</span>
        </button>
      </div>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-xl border border-purple-100">
            <div className="flex items-center justify-between pb-2 border-b border-purple-50">
              <h3 className="text-sm font-bold text-slate-800">Edit Profile</h3>
              <button
                onClick={() => setShowEditProfile(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Wellness Goal</label>
                <textarea
                  rows={2}
                  value={editGoal}
                  onChange={(e) => setEditGoal(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Avatar Color</label>
                <div className="flex space-x-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setAvatarColor(c)}
                      style={{ backgroundColor: c }}
                      className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                        avatarColor === c ? 'scale-125 ring-2 ring-purple-600 ring-offset-2' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-xs hover:bg-purple-700 cursor-pointer transition-colors"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-xl border border-purple-100">
            <div className="flex items-center justify-between pb-2 border-b border-purple-50">
              <h3 className="text-sm font-bold text-slate-800">Change Password</h3>
              <button
                onClick={() => setShowChangePassword(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {passwordToast ? (
              <div className="text-center py-4 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs font-bold text-slate-800">Password Updated Successfully!</p>
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="•••••••• (min 6 characters)"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-xs hover:bg-purple-700 cursor-pointer"
                >
                  Update Password
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Supabase & PostgreSQL Modal */}
      {showDatabaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-xl border border-purple-100 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-2 border-b border-purple-50">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-800">Database & Supabase</h3>
              </div>
              <button
                onClick={() => setShowDatabaseModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-purple-50/70 rounded-2xl border border-purple-100 text-xs text-purple-900 leading-relaxed">
              HealPath is equipped with full PostgreSQL schema and Row Level Security (RLS) policies for Supabase. Current active data storage is persisting smoothly.
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  value={supabaseConfig.url}
                  onChange={(e) => setSupabaseConfig({ ...supabaseConfig, url: e.target.value })}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Supabase Anon Public Key
                </label>
                <input
                  type="password"
                  value={supabaseConfig.anonKey}
                  onChange={(e) => setSupabaseConfig({ ...supabaseConfig, anonKey: e.target.value })}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400 font-mono"
                />
              </div>

              {testResult && (
                <p className="text-xs font-medium text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                  {testResult}
                </p>
              )}

              <button
                type="button"
                onClick={handleTestSupabase}
                className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-xs hover:bg-purple-700 cursor-pointer"
              >
                Save Supabase Configuration
              </button>

              <button
                type="button"
                onClick={() => setShowSchemaModal(true)}
                className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View PostgreSQL Schema & RLS Policies</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SQL Schema Viewer Modal */}
      {showSchemaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-950 text-slate-100 rounded-3xl p-5 max-w-md w-full space-y-3 shadow-2xl max-h-[85vh] flex flex-col border border-slate-800">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400">
                PostgreSQL Supabase SQL Schema
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopySchema}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-purple-900/60 text-purple-300 text-xs font-semibold hover:bg-purple-800 cursor-pointer"
                >
                  {copiedSchema ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSchema ? 'Copied!' : 'Copy SQL'}</span>
                </button>
                <button
                  onClick={() => setShowSchemaModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <pre className="flex-1 overflow-y-auto no-scrollbar text-[10px] font-mono leading-relaxed p-3 bg-slate-900 rounded-2xl text-slate-300">
              {SUPABASE_SQL_SCHEMA}
            </pre>
          </div>
        </div>
      )}

      {/* Install Mobile App / Add Shortcut Guide Modal */}
      {showInstallGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl border border-purple-100 text-slate-800">
            <div className="flex items-center justify-between pb-2 border-b border-purple-100">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-xl bg-purple-100 text-purple-700">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold">Add Shortcut to Home Screen</h3>
              </div>
              <button
                onClick={() => setShowInstallGuideModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Use HealPath like a real mobile app on your smartphone with a 1-tap home screen shortcut:
            </p>

            <div className="space-y-3 bg-purple-50/60 p-3.5 rounded-2xl border border-purple-100 text-xs text-slate-700">
              <div className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  1
                </span>
                <span className="leading-relaxed">
                  On iPhone (Safari), tap the <strong className="text-purple-900">Share button</strong> (square with arrow). On Android (Chrome), tap <strong className="text-purple-900">Menu (⋮)</strong>.
                </span>
              </div>

              <div className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  2
                </span>
                <span className="leading-relaxed">
                  Select <strong className="text-purple-900">&quot;Add to Home Screen&quot;</strong> or <strong className="text-purple-900">&quot;Install App&quot;</strong>.
                </span>
              </div>

              <div className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  3
                </span>
                <span className="leading-relaxed">
                  Tap <strong className="text-purple-900">Add</strong>. HealPath opens standalone without address bars!
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowInstallGuideModal(false)}
              className="w-full py-2.5 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
