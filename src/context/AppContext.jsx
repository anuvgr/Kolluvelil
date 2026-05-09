import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [clients, setClients] = useState(() => {
    const saved = localStorage.getItem('rental_clients');
    return saved ? JSON.parse(saved) : [];
  });

  const [payments, setPayments] = useState(() => {
    const saved = localStorage.getItem('rental_payments');
    return saved ? JSON.parse(saved) : [];
  });

  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('rental_expenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('rental_users');
    return saved ? JSON.parse(saved) : [{ id: '1', username: 'Admin', role: 'Admin', password: 'admin' }];
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('rental_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem('rental_logs');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('rental_clients', JSON.stringify(clients));
    } catch (e) {
      console.error("Storage quota exceeded", e);
      alert("Storage full! Unable to save recent large images.");
    }
  }, [clients]);

  useEffect(() => {
    try {
      localStorage.setItem('rental_payments', JSON.stringify(payments));
    } catch (e) {
      console.error("Storage quota exceeded", e);
    }
  }, [payments]);

  useEffect(() => {
    try {
      localStorage.setItem('rental_expenses', JSON.stringify(expenses));
    } catch (e) {
      console.error("Storage quota exceeded", e);
    }
  }, [expenses]);

  useEffect(() => {
    try {
      localStorage.setItem('rental_users', JSON.stringify(users));
    } catch (e) {
      console.error("Storage quota exceeded", e);
    }
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem('rental_logs', JSON.stringify(logs));
    } catch (e) {
      console.error("Storage quota exceeded", e);
    }
  }, [logs]);

  const addLog = (action, details) => {
    const username = currentUser ? currentUser.username : 'System';
    const newLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      user: username,
      action,
      details
    };
    setLogs(prev => [newLog, ...prev].slice(0, 500)); // Keep last 500 logs
  };

  const addClient = (client) => {
    setClients([...clients, { ...client, id: Date.now().toString(), status: 'Active' }]);
    addLog('Add Tenant', `Registered new tenant: ${client.name}`);
  };

  const updateClient = (id, updatedClient) => {
    setClients(clients.map(c => c.id === id ? { ...updatedClient, id } : c));
    addLog('Update Tenant', `Updated details for tenant: ${updatedClient.name}`);
  };

  const toggleClientStatus = (id, status) => {
    const client = clients.find(c => c.id === id);
    const extra = status === 'Vacated' ? { vacateDate: new Date().toISOString() } : {};
    const updatedClients = clients.map(c =>
      c.id === id ? { ...c, status, ...extra } : c
    );
    setClients(updatedClients);
    // Persist immediately so FormerTenants page sees the change even after instant navigation
    try {
      localStorage.setItem('rental_clients', JSON.stringify(updatedClients));
    } catch (e) {
      console.error('Storage error', e);
    }
    addLog('Change Tenant Status', `Marked ${client?.name || 'Tenant'} as ${status}`);
  };

  const deleteClient = (id) => {
    const client = clients.find(c => c.id === id);
    if (window.confirm(`Permanently delete ${client?.name || 'this tenant'}? This cannot be undone.`)) {
      setClients(prev => prev.filter(c => c.id !== id));
      addLog('Delete Tenant', `Permanently deleted tenant: ${client?.name}`);
    }
  };

  const addPayment = (payment) => {
    const newPayment = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      ...payment
    };
    setPayments([...payments, newPayment]);
    const client = clients.find(c => c.id === payment.clientId);
    addLog('Record Payment', `Collected ₹${payment.amount} from ${client?.name || 'Tenant'}`);
  };

  const addExpense = (expense) => {
    setExpenses([...expenses, { ...expense, id: Date.now().toString(), date: new Date().toISOString() }]);
    addLog('Record Expense', `Added expense: ${expense.title} (₹${expense.amount})`);
  };

  const addUser = (user) => {
    setUsers([...users, { ...user, id: Date.now().toString() }]);
    addLog('Add User', `Created new system user: ${user.username}`);
  };

  const removeUser = (id) => {
    if (users.length <= 1) {
      alert("Cannot remove the last user!");
      return;
    }
    if (window.confirm("Are you sure you want to remove this user?")) {
      const user = users.find(u => u.id === id);
      setUsers(users.filter(u => u.id !== id));
      addLog('Remove User', `Deleted system user: ${user?.username}`);
    }
  };

  const login = (username, password) => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('rental_current_user', JSON.stringify(user));
      const newLog = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        user: user.username,
        action: 'Login',
        details: 'User signed in successfully'
      };
      setLogs(prev => [newLog, ...prev].slice(0, 500));
      return true;
    }
    return false;
  };

  const logout = () => {
    addLog('Logout', 'User signed out');
    setCurrentUser(null);
    localStorage.removeItem('rental_current_user');
  };

  const clearLogs = () => {
    if (window.confirm("Are you sure you want to clear all activity logs? This cannot be undone.")) {
      setLogs([]);
      localStorage.removeItem('rental_logs');
    }
  };

  return (
    <AppContext.Provider value={{ 
      clients, payments, expenses, users, currentUser, logs,
      addClient, updateClient, toggleClientStatus, deleteClient,
      addPayment, addExpense, addUser, removeUser,
      login, logout, clearLogs
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
