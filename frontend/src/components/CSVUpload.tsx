import { useState, useRef, DragEvent } from "react";
import { uploadCSV } from "../utils/api";
import { useExpenseRefresh } from "../context/ExpenseRefreshContext";


export default function CSVUpload() {
  const { triggerRefresh } = useExpenseRefresh();
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.name.endsWith(".csv")) { setFile(dropped); setError(""); }
    else setError("Please drop a .csv file.");
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const res = await uploadCSV(file);
      setMessage(res.message);
      setFile(null);
      triggerRefresh();
    } catch {
      setError("Upload failed. Check your CSV format and backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const csvExample = `date,amount,vendorName,description
2024-01-15,450,Swiggy,Dinner order
2024-01-16,1200,Amazon,Book purchase
2024-01-17,250,Uber,Office commute`;

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="card p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upload via CSV</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Bulk-import expenses. Categories are auto-assigned per row.
          </p>
        </div>

        {/* Drop zone */}
        <div
          className={`relative flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
            dragging
              ? "border-blue-400 bg-blue-50 dark:bg-blue-950/30"
              : file
              ? "border-green-400 bg-green-50 dark:bg-green-950/20"
              : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) { setFile(f); setError(""); } }}
          />

          {file ? (
            <>
              <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{file.name}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-mono mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Drag & drop your CSV here
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">or click to browse — .csv files only</p>
              </div>
            </>
          )}
        </div>

        {error && (
          <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
            <span className="text-red-500 text-sm">⚠</span>
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {message && (
          <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
            <span className="text-green-500">✅</span>
            <p className="text-sm text-green-700 dark:text-green-400 font-semibold">{message}</p>
          </div>
        )}

        {file && (
          <div className="flex gap-3 mt-4">
            <button className="btn-primary flex-1 flex items-center justify-center gap-2" onClick={handleUpload} disabled={loading}>
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Importing…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Upload & Import
                </>
              )}
            </button>
            <button className="btn-secondary" onClick={() => setFile(null)}>Cancel</button>
          </div>
        )}
      </div>

      {/* CSV format guide */}
      <div className="card p-5">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
          Expected CSV Format
        </h4>
        <pre className="text-xs font-mono text-blue-600 dark:text-blue-400 bg-gray-50 dark:bg-gray-800 rounded-xl p-4 overflow-x-auto leading-relaxed">
          {csvExample}
        </pre>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 leading-relaxed">
          Required columns:{" "}
          {["date", "amount", "vendorName"].map((c) => (
            <code key={c} className="mx-0.5 px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-amber-600 dark:text-amber-400 font-mono">{c}</code>
          ))}{" "}
          · Optional:{" "}
          <code className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-amber-600 dark:text-amber-400 font-mono">description</code>
        </p>
      </div>
    </div>
  );
}
