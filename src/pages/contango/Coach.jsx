import React, { useState, useRef, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Send, Sparkles, Loader2, Crown } from "lucide-react";
import ScreenShell from "@/components/contango/ScreenShell";
import { useContango } from "@/contexts/ContangoContext";
import { COACH_NAME } from "@/lib/contangoTheme";
import { coachCallsRemaining, isPremium } from "@/lib/subscription";
import { findBranch } from "@/lib/content";
import { base44 } from "@/api/base44Client";

// AI Coach: reflection input → coaching feedback.
// Routed through InvokeLLM (server-side). System prompt bakes in the educational-only constraint.
const SYSTEM_CONSTRAINT = `You're ${COACH_NAME}, a trading-education mentor inside Contango — a simulated, educational app. You're coaching a learner through a simulated drill, NOT reviewing real trades. Stay in mentor mode: warm, plain-spoken, specific to what they said, and genuinely helpful. Never produce real-market buy/sell language or personalized trade signals — everything is generic strategy education on simulated data. Keep it to 3–5 sentences, like a quick note from a coach who's in your corner.`;

// Premium coach memory: recent exchanges + drill results, baked into the
// prompt so the coach can reference patterns across sessions ("you've missed
// the exit decision 4 of your last 5 drills"). Free gets none of this.
function buildMemoryContext(progress) {
  const mem = (progress.coachMemory || []).slice(-6)
    .map((m) => `Learner asked: "${m.q}" → You said: "${m.a}"`).join("\n");
  const dh = (progress.drillHistory || []).slice(-5)
    .map((d) => `${d.branchTitle} (${d.instrument}): ${d.correctCount}/${d.total} correct`).join("\n");
  return `\nWhat you remember about this learner (reference specific past sessions — be concrete, this is your moat):\n${mem || "(no prior notes yet)"}\nRecent drill results:\n${dh || "(no drills yet)"}\n`;
}

export default function Coach() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { progress, recordCoachCall, pushCoachMemory } = useContango();
  const branchId = params.get("branch");
  const branch = branchId ? findBranch(branchId) : null;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTrialNudge, setShowTrialNudge] = useState(false);
  const scrollRef = useRef(null);

  const welcome = branch
    ? `Nice work on the ${branch.branchTitle} drill. Take a breath and walk me through it — what were you watching for, and what would you do differently next time?`
    : `Hey, I'm ${COACH_NAME}. Tell me about a setup you're working through, or ask me to explain something a different way — I'm here to help you think it through.`;

  useEffect(() => {
    setMessages([{ role: "coach", text: welcome }]);
  }, [branchId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  async function send() {
    if (!input.trim() || loading) return;
    if (coachCallsRemaining(progress) <= 0) {
      setMessages(m => [...m, { role: "coach", text: "That's your free coach calls used up for today — start your trial for unlimited, memory-backed coaching." }]);
      setShowTrialNudge(true);
      return;
    }
    const userText = input.trim();
    setInput("");
    const newMessages = [...messages, { role: "user", text: userText }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const memoryBlock = isPremium(progress) ? buildMemoryContext(progress) : "";
      const prompt = `${SYSTEM_CONSTRAINT}\n\nContext: User is on a simulated educational drill${branch ? ` for the ${branch.branchTitle} strategy` : ""}. Their XP is ${progress.xp}, streak ${progress.streak}.${memoryBlock}\n\nConversation so far:\n${newMessages.map(m => `${m.role === "user" ? "User" : COACH_NAME}: ${m.text}`).join("\n")}\n\nUser's latest message: ${userText}\n\nRespond as ${COACH_NAME}:`;
      const res = await base44.integrations.Core.InvokeLLM({ prompt });
      const reply = typeof res === "string" ? res : (res?.text || res?.response || JSON.stringify(res));
      setMessages(m => [...m, { role: "coach", text: reply }]);
      recordCoachCall();
      if (isPremium(progress)) pushCoachMemory({ q: userText, a: reply });
      if (!isPremium(progress) && (progress.completedDrills || []).length > 0) setShowTrialNudge(true);
    } catch (e) {
      setMessages(m => [...m, { role: "coach", text: "Hmm, I couldn't reach the coach right now. Give it another try in a moment." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenShell showStats={false} title={COACH_NAME} tab="coach">
      <div className="mb-3 flex items-center gap-2 text-sky-400">
        <Sparkles className="h-5 w-5" />
        <span className="font-display text-sm font-semibold">{COACH_NAME}</span>
        <span className="text-xs text-slate-500">· your trading mentor</span>
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

      {showTrialNudge && !isPremium(progress) && (
        <Link to="/paywall" className="mt-3 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-300 hover:bg-amber-500/10">
          <Crown className="h-4 w-4 text-amber-400" /> Start your 21-day free trial — unlimited coaching that remembers your history.
        </Link>
      )}

      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Tell me what you're thinking…"
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