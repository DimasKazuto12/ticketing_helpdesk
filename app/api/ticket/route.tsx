import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { render } from "@react-email/render";
import { TicketCreatedEmail } from "@/emails/KirimEmail";
import nodemailer from "nodemailer";
import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") global.prisma = prisma;

export async function POST(req: Request) {
  try {

    const body = await req.json();
    const {
      title,
      description,
      clientName,
      clientEmail,
      category,
      attachment,
      captchaToken
    } = body;

    const verifyRes = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`,
      { method: "POST" }
    );
    const captchaData = await verifyRes.json();

    if (!captchaData.success) {
      return NextResponse.json({ success: false, error: "Captcha Invalid" }, { status: 400 });
    }

    const ticketCode = `TCK-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTicket = await prisma.ticket.create({
      data: {
        ticketCode: ticketCode,
        title: title,
        description: description || "",
        clientName: clientName,
        clientEmail: clientEmail,
        category: {
          connect: { id: Number(category) }
        },
        attachment: attachment || null,
        status: "open",
        priority: "low"
      },
      include: {
        category: true 
      }
    });
    
    await pusher.trigger('admin-updates', 'new-ticket', newTicket);

    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS, // Gunakan App Password Gmail
        },
      });

      const emailHtml = await render(
        <TicketCreatedEmail ticketCode={ticketCode} title={title} />
      );

      await transporter.sendMail({
        from: '"Helpdesk System" <no-reply@distalk.com>',
        to: clientEmail,
        subject: `[${ticketCode}] Laporan Anda Berhasil Diterima`,
        html: emailHtml,
      });

      console.log(`Email sent to ${clientEmail} for ticket ${ticketCode}`);
    } catch (mailErr) {
      // Kita log saja jika gagal kirim email, agar respon database tetap sukses
      console.error("MAIL_SYSTEM_ERROR:", mailErr);
    }

    return NextResponse.json({ success: true, data: newTicket });

  } catch (err: any) {
    const msg = err instanceof Error ? err.message : "Database Error";
    console.error("LOG_SERVER_ERROR:", msg);

    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}