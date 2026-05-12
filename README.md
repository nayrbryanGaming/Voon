# Voon — Meet at the Speed of Voice

> **Platform video conference gratis, unlimited, berbasis AI — khusus civitas akademika Indonesia.**

[![Deploy Status](https://img.shields.io/badge/deploy-vercel-black?logo=vercel)](https://voon.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

**Live Demo:** [https://voon.vercel.app](https://voon.vercel.app)
**Repository:** [https://github.com/nayrbryanGaming/Voon](https://github.com/nayrbryanGaming/Voon)

---

## Mengapa Voon?

Zoom membatasi 40 menit. Google Meet butuh akun Google Workspace. Teams butuh lisensi Microsoft 365. **Voon tidak membutuhkan apapun** — cukup buka browser, masuk dengan email kampus, dan mulai meeting seketika.

| Fitur | Zoom (Free) | Google Meet | **Voon** |
|-------|------------|-------------|----------|
| Batas waktu | 40 menit | 60 menit | **Unlimited** |
| Peserta | 100 | 100 | **Unlimited** |
| AI Meeting Minutes | Tidak | Tidak | **Auto** |
| AI Absensi Otomatis | Tidak | Tidak | **Auto** |
| AI Quiz Generator | Tidak | Tidak | **Live** |
| Live Caption Bahasa Indonesia | Berbayar | Terbatas | **Native** |
| Whiteboard Kolaboratif | Berbayar | Tidak | **Built-in** |
| Breakout Rooms | Berbayar | Ya | **Built-in** |
| Rekam & Replay dengan AI | Berbayar | Tidak | **Built-in** |
| Polling & Q&A Anonim | Berbayar | Tidak | **Built-in** |
| Instalasi | Diperlukan | Tidak | **Browser Only** |

---

## Fitur Utama

### Video Conference
- WebRTC HD via LiveKit Cloud SFU — kualitas enterprise, gratis
- Gallery & Speaker view — switch otomatis saat screen share
- Screen sharing dengan anotasi
- Virtual backgrounds (blur, kantor, kampus, perpustakaan)
- Noise cancellation toggle
- Raise hand & emoji reactions real-time

### AI Features (powered by Anthropic Claude)
- **Auto Meeting Summary** — notulen otomatis setelah setiap rapat
- **Action Items Extraction** — tugas & deadline diparsing dari percakapan
- **Live Captions** — Web Speech API + AI correction (Bahasa Indonesia & English)
- **AI Quiz Generator** — buat 5 soal kuis dari materi yang dibahas, mid-meeting
- **Smart Attendance** — kehadiran dicatat otomatis via LiveKit webhooks, tanpa roll-call

### Kolaborasi
- In-room chat real-time via LiveKit DataChannel
- Collaborative whiteboard — tldraw v2, persistent, multi-user
- Breakout rooms — bagi peserta ke kelompok kecil otomatis
- Live polling dengan mode anonim
- Invite via link atau kode 6-digit

### Manajemen Kampus
- Attendance dashboard — laporan kehadiran per meeting, export siap cetak
- Meeting recap — summary, action items, transcript, quiz results
- Recording & replay — cloud recording ke Supabase Storage
- Role-based access — Mahasiswa, Dosen, Admin kampus

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | Next.js 15 (App Router, Server Components) |
| Language | TypeScript 5.7 |
| Styling | Tailwind CSS 3.4 + CSS Variables |
| Auth | Clerk (free tier, webhook sync) |
| Database | Supabase PostgreSQL (free tier) |
| ORM | Prisma 5 |
| Video/Audio | LiveKit Cloud (free tier, WebRTC SFU) |
| AI | Anthropic Claude claude-sonnet-4-6 |
| Whiteboard | tldraw v2 |
| Animations | Framer Motion 11 |
| State | Zustand 4 |
| Forms | React Hook Form 7 + Zod 3 |
| Deploy | Vercel (free hobby tier) |
| CI/CD | GitHub Actions (CI) + Vercel GitHub Integration (deploy) |

---

## Quick Start

### Prerequisites
- Node.js 20+
- Akun [Clerk](https://clerk.com) (free)
- Akun [Supabase](https://supabase.com) (free)
- Akun [LiveKit Cloud](https://livekit.io) (free)
- Akun [Anthropic](https://console.anthropic.com) (API key)

### 1. Clone & Install

```bash
git clone https://github.com/nayrbryanGaming/Voon.git
cd Voon
npm install
```

### 2. Setup Environment

```bash
cp .env.local.example .env.local
# Edit .env.local dengan semua API key Anda
```

### 3. Setup Database

```bash
npx prisma generate
npx prisma db push
```

### 4. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

```env
# CLERK AUTH
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxx
CLERK_SECRET_KEY=sk_test_xxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
CLERK_WEBHOOK_SECRET=whsec_xxxx

# LIVEKIT
LIVEKIT_API_KEY=APIxxxx
LIVEKIT_API_SECRET=xxxx
NEXT_PUBLIC_LIVEKIT_URL=wss://your-app.livekit.cloud

# SUPABASE
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxx
DATABASE_URL=postgresql://postgres:xxxx@db.xxxx.supabase.co:5432/postgres

# ANTHROPIC
ANTHROPIC_API_KEY=sk-ant-xxxx

# APP
NEXT_PUBLIC_APP_URL=https://voon.vercel.app
```

---

## Deploy ke Vercel

### Cara 1: Vercel Dashboard (Rekomendasi)

1. Import repo di [vercel.com/new](https://vercel.com/new)
2. Set semua environment variables di Vercel Dashboard > Settings > Environment Variables
3. Deploy otomatis setiap push ke `main`

### Cara 2: GitHub Actions (Sudah Terkonfigurasi)

Workflow CI ada di `.github/workflows/deploy.yml` — menjalankan type check dan build di setiap push.
**Deployment ditangani otomatis oleh Vercel GitHub Integration** (tidak perlu token Vercel manual).

```
Repository > Settings > Secrets:
  VERCEL_ORG_ID       # opsional, untuk monitoring
  VERCEL_PROJECT_ID   # opsional, untuk monitoring
```

---

## Setup Webhooks

### Clerk Webhook
1. Clerk Dashboard > Webhooks > Add Endpoint
2. URL: `https://voon.vercel.app/api/webhooks/clerk`
3. Events: `user.created`, `user.updated`
4. Copy signing secret ke `CLERK_WEBHOOK_SECRET`

### LiveKit Webhook
1. LiveKit Cloud Dashboard > Settings > Webhooks
2. URL: `https://voon.vercel.app/api/webhooks/livekit`
3. Events: `room_started`, `room_finished`, `participant_joined`, `participant_left`, `egress_ended`

---

## Database Schema

```
User --- Campus
  |
  +--- Meeting (as Host)
  |      +--- Participant[]
  |      +--- Attendance[]
  |      +--- Transcript
  |      +--- MeetingSummary
  |      +--- Poll[]
  |
  +--- Attendance[]
```

---

## API Routes

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/livekit` | Generate LiveKit access token |
| GET/POST | `/api/meetings` | List / buat meeting |
| GET/PATCH | `/api/meetings/[id]` | Detail / update meeting |
| POST | `/api/ai/summarize` | Summarize transcript |
| POST | `/api/ai/quiz` | Generate quiz dari transcript |
| POST | `/api/ai/action-items` | Extract action items |
| GET/POST | `/api/ai/transcribe` | Simpan / ambil transcript |
| GET/POST | `/api/attendance` | Data kehadiran |
| GET/POST | `/api/polls` | Polling meeting |
| POST | `/api/polls/[id]/vote` | Vote polling |
| POST | `/api/recordings/start` | Mulai cloud recording |
| POST | `/api/recordings/stop` | Stop cloud recording |
| POST | `/api/upload` | Upload file ke Supabase Storage |
| POST | `/api/webhooks/clerk` | Sync user dari Clerk |
| POST | `/api/webhooks/livekit` | Handle room events |

---

## Project Structure

```
src/
├── app/
│   ├── (app)/              # Protected app shell
│   │   ├── dashboard/      # Home dashboard
│   │   ├── meetings/       # Meeting management
│   │   ├── room/[roomId]/  # Live meeting room (core)
│   │   ├── recordings/     # Cloud recordings
│   │   ├── attendance/     # Attendance reports
│   │   ├── whiteboard/     # Collaborative whiteboard
│   │   └── settings/       # User settings
│   ├── (auth)/             # Sign in / Sign up
│   ├── api/                # API routes
│   ├── join/               # Join by code — form entry
│   └── join/[code]/        # Join by invite code — redirect
├── components/
│   ├── meeting/            # VideoGrid, ControlBar, ChatPanel, etc.
│   ├── ai/                 # AISummaryCard, AIQuizModal, etc.
│   ├── attendance/         # AttendanceTable, AttendanceBadge
│   ├── landing/            # Hero, Features, Pricing, CTA
│   ├── layout/             # Sidebar, Topbar, MobileNav
│   └── ui/                 # Base UI components
├── hooks/                  # useChat, useRecording, useCaptions, etc.
├── lib/                    # livekit, anthropic, prisma, supabase, utils
├── store/                  # Zustand global state
└── types/                  # TypeScript type definitions
```

---

## Keamanan

- **Auth**: Semua `/app/*` routes dilindungi Clerk middleware (`clerkMiddleware` + `createRouteMatcher`)
- **API Authorization**: Setiap endpoint memverifikasi `userId` dari Clerk session token
- **Ownership Check**: PATCH/DELETE meeting hanya bisa dilakukan oleh host (`hostId === user.id`)
- **Field Whitelist**: PATCH meeting hanya mengizinkan field yang diizinkan (tidak ada privilege escalation)
- **Attendance Privacy**: Data kehadiran meeting hanya bisa diakses host meeting tersebut
- **Upload Sanitization**: Bucket name diwhitelist, ekstensi file disanitasi
- **Webhooks**: LiveKit webhook diverifikasi `WebhookReceiver`; Clerk dengan SVIX HMAC signature
- **Browser Permissions**: `Permissions-Policy: camera=*, microphone=*` hanya pada `/room/*`
- **COOP/COEP Headers**: `Cross-Origin-Opener-Policy` + `Cross-Origin-Embedder-Policy` pada `/room/*` untuk SharedArrayBuffer
- **AI Robustness**: JSON.parse dengan regex extraction fallback, try/catch di semua AI endpoints

---

## Setup Supabase Storage (Cloud Recording)

1. Supabase Dashboard > Storage > New Bucket
2. Buat bucket: `recordings` (public atau private sesuai kebutuhan)
3. Buat bucket: `avatars` (public)
4. Set `SUPABASE_SERVICE_ROLE_KEY` di Vercel untuk write access

LiveKit EgressClient akan menyimpan recording langsung ke S3-compatible storage Supabase.

---

## Troubleshooting

| Error | Solusi |
|-------|--------|
| `PrismaClientInitializationError` | `npx prisma generate` + pastikan `DATABASE_URL` benar |
| `LiveKit token invalid` | Cek `LIVEKIT_API_KEY` dan `LIVEKIT_API_SECRET` |
| Kamera tidak muncul di lobby | Izinkan akses kamera/mikrofon di browser |
| AI Summary tidak muncul | Cek `ANTHROPIC_API_KEY` dan LiveKit webhook sudah terdaftar |
| Recording gagal | Pastikan bucket `recordings` sudah dibuat di Supabase |

---

## Scripts

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run start        # Start production server
npm run db:migrate   # Run Prisma migrations
npm run db:generate  # Regenerate Prisma client
npm run db:studio    # Open Prisma Studio (DB GUI)
```

---

## Contributing

1. Fork repo
2. Buat branch: `git checkout -b feat/nama-fitur`
3. Commit: `git commit -m "feat: tambah fitur X"`
4. Push & buka Pull Request

---

## License

MIT License — 2025 Voon

---

**Voon** — Free. Unlimited. Built for campus Indonesia.
[voon.vercel.app](https://voon.vercel.app)
