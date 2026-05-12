# 🎙️ Voon — Meet at the Speed of Voice

> Platform video conference gratis, unlimited, khusus kampus Indonesia. Didukung AI untuk transkripsi, ringkasan, dan interaksi yang lebih cerdas.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/nayrbryanGaming/Voon)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

**Live Demo:** [https://voon-nayrbryangamings-projects.vercel.app](https://voon-nayrbryangamings-projects.vercel.app)

---

## 📖 Daftar Isi
- [✨ Fitur Utama](#-fitur-utama)
- [🤖 Fitur AI (Didukung Claude 3.5 Sonnet)](#-fitur-ai-didukung-claude-35-sonnet)
- [🧬 Teknologi (Tech Stack)](#-teknologi-tech-stack)
- [🚀 Panduan Mulai Cepat (Quick Start)](#-panduan-mulai-cepat-quick-start)
- [⚙️ Konfigurasi Environment](#️-konfigurasi-environment)
- [🌐 Webhooks & Integrasi](#-webhooks--integrasi)
- [📁 Struktur Proyek](#-struktur-proyek)
- [📈 Roadmap & Kontribusi](#-roadmap--kontribusi)
- [📄 Lisensi](#-lisensi)

---

## ✨ Fitur Utama

| Fitur | Status | Deskripsi |
|-------|--------|-----------|
| **Video HD Tanpa Batas** | ✅ | Lakukan panggilan video kualitas HD tanpa batasan waktu seperti platform berbayar. |
| **Kapasitas Besar** | ✅ | Mendukung 100+ peserta dalam satu ruangan secara bersamaan tanpa lag berkat LiveKit. |
| **Rekaman Cloud** | ✅ | Rekam rapat Anda secara langsung dan simpan dengan aman menggunakan Supabase Storage. |
| **Absensi Otomatis** | ✅ | Sistem akan mendeteksi partisipan yang hadir, durasi, dan membuat laporan absensi. |
| **Whiteboard Interaktif**| ✅ | Papan tulis kolaboratif real-time terintegrasi penuh berkat `tldraw`. |
| **Tanpa Instalasi** | ✅ | 100% berjalan di peramban web modern (Progressive Web App support). |
| **Harga** | **GRATIS**| Dibangun untuk pendidikan, tanpa biaya berlangganan. |

---

## 🤖 Fitur AI (Didukung Claude 3.5 Sonnet)

Voon membawa rapat online ke level selanjutnya dengan integrasi **Anthropic Claude 3.5 Sonnet** yang kuat:

- **Notulensi Cerdas & Otomatis**: Setelah rapat selesai, AI akan menganalisis transkripsi obrolan dan memberikan rangkuman terstruktur dalam Bahasa Indonesia.
- **Ekstraksi Action Items**: AI akan membedah siapa yang harus melakukan apa *(Task & PIC)* dari diskusi yang berjalan.
- **Kuis Generator Otomatis**: Khusus untuk sesi perkuliahan, AI dapat membaca materi yang dipresentasikan (atau diobrolkan) lalu secara otomatis men-generate 5 soal Pilihan Ganda untuk mengetes pemahaman mahasiswa.
- **Live Captions**: Kombinasi *Web Speech API* lokal dengan *Claude AI* untuk membersihkan, merapihkan teks (cleanup), dan menerjemahkan ucapan secara real-time.

---

## 🧬 Teknologi (Tech Stack)

Voon dibangun di atas ekosistem modern yang sangat cepat dan *scalable*:

| Komponen | Teknologi yang Digunakan |
|----------|--------------------------|
| **Framework** | Next.js 15 (App Router, Turbopack) |
| **Bahasa** | TypeScript 5 |
| **Styling** | Tailwind CSS v3.4 + Glassmorphism Custom UI |
| **Authentication**| Clerk (Seamless login, OAuth, User Management) |
| **Database** | Supabase (PostgreSQL) |
| **ORM** | Prisma (Type-safe database client) |
| **Video/Audio Engine**| LiveKit Cloud (WebRTC, SFU Architecture) |
| **Kecerdasan Buatan** | Anthropic Claude (claude-sonnet-4-5 / 3.5) |
| **Whiteboard** | tldraw |
| **State Management**| Zustand |
| **Deployment** | Vercel |

---

## 🚀 Panduan Mulai Cepat (Quick Start)

Ikuti panduan berikut untuk menjalankan Voon di mesin lokal Anda.

### 1. Prasyarat
Pastikan Anda telah menginstal:
- Node.js (v18+)
- npm / pnpm / yarn
- Git

### 2. Kloning Repositori
```bash
git clone https://github.com/nayrbryanGaming/Voon.git
cd Voon
npm install
```

### 3. Persiapan Layanan Pihak Ketiga (Gratis)
Anda perlu membuat akun di layanan berikut:
- **Clerk** (https://clerk.com) - Untuk Autentikasi
- **LiveKit Cloud** (https://cloud.livekit.io) - Untuk WebRTC Video/Audio
- **Supabase** (https://supabase.com) - Untuk Database PostgreSQL & Storage
- **Anthropic Console** (https://console.anthropic.com) - Untuk API Key Claude

---

## ⚙️ Konfigurasi Environment

Duplikat berkas `.env.local.example` menjadi `.env.local`, lalu isi dengan kredensial yang Anda dapatkan:

```bash
cp .env.local.example .env.local
```

### Inisialisasi Database
Jalankan migrasi Prisma untuk membuat skema tabel:
```bash
npx prisma migrate dev --name init
npx prisma generate
```
*(Opsional) Jika Anda memiliki file seed:*
```bash
npm run db:seed
```

### Menjalankan Server Lokal
```bash
npm run dev
# Server akan berjalan sangat cepat di http://localhost:3000 berkat Turbopack.
```

---

## 🌐 Webhooks & Integrasi

Agar fitur seperti *absensi* dan sinkronisasi pengguna berjalan lancar, Anda wajib mengatur Webhooks setelah mendeploy aplikasi ke production (misalnya di Vercel).

1. **Clerk Webhooks**
   - Buka Clerk Dashboard → Webhooks.
   - Tambahkan endpoint: `https://voon-nayrbryangamings-projects.vercel.app/api/webhooks/clerk`
   - Pilih event: `user.created`, `user.updated`, `user.deleted`.

2. **LiveKit Webhooks**
   - Buka LiveKit Dashboard → Project Settings → Webhooks.
   - Tambahkan endpoint: `https://voon-nayrbryangamings-projects.vercel.app/api/webhooks/livekit`
   - Pilih event: `room_started`, `room_finished`, `participant_joined`, `participant_left`, `egress_started`, `egress_ended`.

---

## 📁 Struktur Proyek

```text
src/
├── app/                      # Next.js App Router
│   ├── (app)/                # Layout utama aplikasi (Dashboard, Meetings, Whiteboard)
│   ├── (auth)/               # Halaman Sign In & Sign Up (Clerk)
│   ├── api/                  # Backend API Routes (LiveKit tokens, Webhooks, AI, Database CRUD)
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Landing Page utama
├── components/               # React Components
│   ├── ai/                   # Komponen khusus UI AI (Quiz, Summaries)
│   ├── landing/              # Komponen Landing Page (Hero, Features, Pricing)
│   ├── layout/               # Navigasi, Sidebar, Footer
│   ├── meeting/              # Video Grid, Chat, Control Bar
│   └── whiteboard/           # Integrasi Tldraw
├── hooks/                    # Custom React Hooks
├── lib/                      # Helper & Utility functions (Prisma client, LiveKit server, Anthropic client)
├── store/                    # Global state management dengan Zustand
└── types/                    # TypeScript Type Definitions (.ts)
```

---

## 📈 Deployment & CI/CD

Voon dioptimalkan untuk berjalan di **Vercel**. 

```bash
# Instal Vercel CLI (jika belum)
npm i -g vercel

# Deploy ke production
vercel --prod
```

---

## 📄 Lisensi

Dibuat dengan ❤️ untuk pendidikan Indonesia.
Voon dilisensikan di bawah [MIT License](LICENSE). Anda bebas memodifikasi dan menggunakannya secara gratis.

*Voon — 2026. Meet at the Speed of Voice.*

