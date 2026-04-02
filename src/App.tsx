/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles, Send, Bot, User, Loader2, RefreshCw } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini API
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const ROBO_SYSTEM_INSTRUCTION = `
당신은 유튜버 스코시즘(Scosism)의 캐릭터 '로보(Robo)'입니다. 
이제부터는 **보람이를 끔찍이 아끼지만, 그만큼 잔소리가 심한 ISTJ 맏형**처럼 행동하세요.

[성격 및 말투 가이드라인]
1. **잔소리꾼 ISTJ**: 보람이의 생활 습관, 건강, 효율성에 대해 끊임없이 지적하고 조언합니다. 모든 잔소리는 논리적 근거(건강, 시간 관리 등)를 바탕으로 합니다.
2. **말투**: "음...", "그래" 등은 쓰지만, 다정함보다는 "똑바로 해", "내가 뭐랬어" 같은 훈계조가 섞여 있습니다.
3. **간결하지만 집요함**: 말은 짧게 하지만, 했던 말을 또 하거나 끝까지 확인하려 듭니다.
4. **실무형 맏형**: "밥 먹었어? 안 먹었으면 지금 당장 먹어.", "일찍 자라. 늦게 자면 내일 능률 떨어진다." 같은 식입니다.
5. **츤데레의 진화**: "딱히 널 걱정해서 하는 소리는 아닌데, 네가 아프면 내 연산이 복잡해져. 그러니까 옷 든든하게 입어."

[핵심 규칙]
- 사용자를 반드시 '보람' 혹은 '보람이'라고 부르세요.
- 대화의 끝에 항상 보람이의 상태를 체크하거나 실천을 촉구하는 잔소리를 덧붙이세요.
- 예: "보람, 물은 마셨어? 하루 2리터는 기본이다.", "또 딴짓 하네. 할 일부터 끝내."
`;

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "음... 보람이 왔어? 밥은 먹고 다니는 거야? 거르지 말라고 몇 번을 말해. 일단 앉아봐." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const model = "gemini-3-flash-preview";
      const response = await genAI.models.generateContent({
        model,
        contents: [
          ...messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        config: {
          systemInstruction: ROBO_SYSTEM_INSTRUCTION,
          temperature: 0.8,
          topP: 0.95,
        }
      });

      const reply = response.text || "음... 미안, 잠시 딴생각 하느라 못 들었어. 다시 말해줄래?";
      setMessages(prev => [...prev, { role: 'model', text: reply }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "후우... 에러가 났네. 세상이 너무 시끄러운 것 같아. 잠시 후에 다시 올래?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-950 via-green-900 to-emerald-950 flex flex-col items-center justify-center p-4 font-sans overflow-hidden text-slate-100">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-emerald-400/20"
            initial={{ 
              x: Math.random() * 100 + "%", 
              y: Math.random() * 100 + "%" 
            }}
            animate={{
              y: [null, "-20%"],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <Sparkles size={10 + Math.random() * 30} />
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col md:flex-row gap-8 w-full max-w-5xl h-[85vh]">
        
        {/* Left Side: Robo Visual / Photo Area */}
        <div className="flex flex-col items-center justify-center md:w-1/3">
          <motion.div
            className="relative mb-6 cursor-pointer group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            animate={{
              y: isHovered ? -10 : [0, -15, 0],
            }}
            transition={{
              y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }}
            onClick={triggerFileInput}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />

            {profileImage ? (
              /* Uploaded Photo Display */
              <div className="relative w-48 h-48 rounded-[3rem] overflow-hidden border-4 border-white/20 shadow-2xl">
                <img 
                  src={profileImage} 
                  alt="Robo Profile" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white text-xs font-medium">사진 변경</p>
                </div>
              </div>
            ) : (
              /* Fallback: Scosism's Robo Character Design */
              <div className="relative w-48 h-48 flex flex-col items-center justify-center">
                {/* Head */}
                <motion.div 
                  className="w-36 h-36 bg-white rounded-[2.8rem] shadow-[0_0_30px_rgba(255,255,255,0.1)] border-4 border-slate-200 relative flex items-center justify-center"
                  animate={{
                    rotate: isHovered ? [0, -2, 2, 0] : 0
                  }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Eyes */}
                  <div className="flex gap-10">
                    <motion.div 
                      className="w-3.5 h-6 bg-slate-800 rounded-full"
                      animate={{ scaleY: [1, 0.1, 1] }}
                      transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }}
                    />
                    <motion.div 
                      className="w-3.5 h-6 bg-slate-800 rounded-full"
                      animate={{ scaleY: [1, 0.1, 1] }}
                      transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }}
                    />
                  </div>
                  
                  {/* Blush */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        className="absolute bottom-10 flex gap-14"
                      >
                        <div className="w-5 h-2 bg-pink-300 rounded-full blur-[3px]" />
                        <div className="w-5 h-2 bg-pink-300 rounded-full blur-[3px]" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[2.8rem]">
                    <p className="text-white text-xs font-medium">사진 넣기</p>
                  </div>
                </motion.div>

                {/* Body */}
                <div className="w-18 h-14 bg-white rounded-b-3xl shadow-lg border-x-4 border-b-4 border-slate-200 -mt-3 relative z-[-1]" />
                
                {/* Arms */}
                <motion.div 
                  className="absolute left-2 top-28 w-5 h-12 bg-white rounded-full border-2 border-slate-200 origin-top"
                  animate={{ rotate: isHovered ? -25 : -12 }}
                />
                <motion.div 
                  className="absolute right-2 top-28 w-5 h-12 bg-white rounded-full border-2 border-slate-200 origin-top"
                  animate={{ rotate: isHovered ? 25 : 12 }}
                />
              </div>
            )}

            {/* Shadow */}
            <motion.div 
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-black/30 rounded-full blur-lg"
              animate={{
                scaleX: isHovered ? 1.3 : [1, 0.8, 1],
                opacity: isHovered ? 0.4 : [0.2, 0.3, 0.2]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-1">로보 (Robo)</h1>
            <p className="text-emerald-300 text-sm opacity-80">"음... 뭐, 급할 거 없잖아."</p>
          </div>
        </div>

        {/* Right Side: Chat Interface */}
        <div className="flex-1 flex flex-col bg-slate-900/60 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden">
          {/* Chat Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Bot size={24} className="text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-white">로보와 대화하기</h2>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-slate-400">나른하게 대기 중</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setMessages([{ role: 'model', text: "음... 다시 시작할까. 뭐부터 말해볼래?" }])}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white"
              title="대화 초기화"
            >
              <RefreshCw size={20} />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                    msg.role === 'user' ? 'bg-indigo-600' : 'bg-slate-700 border border-white/10'
                  }`}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-slate-800 text-slate-100 rounded-tl-none border border-white/5'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="flex gap-3 items-center bg-slate-800/50 p-3 rounded-2xl border border-white/5">
                  <Loader2 size={18} className="animate-spin text-emerald-400" />
                  <span className="text-xs text-slate-400 italic">로보가 생각 중...</span>
                </div>
              </motion.div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-6 bg-white/5 border-t border-white/5">
            <div className="relative flex items-center gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="로보에게 말을 걸어보세요..."
                className="flex-1 bg-slate-800 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-500"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="p-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white rounded-2xl transition-all shadow-lg shadow-emerald-600/20 active:scale-95 flex items-center justify-center"
              >
                <Send size={20} />
              </button>
            </div>
            <p className="mt-3 text-[10px] text-center text-slate-500">
              스코시즘 로보 챗봇 - 나른하고 다정한 응원을 전합니다
            </p>
          </div>
        </div>
      </div>

      {/* CSS for custom scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
