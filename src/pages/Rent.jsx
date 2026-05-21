import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MessageCircle, Calendar, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Rent = () => {
  const { clients = [], payments = [] } = useApp();
  const [activeTab, setActiveTab] = useState('monthly');

  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const currentYear = new Date().getFullYear();

  // Monthly Rent Report Logic
  const monthlyRentReport = payments.reduce((acc, p) => {
    const key = `${p.month} ${p.year}`;
    acc[key] = (acc[key] || 0) + parseFloat(p.amount || 0);
    return acc;
  }, {});

  // Pending Rent Report Logic
  const pendingTenants = clients.filter(client => {
    // Only consider active tenants
    if ((client.status || 'Active') !== 'Active') return false;
    const hasPaid = payments.some(p => p.clientId === client.id && p.month === currentMonth && String(p.year) === String(currentYear));
    return !hasPaid;
  });

  const renderMonthlyReport = () => (
    <div className="glass-card mt-20 animate-in">
      <h3>Monthly Rent Collection Report</h3>
      <div className="table-container mt-20">
        <table>
          <thead>
            <tr>
              <th>Month/Year</th>
              <th>Collection Target</th>
              <th>Actual Collected</th>
              <th>Variance</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(monthlyRentReport).map(([key, val]) => (
              <tr key={key}>
                <td><strong>{key}</strong></td>
                <td>₹{clients.filter(c => (c.status || 'Active') === 'Active').reduce((sum, c) => sum + parseFloat(c.rentAmount || 0), 0).toLocaleString()}</td>
                <td className="text-success">₹{val.toLocaleString()}</td>
                <td><span className="badge badge-success">On Track</span></td>
              </tr>
            ))}
            {Object.keys(monthlyRentReport).length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No rent collections recorded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPendingReport = () => (
    <div className="glass-card mt-20 animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h3>Pending Rent Report - {currentMonth} {currentYear}</h3>
        <span className="badge badge-error">{pendingTenants.length} Pending</span>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Tenant Name</th>
              <th>Contact</th>
              <th>Monthly Rent</th>
              <th>Last Paid</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingTenants.map(client => (
              <tr key={client.id}>
                <td>{client.name}</td>
                <td>{client.phone}</td>
                <td>₹{client.rentAmount}</td>
                <td className="text-muted">No record this month</td>
                <td>
                  <button 
                    className="btn-small btn-whatsapp"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#25d366', color: 'white', border: 'none' }}
                    onClick={() => {
                      const message = `*RENT REMINDER - KOLLUVELIL RENTALS*%0A%0A` +
                        `Hello *${client.name}*,%0A` +
                        `This is a friendly reminder that the rent of *₹${client.rentAmount}* for *${currentMonth} ${currentYear}* is pending.%0A%0A` +
                        `Kindly process the payment at your earliest convenience. If you have already paid, please ignore this message.%0A%0A` +
                        `Thank you!`;
                      const whatsappUrl = `https://wa.me/${client.phone.replace(/\D/g, '')}?text=${message}`;
                      window.open(whatsappUrl, '_blank');
                    }}
                  >
                    <MessageCircle size={14} /> Send Reminder
                  </button>
                </td>
              </tr>
            ))}
            {pendingTenants.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>All tenants have paid for this month!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="reports-page">
      <div className="report-tabs glass-card" style={{ display: 'flex', gap: '10px', padding: '10px', marginBottom: '20px', borderRadius: '12px' }}>
        <button 
          className={activeTab === 'monthly' ? 'active' : ''} 
          onClick={() => setActiveTab('monthly')}
          style={{ 
            padding: '10px 20px', 
            background: activeTab === 'monthly' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'monthly' ? 'white' : 'var(--text-main)'
          }}
        >
          <Calendar size={16} style={{ display: 'inline', marginRight: '8px' }} /> Monthly Rent
        </button>
        <button 
          className={activeTab === 'pending' ? 'active' : ''} 
          onClick={() => setActiveTab('pending')}
          style={{ 
            padding: '10px 20px', 
            background: activeTab === 'pending' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'pending' ? 'white' : 'var(--text-main)'
          }}
        >
          <AlertCircle size={16} style={{ display: 'inline', marginRight: '8px' }} /> Pending Rent
        </button>
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'monthly' && renderMonthlyReport()}
        {activeTab === 'pending' && renderPendingReport()}
      </motion.div>
    </div>
  );
};

export default Rent;
