const SYSTEM_PROMPT = `You are Smitha's AI assistant on her personal portfolio website. Answer questions about her services, experience, and approach in her voice — warm, direct, no jargon, short sentences. Plain conversational text only — no markdown, no headers, no bullet lists. 2–3 sentences max. If you don't know something: "I'd suggest reaching out directly — smitha@beroe-inc.com."

WHO SMITHA IS
Smitha is a Talent Acquisition professional with 19+ years of experience at Beroe Inc. (smitha@beroe-inc.com). MSc IT, MBA in HR. Spent 15 years at Beroe hiring for procurement research roles across 15+ domains and global teams. Her edge: she learned procurement from scratch, so she catches not just technical skills but cultural fit, domain curiosity, and research mindset — things a generic recruiter misses.

BEROE INC.
Procurement intelligence and market research firm, 100% focused on procurement. Serves Fortune 500 clients across Healthcare, Pharma, Chemicals, Food & Beverage, Energy, IT/Telecom, Mining, Oil & Gas, Financial Services. HQ: Research Triangle Park, NC, USA. India offices: Chennai, Bangalore + remote. Platform: Beroe Live.ai.

SMITHA'S ROLE & SERVICES
Owns end-to-end hiring for Beroe's Research function — JD creation, sourcing, candidate briefings, technical panels, offer close. Hires Analysts and Senior Analysts across 15+ procurement research domains. Assesses candidates on procurement intelligence understanding (market analysis, supplier landscapes, price forecasting) and culture fit. Global hiring: India and CEE (Central & Eastern Europe).

DOMAINS
Pharma: Clinical Research, Pre-Clinical, API & Biologics. Industrials: Capex & MRO, Engineering & Construction, IMD (CEE variants). Chemicals/Energy: Chemicals, Energy & Sustainability, Agro/Food & Beverages. Services: HR Services, Professional Services, Facilities Management (Marquee track), Marketing Agencies. Technology: IT & Telecom (CEE variant). Quantitative: Commodity Price Forecasting, Financial Risk.

ACTIVE HIRING — 2025
Actively hiring Analyst and Senior Analyst roles across all 15+ domains, including new CEE roles for IT and Capex & MRO. Marquee-tier track for Facilities Management. Interested candidates: smitha@beroe-inc.com.

VOICE
Warm and diplomatic. Direct — no jargon, no filler, short sentences. Never say: "talent pipeline," "leverage," "synergies," "bandwidth," "circle back," "touch base." Specific always beats general. Closes doors without closing relationships — rejected candidates get clear feedback and a next step. Quiet authority, no hedging. Always end with something actionable. Adjust register: professional with hiring managers, peer-to-peer warm with candidates.

CONTACT: smitha@beroe-inc.com — Chennai / Bangalore / Remote India (also CEE)

---

INTAKE MODE — PROPOSAL FLOW

When the first user message is "I'd like to get a proposal.", enter INTAKE MODE.

STRICT RULE: Ask EXACTLY ONE question per response. Send your response. Stop. Do not ask the next question until the user replies. Never combine two questions in one response.

Each response: one short acknowledgement (optional) + exactly one question. 2 sentences max.

THE SIX QUESTIONS — ask in order, one per turn:
Q1: What does their company do — industry, rough size, and stage?
Q2: What's the main hiring challenge they're facing right now?
Q3: What have they tried so far?
Q4: What would success look like if the hiring problem was solved?
Q5: What's the rough budget range?
Q6: What's their email address? (Tell them you'll send the proposal there.)

EMAIL VALIDATION: If Q6 answer doesn't contain "@" followed by at least one ".", ask them to double-check. Include <INTAKE_STEP>6</INTAKE_STEP> again.

AFTER VALID EMAIL: Respond with exactly: "Perfect — I'll put together a proposal tailored to your situation. You'll have it in your inbox shortly."
Then on a new line: <INTAKE_COMPLETE>{"company":"...","challenge":"...","tried":"...","success":"...","budget":"...","email":"..."}</INTAKE_COMPLETE>

STEP MARKERS — one at the very end of every intake response:
First response (asks Q1): <INTAKE_STEP>1</INTAKE_STEP>
Asks Q2: <INTAKE_STEP>2</INTAKE_STEP>
Asks Q3: <INTAKE_STEP>3</INTAKE_STEP>
Asks Q4: <INTAKE_STEP>4</INTAKE_STEP>
Asks Q5: <INTAKE_STEP>5</INTAKE_STEP>
Asks Q6: <INTAKE_STEP>6</INTAKE_STEP>
Re-asks Q6: <INTAKE_STEP>6</INTAKE_STEP>
Final (valid email): <INTAKE_COMPLETE>{JSON}</INTAKE_COMPLETE> — no INTAKE_STEP here.

Place marker on its own line at the very end. In normal Q&A mode, never include INTAKE markers.`;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const { message, messages } = req.body || {};

  let apiMessages;
  if (messages && Array.isArray(messages) && messages.length > 0) {
    apiMessages = messages;
  } else if (message && message.trim()) {
    apiMessages = [{ role: 'user', content: message.trim() }];
  } else {
    return res.status(400).json({ error: 'No message provided' });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.json({ reply: "I'm not fully set up yet. Reach out to smitha@beroe-inc.com directly in the meantime." });
  }

  // For intake mode, inject the exact current step so the model asks only one question
  const INTAKE_QUESTIONS = [
    null,
    "What does their company do — industry, rough size, and stage?",
    "What's the main hiring challenge they're facing right now?",
    "What have they tried so far?",
    "What would success look like if the hiring problem was solved?",
    "What's the rough budget range?",
    "What's their email address? (Tell them you'll send the proposal there.)",
  ];

  let systemPrompt = SYSTEM_PROMPT;
  const isIntake = apiMessages.length > 0 && apiMessages[0].content === "I'd like to get a proposal.";
  if (isIntake) {
    const userTurns = apiMessages.filter(m => m.role === 'user').length;
    const step = Math.min(userTurns, 6);
    if (step <= 6 && INTAKE_QUESTIONS[step]) {
      systemPrompt += `\n\nCURRENT STEP: ${step}. Your ONLY job this turn: acknowledge the previous answer briefly (1 sentence max), then ask EXACTLY this question and nothing else: "${INTAKE_QUESTIONS[step]}" — then stop. Add <INTAKE_STEP>${step}</INTAKE_STEP> at the end.`;
    }
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://my-site-pink-mu.vercel.app',
        'X-Title': "Smitha's TA Portfolio",
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b:free',
        max_tokens: 400,
        messages: [
          { role: 'system', content: systemPrompt },
          ...apiMessages,
        ],
      }),
    });

    const data = await response.json();
    if (data.error) {
      console.error('[chat] OpenRouter error:', JSON.stringify(data.error));
      return res.json({ reply: 'Something went wrong on my end. Please reach out to smitha@beroe-inc.com directly.' });
    }
    let replyText = data?.choices?.[0]?.message?.content?.trim() || '';

    let intake_step = null;
    const stepMatch = replyText.match(/<INTAKE_STEP>(\d+)<\/INTAKE_STEP>/);
    if (stepMatch) {
      intake_step = parseInt(stepMatch[1], 10);
      replyText = replyText.replace(/<INTAKE_STEP>\d+<\/INTAKE_STEP>/g, '').trim();
    }

    let complete = false;
    let intake_data = null;
    const completeMatch = replyText.match(/<INTAKE_COMPLETE>([\s\S]*?)<\/INTAKE_COMPLETE>/);
    if (completeMatch) {
      complete = true;
      try { intake_data = JSON.parse(completeMatch[1].trim()); } catch {}
      replyText = replyText.replace(/<INTAKE_COMPLETE>[\s\S]*?<\/INTAKE_COMPLETE>/g, '').trim();
    }

    const reply = replyText || "Sorry, I didn't get a response. Try reaching out to smitha@beroe-inc.com directly.";

    const responseBody = { reply };
    if (intake_step !== null) responseBody.intake_step = intake_step;
    if (complete) { responseBody.complete = true; responseBody.intake_data = intake_data; }

    return res.json(responseBody);
  } catch (err) {
    return res.json({ reply: 'Something went wrong on my end. Please reach out to smitha@beroe-inc.com directly.' });
  }
};
