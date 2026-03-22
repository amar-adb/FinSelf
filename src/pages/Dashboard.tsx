import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Income, Expense } from '../lib/types'
import { formatCurrency, getMonthKey, addMonths } from '../lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import './Dashboard.css'

export function Dashboard() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [income, setIncome] = useState<Income | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const monthKey = currentDate.toISOString().split('T')[0].slice(0, 7)
      const monthDate = `${monthKey}-01`

      const [incomeData, expensesData] = await Promise.all([
        supabase
          .from('income')
          .select('*')
          .eq('user_id', user.id)
          .eq('month', monthDate)
          .maybeSingle(),
        supabase
          .from('expenses')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', `${monthKey}-01`)
          .lte('date', `${monthKey}-31`)
      ])

      setIncome(incomeData.data)
      setExpenses(expensesData.data || [])
      setLoading(false)
    }

    fetchData()
  }, [currentDate])

  const monthName = currentDate.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long'
  })

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const remainingCapital = (income?.amount || 0) - totalExpenses

  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount
    return acc
  }, {} as Record<string, number>)

  const topCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  const recentExpenses = expenses
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  if (loading) {
    return <div className="page-content">Loading...</div>
  }

  return (
    <div className="page-content">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="month-switcher">
          <button onClick={() => setCurrentDate(addMonths(currentDate, -1))}>
            <ChevronLeft size={20} />
          </button>
          <span>{monthName}</span>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="cards-grid">
        <div className="card">
          <h3>Monthly Income</h3>
          <p className="amount income-amount">{formatCurrency(income?.amount || 0)}</p>
          {!income && <a href="/income" className="link">Set income →</a>}
        </div>

        <div className="card">
          <h3>Total Expenses</h3>
          <p className="amount expense-amount">{formatCurrency(totalExpenses)}</p>
        </div>

        <div className="card">
          <h3>Capital Remaining</h3>
          <p className={`amount ${remainingCapital >= 0 ? 'positive' : 'negative'}`}>
            {formatCurrency(remainingCapital)}
          </p>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="section">
          <h2>Top Categories</h2>
          <div className="category-list">
            {topCategories.length > 0 ? (
              topCategories.map(([category, amount]) => (
                <div key={category} className="category-item">
                  <span>{category}</span>
                  <span>{formatCurrency(amount)}</span>
                </div>
              ))
            ) : (
              <p className="text-muted">No expenses yet</p>
            )}
          </div>
        </div>

        <div className="section">
          <h2>Recent Expenses</h2>
          <div className="expenses-list">
            {recentExpenses.length > 0 ? (
              recentExpenses.map((exp) => (
                <div key={exp.id} className="expense-item">
                  <div>
                    <p className="expense-category">{exp.category}</p>
                    <p className="text-muted text-sm">{exp.date}</p>
                  </div>
                  <span className="amount">{formatCurrency(exp.amount)}</span>
                </div>
              ))
            ) : (
              <p className="text-muted">No expenses yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
