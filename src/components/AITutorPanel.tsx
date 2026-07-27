import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Lightbulb, Code, RefreshCw, Bot, User, CheckCircle2, ChevronRight, X, HelpCircle } from 'lucide-react';
import { ChatMessage, Lesson } from '../types';

interface AITutorPanelProps {
  currentLesson?: Lesson;
  userCode: string;
  isOpen: boolean;
  onClose: () => void;
  externalErrorToExplain?: string | null;
  onClearExternalError?: () => void;
  onStartQuiz?: () => void;
  onStartPractice?: () => void;
}

export const AITutorPanel: React.FC<AITutorPanelProps> = ({
  currentLesson,
  userCode,
  isOpen,
  onClose,
  externalErrorToExplain,
  onClearExternalError,
  onStartQuiz,
  onStartPractice,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: `Hi! I'm **PyCoach**, your AI Python programming tutor. 🐍\n\nI can explain Python concepts, give you step-by-step exercise hints, debug runtime errors, or review your code. How can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hintLevel, setHintLevel] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle external error explanation trigger from output console
  useEffect(() => {
    if (externalErrorToExplain && isOpen) {
      handleExplainError(externalErrorToExplain);
      if (onClearExternalError) onClearExternalError();
    }
  }, [externalErrorToExplain, isOpen]);

  const handleSendMessage = async (customPrompt?: string) => {
    const promptToSend = customPrompt || inputText;
    if (!promptToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: promptToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/ask-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToSend,
          code: userCode,
          currentLesson,
          chatHistory: messages.slice(-6).map((m) => ({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }],
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'AI Tutor request failed.');

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.text || "I'm sorry, I couldn't process that request right now.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'system',
        text: `⚠️ AI Assistant Error: ${err.message || 'Unable to connect to PyCoach server.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetHint = async () => {
    if (!currentLesson || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-hint-${Date.now()}`,
      sender: 'user',
      text: `💡 Can I get a Level ${hintLevel} hint for this exercise?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/get-hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: userCode,
          exercisePrompt: currentLesson.exercise.instructions,
          expectedOutput: currentLesson.exercise.expectedOutput,
          hintLevel,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch hint.');

      const aiMsg: ChatMessage = {
        id: `ai-hint-${Date.now()}`,
        sender: 'ai',
        text: `💡 **Level ${hintLevel} Hint:**\n\n${data.hint}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setHintLevel((prev) => Math.min(prev + 1, 3));
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'system',
          text: `Unable to generate hint: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExplainError = async (errorMessage: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/explain-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: userCode,
          errorMessage,
          lessonTitle: currentLesson?.title,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to explain error.');

      const aiMsg: ChatMessage = {
        id: `ai-error-${Date.now()}`,
        sender: 'ai',
        text: `🐛 **Error Diagnosis & Explanation:**\n\n${data.explanation}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'system',
          text: `Error diagnosis failed: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateExample = async () => {
    if (isLoading) return;
    const userMsg: ChatMessage = {
      id: `user-ex-${Date.now()}`,
      sender: 'user',
      text: `⚡ Can you generate a practical code example for ${currentLesson?.title || 'this topic'}?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/generate-example', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: currentLesson?.moduleTitle,
          lessonTitle: currentLesson?.title,
          difficulty: currentLesson?.difficulty,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate example.');

      const aiMsg: ChatMessage = {
        id: `ai-ex-${Date.now()}`,
        sender: 'ai',
        text: `⚡ **Python Code Example:**\n\n${data.example}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'system',
          text: `Unable to generate example: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateExercise = async () => {
    if (isLoading) return;
    const userMsg: ChatMessage = {
      id: `user-exercise-${Date.now()}`,
      sender: 'user',
      text: `🎯 Can you give me a custom practice exercise for ${currentLesson?.title || 'this topic'}?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/generate-exercise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonTitle: currentLesson?.title,
          topic: currentLesson?.moduleTitle,
          difficulty: currentLesson?.difficulty,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate exercise.');

      const aiMsg: ChatMessage = {
        id: `ai-exercise-${Date.now()}`,
        sender: 'ai',
        text: `🎯 **Custom Practice Challenge:**\n\n${data.exercise}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'system',
          text: `Unable to generate practice exercise: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <aside id="ai-tutor-panel" className="w-80 lg:w-96 bg-slate-950 border-l border-slate-800 h-[calc(100vh-64px)] flex flex-col z-20 shrink-0 shadow-2xl">
      {/* Panel Header */}
      <div className="p-3.5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded bg-indigo-600 flex items-center justify-center shadow-[0_0_10px_rgba(79,70,229,0.3)]">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold text-white flex items-center space-x-1.5 uppercase tracking-wider">
              <span>PYCOACH ARCHITECT AI</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </h3>
            <p className="text-[10px] font-mono text-indigo-400">Gemini 3.6 Flash Engine</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Action Chips */}
      <div className="p-2.5 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap gap-1.5">
        {onStartQuiz && (
          <button
            onClick={onStartQuiz}
            className="bg-purple-950/50 hover:bg-purple-900/70 border border-purple-800/50 text-purple-300 text-[11px] font-medium px-2 py-1 rounded-lg flex items-center space-x-1 transition-all"
          >
            <HelpCircle className="w-3 h-3 text-purple-400" />
            <span>AI Quiz (5 Qs)</span>
          </button>
        )}

        <button
          onClick={handleGetHint}
          disabled={isLoading}
          className="bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/50 text-amber-300 text-[11px] font-medium px-2 py-1 rounded-lg flex items-center space-x-1 transition-all"
        >
          <Lightbulb className="w-3 h-3 text-amber-400" />
          <span>Hint Lvl {hintLevel}</span>
        </button>

        <button
          onClick={handleGenerateExample}
          disabled={isLoading}
          className="bg-indigo-950/50 hover:bg-indigo-900/70 border border-indigo-800/50 text-indigo-300 text-[11px] font-medium px-2 py-1 rounded-lg flex items-center space-x-1 transition-all"
        >
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span>Code Example</span>
        </button>

        <button
          onClick={() => onStartPractice ? onStartPractice() : handleGenerateExercise()}
          disabled={isLoading}
          className="bg-emerald-950/50 hover:bg-emerald-900/70 border border-emerald-800/50 text-emerald-300 text-[11px] font-medium px-2 py-1 rounded-lg flex items-center space-x-1 transition-all"
        >
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span>Practice Problems (5 Sets)</span>
        </button>

        <button
          onClick={() => handleSendMessage('Please review my current Python code and give me feedback on accuracy, logic, and style.')}
          disabled={isLoading}
          className="bg-sky-950/50 hover:bg-sky-900/70 border border-sky-800/50 text-sky-300 text-[11px] font-medium px-2 py-1 rounded-lg flex items-center space-x-1 transition-all"
        >
          <Code className="w-3 h-3 text-sky-400" />
          <span>Debug/Review Code</span>
        </button>
      </div>

      {/* Messages Chat Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5 text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-2.5 ${
              msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
                msg.sender === 'user'
                  ? 'bg-sky-600 text-white'
                  : msg.sender === 'system'
                  ? 'bg-rose-900 text-rose-200'
                  : 'bg-indigo-600 text-white'
              }`}
            >
              {msg.sender === 'user' ? (
                <User className="w-3.5 h-3.5" />
              ) : (
                <Bot className="w-3.5 h-3.5" />
              )}
            </div>

            <div
              className={`max-w-[85%] rounded-xl p-3 leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-sky-600 text-white rounded-tr-none'
                  : msg.sender === 'system'
                  ? 'bg-rose-950/60 border border-rose-800/50 text-rose-200'
                  : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-tl-none'
              }`}
            >
              <div className="whitespace-pre-wrap font-sans space-y-2">
                {msg.text}
              </div>
              <span className="text-[9px] opacity-60 block mt-1 text-right">
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-2 text-indigo-300 p-2 text-xs bg-slate-800/40 rounded-lg">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
            <span>PyCoach is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Prompt Box */}
      <div className="p-3 border-t border-slate-800 bg-slate-950">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <input
            id="input-ai-prompt"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask PyCoach about Python..."
            disabled={isLoading}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            id="btn-send-ai-prompt"
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white p-2 rounded-xl transition-all shadow"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </aside>
  );
};
