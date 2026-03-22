import { Link } from 'react-router-dom'
import { BarChart3, CreditCard, Send, TrendingUp, Calendar, PieChart } from 'lucide-react'
import './Sidebar.css'

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>Finance Manager</h1>
      </div>

      <nav className="sidebar-nav">
        <Link to="/" className="nav-item">
          <BarChart3 size={20} />
          <span>Dashboard</span>
        </Link>
        <Link to="/expenses" className="nav-item">
          <CreditCard size={20} />
          <span>Expenses</span>
        </Link>
        <Link to="/income" className="nav-item">
          <TrendingUp size={20} />
          <span>Income</span>
        </Link>
        <Link to="/transfers" className="nav-item">
          <Send size={20} />
          <span>Transfers</span>
        </Link>
        <Link to="/calendar" className="nav-item">
          <Calendar size={20} />
          <span>Calendar</span>
        </Link>
        <Link to="/stats" className="nav-item">
          <PieChart size={20} />
          <span>Statistics</span>
        </Link>
      </nav>
    </aside>
  )
}
