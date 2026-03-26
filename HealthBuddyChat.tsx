import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, AlertCircle, Sparkles, Stethoscope } from "lucide-react";
import { getChatResponse } from "@/data/medicineKnowledge";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const INITIAL_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: "Hey! 👋 I'm **HealthBuddy**, your medicine assistant.\n\nAsk me about any medicine, symptoms, side effects, or cheaper alternatives.\n\nTry: _\"I have fever\"_ or _\"Tell me about Dolo 650\"_",
};

const QUICK_PROMPTS = [
  { label: "🤒 Fever", query: "I have fever, what should I take?" },
  { label: "💊 Dolo 650", query: "Tell me about Dolo 650" },
  { label: "🫁 Cold & Cough", query: "I have cold and cough" },
  { label: "🔥 Acidity", query: "I have acidity problem" },
];

export default function HealthBuddyChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  function handleSend(text?: string) {
    const q = (text || input).trim();
    if (!q) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    // Simulate realistic AI typing delay
    const delay = 500 + Math.random() * 700;
    setTimeout(() => {
      const response = getChatResponse(q);
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: response },
      ]);
      setTyping(false);
    }, delay);
  }

  function renderMarkdown(text: string) {
    return text.split("\n").map((line, i) => {
      let processed = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/_(.*?)_/g, '<em>$1</em>')
        .replace(/• /g, '<span class="inline-block w-1.5 h-1.5 rounded-full bg-primary/60 mr-1.5 relative top-[-1px]"></span>')
        .replace(/💊/g, '<span>💊</span>')
        .replace(/⚠️/g, '<span>⚠️</span>');
      return (
        <p
          key={i}
          className="mb-1 last:mb-0 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: processed || "&nbsp;" }}
        />
      );
    });
  }

  const showQuickPrompts = messages.length <= 1 && !typing;

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-[0_4px_24px_rgba(34,120,74,0.4)] flex items-center justify-center group"
          >
            <MessageCircle className="w-6 h-6 transition-transform group-hover:rotate-12" />
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.92 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-3rem)] rounded-2xl bg-card border border-border shadow-[0_12px_48px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-border/60 bg-gradient-to-r from-primary/8 to-accent/5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-[0_2px_8px_rgba(34,120,74,0.3)]">
                    <Stethoscope className="w-4.5 h-4.5 text-primary-foreground" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-primary border-2 border-card rounded-full" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    HealthBuddy
                    <Sparkles className="w-3 h-3 text-primary" />
                  </h4>
                  <span className="text-[10px] text-muted-foreground">AI Medicine Assistant • Online</span>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-secondary/80 text-muted-foreground transition-all hover:text-foreground active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-3.5 h-3.5 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md shadow-[0_2px_8px_rgba(34,120,74,0.2)]"
                        : "bg-secondary/50 text-foreground border border-border/40 rounded-bl-md"
                    }`}
                  >
                    {renderMarkdown(msg.content)}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 mt-1">
                      <User className="w-3.5 h-3.5 text-accent" />
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Quick prompts */}
              {showQuickPrompts && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-wrap gap-1.5 pt-1"
                >
                  {QUICK_PROMPTS.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => handleSend(p.query)}
                      className="text-[11px] px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/40 transition-all active:scale-95 font-medium"
                    >
                      {p.label}
                    </button>
                  ))}
                </motion.div>
              )}

              {/* Typing indicator */}
              {typing && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2 items-start"
                >
                  <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="bg-secondary/50 border border-border/40 rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground">HealthBuddy is thinking…</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Disclaimer */}
            <div className="px-4 py-1.5 bg-amber-50 border-t border-amber-200/50 flex items-center gap-1.5 shrink-0">
              <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
              <span className="text-[10px] text-amber-700">
                For informational purposes only. Always consult a qualified doctor.
              </span>
            </div>

            {/* Input */}
            <div className="px-3 py-3 border-t border-border/60 bg-card flex gap-2 shrink-0">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Ask about any medicine or symptom..."
                className="flex-1 text-sm bg-secondary/40 border border-border/50 rounded-xl px-3.5 py-2.5 placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                disabled={typing}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || typing}
                className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-30 hover:bg-primary/90 transition-all active:scale-90 shadow-[0_2px_8px_rgba(34,120,74,0.2)]"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
