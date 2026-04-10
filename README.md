# D&D Smart Wiki

An AI-powered campaign wiki generator for tabletop RPG sessions. Drop in a session transcript — the app does the rest, automatically creating and updating structured wiki entries for every character, location, item, organization, and lore detail that appears.

Built for dungeon masters and players who want to focus on the story, not the note-taking.

> ⚠️ **Status: Active development. Not yet publicly deployed.**

---

## The Problem

Tabletop RPG campaigns generate a lot of lore — fast. Characters get introduced, plotlines branch, items change hands, and locations accumulate history across dozens of sessions. Keeping a campaign wiki up to date manually is tedious work that pulls DMs and players away from the creative side of the game.

D&D Smart Wiki automates that entirely. Give it a transcript, and it handles the rest.

---

## How It Works

```
Session Recording / Transcript
            │
            ▼
    Transcript Input (paste or upload)
            │
            ▼
    LLM Analysis (Google Gemini)
    ┌────────────────────────────────┐
    │  Entity extraction             │
    │  Relationship mapping          │
    │  New vs. existing entry diff   │
    │  Summary generation            │
    └────────────────────────────────┘
            │
            ▼
    Wiki Entry Creation / Update
    ┌──────────────────────────────────────┐
    │  👤 Characters                        │
    │  📍 Locations                         │
    │  ⚔️  Items                             │
    │  🏛️  Organizations                    │
    │  📜 Lore                              │
    │  📋 Session Summaries                 │
    └──────────────────────────────────────┘
            │
            ▼
    Persistent Campaign Wiki (Prisma / DB)
```

---

## Features

- **Transcript ingestion** — paste or upload a raw session transcript
- **AI-powered entity extraction** — automatically identifies and categorizes people, places, items, factions, and lore
- **Smart updates** — recognizes existing wiki entries and updates them with new information rather than creating duplicates
- **Session summaries** — generates a concise, readable recap for each session
- **Persistent storage** — all wiki entries stored in a database via Prisma ORM, building a living campaign record over time

---

## Tech Stack

| Layer        | Technology           |
| ------------ | -------------------- |
| Framework    | Next.js (App Router) |
| Language     | TypeScript           |
| Styling      | Tailwind CSS         |
| Database ORM | Prisma               |
| AI / LLM     | Google Gemini        |
| Deployment   | TBD                  |

---

## Roadmap

- [ ] **Migrate LLM from Google Gemini to Anthropic Claude** — for improved instruction-following, structured output quality, and long-context transcript handling
- [ ] **File upload support** — accept .txt and .pdf transcripts in addition to paste input
- [ ] **Manual wiki editing** — allow users to edit, merge, or correct AI-generated entries
- [ ] **Campaign dashboard** — overview of all entities, session history, and relationship graph
- [ ] **Search & filter** — full-text search across the wiki
- [ ] **Export** — download the wiki as Markdown, PDF, or Notion-compatible format
- [ ] **Public deployment** — hosted version for campaigns to use without local setup
- [ ] **Multi-campaign support** — manage multiple campaigns under one account

---

## Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Gemini API key and database connection string

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view locally.

---

## Background

This project grew out of a real need — running and playing in multiple active D&D campaigns simultaneously means a _lot_ of lore to track. D&D Smart Wiki started as an experiment in using LLMs for structured information extraction and evolved into a full-stack application with persistent storage and a proper wiki data model.

It sits at the intersection of two things I care about: building useful tools for communities I'm part of, and exploring what AI can do when applied to creative, human-centered problems.
