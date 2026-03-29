"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function logout() {
  // We have to await the cookies() function first!
  const cookieStore = await cookies();
  cookieStore.delete("session"); 
  
  redirect("/login");
}

export async function updateBusinessName(email: string, newName: string) {
  await prisma.user.update({
    where: { email: email },
    data: { full_name: newName } // Make sure to use full_name here!
  });
  
  // This tells Next.js to refresh the dashboard so the new name shows up instantly
  revalidatePath("/dashboards/business"); 
}