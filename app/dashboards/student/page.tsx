import { prisma } from "@/lib/db";
import Link from 'next/link';
import { revalidatePath } from "next/cache";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PortfolioProject {
  id: number;
  title: string;
  description: string;
  type: 'GitHub' | 'Behance' | 'Live' | 'Figma';
  url: string;
  tags: string[];
}

