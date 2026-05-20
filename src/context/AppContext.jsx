import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';

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
    const defaultUsers = [
      { id: '1', username: 'Admin', role: 'Admin', password: 'admin' },
      { id: '2', username: 'anuvgr', role: 'Admin', password: 'AnU#Kozhi$2021' }
    ];
    return saved ? JSON.parse(saved) : defaultUsers;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('rental_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem('rental_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [properties, setProperties] = useState(() => {
    const saved = localStorage.getItem('rental_properties');
    const defaultProperties = [
      { id: 'p1', unit_number: 'A101', floor: 1, type: '2BHK', rent: 15000, deposit: 50000, status: 'Vacant' },
      { id: 'p2', unit_number: 'A102', floor: 1, type: '1BHK', rent: 10000, deposit: 30000, status: 'Vacant' },
      { id: 'p3', unit_number: 'B201', floor: 2, type: '3BHK', rent: 20000, deposit: 60000, status: 'Vacant' },
      { id: 'p4', unit_number: 'B202', floor: 2, type: '2BHK', rent: 15000, deposit: 50000, status: 'Vacant' },
      { id: 'p5', unit_number: 'C301', floor: 3, type: '2BHK', rent: 14000, deposit: 45000, status: 'Vacant' }
    ];
    return saved ? JSON.parse(saved) : defaultProperties;
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(localStorage.getItem('rental_last_sync') || null);

  // Persistence to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('rental_clients', JSON.stringify(clients));
    } catch (e) { console.error("Storage error", e); }
  }, [clients]);

  useEffect(() => {
    try {
      localStorage.setItem('rental_payments', JSON.stringify(payments));
    } catch (e) { console.error("Storage error", e); }
  }, [payments]);

  useEffect(() => {
    try {
      localStorage.setItem('rental_expenses', JSON.stringify(expenses));
    } catch (e) { console.error("Storage error", e); }
  }, [expenses]);

  useEffect(() => {
    try {
      localStorage.setItem('rental_users', JSON.stringify(users));
    } catch (e) { console.error("Storage error", e); }
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem('rental_logs', JSON.stringify(logs));
    } catch (e) { console.error("Storage error", e); }
  }, [logs]);

  useEffect(() => {
    try {
      localStorage.setItem('rental_properties', JSON.stringify(properties));
    } catch (e) { console.error("Storage error", e); }
  }, [properties]);

  useEffect(() => {
    if (lastSync) localStorage.setItem('rental_last_sync', lastSync);
  }, [lastSync]);

  // --- SYNC LOGIC ---
  const syncData = useCallback(async (force = false) => {
    if (!supabase) {
      console.error("Supabase not initialized. Check your .env file.");
      return;
    }
    if (isSyncing) return;
    
    setIsSyncing(true);
    console.log("Starting Cloud Sync...");
    
    try {
      // 1. Fetch from Cloud
      const [
        { data: cloudClients, error: errC },
        { data: cloudPayments, error: errP },
        { data: cloudExpenses, error: errE },
        { data: cloudUsers, error: errU },
        { data: cloudLogs, error: errL }
      ] = await Promise.all([
        supabase.from('clients').select('*'),
        supabase.from('payments').select('*'),
        supabase.from('expenses').select('*'),
        supabase.from('users').select('*'),
        supabase.from('logs').select('*')
      ]);

      // Try fetching properties table gracefully
      let cloudProperties = [];
      try {
        const { data, error } = await supabase.from('properties').select('*');
        if (!error && data) {
          cloudProperties = data;
        }
      } catch (err) {
        console.warn("Could not load properties from cloud. Using local state.");
      }

      // Check for common errors (like missing tables)
      if (errC || errP || errE || errU || errL) {
        const error = errC || errP || errE || errU || errL;
        console.error("Database connection error or missing tables:", error.message);
        if (error.message.includes("relation") && error.message.includes("does not exist")) {
          console.warn("CRITICAL: Tables not found. Please ensure you have run the schema.sql in your Supabase SQL Editor.");
        }
        setIsSyncing(false);
        return;
      }

      // 2. Simple Merge Strategy: Cloud is source of truth for now
      if (cloudClients?.length > 0) setClients(cloudClients);
      if (cloudPayments?.length > 0) setPayments(cloudPayments);
      if (cloudExpenses?.length > 0) setExpenses(cloudExpenses);
      if (cloudUsers?.length > 0) setUsers(cloudUsers);
      if (cloudLogs?.length > 0) setLogs(cloudLogs);
      if (cloudProperties?.length > 0) setProperties(cloudProperties);

      // 3. Push local if Cloud is empty (Initial Setup / Migration)
      if (cloudClients?.length === 0 && clients.length > 0) {
        console.log("Cloud is empty. Pushing local clients...");
        await supabase.from('clients').upsert(clients);
      }
      if (cloudPayments?.length === 0 && payments.length > 0) {
        console.log("Cloud is empty. Pushing local payments...");
        await supabase.from('payments').upsert(payments);
      }
      if (cloudExpenses?.length === 0 && expenses.length > 0) {
        console.log("Cloud is empty. Pushing local expenses...");
        await supabase.from('expenses').upsert(expenses);
      }
      if (cloudUsers?.length === 0 && users.length > 0) {
        console.log("Cloud is empty. Pushing local users...");
        await supabase.from('users').upsert(users);
      }
      if (cloudLogs?.length === 0 && logs.length > 0) {
        console.log("Cloud is empty. Pushing local logs...");
        await supabase.from('logs').upsert(logs);
      }
      if (cloudProperties?.length === 0 && properties.length > 0) {
        console.log("Cloud is empty. Pushing local properties...");
        try {
          await supabase.from('properties').upsert(properties);
        } catch (e) { console.error("Properties push failed", e); }
      }

      setLastSync(new Date().toISOString());
      console.log("Cloud Sync Completed Successfully");
    } catch (error) {
      console.error("Sync process encountered an exception:", error);
    } finally {
      setIsSyncing(false);
    }
  }, [clients, payments, expenses, users, logs, properties, isSyncing]);

  // --- REAL-TIME SYNC ---
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, payload => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          setClients(prev => {
            const exists = prev.find(c => c.id === payload.new.id);
            if (exists) return prev.map(c => c.id === payload.new.id ? payload.new : c);
            return [...prev, payload.new];
          });
        } else if (payload.eventType === 'DELETE') {
          setClients(prev => prev.filter(c => c.id === payload.old.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, payload => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          setPayments(prev => {
            const exists = prev.find(p => p.id === payload.new.id);
            if (exists) return prev.map(p => p.id === payload.new.id ? payload.new : p);
            return [...prev, payload.new];
          });
        } else if (payload.eventType === 'DELETE') {
          setPayments(prev => prev.filter(p => p.id === payload.old.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, payload => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          setExpenses(prev => {
            const exists = prev.find(e => e.id === payload.new.id);
            if (exists) return prev.map(e => e.id === payload.new.id ? payload.new : e);
            return [...prev, payload.new];
          });
        } else if (payload.eventType === 'DELETE') {
          setExpenses(prev => prev.filter(e => e.id === payload.old.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'logs' }, payload => {
        if (payload.eventType === 'INSERT') {
          setLogs(prev => [payload.new, ...prev].slice(0, 500));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'properties' }, payload => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          setProperties(prev => {
            const exists = prev.find(p => p.id === payload.new.id);
            if (exists) return prev.map(p => p.id === payload.new.id ? payload.new : p);
            return [...prev, payload.new];
          });
        } else if (payload.eventType === 'DELETE') {
          setProperties(prev => prev.filter(p => p.id === payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Initial sync on load
  useEffect(() => {
    if (supabase) {
      syncData();
    }
  }, [syncData]); // Add syncData to dependencies

  const pushToCloud = async (table, data) => {
    if (!supabase) return;
    try {
      await supabase.from(table).upsert(data);
    } catch (e) {
      console.error(`Push to ${table} failed`, e);
    }
  };

  const addLog = (action, details) => {
    const username = currentUser ? currentUser.username : 'System';
    const newLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      user: username,
      action,
      details
    };
    setLogs(prev => {
      const updatedLogs = [newLog, ...prev].slice(0, 500);
      return updatedLogs;
    });
    pushToCloud('logs', newLog);
  };

  const addClient = (client) => {
    const newClient = { ...client, id: Date.now().toString(), status: 'Active', updated_at: new Date().toISOString() };
    setClients(prev => [...prev, newClient]);
    addLog('Add Tenant', `Registered new tenant: ${client.name}`);
    pushToCloud('clients', newClient);

    // Mark property as Occupied
    if (client.propertyUnit) {
      setProperties(prev => prev.map(p => p.unit_number === client.propertyUnit ? { ...p, status: 'Occupied' } : p));
      const prop = properties.find(p => p.unit_number === client.propertyUnit);
      if (prop) pushToCloud('properties', { ...prop, status: 'Occupied' });
    }
  };

  const updateClient = (id, updatedClient) => {
    const oldClient = clients.find(c => c.id === id);
    const newClient = { ...updatedClient, id, updated_at: new Date().toISOString() };
    setClients(prev => prev.map(c => c.id === id ? newClient : c));
    addLog('Update Tenant', `Updated details for tenant: ${updatedClient.name}`);
    pushToCloud('clients', newClient);

    // Handle property transition
    if (oldClient && oldClient.propertyUnit !== updatedClient.propertyUnit) {
      // Vacate old property
      if (oldClient.propertyUnit) {
        setProperties(prev => prev.map(p => p.unit_number === oldClient.propertyUnit ? { ...p, status: 'Vacant' } : p));
        const oldProp = properties.find(p => p.unit_number === oldClient.propertyUnit);
        if (oldProp) pushToCloud('properties', { ...oldProp, status: 'Vacant' });
      }
      // Occupy new property
      if (updatedClient.propertyUnit) {
        setProperties(prev => prev.map(p => p.unit_number === updatedClient.propertyUnit ? { ...p, status: 'Occupied' } : p));
        const newProp = properties.find(p => p.unit_number === updatedClient.propertyUnit);
        if (newProp) pushToCloud('properties', { ...newProp, status: 'Occupied' });
      }
    }
  };

  const toggleClientStatus = (id, status) => {
    const client = clients.find(c => c.id === id);
    const extra = status === 'Vacated' ? { vacateDate: new Date().toISOString() } : {};
    const updatedClient = { ...client, status, ...extra, updated_at: new Date().toISOString() };
    setClients(prev => prev.map(c => c.id === id ? updatedClient : c));
    addLog('Change Tenant Status', `Marked ${client?.name || 'Tenant'} as ${status}`);
    pushToCloud('clients', updatedClient);

    // Revert property status to Vacant if tenant vacated
    if (client && client.propertyUnit) {
      const isVacating = status === 'Vacated';
      const targetStatus = isVacating ? 'Vacant' : 'Occupied';
      setProperties(prev => prev.map(p => p.unit_number === client.propertyUnit ? { ...p, status: targetStatus } : p));
      const prop = properties.find(p => p.unit_number === client.propertyUnit);
      if (prop) pushToCloud('properties', { ...prop, status: targetStatus });
    }
  };

  const deleteClient = async (id) => {
    const client = clients.find(c => c.id === id);
    if (window.confirm(`Permanently delete ${client?.name || 'this tenant'}? This cannot be undone.`)) {
      setClients(prev => prev.filter(c => c.id !== id));
      addLog('Delete Tenant', `Permanently deleted tenant: ${client?.name}`);
      if (supabase) await supabase.from('clients').delete().eq('id', id);

      // Revert property status to Vacant
      if (client && client.propertyUnit) {
        setProperties(prev => prev.map(p => p.unit_number === client.propertyUnit ? { ...p, status: 'Vacant' } : p));
        const prop = properties.find(p => p.unit_number === client.propertyUnit);
        if (prop) pushToCloud('properties', { ...prop, status: 'Vacant' });
      }
    }
  };

  const addPayment = (payment) => {
    const newPayment = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      ...payment
    };
    setPayments(prev => [...prev, newPayment]);
    const client = clients.find(c => c.id === payment.clientId);
    addLog('Record Payment', `Collected ₹${payment.amount} from ${client?.name || 'Tenant'}`);
    pushToCloud('payments', newPayment);
  };

  const addExpense = (expense) => {
    const newExpense = { ...expense, id: Date.now().toString(), date: new Date().toISOString() };
    setExpenses(prev => [...prev, newExpense]);
    addLog('Record Expense', `Added expense: ${expense.title} (₹${expense.amount})`);
    pushToCloud('expenses', newExpense);
  };

  const addUser = (user) => {
    const newUser = { ...user, id: Date.now().toString() };
    setUsers(prev => [...prev, newUser]);
    addLog('Add User', `Created new system user: ${user.username}`);
    pushToCloud('users', newUser);
  };

  const removeUser = async (id) => {
    if (users.length <= 1) {
      alert("Cannot remove the last user!");
      return;
    }
    if (window.confirm("Are you sure you want to remove this user?")) {
      const user = users.find(u => u.id === id);
      setUsers(prev => prev.filter(u => u.id !== id));
      addLog('Remove User', `Deleted system user: ${user?.username}`);
      if (supabase) await supabase.from('users').delete().eq('id', id);
    }
  };

  const login = (username, password) => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('rental_current_user', JSON.stringify(user));
      addLog('Login', 'User signed in successfully');
      return true;
    }
    return false;
  };

  const logout = () => {
    addLog('Logout', 'User signed out');
    setCurrentUser(null);
    localStorage.removeItem('rental_current_user');
  };

  const clearLogs = async () => {
    if (window.confirm("Are you sure you want to clear all activity logs? This cannot be undone.")) {
      setLogs([]);
      localStorage.removeItem('rental_logs');
      if (supabase) await supabase.from('logs').delete().neq('id', 0);
    }
  };

  const resetFormerTenants = async () => {
    setClients(prev => prev.filter(c => c.status !== 'Vacated'));
    addLog('Reset Former Tenants', 'Wiped all vacated/former tenant records');
    if (supabase) {
      try {
        await supabase.from('clients').delete().eq('status', 'Vacated');
      } catch (e) { console.error(e); }
    }
  };

  const resetAllPayments = async () => {
    setPayments([]);
    addLog('Reset Payments', 'Wiped all payment transaction logs');
    if (supabase) {
      try {
        await supabase.from('payments').delete().neq('id', '0');
      } catch (e) { console.error(e); }
    }
  };

  const resetAllExpenses = async () => {
    setExpenses([]);
    addLog('Reset Expenses', 'Wiped all expense logs');
    if (supabase) {
      try {
        await supabase.from('expenses').delete().neq('id', '0');
      } catch (e) { console.error(e); }
    }
  };

  const resetAllClients = async () => {
    setClients([]);
    addLog('Reset Tenants', 'Wiped all tenant records');
    if (supabase) {
      try {
        await supabase.from('clients').delete().neq('id', '0');
      } catch (e) { console.error(e); }
    }
  };

  const addProperty = (property) => {
    const newProp = { ...property, id: Date.now().toString(), status: 'Vacant', updated_at: new Date().toISOString() };
    setProperties(prev => [...prev, newProp]);
    addLog('Add Property', `Registered property unit: ${property.unit_number}`);
    pushToCloud('properties', newProp);
  };

  const updateProperty = (id, updatedProperty) => {
    const newProp = { ...updatedProperty, id, updated_at: new Date().toISOString() };
    setProperties(prev => prev.map(p => p.id === id ? newProp : p));
    addLog('Update Property', `Updated property unit: ${updatedProperty.unit_number}`);
    pushToCloud('properties', newProp);
  };

  const deleteProperty = async (id) => {
    const prop = properties.find(p => p.id === id);
    if (window.confirm(`Permanently delete property ${prop?.unit_number}? This cannot be undone.`)) {
      setProperties(prev => prev.filter(p => p.id !== id));
      addLog('Delete Property', `Deleted property unit: ${prop?.unit_number}`);
      if (supabase) {
        try {
          await supabase.from('properties').delete().eq('id', id);
        } catch (e) { console.error(e); }
      }
    }
  };

  const resetCompleteSystem = async () => {
    setClients([]);
    setPayments([]);
    setExpenses([]);
    setLogs([]);
    const defaultProperties = [
      { id: 'p1', unit_number: 'A101', floor: 1, type: '2BHK', rent: 15000, deposit: 50000, status: 'Vacant' },
      { id: 'p2', unit_number: 'A102', floor: 1, type: '1BHK', rent: 10000, deposit: 30000, status: 'Vacant' },
      { id: 'p3', unit_number: 'B201', floor: 2, type: '3BHK', rent: 20000, deposit: 60000, status: 'Vacant' },
      { id: 'p4', unit_number: 'B202', floor: 2, type: '2BHK', rent: 15000, deposit: 50000, status: 'Vacant' },
      { id: 'p5', unit_number: 'C301', floor: 3, type: '2BHK', rent: 14000, deposit: 45000, status: 'Vacant' }
    ];
    setProperties(defaultProperties);
    const defaultUsers = [
      { id: '1', username: 'Admin', role: 'Admin', password: 'admin' },
      { id: '2', username: 'anuvgr', role: 'Admin', password: 'AnU#Kozhi$2021' }
    ];
    setUsers(defaultUsers);
    localStorage.removeItem('rental_clients');
    localStorage.removeItem('rental_payments');
    localStorage.removeItem('rental_expenses');
    localStorage.removeItem('rental_logs');
    localStorage.setItem('rental_properties', JSON.stringify(defaultProperties));
    localStorage.setItem('rental_users', JSON.stringify(defaultUsers));
    
    if (supabase) {
      try {
        await Promise.all([
          supabase.from('clients').delete().neq('id', '0'),
          supabase.from('payments').delete().neq('id', '0'),
          supabase.from('expenses').delete().neq('id', '0'),
          supabase.from('logs').delete().neq('id', '0'),
          supabase.from('users').delete().neq('id', '0'),
          supabase.from('properties').delete().neq('id', '0')
        ]);
        await Promise.all([
          supabase.from('users').insert(defaultUsers),
          supabase.from('properties').insert(defaultProperties)
        ]);
      } catch (e) { console.error(e); }
    }
    alert("System completely reset successfully! Logging out.");
    logout();
  };

  return (
    <AppContext.Provider value={{ 
      clients, payments, expenses, users, currentUser, logs, properties,
      isSyncing, lastSync, syncData,
      addClient, updateClient, toggleClientStatus, deleteClient,
      addPayment, addExpense, addUser, removeUser,
      login, logout, clearLogs,
      resetFormerTenants, resetAllPayments, resetAllExpenses, resetAllClients, resetCompleteSystem,
      addProperty, updateProperty, deleteProperty
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);

