# What is design.md?

A plain markdown file at your project root that teaches an AI coding agent your design system before it writes any UI code.

That's the whole concept. The rest of this note is why it matters, what goes inside, and how to use it.

---

## The problem it fixes

Ask any LLM to "build me a landing page" cold, and you get the same average result every time. Inter font, purple-on-white gradient, rounded cards, generic spacing. The site looks AI-generated because it is.

This is **distributional convergence**: the model collapsing to the statistical center of its training data. It isn't a bug. It's the model doing exactly what it was trained to do.

LLMs are next-token predictors. The most probable next token, averaged across millions of pages of training data, is the most *average* choice. Generation is a series of those choices stacked end to end. Without something pulling the model elsewhere, every choice lands in the middle of the distribution. Median is generic. Generic is forgettable.

For UI specifically, the middle of the distribution looks like this:

- **Typography:** Inter, 16px body, generous heading scale, no second typeface
- **Color:** white canvas, slate-900 text, indigo or violet accent, an obligatory gradient somewhere
- **Layout:** centered hero, three-column feature grid, "Trusted by" logo strip, FAQ accordion
- **Components:** rounded cards with soft shadow, pill buttons, glass-blur surfaces, abstract swoosh hero illustration
- **Motion:** fade-up on scroll, gentle hover lift

You've seen this site a thousand times. It's the default because the model has seen it a million times.

Three things make convergence sticky, even when you fight it:

1. **Temperature doesn't save you.** Even with high randomness, the high-probability paths all live in the same neighborhood. You get a different shade of the same look, not a different look.
2. **Partial prompts don't save you.** Describe one element ("use a serif heading") and the model complies on that element while every unmentioned element snaps back to default. The aesthetic only holds where you explicitly held it.
3. **The training data is biased recent.** Modern SaaS aesthetic dominates the last five years of the open web. That's what gets averaged. Older, regional, or more distinctive design languages are rounded off.

design.md beats this by pre-committing the model to a specific point in the space (the tokens) and explicitly fencing off the gravity wells (the anti-patterns) before generation starts. The model still wants to drift toward the median. The file just makes drift impossible.

---

## Where it came from

Google launched the format inside Stitch in March 2026, then open-sourced the spec on April 21, 2026 so any coding agent on any platform could read it. The spec lives at [github.com/google-labs-code/design.md](https://github.com/google-labs-code/design.md). Adoption moved fast: Claude Code, Cursor, and GitHub Copilot Workspace all read it natively, and curated catalogs (designmd.app, getdesign.md, VoltAgent's awesome-design-md) shipped brand-inspired systems for Stripe, Linear, Notion, Figma, Apple and others you can drop into any project.

The shape is familiar: repo-root markdown, agent-readable by convention, no tooling required. The spec adds an optional YAML frontmatter block at the top for machine-readable design tokens, but the body is plain prose.

---

## What goes inside

A useful design.md encodes:

- **Aesthetic direction.** The vibe in words ("Swiss editorial", "industrial brutalist", "warm minimalism", "calm studio")
- **Typography.** Exact font families, weights, scale, line-height rules, and what NOT to use
- **Color system.** Palette with semantic roles, usage rules, accessibility notes
- **Spacing and layout.** Grid, rhythm, section padding, container widths
- **Motion.** What should animate, easing curves, durations
- **Component patterns.** Button styles, card treatments, form fields
- **Anti-patterns.** An explicit "do not do this" list that overrides the model's defaults

The anti-patterns section does the heaviest lifting. "No gradient hero", "no three-column generic-icon services grid", "no glass-blur cards". Each line cancels one of the model's reflexes.

---

## Why the format works

Three things together:

1. **It's just markdown.** Any agent can read it. No tooling, no plugins, no Figma export pipeline.
2. **It lives in the repo.** Version-controlled. Travels with the project. The site can't drift away from the spec because the spec is right there next to the code.
3. **It's read before generation, not after.** It shapes the first draft instead of triggering rewrites. That's the difference between a design system and a code review.

---

## How you use it

Drop a design.md at your project root. Then prompt normally: "build a pricing page." The agent reads design.md as part of its context and produces UI that follows your system instead of its defaults.

Three ways to author one:

- **From scratch.** Write it yourself for a venture you're building. This is what Step 1C of the bootcamp walks you through.
- **From a library.** Grab a ready-made design.md from designmd.app, getdesign.md, or VoltAgent's awesome-design-md and customize it.
- **Extracted.** Point an agent at a site you admire and ask it to reverse-engineer the design system into a design.md you can adapt.

---

## The compound with CLAUDE.md

CLAUDE.md and design.md are the same pattern, applied to different layers:

| File         | What it teaches the agent                                |
| ------------ | -------------------------------------------------------- |
| CLAUDE.md    | Who you are. Voice, services, decisions, conventions.    |
| design.md    | How it looks. Tokens, aesthetic, anti-patterns.          |

Used together, they compound. The chatbot sounds like you (CLAUDE.md). The site looks like a deliberate aesthetic choice (design.md). The proposal PDF reads in your voice (CLAUDE.md) and uses your brand colors (design.md). Every artifact agrees because every artifact reads from the same two files.

That's the leverage. Two markdown files. One agent. A consistent product.

---

## The one-line version

> CLAUDE.md teaches the agent who you are. design.md teaches the agent how it looks. Both are just markdown. Both live at the project root. Both are read before generation, not after. That is the entire idea.
