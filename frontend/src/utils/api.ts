import axios from "axios";
import { Expense, DashboardData } from "../types";

const api = axios.create({ baseURL: "/api" });

export const fetchExpenses = async (params?: {
  month?: number;
  year?: number;
  category?: string;
  anomaly?: boolean;
}): Promise<Expense[]> => {
  const { data } = await api.get("/expenses", { params });
  return data;
};

export const createExpense = async (payload: {
  date: string;
  amount: number;
  vendorName: string;
  description?: string;
}): Promise<Expense> => {
  const { data } = await api.post("/expenses", payload);
  return data;
};

export const deleteExpense = async (id: string): Promise<void> => {
  await api.delete(`/expenses/${id}`);
};

export const uploadCSV = async (file: File): Promise<{ message: string }> => {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post("/expenses/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const fetchDashboard = async (): Promise<DashboardData> => {
  const { data } = await api.get("/expenses/dashboard");
  return data;
};
