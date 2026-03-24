"use server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user || user.password !== password) {
    return { 
      success: false, 
      error: "Email atau password salah!" 
    };
  }

  // --- PERBAIKAN DI SINI ---
  const cookieStore = await cookies();
  // Simpan email user, bukan tulisan "true"
  cookieStore.set("admin_session", user.email, { 
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 // Berlaku 1 hari
  });

  return { 
    success: true, 
    error: null 
  };
}