import React from 'react';
import { useApp } from '../context/AppContext';
import { Users, CreditCard, AlertCircle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ icon: Icon, label, value, trend, color }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="glass-card stat-card"
  >
    <div className={`icon-box ${color}`}>
      <Icon size={24} />
    </div>
    <div className="stat-info">
      <p>{label}</p>
      <h3>{value}</h3>
      {trend && <span className="trend">{trend}</span>}
    </div>
    
    <style>{`
      .stat-card {
        display: flex;
        align-items: center;
        gap: 20px;
        padding: 24px;
      }
      .icon-box {
        width: 56px;
        height: 56px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .icon-box.blue { background: rgba(99, 102, 241, 0.15); color: #818cf8; }
      .icon-box.pink { background: rgba(236, 72, 153, 0.15); color: #f472b6; }
      .icon-box.green { background: rgba(16, 185, 129, 0.15); color: #34d399; }
      .icon-box.orange { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
      
      .stat-info p { color: var(--text-muted); font-size: 0.875rem; margin-bottom: 4px; }
      .stat-info h3 { font-size: 1.5rem; }
      .trend { font-size: 0.75rem; color: #34d399; margin-top: 4px; display: block; }
    `}</style>
  </motion.div>
);

const Dashboard = () => {
  const { clients, payments } = useApp();

  const totalRent = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  const activeTenants = clients.length;

  return (
    <div className="dashboard-page">
      <div className="stats-grid">
        <StatCard 
          icon={Users} 
          label="Total Tenants" 
          value={activeTenants} 
          trend="+2 this month" 
          color="blue" 
        />
        <StatCard 
          icon={CreditCard} 
          label="Revenue" 
          value={`₹${totalRent.toLocaleString()}`} 
          trend="+12.5% vs last month" 
          color="green" 
        />
        <StatCard 
          icon={AlertCircle} 
          label="Pending Payments" 
          value="3" 
          trend="Due in 5 days" 
          color="orange" 
        />
        <StatCard 
          icon={TrendingUp} 
          label="Occupancy Rate" 
          value="92%" 
          trend="Stable" 
          color="pink" 
        />
      </div>

      <div className="recent-activity grid-2 mt-20">
        <div className="glass-card">
          <h3>Recent Payments</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Tenant</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.slice(0, 5).map(p => (
                  <tr key={p.id}>
                    <td>{p.tenantName}</td>
                    <td>₹{p.amount}</td>
                    <td>{new Date(p.date).toLocaleDateString('en-GB').replace(/\//g, '-')}</td>
                    <td><span className="badge badge-success">Paid</span></td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr><td colSpan="4" style={{textAlign: 'center', color: 'var(--text-muted)'}}>No recent payments</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-card">
          <h3>Upcoming Renewals</h3>
          <div className="renewal-list mt-10">
            <div className="renewal-item">
              <div className="avatar sm"></div>
              <div className="info">
                <p className="name">Anu K K</p>
                <p className="sub">Expires in 12 days</p>
              </div>
              <button className="btn-small">Remind</button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .dashboard-page { padding-bottom: 40px; }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
        }
        .mt-20 { margin-top: 20px; }
        .mt-10 { margin-top: 10px; }
        
        .renewal-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-bottom: 1px solid var(--glass-border);
        }
        .renewal-item:last-child { border: none; }
        .avatar.sm { width: 32px; height: 32px; background: var(--glass); border-radius: 50%; }
        .info .name { font-weight: 600; font-size: 0.9rem; }
        .info .sub { color: var(--text-muted); font-size: 0.75rem; }
        .btn-small { padding: 6px 12px; font-size: 0.75rem; background: var(--glass); color: var(--text-main); }
      `}</style>
    </div>
  );
};

export default Dashboard;
