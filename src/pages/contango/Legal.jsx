import React from "react";
import { Link, useLocation } from "react-router-dom";
import { AlertTriangle, Mail, MapPin, Clock } from "lucide-react";
import ScreenShell from "@/components/contango/ScreenShell";
import { COACH_NAME } from "@/lib/contangoTheme";
import { LEGAL_EFFECTIVE_DATE, LEGAL_LAST_UPDATED } from "@/lib/legalVersion";

// === Legal content constants — single source so the two dates cannot drift ===
// MUST BE FILLED BEFORE LAUNCH. Do not invent values; leave the placeholder
// until it is set. Pre-launch placeholder checklist:
//   1. LEGAL_PRIVACY_EMAIL  -> a real mailbox you monitor
//   2. LEGAL_POSTAL_ADDRESS -> must EXACTLY match the PHYSICAL_POSTAL_ADDRESS
//      backend secret used by sendDailyReminders (emails + policy must agree)
//   3. LEGAL_STATE_OF_FORMATION -> jurisdiction, set with counsel
//   4. AI-coach reflection & report retention periods (see "How long we keep")
//   5. Backup retention window (see "How long we keep")
//   6. Signed DPAs with Supabase and Anthropic before asserting equivalent
//      protection (see the comment above the transfer paragraph)
//   7. EU member-state age-threshold review if shipping in the EU (see Age)
//   8. Revisit "Do Not Sell or Share" before AdMob / ads go live (see Rights)
//   9. Dispute-resolution mechanics (counsel) — no arbitration/class waiver yet
const LEGAL_PRIVACY_EMAIL = "privacy@[YOUR-DOMAIN]";
const LEGAL_POSTAL_ADDRESS =
  "[MUST BE SET before launch — must match the PHYSICAL_POSTAL_ADDRESS backend secret]";
const LEGAL_STATE_OF_FORMATION =
  "[MUST BE SET with counsel: state of formation / governing jurisdiction]";

