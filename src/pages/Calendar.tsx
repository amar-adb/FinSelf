import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Expense } from '../lib/types'
import { formatCurrency, formatDate, addMonths, getDaysInMonth } from '../lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import './Calendar.css'

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const monthKey = currentDate.toISOString().split('T')[0].slice(0, 7)
      const { data } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', `${monthKey}-01`)
        .lte('date', `${monthKey}-31`)

      setExpenses(data || [])
      setLoading(false)
    }

    fetchExpenses()
  }, [currentDate])

  const getDaysArray = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = getDaysInMonth(currentDate)
    const days = []

    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }

    return days
  }

  const getExpensesForDate = (day: number): Expense[] => {
    const monthKey = currentDate.toISOString().split('T')[0].slice(0, 7)
    const dateStr = `${monthKey}-${String(day).padStart(2, '0')}`
    return expenses.filter(e => e.date === dateStr)
  }

  const getTotalForDate = (day: number): number => {
    return getExpensesForDate(day).reduce((sum, exp) => sum + exp.amount, 0)
  }

  const monthName = currentDate.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long'
  })

  const days = getDaysArray()
  const selectedDayExpenses = selectedDate ? getExpensesForDate(parseInt(selectedDate)) : []

  if (loading) {
    return <div className="page-content">Loading...</div>
  }

  return (
    <div className="page-content">
      <div className="calendar-header">
        <h1>Calendar</h1>
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

      <div className="calendar-container">
        <div className="calendar-grid">
          <div className="weekdays">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="weekday">{day}</div>
            ))}
          </div>

          <div className="days">
            {days.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="empty-day"></div>
              }

              const total = getTotalForDate(day)
              const isSelected = selectedDate === day.toString()

              return (
                <div
                  key={day}
                  className={`day ${total > 0 ? 'has-expense' : ''} ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedDate(day.toString())}
                >
                  <div className="day-number">{day}</div>
                  {total > 0 && (
                    <div className="day-total">₹{Math.round(total)}</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {selectedDate && (
          <div className="selected-date-expenses">
            <h2>Expenses for {formatDate(`${currentDate.toISOString().split('T')[0].slice(0, 7)}-${String(parseInt(selectedDate)).padStart(2, '0')}`)}</h2>

            {selectedDayExpenses.length > 0 ? (
              <div className="expenses-list">
                {selectedDayExpenses.map(exp => (
                  <div key={exp.id} className="expense-row">
                    <div>
                      <p className="expense-category">{exp.category}</p>
                      <p className="expense-subcategory">{exp.subcategory}</p>
                    </div>
                    <span className="amount">{formatCurrency(exp.amount)}</span>
                  </div>
                ))}
                <div className="total-row">
                  <span>Total</span>
                  <span className="amount">
                    {formatCurrency(selectedDayExpenses.reduce((sum, exp) => sum + exp.amount, 0))}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-muted">No expenses for this date</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
