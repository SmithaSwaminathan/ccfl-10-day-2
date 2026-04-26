# Day 2 — Session 2: Proposal Engine & Deploy

**Duration:** Post-Lunch (2:15 PM – 5:00 PM IST) | **You end this session with a live URL on the internet, agent running 24/7**

> **Coming back from lunch?** Run `/compact` first. The proposal engine is the most complex step — Claude needs a clean context window to generate and customize the code correctly.

If you haven't done Session 1 yet, start there: [Session 1: Brand, Design & The Chatbot](student-handbook-session-1.md).

---

## Step 3: The Proposal Engine (55 min)

**What you're building:** The chatbot gains a second mode — it gathers requirements, generates a personalized proposal PDF, emails it to the visitor, and alerts you on Telegram.

**Day 1 artifacts used:** CLAUDE.md (voice + services + lead scoring), Telegram bot (owner alerts)

### 3A: Add Intake Mode to the Chatbot (20 min)

```
Add a "Get Proposal" flow as a second widget alongside your chatbot.

ARCHITECTURE — Two separate widgets, not one widget with two modes:

WIDGET 1 — Q&A Chat (existing):
Same as before. No changes. Pure Q&A in your voice.

WIDGET 2 — Proposal Intake (new):
A separate widget dedicated to gathering requirements. It has its own
button, its own window, its own conversation history.

FRONTEND — Two launcher buttons stacked bottom-right:
- "Ask me anything" (primary) → opens the Q&A chat widget
- "Get Proposal" (secondary) → opens the proposal widget
- Clicking one hides the launchers and opens that widget
- Closing the widget brings the launchers back
- Each widget is fully independent — separate UI, separate history

PROPOSAL WIDGET specifics:
- Has a progress bar always visible (step X of 6)
- Auto-starts the intake conversation when first opened
- The header says "Get a Proposal" (visually distinct from Q&A)
- Gathers these 6 things, ONE question at a time:
  1. What does your company do? (industry, size, stage)
  2. What's the challenge you're facing?
  3. What have you tried so far?
  4. What would success look like?
  5. What's your budget range?
  6. What's your email? (asked last)
     - If the email looks invalid, ask again naturally — don't move on
- The chatbot should acknowledge each answer naturally before the next
- Use your voice throughout — not a form, a conversation
- After getting the email, say: "Perfect — I'll put together a proposal
  tailored to your situation. You'll have it in your inbox shortly."

API ARCHITECTURE:
- api/chat.js handles both widgets (system prompt supports Q&A and intake)
- The proposal widget sends "I'd like to get a proposal." as its first
  message — this triggers intake mode in the system prompt
- api/chat.js parses hidden markers from the LLM response:
  - <INTAKE_STEP>N</INTAKE_STEP> — stripped, returned as intake_step: N
  - <INTAKE_COMPLETE>{"company":...}</INTAKE_COMPLETE> — stripped,
    returned as intake_complete: true with structured intake_data
- Q&A responses have no markers — just { reply }
- Create api/generate-proposal.js as a stub endpoint that receives
  and logs the structured intake data + full conversation

STEP MARKER RULES (critical for progress bar):
The marker number matches the question being ASKED in that message:
- Opening message asks Q1 → <INTAKE_STEP>1</INTAKE_STEP>
- Acknowledges Q1 answer, asks Q2 → <INTAKE_STEP>2</INTAKE_STEP>
- Acknowledges Q2 answer, asks Q3 → <INTAKE_STEP>3</INTAKE_STEP>
- Acknowledges Q3 answer, asks Q4 → <INTAKE_STEP>4</INTAKE_STEP>
- Acknowledges Q4 answer, asks Q5 → <INTAKE_STEP>5</INTAKE_STEP>
- Acknowledges Q5 answer, asks Q6 → <INTAKE_STEP>6</INTAKE_STEP>
- If email is invalid, ask again → <INTAKE_STEP>6</INTAKE_STEP> (stays on 6)
- After collecting valid email → <INTAKE_COMPLETE>{...}</INTAKE_COMPLETE>
Every intake response must include exactly one marker. Never omit it.

Update api/chat.js, the frontend, and styles.
```

Test the intake flow: click "Get Proposal", watch it auto-start, and walk through all 6 questions. Verify the progress bar advances on each step.

### 3B: Build the Agentic Proposal Engine (20 min)

This is where your chatbot becomes an **agent**. Instead of hardcoding every step ("first do this, then do that"), you give Claude a set of **tools** and let it decide the flow.

Think about it: in Steps 1-2, you told Claude what to write. Now you're telling Claude what it can **do** — and letting it figure out the rest.

**The pattern:**

