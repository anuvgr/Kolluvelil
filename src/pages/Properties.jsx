import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Search, Edit3, Trash2, Building, CheckCircle2, AlertCircle, Home, User, History } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

const Properties = () => {
  const { properties, addProperty, updateProperty, deleteProperty, clients } = useApp();
  const [viewMode, setViewMode] = useState(null); // 'add' or 'edit'
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [formData, setFormData] = useState({
    unit_number: '',
    floor: '',
    type: '2BHK',
    rent: '',
    deposit: '',
    status: 'Vacant'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      floor: parseInt(formData.floor) || 0,
      rent: parseFloat(formData.rent) || 0,
      deposit: parseFloat(formData.deposit) || 0,
    };

    if (viewMode === 'edit') {
      updateProperty(selectedProperty.id, data);
    } else {
      addProperty(data);
    }
    setViewMode(null);
    setSelectedProperty(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      unit_number: '',
      floor: '',
      type: '2BHK',
      rent: '',
      deposit: '',
      status: 'Vacant'
    });
  };

  const handleEdit = (property) => {
    setSelectedProperty(property);
    setFormData(property);
    setViewMode('edit');
  };

  const resetFormToAdd = () => {
    resetForm();
    setViewMode('add');
  };

  // Get active tenant for a property
  const getActiveTenant = (unitNumber) => {
    return clients.find(c => c.propertyUnit === unitNumber && c.status === 'Active');
  };

  // Filters
  const filteredProperties = properties.filter(p => {
    const matchesSearch = p.unit_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' || p.type === typeFilter;
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Unique types for filter
  const propertyTypes = ['All', ...new Set(properties.map(p => p.type))];

  // Stats
  const totalUnits = properties.length;
  const occupiedUnits = properties.filter(p => p.status === 'Occupied').length;
  const vacantUnits = properties.filter(p => p.status === 'Vacant').length;
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

  // Calculate property types data for chart
  const propertyTypesCount = properties.reduce((acc, p) => {
    acc[p.type] = (acc[p.type] || 0) + 1;
    return acc;
  }, {});
  
  const chartData = Object.keys(propertyTypesCount).map(type => ({
    name: type,
    count: propertyTypesCount[type]
  }));

  return (
    <div className="properties-page animate-in">
      {/* Stats Header Grid */}
      <div className="stats-grid">
        <StatCard 
          icon={Building} 
          label="Total Units" 
          value={totalUnits} 
          trend="Across all floors" 
          gradient="linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)" 
        />
        <StatCard 
          icon={CheckCircle2} 
          label="Occupied Units" 
          value={occupiedUnits} 
          trend={`${occupancyRate}% Occupancy`} 
          gradient="linear-gradient(135deg, #10b981 0%, #047857 100%)" 
        />
        <StatCard 
          icon={AlertCircle} 
          label="Vacant Units" 
          value={vacantUnits} 
          trend="Ready to move in" 
          gradient="linear-gradient(135deg, #f59e0b 0%, #b45309 100%)" 
        />
      </div>

      {/* Property Analytics Chart */}
      <div className="glass-card mt-20" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>Property Distribution</h3>
          <span className="badge badge-success">{totalUnits} Total Properties</span>
        </div>
        <div style={{ width: '100%', height: '300px' }}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.7)', fontSize: 12}} axisLine={false} tickLine={false} />
              <YAxis stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.7)', fontSize: 12}} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              />
              <Bar dataKey="count" fill="#ffffff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Control / Filter Bar */}
      <div className="page-header mt-20">
        <div className="filters-container glass-card">
          <div className="search-bar">
            <Search size={20} className="text-muted" />
            <input 
              type="text" 
              placeholder="Search by Unit No..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="select-filters">
            <div className="select-group">
              <label>Type</label>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                {propertyTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="select-group">
              <label>Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All">All Statuses</option>
                <option value="Vacant">Vacant</option>
                <option value="Occupied">Occupied</option>
              </select>
            </div>
          </div>
        </div>
        <button className="btn-primary" onClick={resetFormToAdd}>
          <Plus size={20} />
          <span>Add Property</span>
        </button>
      </div>

      {/* Properties Grid */}
      <div className="properties-grid mt-20">
        {filteredProperties.map(p => {
          const activeTenant = getActiveTenant(p.unit_number);
          return (
            <motion.div 
              key={p.id}
              whileHover={{ y: -4 }}
              className="glass-card property-card"
            >
              <div className="property-card-header">
                <div className="unit-badge">
                  <Home size={18} />
                  <span>{p.unit_number}</span>
                </div>
                <span className={`status-badge ${p.status.toLowerCase()}`}>
                  {p.status}
                </span>
              </div>
              <div className="property-card-body">
                <div className="details-row">
                  <div className="detail-item">
                    <span className="label">Floor</span>
                    <span className="value">{p.floor}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Type</span>
                    <span className="value">{p.type}</span>
                  </div>
                </div>
                <div className="pricing-row">
                  <div className="price-item">
                    <span className="label">Monthly Rent</span>
                    <span className="price">₹{p.rent.toLocaleString()}</span>
                  </div>
                  <div className="price-item">
                    <span className="label">Security Deposit</span>
                    <span className="price">₹{p.deposit.toLocaleString()}</span>
                  </div>
                </div>
                {activeTenant && (
                  <div className="tenant-info-box mt-10">
                    <User size={14} className="text-primary" />
                    <span>Tenant: <strong>{activeTenant.name}</strong></span>
                  </div>
                )}
              </div>
              <div className="property-card-footer">
                <Link to={`/reports?tab=history&unit=${p.unit_number}`} className="btn-icon-text history">
                  <History size={15} />
                  <span>History</span>
                </Link>
                <button className="btn-icon-text edit" onClick={() => handleEdit(p)}>
                  <Edit3 size={15} />
                  <span>Edit</span>
                </button>
                <button className="btn-icon-text delete" onClick={() => deleteProperty(p.id)}>
                  <Trash2 size={15} />
                  <span>Delete</span>
                </button>
              </div>
            </motion.div>
          );
        })}

        {filteredProperties.length === 0 && (
          <div className="glass-card empty-state" style={{ gridColumn: '1 / -1' }}>
            <Building size={48} className="text-muted" />
            <h3>No properties found</h3>
            <p className="text-muted">Try adjusting your search terms or add a new property.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {viewMode && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="modal-overlay"
          >
            <div className="modal-content glass-card" style={{ maxWidth: '500px' }}>
              <div className="modal-header">
                <h2>{viewMode === 'edit' ? 'Edit Property Details' : 'Add New Property Unit'}</h2>
                <button className="close-btn" onClick={() => setViewMode(null)}>&times;</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="grid-2">
                  <div className="input-group">
                    <label>Unit Number</label>
                    <input required type="text" placeholder="e.g. A101" value={formData.unit_number} onChange={e => setFormData({...formData, unit_number: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label>Floor</label>
                    <input required type="number" placeholder="e.g. 1" value={formData.floor} onChange={e => setFormData({...formData, floor: e.target.value})} />
                  </div>
                </div>

                <div className="grid-2 mt-10">
                  <div className="input-group">
                    <label>Property Type</label>
                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                      <option value="1BHK">1BHK</option>
                      <option value="2BHK">2BHK</option>
                      <option value="3BHK">3BHK</option>
                      <option value="4BHK">4BHK</option>
                      <option value="Single Room">Single Room</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Shop">Shop</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  {formData.type === 'Other' && (
                    <div className="input-group">
                      <label>Custom Type</label>
                      <input required type="text" placeholder="e.g. Studio" value={formData.custom_type || ''} onChange={e => setFormData({...formData, type: e.target.value, custom_type: e.target.value})} />
                    </div>
                  )}
                  <div className="input-group">
                    <label>Status</label>
                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} disabled={viewMode === 'edit' && getActiveTenant(formData.unit_number)}>
                      <option value="Vacant">Vacant</option>
                      <option value="Occupied">Occupied</option>
                    </select>
                  </div>
                </div>

                <div className="grid-2 mt-10">
                  <div className="input-group">
                    <label>Monthly Rent (₹)</label>
                    <input required type="number" placeholder="e.g. 15000" value={formData.rent} onChange={e => setFormData({...formData, rent: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label>Security Deposit (₹)</label>
                    <input required type="number" placeholder="e.g. 50000" value={formData.deposit} onChange={e => setFormData({...formData, deposit: e.target.value})} />
                  </div>
                </div>

                {viewMode === 'edit' && getActiveTenant(formData.unit_number) && (
                  <p className="help-text text-muted mt-10" style={{ fontSize: '0.8rem' }}>
                    * Status cannot be changed manually while there is an active tenant.
                  </p>
                )}

                <div className="modal-actions mt-20">
                  <button type="button" className="btn-secondary" onClick={() => setViewMode(null)}>Cancel</button>
                  <button type="submit" className="btn-primary">
                    {viewMode === 'edit' ? 'Save Changes' : 'Add Property'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .properties-page { padding-bottom: 40px; }
        
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
        
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }
        
        .filters-container {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 12px 24px;
          flex: 1;
          flex-wrap: wrap;
        }
        
        .filters-container .search-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
          min-width: 200px;
        }
        
        .filters-container .search-bar input {
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-main);
          width: 100%;
          font-size: 0.95rem;
        }
        
        .select-filters {
          display: flex;
          gap: 16px;
          align-items: center;
        }
        
        .select-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .select-group label {
          font-size: 0.8rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .select-group select {
          background: var(--glass);
          border: 1px solid var(--glass-border);
          color: var(--text-main);
          padding: 6px 12px;
          border-radius: 8px;
          outline: none;
          cursor: pointer;
        }
        
        .properties-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }
        
        .property-card {
          display: flex;
          flex-direction: column;
          padding: 20px;
          transition: all 0.3s;
        }
        
        .property-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        
        .unit-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(99, 102, 241, 0.1);
          color: var(--primary);
          padding: 6px 12px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 1rem;
        }
        
        .status-badge {
          font-size: 0.75rem;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .status-badge.vacant {
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.1);
        }
        
        .status-badge.occupied {
          background: rgba(99, 102, 241, 0.15);
          color: #818cf8;
        }
        
        .property-card-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }
        
        .details-row {
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid var(--glass-border);
          padding-bottom: 10px;
        }
        
        .property-card-body .detail-item {
          display: flex;
          flex-direction: column;
        }
        
        .property-card-body .detail-item .label,
        .property-card-body .price-item .label {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-bottom: 2px;
        }
        
        .property-card-body .detail-item .value {
          font-weight: 600;
          font-size: 0.95rem;
        }
        
        .pricing-row {
          display: flex;
          justify-content: space-between;
        }
        
        .price-item {
          display: flex;
          flex-direction: column;
        }
        
        .price-item .price {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-main);
        }
        
        .tenant-info-box {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--glass);
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 0.8rem;
        }
        
        .property-card-footer {
          display: flex;
          gap: 10px;
          border-top: 1px solid var(--glass-border);
          padding-top: 14px;
        }
        
        .btn-icon-text {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 500;
          background: var(--glass);
          color: var(--text-muted);
          border: 1px solid var(--glass-border);
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .btn-icon-text:hover {
          color: var(--text-main);
          background: rgba(255, 255, 255, 0.05);
        }
        
        .btn-icon-text.edit:hover {
          color: #34d399;
          border-color: rgba(52, 211, 153, 0.3);
          background: rgba(52, 211, 153, 0.05);
        }
        
        .btn-icon-text.delete:hover {
          color: #f87171;
          border-color: rgba(248, 113, 113, 0.3);
          background: rgba(248, 113, 113, 0.05);
        }

        .btn-icon-text.history {
          text-decoration: none;
        }

        .btn-icon-text.history:hover {
          color: #818cf8;
          border-color: rgba(129, 140, 248, 0.3);
          background: rgba(129, 140, 248, 0.05);
        }
        
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 40px;
          text-align: center;
          gap: 12px;
        }
        
        .empty-state h3 {
          font-size: 1.3rem;
          margin-top: 8px;
        }
        
        .mt-10 { margin-top: 10px; }
        .mt-20 { margin-top: 20px; }
        
        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: stretch;
          }
          .filters-container {
            flex-direction: column;
            align-items: stretch;
          }
          .select-filters {
            flex-wrap: wrap;
            justify-content: space-between;
          }
          .properties-grid {
            grid-template-columns: 1fr;
          }
        }
        
        .animate-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default Properties;
