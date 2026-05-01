# Day 2 — Session 1: Brand, Design & The Chatbot

**Duration:** Pre-Lunch (10:00 AM – 1:30 PM IST) | **You end this session with a chatbot answering in your voice, running locally**

---

## What You Need From Day 1

Today's build runs on everything you built yesterday. Here's a quick check:

| Day 1 Artifact                  | Where it is                                 | Day 2 uses it for                                                                          |
| ------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **CLAUDE.md**                   | Root of your project                        | Chatbot system prompt — answers visitors using your context                                |
| **"What I Offer" section**      | Inside CLAUDE.md                            | Chatbot explains your services. Proposals scope recommendations.                           |
| **Voice fingerprint**           | CLAUDE.md "My Writing Voice" section        | Chatbot speaks like you. Proposals written like you. Emails sound like you.                |
| **Telegram bot token**          | From Day 1 setup                            | Lead alerts — your phone buzzes when visitors request proposals                            |

### Quick verification (5 min)

Run through this before we start:

```
Read my CLAUDE.md. Confirm you can see:
1. Who I am and what I do
2. My "What I Offer" section (services, expertise, typical clients)
3. My "Writing Voice" section (tone, patterns, quirks)
4. My key people, priorities, and projects

Tell me if anything is missing or too thin for building a website and chatbot today.
```

If something's missing, spend 5 minutes enriching it now. It's easier to add context now than to debug a generic-sounding chatbot later.

---

## Verify the Frontend Design Skill

Today's build generates production-quality HTML. The `frontend-design` skill gives Claude the design knowledge to produce polished, professional layouts. You installed it during Day 1 — let's verify it's active.

Run:

```
/frontend-design
```

Then ask Claude:

```
Confirm you have the frontend-design skill loaded
```

If Claude confirms the skill is active, you're set. Move on to Getting Started.

> **Didn't install it on Day 1?** Follow these steps:
>
> 1. Run: `/plugin marketplace add anthropics/claude-code`
> 2. Run: `/plugin install frontend-design@anthropics-claude-code`
> 3. Exit Claude (`/exit`) and restart (`claude`) — the skill loads on startup
> 4. Run `/frontend-design` and verify it's active
>
> If it still won't load, skip it — your site will work fine, just with less design polish.

---

## Getting Started

Open your terminal, clone the Day 2 repo, and go inside it:

```bash
cd ~/thecrux-bootcamp
git clone https://github.com/thecrux-ai/ccfl-8-day-2
cd ccfl-8-day-2
```

Copy your CLAUDE.md from Day 1 — it's the foundation for everything today:

```bash
cp ~/thecrux-bootcamp/ccfl-8-day-1/CLAUDE.md .
```

Start Claude:

```bash
claude
```

> **Note:** The `my-site/` subfolder doesn't exist yet — Claude will create it during Step 1 when you build your website.

---

## Kickoff (10:00–10:15 AM IST)

Yesterday you built your CLAUDE.md — your identity, voice, services, and connected it all to your phone. Today you put it to work on a real project.

**The brief:** Build a branded website that works as your AI sales agent. A visitor finds your site, chats with an AI that sounds like you, describes what they need, and receives a personalized proposal in their inbox — all without you lifting a finger. Your phone buzzes with a lead alert. You review the proposal. You approve it. The visitor gets it. That's what we're shipping today.

Make sure you have your `TELEGRAM_BOT_TOKEN` and `TELEGRAM_USER_ID` from Day 1 handy — you'll need them in Step 3 for lead alerts.

---

## Step 1: Brand & Design (90 min)

**What you're building:** Your branded website — professional, polished, ready to deploy.

**Day 1 artifact used:** CLAUDE.md (identity + offerings + voice)

### 1A: The Brief (10 min)

Tell Claude what you're building. Be specific — the more context, the better the output.

