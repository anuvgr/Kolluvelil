import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Save, Download, Upload, UserPlus, Trash2, Key, Activity, Settings as SettingsIcon, ShieldCheck, Cloud, RefreshCw, CheckCircle2, AlertCircle as AlertIcon, RotateCcw, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Settings = () => {
  const { 
    clients, payments, expenses, users, logs, 
    addUser, removeUser, clearLogs,
    isSyncing, lastSync, syncData,
    resetFormerTenants, resetAllPayments, resetAllExpenses, resetAllClients, resetCompleteSystem
  } = useApp();
  const [activeTab, setActiveTab] = useState('general');
  const [newUser, setNewUser] = useState({ username: '', role: 'Manager', password: '' });

  const handleAddUser = (e) => {
    e.preventDefault();
    if (newUser.username && newUser.password) {
      addUser(newUser);
      setNewUser({ username: '', role: 'Manager', password: '' });
      alert("User created successfully!");
    }
  };

  const handleBackup = () => {
    const data = {
      clients,
      payments,
      expenses,
      users,
      backupDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Kolluvelil_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRestore = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.clients && data.payments && data.expenses) {
          if (window.confirm("Warning: Restoring will overwrite all current data. Are you sure?")) {
            localStorage.setItem('rental_clients', JSON.stringify(data.clients));
            localStorage.setItem('rental_payments', JSON.stringify(data.payments));
            localStorage.setItem('rental_expenses', JSON.stringify(data.expenses));
            if (data.users) localStorage.setItem('rental_users', JSON.stringify(data.users));
            alert("Data restored successfully! The page will now reload.");
            window.location.reload();
          }
        } else {
          alert("Invalid backup file format!");
        }
      } catch (error) {
        alert("Failed to read backup file.");
      }
    };
    reader.readAsText(file);
  };

  const renderGeneral = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card settings-card">
      <div className="card-header">
        <Save className="text-primary" size={24} />
        <h3>Data Backup & Restore</h3>
      </div>
      <div className="card-body">
        <p className="text-muted mb-20">Securely backup all tenant, payment, and expense records, or restore from a previous backup file.</p>
        
        <div className="backup-actions">
          <button className="btn-primary" onClick={handleBackup} style={{ width: '100%', marginBottom: '16px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
            <Download size={18} /> Download Backup (.json)
          </button>

          <div className="restore-box">
            <label className="btn-secondary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
              <Upload size={18} /> Restore from Backup
              <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleRestore} />
            </label>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderUsers = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card settings-card">
      <div className="card-header">
        <Key className="text-primary" size={24} />
        <h3>User Management</h3>
      </div>
      <div className="card-body">
        <p className="text-muted mb-20">Create and manage access for system administrators and managers.</p>
        
        <form onSubmit={handleAddUser} className="user-form">
          <div className="grid-2">
            <div className="input-group">
              <label>Username</label>
              <input required type="text" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} placeholder="e.g. John Doe" />
            </div>
            <div className="input-group">
              <label>Role</label>
              <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                <option>Admin</option>
                <option>Manager</option>
              </select>
            </div>
          </div>
          <div className="input-group">
            <label>Password</label>
            <input required type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} placeholder="Enter secure password" />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}>
            <UserPlus size={18} /> Create User
          </button>
        </form>

        <div className="users-list mt-20">
          <h4 style={{ marginBottom: '12px' }}>Active Users</h4>
          {users && users.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {users.map(u => (
                <div key={u.id} className="user-item">
                  <div className="user-info">
                    <strong>{u.username}</strong>
                    <span className={`badge ${u.role === 'Admin' ? 'badge-error' : 'badge-success'}`}>{u.role}</span>
                  </div>
                  <button className="icon-btn text-error" onClick={() => removeUser(u.id)}><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted">No additional users created yet.</p>
          )}
        </div>
      </div>
    </motion.div>
  );

  const renderLogs = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card settings-card">
      <div className="card-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Activity className="text-primary" size={24} />
          <h3>System Activity Logs</h3>
        </div>
        <button className="btn-secondary text-error" onClick={clearLogs} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '0.85rem' }}>
          <Trash2 size={16} /> Clear All Logs
        </button>
      </div>
      <div className="card-body">
        <p className="text-muted mb-20">Audit trail of all actions performed by users in the system.</p>
        
        <div className="table-container" style={{ maxHeight: '500px', overflowY: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>User</th>
                <th>Action</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs && logs.length > 0 ? (
                logs.map(log => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {new Date(log.timestamp).toLocaleDateString('en-GB').replace(/\//g, '-')} {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td>
                      <span className={`badge ${log.user === 'Admin' ? 'badge-error' : 'badge-success'}`}>
                        {log.user}
                      </span>
                    </td>
                    <td style={{ fontWeight: '500' }}>{log.action}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{log.details}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    No activity logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );

  const renderCloud = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card settings-card">
      <div className="card-header">
        <Cloud className="text-primary" size={24} />
        <h3>Cloud Synchronization</h3>
      </div>
      <div className="card-body">
        <div className="sync-status-box glass-card mb-20" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="flex-row align-center justify-between">
            <div className="flex-row align-center">
              {isSyncing ? (
                <RefreshCw size={20} className="text-primary spin" />
              ) : (
                <CheckCircle2 size={20} className="text-success" />
              )}
              <div style={{ marginLeft: '10px' }}>
                <h4 style={{ margin: 0 }}>{isSyncing ? 'Synchronizing...' : 'Connected to Cloud'}</h4>
                <p className="text-muted" style={{ fontSize: '0.8rem', margin: 0 }}>
                  Last Synced: {lastSync ? new Date(lastSync).toLocaleString() : 'Never'}
                </p>
              </div>
            </div>
            <button 
              className="btn-primary" 
              onClick={() => syncData(true)} 
              disabled={isSyncing}
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              <RefreshCw size={14} style={{ marginRight: '6px' }} className={isSyncing ? 'spin' : ''} />
              Sync Now
            </button>
          </div>
        </div>

        <div className="info-alert mb-20" style={{ display: 'flex', gap: '12px', background: 'rgba(99,102,241,0.1)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.2)' }}>
          <AlertIcon size={20} className="text-primary" style={{ flexShrink: 0 }} />
          <p style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
            <strong>How it works:</strong> Your data is automatically pushed to the cloud whenever you add or update records. On other devices, simply click <strong>Sync Now</strong> to pull the latest updates.
          </p>
        </div>

        <div className="security-note">
          <p className="text-muted" style={{ fontSize: '0.75rem' }}>
            Cloud Sync is powered by Supabase. Your data is encrypted in transit and stored securely.
          </p>
        </div>
      </div>
    </motion.div>
  );

  const renderReset = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card settings-card">
      <div className="card-header" style={{ borderBottomColor: 'rgba(239,68,68,0.2)' }}>
        <AlertTriangle className="text-error" size={24} style={{ color: '#ef4444' }} />
        <h3>Danger Zone: Reset Data</h3>
      </div>
      <div className="card-body">
        <p className="text-muted mb-20">Reset specific datasets or revert the entire system to its default state. This action is **irreversible**. Please download a backup before proceeding.</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Former Tenants Reset */}
          <div className="reset-item flex-row align-center justify-between" style={{ padding: '16px', background: 'rgba(239,68,68,0.03)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '12px', display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ flex: '1 1 300px' }}>
              <h4 style={{ margin: '0 0 4px', color: 'var(--text-main)' }}>Reset Former Tenants</h4>
              <p className="text-muted" style={{ margin: 0, fontSize: '0.82rem' }}>Permanently clear all vacated tenants from the former tenants tab.</p>
            </div>
            <button 
              className="btn-secondary text-error" 
              onClick={async () => {
                const count = clients.filter(c => c.status === 'Vacated').length;
                if (count === 0) {
                  alert("No former tenants found to reset.");
                  return;
                }
                if (window.confirm(`Are you sure you want to permanently delete all ${count} vacated former tenants?`)) {
                  await resetFormerTenants();
                  alert("Former tenants cleared successfully!");
                }
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', padding: '10px 16px', background: 'rgba(239,68,68,0.05)' }}
            >
              <Trash2 size={16} /> WIPE {clients.filter(c => c.status === 'Vacated').length} RECORDS
            </button>
          </div>

          {/* Payments Reset */}
          <div className="reset-item flex-row align-center justify-between" style={{ padding: '16px', background: 'rgba(239,68,68,0.03)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '12px', display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ flex: '1 1 300px' }}>
              <h4 style={{ margin: '0 0 4px', color: 'var(--text-main)' }}>Reset Payments & Receipts</h4>
              <p className="text-muted" style={{ margin: 0, fontSize: '0.82rem' }}>Permanently delete all billing, rent collection, and transaction records.</p>
            </div>
            <button 
              className="btn-secondary text-error" 
              onClick={async () => {
                if (payments.length === 0) {
                  alert("No payment logs found to reset.");
                  return;
                }
                if (window.confirm("CRITICAL WARNING: This will permanently delete all collected rent and payment logs. Are you sure?")) {
                  await resetAllPayments();
                  alert("Payment records wiped successfully!");
                }
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', padding: '10px 16px', background: 'rgba(239,68,68,0.05)' }}
            >
              <Trash2 size={16} /> WIPE {payments.length} PAYMENTS
            </button>
          </div>

          {/* Expenses Reset */}
          <div className="reset-item flex-row align-center justify-between" style={{ padding: '16px', background: 'rgba(239,68,68,0.03)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '12px', display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ flex: '1 1 300px' }}>
              <h4 style={{ margin: '0 0 4px', color: 'var(--text-main)' }}>Reset Expenses</h4>
              <p className="text-muted" style={{ margin: 0, fontSize: '0.82rem' }}>Permanently delete all registered operational expenses and bills.</p>
            </div>
            <button 
              className="btn-secondary text-error" 
              onClick={async () => {
                if (expenses.length === 0) {
                  alert("No expense records found to reset.");
                  return;
                }
                if (window.confirm("Are you sure you want to permanently delete all expense records?")) {
                  await resetAllExpenses();
                  alert("Expense records cleared successfully!");
                }
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', padding: '10px 16px', background: 'rgba(239,68,68,0.05)' }}
            >
              <Trash2 size={16} /> WIPE {expenses.length} EXPENSES
            </button>
          </div>

          {/* Active Tenants Reset */}
          <div className="reset-item flex-row align-center justify-between" style={{ padding: '16px', background: 'rgba(239,68,68,0.03)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '12px', display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ flex: '1 1 300px' }}>
              <h4 style={{ margin: '0 0 4px', color: 'var(--text-main)' }}>Reset All Tenants (Active & Former)</h4>
              <p className="text-muted" style={{ margin: 0, fontSize: '0.82rem' }}>Wipe all active and inactive tenant accounts, agreements, and IDs.</p>
            </div>
            <button 
              className="btn-secondary text-error" 
              onClick={async () => {
                if (clients.length === 0) {
                  alert("No tenant records found to reset.");
                  return;
                }
                if (window.confirm("CRITICAL WARNING: This will permanently delete ALL active tenants AND vacated tenants. This cannot be undone. Proceed?")) {
                  await resetAllClients();
                  alert("All tenant records cleared successfully!");
                }
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', padding: '10px 16px', background: 'rgba(239,68,68,0.05)' }}
            >
              <Trash2 size={16} /> WIPE {clients.length} TENANTS
            </button>
          </div>

          {/* Full System Reset */}
          <div className="reset-item flex-row align-center justify-between" style={{ padding: '20px', background: 'rgba(239,68,68,0.06)', border: '2px dashed #ef4444', borderRadius: '12px', display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '10px' }}>
            <div style={{ flex: '1 1 300px' }}>
              <h4 style={{ margin: '0 0 4px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} /> FULL FACTORY RESET
              </h4>
              <p className="text-muted" style={{ margin: 0, fontSize: '0.82rem' }}>Deletes all tenants, payments, expenses, activity logs, and resets user profiles to default.</p>
            </div>
            <button 
              className="btn-primary" 
              onClick={async () => {
                const conf1 = window.confirm("EXTREME DANGER: Are you sure you want to restore the application to its original empty state? This will completely wipe all data on the cloud and locally.");
                if (conf1) {
                  const conf2 = window.confirm("Double Confirmation Required: To proceed with Factory Reset, please confirm that you understand this will log you out and clear all credentials.");
                  if (conf2) {
                    await resetCompleteSystem();
                  }
                }
              }}
              style={{ background: '#ef4444', borderColor: '#ef4444', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', padding: '12px 20px' }}
            >
              <RotateCcw size={16} /> PERFORM SYSTEM RESET
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="settings-page">
      <div className="page-header mb-20">
        <h2>System Settings</h2>
      </div>

      <div className="settings-container">
        <div className="settings-tabs glass-card">
          <button className={activeTab === 'general' ? 'active' : ''} onClick={() => setActiveTab('general')}>
            <SettingsIcon size={18} /> General
          </button>
          <button className={activeTab === 'cloud' ? 'active' : ''} onClick={() => setActiveTab('cloud')}>
            <Cloud size={18} /> Cloud Sync
          </button>
          <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
            <ShieldCheck size={18} /> User Management
          </button>
          <button className={activeTab === 'logs' ? 'active' : ''} onClick={() => setActiveTab('logs')}>
            <Activity size={18} /> Activity Logs
          </button>
          <button className={activeTab === 'reset' ? 'active' : ''} onClick={() => setActiveTab('reset')} style={{ color: activeTab === 'reset' ? '#fff' : '#ef4444' }}>
            <RotateCcw size={18} /> Reset Data
          </button>
        </div>

        <div className="settings-content mt-20">
          <AnimatePresence mode="wait">
            {activeTab === 'general' && renderGeneral()}
            {activeTab === 'cloud' && renderCloud()}
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'logs' && renderLogs()}
            {activeTab === 'reset' && renderReset()}
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        .settings-container { display: flex; flex-direction: column; gap: 0px; }
        .settings-tabs { display: flex; gap: 10px; padding: 10px; margin-bottom: 20px; width: fit-content; }
        .settings-tabs button { 
          display: flex; align-items: center; gap: 10px;
          background: transparent; color: var(--text-muted); padding: 10px 20px; white-space: nowrap; 
          border-radius: 10px; font-size: 0.95rem; transition: 0.3s; font-weight: 500;
        }
        .settings-tabs button:hover { background: rgba(255,255,255,0.05); color: var(--text-main); }
        .settings-tabs button.active { background: var(--primary); color: white; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); }

        .settings-card { padding: 30px; }
        .card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; border-bottom: 1px solid var(--glass-border); padding-bottom: 16px; }
        .card-header h3 { font-size: 1.3rem; }
        .text-primary { color: var(--primary); }
        .user-form { background: rgba(0,0,0,0.1); padding: 20px; border-radius: 12px; border: 1px solid var(--glass-border); }
        .user-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); border-radius: 10px; }
        .user-info { display: flex; align-items: center; gap: 12px; }
        .text-error { color: #ef4444; }
        
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .settings-tabs { width: 100%; overflow-x: auto; }
        }
      `}</style>
    </div>
  );
};

export default Settings;

