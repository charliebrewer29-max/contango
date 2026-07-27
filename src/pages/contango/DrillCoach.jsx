import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, ShieldCheck } from "lucide-react";
import ReactMarkdown from "react-markdown";
import ScreenShell from "@/components/contango/ScreenShell";
import AiConsentGate from "@/components/contango/AiConsentGate";
import { useContango } from "@/contexts/ContangoContext";
import { base44 } from "@/api/base44Client";
import { fetchMe, hasConsent, setConsent } from "@/lib/aiConsent";

// Compose the drill-decision summary the agent will analyze. Contains only
// de-identified drill data (no name/email/id) - identifier stripping is
// satisfied by construction.
function buildSummary(review) {
  if (!review) {
    return "Hey - I just finished a simulated chart drill in Contango. Could you walk me through how to review my trading decisions after a drill?";
  }
  const lines = [
    `I just finished a simulated chart drill on the **${review.branchTitle}** strategy (${review.instrument}). I got ${review.correctCount}/${review.total} right.`,
    "",
    "Here's what I did, one decision at a time:",
  ];
  review.decisions.forEach((d, i) => {
    const chosen = d.options[d.selected] ?? "(no answer)";
    const right = d.options[d.correct];
    lines.push(`\n**Decision ${i + 1}** (around bar ${d.barIndex}):`);
    lines.push(`- The drill asked: "${d.prompt}"`);
    lines.push(`- I picked: "${chosen}" - ${d.isCorrect ? "got it right." : `missed it. The right answer was: "${right}".`}`);
  });
  lines.push("");
  lines.push("Can you talk me through my mistakes and the parts I got right, and give me honest, specific feedback? For each one I got wrong, name the likely bias or slip-up and what to watch for; for the ones I got right, reinforce the reasoning. Then tell me the ONE thing to focus on next time. Remember this is all simulated and educational - no real-market signals.");
  return lines.join("\n");
}

// In-app conversation UI for the drill_coach agent. Gated behind AI consent
// (spec 13.1): the agent reviews the user's drill data, so consent is checked
// before the conversation is created.
export default function DrillCoach() {
  const { progress } = useContango();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState(null);
  const [consent, setConsentState] = useState("loading");
  const [consentBusy, setConsentBusy] = useState(false);
  const scrollRef = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const me = await fetchMe();
        if (!alive) return;
        setConsentState(hasConsent(me, "session") ? "ok" : "needed");
      } catch (_e) {
        if (alive) setConsentState("needed");
      }
    })();
    return () => { alive = false; };
  }, []);

  // Start the agent conversation only once consent is granted.
  useEffect(() => {
    if (consent !== "ok" || startedRef.current) return;
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
      setError("Hmm, I couldn't get the review started. Make sure you're logged in, then head back from a finished drill and try again.");
    }
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consent]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, consent]);

  const awaitingReply = messages.length > 0 && messages[messages.length - 1].role === "user";

  async function allowConsent() {
    setConsentBusy(true);
    try {
      await setConsent(true, "session");
      const me = await fetchMe();
      setConsentState(hasConsent(me, "session") ? "ok" : "needed");
    } finally { setConsentBusy(false); }
  }

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
        <span className="text-xs text-slate-500">· AI review of your drill</span>
      </div>

      {consent === "loading" && (
        <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Checking your AI settings…
        </div>
      )}

      {consent === "needed" && (
        <AiConsentGate flow="session" onAllow={allowConsent} onDecline={() => setConsentState("declined")} busy={consentBusy} />
      )}

      {consent === "declined" && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center">
          <ShieldCheck className="mx-auto mb-3 h-8 w-8 text-slate-500" />
          <p className="text-sm text-slate-300">AI drill review is off. Your drills and progress still work - this only affects the AI review.</p>
          <button onClick={() => setConsentState("needed")} className="mt-4 rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-slate-500">
            Review AI feedback settings
          </button>
        </div>
      )}

      {consent === "ok" && (
        <>
          <div ref={scrollRef} className="flex h-[52vh] flex-col gap-3 overflow-y-auto rounded-xl border border-slate-800 bg-slate-900 p-4">
            {messages.map((m, i) => {
              const isUser = m.role === "user";
              return (
                <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${isUser ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-200"}`}>
                    {isUser
                      ? <span className="whitespace-pre-wrap">{m.content}</span>
                      : <ReactMarkdown className="space-y-2 leading-relaxed">{m.content}</ReactMarkdown>}
                    {!isUser && (
                      <div className="mt-1.5 border-t border-slate-700/60 pt-1 text-[10px] text-slate-500">educational feedback on simulated practice · not investment advice</div>
                    )}
                  </div>
                </div>
              );
            })}
            {awaitingReply && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl bg-slate-800 px-4 py-3 text-sm text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin" /> Looking over your decisions…
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask me anything about your decisions…"
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
            Reviews your simulated drills only · never real trades or personalized signals. Sent to Anthropic with your consent.
          </p>
        </>
      )}
    </ScreenShell>
  );
}