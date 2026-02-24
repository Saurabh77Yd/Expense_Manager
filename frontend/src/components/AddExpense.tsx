import { useState } from "react";
import { createExpense } from "../utils/api";
import { useExpenseRefresh } from "../context/ExpenseRefreshContext";

const VENDOR_HINTS = [
  "Swiggy", "Zomato", "Amazon", "Uber", "Netflix", "BigBasket",
  "Flipkart", "Airtel", "Apollo", "MakeMyTrip", "Starbucks", "Ola",
];


export default function AddExpense() {
  const { triggerRefresh } = useExpenseRefresh();
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    amount: "",
    vendorName: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ category: string; isAnomaly: boolean } | null>(null);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setSuccess(null);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date || !form.amount || !form.vendorName) {
      setError("Date, amount, and vendor name are required.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess(null);
    try {
      const expense = await createExpense({
        date: form.date,
        amount: parseFloat(form.amount),
        vendorName: form.vendorName,
        description: form.description,
      });
      setSuccess({ category: expense.category, isAnomaly: expense.isAnomaly });
      setForm({ date: new Date().toISOString().split("T")[0], amount: "", vendorName: "", description: "" });
      triggerRefresh();
    } catch {
      setError("Failed to add expense. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="card p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Expense</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Categories are assigned automatically based on vendor name.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label">Amount (₹)</label>
              <input
                type="number"
                name="amount"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Vendor Name</label>
            <input
              type="text"
              name="vendorName"
              placeholder="e.g. Swiggy, Amazon, Uber…"
              value={form.vendorName}
              onChange={handleChange}
              className="input-field"
              list="vendor-hints"
              required
            />
            <datalist id="vendor-hints">
              {VENDOR_HINTS.map((v) => <option key={v} value={v} />)}
            </datalist>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 font-mono">
              Common: {VENDOR_HINTS.slice(0, 5).join(", ")}…
            </p>
          </div>

          <div>
            <label className="label">Description <span className="normal-case font-normal">(optional)</span></label>
            <input
              type="text"
              name="description"
              placeholder="Add a note…"
              value={form.description}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          {error && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
              <span className="text-red-500 mt-0.5">⚠</span>
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className={`flex items-start gap-3 p-3 rounded-xl border ${success.isAnomaly ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800" : "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"}`}>
              <span className={success.isAnomaly ? "text-amber-600" : "text-green-600"}>{success.isAnomaly ? "⚠️" : "✅"}</span>
              <div>
                <p className={`text-sm font-semibold ${success.isAnomaly ? "text-amber-700 dark:text-amber-400" : "text-green-700 dark:text-green-400"}`}>
                  Expense added! Category: <strong>{success.category}</strong>
                </p>
                {success.isAnomaly && (
                  <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
                    This expense exceeds 3× the category average — flagged as anomaly.
                  </p>
                )}
              </div>
            </div>
          )}

          <button type="submit" className="btn-primary w-full justify-center flex items-center gap-2" disabled={loading}>
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Adding…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Add Expense
              </>
            )}
          </button>
        </form>
      </div>

      {/* Category hints card */}
      <div className="card p-5 mt-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Auto-Category Rules</h4>
        <div className="grid grid-cols-2 gap-2">
          {[
            ["Swiggy / Zomato", "Food & Dining"],
            ["BigBasket / Blinkit", "Groceries"],
            ["Uber / Ola", "Transport"],
            ["Amazon / Flipkart", "Shopping"],
            ["Netflix / Hotstar", "Entertainment"],
            ["Airtel / Jio", "Utilities"],
          ].map(([vendor, cat]) => (
            <div key={vendor} className="flex items-center gap-2 text-xs">
              <span className="text-gray-500 dark:text-gray-400 font-mono truncate">{vendor}</span>
              <span className="text-gray-400">→</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400 truncate">{cat}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
