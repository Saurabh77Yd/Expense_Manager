import { Expense } from "../models/Expense";

/**
 * Recalculate anomalies for a specific category
 * An anomaly is defined as amount > 3 × average(category)
 */
export async function recalculateAnomalies(category: string): Promise<void> {
  // 1 Calculate average using MongoDB aggregation (DB-side)
  const result = await Expense.aggregate([
    { $match: { category } },
    { $group: { _id: null, avgAmount: { $avg: "$amount" } } },
  ]);

  if (!result.length) return;

  const avg = result[0].avgAmount;
  const threshold = avg * 3;

  // 2️ Reset all anomalies in that category
  await Expense.updateMany(
    { category },
    { $set: { isAnomaly: false } }
  );

  // 3️ Mark only those above threshold as anomalies
  await Expense.updateMany(
    { category, amount: { $gt: threshold } },
    { $set: { isAnomaly: true } }
  );
}

/**
 * Recalculate anomalies for all categories
 */
export async function recalculateAllAnomalies(): Promise<void> {
  const categories = await Expense.distinct("category");

  // Process sequentially to avoid DB overload (safer than Promise.all at scale)
  for (const category of categories) {
    await recalculateAnomalies(category);
  }
}