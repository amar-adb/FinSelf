"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Expense, Transfer, MonthlyIncome } from "@/lib/types";
import * as storage from "@/lib/storage";

interface AppContextType {
  expenses: Expense[];
  transfers: Transfer[];
  incomes: MonthlyIncome[];
  addExpense: (expense: Expense) => void;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
  addTransfer: (transfer: Transfer) => void;
  updateTransfer: (transfer: Transfer) => void;
  deleteTransfer: (id: string) => void;
  setMonthlyIncome: (income: MonthlyIncome) => void;
  deleteMonthlyIncome: (id: string) => void;
  refresh: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [incomes, setIncomes] = useState<MonthlyIncome[]>([]);

  const refresh = useCallback(() => {
    setExpenses(storage.getExpenses());
    setTransfers(storage.getTransfers());
    setIncomes(storage.getMonthlyIncomes());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleAddExpense = (expense: Expense) => {
    storage.addExpense(expense);
    refresh();
  };

  const handleUpdateExpense = (expense: Expense) => {
    storage.updateExpense(expense);
    refresh();
  };

  const handleDeleteExpense = (id: string) => {
    storage.deleteExpense(id);
    refresh();
  };

  const handleAddTransfer = (transfer: Transfer) => {
    storage.addTransfer(transfer);
    refresh();
  };

  const handleUpdateTransfer = (transfer: Transfer) => {
    storage.updateTransfer(transfer);
    refresh();
  };

  const handleDeleteTransfer = (id: string) => {
    storage.deleteTransfer(id);
    refresh();
  };

  const handleSetMonthlyIncome = (income: MonthlyIncome) => {
    storage.setMonthlyIncome(income);
    refresh();
  };

  const handleDeleteMonthlyIncome = (id: string) => {
    storage.deleteMonthlyIncome(id);
    refresh();
  };

  return (
    <AppContext.Provider
      value={{
        expenses,
        transfers,
        incomes,
        addExpense: handleAddExpense,
        updateExpense: handleUpdateExpense,
        deleteExpense: handleDeleteExpense,
        addTransfer: handleAddTransfer,
        updateTransfer: handleUpdateTransfer,
        deleteTransfer: handleDeleteTransfer,
        setMonthlyIncome: handleSetMonthlyIncome,
        deleteMonthlyIncome: handleDeleteMonthlyIncome,
        refresh,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
