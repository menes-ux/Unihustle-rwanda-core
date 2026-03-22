"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

/**
 * Marks an order as completed when the student clicks "Deliver".
 *
 * This does three things atomically:
 *   1. Sets the order status to "completed"
 *   2. Sets updated_at to now so we have an audit trail
 *   3. Increments the student's hustle_score by 10 as a reward
 *
 * After the update, we revalidate the dashboard so the order
 * disappears from the Active Orders table without a full page reload.
 */
export async function deliverOrder(orderId: number, studentEmail: string) {
  // Find the student so we can update their hustle score
  const student = await prisma.user.findUnique({
    where: { email: studentEmail },
  });

  if (!student) {
    throw new Error("Student not found");
  }

  // Run both updates in a transaction so they either both succeed
  // or both fail — we never want an order marked complete without
  // the hustle score being updated, or vice versa.
  await prisma.$transaction([
    prisma.order.update({
      where: { order_id: orderId },
      data: {
        status: "completed",
      },
    }),
    prisma.user.update({
      where: { email: studentEmail },
      data: {
        hustle_score: { increment: 10 },
      },
    }),
  ]);

  // Revalidate the student dashboard so the UI reflects the change
  // immediately without requiring a manual page refresh.
  revalidatePath("/dashboards/student");
}

/**
 * Updates the student's full profile fields from the Edit Profile form.
 *
 * All fields are optional — if the student leaves one blank,
 * it stays as whatever was in the DB before.
 */
export async function updateStudentProfile(
  studentEmail: string,
  data: {
    full_name?: string;
    bio?: string;
    major?: string;
    cohort?: string;
    year_of_study?: string;
    gpa?: number;
    skills?: string[];
  }
) {
  // Strip out any undefined values so we don't accidentally
  // overwrite existing DB data with nulls
  const clean = Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== undefined && v !== "")
  );

  if (Object.keys(clean).length === 0) return;

  await prisma.user.update({
    where: { email: studentEmail },
    data: clean,
  });

  revalidatePath("/dashboards/student");
}

/**
 * Adds a new portfolio project for the student.
 * Called from the "Add Project" button on the dashboard.
 */
export async function addPortfolioItem(
  studentEmail: string,
  data: {
    title: string;
    link: string;
    description?: string;
    type: string;
    tags: string[];
  }
) {
  const student = await prisma.user.findUnique({
    where: { email: studentEmail },
  });

  if (!student) throw new Error("Student not found");

  await prisma.portfolioItem.create({
    data: {
      student_id: student.user_id,
      title: data.title,
      link: data.link,
      description: data.description ?? "",
      type: data.type,
      tags: data.tags,
    },
  });

  revalidatePath("/dashboards/student");
}

/**
 * Deletes a portfolio item. Only the owning student can do this —
 * we verify ownership before deleting.
 */
export async function deletePortfolioItem(
  portfolioId: number,
  studentEmail: string
) {
  const student = await prisma.user.findUnique({
    where: { email: studentEmail },
  });

  if (!student) throw new Error("Student not found");

  // Verify ownership before deleting — we never want a student
  // to be able to delete another student's portfolio item
  const item = await prisma.portfolioItem.findFirst({
    where: {
      portfolio_id: portfolioId,
      student_id: student.user_id,
    },
  });

  if (!item) throw new Error("Item not found or not owned by this student");

  await prisma.portfolioItem.delete({
    where: { portfolio_id: portfolioId },
  });

  revalidatePath("/dashboards/student");
}