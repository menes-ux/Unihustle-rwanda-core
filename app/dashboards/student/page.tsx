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

// ─── Static placeholder portfolio ─────────────────────────────────────────────
// These will be replaced once portfolio_projects is added to the Prisma schema.

const PORTFOLIO: PortfolioProject[] = [
  { id: 1, title: 'UniHustle Rwanda', description: 'A full-stack freelance marketplace for ALU students and local businesses.', type: 'GitHub', url: 'https://github.com', tags: ['Next.js', 'Supabase', 'TypeScript'] },
  { id: 2, title: 'Kigali Events App', description: 'Mobile-first event discovery app for Kigali.', type: 'Live', url: 'https://example.com', tags: ['React Native', 'Node.js', 'Maps API'] },
  { id: 3, title: 'Brand System — TechHub RW', description: 'Complete brand identity system including logo, typography, and UI kit.', type: 'Figma', url: 'https://figma.com', tags: ['Figma', 'Branding', 'UI Kit'] },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns colour tokens for the GPA badge.
 * Green = Dean's List (3.7+), Amber = Good Standing (3.0+), Red = below 3.0.
 */
function getGpaStyle(gpa: number): { color: string; bg: string; border: string; label: string } {
  if (gpa >= 3.7) return { color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', label: "Dean's List" };
  if (gpa >= 3.0) return { color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', label: 'Good Standing' };
  return { color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', label: 'Needs Attention' };
}

/**
 * Turns "pending" → "Pending", "in_progress" → "In Progress", etc.
 * Used to make raw DB status strings readable in the orders table.
 */
function formatStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Derives two-letter initials from a full name or email prefix.
 * "Menes Adisso" → "MA", "m.adisso@..." → "MA"
 */
function getInitials(nameOrEmail: string): string {
  const base = nameOrEmail.includes('@') ? nameOrEmail.split('@')[0] : nameOrEmail;
  const parts = base.trim().split(/[\s.]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return base.slice(0, 2).toUpperCase();
}