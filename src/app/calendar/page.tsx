"use client";

import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { ACCOUNT_LABELS } from "@/lib/types";

export default function CalendarPage() {
  const { expenses } = useApp();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const expensesByDate = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e) => {
      map[e.date] = (map[e.date] || 0) + e.amount;
    });
    return map;
  }, [expenses]);

  const selectedExpenses = useMemo(() => {
    if (!selectedDate) return [];
    return expenses.filter((e) => e.date === selectedDate);
  }, [expenses, selectedDate]);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const monthName = new Date(currentYear, currentMonth).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(null);
  };

  const days = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} />);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const total = expensesByDate[dateStr] || 0;
    const isSelected = selectedDate === dateStr;
    const isToday =
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear();

    days.push(
      <button
        key={day}
        onClick={() => setSelectedDate(dateStr)}
        className={`p-2 rounded-lg text-left min-h-[72px] transition-colors border ${
          isSelected
            ? "border-emerald-500 bg-emerald-50"
            : isToday
            ? "border-blue-300 bg-blue-50"
            : "border-transparent hover:bg-gray-50"
        }`}
      >
        <div className={`text-sm font-medium ${isToday ? "text-blue-600" : "text-gray-700"}`}>
          {day}
        </div>
        {total > 0 && (
          <div className="text-xs font-semibold text-red-500 mt-1">
            ₹{total.toLocaleString("en-IN")}
          </div>
        )}
      </button>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Calendar</h1>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
          >
            ← Prev
          </button>
          <h2 className="text-lg font-semibold text-gray-800">{monthName}</h2>
          <button
            onClick={nextMonth}
            className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
          >
            Next →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">{days}</div>
      </div>

      {selectedDate && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Expenses on {selectedDate}
          </h3>
          {selectedExpenses.length === 0 ? (
            <p className="text-gray-400">No expenses on this date.</p>
          ) : (
            <div className="space-y-3">
              {selectedExpenses.map((exp) => (
                <div
                  key={exp.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-800">
                      {exp.category}
                      {exp.subcategory && (
                        <span className="text-gray-400 font-normal"> / {exp.subcategory}</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">
                      {ACCOUNT_LABELS[exp.account]}
                      {exp.description && ` — ${exp.description}`}
                    </p>
                  </div>
                  <span className="font-semibold text-red-600">
                    ₹{exp.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
              <div className="pt-2 border-t border-gray-200 flex justify-between">
                <span className="font-medium text-gray-700">Total</span>
                <span className="font-bold text-red-600">
                  ₹{selectedExpenses
                    .reduce((s, e) => s + e.amount, 0)
                    .toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
