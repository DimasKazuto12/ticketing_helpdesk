"use server";
import { v2 as cloudinary } from 'cloudinary';
import prisma from '@/lib/prisma';

// Pastikan config cloudinary ada di sini atau di file lib
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function createTicket(formData: FormData, captchaToken: string | null) {
  const title = formData.get("subject") as string;
  const description = formData.get("description") as string;
  const clientName = formData.get("name") as string;
  const clientEmail = formData.get("email") as string;
  const categoryId = parseInt(formData.get("category") as string);

  const file = formData.get("attachment") as File;
  let finalAttachment = ""; // Ini akan berisi URL Cloudinary

  if (file && file.size > 0) {
    const buffer = await file.arrayBuffer();
    const base64File = `data:${file.type};base64,${Buffer.from(buffer).toString("base64")}`;

    try {
      // 1. UPLOAD KE CLOUDINARY DULU
      const uploadRes = await cloudinary.uploader.upload(base64File, {
        folder: "ukom_tickets",
      });
      finalAttachment = uploadRes.secure_url; // Gambar jadi URL HTTPS pendek
    } catch (err) {
      console.error("Cloudinary Error:", err);
      // Opsional: kembalikan error jika upload gagal
    }
  }

  try {
    // 2. KIRIM KE API INTERNAL (Sekarang aman dari Error 413!)
    const ticket = await prisma.ticket.create({
      data: {
        ticketCode: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
        clientName,
        clientEmail,
        categoryId: categoryId, // ← pakai categoryId (number)
        title,
        description,
        attachment: finalAttachment,
        status: 'open',
        priority: 'low',
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      data: { ticketCode: ticket.ticketCode }
    };

  } catch (error: any) {
    console.error("ACTION_ERROR:", error.message);
    console.error("Error Code:", error.code);
    return { success: false, error: error.message };
  }
}