export interface Expense {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  amount: number;
  category: string;
  subcategory: string;
  account: "credit_card" | "debit_card" | "cash";
  description: string;
  createdAt: string;
}

export interface Transfer {
  id: string;
  date: string;
  sendTo: string;
  sendFrom: string;
  receivedFrom: string;
  amount: number;
  mode: "upi" | "neft" | "imps" | "cash" | "cheque" | "other";
  description: string;
  createdAt: string;
}

export interface MonthlyIncome {
  id: string;
  month: string; // YYYY-MM
  amount: number;
  source: string;
}

export const CATEGORIES: Record<string, string[]> = {
  "Food & Dining": ["Groceries", "Restaurants", "Snacks", "Beverages", "Food Delivery"],
  Transportation: ["Fuel", "Public Transport", "Cab/Taxi", "Parking", "Maintenance"],
  Shopping: ["Clothing", "Electronics", "Home & Garden", "Personal Care", "Gifts"],
  Entertainment: ["Movies", "Games", "Subscriptions", "Events", "Hobbies"],
  Bills: ["Electricity", "Water", "Internet", "Phone", "Gas", "Rent"],
  Health: ["Medicine", "Doctor", "Gym", "Insurance", "Lab Tests"],
  Education: ["Books", "Courses", "Tuition", "Stationery", "Exams"],
  Travel: ["Flights", "Hotels", "Food", "Sightseeing", "Travel Insurance"],
  Investments: ["Mutual Funds", "Stocks", "FD", "Gold", "Crypto"],
  Other: ["Miscellaneous", "Charity", "Loans", "EMI", "Other"],
};

export const ACCOUNT_LABELS: Record<string, string> = {
  credit_card: "Credit Card",
  debit_card: "Debit Card",
  cash: "Cash",
};

export const TRANSFER_MODE_LABELS: Record<string, string> = {
  upi: "UPI",
  neft: "NEFT",
  imps: "IMPS",
  cash: "Cash",
  cheque: "Cheque",
  other: "Other",
};
