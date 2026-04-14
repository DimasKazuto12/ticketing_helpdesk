"use server";
import { PrismaClient, Priority, TicketStatus } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Groq from "groq-sdk";
import { revalidatePath } from "next/cache";
import Pusher from "pusher";

const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

const prisma = new PrismaClient();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function getAdminDashboardData() {
  const allTickets = await prisma.ticket.findMany();

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const monthlyStats = months.map((month, index) => {
    const monthTickets = allTickets.filter(
      (t) => new Date(t.createdAt).getMonth() === index,
    );
    return {
      month,
      total: monthTickets.length,
      closed: monthTickets.filter(
        (t) => String(t.status).toLowerCase() === "closed",
      ).length,
    };
  });

  // 2. Sepuluh Kategori Terbanyak
  const categoriesGroup = await prisma.ticket.groupBy({
    by: ["categoryId"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 10,
  });

  const categoryData = categoriesGroup.map((item) => ({
    name: `Cat-${item.categoryId}`, // Gantilah ini dengan logika pencarian nama jika ada
    count: item._count.id,
  }));

  return { monthlyStats, categoryData, totalTickets: allTickets.length };
}


export async function analyzeTicketWithAI(description: string, attachment?: string) {
  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  console.log("🔍 --- PEMERIKSAAN SYARAT NEURAL ---");
  console.log("📸 Attachment Ada?:", attachment ? "YA (Panjang: " + attachment.length + ")" : "TIDAK");
  console.log("🔑 API Key Ada?:", geminiKey ? "YA (Awalan: " + geminiKey.substring(0, 5) + "...)" : "TIDAK");
  console.log("-------------------------------------");

  // 1. Validasi API Key Utama
  if (!geminiKey) {
    console.error("❌ GEMINI_API_KEY tidak ditemukan di .env");
  }

  const systemPrompt = `Anda adalah "Neural Analysis Helpdesk". Tugas Anda adalah melakukan diagnosa teknis secara profesional dan objektif.

  INSTRUKSI:
  1. Analisis teks deskripsi dan gambar attachment (jika ada).
  2. Jika input tidak relevan atau tidak lengkap, minta informasi tambahan secara sopan dan profesional.
  3. Jika input jelas, berikan diagnosa singkat dan solusi teknis yang tepat sasaran.

  WAJIB OUTPUT JSON:
  {
    "summary": "[Diagnosa Teknis] + [Langkah Solusi]",
    "recommendedCategory": "Software / Hardware / UI/UX Bug / Other",
    "priority": "Tinggi / Sedang / Low"
  }`;

  // --- STRATEGI 1: GEMINI VISION (Prioritas Utama) ---
  // --- STRATEGI 1: GEMINI VISION ---
  if (attachment && geminiKey) {
    console.log("🚀 [DEBUG] Masuk ke blok Gemini...");
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${geminiKey}`;

      let base64Image = "";
      let mimeType = "image/jpeg";

      if (attachment.startsWith("data:")) {
        console.log("📦 [DEBUG] Mendeteksi string Base64...");
        // Perbaikan pemotongan string base64
        const parts = attachment.split(",");
        if (parts.length > 1) {
          base64Image = parts[1];
          const match = attachment.match(/data:(.*);base64/);
          mimeType = match ? match[1] : "image/jpeg";
        } else {
          throw new Error("Format Base64 tidak valid");
        }
      } else {
        console.log("🌐 [DEBUG] Mendeteksi URL, mencoba fetch...");
        const imageResponse = await fetch(attachment);
        const arrayBuffer = await imageResponse.arrayBuffer();
        base64Image = Buffer.from(arrayBuffer).toString("base64");
        mimeType = imageResponse.headers.get("content-type") || "image/jpeg";
      }

      console.log("📡 [DEBUG] Mengirim ke Google API. Mime:", mimeType, "Panjang Base64:", base64Image.length);

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: systemPrompt + `\nIDENTITAS: GEMINI-VISUAL. Deskripsi: "${description}"` },
              { inline_data: { mime_type: mimeType, data: base64Image } }
            ]
          }],
          generationConfig: { response_mime_type: "application/json", temperature: 0.8 }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ [DEBUG] Gemini Berhasil Merespon!");
        const rawText = data.candidates[0].content.parts[0].text;
        const aiResponse = JSON.parse(rawText);
        return { ...aiResponse };
      } else {
        const errBody = await response.text();
        console.error("❌ [DEBUG] Google API Marah:", errBody);
        // Jangan return, biar lanjut ke Groq di bawah
      }
    } catch (err: any) {
      console.error("💥 [DEBUG] Gemini Crash:", err.message);
      // Lanjut ke Groq
    }
  } else {
    console.log("⏭️ [DEBUG] Gemini di-skip (Attachment atau Key tidak ada)");
  }

  // --- STRATEGI 2: GROQ FALLBACK (Jika Gemini gagal atau tidak ada gambar) ---
  if (groqKey) {
    console.log("📡 Neural Sync: Menggunakan Groq Backup...");
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `${systemPrompt}\n[CONTEXT: ANALISIS TEKS SAJA]. Berikan diagnosa profesional berdasarkan deskripsi user.`
          },
          { role: "user", content: `Deskripsi: ${description}` }
        ],
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
        temperature: 0.8,
      });

      const rawText = completion.choices[0]?.message?.content;
      const aiResponse = JSON.parse(rawText || "{}");

      return {
        ...aiResponse,
        engine: "Groq Llama 3.3"
      };
    } catch (err) {
      console.error("💥 Groq Error:", err);
    }
  }

  // --- STRATEGI 3: EMERGENCY RETURN (Jika semua mati) ---
  return {
    summary: "[SYSTEM-OFFLINE] Neural Core gagal merespon. Harap analisis manual.",
    recommendedCategory: "Other",
    priority: "Sedang"
  };
}

export async function getAllTickets() {
  try {
    return await prisma.ticket.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        aiSuggestions: true,
        replies: true,
      }
    });
  } catch (error) {
    console.error("Error fetch tickets:", error);
    return [];
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  redirect("/login");
}

export async function deleteTicket(id: number) {
  try {
    // 1. Cek apakah tiket ada
    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return { success: false, error: "Record not found in Neural Database" };
    }

    // 2. Hapus tiket
    await prisma.ticket.delete({
      where: { id },
    });

    // 3. Refresh cache Next.js agar data di dashboard otomatis terupdate
    revalidatePath("/dashboard_admin");

    return { success: true };
  } catch (error) {
    console.error("Delete Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Critical System Failure during wiping"
    };
  }
}

export async function updateTicket(
  ticketId: number,
  data: { summary: string, category: string, priority: string, status: string } // Tambah parameter status
) {
  try {
    // 1. Mapping Priority (High, Medium, Low)
    let dbPriority: Priority = Priority.low;
    const p = data.priority.toLowerCase();
    if (p.includes("tinggi") || p.includes("high")) dbPriority = Priority.high;
    else if (p.includes("sedang") || p.includes("medium")) dbPriority = Priority.medium;

    // 2. Mapping Status sesuai Enum Prisma (open, in_progress, closed)
    let dbStatus: TicketStatus = TicketStatus.in_progress; // Default sesuai keinginanmu
    const s = data.status.toLowerCase();
    if (s === "closed" || s === "resolved") dbStatus = TicketStatus.closed;
    else if (s === "open" || s === "unresolved") dbStatus = TicketStatus.open;

    // 3. Cari Kategori
    let categoryRecord = await prisma.category.findFirst({
      where: {
        categoryName: { contains: data.category, mode: 'insensitive' },
      },
    });

    // 4. Update Ticket
    await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        priority: dbPriority,
        status: dbStatus, // Sekarang dinamis mengikuti dropdown
        categoryId: categoryRecord ? categoryRecord.id : 1,
        aiSuggestions: {
          upsert: {
            create: {
              aiSummary: data.summary,
              aiSuggestedCategory: data.category,
              aiSuggestedPriority: dbPriority,
            },
            update: {
              aiSummary: data.summary,
              aiSuggestedCategory: data.category,
              aiSuggestedPriority: dbPriority,
            }
          }
        }
      },
    });

    await pusherServer.trigger(`ticket-${ticketId}`, 'ticket-updated', {
      status: dbStatus,
      priority: dbPriority
    });

    revalidatePath("/dashboard_admin");
    return { success: true };
  } catch (error: any) {
    console.error("UPDATE_ERROR:", error);
    return { success: false, error: error.message };
  }
}

// action.ts
export async function sendReplyAction(ticketId: number, message: string) {
  try {
    await prisma.ticketReply.create({
      data: {
        ticketId: ticketId,
        message: message,
        senderType: "admin", // Karena dikirim dari dashboard admin
        // userId: ... (opsional jika ada auth)
      },
    });

    revalidatePath("/dashboard_admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to send reply:", error);
    return { success: false };
  }
}

export async function addAdminAction(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    // Gunakan Prisma untuk insert data
    await prisma.user.create({
      data: {
        name,
        email,
        password, // Disarankan pakai bcrypt untuk hash!
        role: "admin"
      }
    });
    return { success: true };
  } catch (error) {
    return { success: false, message: "Link Error: Identity already exists" };
  }
}

// Tambahkan di action.ts
export async function getAdminProfile() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  console.log("DEBUG - ISI COOKIE:", session?.value);

  if (!session) return null;

  const admin = await prisma.user.findFirst({
    where: {
      email: session.value,
      role: "admin"
    },
    select: { name: true, role: true, email: true } // Ambil yang perlu saja
  });

  return admin;
}

// Tambahkan di bagian paling bawah file action.ts
export async function deleteAdminAction(id: number) {
  try {
    // 1. Cek dulu apakah admin tersebut ada
    const admin = await prisma.user.findUnique({
      where: { id },
    });

    if (!admin) {
      return { success: false, message: "Admin not found in Neural Database" };
    }

    // 2. Eksekusi penghapusan
    await prisma.user.delete({
      where: { id },
    });

    // 3. Refresh cache agar tabel di dashboard langsung update
    revalidatePath("/dashboard_admin");

    return { success: true };
  } catch (error) {
    console.error("Delete Admin Error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Critical System Failure during wiping"
    };
  }
}

export async function getAdminsAction() {
  try {
    const admins = await prisma.user.findMany({
      where: {
        role: "admin" // Sesuai enum UserRole di schema kamu
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return { success: true, data: admins };
  } catch (error) {
    console.error("Neural Error during fetching admins:", error);
    return { success: false, message: "Gagal mengambil data admin" };
  }
}

export async function chatWithNeuralAI(
  userMessage: string,
  attachment?: string,
  history: any[] = [],
  ticketBaseInfo?: { title: string; description: string }
) {
  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  // 1. Susun Riwayat Chat agar AI ingat percakapan sebelumnya
  const chatContext = history.length > 0
    ? history.map(h => `${h.senderType === 'client' ? 'User' : 'Assistant'}: ${h.message}`).join("\n")
    : "Ini adalah awal percakapan.";

  // 2. System Prompt yang lebih fleksibel dan mendukung Vision
  const systemPrompt = `Anda adalah "Neural Chatbot" pada sistem IT Helpdesk.
  
  KONTEKS TIKET SAAT INI:
  - Masalah Utama: ${ticketBaseInfo?.title || "Umum"}
  - Penjelasan Awal: ${ticketBaseInfo?.description || "Tidak ada"}

  RIWAYAT PERCAKAPAN SEBELUMNYA:
  ${chatContext}

  INSTRUKSI TUGAS:
  1. Analisis pesan terbaru dari user dan gambar yang dilampirkan (jika ada).
  2. Hubungkan apa yang terlihat di gambar dengan keluhan user.
  3. Jika user bertanya hal teknis seperti "kelipet", hubungkan dengan kabel fiber optik atau tembaga.
  4. Berikan jawaban yang solutif, singkat, dan profesional.

  WAJIB OUTPUT JSON:
  { "summary": "[Jawaban Anda]", "recommendedCategory": "Chat", "priority": "Low" }`;

  // --- LOGIKA FETCH GEMINI (Multimodal: Teks + Gambar) ---
  if (attachment && geminiKey) {
    try {
      // Gunakan model 1.5-flash untuk vision yang lebih stabil
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${geminiKey}`;

      let base64Image = "";
      let mimeType = "image/jpeg";

      // LOGIKA SAMA DENGAN ANALYZE TICKET (Deteksi MimeType Otomatis)
      if (attachment.startsWith("data:")) {
        const parts = attachment.split(",");
        if (parts.length > 1) {
          base64Image = parts[1];
          const match = attachment.match(/data:(.*);base64/);
          mimeType = match ? match[1] : "image/jpeg";
        }
      } else {
        // Jika input berupa URL
        const imageResponse = await fetch(attachment);
        const arrayBuffer = await imageResponse.arrayBuffer();
        base64Image = Buffer.from(arrayBuffer).toString("base64");
        mimeType = imageResponse.headers.get("content-type") || "image/jpeg";
      }

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: `${systemPrompt}\n\nUSER MESSAGE: "${userMessage}"\n(Lihat dan analisa gambar berikut untuk menjawab)` },
              { inline_data: { mime_type: mimeType, data: base64Image } }
            ]
          }],
          generationConfig: { 
            response_mime_type: "application/json",
            temperature: 0.7 
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return JSON.parse(data.candidates[0].content.parts[0].text);
      }
    } catch (err) { 
      console.error("❌ Gemini Vision Chat Error:", err); 
    }
  }

  // --- LOGIKA FETCH GROQ (Fallback: Hanya Teks) ---
  if (groqKey) {
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
      });
      return JSON.parse(completion.choices[0]?.message?.content || "{}");
    } catch (err) {
      console.error("❌ Groq Chat Error:", err);
    }
  }

  return { summary: "Maaf, sistem Neural sedang mengalami gangguan koneksi." };
}

