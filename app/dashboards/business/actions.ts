"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logout() {
  // We have to await the cookies() function first!
  const cookieStore = await cookies();
  cookieStore.delete("session"); 
  
  redirect("/login");
}