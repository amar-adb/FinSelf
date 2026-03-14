"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import ExpenseForm from "@/components/ExpenseForm";
import BillUpload from "@/components/BillUpload";
import { Expense, ACCOUNT_LABELS } from "@/lib/types";

export default function ExpensesPage() {
  const { expenses, deleteExpense } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showBillUpload, setShowBillUpload] = useState(false);

  const sortedExpenses = [...expenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Expenses</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowBillUpload(!showBillUpload)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Upload Bill
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
          >
            + Add Expense
          </button>
        </div>
      </div>

      {showBillUpload && (
        <div className="mb-6">
          <BillUpload />
        </div>
      )}

      {expenses.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">💸</div>
          <p className="text-lg">No expenses yet. Add your first expense!</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Date</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Category</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Description</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Account</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Amount</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-800">{expense.date}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">
                    <span className="font-medium">{expense.category}</span>
                    {expense.subcategory && (
                      <span className="text-gray-400 ml-1">/ {expense.subcategory}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{expense.description || "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {ACCOUNT_LABELS[expense.account]}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-red-600">
                    ₹{expense.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <button
                      onClick={() => setEditingExpense(expense)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Delete this expense?")) deleteExpense(expense.id);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(showForm || editingExpense) && (
        <ExpenseForm
          expense={editingExpense}
          onClose={() => {
            setShowForm(false);
            setEditingExpense(null);
          }}
        />
      )}
    </div>
  );
}
