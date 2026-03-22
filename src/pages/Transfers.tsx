import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Transfer, TRANSFER_MODES } from '../lib/types'
import { formatCurrency, formatDate } from '../lib/utils'
import { Modal } from '../components/Modal'
import { Plus, FileEdit as Edit2, Trash2 } from 'lucide-react'
import './Transfers.css'

interface FormData {
  date: string
  amount: string
  send_from: string
  send_to: string
  received_from: string
  mode: string
  description: string
}

export function Transfers() {
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<FormData>({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    send_from: '',
    send_to: '',
    received_from: '',
    mode: 'UPI',
    description: ''
  })

  useEffect(() => {
    fetchTransfers()
  }, [])

  const fetchTransfers = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('transfers')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    setTransfers(data || [])
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (editingId) {
      await supabase
        .from('transfers')
        .update({
          date: formData.date,
          amount: parseFloat(formData.amount),
          send_from: formData.send_from,
          send_to: formData.send_to,
          received_from: formData.received_from,
          mode: formData.mode,
          description: formData.description
        })
        .eq('id', editingId)
    } else {
      await supabase
        .from('transfers')
        .insert([{
          user_id: user.id,
          date: formData.date,
          amount: parseFloat(formData.amount),
          send_from: formData.send_from,
          send_to: formData.send_to,
          received_from: formData.received_from,
          mode: formData.mode,
          description: formData.description
        }])
    }

    setFormData({
      date: new Date().toISOString().split('T')[0],
      amount: '',
      send_from: '',
      send_to: '',
      received_from: '',
      mode: 'UPI',
      description: ''
    })
    setEditingId(null)
    setIsModalOpen(false)
    fetchTransfers()
  }

  const handleEdit = (transfer: Transfer) => {
    setFormData({
      date: transfer.date,
      amount: transfer.amount.toString(),
      send_from: transfer.send_from,
      send_to: transfer.send_to,
      received_from: transfer.received_from,
      mode: transfer.mode,
      description: transfer.description
    })
    setEditingId(transfer.id)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    await supabase.from('transfers').delete().eq('id', id)
    fetchTransfers()
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setFormData({
      date: new Date().toISOString().split('T')[0],
      amount: '',
      send_from: '',
      send_to: '',
      received_from: '',
      mode: 'UPI',
      description: ''
    })
  }

  if (loading) {
    return <div className="page-content">Loading...</div>
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Transfers</h1>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} /> Add Transfer
        </button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingId ? 'Edit Transfer' : 'Add Transfer'}
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
              <label>Mode</label>
              <select
                value={formData.mode}
                onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
              >
                {TRANSFER_MODES.map((mode) => (
                  <option key={mode} value={mode}>{mode}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Send From</label>
            <input
              type="text"
              value={formData.send_from}
              onChange={(e) => setFormData({ ...formData, send_from: e.target.value })}
              placeholder="e.g., My Account"
              required
            />
          </div>

          <div className="form-group">
            <label>Send To</label>
            <input
              type="text"
              value={formData.send_to}
              onChange={(e) => setFormData({ ...formData, send_to: e.target.value })}
              placeholder="e.g., Friend's Account"
              required
            />
          </div>

          <div className="form-group">
            <label>Received From</label>
            <input
              type="text"
              value={formData.received_from}
              onChange={(e) => setFormData({ ...formData, received_from: e.target.value })}
              placeholder="Optional"
            />
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
            {editingId ? 'Update Transfer' : 'Add Transfer'}
          </button>
        </form>
      </Modal>

      <div className="transfers-grid">
        {transfers.map((transfer) => (
          <div key={transfer.id} className="transfer-card">
            <div className="card-header">
              <div>
                <p className="mode-badge">{transfer.mode}</p>
                <p className="text-sm text-muted">{formatDate(transfer.date)}</p>
              </div>
              <p className="amount">{formatCurrency(transfer.amount)}</p>
            </div>

            <div className="card-body">
              <div className="transfer-info">
                <span className="label">From:</span>
                <span>{transfer.send_from}</span>
              </div>
              <div className="transfer-info">
                <span className="label">To:</span>
                <span>{transfer.send_to}</span>
              </div>
              {transfer.received_from && (
                <div className="transfer-info">
                  <span className="label">Received From:</span>
                  <span>{transfer.received_from}</span>
                </div>
              )}
              {transfer.description && (
                <div className="transfer-info">
                  <span className="label">Note:</span>
                  <span>{transfer.description}</span>
                </div>
              )}
            </div>

            <div className="card-actions">
              <button
                className="btn-icon edit"
                onClick={() => handleEdit(transfer)}
              >
                <Edit2 size={18} />
              </button>
              <button
                className="btn-icon delete"
                onClick={() => handleDelete(transfer.id)}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {transfers.length === 0 && (
        <div className="empty-state">
          <p>No transfers yet. Add one to get started!</p>
        </div>
      )}
    </div>
  )
}
