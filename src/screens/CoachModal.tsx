import React, { useState, useRef, useEffect } from 'react';
import { CoachChatMessage } from '../types';
import { Mascot } from '../components/Mascot';
import { chatWithCoachApi } from '../services/api';
import { X, Send, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

interface CoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  stepsToday: number;
  streakDays: number;
  coinBalance: number;
  userName?: string;
  userRank?: number;
  distanceKm?: number;
  caloriesBurned?: number;
}

export const CoachModal: React.FC<CoachModalProps> = ({
  isOpen,
  onClose,
  stepsToday,
  streakDays,
  coinBalance,
  userName = 'Walker',
  userRank = 1,
  distanceKm = 0,
  caloriesBurned = 0,
}) => {
  const stepsRemaining = Math.max(0, 20000 - stepsToday);
  const firstName = userName.split(' ')[0] || 'Friend';

  const [messages, setMessages] = useState<CoachChatMessage[]>(() => [
    {
      id: 'init_1',
      role: 'assistant',
      content: `Hi ${firstName}! 🐼 I'm your StepEarn Coach. You've walked ${stepsToday.toLocaleString()} steps today (${stepsRemaining > 0 ? `${stepsRemaining.toLocaleString()} steps to your 20,000-step goal!` : 'Goal achieved! Amazing work!'}) How can I support your walking workout and coin earnings today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Dynamic quick suggestion chips based on real user numbers
  const quickChips = [
    `How many calories in my ${stepsToday.toLocaleString()} steps?`,
    'Give me a 3-min walking stretch routine',
    'How do I earn the full 25 coins today?',
    'Motivate me to keep my streak alive!',
    'Tips for proper walking posture and footwear',
  ];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsg: CoachChatMessage = {
      id: 'usr_' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const ordinal = userRank === 1 ? '1st' : userRank === 2 ? '2nd' : userRank === 3 ? '3rd' : `${userRank}th`;
      const userContext = {
        stepsToday,
        streak: streakDays,
        coinBalance,
        userName,
        rank: `${ordinal} place`,
        distanceKm,
        caloriesBurned,
      };

      const reply = await chatWithCoachApi([...messages, userMsg], userContext);

      const assistantMsg: CoachChatMessage = {
        id: 'ast_' + Date.now(),
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: CoachChatMessage = {
        id: 'err_' + Date.now(),
        role: 'assistant',
        content: `Every step counts towards your fitness and rewards! You are currently at ${stepsToday.toLocaleString()} steps with ${streakDays} days of continuous streak. Keep moving, stay hydrated, and take short breaks when needed!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'init_reset',
        role: 'assistant',
        content: `Ready for a fresh walk discussion, ${firstName}! You're currently on day ${streakDays} of your streak with ${coinBalance.toLocaleString()} coins. What fitness topic should we cover?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-50 w-full max-w-md h-[92vh] max-h-[750px] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-white px-4 py-3.5 border-b border-slate-200 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-full bg-orange-100 flex items-center justify-center border-2 border-orange-500 overflow-hidden">
                <Mascot size={46} mood="cheer" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-teal-500 border-2 border-white rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-black text-slate-900">StepEarn Coach</h3>
                <span className="text-[10px] font-black bg-gradient-to-r from-orange-500 to-amber-500 text-white px-1.5 py-0.5 rounded-full">
                  Gemini AI
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-400">
                Personalized Walking & Habits Guide
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleResetChat}
              className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
              title="Reset conversation"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              title="Close Coach"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Disclaimer Pin */}
        <div className="bg-amber-50/90 border-b border-amber-200/60 px-3.5 py-1.5 flex items-center gap-2 text-[11px] text-amber-800 shrink-0">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span className="truncate">Coach can only help with walking, fitness tips & StepEarn coin rewards.</span>
        </div>

        {/* Live Context Banner */}
        <div className="px-4 py-2 bg-gradient-to-r from-orange-50 via-amber-50 to-teal-50 border-b border-slate-200/80 flex items-center justify-between text-xs font-bold text-slate-700 shrink-0">
          <div className="flex items-center gap-1">
            <span className="text-orange-500">👟</span>
            <span>{stepsToday.toLocaleString()} steps</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🔥</span>
            <span>{streakDays}d streak</span>
          </div>
          <div className="flex items-center gap-1 text-teal-700">
            <span className="w-3.5 h-3.5 rounded-full bg-teal-600 text-white text-[9px] flex items-center justify-center font-black">
              W
            </span>
            <span>{coinBalance.toLocaleString()}</span>
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center shrink-0 border border-orange-200 overflow-hidden mt-0.5">
                    <Mascot size={32} />
                  </div>
                )}
                <div
                  className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-gradient-to-r from-orange-500 to-[#FF5500] text-white rounded-br-xs font-medium'
                      : 'bg-white text-slate-800 rounded-bl-xs border border-slate-200/80 whitespace-pre-line'
                  }`}
                >
                  <p>{m.content}</p>
                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      isUser ? 'text-orange-200' : 'text-slate-400'
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-2.5 items-center text-slate-400 text-xs pl-2">
              <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center shrink-0 border border-orange-200 overflow-hidden">
                <Mascot size={32} mood="thinking" />
              </div>
              <div className="bg-white px-3 py-2 rounded-2xl border border-slate-200 flex items-center gap-1.5 shadow-xs">
                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-orange-600 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-3 py-2 bg-slate-100/90 border-t border-slate-200 overflow-x-auto flex gap-1.5 no-scrollbar shrink-0">
          {quickChips.map((chip, i) => (
            <button
              key={i}
              onClick={() => handleSend(chip)}
              className="text-[11px] font-bold text-slate-700 bg-white hover:bg-orange-50 hover:text-orange-600 border border-slate-200 hover:border-orange-300 rounded-full px-3 py-1 whitespace-nowrap transition-colors shadow-2xs"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Text Input Footer */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Coach about walking, stretches, pacing or coins..."
            className="flex-1 px-4 py-2.5 rounded-full bg-slate-100 border border-transparent focus:border-orange-500 focus:bg-white text-xs outline-none text-slate-800 transition-all placeholder:text-slate-400"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputText.trim() || isLoading}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              inputText.trim() && !isLoading
                ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-500/30'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4 translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
