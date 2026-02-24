export interface Expense {
  _id: string;
  date: string;
  amount: number;
  vendorName: string;
  description: string;
  category: string;
  isAnomaly: boolean;
  createdAt: string;
}

export interface CategoryStat {
  _id: string;
  total: number;
  count: number;
}

export interface VendorStat {
  _id: string;
  total: number;
  count: number;
}

export interface DashboardData {
  monthlyByCategory: CategoryStat[];
  topVendors: VendorStat[];
  anomalies: Expense[];
  totalExpenses: number;
  anomalyCount: number;
}

export type View = "dashboard" | "expenses" | "add" | "upload";

export const CATEGORY_COLORS: Record<string, string> = {
  "Food & Dining": "#f97316",
  Groceries: "#22c55e",
  Transport: "#3b82f6",
  Travel: "#8b5cf6",
  Shopping: "#ec4899",
  Entertainment: "#f59e0b",
  Utilities: "#06b6d4",
  Health: "#10b981",
  Finance: "#6366f1",
  Other: "#94a3b8",
};
