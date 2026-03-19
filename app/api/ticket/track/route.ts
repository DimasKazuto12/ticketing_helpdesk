import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ success: false, message: "Code required" }, { status: 400 });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { ticketCode: code },
      include: { category: true }
    });

    if (!ticket) {
      return NextResponse.json({ success: false }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: ticket });
  } catch (err) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}