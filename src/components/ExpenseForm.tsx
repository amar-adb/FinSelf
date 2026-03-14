"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Expense, CATEGORIES, ACCOUNT_LABELS } from "@/lib/types";
import { useApp } from "@/context/AppContext";

interface ExpenseFormProps {
  expense?: Expense | null;
  onClose: () => void;
  prefill?: Partial<Expense>;
}

export default function ExpenseForm({ expense, onClose, prefill }: ExpenseFormProps) {
  const { addExpense, updateExpense } = useApp();
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    date: expense?.date || prefill?.date || today,
    amount: expense?.amount?.toString() || prefill?.amount?.toString() || "",
    category: expense?.category || prefill?.category || "",
    subcategory: expense?.subcategory || prefill?.subcategory || "",
    account: expense?.account || prefill?.account || ("debit_card" as Expense["account"]),
    description: expense?.description || prefill?.description || "",
  });

  const categories = Object.keys(CATEGORIES);
  const subcategories = form.category ? CATEGORIES[form.category] || [] : [];

  useEffect(() => {
    if (form.category && !CATEGORIES[form.category]?.includes(form.subcategory)) {
      setForm((f) => ({ ...f, subcategory: "" }));
    }
  }, [form.category, form.subcategory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || !form.category) return;

    const data: Expense = {
      id: expense?.id || uuidv4(),
      date: form.date,
      amount: parseFloat(form.amount),
      category: form.category,
      subcategory: form.subcategory,
      account: form.account,
      description: form.description,
      createdAt: expense?.createdAt || new Date().toISOString(),
    };

    if (expense) {
      updateExpense(data);
    } else {
      addExpense(data);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          {expense ? "Edit Expense" : "Add Expense"}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
            <select
              value={form.subcategory}
              onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              disabled={!form.category}
            >
              <option value="">Select subcategory</option>
              {subcategories.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
            <select
              value={form.account}
              onChange={(e) => setForm({ ...form, account: e.target.value as Expense["account"] })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {Object.entries(ACCOUNT_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              placeholder="Short description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div className="flex gap-3 mt-2">
            <button
              type="submit"
              className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              {expense ? "Update" : "Add Expense"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
