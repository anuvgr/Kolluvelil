import React from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Users, CreditCard, AlertCircle, TrendingUp, Home, Building } from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ icon: Icon, label, value, trend, color, onClick }) => (
  <motion.div 
    whileHover={{ y: -5, scale: onClick ? 1.02 : 1 }}
    whileTap={{ scale: onClick ? 0.98 : 1 }}
    className={`glass-card stat-card ${onClick ? 'clickable' : ''}`}
    onClick={onClick}
    style={{ cursor: onClick ? 'pointer' : 'default' }}
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
        transition: all 0.3s;
      }
      .stat-card.clickable:hover {
        border-color: rgba(99, 102, 241, 0.4);
        box-shadow: 0 4px 20px rgba(99, 102, 241, 0.15);
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
      .trend { font-size: 0.75rem; color: var(--text-muted); margin-top: 4px; display: block; }
    `}</style>
  </motion.div>
);

const Dashboard = () => {
  const { clients, payments, properties } = useApp();
  const navigate = useNavigate();

  const totalRent = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  const activeTenants = clients.filter(c => c.status === 'Active').length;

  const totalProperties = properties.length;
  const occupiedProperties = properties.filter(p => p.status === 'Occupied').length;
  const vacantProperties = properties.filter(p => p.status === 'Vacant').length;
  const occupancyRate = totalProperties > 0 ? Math.round((occupiedProperties / totalProperties) * 100) : 0;

  return (
    <div className="dashboard-page">
      <div className="stats-grid">
        <StatCard 
          icon={Users} 
          label="Active Tenants" 
          value={activeTenants} 
          trend="Currently registered" 
          color="blue" 
          onClick={() => navigate('/clients')}
        />
        <StatCard 
          icon={CreditCard} 
          label="Revenue" 
          value={`₹${totalRent.toLocaleString()}`} 
          trend="Total collected" 
          color="green" 
          onClick={() => navigate('/payments')}
        />
        <StatCard 
          icon={AlertCircle} 
          label="Vacant Properties" 
          value={vacantProperties} 
          trend={`${occupiedProperties} of ${totalProperties} occupied`} 
          color="orange" 
          onClick={() => navigate('/properties')}
        />
        <StatCard 
          icon={TrendingUp} 
          label="Occupancy Rate" 
          value={`${occupancyRate}%`} 
          trend="Stable" 
          color="pink" 
          onClick={() => navigate('/properties')}
        />
      </div>

      <div className="dashboard-grid-layout mt-20">
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3>Recent Payments</h3>
            <button className="btn-small" onClick={() => navigate('/payments')}>View All</button>
          </div>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3>Upcoming Renewals</h3>
            <button className="btn-small" onClick={() => navigate('/clients')}>View All</button>
          </div>
          <div className="renewal-list mt-10">
            <div 
              className="renewal-item" 
              onClick={() => navigate('/clients')}
              style={{ cursor: 'pointer' }}
            >
              <div className="avatar sm"></div>
              <div className="info">
                <p className="name">Anu K K</p>
                <p className="sub">Expires in 12 days</p>
              </div>
              <button className="btn-small" onClick={(e) => { e.stopPropagation(); alert("Reminder notification sent!"); }}>Remind</button>
            </div>
          </div>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3>Vacant Properties</h3>
            <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontSize: '0.75rem', padding: '4px 8px', borderRadius: '6px', fontWeight: '600' }}>
              {vacantProperties} vacant
            </span>
          </div>
          <p className="text-muted" style={{ fontSize: '0.82rem', marginBottom: '15px', lineHeight: '1.4' }}>
            Click on any vacant unit to view details or register a tenant.
          </p>
          <div className="vacant-badges-container">
            {properties.filter(p => p.status === 'Vacant').map(p => (
              <button 
                key={p.id} 
                className="vacant-unit-badge"
                onClick={() => navigate('/properties')}
              >
                <Home size={14} className="text-success" />
                <div style={{ textAlign: 'left' }}>
                  <div className="unit-name">{p.unit_number}</div>
                  <div className="unit-desc">{p.type} · Floor {p.floor}</div>
                </div>
              </button>
            ))}
            {vacantProperties === 0 && (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)' }}>
                <Building size={32} className="text-primary" style={{ marginBottom: '10px' }} />
                <p style={{ fontWeight: '600' }}>All properties are occupied!</p>
              </div>
            )}
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
          transition: background-color 0.2s;
        }
        .renewal-item:hover {
          background: rgba(255, 255, 255, 0.03);
        }
        .renewal-item:last-child { border: none; }
        .avatar.sm { width: 32px; height: 32px; background: var(--glass); border-radius: 50%; }
        .info .name { font-weight: 600; font-size: 0.9rem; }
        .info .sub { color: var(--text-muted); font-size: 0.75rem; }
        .btn-small { padding: 6px 12px; font-size: 0.75rem; background: var(--glass); color: var(--text-main); }

        .dashboard-grid-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }

        .vacant-badges-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 240px;
          overflow-y: auto;
          padding-right: 4px;
        }
        .vacant-badges-container::-webkit-scrollbar {
          width: 4px;
        }
        .vacant-badges-container::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }

        .vacant-unit-badge {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--glass);
          border: 1px solid var(--glass-border);
          padding: 10px 14px;
          border-radius: 10px;
          transition: all 0.2s;
          width: 100%;
          cursor: pointer;
        }
        .vacant-unit-badge:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(99, 102, 241, 0.3);
          transform: translateY(-1px);
        }
        .vacant-unit-badge .unit-name {
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--text-main);
        }
        .vacant-unit-badge .unit-desc {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 1px;
        }

        @media (min-width: 1024px) {
          .dashboard-grid-layout {
            grid-template-columns: 1.2fr 1fr 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
