import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Receipt, Trash2, Search, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Expenses = () => {
  const { expenses, addExpense, clients } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Maintenance',
    description: '',
    date: new Date().toISOString().split('T')[0],
    tenantId: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addExpense(formData);
    setShowForm(false);
    setFormData({
      title: '', amount: '', category: 'Maintenance', description: '',
      date: new Date().toISOString().split('T')[0], tenantId: ''
    });
  };

  return (
    <div className="expenses-page">
      <div className="page-header">
        <div className="search-bar glass-card">
          <Search size={20} className="text-muted" />
          <input type="text" placeholder="Search expenses..." />
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)} style={{ background: 'linear-gradient(135deg, #f43f5e, #e11d48)' }}>
          <Plus size={20} />
          <span>Add Expense</span>
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="modal-overlay"
          >
            <div className="modal-content glass-card">
              <div className="modal-header">
                <h2>Record New Expense</h2>
                <button className="close-btn" onClick={() => setShowForm(false)}>&times;</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <label>Associated Tenant (Optional)</label>
                  <select value={formData.tenantId} onChange={e => setFormData({...formData, tenantId: e.target.value})}>
                    <option value="">General / No Specific Tenant</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label>Expense Title</label>
                  <input required type="text" placeholder="e.g. Plumbing Repair" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                
                <div className="grid-2">
                  <div className="input-group">
                    <label>Amount (₹)</label>
                    <input required type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label>Category</label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                      <option>Maintenance</option>
                      <option>Property Tax</option>
                      <option>Utility Bills</option>
                      <option>Cleaning</option>
                      <option>Legal/Admin</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div className="input-group">
                  <label>Date</label>
                  <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>

                <div className="input-group">
                  <label>Description</label>
                  <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ background: '#e11d48' }}>Record Expense</button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="expenses-list mt-20">
        <div className="glass-card">
          <div className="flex-row justify-between mb-20">
            <h3>Expense History</h3>
            <div className="expense-total">
              <span className="text-muted">Total Expenses:</span>
              <span className="text-error" style={{ marginLeft: '10px', fontSize: '1.2rem', fontWeight: 'bold' }}>
                ₹{expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0).toLocaleString()}
              </span>
            </div>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Expense Title</th>
                  <th>Tenant</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map(exp => (
                  <tr key={exp.id}>
                    <td>{new Date(exp.date).toLocaleDateString('en-GB').replace(/\//g, '-')}</td>
                    <td>{exp.title}</td>
                    <td>{exp.tenantId ? (clients.find(c => c.id === exp.tenantId)?.name || 'Former Tenant') : '-'}</td>
                    <td><span className="badge badge-error">{exp.category}</span></td>
                    <td className="text-error">₹{exp.amount}</td>
                    <td>
                      <button className="icon-btn"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
                {expenses.length === 0 && (
                  <tr><td colSpan="6" style={{textAlign: 'center', padding: '40px'}}>No expenses recorded yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        .flex-row { display: flex; align-items: center; }
        .justify-between { justify-content: space-between; }
        .mb-20 { margin-bottom: 20px; }
        .text-error { color: #ef4444; }
        .badge-error { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
      `}</style>
    </div>
  );
};

export default Expenses;
