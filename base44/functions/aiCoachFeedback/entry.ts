import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// aiCoachFeedback - proxy between the app and the LLM (spec 13.1, 13.4).
// The app never calls the model directly. Consent is checked server-side,
// identifiers are stripped before the call, and the output is guardrailed.

const CONSENT_VERSIONS = { session: 'v1-session', history: 'v2-history' };

const SYSTEM_PROMPT = "You're Tango, a trading-education mentor inside Contango - a SIMULATED, educational app. You are coaching a learner through a simulated drill, NOT reviewing real trades.\n\nHard rules:\n- This is educational simulation only. Never produce real-market buy/sell language, personalized trade signals, real-money position sizing, or financial advice.\n- Never reference real current market conditions, live prices, or specific tickers as if they are tradeable right now.\n- Keep feedback to generic strategy education on simulated data. Do not tell the learner to place any real trade.\n\nTone: warm, plain-spoken mentor, specific to what the learner actually said. Keep it to 3-5 sentences.";

const CANNED_FALLBACK = "Here's the honest read: focus on the process, not any single outcome. In a simulated drill the goal is to spot the setup, respect your stop, and keep size boring. Run the next one and watch for the one bias that tripped you up - that's the whole game. (This is educational feedback on simulated practice, not investment advice.)";

const FORBIDDEN = [
  /\b(you should|i recommend|i suggest you|my recommendation is)\b[^.]{0,60}\b(buy|sell|long|short|enter|exit|trade|position)\b/i,
  /\b(buy|sell|go long|go short|enter (a |the )?(long|short|position)|open (a |the )?(long|short|position))\b/i,
  /\b(place (a |the )?(trade|order|stop|limit))\b/i,
  /\b(real market|live market|live price|current price of|today'?s market|right now in the market)\b/i,
  /\b(personalized investment advice|tailored (investment|trading) advice)\b/i,
];

function guardrailFail(text) {
  return FORBIDDEN.some((re) => re.test(text || ''));
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ status: 'error', error: 'Unauthorized' }, { status: 401 });

    let body = {};
    try { body = await req.json(); } catch (_e) { body = {}; }
    const flow = body.flow === 'history' ? 'history' : 'session';
    const requiredVersion = CONSENT_VERSIONS[flow];

    // Server-side consent enforcement. Re-read the stored flag, never trust a
    // client claim. A version mismatch (data flow changed) => re-prompt.
    const consent = (user && user.aiCoachConsent) || {};
    if (!consent.granted || consent.version !== requiredVersion) {
      return Response.json({ status: 'consent_required', requiredVersion, flow });
    }

    // Strip identifiers: use ONLY these de-identified fields.
    const drillLog = Array.isArray(body.drillLog) ? body.drillLog.slice(0, 50) : [];
    const score = typeof body.score === 'string' ? body.score.slice(0, 20) : '';
    const instrument = typeof body.instrument === 'string' ? body.instrument.slice(0, 40) : '';
    const reflection = typeof body.reflection === 'string' ? body.reflection.slice(0, 4000) : '';
    const conversation = Array.isArray(body.conversation) ? body.conversation.slice(-20) : [];
    const memory = flow === 'history' && Array.isArray(body.memory) ? body.memory.slice(-8) : [];
    const drillHistory = flow === 'history' && Array.isArray(body.drillHistory) ? body.drillHistory.slice(-10) : [];

    const convoText = conversation
      .map((m) => (m.role === 'user' ? 'Learner' : 'Tango') + ': ' + String(m.text || '').slice(0, 2000))
      .join('\n');

    let memoryBlock = '';
    if (flow === 'history') {
      const mem = memory.map((m) => 'Learner asked: "' + String(m.q || '').slice(0, 500) + '" -> You said: "' + String(m.a || '').slice(0, 800) + '"').join('\n');
      const dh = drillHistory.map((d) => d.branchTitle + ' (' + d.instrument + '): ' + d.correctCount + '/' + d.total + ' correct').join('\n');
      memoryBlock = '\nWhat you remember about this learner (be concrete, this is your moat):\n' + (mem || '(no prior notes yet)') + '\nRecent drill results:\n' + (dh || '(no drills yet)') + '\n';
    }

    let drillBlock = '';
    if (drillLog.length) {
      drillBlock = '\nDrill decisions:\n' + drillLog.map(function (d, i) {
        return 'Decision ' + (i + 1) + ': asked "' + String(d.prompt || '').slice(0, 300) + '" - picked "' + String(d.selected || '') + '" - ' + (d.isCorrect ? 'right' : 'wrong (right answer: "' + String(d.correct || '') + '")');
      }).join('\n') + '\n';
    }

    const prompt = SYSTEM_PROMPT + '\n\nContext: simulated educational drill' + (instrument ? ' on ' + instrument : '') + '. Score: ' + score + '.' + drillBlock + memoryBlock + '\nConversation so far:\n' + (convoText || '(just starting)') + '\n\nLearner\'s reflection / latest message: ' + (reflection || '(no reflection text yet)') + '\n\nRespond as Tango:';

    const res = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt });
    const reply = typeof res === 'string' ? res : (res && (res.text || res.response)) || (res ? JSON.stringify(res) : '');

    if (!reply || guardrailFail(reply)) {
      return Response.json({ status: 'ok', feedback: CANNED_FALLBACK, guardrailed: true });
    }
    return Response.json({ status: 'ok', feedback: reply, guardrailed: false });
  } catch (error) {
    return Response.json({ status: 'error', error: String((error && error.message) || error) }, { status: 500 });
  }
}