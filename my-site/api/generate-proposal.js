const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

// ── PDF text sanitizer ──────────────────────────────────────────────────────
// pdf-lib standard fonts only support WinAnsi encoding (basic ASCII).
// AI-generated text WILL contain characters that crash PDF rendering.
// This function MUST run on ALL text before any drawText() call.

function sanitizeForPdf(text) {
  if (!text) return '';
  return text
    // Currency symbols → text equivalents
    .replace(/₹/g, 'INR ')
    .replace(/€/g, 'EUR ')
    .replace(/£/g, 'GBP ')
    // Dashes → hyphen
    .replace(/[\u2013\u2014\u2015]/g, '-')
    // Curly quotes → straight quotes
    .replace(/[\u2018\u2019\u201A]/g, "'")
    .replace(/[\u201C\u201D\u201E]/g, '"')
    .replace(/[\u2039\u203A]/g, "'")
    .replace(/[\u00AB\u00BB]/g, '"')
    // Ellipsis → three dots
    .replace(/\u2026/g, '...')
    // Special spaces → regular space
    .replace(/[\u00A0\u2002\u2003\u2007\u202F]/g, ' ')
    // Bullets and symbols → ASCII equivalents
    .replace(/[\u2022\u2023\u25E6\u2043]/g, '-')
    .replace(/\u2713/g, '[x]')
    .replace(/\u2717/g, '[ ]')
    .replace(/\u00D7/g, 'x')
    .replace(/\u2192/g, '->')
    .replace(/\u2190/g, '<-')
    .replace(/\u2264/g, '<=')
    .replace(/\u2265/g, '>=')
    // Catch-all: remove anything outside printable ASCII + newlines/tabs
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, '');
}

// ── Tool implementations ────────────────────────────────────────────────────

let proposalPdfBase64 = null; // Stored in memory for the email attachment step

async function renderProposalPdf({ company_name, contact_name, sections }) {
  // Sanitize ALL text before rendering
  company_name = sanitizeForPdf(company_name);
  contact_name = sanitizeForPdf(contact_name);
  sections = sections.map(s => ({
    heading: sanitizeForPdf(s.heading),
    body: sanitizeForPdf(s.body),
  }));

  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const brandPrimary = rgb(0.11, 0.26, 0.20);   // forest #1B4332
  const brandAccent  = rgb(0.75, 0.49, 0.16);   // gold #C07D2A
  const black        = rgb(0.10, 0.09, 0.06);   // ink #19160F
  const gray         = rgb(0.48, 0.44, 0.38);   // muted #7A6F61

  // ── Cover page ──
  const cover = pdf.addPage([612, 792]);
  // Header bar
  cover.drawRectangle({ x: 0, y: 692, width: 612, height: 100, color: brandPrimary });
  cover.drawText('Smitha', {
    x: 50, y: 732, size: 22, font: fontBold, color: rgb(1, 1, 1),
  });
  cover.drawText('Specialist TA for Procurement Research', {
    x: 50, y: 710, size: 12, font, color: rgb(0.8, 0.8, 0.8),
  });
  // Proposal title
  cover.drawText('PROPOSAL', {
    x: 50, y: 600, size: 36, font: fontBold, color: brandPrimary,
  });
  cover.drawText(`Prepared for ${contact_name}`, {
    x: 50, y: 565, size: 16, font, color: black,
  });
  cover.drawText(company_name, {
    x: 50, y: 542, size: 14, font, color: gray,
  });
  cover.drawText(
    new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
    { x: 50, y: 510, size: 12, font, color: gray }
  );

  // ── Content pages ──
  let y = 720;
  let page = pdf.addPage([612, 792]);
  const maxWidth = 500;

  // Helper: draw a line of text, adding a new page if needed
  function drawLine(text, options) {
    if (y < 60) { page = pdf.addPage([612, 792]); y = 720; }
    page.drawText(text, { x: 50, y, ...options });
    y -= options.lineHeight || 18;
  }

  for (const section of sections) {
    if (y < 120) {
      page = pdf.addPage([612, 792]);
      y = 720;
    }

    // Section heading with accent line above
    page.drawLine({
      start: { x: 50, y: y + 20 }, end: { x: 120, y: y + 20 },
      thickness: 2, color: brandAccent,
    });
    drawLine(section.heading, { size: 16, font: fontBold, color: brandPrimary, lineHeight: 28 });

    // Section body — split on newlines first, then word-wrap each paragraph
    const paragraphs = section.body.split('\n');
    for (const paragraph of paragraphs) {
      if (paragraph.trim() === '') {
        y -= 10; // blank line spacing
        continue;
      }
      const words = paragraph.split(' ');
      let line = '';
      for (const word of words) {
        const testLine = line ? `${line} ${word}` : word;
        const width = font.widthOfTextAtSize(testLine, 11);
        if (width > maxWidth && line) {
          drawLine(line, { size: 11, font, color: black });
          line = word;
        } else {
          line = testLine;
        }
      }
      if (line) {
        drawLine(line, { size: 11, font, color: black });
      }
    }
    y -= 20; // space between sections
  }

  // ── Footer on last page ──
  const lastPage = pdf.getPages()[pdf.getPageCount() - 1];
  lastPage.drawText('smitha@beroe-inc.com  |  Chennai / Bangalore / Remote India', {
    x: 50, y: 30, size: 9, font, color: gray,
  });

  const pdfBytes = await pdf.save();
  proposalPdfBase64 = Buffer.from(pdfBytes).toString('base64');
  return { success: true, pages: pdf.getPageCount(), size_kb: Math.round(pdfBytes.length / 1024) };
}