- You define tools (render PDF, send email, alert owner)
- Claude receives the visitor's intake data + the tools
- Claude decides: "I'll write the proposal, render a PDF, score this lead, email it, and alert you"
- Your code just executes whatever Claude asks for
- This is the same pattern behind Claude Code itself — Claude gets tools, decides what to do, and acts

**We've pre-built the engine for you.** The agentic proposal engine has a lot of moving parts — PDF rendering, email APIs, Telegram alerts, an agent loop. Rather than risk a broken build, we're giving you a tested reference implementation. Your job is to make it yours.

**Step 1: Copy the reference files**

```bash
# Install the PDF library
cd my-site && npm install pdf-lib

# Copy the pre-built proposal engine and Vercel config
cp ../reference/api/generate-proposal.js api/generate-proposal.js
cp ../reference/vercel.json vercel.json
```

**Step 2: Read and understand what it does**

```
Read api/generate-proposal.js. Explain to me in plain language:
1. What are the 3 tools Claude can use?
2. How does the agent loop work?
3. Where does the system prompt come from?
4. What does sanitizeForPdf do and why is it needed?
```

Take a minute to understand the architecture. This is the same pattern behind Claude Code itself — an LLM with tools, running in a loop until the job is done.

**Step 3: Add lead scoring rules to CLAUDE.md**

The proposal engine scores every lead as HIGH / MEDIUM / LOW. Claude needs to know what those mean *for your business*. Run this:

```
Read my CLAUDE.md — specifically "What I Offer" and my services.
Add a "## Lead Scoring Rules" section that defines HIGH / MEDIUM / LOW
leads based on my services, ideal clients, and pricing. Be specific
to my business, not generic.
```

**Step 4: Customize it with YOUR identity**

The file has `[CUSTOMIZE]` markers where your data needs to go. Tell Claude:

```
Read api/generate-proposal.js and my CLAUDE.md. The file has [CUSTOMIZE]
markers. Replace them:

1. The AGENT_SYSTEM_PROMPT — replace the placeholder with my real identity,
   voice, services, pricing, and lead scoring rules from my CLAUDE.md
2. The PDF cover page — my real name and tagline
3. The PDF footer — my real contact info
4. The PDF brand colors — match my website's color scheme
5. The email sender name — use my name (keep onboarding@resend.dev as the
   email address — that's a Resend free tier requirement)

Keep everything else exactly as it is — the tools, the agent loop, the
sanitizeForPdf function. Only change the [CUSTOMIZE] parts.
```

> **What is this file?** It's an AI agent. The chatbot (Step 2) gathers information. This agent takes action: it writes a proposal in your voice, renders a branded PDF, emails it to the visitor, scores the lead, and alerts you on Telegram. Claude decides the order. Claude writes the content. Your code just gives it tools and gets out of the way. That's the difference between a script and an agent.

### 3C: Set Up External Services (5 min)

Two services need API keys. Add them to your `.env` file in `my-site/`.

**Resend (email sending):**

