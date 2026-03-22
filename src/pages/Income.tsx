import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Income as IncomeType } from '../lib/types'
import { formatCurrency, formatDate } from '../lib/utils'
import { Plus, FileEdit as Edit2, Trash2 } from 'lucide-react'
import './Income.css'

export function Income() {
  const [incomes, setIncomes] = useState<IncomeType[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    month: new Date().toISOString().split('T')[0].slice(0, 7),
    amount: '',
    source: ''
  })
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    fetchIncomes()
  }, [])

  const fetchIncomes = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('income')
      .select('*')
      .eq('user_id', user.id)
      .order('month', { ascending: false })

    setIncomes(data || [])
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const monthDate = `${formData.month}-01`

    if (editingId) {
      await supabase
        .from('income')
        .update({
          amount: parseFloat(formData.amount),
          source: formData.source
        })
        .eq('id', editingId)
    } else {
      await supabase
        .from('income')
        .upsert({
          user_id: user.id,
          month: monthDate,
          amount: parseFloat(formData.amount),
          source: formData.source
        }, { onConflict: 'user_id,month' })
    }

    setFormData({
      month: new Date().toISOString().split('T')[0].slice(0, 7),
      amount: '',
      source: ''
    })
    setEditingId(null)
    fetchIncomes()
  }

  const handleEdit = (income: IncomeType) => {
    setFormData({
      month: income.month.slice(0, 7),
      amount: income.amount.toString(),
      source: income.source
    })
    setEditingId(income.id)
  }

  const handleDelete = async (id: string) => {
    await supabase.from('income').delete().eq('id', id)
    fetchIncomes()
  }

  if (loading) {
    return <div className="page-content">Loading...</div>
  }

  return (
    <div className="page-content">
      <h1>Income</h1>

      <div className="income-form-card">
        <form onSubmit={handleSubmit} className="form">
          <div className="form-row">
            <div className="form-group">
              <label>Month</label>
              <input
                type="month"
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Amount</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>

            <div className="form-group">
              <label>Source</label>
              <input
                type="text"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                placeholder="e.g., Salary, Bonus"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary">
            {editingId ? 'Update Income' : 'Save Income'}
          </button>
        </form>
      </div>

      <div className="income-table-container">
        <table className="income-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Source</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {incomes.map((income) => (
              <tr key={income.id}>
                <td>{income.month}</td>
                <td>{income.source}</td>
                <td className="amount-cell">{formatCurrency(income.amount)}</td>
                <td className="actions-cell">
                  <button
                    className="btn-icon edit"
                    onClick={() => handleEdit(income)}
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    className="btn-icon delete"
                    onClick={() => handleDelete(income.id)}
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {incomes.length === 0 && (
          <div className="empty-state">
            <p>No income records yet. Add one to get started!</p>
          </div>
        )}
      </div>
    </div>
  )
}
