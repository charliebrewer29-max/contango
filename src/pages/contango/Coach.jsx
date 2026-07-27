import React, { useState, useRef, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Send, Sparkles, Loader2 } from "lucide-react";
import ScreenShell from "@/components/contango/ScreenShell";
import { useContango } from "@/contexts/ContangoContext";
import { COACH_NAME } from "@/lib/contangoTheme";
import { findBranch } from "@/lib/content";
import { base44 } from "@/api/base44Client";

// AI Coach: reflection input → coaching feedback.
// Routed through InvokeLLM (server-side). System prompt bakes in the educational-only constraint.
const SYSTEM_CONSTRAINT = `You are ${COACH_NAME}, an AI trading-education coach inside Contango, a simulated educational app. You are reviewing an educational simulation, NOT real trades. Never produce real-market buy/sell language or personalized trade signals. Everything is generic strategy education using simulated data. Keep feedback specific to the user's stated decision, fast, plain, and actionable. 3-5 sentences max.`;

export default function Coach() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { progress } = useContango();
  const branchId = params.get("branch");
  const branch = branchId ? findBranch(branchId) : null;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const welcome = branch
    ? `You just finished the ${branch.branchTitle} drill. Reflect on your decision: what were you watching for, and what would you do differently?`
    : `I'm ${COACH_NAME}. Tell me about a trade setup you're working through, or ask me to explain a concept differently.`;

  useEffect(() => {
    setMessages([{ role: "coach", text: welcome }]);
  }, [branchId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  async function send() {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    setInput("");
    const newMessages = [...messages, { role: "user", text: userText }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const prompt = `${SYSTEM_CONSTRAINT}\n\nContext: User is on a simulated educational drill${branch ? ` for the ${branch.branchTitle} strategy` : ""}. Their XP is ${progress.xp}, streak ${progress.streak}.\n\nConversation so far:\n${newMessages.map(m => `${m.role === "user" ? "User" : COACH_NAME}: ${m.text}`).join("\n")}\n\nUser's latest message: ${userText}\n\nRespond as ${COACH_NAME}:`;
      const res = await base44.integrations.Core.InvokeLLM({ prompt });
      const reply = typeof res === "string" ? res : (res?.text || res?.response || JSON.stringify(res));
      setMessages(m => [...m, { role: "coach", text: reply }]);
    } catch (e) {
      setMessages(m => [...m, { role: "coach", text: "I couldn't reach the coach service right now. Try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenShell showStats={false} title={`${COACH_NAME} · AI Coach`} tab="coach">
      <div className="mb-3 flex items-center gap-2 text-sky-400">
        <Sparkles className="h-5 w-5" />
        <span className="font-display text-sm font-semibold">{COACH_NAME}</span>
        <span className="text-xs text-slate-500">· educational only</span>
      </div>

      <div ref={scrollRef} className="flex h-[55vh] flex-col gap-3 overflow-y-auto rounded-xl border border-slate-800 bg-slate-900 p-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
              m.role === "user" ? "bg-sky-500 text-white" : "bg-slate-800 text-slate-200"
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl bg-slate-800 px-4 py-3 text-sm text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" /> {COACH_NAME} is thinking…
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Reflect on your trade or ask a question…"
          className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none"
        />
        <button onClick={send} disabled={loading || !input.trim()}
          className="flex items-center justify-center rounded-xl bg-sky-500 px-4 text-white transition hover:bg-sky-400 disabled:opacity-40">
          <Send className="h-5 w-5" />
        </button>
      </div>
      <p className="mt-2 text-center text-[11px] text-slate-600">
        {COACH_NAME} reviews simulated drills only — never real trades or personalized signals.
      </p>
    </ScreenShell>
  );
}