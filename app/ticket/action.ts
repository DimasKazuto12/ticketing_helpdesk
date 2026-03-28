"use server";
import { v2 as cloudinary } from 'cloudinary';

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
  const category = formData.get("category") as string;
  
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
    const response = await fetch("http://localhost:3000/api/ticket", { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        clientName,
        clientEmail,
        category,
        attachment: finalAttachment, // Cuma URL pendek, misal: https://res.cloudinary.com/...
        captchaToken,
      }),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Gagal mengirim tiket");

    return { success: true, data: result.data };
  } catch (error: any) {
    console.error("ACTION_ERROR:", error.message);
    return { success: false, error: error.message };
  }
}