const TOC = [
  { id: "privacy", label: "Privacy Policy" },
  { id: "changes", label: "Changes to this policy" },
  { id: "contact", label: "Contact" },
  { id: "rights", label: "Your privacy rights" },
  { id: "retention", label: "How long we keep your data" },
  { id: "terms", label: "Terms of Service" },
  { id: "subscriptions", label: "Subscriptions" },
  { id: "governing-law", label: "Governing law & disputes" },
  { id: "age", label: "Age" },
];

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
    <ScreenShell showStats={false} backTo="/profile" title="Legal">
      {/* Draft-template banner — stays until a lawyer signs off. Do not remove. */}
      <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
        <p className="text-[13px] leading-relaxed text-amber-200/90">
          This is a draft template, not legal advice. Have a qualified lawyer review it before launch. Anything involving money, minors, or financial education needs real review.
        </p>
      </div>

      {/* Table of contents — anchor links to each section. #privacy and #terms
          are preserved because the paywall links depend on them. */}
      <nav className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Contents</p>
        <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {TOC.map((t) => (
            <li key={t.id}>
              <a href={`#${t.id}`} className="text-sm text-sky-400 hover:text-sky-300">{t.label}</a>
            </li>
          ))}
        </ul>
      </nav>

      <Section title="Privacy Policy" id="privacy">
        <p className="text-sm text-slate-500">
          Effective date: <span className="font-mono text-slate-300">{LEGAL_EFFECTIVE_DATE}</span> · Last updated: <span className="font-mono text-slate-300">{LEGAL_LAST_UPDATED}</span>
        </p>
        <p className="text-sm leading-relaxed text-slate-300">
          Contango is a simulated, educational futures-trading app. It does not execute real trades, hold money, or connect to any broker. This policy describes what we collect and who processes it.
        </p>

        <H>What we collect</H>
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-300">
          <li>Account email (for login and, if you enable it, daily reminders).</li>
          <li>Lesson and drill progress, XP, streaks, and your drill decision history — stored to personalize your learning and power the journal.</li>
          <li>Reflections you type to the AI coach — sent to Anthropic only if you grant AI feedback consent.</li>
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
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500">We may add payment (e.g. RevenueCat), analytics (e.g. PostHog), and advertising (e.g. AdMob) processors in the future. This policy will be updated before any new processor receives your data.</p>
        {/* TRANSFER ASSERTION: Do not restore the stronger "we confirm that each
            processor provides equivalent protection" wording until signed DPAs
            are actually executed with Supabase and Anthropic. The line below
            describes the obligation, not completed compliance. */}
        <p className="text-xs text-slate-500">
          We require each processor to provide appropriate safeguards for personal data transferred to them, as required by applicable law. Where data is transferred outside the EEA/UK (Anthropic and Supabase process data in the US), we rely on Standard Contractual Clauses or an equivalent transfer mechanism. This must be confirmed against the actual signed data-processing addenda before launch.
        </p>

        <H>AI feedback consent (Apple Guideline 5.1.2(i))</H>
        <p className="text-sm leading-relaxed text-slate-300">
          The AI coach sends your drill answers, score, and reflection text to Anthropic to generate feedback. We never send your name, email, or account details. Consent is requested in-app before the first call, is stored against your account, and is checked by our server before every call. You can revoke it anytime in <Link to="/profile" className="text-sky-400 underline">Settings</Link>. If you upgrade to Premium, the coach also reads your full drill history and past notes — that broader data flow asks for fresh consent. Reports you submit with the flag icon include the {COACH_NAME} message text and your optional note, and are stored against your account.
        </p>

        <H>Account deletion</H>
        <p className="text-sm leading-relaxed text-slate-300">
          You can delete your account and data from <Link to="/profile" className="text-sky-400 underline">Settings &gt; Account</Link>. This clears your progress and any reminders stored against your account, and signs you out.
        </p>
      </Section>

      <Section title="Changes to this policy" id="changes">
        <p className="text-sm leading-relaxed text-slate-300">
          If we make material changes to this policy, we will surface the change in-app before it takes effect. Continuing to use Contango after that notice constitutes acceptance of the updated policy. The "Last updated" date above will always reflect the most recent change.
        </p>
      </Section>

      <Section title="Contact" id="contact">
        <p className="text-sm leading-relaxed text-slate-300">
          You can reach us about privacy or this policy using the contact below. We aim to acknowledge and respond to privacy requests within 30 days, the standard under CCPA and GDPR.
        </p>
        <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm">
          <div className="flex items-start gap-2">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
            <span className="text-slate-300">Privacy email: <span className="font-mono text-amber-300">{LEGAL_PRIVACY_EMAIL}</span> <span className="text-xs text-rose-400">(MUST BE SET before launch)</span></span>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
            <span className="text-slate-300">Postal address: <span className="text-amber-300">{LEGAL_POSTAL_ADDRESS}</span></span>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
            <span className="text-slate-300">Response window: within 30 days</span>
          </div>
        </div>
      </Section>

      <Section title="Your privacy rights" id="rights">
        <p className="text-sm leading-relaxed text-slate-300">Depending on where you live, you may have the following rights over your personal data.</p>

        <H>For everyone</H>
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-300">
          <li><b className="text-slate-200">Access:</b> request a copy of the data we hold about you.</li>
          <li><b className="text-slate-200">Correction:</b> ask us to fix inaccurate data.</li>
          <li><b className="text-slate-200">Deletion:</b> delete your account and data in <Link to="/profile" className="text-sky-400 underline">Settings &gt; Account</Link>.</li>
          <li><b className="text-slate-200">Portability:</b> receive your data in a machine-readable format.</li>
        </ul>

        <H>For EEA / UK users (GDPR)</H>
        <p className="text-sm text-slate-300">Legal basis for each processing purpose:</p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-300">
          <li>Account email and learning progress — <b className="text-slate-200">contract performance</b> (Art. 6(1)(b)), necessary to provide the service you signed up for.</li>
          <li>AI coach reflections and drill context — <b className="text-slate-200">explicit consent</b> (Art. 6(1)(a)), revocable anytime in Settings.</li>
          <li>Daily reminder emails — <b className="text-slate-200">consent</b>; you can turn them off or unsubscribe at any time.</li>
          <li>Analytics, when PostHog goes live — <b className="text-slate-200">legitimate interest</b> (Art. 6(1)(f)); you can object as described below.</li>
        </ul>
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-300">
          <li>Right to object to processing based on legitimate interest, and to request restriction of processing.</li>
          <li>Right to withdraw consent at any time. Withdrawing consent does not affect the lawfulness of processing carried out before the withdrawal.</li>
          <li>Right to lodge a complaint with your local data-protection supervisory authority.</li>
          <li>International transfers: Anthropic and Supabase process data in the US. We rely on Standard Contractual Clauses (or an equivalent transfer mechanism). This must be confirmed against the actual signed DPAs before launch.</li>
        </ul>

        <H>For California users (CCPA / CPRA)</H>
        <p className="text-sm text-slate-300">Categories of personal information we collect, mapped to CCPA categories:</p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-300">
          <li><b className="text-slate-200">Identifiers</b> — your account email.</li>
          <li><b className="text-slate-200">Commercial information</b> — your subscription/entitlement status.</li>
          <li><b className="text-slate-200">Internet or electronic activity</b> — lesson and drill progress, AI coach reflections and decision history.</li>
          <li><b className="text-slate-200">Inferences</b> — derived learning analytics (e.g. weak-concept flags, discipline profile).</li>
        </ul>
        {/* CCPA "NOT SOLD OR SHARED": If/when AdMob (or any ads) goes live, ad
            identifiers very likely constitute "sharing" for cross-context
            behavioral advertising under CPRA. Before enabling ads, this section
            MUST be revisited and a "Do Not Sell or Share My Personal Information"
            link added. Do not re-enable ads without that review. */}
        <p className="text-sm text-slate-300">
          We do <b className="text-slate-200">not sell</b> your personal information, and we do <b className="text-slate-200">not share</b> it for cross-context behavioral advertising. You have the right to non-discrimination — we will not charge you more or provide a different level of service for exercising these rights.
        </p>

        <H>How to exercise your rights</H>
        <p className="text-sm text-slate-300">
          Email <span className="font-mono text-sky-400">{LEGAL_PRIVACY_EMAIL}</span> with your request. We may need to verify your identity before acting on it. Deletion can also be done directly and immediately in <Link to="/profile" className="text-sky-400 underline">Settings &gt; Account</Link>.
        </p>
      </Section>

      <Section title="How long we keep your data" id="retention">
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-300">
          <li><b className="text-slate-200">Account and learning progress:</b> retained while your account is active, and deleted within 30 days after you delete your account.</li>
          <li><b className="text-slate-200">AI coach reflections and reports:</b> reflections are stored as part of your Progress (with your account); submitted reports are retained for review. Exact report retention period: <span className="text-amber-300">TBD with counsel</span>.</li>
          <li><b className="text-slate-200">Reminder records:</b> deleted with your account, within 30 days.</li>
          <li><b className="text-slate-200">Backups:</b> deleted data may persist in backups until the backups roll off. Backup retention window: <span className="text-amber-300">TBD with counsel/ops</span>.</li>
        </ul>
        <p className="text-xs text-slate-500">A wrong retention period is worse than an acknowledged gap. Periods marked TBD are not yet decided and must be set before launch.</p>
      </Section>

      <Section title="Terms of Service" id="terms">
        <H>Educational only</H>
        <p className="text-sm leading-relaxed text-slate-300">
          Contango provides simulated, educational content about futures trading. It is not financial, investment, or trading advice, and nothing in the app is a recommendation or signal to buy, sell, or hold any security or contract. <b className="text-slate-200">All price data shown in the app — including the ticker tape, charts, and drills — is simulated and generated for educational practice. It is not live market data and is not historical market data.</b>
        </p>

        <H>AI-generated content</H>
        <p className="text-sm leading-relaxed text-slate-300">
          Feedback from {COACH_NAME} is generated by an AI model. It is educational commentary on simulated practice, not personalized investment advice. It may contain errors. You should not rely on it for any real trading decision. You can report any {COACH_NAME} response you believe is inaccurate, inappropriate, or which reads as personalized trading advice, using the flag icon on the response. We review reports and remove or correct content where warranted.
        </p>

        <div id="subscriptions" className="scroll-mt-24">
          <H>Subscriptions</H>
          <p className="text-sm leading-relaxed text-slate-300">
            Contango Premium is an auto-renewing subscription. A 21-day free trial is available; after the trial, the subscription renews automatically unless cancelled at least 24 hours before the end of the current period. Billing is handled through the Apple App Store (Apple IAP); Contango does not process payments directly and never sees or stores your full card details. You can manage or cancel your subscription anytime in your Apple ID settings. Refunds are handled by Apple under Apple's refund policy, not by Contango.
          </p>
        </div>

        <H>Limitation of liability</H>
        <p className="text-sm leading-relaxed text-slate-300">
          To the fullest extent permitted by law, Contango and its authors are not liable for any losses or damages arising from use of the app, including any reliance on app content or AI-generated output. Trading futures involves substantial risk and is not suitable for all investors.
        </p>

        <div id="governing-law" className="scroll-mt-24">
          <H>Governing law</H>
          <p className="text-sm leading-relaxed text-slate-300">
            These terms are governed by the laws of <span className="text-amber-300">{LEGAL_STATE_OF_FORMATION}</span>, without regard to its conflict-of-laws principles. You and Contango agree to the exclusive jurisdiction of the courts located in <span className="text-amber-300">{LEGAL_STATE_OF_FORMATION}</span> for any dispute arising out of or relating to these terms or the app.
          </p>
          <H>Disputes</H>
          {/* DISPUTE RESOLUTION: Do NOT draft binding arbitration or a class-action
              waiver here. Those are heavily state-regulated; an unenforceable
              arbitration clause is worse than none. Leave this placeholder for
              counsel to finalize (mediation / arbitration / class terms). */}
          <p className="text-sm leading-relaxed text-slate-300">
            The parties will first attempt to resolve any dispute informally. <span className="text-amber-300">[Dispute-resolution mechanics — including any mediation, arbitration, or class-action terms — to be finalized with counsel. No binding arbitration or class-action waiver is in place yet.]</span>
          </p>
          <H>Severability</H>
          <p className="text-sm leading-relaxed text-slate-300">
            If any provision of these terms is found unenforceable, the remaining provisions remain in full force and effect.
          </p>
          <H>Assignment</H>
          <p className="text-sm leading-relaxed text-slate-300">
            You may not assign or transfer these terms or your account without our consent. We may assign these terms, in whole or in part, in connection with a merger, acquisition, or sale of all or substantially all of our assets.
          </p>
        </div>

        <H>No affiliation</H>
        <p className="text-sm leading-relaxed text-slate-300">Contango is not affiliated with, endorsed by, or sponsored by TradingView.</p>
      </Section>

      <Section title="Age" id="age">
        {/* AGE THRESHOLD: 17+ matches the App Store rating tier and sits above
            the COPPA under-13 floor. GDPR sets the digital-consent age at 13–16
            depending on member state. If this app ships in the EU, review the
            threshold against the relevant member-state age and adjust both this
            section and the onboarding gate. The actual affirmative gate lives in
            onboarding (not here). */}
        <p className="text-sm leading-relaxed text-slate-300">
          Contango is intended for users 17 and older. The first time you enter, you must affirmatively confirm your age in onboarding before you begin the curriculum. If you are under 17, do not use the app.
        </p>
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