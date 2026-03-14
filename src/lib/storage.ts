import { Expense, Transfer, MonthlyIncome } from "./types";

const STORAGE_KEYS = {
  expenses: "finself_expenses",
  transfers: "finself_transfers",
  income: "finself_income",
};

function getItem<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function setItem<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// Expenses
export function getExpenses(): Expense[] {
  return getItem<Expense>(STORAGE_KEYS.expenses);
}

export function addExpense(expense: Expense): void {
  const expenses = getExpenses();
  expenses.push(expense);
  setItem(STORAGE_KEYS.expenses, expenses);
}

export function updateExpense(expense: Expense): void {
  const expenses = getExpenses().map((e) =>
    e.id === expense.id ? expense : e
  );
  setItem(STORAGE_KEYS.expenses, expenses);
}

export function deleteExpense(id: string): void {
  const expenses = getExpenses().filter((e) => e.id !== id);
  setItem(STORAGE_KEYS.expenses, expenses);
}

// Transfers
export function getTransfers(): Transfer[] {
  return getItem<Transfer>(STORAGE_KEYS.transfers);
}

export function addTransfer(transfer: Transfer): void {
  const transfers = getTransfers();
  transfers.push(transfer);
  setItem(STORAGE_KEYS.transfers, transfers);
}

export function updateTransfer(transfer: Transfer): void {
  const transfers = getTransfers().map((t) =>
    t.id === transfer.id ? transfer : t
  );
  setItem(STORAGE_KEYS.transfers, transfers);
}

export function deleteTransfer(id: string): void {
  const transfers = getTransfers().filter((t) => t.id !== id);
  setItem(STORAGE_KEYS.transfers, transfers);
}

// Monthly Income
export function getMonthlyIncomes(): MonthlyIncome[] {
  return getItem<MonthlyIncome>(STORAGE_KEYS.income);
}

export function setMonthlyIncome(income: MonthlyIncome): void {
  const incomes = getMonthlyIncomes();
  const idx = incomes.findIndex((i) => i.month === income.month);
  if (idx >= 0) {
    incomes[idx] = income;
  } else {
    incomes.push(income);
  }
  setItem(STORAGE_KEYS.income, incomes);
}

export function deleteMonthlyIncome(id: string): void {
  const incomes = getMonthlyIncomes().filter((i) => i.id !== id);
  setItem(STORAGE_KEYS.income, incomes);
}
