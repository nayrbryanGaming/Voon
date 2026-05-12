# 🎙️ Voon — Meet at the Speed of Voice

> Platform video conference gratis, unlimited, khusus kampus Indonesia. Didukung AI.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/nayrbryanGaming/Voon)

**Live:** https://voon.vercel.app

---

## ✨ Fitur Utama

| Fitur | Status |
|-------|--------|
| Video HD tanpa batas waktu | ✅ |
| 100+ peserta per room | ✅ |
| Notulen AI otomatis (Bahasa Indonesia) | ✅ |
| Absensi cerdas via LiveKit webhook | ✅ |
| Caption live (Web Speech API + Claude AI) | ✅ |
| Kuis AI untuk dosen | ✅ |
| Rekaman cloud (Supabase Storage) | ✅ |
| Papan tulis kolaboratif (tldraw) | ✅ |
| Polling & Q&A | ✅ |
| Tidak perlu install apapun | ✅ |
| **Harga** | **GRATIS** |

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/nayrbryanGaming/Voon
cd Voon
npm install
```

### 2. Setup Services (semua gratis)

| Service | URL |
|---------|-----|
| Clerk (auth) | https://clerk.com |
| LiveKit Cloud | https://cloud.livekit.io |
| Supabase (DB + storage) | https://supabase.com |
| Anthropic (AI) | sudah tersedia |

### 3. Environment Variables

```bash
cp .env.local.example .env.local
# Edit .env.local dengan kredensial Anda
```

### 4. Database

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Jalankan Lokal

```bash
npm run dev
# Buka http://localhost:3000
```

### 6. Deploy ke Vercel

```bash
# Opsi A: CLI
npm i -g vercel
vercel --prod

# Opsi B: GitHub Integration (direkomendasikan)
# Push ke GitHub → Connect di Vercel → Add env vars → Auto-deploy
```

### 7. Konfigurasi Webhooks (setelah deploy)

1. **Clerk Dashboard** → Webhooks → `https://voon.vercel.app/api/webhooks/clerk`
   - Events: `user.created`, `user.updated`

2. **LiveKit Dashboard** → Webhooks → `https://voon.vercel.app/api/webhooks/livekit`
   - Events: semua room/participant/egress events

---

## 🧬 Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS + CSS Variables |
| Auth | Clerk |
| Database | Supabase (PostgreSQL) |
| ORM | Prisma |
| Video/Audio | LiveKit Cloud |
| AI | Anthropic Claude (claude-sonnet-4-5) |
| Whiteboard | tldraw |
| State | Zustand |
| Deploy | Vercel |

---

## 📁 Struktur Proyek

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── (auth)/               # Sign-in / Sign-up
│   ├── (app)/                # App (dashboard, meetings, dll)
│   │   ├── dashboard/
│   │   ├── meetings/
│   │   ├── room/[roomId]/    # Live meeting
│   │   ├── recordings/
│   │   ├── attendance/
│   │   ├── whiteboard/
│   │   └── settings/
│   └── api/                  # API routes
│       ├── livekit/          # Token generation
│       ├── meetings/         # CRUD
│       ├── ai/               # Summarize, quiz, captions
│       ├── attendance/
│       ├── webhooks/         # Clerk + LiveKit
│       └── upload/
├── components/
│   ├── landing/              # Hero, Features, dll
│   ├── layout/               # Sidebar, Topbar, dll
│   ├── meeting/              # VideoGrid, ControlBar, Chat, dll
│   ├── ai/                   # AISummaryCard, AIQuizModal, dll
│   ├── attendance/
│   └── whiteboard/
├── lib/                      # Helpers (prisma, supabase, livekit, anthropic)
├── store/                    # Zustand store
└── types/                    # TypeScript types
```

---

## 🤖 AI Features

Semua menggunakan **Anthropic Claude** (`claude-sonnet-4-5`):

- **Notulen Otomatis** — Setelah meeting selesai, Claude merangkum transcript
- **Action Items** — Ekstrak tugas dan PIC dari diskusi
- **Kuis Generator** — 5 soal MCQ dari materi yang dibahas
- **Live Captions** — Web Speech API + Claude untuk cleanup teks

---

*Voon — 2025. Dibangun untuk kampus Indonesia. Gratis selamanya.*
