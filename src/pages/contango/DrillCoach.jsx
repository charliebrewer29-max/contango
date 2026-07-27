import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import ScreenShell from "@/components/contango/ScreenShell";
import { useContango } from "@/contexts/ContangoContext";
import { base44 } from "@/api/base44Client";

// Compose the drill-decision summary the agent will analyze.
function buildSummary(review) {
  if (!review) {
    return "Hi — I just finished a simulated chart drill in Contango. Can you give me general guidance on how to review my trading decisions after a drill?";
  }
  const lines = [
    `I just finished a simulated chart drill on the **${review.branchTitle}** strategy (${review.instrument}). I got ${review.correctCount}/${review.total} decisions correct.`,
    "",
    "Here are my decisions, one by one:",
  ];
  review.decisions.forEach((d, i) => {
    const chosen = d.options[d.selected] ?? "(no answer)";
    const right = d.options[d.correct];
    lines.push(`\n**Decision ${i + 1}** (around bar ${d.barIndex}):`);
    lines.push(`- The drill asked: "${d.prompt}"`);
    lines.push(`- I chose: "${chosen}" — ${d.isCorrect ? "correct." : `WRONG. The correct answer was: "${right}".`}`);
  });
  lines.push("");
  lines.push("Please analyze my mistakes and my correct reasoning, and give me constructive, specific feedback. For each wrong decision explain the likely bias/error and what to watch for; reinforce what I got right. Finish with the ONE thing I should focus on next time. Remember this is simulated/educational only — no real-market signals.");
  return lines.join("\n");
}

// In-app conversation UI for the drill_coach agent.
// Seeds the conversation with the user's last drill results so the agent can
// analyze their actual mistakes, then lets them ask follow-ups.
export default function DrillCoach() {
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
        agent_name: "drill_coach",
        metadata: { name: "Drill review" },
      });
      setConversation(conv);
      unsub = base44.agents.subscribeToConversation(conv.id, (data) => {
        setMessages(data.messages || []);
      });
      base44.agents.addMessage(conv, { role: "user", content: buildSummary(progress.lastDrillReview) });
    } catch (e) {
      setError("Couldn't start the Drill Coach session. Make sure you're logged in, then try again from a finished drill.");
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
      <ScreenShell showStats={false} title="Drill Coach" tab="coach">
        <div className="mt-12 text-center text-sm text-slate-400">{error}</div>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell showStats={false} title="Drill Coach" tab="coach">
      <div className="mb-3 flex items-center gap-2 text-emerald-400">
        <Bot className="h-5 w-5" />
        <span className="font-display text-sm font-semibold">Drill Coach</span>
        <span className="text-xs text-slate-500">· mistake review</span>
      </div>

      <div ref={scrollRef} className="flex h-[58vh] flex-col gap-3 overflow-y-auto rounded-xl border border-slate-800 bg-slate-900 p-4">
        {messages.map((m, i) => {
          const isUser = m.role === "user";
          return (
            <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${isUser ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-200"}`}>
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
              <Loader2 className="h-4 w-4 animate-spin" /> Analyzing your decisions…
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask a follow-up about your decisions…"
          className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none"
        />
        <button
          onClick={send}
          disabled={!input.trim() || awaitingReply}
          className="flex items-center justify-center rounded-xl bg-emerald-500 px-4 text-white transition hover:bg-emerald-400 disabled:opacity-40"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
      <p className="mt-2 text-center text-[11px] text-slate-600">
        Reviews simulated drills only — never real trades or personalized signals.
      </p>
    </ScreenShell>
  );
}