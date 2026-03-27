// app/action.ts
"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Pusher from "pusher"; 

// 1. PASTIKAN NAMA VARIABEL INI ADALAH 'pusher' (bukan pusherServer)
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

// app/action.ts
export async function cancelTicketAction(id: number) {
  try {
    await prisma.ticket.delete({
      where: { id },
    });

    // UBAH DARI "admin-tickets" MENJADI "admin-updates"
    await pusher.trigger("admin-updates", "ticket-deleted", {
      id: id,
    });

    revalidatePath("/dashboard_admin"); 
    revalidatePath("/track_ticket");
    
  } catch (error) {
    console.error("Delete Error:", error);
    return { error: "Gagal menghapus tiket." };
  }

  redirect("/track_ticket");
}