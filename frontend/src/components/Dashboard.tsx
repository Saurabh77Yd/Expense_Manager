import { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { fetchDashboard } from "../utils/api";
import { DashboardData, CATEGORY_COLORS, View } from "../types";
import { useExpenseRefresh } from "../context/ExpenseRefreshContext";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

interface Props {
  onNavigate?: (v: View) => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 shadow-lg text-sm">
        {label && <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">{label}</p>}
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }} className="font-mono font-semibold">{fmt(p.value)}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard({ onNavigate }: Props) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { refreshKey } = useExpenseRefresh();

  useEffect(() => {
    setLoading(true);
    fetchDashboard().then(setData).finally(() => setLoading(false));
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" style={{ borderWidth: 3 }} />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500 text-sm">Failed to load data. Is the backend running?</div>
    );
  }

  const monthlyTotal = data.monthlyByCategory.reduce((s, c) => s + c.total, 0);
  const pieData = data.monthlyByCategory.map((c) => ({ name: c._id, value: c.total }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "This Month", value: fmt(monthlyTotal), icon: "📅", color: "blue" },
          { label: "All-Time Total", value: fmt(data.totalExpenses), icon: "💳", color: "indigo" },
          { label: "Anomalies", value: String(data.anomalyCount), icon: "⚠️", color: "red", alert: data.anomalyCount > 0 },
          { label: "Categories", value: String(data.monthlyByCategory.length), icon: "🏷️", color: "green" },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className={`card p-5 ${kpi.alert ? "border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20" : ""}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{kpi.label}</span>
              <span className="text-lg">{kpi.icon}</span>
            </div>
            <p className={`text-2xl font-bold font-mono tracking-tight ${kpi.alert ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"}`}>
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Pie chart */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
            Monthly Spend by Category
          </h3>
          {pieData.length === 0 ? (
            <EmptyState msg="No expenses this month" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] ?? "#94a3b8"} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-gray-600 dark:text-gray-400">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Bar chart */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
            Top 5 Vendors by Spend
          </h3>
          {data.topVendors.length === 0 ? (
            <EmptyState msg="No vendor data yet" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.topVendors} layout="vertical" margin={{ left: 10, right: 20 }}>
                <XAxis type="number" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="_id" width={85} tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" radius={[0, 6, 6, 0]}>
                  {data.topVendors.map((_, i) => (
                    <Cell key={i} fill={`hsl(${215 + i * 25}, 70%, ${55 + i * 4}%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Category Breakdown — This Month
          </h3>
        </div>
        {data.monthlyByCategory.length === 0 ? (
          <div className="p-8"><EmptyState msg="No expenses recorded this month" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-th rounded-none first:pl-5">Category</th>
                  <th className="table-th text-right">Transactions</th>
                  <th className="table-th text-right last:pr-5">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {data.monthlyByCategory.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="table-td pl-5">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: CATEGORY_COLORS[c._id] ?? "#94a3b8" }} />
                        <span className="font-medium text-gray-800 dark:text-gray-200">{c._id}</span>
                      </div>
                    </td>
                    <td className="table-td text-right text-gray-500 dark:text-gray-400">{c.count}</td>
                    <td className="table-td text-right font-mono font-semibold text-gray-900 dark:text-white pr-5">{fmt(c.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Anomalies */}
      {data.anomalies.length > 0 && (
        <div className="card overflow-hidden border-red-200 dark:border-red-900/50">
          <div className="px-5 py-4 border-b border-red-100 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
              <span>⚠️</span> Flagged Anomalies
            </h3>
            <span className="badge bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400">{data.anomalies.length} flagged</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-th first:pl-5">Date</th>
                  <th className="table-th">Vendor</th>
                  <th className="table-th hidden sm:table-cell">Category</th>
                  <th className="table-th text-right last:pr-5">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-50 dark:divide-red-900/20">
                {data.anomalies.map((a) => (
                  <tr key={a._id} className="hover:bg-red-50/50 dark:hover:bg-red-950/10 transition-colors">
                    <td className="table-td pl-5 text-gray-500">{new Date(a.date).toLocaleDateString("en-IN")}</td>
                    <td className="table-td font-semibold text-gray-900 dark:text-white">{a.vendorName}</td>
                    <td className="table-td hidden sm:table-cell">
                      <CategoryBadge name={a.category} />
                    </td>
                    <td className="table-td text-right font-mono font-bold text-red-600 dark:text-red-400 pr-5">{fmt(a.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryBadge({ name }: { name: string }) {
  const color = CATEGORY_COLORS[name] ?? "#94a3b8";
  return (
    <span
      className="badge text-xs font-semibold border"
      style={{ background: color + "22", color, borderColor: color + "55" }}
    >
      {name}
    </span>
  );
}

function EmptyState({ msg }: { msg: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-2">
      <p className="text-gray-400 dark:text-gray-500 text-sm">{msg}</p>
    </div>
  );
}
