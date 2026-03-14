"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useApp } from "@/context/AppContext";

export default function IncomePage() {
  const { incomes, setMonthlyIncome, deleteMonthlyIncome } = useApp();
  const currentMonth = new Date().toISOString().slice(0, 7);

  const [month, setMonth] = useState(currentMonth);
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");

  const sortedIncomes = [...incomes].sort((a, b) => b.month.localeCompare(a.month));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !month) return;

    setMonthlyIncome({
      id: incomes.find((i) => i.month === month)?.id || uuidv4(),
      month,
      amount: parseFloat(amount),
      source,
    });
    setAmount("");
    setSource("");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Monthly Income</h1>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Set Monthly Income</h2>
        <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
            <input
              type="text"
              placeholder="e.g., Salary, Freelance"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
          >
            Save
          </button>
        </form>
      </div>

      {sortedIncomes.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-5xl mb-4">💰</div>
          <p className="text-lg">No income records yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Month</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Source</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Amount</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedIncomes.map((income) => (
                <tr key={income.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-800 font-medium">{income.month}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{income.source || "—"}</td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-emerald-600">
                    ₹{income.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <button
                      onClick={() => {
                        setMonth(income.month);
                        setAmount(income.amount.toString());
                        setSource(income.source);
                      }}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Delete this income record?")) deleteMonthlyIncome(income.id);
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
    </div>
  );
}
