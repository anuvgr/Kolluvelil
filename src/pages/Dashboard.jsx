import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Users, CreditCard, AlertCircle, TrendingUp, Home, Building, Sparkles } from 'lucide-react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AnimatedCounter = ({ from = 0, to, duration = 1.5, format }) => {
  const count = useMotionValue(from);
  const rounded = useTransform(count, latest => {
    const val = Math.round(latest);
    return format ? format(val) : val;
  });

  useEffect(() => {
    const animation = animate(count, to, { duration, ease: "easeOut" });
    return animation.stop;
  }, [count, to, duration]);

  return <motion.span>{rounded}</motion.span>;
};

const StatCard = ({ icon: Icon, label, value, trend, gradient, onClick, isCurrency }) => (
  <motion.div 
    whileHover={{ y: -5, scale: onClick ? 1.02 : 1 }}
    whileTap={{ scale: onClick ? 0.98 : 1 }}
    className={`stat-card colorful-kpi ${onClick ? 'clickable' : ''}`}
    onClick={onClick}
    style={{ cursor: onClick ? 'pointer' : 'default', background: gradient }}
  >
    <div className="stat-content">
      <div className="stat-info">
        <p>{label}</p>
        <h3>
          {isCurrency && "₹"}
          <AnimatedCounter 
            from={0} 
            to={typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value} 
            format={v => isCurrency ? v.toLocaleString() : v} 
          />
          {typeof value === 'string' && value.includes('%') && "%"}
        </h3>
        {trend && <span className="trend">{trend}</span>}
      </div>
      <div className="icon-box-colorful">
        <Icon size={32} />
      </div>
    </div>
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

  // Mock data for the chart
  const chartData = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Feb', revenue: 3000 },
    { name: 'Mar', revenue: 5000 },
    { name: 'Apr', revenue: 4500 },
    { name: 'May', revenue: 6000 },
    { name: 'Jun', revenue: 8000 },
    { name: 'Jul', revenue: 7500 },
  ];

  return (
    <div className="dashboard-page animate-in">
      <div className="stats-grid">
        <StatCard 
          icon={Users} 
          label="Active Tenants" 
          value={activeTenants} 
          trend="Currently registered" 
          gradient="linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)" 
          onClick={() => navigate('/clients')}
        />
        <StatCard 
          icon={CreditCard} 
          label="Revenue" 
          value={totalRent} 
          isCurrency={true}
          trend="Total collected" 
          gradient="linear-gradient(135deg, #10b981 0%, #047857 100%)" 
          onClick={() => navigate('/payments')}
        />
        <StatCard 
          icon={AlertCircle} 
          label="Vacant Properties" 
          value={vacantProperties} 
          trend={`${occupiedProperties} of ${totalProperties} occupied`} 
          gradient="linear-gradient(135deg, #f59e0b 0%, #b45309 100%)" 
          onClick={() => navigate('/properties')}
        />
        <StatCard 
          icon={TrendingUp} 
          label="Occupancy Rate" 
          value={`${occupancyRate}%`} 
          trend="Stable" 
          gradient="linear-gradient(135deg, #ec4899 0%, #be185d 100%)" 
          onClick={() => navigate('/properties')}
        />
      </div>

      <div className="charts-grid mt-20">
        <div className="glass-card chart-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3>Revenue Growth</h3>
            <span className="badge badge-success">+12.5% this month</span>
          </div>
          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.7)', fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.7)', fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#ffffff" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>


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
      </div>

      <style>{`
        .dashboard-page { padding-bottom: 40px; }
        
        .colorful-kpi {
          border-radius: 20px;
          color: white;
          border: none;
          box-shadow: 0 10px 20px rgba(0,0,0,0.2);
          position: relative;
          overflow: hidden;
          padding: 24px;
        }
        
        .colorful-kpi::after {
          content: '';
          position: absolute;
          top: 0; right: 0; bottom: 0; left: 0;
          background: linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 100%);
          pointer-events: none;
        }

        .stat-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          z-index: 2;
        }

        .stat-info p { 
          color: rgba(255,255,255,0.8); 
          font-size: 0.9rem; 
          margin-bottom: 6px; 
          font-weight: 500;
        }
        
        .stat-info h3 { 
          font-size: 2rem; 
          font-weight: 700;
          letter-spacing: -0.5px;
          margin-bottom: 4px;
        }
        
        .stat-info .trend { 
          font-size: 0.8rem; 
          color: rgba(255,255,255,0.7); 
          display: block; 
        }

        .icon-box-colorful {
          background: rgba(255,255,255,0.2);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border-radius: 16px;
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 24px;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        
        @media (max-width: 1024px) {
          .charts-grid { grid-template-columns: 1fr; }
        }

        .ai-icon-bg {
          background: rgba(59, 130, 246, 0.15);
          width: 36px; height: 36px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
        }

        .ai-alert-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .ai-alert-item {
          display: flex;
          gap: 16px;
          padding: 16px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 12px;
          transition: all 0.3s;
        }

        .ai-alert-item:hover {
          background: rgba(255,255,255,0.05);
          transform: translateX(4px);
        }

        .ai-indicator {
          width: 8px;
          border-radius: 4px;
          flex-shrink: 0;
        }
        .ai-indicator.warning { background: #f59e0b; box-shadow: 0 0 10px rgba(245, 158, 11, 0.5); }
        .ai-indicator.success { background: #10b981; box-shadow: 0 0 10px rgba(16, 185, 129, 0.5); }
        .ai-indicator.info { background: #3b82f6; box-shadow: 0 0 10px rgba(59, 130, 246, 0.5); }

        .ai-content h4 {
          font-size: 0.95rem;
          margin-bottom: 6px;
          color: var(--text-main);
        }
        
        .ai-content p {
          font-size: 0.85rem;
          color: var(--text-muted);
          line-height: 1.5;
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
        .btn-small { padding: 6px 12px; font-size: 0.75rem; background: var(--glass); color: var(--text-main); border-radius: 8px; }

        .dashboard-grid-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }

        @media (min-width: 1024px) {
          .dashboard-grid-layout {
            grid-template-columns: 2fr 1fr;
          }
        }
        
        .animate-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default Dashboard;