async function sendEmail({ to, subject, body, attach_pdf }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { success: false, error: 'RESEND_API_KEY not configured' };

  // Resend free tier can only deliver to the account owner's verified email.
  // Route all emails to Gmail until a custom domain is verified on Resend.
  const deliverTo = 'ssmithambahr@gmail.com';
  const payload = {
    from: 'Smitha <onboarding@resend.dev>',
    to: deliverTo,
    subject: to !== deliverTo ? `[For ${to}] ${subject}` : subject,
    text: to !== deliverTo ? `--- Intended for: ${to} ---\n\n${body}` : body,
  };

  if (attach_pdf && proposalPdfBase64) {
    payload.attachments = [{
      filename: 'proposal.pdf',
      content: proposalPdfBase64,
    }];
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Resend error:', err);
    return { success: false, error: `Resend API error: ${res.status}` };
  }

  const data = await res.json();
  return { success: true, email_id: data.id };
}

async function storeLead(leadData) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;
  if (!url || !key) return { success: false, error: 'Supabase not configured' };

  // Fields match the leads table schema:
  // name, company, email, industry, challenge, budget, score, status
  // conversation_transcript and created_at are handled separately
  const row = {
    name: leadData.name || null,
    company: leadData.company || null,
    email: leadData.email || null,
    industry: leadData.industry || null,
    challenge: leadData.challenge || null,
    budget: leadData.budget || null,
    score: leadData.score || null,
    status: leadData.status || 'proposal_sent',
  };

  const res = await fetch(`${url}/rest/v1/leads`, {
    method: 'POST',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify(row),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Supabase error:', err);
    return { success: false, error: `Supabase error: ${res.status}` };
  }

  return { success: true };
}

async function alertOwner({ message }) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_USER_ID;
  if (!botToken || !chatId) return { success: false, error: 'Telegram not configured' };

  // Send text alert
  const textRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: message }),
  });

  if (!textRes.ok) {
    const err = await textRes.text();
    console.error('Telegram error:', err);
    return { success: false, error: `Telegram error: ${textRes.status}` };
  }

  // Send proposal PDF if available
  if (proposalPdfBase64) {
    const pdfBuffer = Buffer.from(proposalPdfBase64, 'base64');
    const formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('document', new Blob([pdfBuffer], { type: 'application/pdf' }), 'proposal.pdf');
    formData.append('caption', 'Proposal PDF attached');

    await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
      method: 'POST',
      body: formData,
    });
  }

  return { success: true };
}

// ── Proposal generation system prompt ──────────────────────────────────────

const PROPOSAL_SYSTEM_PROMPT = `You are writing a proposal on behalf of Smitha, a Talent Acquisition specialist with 19+ years of experience at Beroe Inc.

Voice: Warm, direct, no jargon. Short sentences. Never use: "leverage," "synergies," "bandwidth," "circle back," "touch base." Specific beats general.

SERVICES & PRICING:
- End-to-End Hiring Partnership: 12-15% of first-year CTC per placed hire, or fixed monthly retainer for volume hiring
- JD Design & Audit: INR 15,000-40,000 per JD batch
- TA Advisory: INR 50,000-1,50,000 depending on scope
Domains: Pharma/Life Sciences, Industrials (Capex & MRO, Engineering, IMD), Chemicals & Energy, Services (FM, Professional Services, HR, Marketing), IT & Telecom, Quantitative (Price Forecasting, Financial Risk). India + CEE.

LEAD SCORE — HIGH if: procurement research/intelligence company, needs Analyst/Senior Analyst in Smitha's domains, 2+ roles or generalist agency already failed, India/CEE, budget INR 6-25L CTC. MEDIUM if 1-2 criteria missing. LOW if: job seeker, non-procurement company, <20 people, role mismatch, geography mismatch.

OUTPUT — respond with ONLY valid JSON (no markdown, no extra text):
{
  "company_name": "extracted company name",
  "contact_name": "contact name or 'Hiring Manager'",
  "lead_score": "HIGH|MEDIUM|LOW",
  "score_reason": "one sentence why",
  "email_body": "2-3 sentence warm covering note",
  "alert_message": "New lead: [Company] | Score: [X] | [Challenge in one sentence] | Contact: [email]",
  "sections": [
    {"heading": "What I Heard", "body": "..."},
    {"heading": "Where I Can Help", "body": "..."},
    {"heading": "How I Work", "body": "..."},
    {"heading": "Investment", "body": "..."},
    {"heading": "Next Step", "body": "..."}
  ]
}`;

