import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Expense, EXPENSE_CATEGORIES, ACCOUNTS } from '../lib/types'
import { formatCurrency, formatDate } from '../lib/utils'
import { Modal } from '../components/Modal'
import { Plus, Trash2, FileEdit as Edit2 } from 'lucide-react'
import './Expenses.css'

interface FormData {
  date: string
  amount: string
  category: string
  subcategory: string
  account: string
  description: string
  bill_url?: string
}

export function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<FormData>({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: 'Food & Dining',
    subcategory: 'Restaurant',
    account: 'Credit Card',
    description: ''
  })

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    setExpenses(data || [])
    setLoading(false)
  }

  const handleCategoryChange = (category: string) => {
    setFormData({
      ...formData,
      category,
      subcategory: EXPENSE_CATEGORIES[category as keyof typeof EXPENSE_CATEGORIES][0]
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (editingId) {
      await supabase
        .from('expenses')
        .update({
          date: formData.date,
          amount: parseFloat(formData.amount),
          category: formData.category,
          subcategory: formData.subcategory,
          account: formData.account,
          description: formData.description,
          bill_url: formData.bill_url
        })
        .eq('id', editingId)
    } else {
      await supabase
        .from('expenses')
        .insert([{
          user_id: user.id,
          date: formData.date,
          amount: parseFloat(formData.amount),
          category: formData.category,
          subcategory: formData.subcategory,
          account: formData.account,
          description: formData.description,
          bill_url: formData.bill_url
        }])
    }

    setFormData({
      date: new Date().toISOString().split('T')[0],
      amount: '',
      category: 'Food & Dining',
      subcategory: 'Restaurant',
      account: 'Credit Card',
      description: ''
    })
    setEditingId(null)
    setIsModalOpen(false)
    fetchExpenses()
  }

  const handleEdit = (expense: Expense) => {
    setFormData({
      date: expense.date,
      amount: expense.amount.toString(),
      category: expense.category,
      subcategory: expense.subcategory,
      account: expense.account,
      description: expense.description,
      bill_url: expense.bill_url
    })
    setEditingId(expense.id)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    await supabase.from('expenses').delete().eq('id', id)
    fetchExpenses()
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setFormData({
      date: new Date().toISOString().split('T')[0],
      amount: '',
      category: 'Food & Dining',
      subcategory: 'Restaurant',
      account: 'Credit Card',
      description: ''
    })
  }

  if (loading) {
    return <div className="page-content">Loading...</div>
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Expenses</h1>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} /> Add Expense
        </button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingId ? 'Edit Expense' : 'Add Expense'}
      >
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
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
              <label>Account</label>
              <select
                value={formData.account}
                onChange={(e) => setFormData({ ...formData, account: e.target.value })}
              >
                {ACCOUNTS.map((acc) => (
                  <option key={acc} value={acc}>{acc}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select
                value={formData.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                {Object.keys(EXPENSE_CATEGORIES).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Subcategory</label>
              <select
                value={formData.subcategory}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
              >
                {EXPENSE_CATEGORIES[formData.category as keyof typeof EXPENSE_CATEGORIES].map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional notes..."
              rows={3}
            />
          </div>

          <button type="submit" className="btn-primary w-full">
            {editingId ? 'Update Expense' : 'Add Expense'}
          </button>
        </form>
      </Modal>

      <div className="expenses-table-container">
        <table className="expenses-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Subcategory</th>
              <th>Account</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp) => (
              <tr key={exp.id}>
                <td>{formatDate(exp.date)}</td>
                <td>{exp.category}</td>
                <td>{exp.subcategory}</td>
                <td>{exp.account}</td>
                <td className="amount-cell">{formatCurrency(exp.amount)}</td>
                <td className="actions-cell">
                  <button
                    className="btn-icon edit"
                    onClick={() => handleEdit(exp)}
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    className="btn-icon delete"
                    onClick={() => handleDelete(exp.id)}
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {expenses.length === 0 && (
          <div className="empty-state">
            <p>No expenses yet. Add one to get started!</p>
          </div>
        )}
      </div>
    </div>
  )
}
