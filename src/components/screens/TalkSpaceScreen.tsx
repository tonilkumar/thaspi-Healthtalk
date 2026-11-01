import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  RotateCcw,
  ShieldAlert,
  Wind,
  Compass,
  Zap,
  Info,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { ChatMessage, CopingActivity, MoodEntry } from '../../types';
import { storage } from '../../services/storage';

interface TalkSpaceScreenProps {
  userName: string;
  userMood?: MoodEntry;
  onOpenCopingActivity: (activity: CopingActivity) => void;
}

export const TalkSpaceScreen: React.FC<TalkSpaceScreenProps> = ({
  userName,
  userMood,
  onOpenCopingActivity,
}) => {
  const sessionId = 'default-session';
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    storage.getChatMessages(sessionId)
  );
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const quickPrompts = [
    { label: 'Academic burnout', text: "I'm feeling completely overwhelmed with assignments and finals deadlines." },
    { label: 'Overthinking loop', text: "My mind is racing and I can't stop replaying worst-case scenarios." },
    { label: 'Zero motivation', text: "I have no energy or motivation to start studying today. How can I kickstart?" },
    { label: 'Late night loneliness', text: "Feeling really isolated and disconnected from friends lately." },
  ];

  const handleSend = async (textToSend?: string) => {
    const content = (textToSend || inputText).trim();
    if (!content || loading) return;

    setInputText('');

    // Append user message
    const userMsg = storage.addChatMessage('user', content, sessionId);
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      // Call server-side /api/chat which uses Google Gemini
      const historyPayload = [...messages, userMsg].map((m) => ({
        sender: m.sender,
        text: m.message,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyPayload,
          userName,
          userMood: userMood ? `${userMood.mood} (Intensity: ${userMood.intensity}/10)` : undefined,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data = await res.json();
      const replyText =
        data.reply ||
        "I'm here with you. Take a slow, steady breath. You don't have to carry this alone.";

      const aiMsg = storage.addChatMessage(
        'ai',
        replyText,
        sessionId,
        data.suggestedActivity,
        data.suggestedCategory
      );
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      // Gentle empathetic fallback
      const fallbackMsg = storage.addChatMessage(
        'ai',
        "I'm right here with you, though my connection had a tiny hiccup. Let's take a deep breath together: inhale for 4 seconds, exhale for 6. Remember, you are doing the best you can today.",
        sessionId,
        'Box Breathing',
        'Stress'
      );
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    storage.clearChat(sessionId);
    // Add fresh welcome
    const welcome = storage.addChatMessage(
      'ai',
      `Welcome to a fresh space, ${userName}. What's on your mind right now? I'm here to listen without judgment.`,
      sessionId
    );
    setMessages([welcome]);
    setShowClearModal(false);
  };

  const handleActivityClick = (activityName: string) => {
    const all = storage.getCopingActivities();
    const found =
      all.find((a) => a.title.toLowerCase().includes(activityName.toLowerCase())) ||
      all[0];
    onOpenCopingActivity(found);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)] max-w-md mx-auto bg-gradient-to-b from-purple-50/50 via-white to-purple-50/30">
      {/* Top Header */}
      <div className="px-4 py-3 bg-white/95 backdrop-blur-md border-b border-purple-100 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center space-x-2.5">
          <div className="relative">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-500/25">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white absolute -bottom-0.5 -right-0.5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800 flex items-center space-x-1.5">
              <span>TalkSpace Companion</span>
              <span className="text-[10px] font-semibold text-purple-700 bg-purple-100 px-1.5 py-0.2 rounded-full">
                AI
              </span>
            </h1>
            <p className="text-[10px] text-slate-400">
              {userMood ? `Aware of your ${userMood.mood} mood` : 'Empathetic & non-judgmental'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowClearModal(true)}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Clear Conversation"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Safety Notice Banner */}
      <div className="px-4 py-1.5 bg-purple-50/70 border-b border-purple-100 text-[10px] text-purple-700 flex items-center justify-between shrink-0">
        <span className="flex items-center space-x-1 truncate">
          <Info className="w-3 h-3 text-purple-500 shrink-0" />
          <span className="truncate">Supportive peer companion • Not clinical therapy</span>
        </span>
        <span className="text-[10px] font-semibold text-purple-600 shrink-0 ml-1">Confidential</span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 no-scrollbar">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const time = new Date(msg.created_at).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
          });

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-in fade-in duration-200`}
            >
              <div
                className={`max-w-[85%] rounded-3xl p-3.5 text-xs leading-relaxed shadow-sm ${
                  isUser
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-xs'
                    : 'bg-white text-slate-800 border border-purple-100 rounded-tl-xs shadow-purple-500/5'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.message}</p>

                {/* Suggested Coping Activity Card inside AI Message */}
                {msg.suggested_activity && !isUser && (
                  <div className="mt-3 pt-2.5 border-t border-purple-100">
                    <div className="p-2 rounded-xl bg-purple-50 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Wind className="w-4 h-4 text-purple-600" />
                        <div>
                          <span className="text-[10px] uppercase font-bold text-purple-600 block">
                            Suggested Exercise
                          </span>
                          <span className="text-xs font-bold text-slate-800">
                            {msg.suggested_activity}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleActivityClick(msg.suggested_activity!)}
                        className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-[11px] cursor-pointer transition-colors"
                      >
                        Start
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1">{time}</span>
            </div>
          );
        })}

        {/* Typing indicator */}
        {loading && (
          <div className="flex items-center space-x-2 p-3 bg-white rounded-2xl rounded-tl-xs border border-purple-100 max-w-[120px] shadow-sm">
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce [animation-delay:0.2s]" />
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
            <span className="text-[11px] text-slate-400 ml-1">Reflecting...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="px-3 pt-2 pb-1 bg-white/95 border-t border-purple-100/60 overflow-x-auto no-scrollbar flex space-x-2 shrink-0">
        {quickPrompts.map((qp, i) => (
          <button
            key={i}
            onClick={() => handleSend(qp.text)}
            className="text-[11px] font-medium px-3 py-1.5 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/50 whitespace-nowrap transition-colors cursor-pointer shrink-0"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-white border-t border-purple-100 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Share what you are feeling..."
            disabled={loading}
            className="flex-1 text-xs px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/70 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white transition-all"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="p-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25 disabled:opacity-40 disabled:cursor-not-allowed hover:from-purple-700 hover:to-indigo-700 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Clear Chat Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full space-y-4 shadow-xl border border-purple-100 text-center">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Clear TalkSpace Chat?</h3>
              <p className="text-xs text-slate-500 mt-1">
                This will reset the conversation history for a fresh start.
              </p>
            </div>
            <div className="flex space-x-2 pt-1">
              <button
                onClick={() => setShowClearModal(false)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleClearChat}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 cursor-pointer"
              >
                Yes, Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