```
I want to build a professional branded website for my practice/business.
Read my CLAUDE.md for who I am, what I offer, and my voice.

Based on this, create a brief for my website:
- What the hero section should say (in MY voice, not a template)
- What services/offerings to highlight (from my "What I Offer" section)
- What makes me different (from my CLAUDE.md)
- What the CTA should be
- Who the target visitor is

Don't write the copy yet — just the brief. I want to review before we generate.
```

Review the brief. Adjust anything that feels off. This is the blueprint for everything.

### 1B: Two Copy Variations (15 min)

Now generate two different copywriting angles — in parallel. Same brief, different approaches.

```
Based on the brief we just created, generate TWO complete copy variations
for my website. Each should be a full set of copy (hero, about, services,
testimonials placeholders, CTA, contact).

Variation A: Lead with my story — personal, founder-narrative angle.
Why I do this work. Make it feel human.

Variation B: Lead with the outcome — ROI-driven, results-focused.
What the client gets. Make it feel sharp and credible.

Both must be written in MY voice — reference my CLAUDE.md and voice DNA.
Both should use real details from my "What I Offer" section.

Write both to separate files:
- copy-variation-a.md
- copy-variation-b.md
```

Read both. You'll use the stronger one — or cherry-pick the best elements from each.

### 1C: Design Your Site (20 min)

Now build the actual website. Instead of picking a style yourself, let Claude read your context and propose a design direction that fits **who you are**.

```
Read my CLAUDE.md — my identity, industry, voice, the kind of clients I
work with. Read the copy variations you just wrote.

Based on all of this, propose a design direction that would resonate with
my target audience and reflect my brand personality. Explain it in 2-3
sentences — what it looks like, what it feels like, and why it fits me.
Don't build yet — just propose.
```

Review the direction. Adjust if something feels off. Then pick **one** of the two paths below to build.

**Path A — Let the frontend-design skill drive the look.** Faster. Claude picks fonts, color, and rhythm based on its trained taste plus your CLAUDE.md. Good when you don't have a design system written down yet.

```
Build it. Use [Copy A / Copy B / the best of both].

Apply frontend-design skill standards to all HTML output: strong visual
hierarchy, professional typography, purposeful whitespace, smooth hover
states on CTAs, production-grade polish.

The site must be:
- Single page, responsive, mobile-friendly
- HTML + CSS + JS, no framework
- Professional typography and spacing
- Include: hero, about, services, testimonials, CTA, contact form

Save as my-site/index.html with styles.css in the same directory.
```

**Path B — Hand Claude a `design.md` and make it the source of truth.** Slower setup, much more consistent output. Good when you've already nailed an aesthetic and want every page to look like it came from the same studio. See `what-is-design-md.md` for the format.

