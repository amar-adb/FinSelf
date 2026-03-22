import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Expense } from '../lib/types'
import { formatCurrency, getMonthKey, addMonths } from '../lib/utils'
import './Stats.css'

type TimeRange = 'monthly' | 'yearly' | 'alltime'

export function Stats() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [timeRange, setTimeRange] = useState<TimeRange>('monthly')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      let query = supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)

      if (timeRange === 'monthly') {
        const monthKey = currentDate.toISOString().split('T')[0].slice(0, 7)
        query = query
          .gte('date', `${monthKey}-01`)
          .lte('date', `${monthKey}-31`)
      } else if (timeRange === 'yearly') {
        const year = currentDate.getFullYear()
        query = query
          .gte('date', `${year}-01-01`)
          .lte('date', `${year}-12-31`)
      }

      const { data } = await query

      setExpenses(data || [])
      setLoading(false)
    }

    fetchExpenses()
  }, [timeRange, currentDate])

  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount
    return acc
  }, {} as Record<string, number>)

  const totalExpenses = Object.values(categoryTotals).reduce((a, b) => a + b, 0)
  const categories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)

  const colors = [
    '#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b',
    '#fa709a', '#fee140', '#30cfd0', '#330867', '#eb6b56'
  ]

  const radius = 100
  let currentAngle = 0

  if (loading) {
    return <div className="page-content">Loading...</div>
  }

  return (
    <div className="page-content">
      <div className="stats-header">
        <h1>Statistics</h1>

        <div className="time-range-selector">
          <button
            className={`range-btn ${timeRange === 'monthly' ? 'active' : ''}`}
            onClick={() => setTimeRange('monthly')}
          >
            Monthly
          </button>
          <button
            className={`range-btn ${timeRange === 'yearly' ? 'active' : ''}`}
            onClick={() => setTimeRange('yearly')}
          >
            Yearly
          </button>
          <button
            className={`range-btn ${timeRange === 'alltime' ? 'active' : ''}`}
            onClick={() => setTimeRange('alltime')}
          >
            All Time
          </button>
        </div>
      </div>

      {timeRange === 'monthly' && (
        <div className="date-selector">
          <input
            type="month"
            value={currentDate.toISOString().split('T')[0].slice(0, 7)}
            onChange={(e) => {
              const [year, month] = e.target.value.split('-')
              setCurrentDate(new Date(parseInt(year), parseInt(month) - 1))
            }}
          />
        </div>
      )}

      {timeRange === 'yearly' && (
        <div className="date-selector">
          <input
            type="number"
            value={currentDate.getFullYear()}
            onChange={(e) => {
              const newDate = new Date(currentDate)
              newDate.setFullYear(parseInt(e.target.value))
              setCurrentDate(newDate)
            }}
            min="2020"
            max="2030"
          />
        </div>
      )}

      <div className="stats-container">
        <div className="chart-section">
          <h2>Expense Breakdown</h2>
          {categories.length > 0 ? (
            <svg viewBox="0 0 300 300" className="pie-chart">
              {categories.map(([category, amount], idx) => {
                const sliceAngle = (amount / totalExpenses) * 360
                const startAngle = currentAngle
                const endAngle = currentAngle + sliceAngle

                const x1 = radius * Math.cos((startAngle * Math.PI) / 180)
                const y1 = radius * Math.sin((startAngle * Math.PI) / 180)
                const x2 = radius * Math.cos((endAngle * Math.PI) / 180)
                const y2 = radius * Math.sin((endAngle * Math.PI) / 180)

                const largeArc = sliceAngle > 180 ? 1 : 0

                const pathData = [
                  `M 150 150`,
                  `L ${150 + x1} ${150 + y1}`,
                  `A ${radius} ${radius} 0 ${largeArc} 1 ${150 + x2} ${150 + y2}`,
                  'Z'
                ].join(' ')

                currentAngle = endAngle

                return (
                  <path
                    key={category}
                    d={pathData}
                    fill={colors[idx % colors.length]}
                    stroke="white"
                    strokeWidth="2"
                  />
                )
              })}
            </svg>
          ) : (
            <div className="no-data">No expenses for this period</div>
          )}
        </div>

        <div className="breakdown-section">
          <h2>Category Breakdown</h2>
          <div className="category-breakdown">
            {categories.map(([category, amount], idx) => {
              const percentage = (amount / totalExpenses) * 100
              return (
                <div key={category} className="breakdown-item">
                  <div className="item-header">
                    <div className="category-info">
                      <div
                        className="color-dot"
                        style={{ backgroundColor: colors[idx % colors.length] }}
                      ></div>
                      <span className="category-name">{category}</span>
                    </div>
                    <span className="amount">{formatCurrency(amount)}</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: colors[idx % colors.length]
                      }}
                    ></div>
                  </div>
                  <span className="percentage">{percentage.toFixed(1)}%</span>
                </div>
              )
            })}
            <div className="total-item">
              <span>Total Expenses</span>
              <span className="total-amount">{formatCurrency(totalExpenses)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
