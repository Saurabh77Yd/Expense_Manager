import mongoose, { Schema, Document } from "mongoose";

export interface IExpense extends Document {
  date: Date;
  amount: number;
  vendorName: string;
  description: string;
  category: string;
  isAnomaly: boolean;
  createdAt: Date;
}

const ExpenseSchema: Schema = new Schema(
  {
    date: { type: Date, required: true },
    amount: { type: Number, required: true, min: 0 },
    vendorName: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    category: { type: String, required: true },
    isAnomaly: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ExpenseSchema.index({ category: 1 });
ExpenseSchema.index({ date: 1 });
ExpenseSchema.index({ isAnomaly: 1 });
ExpenseSchema.index({ vendorName: 1 });
ExpenseSchema.index({ category: 1, date: -1 });

export const Expense = mongoose.model<IExpense>("Expense", ExpenseSchema);
