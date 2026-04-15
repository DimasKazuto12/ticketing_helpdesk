### ⚡ Distalk Protocol v.2.0 – IT Helpdesk System

**Distalk Protocol** adalah platform manajemen tiket IT Helpdesk modern yang dibangun secara Full-Stack menggunakan **Next.js**. Project ini dirancang untuk efisiensi komunikasi antara Client dan Admin teknis dengan estetika "Cyber-Industrial".

---



#### 🚀 Fitur Unggulan

- **Neural Visual Feed:** Dashboard admin terintegrasi untuk analisis data tiket secara real-time.
- **Full-Stack Next.js Architecture:** Menggabungkan Frontend dan Backend (API Routes & Server Actions) dalam satu ekosistem yang efisien.
- **Advanced Attachment System:** Pengiriman bukti kendala dengan fitur *floating preview* yang responsif.
- **Real-Time Messaging:** Komunikasi instan menggunakan Pusher WebSockets.
- **Interactive UI/UX:** Efek Parallax di Landing Page menggunakan Framer Motion untuk pengalaman visual yang imersif.
- **AI Voice Integration:** Integrasi Voicevox untuk mengubah respon teks menjadi suara.

---



#### 🛠️ Stack Teknologi

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Database & ORM:** PostgreSQL / MySQL dengan [Prisma](https://www.prisma.io/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Services:** Cloudinary (Media), Pusher (Real-time), Voicevox (AI Voice)
- **Node JS** Untuk menjalankan Javascript di terminal

---



#### 🔌 Integrasi Layanan (Third-party Services)

Untuk menghadirkan pengalaman skala industri, project ini terintegrasi dengan:

* **[Cloudinary](https://cloudinary.com/):** Manajemen media dan hosting gambar untuk lampiran tiket (attachments).
* **[Pusher](https://pusher.com/):** Mengelola komunikasi *real-time* via WebSockets agar pesan terkirim secara instan.
* **[Voicevox](https://voicevox.hiroshiba.jp/):** Engine AI Voice untuk mengubah teks respon menjadi suara, memberikan sentuhan futuristik bagi pengguna.

---



#### 📁 Struktur Folder

```text
├── .next/                  # Build output dari Next.js
├── app/                    # Next.js App Router (Routing & Pages Utama)
│   ├── api/                # Route Handlers untuk Backend API
│   ├── dashboard_ad...     # Dashboard Khusus Admin
│   ├── login/              # Halaman Login
│   ├── register/           # Halaman Register
│   ├── results/            # Halaman Hasil Tiket
│   ├── ticket/             # Halaman Tiket
│   ├── track_ticket/       # Halaman Pelacakan Tiket
│   ├── action.ts           # Server Actions (Next.js)
│   ├── layout.tsx          # Root Layout
│   └── page.tsx            # Landing Page Utama (Parallax Universe)
├── components/             # Reusable UI Components (Bubble Chat, Nav, dll)
├── emails/                 # Template email untuk notifikasi
├── lib/                    # Konfigurasi utilitas (Pusher, Cloudinary, Prisma)
├── node_modules/           # Dependencies project
├── prisma/                 # Skema Database (schema.prisma)
├── public/                 # Asset statis (favicon.ico, gambar, logo)
├── .env                    # Environment variables (Private)
├── .gitignore              # Daftar file yang diabaikan oleh Git
├── next.config.mjs         # Konfigurasi kustom Next.js
├── package.json            # Daftar dependencies & scripts (bun dev, dll)
└── postcss.config.mjs      # Konfigurasi Tailwind CSS / PostCSS
```

---



#### ⚙️ Konfigurasi Environment (.env)

Buat file `.env` di root direktori dan isi dengan kredensial berikut:

```env
# Next JS
NEXT_PUBLIC_APP_URL=your_public_url

# Postgre
DATABASE_URL=your_database_url

# Groq
GROQ_API_KEY=your_groq_key

# Ngrok
NEXT_RESPONSIVE_URL=your_ngrok_url

# Gmail
EMAIL_USER=your_email
EMAIL_PASS=your_password

# Recaptha Google
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_public_key
RECAPTCHA_SECRET_KEY=your_secret_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

# Pusher
PUSHER_APP_ID=your_id
PUSHER_KEY=your_key
PUSHER_SECRET=your_secret
PUSHER_CLUSTER=your_cluster

# Gemini
GEMINI_API_KEY=your_gemini_key

# Voicevox
VOICEVOX_API_URL=http://localhost:50021
```

---



#### 💻 Cara Menjalankan Project

Ikuti langkah-langkah berikut untuk menjalankan project di lingkungan lokal:

### 1. Clone & Install
```bash
git clone [https://github.com/DimasKazuto12/ticketing_helpdesk.git](https://github.com/DimasKazuto12/ticketing_helpdesk.git)
cd ticketing_helpdesk
npm install
```

### 2. Database Setup
Pastikan variabel `DATABASE_URL` sudah terisi di file `.env`.
```bash
npx prisma generate
npx prisma db push
```

### 3. Running
```bash
npm run dev
```
Akses aplikasi melalui: http://localhost:3000



#### 🚀 Optimasi & Performa

* **Server Actions**: Digunakan untuk pengolahan data di sisi server (seperti pada `action.ts`), yang secara signifikan mengurangi beban JavaScript di sisi browser.
* **Image Optimization**: Memanfaatkan fitur `next/image` untuk memastikan pemuatan aset visual yang lebih ringan dan efisien.
* **Clean Architecture**: Struktur folder memisahkan logika backend di dalam folder `api` dan `lib` agar kode lebih modular dan mudah dirawat.

---



#### 👤 Kontak & Pengembang

**Dimas Aditiya Pratama** *Aspiring Animator & Full-Stack Developer*

* **GitHub**: [@DimasKazuto12](https://github.com/DimasKazuto12)
* **Project Type**: Uji Kompetensi (UKOM) 2026

---

## 📝 Maintenance Notes

* Gunakan perintah `npx prisma studio` untuk memantau dan mengelola data tiket secara visual melalui antarmuka browser.
* Fitur **Voice Synthesis** membutuhkan engine **Voicevox** yang berjalan secara lokal agar respon suara AI dapat berfungsi dengan baik.
