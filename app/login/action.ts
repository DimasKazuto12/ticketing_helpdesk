"use server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user || user.password !== password) {
    return { 
      success: false, // Tambahkan success: false di sini
      error: "Email atau password salah!" 
    };
  }

  // Simpan session sederhana pakai Cookies (Biar bisa masuk Dashboard)
  const cookieStore = await cookies();
  cookieStore.set("admin_session", "true", { httpOnly: true });

  return { 
    success: true, 
    error: null 
  };

}