Before you run the prompt, create your own `design.md` in the project root. Use a tool like [getdesign.md](https://getdesign.md), [designmd.app](https://designmd.app/en/), or [designmd.ai](https://designmd.ai) — paste a URL whose look you want to copy (Vercel, Stripe, Linear, your favorite landing page) and it spits out a structured design.md you can paste in.

Save as `design.md` in the project root, then run:

```
Build it. Use [Copy A / Copy B / the best of both].

Use design.md as the production source of truth for every visual decision:
fonts, color tokens, spacing scale, type scale, component specs, motion
rules, and anti-defaults. If a value is not in design.md, pick from it or
update design.md. Do not invent new tokens inline.

The site must be:
- Single page, responsive, mobile-friendly
- HTML + CSS + JS, no framework
- All CSS values map back to tokens in design.md
- Include: hero, about, services, testimonials, CTA, contact form

Save as my-site/index.html with styles.css in the same directory.
```

Open it in your browser: `open my-site/index.html`

### 1D: Logo Generation (15 min)

```
Generate one SVG logo for my brand. Pick the form that fits my brand best
(mark + wordmark, or typographic-only) and explain why in one line.

Must work on dark and light backgrounds.
Use colors that match my final website design.

Save as my-site/logo.svg.

Also create logos-showcase.html that displays the logo on white and dark
backgrounds side by side.
```

Integrate it:

```
Add my-site/logo.svg to the header of my-site/index.html as an inline SVG.
Make sure the colors work with the rest of the design.
```

### 1E: Expert Roast & Fix (30 min)

Before shipping, get your site reviewed by a panel of experts. Claude assembles 3 specialists who each critique your site from their angle — then they discuss and produce a prioritized fix list.

```
I need you to review the website at my-site/index.html by assembling a
3-person expert panel. Each expert reviews independently, then they
discuss and produce a prioritized fix list.

THE PANEL:
1. **Marcus Tan, Product Designer** — Visual hierarchy, CTAs, whitespace,
   mobile responsiveness, load time. What's broken?
2. **Ankit Verma, Growth Marketer** — 5-second test: do I understand the
   value prop? Would I convert? Where do visitors drop off?
3. **Meera Nambiar, Target Customer** — She's the exact person this site
   is for. Is she convinced? What questions does she still have?

INSTRUCTIONS:
1. Each expert writes their review independently to roast/[name]-review.md
2. After all 3, they discuss — create roast/panel-discussion.md
3. Produce roast/fix-list.md with issues ranked:
   - P0: Launch blockers (fix before deploying)
   - P1: Important (fix soon)
   - P2: Nice to have

Go. Be harsh. I'd rather fix real problems now.
```

> **Three is the floor, not the ceiling.** The panel is a pattern, not a fixed cast. Add a Brand Strategist if you're worried the copy reads like AI. Add an Angel Investor if positioning credibility is the bet. Add an Accessibility Auditor, an SEO specialist, a Legal/Compliance reviewer, a competing founder — anyone whose lens would catch something the three above would miss. Each new expert is one more `roast/[name]-review.md` file and one more voice in the discussion. Pick experts whose disagreement with each other will surface the real issues.

Apply the fixes:

```
Read roast/fix-list.md. Apply all P0 fixes to my-site/index.html.
Then apply the top 3 P1 fixes. Stop there — we're shipping.
```

### Step 1 Checkpoint

- [ ] Copy generated in your voice — specific to your services
- [ ] Website built at `my-site/index.html` — responsive, professional
- [ ] Reviewed and refined — it looks like a real site
- [ ] Logo generated and integrated into the header
- [ ] Expert roast completed — 3+ reviewers, prioritized fix list
- [ ] P0 and top P1 fixes applied
- [ ] Open `my-site/index.html` — you'd show this to a client

---

_Break — 10 min_

---

## Step 2: The Chatbot (45 min)

> **Before you start:** Your Claude session has been running for 2 hours. Type `/compact` to summarize and free up context. This keeps Claude fast and accurate for the code-heavy steps ahead.

**What you're building:** An AI chatbot on your website that answers visitors in YOUR voice.

**Day 1 artifact used:** CLAUDE.md (system prompt + voice + services)

### 2A: Set Up Your API Key (5 min)

Your chatbot needs an API key to call an LLM. We'll use **OpenRouter** — it gives you access to Claude, GPT, Gemini, and other models through a single API.

**You've been given a pre-loaded OpenRouter API key** — check the chat or the link shared by your instructor. It has credits loaded for the bootcamp.

Tell Claude:

```
Create a .env file in my-site/ directory with this key:
OPENROUTER_API_KEY=<paste your key here>
```

> **Why OpenRouter?** One API key, many models. You can start with Claude and switch to GPT or Gemini later without changing your code.

### 2B: Build the Chat Widget + API Function (25 min)

```
Add an AI chatbot to my website. Here's exactly what I need:

SETUP:
- Initialize a Node.js project in my-site/ (npm init -y)
- Install dependencies: express, dotenv, node-fetch (if needed)
- Create server.js — a local dev server that serves my website files
  and routes /api/* requests to the serverless functions in api/
- It should read .env automatically and start on port 3000

ARCHITECTURE (API key safety):
- Create api/chat.js — a serverless function (runs server-side)
- The function calls OpenRouter's API (https://openrouter.ai/api/v1/chat/completions)
- It reads OPENROUTER_API_KEY from process.env
- Use model "anthropic/claude-sonnet-4.6" (or any model available on OpenRouter)
- Frontend calls /api/chat — the API key NEVER appears in client-side code

SYSTEM PROMPT:
Read my CLAUDE.md and use the full content as the system prompt, with these
additions:
- "You are [my name]'s AI assistant on their website. Answer questions about
  their services, experience, and approach."
- "Speak in [my name]'s voice — use their tone, vocabulary, and style as
  described in the 'My Writing Voice' section."
- "Keep responses concise — 2-3 sentences max. Be helpful and warm."
- "If asked about pricing, reference the ranges in 'What I Offer' but
  suggest a conversation for specifics."
- "If you don't know something, say 'I'd suggest reaching out directly —
  [contact method from CLAUDE.md].'"
- "IMPORTANT: You are responding in a chat widget, not a document. Write
  in plain conversational text. No markdown — no headers, no bold, no
  bullet lists. Just talk naturally like a human in a chat."

FRONTEND:
- Clean chat widget in the bottom-right corner
- Matches my site's design (colors, fonts)
- Mobile-friendly
- Shows typing indicator while waiting
- Collapsed by default, opens on click
- Chat bubble says "Ask me anything"
- The full interaction cycle must work: open the widget → type and send
  a message → see the typing indicator while waiting → receive the
  response with the input ready for the next message → close the widget
  → reopen it and send another message. Every step must work every time.

Save the updated files. Keep the same my-site/ directory structure.

After creating all files, install dependencies and start the server.
```

Claude will run `npm install` and `node server.js` for you. Once you see "Server running on http://localhost:3000" in the terminal, move on.

> **What's server.js?** A tiny local server that serves your website and routes `/api/*` requests to your serverless functions. It reads your `.env` file automatically. When you deploy to Vercel later, Vercel does the same thing — but for now, your laptop is the server.

### 2C: Test the Chatbot Locally (10 min)

Open **http://localhost:3000**. Click the chat bubble. Test these:

1. "What do you do?" — should describe your services from CLAUDE.md
2. "How can you help someone like me?" — should be specific, not generic
3. "What's your approach?" — should reflect your style
4. "How much do you charge?" — should reference your pricing range

**Does the widget work?** Test the basics: click the bubble to open, send a message, verify the input re-enables after the response, click X to close, click the bubble again to reopen. If the panel won't close, the input stays frozen, or the typing dots won't stop — tell Claude what you see and ask it to fix the chat widget.

**Does it sound like you?** If it's too formal, too vague, or missing context:

```
The chatbot response was [too formal / too generic / missing info about X].
Update the system prompt in api/chat.js to fix this.
```

### 2D: Voice Check (5 min)

The real test — does it pass the "would I actually say this?" check?

```
Read the system prompt in api/chat.js. Compare it against my CLAUDE.md
voice section. Is anything missing that would make the chatbot sound more
like me? Suggest specific additions to the system prompt.
```

Ask a friend or neighbor to chat with your bot at `http://localhost:3000`. Do they think it sounds like a real person?

### Step 2 Checkpoint

- [ ] Chat widget visible at http://localhost:3000
- [ ] API function handles calls (key is safe — server-side only)
- [ ] Chatbot answers questions about your services using CLAUDE.md
- [ ] Chatbot speaks in your voice — not generic AI
- [ ] Tested on mobile (use your local IP, e.g. `http://192.168.x.x:3000`)

---

_Lunch — 1:30–2:15 PM IST_

After lunch, open [Session 2: Proposal Engine & Deploy](student-handbook-session-2.md) — Steps 3 and 4, plus Power Ups, Show & Tell, and the close.
