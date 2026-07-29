import React from "react";
import { Link, useLocation } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import ScreenShell from "@/components/contango/ScreenShell";
import { COACH_NAME } from "@/lib/contangoTheme";

// Legal & Compliance (spec 13). This is a DRAFT TEMPLATE, not legal advice.
// Have a lawyer review before public launch. Anything involving money, minors,
// or financial education should get real review.
export default function Legal() {
  const location = useLocation();
  React.useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.hash]);
  return (
    <ScreenShell showStats={false} backTo="/profile">
      <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
        <p className="text-[13px] leading-relaxed text-amber-200/90">
          This is a draft template, not legal advice. Have a qualified lawyer review it before launch. Anything involving money, minors, or financial education needs real review.
        </p>
      </div>

      <Section title="Privacy Policy" id="privacy">
        <p className="text-sm leading-relaxed text-slate-300">
          Contango is a simulated, educational futures-trading app. It does not execute real trades, hold money, or connect to any broker. This policy describes what we collect and who processes it.
        </p>
        <H>What we collect</H>
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-300">
          <li>Account email (for login and, if you enable it, daily reminders).</li>
          <li>Lesson and drill progress, XP, streaks, and your drill decision history - stored to personalize your learning and power the journal.</li>
          <li>Reflections you type to the AI coach - sent to Anthropic only if you grant AI feedback consent.</li>
        </ul>
        <H>Who processes your data</H>
        <div className="overflow-hidden rounded-xl border border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900 text-xs uppercase tracking-wider text-slate-400">
              <tr><th className="px-3 py-2 font-semibold">Processor</th><th className="px-3 py-2 font-semibold">Receives</th><th className="px-3 py-2 font-semibold">Status</th></tr>
            </thead>
            <tbody className="text-slate-300">
              <Row p="Supabase" r="Account email, progress, drill history, AI consent flag" s="Active" />
              <Row p="Anthropic" r="De-identified drill decisions and reflection text, only with consent" s="Active" />
              <Row p="RevenueCat" r="Purchase and subscription status" s="Planned" />
              <Row p="PostHog" r="Pseudonymous usage and retention events" s="Planned" />
              <Row p="AdMob" r="Advertising identifiers, subject to ATT" s="Planned" />
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500">We confirm that each processor provides equivalent protection as required by applicable law.</p>
        <H>AI feedback consent (Apple Guideline 5.1.2(i))</H>
        <p className="text-sm text-slate-300">
          The AI coach sends your drill answers, score, and reflection text to Anthropic to generate feedback. We never send your name, email, or account details. Consent is requested in-app before the first call, is stored against your account, and is checked by our server before every call. You can revoke it anytime in <Link to="/profile" className="text-sky-400 underline">Settings</Link>. If you upgrade to Premium, the coach also reads your full drill history and past notes - that broader data flow asks for fresh consent. Reports you submit with the flag icon include the {COACH_NAME} message text and your optional note, and are stored against your account.
        </p>
        <H>Account deletion</H>
        <p className="text-sm text-slate-300">
          You can delete your account and data from <Link to="/profile" className="text-sky-400 underline">Settings &gt; Account</Link>. This clears your progress and any reminders stored against your account, and signs you out.
        </p>
      </Section>

      <Section title="Terms of Service" id="terms">
        <H>Educational only</H>
        <p className="text-sm text-slate-300">
          Contango provides simulated, educational content about futures trading. It is not financial, investment, or trading advice, and nothing in the app is a recommendation or signal to buy, sell, or hold any security or contract. All price data shown in the app - including the ticker tape, charts, and drills - is simulated for educational practice and is not live market data.
        </p>
        <H>AI-generated content</H>
        <p className="text-sm text-slate-300">
          Feedback from {COACH_NAME} is generated by an AI model. It is educational commentary on simulated practice, not personalized investment advice. It may contain errors. You should not rely on it for any real trading decision. You can report any {COACH_NAME} response you believe is inaccurate, inappropriate, or which reads as personalized trading advice, using the flag icon on the response. We review reports and remove or correct content where warranted.
        </p>
        <H>Limitation of liability</H>
        <p className="text-sm text-slate-300">
          To the fullest extent permitted by law, Contango and its authors are not liable for any losses or damages arising from use of the app, including any reliance on app content or AI-generated output. Trading futures involves substantial risk and is not suitable for all investors.
        </p>
        <H>No affiliation</H>
        <p className="text-sm text-slate-300">Contango is not affiliated with, endorsed by, or sponsored by TradingView.</p>
      </Section>

      <Section title="Age">
        <p className="text-sm text-slate-300">Contango is intended for users 17 and older. You confirm you are at least 17 by using the app.</p>
      </Section>
    </ScreenShell>
  );
}

function Section({ title, children, id }) {
  return (
    <div id={id} className="mb-7 scroll-mt-24">
      <h2 className="mb-3 font-display text-lg font-semibold text-slate-100">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
function H({ children }) {
  return <h3 className="mt-2 text-sm font-semibold text-amber-300">{children}</h3>;
}
function Row({ p, r, s }) {
  return (
    <tr className="border-t border-slate-800">
      <td className="px-3 py-2 font-medium text-slate-200">{p}</td>
      <td className="px-3 py-2 text-slate-400">{r}</td>
      <td className="px-3 py-2"><span className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${s === "Active" ? "bg-emerald-500/15 text-emerald-400" : "bg-slate-700/40 text-slate-400"}`}>{s}</span></td>
    </tr>
  );
}