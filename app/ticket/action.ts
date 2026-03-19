"use server";

export async function createTicket(formData: FormData, captchaToken: string | null) {
  const title = formData.get("subject") as string;
  const description = formData.get("description") as string;
  const clientName = formData.get("name") as string;
  const clientEmail = formData.get("email") as string; 
  const category = formData.get("category") as string;
  
  const file = formData.get("attachment") as File;
  let base64File = "";

  if (file && file.size > 0) {
    const buffer = await file.arrayBuffer();
    base64File = `data:${file.type};base64,${Buffer.from(buffer).toString("base64")}`;
  }

  if (!captchaToken) {
    return { success: false, error: "Harap selesaikan reCAPTCHA!" };
  }

  try {
    
    const response = await fetch("http://localhost:3000/api/ticket", { 
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
        clientName,
        clientEmail,
        category,
        attachment: base64File, 
        captchaToken,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Gagal mengirim tiket");
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    console.error("ACTION_ERROR:", error.message);
    return { success: false, error: error.message };
  }
}