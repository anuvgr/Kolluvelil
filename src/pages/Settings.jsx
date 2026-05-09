import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Save, Download, Upload, UserPlus, Trash2, Key, Activity, Settings as SettingsIcon, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Settings = () => {
  const { clients, payments, expenses, users, logs, addUser, removeUser, clearLogs } = useApp();
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
          <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
            <ShieldCheck size={18} /> User Management
          </button>
          <button className={activeTab === 'logs' ? 'active' : ''} onClick={() => setActiveTab('logs')}>
            <Activity size={18} /> Activity Logs
          </button>
        </div>

        <div className="settings-content mt-20">
          <AnimatePresence mode="wait">
            {activeTab === 'general' && renderGeneral()}
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'logs' && renderLogs()}
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
        
        @media (max-width: 768px) {
          .settings-tabs { width: 100%; overflow-x: auto; }
        }
      `}</style>
    </div>
  );
};

export default Settings;
