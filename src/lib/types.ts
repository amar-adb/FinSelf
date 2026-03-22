export interface Income {
  id: string
  user_id: string
  month: string
  amount: number
  source: string
  created_at: string
}

export interface Expense {
  id: string
  user_id: string
  date: string
  amount: number
  category: string
  subcategory: string
  account: string
  description: string
  bill_url?: string
  created_at: string
}

export interface Transfer {
  id: string
  user_id: string
  date: string
  amount: number
  send_from: string
  send_to: string
  received_from: string
  mode: string
  description: string
  created_at: string
}

export const EXPENSE_CATEGORIES = {
  'Food & Dining': ['Restaurant', 'Groceries', 'Coffee', 'Delivery', 'Snacks'],
  'Transportation': ['Fuel', 'Public Transport', 'Taxi/Uber', 'Parking', 'Auto Maintenance'],
  'Shopping': ['Clothing', 'Electronics', 'Home', 'Books', 'Other'],
  'Entertainment': ['Movies', 'Gaming', 'Sports', 'Music', 'Events'],
  'Bills & Utilities': ['Electricity', 'Water', 'Internet', 'Phone', 'Insurance'],
  'Healthcare': ['Medical', 'Pharmacy', 'Fitness', 'Wellness'],
  'Travel': ['Flights', 'Hotels', 'Car Rental', 'Tours'],
  'Other': ['Miscellaneous']
}

export const ACCOUNTS = ['Credit Card', 'Debit Card', 'Cash']

export const TRANSFER_MODES = ['UPI', 'NEFT', 'IMPS', 'Cash', 'Cheque', 'Other']
