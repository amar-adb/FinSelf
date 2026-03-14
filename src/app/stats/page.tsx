"use client";

import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = [
  "#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16",
];

type ViewMode = "month" | "year" | "all";

export default function StatsPage() {
  const { expenses } = useApp();
  const today = new Date();
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedMonth, setSelectedMonth] = useState(today.toISOString().slice(0, 7));
  const [selectedYear, setSelectedYear] = useState(today.getFullYear().toString());

  const years = useMemo(() => {
    const yrs = new Set(expenses.map((e) => e.date.slice(0, 4)));
    yrs.add(today.getFullYear().toString());
    return Array.from(yrs).sort().reverse();
  }, [expenses, today]);

  const filteredExpenses = useMemo(() => {
    if (viewMode === "month") {
      return expenses.filter((e) => e.date.startsWith(selectedMonth));
    }
    if (viewMode === "year") {
      return expenses.filter((e) => e.date.startsWith(selectedYear));
    }
    return expenses;
  }, [expenses, viewMode, selectedMonth, selectedYear]);

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredExpenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
      .sort((a, b) => b.value - a.value);
  }, [filteredExpenses]);

  const totalExpense = categoryData.reduce((s, d) => s + d.value, 0);

  const viewLabel =
    viewMode === "month"
      ? selectedMonth
      : viewMode === "year"
      ? selectedYear
      : "All Time";

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Statistics</h1>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex rounded-lg overflow-hidden border border-gray-200">
            {(["month", "year", "all"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                  viewMode === mode
                    ? "bg-emerald-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {mode === "all" ? "All Time" : mode + "ly"}
              </button>
            ))}
          </div>

          {viewMode === "month" && (
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          )}

          {viewMode === "year" && (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          )}
        </div>

        <div className="text-center mb-4">
          <p className="text-sm text-gray-500">{viewLabel}</p>
          <p className="text-3xl font-bold text-gray-800">
            ₹{totalExpense.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-gray-400">Total Expenses</p>
        </div>

        {categoryData.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-5xl mb-4">📈</div>
            <p>No expense data for this period.</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="w-full lg:w-1/2" style={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={130}
                    paddingAngle={2}
                    dataKey="value"
                    label={(props: { name?: string; percent?: number }) =>
                      `${props.name ?? ""} (${((props.percent ?? 0) * 100).toFixed(1)}%)`
                    }
                    labelLine={true}
                  >
                    {categoryData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) =>
                      `₹${Number(value).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                    }
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full lg:w-1/2">
              <div className="space-y-3">
                {categoryData.map((cat, idx) => {
                  const pct = totalExpense > 0 ? (cat.value / totalExpense) * 100 : 0;
                  return (
                    <div key={cat.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 font-medium">{cat.name}</span>
                        <span className="text-gray-500">
                          ₹{cat.value.toLocaleString("en-IN")} ({pct.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div
                          className="h-2.5 rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: COLORS[idx % COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
