import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { render } from "@react-email/render";
import { AdminReplyEmail } from "@/emails/replyadmin"; // Template yang kita buat tadi
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ticketId, message, sender, attachment } = body;

    // 1. Validasi Input Dasar
    if (!ticketId) {
      return NextResponse.json({ error: "ticketId is required" }, { status: 400 });
    }

    // 2. Operasi Database
    const newReply = await prisma.ticketReply.create({
      data: {
        ticketId: Number(ticketId),
        message: message || "", // Pastikan tidak undefined
        senderType: sender === 'ADMIN' ? 'admin' : 'client',
        attachment: attachment || null,
        userId: null,
      },
    });

    if (sender === 'ADMIN') {
      try {
        // Ambil data tiket untuk mendapatkan email klien dan kodenya
        const ticket = await prisma.ticket.findUnique({
          where: { id: Number(ticketId) }
        });

        if (ticket && ticket.clientEmail) {
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
          });

          const emailHtml = await render(
            <AdminReplyEmail 
              ticketCode={ ticket.ticketCode } 
              replyMessage = { message }
            />
          );

          await transporter.sendMail({
            from: '"Helpdesk Support" <no-reply@distalk.com>',
            to: ticket.clientEmail,
            subject: `[Re: ${ticket.ticketCode}] Balasan Baru dari Admin`,
            html: emailHtml,
          });

          console.log(`Notification sent to ${ticket.clientEmail}`);
        }
      } catch (mailErr) {
        console.error("FAILED_TO_SEND_REPLY_EMAIL:", mailErr);
        // Kita tidak return error di sini agar balasan chat tetap muncul di UI
      }
    }

    return NextResponse.json(newReply, { status: 201 });

  } catch (error: any) {
    // FIX: Jangan lempar objek error mentah ke console jika logging bermasalah
    // Cukup log string pesannya saja untuk debugging
    const errorMessage = error instanceof Error ? error.message : "Unknown Database Error";
    console.error("DATABASE_SYNC_FAILURE:", errorMessage);

    return NextResponse.json(
      {
        error: "Neural Link Failure",
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

// Tambahkan ini jika kamu mengirim gambar Base64 yang besar
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};