1. Go to [resend.com](https://resend.com) → sign up → create API key
2. Add to your `.env` file: `RESEND_API_KEY=re_your_key_here`

> ⚠️ **Resend free tier limitation — read this now, not later.**
>
> Without a verified custom domain, Resend only lets you send emails **to the email address you signed up with**. Not to friends, not to test accounts — only to yourself. This is a Resend sandbox restriction, not a bug in your code.
>
> **What this means for today:** When testing the proposal flow, use your Resend sign-up email as the "visitor" email. You'll receive your own proposal — that's the expected behavior on the free tier.
>
> The sender will show as `onboarding@resend.dev` — that's also normal.

**Telegram alerts (reuse Day 1 bot):**

- You already have `TELEGRAM_BOT_TOKEN` and `TELEGRAM_USER_ID` from yesterday
- Add both to your `.env` file

Your `.env` file should now have all 4 keys:

```
OPENROUTER_API_KEY=...
RESEND_API_KEY=...
TELEGRAM_BOT_TOKEN=...
TELEGRAM_USER_ID=...
```

> ⚠️ **Security: read this before you commit anything.**
>
> These 4 keys live in `.env` only. Never paste them into `index.html`, a `.txt` file, a Markdown note, or anywhere Claude might inline them into frontend code. If Claude ever suggests hardcoding a key "just for testing", say no and ask it to use `process.env.KEY_NAME` instead.
>
> **Why it matters:** GitHub scans public repos for OpenRouter (`sk-or-`) and Resend (`re_`) keys within minutes of a push. Providers auto-revoke exposed keys, but in the meantime attackers can drain your credits before you notice.
>
> Belt and suspenders: we'll run a security audit before pushing (Step 4A), and we'll push as a **private** repo by default.

> **All services are free tier.** Resend free tier: 100 emails/day, but only to your own email (see note above).

### 3D: Test Everything Locally (10 min)

First, verify all services are connected before testing end-to-end:

```
Run a quick health check on all external services:
1. Test that OPENROUTER_API_KEY works (make a simple API call)
2. Test that RESEND_API_KEY is valid (check the API responds)
3. Test that TELEGRAM_BOT_TOKEN + TELEGRAM_USER_ID can send a message

Report which services are working and which need fixing.
```

Fix anything that's broken before proceeding. Common issues:
- Resend: works but can only send to your own email on the free tier
- Telegram: "chat not found" → make sure you messaged your bot first (from Day 1)

Now restart the server so it picks up the new API keys:

```
Restart the server (stop the old one and run node server.js again)
```

Now test the full agent loop at **http://localhost:3000**:

1. Click the chat bubble
2. Say: "I need help with my GTM strategy"
3. Answer the intake questions naturally
4. Provide your email address — **use the email you signed up with on Resend** (remember: free tier only sends to yourself)
5. Wait 30 seconds

**Three things should happen:**

- The chatbot says "You'll have it in your inbox shortly"
- An email arrives with a **personalized proposal PDF** attached
- Your phone buzzes with a Telegram alert — lead summary with score + the proposal PDF

Check the terminal running `node server.js` — you'll see the agent working:

```
Agent turn 1... Claude called 1 tool: render_proposal_pdf
Agent turn 2... Claude called 2 tools: send_email, alert_owner
Agent turn 3... Agent completed.
Agent pipeline complete: { proposal: true, email: true, alerted: true }
```

**If something breaks:**

- Check the terminal for error messages — they'll tell you exactly which step failed
- Missing env var → check your `.env` file
- Email not arriving → **most common cause:** you entered an email that isn't your Resend sign-up email. Free tier only delivers to yourself. Check the Resend dashboard for bounced/blocked sends
- Telegram not working → verify your bot token and chat ID from Day 1
- PDF generation error mentioning "cannot encode" → the AI-generated proposal has special characters (like ₹) that pdf-lib's standard fonts can't render. Tell Claude: "The PDF crashed on a special character. Add text sanitization to handle non-ASCII characters before rendering."

### Step 3 Checkpoint

- [ ] Chatbot transitions to intake mode when visitor expresses need
- [ ] Intake gathers requirements conversationally (not a form)
- [ ] **Agent loop works** — Claude decides the flow, calls tools autonomously
- [ ] Proposal PDF generated — branded, personalized, in your voice
- [ ] Email sent to visitor with PDF attachment
- [ ] Lead scored and Telegram alert sent — with the proposal PDF attached
- [ ] **End-to-end test works** — chat → intake → agent → PDF → email → alert

---

_Break — 10 min_

---

## Step 4: Deploy & Demo (70 min)

**What you're doing:** Everything works locally. Now put it on the internet — live URL, real visitors, real agent running 24/7.

### 4A: Security Audit + Push to GitHub (10 min)

**First, initialize the repo and add `.gitignore`:**

```
Run these commands: cd my-site && git init. Then create a .gitignore file with these exact entries: node_modules, .env, .vercel, server.js
```

**Now run a security audit before your code touches the internet.** Paste this prompt:

```
Audit my my-site repo for leaked secrets before I push it to GitHub.

IMPORTANT: this audit does NOT require reading .env. Work entirely
from .gitignore, git state, and pattern matching. Do not request
.env read access.

1. Read .gitignore. Confirm it contains a line for .env (on its
   own, not just as part of another pattern).

2. Run: git ls-files | grep -E '^\.env$'
   Expected: empty output. If .env shows up, it's tracked. Fix it:
     git rm --cached .env
     git commit -m "Stop tracking .env"

3. Pattern-grep the repo for leaked secrets. Search index.html,
   public/, api/, *.txt, *.md, and any stray backup or log files
   (but exclude .env itself, node_modules, and .git):
   - sk-or-                                    (OpenRouter key prefix)
   - re_[A-Za-z0-9]{8,}                        (Resend key pattern)
   - [0-9]{8,}:[A-Za-z0-9_-]{35}               (Telegram bot token)
   - Any hardcoded assignment matching:
     /[A-Z_]*(API_KEY|TOKEN|SECRET)\s*[:=]\s*['"][^'"${}]+['"]/ 
     in .js, .html, or .md files — this catches patterns like
     const KEY = "actualvalue" regardless of which key

4. Confirm no process.env.* or raw secret reads happen in
   client-side code. process.env.* should appear ONLY in api/*.js
   (server-side), never in index.html or frontend scripts.

Report either:
  - "clean" plus a list of exactly what you checked, OR
  - a list of violations with file path and line number.

Fix any violations by moving the value to .env and replacing the
hardcoded string with process.env.KEY_NAME (server-side only).
```

Wait for Claude to report "clean" before the next step. If it fixed anything, eyeball the diff yourself before continuing.

> **Why pattern-based?** A secret audit shouldn't need to see the secret. If you denied Claude read access to `.env` (good instinct), this prompt still works — it hunts for key *shapes* like `sk-or-` and `re_`, which is enough to catch an accidental paste into `index.html` or a `.txt` file.

**Commit and push as a private repo:**

```bash
git add -A
git commit -m "Initial commit: my-site"
gh repo create my-site --private --source=. --push
```

> **Why the explicit `git add` + `git commit`?** `gh repo create --push` refuses to run with `--push enabled but no commits found` if your repo has no commits yet. Staging and committing first guarantees the push works on the first try.

> 🔒 **Private by default.** One leaked key during class is a worse failure mode than an extra click. You can flip the repo to public later once you've reviewed it: `gh repo edit --visibility public` (rerun the security audit first). Vercel deploys private repos identically, so nothing else changes.

> **`gh` not found?** You skipped GitHub CLI in the pre-setup. Go to [thecrux.ai/setup](https://thecrux.ai/setup) and complete the GitHub CLI step, then come back and run this command.

> **Why exclude `server.js`?** It's only for local development. Vercel serves your static files and runs your `api/` functions natively — it doesn't need `server.js`. If it's in your repo, Vercel misdetects your project as Express and deployment fails with "Not Found".

### 4B: Deploy to Vercel (10 min)

1. Go to [vercel.com](https://vercel.com) and sign in (use "Continue with GitHub")
2. Click **"Add New Project"**
3. Find your `my-site` repo in the list and click **Import**
4. Choose Application Preset: select **"Other"**
5. Click **Deploy**

You'll get a URL like `https://my-site.vercel.app`.

Now add your environment variables. Go to your project → **Settings** → **Environment Variables** and add all 4:

- `OPENROUTER_API_KEY`
- `RESEND_API_KEY`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_USER_ID`

After adding the env vars, **redeploy**: go to **Deployments** → click the three dots on the latest deploy → **Redeploy**.

**Make sure your site is actually public:**

Two things trip people up when they try to share the URL:

1. **Share the production URL, not a preview URL.** The short one at the top of your project page (e.g. `https://my-site.vercel.app`) is production and public. The long ones on the **Deployments** tab (e.g. `my-site-git-main-yourname.vercel.app`) are preview deployments and **require a Vercel login to view** by default. If you paste a preview URL in Telegram or LinkedIn, visitors hit a login wall.

2. **If even your production URL asks visitors to log in, turn off Deployment Protection.** Go to **Project Settings** → **Deployment Protection** → set **Vercel Authentication** to **Disabled** → **Save**. Reload your production URL in an incognito window to confirm it loads without a login prompt.

> **When would you leave Deployment Protection on?** For internal tools, staging environments, or client previews you don't want indexed or shared yet. For a public marketing site with a chatbot, you want it off.

> **Not working?** Make sure `index.html` is in the root of the repo (not in a subfolder). If the page is blank, check the Vercel build logs for errors.

> **Did the Lead Storage Power Up?** Also add `SUPABASE_URL` and `SUPABASE_KEY` to your Vercel env vars.

### 4C: The Live Demo (15 min)

**Open your live URL on your phone.** That's your site. Real URL. Real internet. The agent is running.

Now the moment. Ask a neighbor (or use a second device) to be your "visitor."

1. **Visitor** lands on your live site, browses
2. **Visitor** opens chat: "I'm looking for help with [something relevant to your services]"
3. **Chatbot** (in your voice) gathers requirements over 3-5 messages
4. **Visitor** provides their email
5. **Behind the scenes** — the agent loop kicks in: Claude writes the proposal, renders a PDF, scores the lead, sends the email, and alerts you
6. **Visitor's inbox** — personalized proposal PDF arrives
7. **Your phone buzzes** — Telegram shows the lead summary + the proposal PDF

**That's an agent.** It perceived a visitor, decided they were qualified, generated a personalized proposal, rendered a branded PDF, emailed it, scored the lead, and alerted you — all in about 25 seconds, without you opening a laptop.

### 4D: Understand What You Built (5 min)

**The chatbot** (Step 2) is a conversation tool. It answers questions. It gathers information. But it doesn't *do* anything.

**The agent** (Step 3) is different. It receives the conversation, then *acts autonomously*:

- It decides the lead is worth a proposal
- It writes a personalized proposal in your voice
- It renders a branded PDF
- It writes a personalized email and sends it
- It scores the lead using your triage rules
- It alerts you on Telegram — with the proposal attached

You didn't write "step 1, step 2, step 3." You gave Claude tools and a goal. Claude figured out the steps. That's the difference between a script and an agent.

> **The learning moment:** "You don't give an intern full send authority on day one. You review their work, give feedback, and gradually let them operate independently. Same with AI agents. Today it sends immediately — but if you want a safety net, the Human-in-the-Loop Power Up adds approval mode. The agent generates the proposal, sends it to your phone for review, and waits for your 'approve' before sending. Start autonomous, build trust, then add guardrails where you need them."

Now every `git push` automatically updates your live site. The agent runs 24/7 without you touching anything.

### Step 4 Checkpoint

- [ ] Code pushed to GitHub
- [ ] Site live on Vercel — visit it on your phone
- [ ] Chat widget works on the live URL
- [ ] **Full agent loop works on production** — proposal PDF arrives in email + Telegram buzzes
- [ ] You understand the difference between a chatbot and an agent

---

## Power Ups (4:00–4:30 PM IST)

Your site is live. Your agent is running. Everything below is optional — pick whatever interests you, in any order.

---

### Power Up: Research-Informed Polish (15 min)

**What this adds:** Your Day 1 research sharpens your site's positioning — the "everything compounds" moment.

```
Read my CLAUDE.md. Based on what you know about my services, clients,
and market positioning:

1. Is my hero headline differentiated enough from competitors?
2. Is my services section missing anything the market expects?
3. Is there a credibility signal I should add (industry stat, framework, methodology)?

Suggest specific copy changes. Reference the research findings.
Apply the changes to my-site/index.html.
```

Push and redeploy:

```bash
cd my-site
git add -A && git commit -m "Research-informed polish" && git push
```

**Checkpoint:**
- [ ] Research findings applied to site positioning
- [ ] Changes pushed and live on Vercel

---

### Power Up: Lead Storage with Supabase (20 min)

**What this adds:** Every lead stored in a database with scores — your own CRM. Enables dashboards and follow-up automations later.

**Set up Supabase (free tier):**

1. Go to [supabase.com](https://supabase.com) → sign up → **New Project**
   - Organization: create one (or use existing)
   - Project name: `my-site-leads` (or whatever you like)
   - Database password: set one (you won't need it directly — save it anyway)
   - Region: pick the closest to you
   - Plan: **Free** (plenty for this)

2. Get your **API URL**:
   - Go to **Project Settings** (gear icon, left sidebar) → **Data API**
   - Copy the **API URL** at the top (under "RESTful endpoint for querying and managing your database") — it looks like `https://abcdefg.supabase.co`

3. Get your **API key**:
   - Go to **Project Settings** → **API Keys**
   - Copy the **Publishable key** — it starts with `sb_publishable_...`
   - (Ignore the Secret key — you don't need it for this)

4. Create the leads table:
   - Go to **SQL Editor** (left sidebar, looks like a terminal icon)
   - Click **New Query** and paste this:

```sql
CREATE TABLE leads (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT,
  company TEXT,
  email TEXT,
  industry TEXT,
  challenge TEXT,
  budget TEXT,
  score TEXT,
  conversation_transcript TEXT,
  status TEXT DEFAULT 'proposal_sent',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Allow inserts from the publishable key (your serverless function)
CREATE POLICY "Allow anonymous inserts" ON leads
  FOR INSERT WITH CHECK (true);

-- Allow reads from the publishable key (for your dashboard later)
CREATE POLICY "Allow anonymous reads" ON leads
  FOR SELECT USING (true);
```

   - Click **Run** (or Cmd+Enter). You should see "Success. No rows returned" — that means it worked.

5. Add to your `.env` file:
   - `SUPABASE_URL=https://your-project.supabase.co`
   - `SUPABASE_KEY=sb_publishable_your-key-here`

6. **Verify:** Go to **Table Editor** (left sidebar) → you should see a **leads** table. It'll be empty — that's correct.

**Add the `store_lead` tool to your agent:**

```
Add a 4th tool to the agent in api/generate-proposal.js:

store_lead:
- Claude passes: name, company, email, industry, challenge, budget,
  score (HIGH/MEDIUM/LOW), status
- Your code stores in Supabase leads table via REST API
- Claude scores the lead itself using the triage rules in the
  system prompt — no regex needed

Use the Supabase REST API:
POST to ${SUPABASE_URL}/rest/v1/leads
Header: apikey set to SUPABASE_KEY
Content-Type: application/json
```

Add `SUPABASE_URL` and `SUPABASE_KEY` to your Vercel env vars too, then redeploy.

Test it: trigger the full agent loop again. Check Supabase → **Table Editor** → **leads** — you should see the lead with its score.

> **Supabase free tier** gives 500 MB database + 1 GB file storage. More than enough for your AI sales agent.

**Checkpoint:**
- [ ] Supabase project created with leads table
- [ ] `store_lead` tool added to agent
- [ ] Leads appear in Supabase Table Editor with scores

---

### Power Up: Second Design + Compare (20 min)

**What this adds:** A second design direction and a side-by-side comparison tool — pick the best elements from each.

```
Create a second HTML website using a different design direction from
the one we built:

[If you built warm/personal, try bold/professional — or vice versa]

Apply frontend-design skill standards. Use the same copy but with a
different visual approach:
- Different color palette
- Different layout structure
- Different typographic feel

Save as design-v2/index.html (+ styles.css)
```

Open both: `open my-site/index.html` and `open design-v2/index.html`

```
Create a comparison.html file that shows both designs side by side
in an iframe layout. I want to compare specific sections:
- Hero sections
- Services sections
- CTA sections

Add radio buttons so I can pick my favorite version of each section.
```

If you want to combine elements:

```
I want to combine the best of both:
- Hero: from Design [1/2]
- About section: from Design [1/2]
- Services: from Design [1/2]
- Testimonials: from Design [1/2]
- CTA: from Design [1/2]
- Color scheme: from Design [1/2]

Update my-site/index.html with the combined version.
```

Push and redeploy if you make changes to `my-site/`.

---

### Power Up: Human-in-the-Loop Approval (20 min)

**What this adds:** Right now your agent sends proposals directly to visitors — no review, no safety net. This Power Up adds an approval step: the agent prepares the proposal and sends it to YOU first. You review it, approve it (or request changes), and only then does the visitor receive it.

**Why this matters:** You don't give an intern full send authority on day one. You review their work, give feedback, and gradually let them operate independently. Same principle here. Start with approval mode, build trust in the agent's output, and remove the guardrail later when you're confident.

**How it works:**

```
Current flow (auto-send):
  Visitor completes intake → Agent writes proposal → Email sent → You get alert
  (you find out AFTER the visitor already has it)

Approval flow:
  Visitor completes intake → Agent writes proposal → YOU get it first
  → You review → Approve OR request changes → THEN visitor gets it
```

**Step 1: Add the approval mode env var**

Add to your `.env` file:

```
APPROVAL_MODE=true
```

Also add it to your Vercel Environment Variables if you've already deployed.

**Step 2: Build the approval system**

```
I want to add human-in-the-loop approval to my proposal engine.

Read api/generate-proposal.js and understand the current agent flow.

When APPROVAL_MODE=true in env vars, the agent should change behavior:

1. RENDER the proposal PDF as usual — no change here

2. INSTEAD of emailing the visitor directly, store the pending proposal
   and send ME the proposal for review first:
   - Send me a Telegram message with: lead summary, score, and the
     proposal PDF attached
   - The Telegram message should include an approval link:
     https://[my-vercel-url]/api/approve-proposal?id=[unique-id]
   - Also email ME (not the visitor) the proposal PDF so I can review
     it in full. Use my email from CLAUDE.md or a new env var OWNER_EMAIL.

3. CREATE a new api/approve-proposal.js endpoint that:
   - GET request: shows a simple approval page with:
     - The lead summary (name, company, challenge, score)
     - "Approve & Send" button — sends the proposal email to the visitor
     - "Request Changes" text area + submit button — sends the change
       request back to the agent to regenerate the proposal, then shows
       the new version for approval again
   - POST with action "approve": triggers send_email to the visitor
     with the stored PDF, then sends me a Telegram confirmation
   - POST with action "revise" + instructions: runs the agent again
     with the revision instructions, re-renders the PDF, and shows
     the updated proposal for approval

4. STORE pending proposals so the approval endpoint can access them.
   If Supabase is configured, add a "pending_proposals" table.
   If not, use a simple in-memory store (fine for low volume).

5. When APPROVAL_MODE is not set or is "false", keep the current
   behavior — auto-send as before. No changes to the default flow.

Update the agent system prompt so Claude knows:
- When approval mode is on, call alert_owner with the approval link
  instead of calling send_email to the visitor
- The Telegram alert should say "PENDING APPROVAL" clearly
- Include the approval URL in the message

Add OWNER_EMAIL to .env — this is where proposal reviews get sent.

Keep the existing auto-send flow as the default. Approval mode is
opt-in via the env var.
```

**Step 3: Add Supabase table for pending proposals (if using Supabase)**

If you completed the Lead Storage Power Up, add a table to store pending proposals:

```sql
CREATE TABLE pending_proposals (
  id TEXT PRIMARY KEY,
  visitor_email TEXT NOT NULL,
  visitor_name TEXT,
  company_name TEXT,
  lead_score TEXT,
  proposal_pdf_base64 TEXT,
  email_subject TEXT,
  email_body TEXT,
  intake_data JSONB,
  status TEXT DEFAULT 'pending',
  revision_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE pending_proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous access" ON pending_proposals
  FOR ALL USING (true) WITH CHECK (true);
```

> **No Supabase?** The in-memory store works fine for testing and low volume. Proposals will be lost if the server restarts, but for a bootcamp demo that's acceptable. Add Supabase later for persistence.

**Step 4: Test the approval flow**

Add `OWNER_EMAIL=your@email.com` to `.env`. Restart the server.

1. Open http://localhost:3000
2. Chat with the bot: "I need help with my content strategy"
3. Complete the intake questions
4. **This time, no email goes to the visitor.** Instead:
   - Your Telegram buzzes with "PENDING APPROVAL" + the proposal PDF + an approval link
   - Your email gets the proposal for review
5. Click the approval link — you see the proposal summary and two options
6. Click **"Approve & Send"** — now the visitor gets the email
7. Your Telegram confirms: "Proposal sent to [visitor email]"

**To test revision:** Instead of approving, type changes in the text area (e.g., "Remove the pricing section — I want to discuss that on a call") and submit. The agent regenerates the proposal with your instructions, and you review the new version.

**Step 5: Push and redeploy**

```bash
cd my-site
git add -A && git commit -m "Add human-in-the-loop approval mode" && git push
```

Don't forget to add `APPROVAL_MODE=true` and `OWNER_EMAIL` to your Vercel Environment Variables, then redeploy.

> **Going full auto later:** When you trust the agent's proposals, set `APPROVAL_MODE=false` (or remove it) in Vercel env vars and redeploy. The agent goes back to auto-send. You can toggle between modes anytime — no code changes needed.

**Checkpoint:**
- [ ] `APPROVAL_MODE=true` stops auto-send to visitors
- [ ] You receive the proposal via Telegram + email for review
- [ ] Approval link works — click to see proposal summary
- [ ] "Approve & Send" delivers the email to the visitor
- [ ] "Request Changes" regenerates the proposal with your feedback
- [ ] Toggling `APPROVAL_MODE=false` restores auto-send

---

## Show & Tell (4:30–4:55 PM IST)

**3 minutes per person.** Share your screen. Show the live URL. This is a demo, not a lecture.

### The Format

**1. Who I am (15 sec)** — Name, role, one line.

**2. What I built — show the live URL (1 min)** — Pull up your Vercel URL. Walk through the site. Click the chat widget. If the agent pipeline works, trigger it — show the proposal PDF arriving, your phone buzzing.

**3. The compound — how Day 1 fed Day 2 (45 sec)** — Pick ONE example: CLAUDE.md voice section → chatbot speaks like you, "What I Offer" → site copy, lead scoring rules → proposal engine.

**4. Where I got stuck (30 sec)** — What broke? What fixed it?

**5. What I'm doing Monday (15 sec)** — One specific thing. "I'm sending this URL to 3 prospects" or "I'm running /brief every morning."

> **For Zoom:** Instructor will call on people. Have your live URL ready in a browser tab. If you're not called, drop your URL in the chat — everyone should see what you shipped.

---

## What You Built This Weekend

### Day 1 → Day 2: The Compound

| Day 1                       | →   | Day 2                                                            |
| --------------------------- | --- | ---------------------------------------------------------------- |
| CLAUDE.md (identity)        | →   | Website copy — specific to your services and clients             |
| CLAUDE.md (voice)           | →   | Chatbot, proposals, and emails all sound like you                |
| CLAUDE.md (lead scoring)    | →   | Claude scores leads using YOUR rules (no regex — real reasoning) |
| Telegram bot                | →   | Owner alerts — phone buzzes with lead summary + proposal PDF     |

Without Day 1, today would have produced a generic website with a chatbox.

With Day 1, today produced a **personal sales agent that speaks in your voice, qualifies leads, writes proposals, renders branded PDFs, emails them, and alerts you on your phone — running 24/7 on the internet.**

### Your Deliverables

**Core (everyone):**
- [ ] **Published website** — live URL on Vercel
- [ ] **AI chatbot** — answers in your voice, knows your services
- [ ] **AI agent** — Claude with tools, orchestrating autonomously
- [ ] **Branded proposal PDFs** — generated per visitor using pdf-lib
- [ ] **Email automation** — proposals emailed with PDF attachments
- [ ] **Lead scoring** — Claude applies your triage rules (in Telegram alerts)
- [ ] **Owner alerts** — Telegram notifications with proposal PDF attached
- [ ] **Logo** — SVG logo integrated into site header

**Power Ups (if completed):**
- [ ] **CRM storage** — leads stored in Supabase with scores
- [ ] **Second design** — compared and combined best elements

### Key Deliverables Achieved

| #   | Deliverable                       | Where                                                 |
| --- | --------------------------------- | ----------------------------------------------------- |
| 1   | Published website                 | Live URL on Vercel                                    |
| 2   | Content creation                  | Website copy + proposals + emails — all in your voice |
| 3   | Published agent                   | Chatbot + proposal engine + alerts                    |
| 4   | RFP / Contracts / Artifacts       | Proposal PDFs — personalized per client               |
| 5   | Report generation                 | Branded proposal PDFs — different for every client    |
| 6   | Lead scoring & alerts             | Claude scores leads, Telegram alerts your phone       |

---

## Taking It Live — Beyond the Bootcamp

Everything today was built on free tiers — perfect for learning and testing. If you're planning to use this as a real sales agent for your business, one thing needs upgrading: **email**.

**Why:** Resend's free tier only lets you send to yourself (sandbox mode). Real visitors need to receive proposals at *their* email. That requires a verified custom domain.

**What to do:**

1. **Upgrade Resend** — the Pro plan ($20/month) gives you 5,000 emails/month and full analytics
2. **Verify your domain** — add your business domain (e.g., `yourdomain.com`) in Resend dashboard → add 3 DNS records (SPF, DKIM, DMARC) → takes ~5 minutes
3. **Update your sender** — change `onboarding@resend.dev` to something like `proposals@yourdomain.com` in your agent code
4. **Update `.env` on Vercel** — swap in your new Resend API key

> Once your domain is verified, proposals go to any email address. That's when the agent actually starts working for you.

---

## The Monday Morning Habit

Your website is live. Your agent is running 24/7.

Visitors arrive. The chatbot engages them in your voice. When someone's serious, it gathers their requirements and generates a personalized proposal — branded PDF, emailed to them, lead score on your phone. You didn't open a laptop.

**The loop:**

```
Visitor lands on your site → chatbot qualifies them → agent writes proposal → PDF in their inbox → alert on your phone
```

---

## Take-Home Stretch Goals

Things you can add after the bootcamp:

- **Automated follow-ups:** Vercel Cron Job (free: 2/day) checks Supabase for leads >48hrs with no response, auto-sends personalized follow-up
- **Calendar booking:** Add a Cal.com link in proposals for high-value leads
- **Lead dashboard:** Build a /admin page reading from Supabase
- **Full autonomy:** If you set up approval mode, switch to `APPROVAL_MODE=false` once you trust the proposals
- **Custom domain:** Point your own domain to the Vercel deployment
- **Multiple proposal templates:** Different formats for different service lines
- **Go public:** Want the repo in your portfolio or on LinkedIn? Rerun the security audit prompt from Step 4A, then `gh repo edit --visibility public`. Do the audit *before* flipping visibility, not after.

---

## Key Takeaway

> Yesterday, Claude learned who you are, how you write, what your world looks like. Today, Claude used all of that to build your public face and sell for you while you sleep. One weekend. Two deployed products. An AI team that works when you don't. The question isn't whether this works — you just proved it does. The question is: what do you build next?

---

## Annexure

### Deploying via Vercel CLI

During the bootcamp we deployed via the Vercel dashboard (GitHub import). For quick iterations after the bootcamp, you can deploy directly from your terminal:

```bash
# Install Vercel CLI (one time)
npm i -g vercel

# Deploy from your project directory
cd my-site
vercel

# Deploy to production (after testing)
vercel --prod
```

The CLI is useful when you want to preview a change before pushing to GitHub, or when you want to set environment variables:

```bash
# Add environment variables (used in Steps 2-3)
vercel env add OPENROUTER_API_KEY
vercel env add RESEND_API_KEY
vercel env add TELEGRAM_BOT_TOKEN
vercel env add TELEGRAM_USER_ID

# If you completed the Lead Storage Power Up:
vercel env add SUPABASE_URL
vercel env add SUPABASE_KEY
```

> **Tip:** Dashboard deploys (via GitHub push) and CLI deploys both work. Use GitHub push for production changes, CLI for quick previews.
