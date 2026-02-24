import { Router, Request, Response } from "express";
import multer from "multer";
import { parse } from "csv-parse/sync";
import { Expense } from "../models/Expense";
import { getCategoryForVendor } from "../categoryMap";
import { recalculateAnomalies, recalculateAllAnomalies } from "../services/anomalyService";
import { createExpenseSchema } from "../validators/expenseValidator";
import { validate } from "../middleware/validate";


const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// GET /api/expenses - list all expenses with optional filters
router.get("/", async (req: Request, res: Response) => {
  try {
    const { month, year, category, anomaly } = req.query;
    const filter: Record<string, unknown> = {};

    if (month && year) {
      const start = new Date(Number(year), Number(month) - 1, 1);
      const end = new Date(Number(year), Number(month), 1);
      filter.date = { $gte: start, $lt: end };
    }
    if (category) filter.category = category;
    if (anomaly === "true") filter.isAnomaly = true;

    const expenses = await Expense.find(filter).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
});

// POST /api/expenses - add single expense
router.post("/", validate(createExpenseSchema), async (req: Request, res: Response) => {
  try {
    const { date, amount, vendorName, description } = req.body;
    
    const category = getCategoryForVendor(vendorName);
    const expense = await Expense.create({
      date: new Date(date),
      amount: Number(amount),
      vendorName,
      description: description || "",
      category,
      isAnomaly: false,
    });

    await recalculateAnomalies(category);
    const updated = await Expense.findById(expense._id);
    res.status(201).json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to create expense" });
  }
});

// DELETE /api/expenses/:id
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ error: "Not found" });
    await recalculateAnomalies(expense.category);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete" });
  }
});

// POST /api/expenses/upload - CSV upload
router.post("/upload", upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const content = req.file.buffer.toString("utf-8");
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as Array<{ date: string; amount: string; vendorName: string; description?: string }>;


  const toInsert = records.map((r) => {
    const parsedAmount = parseFloat(r.amount);

    if (!r.date || isNaN(Date.parse(r.date))) return null;
    if (isNaN(parsedAmount) || parsedAmount <= 0) return null;
    if (!r.vendorName) return null;

    const category = getCategoryForVendor(r.vendorName);

    return {
      date: new Date(r.date),
      amount: parsedAmount,
      vendorName: r.vendorName,
      description: r.description || "",
      category,
      isAnomaly: false,
    };
  }).filter(Boolean);

    await Expense.insertMany(toInsert);
    await recalculateAllAnomalies();

    res.status(201).json({ message: `Imported ${toInsert.length} expenses` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to parse/upload CSV" });
  }
});

// GET /api/expenses/dashboard - summary stats
router.get("/dashboard", async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Monthly totals per category
    const monthlyByCategory = await Expense.aggregate([
      { $match: { date: { $gte: startOfMonth, $lt: endOfMonth } } },
      { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    // Top 5 vendors by spend (all time)
    const topVendors = await Expense.aggregate([
      { $group: { _id: "$vendorName", total: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: 5 },
    ]);

    // Anomalies
    const anomalies = await Expense.find({ isAnomaly: true }).sort({ amount: -1 });

    // All-time total
    const allTimeTotal = await Expense.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    res.json({
      monthlyByCategory,
      topVendors,
      anomalies,
      totalExpenses: allTimeTotal[0]?.total || 0,
      anomalyCount: anomalies.length,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to get dashboard" });
  }
});

export default router;
