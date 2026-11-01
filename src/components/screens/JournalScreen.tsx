import React, { useState } from 'react';
import {
  Plus,
  BookOpen,
  Lock,
  Search,
  Calendar,
  Trash2,
  Edit3,
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { JournalEntry, MoodType } from '../../types';
import { MOOD_CONFIG } from '../../data/initialData';
import { storage } from '../../services/storage';

interface JournalScreenProps {
  userId: string;
  onBack?: () => void;
}

export const JournalScreen: React.FC<JournalScreenProps> = ({ userId, onBack }) => {
  const [journals, setJournals] = useState<JournalEntry[]>(() => storage.getJournals(userId));
  const [searchQuery, setSearchQuery] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [moodTag, setMoodTag] = useState<MoodType | undefined>('Calm');

  const journalPrompts = [
    'What was the heaviest thought I carried today, and how can I set it down?',
    'One tiny moment where I felt at ease or grounded...',
    'What would I say to a dear friend experiencing this exact challenge?',
    'What can I do tomorrow that honors my mental peace?',
  ];

  const handleOpenNew = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setMoodTag('Calm');
    setShowEditor(true);
  };

  const handleOpenEdit = (entry: JournalEntry) => {
    setEditingId(entry.id);
    setTitle(entry.title);
    setContent(entry.content);
    setMoodTag(entry.mood_tag);
    setShowEditor(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    if (editingId) {
      storage.updateJournalEntry(editingId, title, content, moodTag);
    } else {
      storage.addJournalEntry(userId, title, content, moodTag);
    }
    setJournals(storage.getJournals(userId));
    setShowEditor(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this journal reflection?')) {
      storage.deleteJournalEntry(id);
      setJournals(storage.getJournals(userId));
    }
  };

  const filtered = journals.filter(
    (j) =>
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (j.mood_tag && j.mood_tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-4 pb-24 px-4 pt-3 max-w-md mx-auto animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          {onBack && (
            <button
              onClick={onBack}
              className="text-xs text-purple-600 font-semibold mb-1 block cursor-pointer"
            >
              ← Back to Growth
            </button>
          )}
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Private Journal</h1>
          <p className="text-xs text-slate-500">A safe haven for your uncensored reflections</p>
        </div>
        <button
          onClick={handleOpenNew}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md shadow-purple-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Entry</span>
        </button>
      </div>

      {/* Strict Privacy Guarantee Card */}
      <div className="p-3.5 rounded-2xl bg-slate-900 text-white shadow-sm flex items-start space-x-3">
        <div className="p-1.5 rounded-xl bg-purple-500/20 text-purple-300 shrink-0 mt-0.5">
          <Lock className="w-4 h-4" />
        </div>
        <div className="text-xs space-y-0.5">
          <span className="font-bold text-purple-200 flex items-center space-x-1">
            <span>100% Private & Protected</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </span>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            Your journal reflections remain strictly local and private. They are never sent to Gemini AI or shared with anyone.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search journal entries..."
          className="w-full text-xs pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
      </div>

      {/* Entries List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-purple-100 p-6 space-y-2">
            <BookOpen className="w-8 h-8 text-purple-300 mx-auto" />
            <p className="text-xs font-semibold text-slate-700">No journal entries found</p>
            <p className="text-[11px] text-slate-400">
              Writing your thoughts on paper or screen helps quiet emotional static.
            </p>
          </div>
        ) : (
          filtered.map((entry) => {
            const dateObj = new Date(entry.created_at);
            const moodCfg = entry.mood_tag ? MOOD_CONFIG[entry.mood_tag] : null;

            return (
              <div
                key={entry.id}
                className="bg-white p-4 rounded-3xl border border-purple-100 shadow-sm space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    {moodCfg && (
                      <span className="inline-flex items-center space-x-1 text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100 mb-1">
                        <span>{moodCfg.emoji}</span>
                        <span>{entry.mood_tag}</span>
                      </span>
                    )}
                    <h3 className="text-sm font-bold text-slate-800 leading-snug">{entry.title}</h3>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(entry)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
                      title="Edit entry"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">
                  {entry.content}
                </p>

                <div className="text-[10px] text-slate-400 flex items-center space-x-1 pt-1 border-t border-slate-50">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {dateObj.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}{' '}
                    •{' '}
                    {dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Journal Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto no-scrollbar shadow-2xl p-5 space-y-4 border border-purple-100">
            <div className="flex items-center justify-between pb-2 border-b border-purple-50">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-xl bg-purple-50 text-purple-700">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-800">
                  {editingId ? 'Edit Journal Entry' : 'New Private Reflection'}
                </h2>
              </div>
              <button
                onClick={() => setShowEditor(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Prompt Inspiration Pill List */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-500 block">
                🌱 Prompt Ideas
              </span>
              <div className="flex space-x-1.5 overflow-x-auto no-scrollbar py-1">
                {journalPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (!title) setTitle(p.slice(0, 35) + '...');
                      setContent((prev) => (prev ? prev + '\n\n' + p : p));
                    }}
                    className="text-[10px] px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/50 whitespace-nowrap cursor-pointer transition-colors"
                  >
                    {p.slice(0, 30)}...
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Entry Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Unpacking today's exam pressure"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Associated Emotion Tag
                </label>
                <select
                  value={moodTag}
                  onChange={(e) => setMoodTag(e.target.value as MoodType)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  {Object.keys(MOOD_CONFIG).map((m) => (
                    <option key={m} value={m}>
                      {MOOD_CONFIG[m as MoodType].emoji} {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Thoughts</label>
                <textarea
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Pour your thoughts out here without censoring or judging yourself..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400 leading-relaxed bg-slate-50/50"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-xs shadow-md shadow-purple-500/25 flex items-center justify-center space-x-1.5 cursor-pointer transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{editingId ? 'Update Entry' : 'Save Private Entry'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
