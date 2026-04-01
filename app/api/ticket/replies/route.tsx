import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { render } from "@react-email/render";
import { AdminReplyEmail } from "@/emails/ReplyAdmin"; // Template yang kita buat tadi
import nodemailer from "nodemailer";
import Pusher from 'pusher';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ticketId, message, sender, attachment } = body;

    let finalAttachmentUrl = attachment;

    // --- LOGIKA UPLOAD CLOUDINARY (TAMBAHAN PENTING) ---
    if (attachment && attachment.startsWith('data:image')) {
      try {
        const uploadRes = await cloudinary.uploader.upload(attachment, {
          folder: 'neural_chat_attachments',
        });
        finalAttachmentUrl = uploadRes.secure_url; // Ganti Base64 jadi URL HTTPS
      } catch (uploadErr) {
        console.error("Cloudinary Error:", uploadErr);
        // Jika gagal upload, tetap lanjut agar chat tidak macet total
      }
    }

    // 1. SIMPAN KE DATABASE (Wajib ditunggu/await)
    const newReply = await prisma.ticketReply.create({
      data: {
        ticketId: Number(ticketId),
        message: message || "",
        senderType: sender === 'ADMIN' ? 'admin' : 'client',
        attachment: finalAttachmentUrl,
        userId: null,
      },
    });

    // 2. TRIGGER PUSHER (Jangan pakai await, biarkan jalan di background)
    pusher.trigger(`ticket-${ticketId}`, 'new-reply', newReply).catch(e => console.error(e));

    // 3. KIRIM EMAIL (INI YANG PALING LAMBAT - Jangan pakai await!)
    if (sender === 'ADMIN') {
      // Kita bungkus dalam fungsi async tanpa await di depannya
      (async () => {
        try {
          const ticket = await prisma.ticket.findUnique({ where: { id: Number(ticketId) } });
          if (ticket?.clientEmail) {
            const transporter = nodemailer.createTransport({
              service: "gmail",
              auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
            });
            const emailHtml = await render(<AdminReplyEmail ticketCode={ticket.ticketCode} replyMessage={message} />);
            await transporter.sendMail({
              from: '"Helpdesk Support" <no-reply@distalk.com>',
              to: ticket.clientEmail,
              subject: `[Re: ${ticket.ticketCode}] Balasan Baru`,
              html: emailHtml,
            });
          }
        } catch (err) { console.error("Background Email Error:", err); }
      })(); 
    }

    // 4. LANGSUNG KIRIM RESPON (API akan selesai dalam < 200ms)
    return NextResponse.json(newReply, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}