// --- FUNGSI AUTO-REPLY NEURAL ---
export async function autoAiReplyAction(ticketId: number, userMessage: string, userAttachment?: string) {
  try {
    // 1. Kirim sinyal "Neural is typing" ke Pusher agar User melihat animasi gelembung
    await pusherServer.trigger(`ticket-${ticketId}`, 'client-typing', { typing: true });

    const history = await prisma.ticketReply.findMany({
      where: { ticketId: ticketId },
      orderBy: { createdAt: "asc" },
      take: 4,
    });

    // Panggil chatbot murni analisa chat
    const aiResponse = await chatWithNeuralAI(userMessage, userAttachment, history);

    // 3. Simpan jawaban AI ke Database sebagai 'admin' dengan penanda isAi: true
    const botReply = await prisma.ticketReply.create({
      data: {
        ticketId: ticketId,
        message: aiResponse.summary,
        senderType: "bot",
        isAi: true, // Pastikan kamu sudah migrate schema ini tadi
      },
    });

    // 4. Kirim pesan asli AI ke Pusher agar muncul di layar secara Real-time
    await pusherServer.trigger(`ticket-${ticketId}`, 'new-reply', {
      ...botReply,
      isAi: true
    });

    await pusherServer.trigger('admin-updates', 'new-reply', {
      ...botReply,
      ticketId: ticketId, // Sangat penting agar admin tahu ini reply untuk tiket mana
      isAi: true
    });

    // 5. Matikan sinyal "typing"
    await pusherServer.trigger(`ticket-${ticketId}`, 'client-typing', { typing: false });

    return { success: true };
  } catch (error) {
    console.error("❌ Neural Auto-Reply Crash:", error);
    // Matikan sinyal typing jika error agar tidak nyangkut di layar user
    await pusherServer.trigger(`ticket-${ticketId}`, 'client-typing', { typing: false });
    return { success: false };
  }
}

