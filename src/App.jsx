import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, BarChart3, Home, TrendingDown, UserX, ChevronDown, ChevronRight, FileBarChart, Calendar, AlertCircle, Wallet, PieChart, User, List, Settings as SettingsIcon, LogOut, RefreshCw, Sun, Moon, Building, History } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Payments from './pages/Payments';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
import Rent from './pages/Rent';
import FormerTenants from './pages/FormerTenants';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Properties from './pages/Properties';

const SidebarItem = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link 
      to={to} 
      className={`sidebar-item ${isActive ? 'active' : ''}`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </Link>
  );
};

const AppContent = () => {
  const [reportsOpen, setReportsOpen] = useState(false);
  const { currentUser, logout, isSyncing, lastSync, syncData } = useApp();
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('rental_theme') || 'dark';
  });
  
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('rental_theme', theme);
  }, [theme]);

  React.useEffect(() => {
    if (location.pathname === '/reports') {
      setReportsOpen(true);
    }
  }, [location.pathname]);

  const reportSubItems = [
    { label: 'Financial Summary', tab: 'summary',    icon: FileBarChart },
    { label: 'Advance Deposits',  tab: 'advance',    icon: Wallet },
    { label: 'Expense Report',    tab: 'expenses',   icon: PieChart },
    { label: 'Property Wise',     tab: 'properties', icon: Building },
    { label: 'Property History',  tab: 'history',    icon: History },
    { label: 'Tenant Reports',    tab: 'tenants',    icon: Users },
    { label: 'Tenant Wise',       tab: 'individual', icon: User },
  ];

  if (!currentUser) {
    return <Login />;
  }

  return (
      <div className="app-container">
        <aside className="sidebar glass-card">
            <div className="logo">
              <Home size={32} className="logo-icon" />
              <h2>Kolluvelil</h2>
            </div>
            <nav>
              <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" />
              <SidebarItem to="/clients" icon={Users} label="Clients" />
              <SidebarItem to="/properties" icon={Building} label="Properties" />
              <SidebarItem to="/payments" icon={CreditCard} label="Payments" />
              <SidebarItem to="/rent" icon={Calendar} label="Rent" />
              <SidebarItem to="/expenses" icon={TrendingDown} label="Expenses" />

              {/* Expandable Reports */}
              <div className="sidebar-group">
                <button
                  className={`sidebar-item sidebar-group-toggle ${reportsOpen ? 'group-open' : ''}`}
                  onClick={() => setReportsOpen(r => !r)}
                >
                  <BarChart3 size={20} />
                  <span>Reports</span>
                  {reportsOpen ? <ChevronDown size={16} className="chevron" /> : <ChevronRight size={16} className="chevron" />}
                </button>

                {reportsOpen && (
                  <div className="sub-items">
                    {reportSubItems.map(({ label, tab, icon: Icon }) => {
                      const isActive = location.pathname === '/reports' && searchParams.get('tab') === tab;
                      return (
                        <Link
                          key={tab}
                          to={`/reports?tab=${tab}`}
                          className={`sidebar-sub-item ${isActive ? 'active' : ''}`}
                        >
                          <Icon size={15} />
                          <span>{label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              <SidebarItem to="/former-tenants" icon={UserX} label="Former Tenants" />
              <SidebarItem to="/settings" icon={SettingsIcon} label="Settings" />
            </nav>
          </aside>
          
          <main className="main-content">
            <header className="top-bar glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h1>Rental Management System</h1>
                <button 
                  onClick={() => syncData(true)} 
                  className={`icon-btn ${isSyncing ? 'spin' : ''}`} 
                  title={lastSync ? `Last synced: ${new Date(lastSync).toLocaleTimeString()}` : 'Click to Sync'}
                  style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', border: '1px solid rgba(99,102,241,0.2)' }}
                >
                  <RefreshCw size={16} className={isSyncing ? 'spin' : ''} />
                </button>
                <button 
                  onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
                  className="icon-btn" 
                  title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', border: '1px solid rgba(99,102,241,0.2)' }}
                >
                  {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                </button>
              </div>
              <div className="user-profile">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginRight: '4px' }}>
                  <span style={{ fontWeight: '600' }}>{currentUser.username}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{currentUser.role}</span>
                </div>
                <div className="avatar">
                  <User size={20} color="white" />
                </div>
                <button onClick={logout} className="icon-btn text-error" title="Logout" style={{ marginLeft: '10px' }}>
                  <LogOut size={20} />
                </button>
              </div>
            </header>
            
            <div className="page-content">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/properties" element={<Properties />} />
                <Route path="/payments" element={<Payments />} />
                <Route path="/rent" element={<Rent />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/former-tenants" element={<FormerTenants />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </div>
          </main>
        </div>


  );
}

function App() {
  return (
    <Router>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </Router>
  );
}

export default App;
