import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2, Compass } from "lucide-react";
import ReactMarkdown from "react-markdown";
import ScreenShell from "@/components/contango/ScreenShell";
import { useContango } from "@/contexts/ContangoContext";
import { base44 } from "@/api/base44Client";

// First message the user sends the agent so it can tailor guidance to them.
function buildOpener(progress) {
  const whyMap = {
    curiosity: "curiosity - just learning how futures work",
    considering: "considering trading with real capital someday",
    "already-trade": "already trading and filling knowledge gaps",
  };
  const parts = ["I'm brand new here and setting up my learning journey in Contango."];
  if (progress.why) parts.push(`Why I'm here: ${whyMap[progress.why] || progress.why}.`);
  if (progress.dailyGoal) parts.push(`My daily XP goal: ${progress.dailyGoal}.`);
  parts.push(`So far: ${progress.xp || 0} XP, a ${progress.streak || 0}-day streak, ${(progress.completedLessons || []).length} lessons done.`);
  parts.push("Can you help me get oriented and point me to exactly where I should start? Keep it short and concrete.");
  return parts.join(" ");
}

// In-app conversation UI for the onboarding_guide agent.
export default function OnboardingGuide() {
  const { progress } = useContango();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    let unsub = () => {};
    try {
      const conv = base44.agents.createConversation({
        agent_name: "onboarding_guide",
        metadata: { name: "Onboarding guide" },
      });
      setConversation(conv);
      unsub = base44.agents.subscribeToConversation(conv.id, (data) => {
        setMessages(data.messages || []);
      });
      base44.agents.addMessage(conv, { role: "user", content: buildOpener(progress) });
    } catch (e) {
      setError("Hmm, I couldn't get the guide started. Make sure you're logged in, then give it another try.");
    }
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const awaitingReply = messages.length > 0 && messages[messages.length - 1].role === "user";

  function send() {
    if (!input.trim() || !conversation || awaitingReply) return;
    base44.agents.addMessage(conversation, { role: "user", content: input.trim() });
    setInput("");
  }

  if (error) {
    return (
      <ScreenShell showStats={false} title="Onboarding Guide" tab="learn">
        <div className="mt-12 text-center text-sm text-slate-400">{error}</div>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell showStats={false} title="Onboarding Guide" tab="learn">
      <div className="mb-3 flex items-center gap-2 text-amber-400">
        <Compass className="h-5 w-5" />
        <span className="font-display text-sm font-semibold">Onboarding Guide</span>
        <span className="text-xs text-slate-500">· let's find your starting point</span>
      </div>

      <div ref={scrollRef} className="flex h-[58vh] flex-col gap-3 overflow-y-auto rounded-xl border border-slate-800 bg-slate-900 p-4">
        {messages.map((m, i) => {
          const isUser = m.role === "user";
          return (
            <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${isUser ? "bg-amber-400 text-slate-950" : "bg-slate-800 text-slate-200"}`}>
                {isUser
                  ? <span className="whitespace-pre-wrap">{m.content}</span>
                  : <ReactMarkdown className="space-y-2 leading-relaxed">{m.content}</ReactMarkdown>}
              </div>
            </div>
          );
        })}
        {awaitingReply && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl bg-slate-800 px-4 py-3 text-sm text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" /> Let me think…
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask me where to start, or what a term means…"
          className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-amber-400 focus:outline-none"
        />
        <button
          onClick={send}
          disabled={!input.trim() || awaitingReply}
          className="flex items-center justify-center rounded-xl bg-amber-400 px-4 text-slate-950 transition hover:bg-amber-300 disabled:opacity-40"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
      <p className="mt-2 text-center text-[11px] text-slate-600">
        Simulated education only - never real trades or personalized signals.
      </p>
    </ScreenShell>
  );
}