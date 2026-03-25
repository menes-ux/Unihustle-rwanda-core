"use server";

import { prisma }         from "@/lib/db";
import { revalidatePath } from "next/cache";

/**
 * Marks an order as completed when the student clicks "Deliver".
 * Runs as a transaction — status flip + hustle score increment
 * both succeed or both fail.
 *
 * Email notification to the business is intentionally skipped for now.
 * Add sendDeliveryEmail() here when Resend is integrated.
 */
export async function deliverOrder(orderId: number, studentEmail: string) {
  const student = await prisma.user.findUnique({
    where: { email: studentEmail },
  });

  if (!student) throw new Error("Student not found");

  await prisma.$transaction([
    prisma.order.update({
      where: { order_id: orderId },
      data:  { status: "completed" },
    }),
    prisma.user.update({
      where: { email: studentEmail },
      data:  { hustle_score: { increment: 10 } },
    }),
  ]);

  revalidatePath("/dashboards/student");
}

/**
 * Updates the student's profile fields.
 * Strips blank/undefined values so existing DB data is never
 * overwritten with empty strings.
 */
export async function updateStudentProfile(
  studentEmail: string,
  data: {
    full_name?:     string;
    bio?:           string;
    major?:         string;
    cohort?:        string;
    year_of_study?: string;
    gpa?:           number;
    skills?:        string[];
  }
) {
  const clean = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined && v !== "")
  );

  if (Object.keys(clean).length === 0) return;

  await prisma.user.update({
    where: { email: studentEmail },
    data:  clean,
  });

  revalidatePath("/dashboards/student");
}

/**
 * Adds a portfolio item for the student.
 */
export async function addPortfolioItem(
  studentEmail: string,
  data: {
    title:        string;
    link:         string;
    description?: string;
    type?:        string;
    tags?:        string[];
  }
) {
  const student = await prisma.user.findUnique({
    where: { email: studentEmail },
  });

  if (!student) throw new Error("Student not found");

  await prisma.portfolioItem.create({
    data: {
      student_id:  student.user_id,
      title:       data.title,
      link:        data.link,
      description: data.description ?? "",
      type:        data.type ?? "Live",
      tags:        data.tags ?? [],
    },
  });

  revalidatePath("/dashboards/student");
}

/**
 * Deletes a portfolio item.
 * Verifies ownership before deleting — a student can only
 * delete their own items.
 */
export async function deletePortfolioItem(
  portfolioId:  number,
  studentEmail: string
) {
  const student = await prisma.user.findUnique({
    where: { email: studentEmail },
  });

  if (!student) throw new Error("Student not found");

  const item = await prisma.portfolioItem.findFirst({
    where: {
      portfolio_id: portfolioId,
      student_id:   student.user_id,
    },
  });

  if (!item) throw new Error("Item not found or not owned by this student");

  await prisma.portfolioItem.delete({
    where: { portfolio_id: portfolioId },
  });

  revalidatePath("/dashboards/student");
}

/**
 * Logs the student out by clearing the session cookie.
 */
export async function logout() {
  const { clearSession } = await import("@/lib/session");
  const { redirect }     = await import("next/navigation");
  await clearSession();
  redirect("/login");
}