// ── Main handler ────────────────────────────────────────────────────────────

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { conversation, intakeData } = req.body;
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'OPENROUTER_API_KEY not configured' });

  if (!conversation && !intakeData) {
    return res.status(400).json({ error: 'conversation or intakeData required' });
  }

  proposalPdfBase64 = null;

  const intakeContext = intakeData
    ? `VISITOR INTAKE DATA:\n${JSON.stringify(intakeData, null, 2)}`
    : `CONVERSATION TRANSCRIPT:\n${conversation.map(m => `${m.role}: ${m.content}`).join('\n')}`;

  // Single LLM call — returns JSON with proposal + score + email text
  console.log('Calling LLM for proposal...');
  const llmRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': req.headers?.host ? `https://${req.headers.host}` : 'http://localhost:3000',
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-120b:free',
      max_tokens: 1200,
      messages: [
        { role: 'system', content: PROPOSAL_SYSTEM_PROMPT },
        { role: 'user', content: intakeContext },
      ],
    }),
  });

  let llmData = await llmRes.json();

  if (llmData.error?.code === 429) {
    console.log('Rate limited, retrying in 2s...');
    await new Promise(r => setTimeout(r, 2000));
    const retry = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': req.headers?.host ? `https://${req.headers.host}` : 'http://localhost:3000',
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b:free',
        max_tokens: 1200,
        messages: [
          { role: 'system', content: PROPOSAL_SYSTEM_PROMPT },
          { role: 'user', content: intakeContext },
        ],
      }),
    });
    llmData = await retry.json();
  }

  if (llmData.error) {
    console.error('LLM error:', JSON.stringify(llmData.error));
    return res.status(200).json({ error: 'LLM call failed', details: JSON.stringify(llmData.error) });
  }

  let proposal;
  try {
    const raw = llmData.choices?.[0]?.message?.content?.trim() || '';
    // Strip markdown code fences if model wraps the JSON
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    proposal = JSON.parse(cleaned);
  } catch (e) {
    console.error('Failed to parse LLM JSON:', e.message);
    return res.status(200).json({ error: 'Failed to parse proposal from LLM' });
  }

  console.log(`Lead score: ${proposal.lead_score} — ${proposal.score_reason}`);

  const results = { proposal: false, email: false, alerted: false };

  // 1. Render PDF
  const pdfResult = await renderProposalPdf({
    company_name: proposal.company_name,
    contact_name: proposal.contact_name,
    sections: proposal.sections,
  });
  results.proposal = pdfResult.success;
  console.log('PDF:', pdfResult.success ? 'ok' : pdfResult.error);

  // 2. Send email
  const recipientEmail = intakeData?.email
    || (conversation && conversation.findLast?.(m => m.role === 'user')?.content)
    || 'unknown';
  const emailResult = await sendEmail({
    to: recipientEmail,
    subject: 'Your proposal from Smitha',
    body: proposal.email_body,
    pdf_base64: proposalPdfBase64,
  });
  results.email = emailResult.success;
  console.log('Email:', emailResult.success ? 'ok' : emailResult.error);

  // 3. Telegram alert
  const alertResult = await alertOwner({ message: proposal.alert_message });
  results.alerted = alertResult.success;
  console.log('Telegram:', alertResult.success ? 'ok' : alertResult.error);

  // 4. Store lead (Supabase — optional)
  if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
    const storeResult = await storeLead({
      company: proposal.company_name,
      email: recipientEmail,
      challenge: intakeData?.challenge || '',
      budget: intakeData?.budget || '',
      score: proposal.lead_score,
    });
    results.stored = storeResult.success;
    console.log('Supabase:', storeResult.success ? 'ok' : storeResult.error);
  }

  console.log('Pipeline complete:', results);
  return res.json({ success: true, results });
};
