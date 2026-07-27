import React, { useState, useRef, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Send, Sparkles, Loader2, Crown, ShieldCheck } from "lucide-react";
import ScreenShell from "@/components/contango/ScreenShell";
import AiConsentGate from "@/components/contango/AiConsentGate";
import { useContango } from "@/contexts/ContangoContext";
import { COACH_NAME } from "@/lib/contangoTheme";
import { coachCallsRemaining, isPremium } from "@/lib/subscription";
import { findBranch } from "@/lib/content";
import { base44 } from "@/api/base44Client";
import { fetchMe, hasConsent, setConsent } from "@/lib/aiConsent";

// AI Coach. Routed through the aiCoachFeedback backend function (spec 13.1):
// consent is checked server-side, identifiers are stripped, output is guardrailed.
// The client never calls the LLM directly.
export default function Coach() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { progress, recordCoachCall, pushCoachMemory } = useContango();
  const branchId = params.get("branch");
  const branch = branchId ? findBranch(branchId) : null;
  const flow = isPremium(progress) ? "history" : "session";

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTrialNudge, setShowTrialNudge] = useState(false);
  const [consent, setConsentState] = useState("loading"); // loading | needed | ok | declined
  const [consentBusy, setConsentBusy] = useState(false);
  const scrollRef = useRef(null);

  const welcome = branch
    ? `Nice work on the ${branch.branchTitle} drill. Take a breath and walk me through it - what were you watching for, and what would you do differently next time?`
    : `Hey, I'm ${COACH_NAME}. Tell me about a setup you're working through, or ask me to explain something a different way - I'm here to help you think it through.`;

  useEffect(() => {
    setMessages([{ role: "coach", text: welcome }]);
  }, [branchId]);

  // Check server-side consent on mount (and when flow changes, e.g. trial -> premium).
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const me = await fetchMe();
        if (!alive) return;
        setConsentState(hasConsent(me, flow) ? "ok" : "needed");
      } catch (_e) {
        if (alive) setConsentState("needed");
      }
    })();
    return () => { alive = false; };
  }, [flow]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading, consent]);

  async function allowConsent() {
    setConsentBusy(true);
    try {
      await setConsent(true, flow);
      const me = await fetchMe();
      setConsentState(hasConsent(me, flow) ? "ok" : "needed");
    } finally { setConsentBusy(false); }
  }

  async function send() {
    if (!input.trim() || loading) return;
    if (coachCallsRemaining(progress) <= 0) {
      setMessages(m => [...m, { role: "coach", text: "That's your free coach calls used up for today - start your trial for unlimited, memory-backed coaching." }]);
      setShowTrialNudge(true);
      return;
    }
    const userText = input.trim();
    setInput("");
    const newMessages = [...messages, { role: "user", text: userText }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const last = progress.lastDrillReview;
      const drillLog = last ? (last.decisions || []).map(d => ({
        prompt: d.prompt,
        selected: d.options?.[d.selected] ?? "",
        correct: d.options?.[d.correct] ?? "",
        isCorrect: !!d.isCorrect,
      })) : [];
      const score = last ? `${last.correctCount}/${last.total}` : "";
      const instrument = last?.instrument || (branch?.branchTitle) || "";
      const payload = {
        flow,
        drillLog,
        score,
        instrument,
        reflection: userText,
        conversation: newMessages.map(m => ({ role: m.role, text: m.text })),
      };
      if (flow === "history") {
        payload.memory = progress.coachMemory || [];
        payload.drillHistory = progress.drillHistory || [];
      }
      const res = await base44.functions.invoke("aiCoachFeedback", payload);
      const data = res.data || {};
      if (data.status === "consent_required") {
        setConsentState("needed");
        setMessages(m => [...m, { role: "coach", text: "Before we continue, I need your OK to send your drill data to the AI coach. Review the prompt below." }]);
        return;
      }
      if (data.status === "error") throw new Error(data.error || "Coach error");
      const reply = data.feedback;
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
        <span className="text-xs text-slate-500">· AI coach · your trading mentor</span>
      </div>

      {consent === "loading" && (
        <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Checking your AI settings…
        </div>
      )}

      {consent === "needed" && (
        <AiConsentGate flow={flow} onAllow={allowConsent} onDecline={() => setConsentState("declined")} busy={consentBusy} />
      )}

      {consent === "declined" && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center">
          <ShieldCheck className="mx-auto mb-3 h-8 w-8 text-slate-500" />
          <p className="text-sm text-slate-300">AI coach is off. Everything else in Contango still works.</p>
          <button onClick={() => setConsentState("needed")} className="mt-4 rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-slate-500">
            Review AI feedback settings
          </button>
        </div>
      )}

      {consent === "ok" && (
        <>
          <div ref={scrollRef} className="flex h-[50vh] flex-col gap-3 overflow-y-auto rounded-xl border border-slate-800 bg-slate-900 p-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${m.role === "user" ? "bg-sky-500 text-white" : "bg-slate-800 text-slate-200"}`}>
                  {m.text}
                  {m.role === "coach" && i > 0 && (
                    <div className="mt-1.5 border-t border-slate-700/60 pt-1 text-[10px] text-slate-500">educational feedback on simulated practice · not investment advice</div>
                  )}
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
              <Crown className="h-4 w-4 text-amber-400" /> Start your 21-day free trial - unlimited coaching that remembers your history.
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
            Educational feedback on simulated practice · not investment advice. Sent to Anthropic with your consent.
          </p>
        </>
      )}
    </ScreenShell>
  );
}