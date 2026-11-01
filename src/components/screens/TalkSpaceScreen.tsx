import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  RotateCcw,
  Mic,
  Volume2,
  VolumeX,
  Wind,
  Info,
  Trash2,
  Sparkles,
  ArrowRight,
  Shield,
  HeartHandshake,
} from 'lucide-react';
import { ChatMessage, CopingActivity, MoodEntry } from '../../types';
import { storage } from '../../services/storage';
import { HealPathLogo } from '../common/HealPathLogo';

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

  // Voice speech-to-text state
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  // Voice text-to-speech state
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Initialize SpeechRecognition if available
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputText(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!speechSupported || !recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please type your message.');
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.warn('Could not start recognition:', e);
      }
    }
  };

  const handleSpeakText = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95; // soothing pace
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setSpeakingMsgId(null);
    };
    utterance.onerror = () => {
      setSpeakingMsgId(null);
    };

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Conversational prompt starters
  const quickPrompts = [
    { label: 'Just need to vent', text: "I'm having a hard day and honestly just need someone to talk to." },
    { label: 'Anxious & spiraling', text: "My mind won't stop racing and my chest feels a bit tight. Can you help me calm down?" },
    { label: 'College burnout', text: "I feel exhausted with assignments and college expectations." },
    { label: 'Feeling lonely', text: "Feeling really isolated today and disconnected from everyone." },
    { label: 'Can we just talk?', text: "Hey HealPath, can we chat for a bit? My mind feels heavy." },
  ];

  const handleSend = async (textToSend?: string) => {
    const content = (textToSend || inputText).trim();
    if (!content || loading) return;

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
    }

    setInputText('');

    // Append user message
    const userMsg = storage.addChatMessage('user', content, sessionId);
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
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
        `I hear you, ${userName}. I'm sitting right here with you, and there is zero pressure to figure it all out right now. What feels like the heaviest part?`;

      const aiMsg = storage.addChatMessage(
        'ai',
        replyText,
        sessionId,
        data.suggestedActivity,
        data.suggestedCategory,
        data.suggestedActivityId
      );
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const fallbackMsg = storage.addChatMessage(
        'ai',
        `I hear you, ${userName}. It takes vulnerability to say that out loud. I'm right here with you with an open heart. What's on your mind?`,
        sessionId,
        'Box Breathing (4-4-4-4)',
        'Stress',
        'act-1'
      );
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    storage.clearChat(sessionId);
    const welcome = storage.addChatMessage(
      'ai',
      `Welcome to a fresh space, ${userName}. What's on your mind right now? You can type anything or tap the microphone to talk with me. I'm here to listen like a close friend.`,
      sessionId
    );
    setMessages([welcome]);
    setShowClearModal(false);
  };

  const handleActivityClick = (activityIdOrName: string) => {
    const all = storage.getCopingActivities();
    const found =
      all.find(
        (a) =>
          a.id === activityIdOrName ||
          a.title.toLowerCase().includes(activityIdOrName.toLowerCase())
      ) || all[0];
    onOpenCopingActivity(found);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full max-w-md mx-auto bg-gradient-to-b from-purple-50/40 via-white to-purple-50/20">
      {/* Top Companion Sub-Header */}
      <div className="px-3.5 sm:px-4 py-2.5 bg-white/95 backdrop-blur-md border-b border-purple-100 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center space-x-2.5">
          <div className="relative">
            <HealPathLogo size="sm" variant="icon-only" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white absolute -bottom-0.5 -right-0.5 shadow-2xs animate-pulse" />
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-extrabold text-slate-800 flex items-center space-x-1.5 leading-tight">
              <span>TalkSpace Companion</span>
              <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded-md">
                HealPath AI
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium leading-tight">
              {userMood ? `Attuned to your ${userMood.mood} mood` : 'Warm, personal therapist-friend'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowClearModal(true)}
          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Clear Conversation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Safety & Empathy Notice Banner */}
      <div className="px-3.5 py-1.5 bg-purple-50/70 border-b border-purple-100/60 text-[10px] text-purple-700 flex items-center justify-between shrink-0">
        <span className="flex items-center space-x-1.5 truncate">
          <HeartHandshake className="w-3 h-3 text-purple-500 shrink-0" />
          <span className="truncate">Safe & supportive peer space • No judgment</span>
        </span>
        <span className="text-[9px] font-semibold text-purple-600 bg-purple-100/80 px-1.5 py-0.5 rounded-sm shrink-0 ml-1">
          Private
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3.5 sm:px-4 py-3.5 space-y-3.5 no-scrollbar">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isSpeaking = speakingMsgId === msg.id;
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
                className={`max-w-[88%] rounded-3xl p-3.5 text-xs sm:text-[13px] leading-relaxed shadow-2xs relative group ${
                  isUser
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-xs'
                    : 'bg-white text-slate-800 border border-purple-100/90 rounded-tl-xs shadow-purple-500/5'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.message}</p>

                {/* Text-To-Speech Listen Button for AI replies */}
                {!isUser && (
                  <div className="flex items-center justify-end mt-2 pt-1 border-t border-slate-100/80">
                    <button
                      onClick={() => handleSpeakText(msg.id, msg.message)}
                      className={`flex items-center space-x-1 px-2 py-0.5 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
                        isSpeaking
                          ? 'bg-purple-100 text-purple-700 font-bold'
                          : 'text-slate-400 hover:text-purple-600 hover:bg-purple-50'
                      }`}
                      title={isSpeaking ? 'Stop listening' : 'Listen to response'}
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="w-3 h-3 text-purple-600" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3" />
                          <span>Listen</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Suggested Coping Activity Card (Proactive & Interactive) */}
                {msg.suggested_activity && !isUser && (
                  <div className="mt-2.5 pt-2 border-t border-purple-100">
                    <div className="p-2.5 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50/60 to-purple-50/80 border border-purple-200/80 flex items-center justify-between gap-2 shadow-2xs">
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs shadow-purple-500/20">
                          <Wind className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[9px] uppercase font-bold text-purple-700 tracking-wider block">
                            Recommended Coping Practice
                          </span>
                          <span className="text-xs font-bold text-slate-800 truncate block">
                            {msg.suggested_activity}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleActivityClick(msg.suggested_activity_id || msg.suggested_activity!)
                        }
                        className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-[11px] shrink-0 shadow-xs active:scale-95 transition-all cursor-pointer flex items-center space-x-1"
                      >
                        <span>Start</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1">{time}</span>
            </div>
          );
        })}

        {/* HealPath AI typing indicator */}
        {loading && (
          <div className="flex items-center space-x-2 p-3 bg-white rounded-2xl rounded-tl-xs border border-purple-100 max-w-[180px] shadow-2xs">
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce [animation-delay:0.2s]" />
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
            <span className="text-[11px] text-purple-600 font-semibold ml-1">HealPath AI is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Conversational Prompt Starter Chips */}
      <div className="px-3 pt-2 pb-1.5 bg-white/95 border-t border-purple-100/70 overflow-x-auto no-scrollbar flex space-x-2 shrink-0">
        {quickPrompts.map((qp, i) => (
          <button
            key={i}
            onClick={() => handleSend(qp.text)}
            className="text-[11px] font-medium px-3 py-1.5 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/60 whitespace-nowrap transition-colors cursor-pointer shrink-0 shadow-2xs active:scale-95"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Perfectly Aligned Bottom Typing Dock */}
      <div className="p-2.5 sm:p-3 bg-white border-t border-purple-100 shrink-0 shadow-[0_-2px_8px_rgba(0,0,0,0.02)]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          {/* Voice Microphone Button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200/70'
            }`}
            title={isListening ? 'Listening... Tap to stop' : 'Tap to speak with voice'}
          >
            {isListening ? <Mic className="w-4 h-4 animate-bounce" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Text Message Input */}
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isListening ? 'Listening to your voice...' : 'Type or speak what you feel...'}
            disabled={loading}
            className={`flex-1 text-xs sm:text-sm px-3.5 py-2.5 rounded-2xl border transition-all ${
              isListening
                ? 'border-rose-400 bg-rose-50/30 ring-2 ring-rose-200'
                : 'border-slate-200 bg-slate-50/80 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white placeholder:text-slate-400'
            }`}
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="w-10 h-10 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25 disabled:opacity-40 disabled:cursor-not-allowed hover:from-purple-700 hover:to-indigo-700 active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        {isListening && (
          <p className="text-[10px] text-rose-600 font-semibold text-center mt-1 animate-pulse">
            🔴 Listening... speak naturally and tap Send or mic when finished
          </p>
        )}
      </div>

      {/* Clear Chat Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full space-y-4 shadow-xl border border-purple-100 text-center animate-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Clear TalkSpace Chat?</h3>
              <p className="text-xs text-slate-500 mt-1">
                This will reset the conversation history for a fresh start with your therapist-friend.
              </p>
            </div>
            <div className="flex space-x-2 pt-1">
              <button
                onClick={() => setShowClearModal(false)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearChat}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 cursor-pointer transition-colors"
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
