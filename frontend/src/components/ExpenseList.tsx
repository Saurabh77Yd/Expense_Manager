import { useEffect, useState } from "react";
import { fetchExpenses, deleteExpense } from "../utils/api";
import { Expense, CATEGORY_COLORS } from "../types";
import { useExpenseRefresh } from "../context/ExpenseRefreshContext";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export default function ExpenseList() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterAnomaly, setFilterAnomaly] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { refreshKey } = useExpenseRefresh();

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchExpenses({
        category: filterCategory || undefined,
        anomaly: filterAnomaly || undefined,
      });
      setExpenses(data);
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => { load(); }, [filterCategory, filterAnomaly]);
  useEffect(() => {
    load();
  }, [filterCategory, filterAnomaly, refreshKey]);

  const allCategories = Array.from(new Set(expenses.map((e) => e.category))).sort();

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this expense?")) return;
    setDeletingId(id);
    await deleteExpense(id);
    setExpenses((prev) => prev.filter((e) => e._id !== id));
    setDeletingId(null);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input-field flex-1 sm:max-w-[200px]"
          >
            <option value="">All Categories</option>
            {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <label className="flex items-center gap-2 cursor-pointer select-none group">
            <div
              className={`w-9 h-5 rounded-full transition-colors duration-200 relative flex-shrink-0 ${filterAnomaly ? "bg-red-500" : "bg-gray-200 dark:bg-gray-700"}`}
              onClick={() => setFilterAnomaly(!filterAnomaly)}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${filterAnomaly ? "translate-x-4" : "translate-x-0.5"}`} />
            </div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors">
              Anomalies only
            </span>
          </label>
        </div>

        <button className="btn-secondary flex items-center gap-2 text-sm flex-shrink-0" onClick={load}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Stats strip */}
      {!loading && expenses.length > 0 && (
        <div className="flex items-center gap-4 px-1 text-sm text-gray-500 dark:text-gray-400">
          <span><strong className="text-gray-900 dark:text-white font-mono">{expenses.length}</strong> expenses</span>
          <span className="text-gray-300 dark:text-gray-700">|</span>
          <span>Total: <strong className="text-gray-900 dark:text-white font-mono">{fmt(expenses.reduce((s, e) => s + e.amount, 0))}</strong></span>
          {expenses.filter(e => e.isAnomaly).length > 0 && (
            <>
              <span className="text-gray-300 dark:text-gray-700">|</span>
              <span className="text-red-500">⚠ {expenses.filter(e => e.isAnomaly).length} anomal{expenses.filter(e => e.isAnomaly).length === 1 ? "y" : "ies"}</span>
            </>
          )}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : expenses.length === 0 ? (
        <div className="card flex flex-col items-center justify-center p-16 gap-3">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">No expenses found</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">Try adding one or changing your filters</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-th first:pl-5">Date</th>
                  <th className="table-th">Vendor</th>
                  <th className="table-th hidden md:table-cell">Category</th>
                  <th className="table-th hidden lg:table-cell">Description</th>
                  <th className="table-th text-right">Amount</th>
                  <th className="table-th hidden sm:table-cell">Status</th>
                  <th className="table-th last:pr-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {expenses.map((e) => (
                  <tr
                    key={e._id}
                    className={`transition-colors ${e.isAnomaly ? "bg-red-50/60 dark:bg-red-950/10 hover:bg-red-50 dark:hover:bg-red-950/20" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"}`}
                  >
                    <td className="table-td pl-5 whitespace-nowrap text-gray-500 dark:text-gray-400 font-mono text-xs">
                      {new Date(e.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="table-td font-semibold text-gray-900 dark:text-white whitespace-nowrap">{e.vendorName}</td>
                    <td className="table-td hidden md:table-cell">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border"
                        style={{
                          background: (CATEGORY_COLORS[e.category] ?? "#94a3b8") + "22",
                          color: CATEGORY_COLORS[e.category] ?? "#94a3b8",
                          borderColor: (CATEGORY_COLORS[e.category] ?? "#94a3b8") + "55",
                        }}
                      >
                        {e.category}
                      </span>
                    </td>
                    <td className="table-td hidden lg:table-cell text-gray-400 dark:text-gray-500 max-w-[180px] truncate">
                      {e.description || "—"}
                    </td>
                    <td className={`table-td text-right font-mono font-bold whitespace-nowrap ${e.isAnomaly ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"}`}>
                      {fmt(e.amount)}
                    </td>
                    <td className="table-td hidden sm:table-cell">
                      {e.isAnomaly ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
                          <span>⚠</span> Anomaly
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900">
                          <span>✓</span> Normal
                        </span>
                      )}
                    </td>
                    <td className="table-td pr-5">
                      <button
                        className="p-1.5 rounded-lg text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all disabled:opacity-30"
                        onClick={() => handleDelete(e._id)}
                        disabled={deletingId === e._id}
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
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