// action.ts
export async function toggleGlobalAiAssistant(isActive: boolean) {
  try {
    // 1. Update di Database (Misal kita punya tabel 'GlobalSettings')
    // Atau jika per-tiket, gunakan updateMany seperti kodemu sebelumnya
    await prisma.ticket.updateMany({
      where: { status: { in: ['open', 'in_progress'] } },
      data: { isAiActive: isActive }
    });

    // 2. Kirim sinyal Pusher (Global Channel)
    await pusherServer.trigger('admin-events', 'global-ai-update', {
      isActive: isActive
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}

// Tambahkan fungsi untuk mengambil status saat pertama kali Admin buka Dashboard
export async function getGlobalAiStatus() {
  // Cek apakah ada minimal satu tiket yang AI-nya aktif
  const activeTicket = await prisma.ticket.findFirst({
    where: { isAiActive: true, status: { in: ['open', 'in_progress'] } }
  });
  return !!activeTicket;
}

export async function toggleTicketAiStatus(ticketId: number, status: boolean) {
  try {
    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: { isAiActive: status },
    });

    // KIRIM SINYAL KE PUSHER
    // Agar jika ada Admin lain yang buka, tombol mereka juga ikutan geser otomatis
    await pusherServer.trigger(`ticket-${ticketId}`, 'ai-status-updated', {
      ticketId: ticketId,
      isAiActive: status,
    });

    // Tetap gunakan ini agar Next.js membersihkan cache server-side
    revalidatePath("/dashboard_admin");

    return { success: true, data: updated };
  } catch (error) {
    console.error("Gagal update status AI:", error);
    return { success: false };
  }
}