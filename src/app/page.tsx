"use client";

import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import Link from "next/link";

export default function Dashboard() {
  const { expenses, incomes } = useApp();
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.toISOString().slice(0, 7));

  const monthExpenses = useMemo(
    () => expenses.filter((e) => e.date.startsWith(selectedMonth)),
    [expenses, selectedMonth]
  );

  const totalExpense = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const monthIncome = incomes.find((i) => i.month === selectedMonth);
  const incomeAmount = monthIncome?.amount || 0;
  const remaining = incomeAmount - totalExpense;

  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const categoryTotals = useMemo(() => {
    const map: Record<string, number> = {};
    monthExpenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [monthExpenses]);

  const prevMonth = () => {
    const d = new Date(selectedMonth + "-01");
    d.setMonth(d.getMonth() - 1);
    setSelectedMonth(d.toISOString().slice(0, 7));
  };

  const nextMonth = () => {
    const d = new Date(selectedMonth + "-01");
    d.setMonth(d.getMonth() + 1);
    setSelectedMonth(d.toISOString().slice(0, 7));
  };

  const monthLabel = new Date(selectedMonth + "-01").toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm"
          >
            ←
          </button>
          <span className="text-gray-700 font-medium min-w-[140px] text-center">
            {monthLabel}
          </span>
          <button
            onClick={nextMonth}
            className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm"
          >
            →
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-sm text-gray-500 mb-1">Monthly Income</p>
          <p className="text-2xl font-bold text-emerald-600">
            ₹{incomeAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
          {!monthIncome && (
            <Link href="/income" className="text-xs text-blue-500 hover:underline mt-1 block">
              Set income →
            </Link>
          )}
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-sm text-gray-500 mb-1">Total Expenses</p>
          <p className="text-2xl font-bold text-red-500">
            ₹{totalExpense.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {monthExpenses.length} transaction{monthExpenses.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-sm text-gray-500 mb-1">Capital Remaining</p>
          <p className={`text-2xl font-bold ${remaining >= 0 ? "text-emerald-600" : "text-red-500"}`}>
            ₹{remaining.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
          {incomeAmount > 0 && (
            <div className="mt-2">
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    remaining >= 0 ? "bg-emerald-500" : "bg-red-500"
                  }`}
                  style={{ width: `${Math.min((totalExpense / incomeAmount) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {incomeAmount > 0
                  ? `${((totalExpense / incomeAmount) * 100).toFixed(1)}% spent`
                  : ""}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Top Categories</h2>
            <Link href="/stats" className="text-sm text-blue-500 hover:underline">
              View all →
            </Link>
          </div>
          {categoryTotals.length === 0 ? (
            <p className="text-gray-400 text-sm py-4 text-center">No expenses this month</p>
          ) : (
            <div className="space-y-3">
              {categoryTotals.map(([cat, total]) => (
                <div key={cat} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{cat}</span>
                  <span className="text-sm font-semibold text-gray-800">
                    ₹{total.toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Expenses */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Recent Expenses</h2>
            <Link href="/expenses" className="text-sm text-blue-500 hover:underline">
              View all →
            </Link>
          </div>
          {recentExpenses.length === 0 ? (
            <p className="text-gray-400 text-sm py-4 text-center">No expenses yet</p>
          ) : (
            <div className="space-y-3">
              {recentExpenses.map((exp) => (
                <div key={exp.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{exp.category}</p>
                    <p className="text-xs text-gray-400">{exp.date}</p>
                  </div>
                  <span className="text-sm font-semibold text-red-500">
                    ₹{exp.amount.toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
