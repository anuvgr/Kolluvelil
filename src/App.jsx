import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, BarChart3, Home, TrendingDown, UserX, ChevronDown, ChevronRight, FileBarChart, Calendar, AlertCircle, Wallet, PieChart, User, List, Settings as SettingsIcon, LogOut, RefreshCw, Sun, Moon, Building, History } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Payments from './pages/Payments';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
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
    { label: 'Monthly Rent',      tab: 'monthly',    icon: Calendar },
    { label: 'Pending Rent',      tab: 'pending',    icon: AlertCircle },
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
    <Router>
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
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/former-tenants" element={<FormerTenants />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </div>
          </main>
        </div>

        <style>{`
          .app-container {
            display: flex;
            min-height: 100vh;
            padding: 20px;
            gap: 20px;
          }

          .sidebar {
            width: 280px;
            height: calc(100vh - 40px);
            position: sticky;
            top: 20px;
            display: flex;
            flex-direction: column;
            padding: 30px 20px;
          }

          .logo {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 40px;
            padding-left: 10px;
          }

          .logo-icon {
            color: var(--primary);
          }

          nav {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .sidebar-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px 16px;
            text-decoration: none;
            color: var(--text-muted);
            border-radius: 12px;
            transition: all 0.3s;
            font-weight: 500;
          }

          .sidebar-item:hover {
            background: var(--glass);
            color: var(--text-main);
          }

          .sidebar-item.active {
            background: linear-gradient(135deg, var(--primary), var(--accent));
            color: white;
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
          }

          .main-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 20px;
          }

          .top-bar {
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 30px;
          }

          .user-profile {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .avatar {
            width: 40px;
            height: 40px;
            background: linear-gradient(45deg, var(--primary), var(--secondary));
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .page-content {
            flex: 1;
          }

          .sidebar-group { display: flex; flex-direction: column; }
          .sidebar-group-toggle {
            width: 100%;
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px 16px;
            text-decoration: none;
            color: var(--text-muted);
            border-radius: 12px;
            transition: all 0.3s;
            font-weight: 500;
            background: transparent;
            cursor: pointer;
            text-align: left;
          }
          .sidebar-group-toggle:hover { background: var(--glass); color: var(--text-main); }
          .sidebar-group-toggle.group-open { color: var(--text-main); background: var(--glass); }
          .sidebar-group-toggle .chevron { margin-left: auto; }

          .sub-items {
            display: flex;
            flex-direction: column;
            gap: 2px;
            margin-left: 16px;
            padding-left: 12px;
            border-left: 2px solid rgba(99,102,241,0.3);
            margin-bottom: 4px;
          }
          .sidebar-sub-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 9px 12px;
            text-decoration: none;
            color: var(--text-muted);
            border-radius: 8px;
            transition: all 0.2s;
            font-size: 0.88rem;
            font-weight: 500;
          }
          .sidebar-sub-item:hover { background: var(--glass); color: var(--text-main); }
          .sidebar-sub-item.active { background: rgba(99,102,241,0.15); color: var(--primary); }

          @media (max-width: 1024px) {
            .sidebar { width: 80px; padding: 20px 10px; }
            .sidebar span, .logo h2 { display: none; }
            .logo { justify-content: center; padding: 0; }
            .sub-items { display: none; } /* hide sub-items on medium screens */
          }

          @media (max-width: 768px) {
            .app-container { flex-direction: column; padding: 10px; gap: 10px; padding-bottom: 90px; }
            .sidebar { 
              position: fixed; bottom: 0; left: 0; width: 100%; height: 75px; 
              flex-direction: row; padding: 0; border-radius: 0; 
              border-top: 1px solid var(--glass-border); z-index: 1000; 
              background: var(--sidebar-bg-mobile); backdrop-filter: blur(20px);
            }
            .logo { display: none; }
            nav { flex-direction: row; width: 100%; overflow-x: auto; align-items: center; gap: 10px; padding: 0 10px; }
            nav::-webkit-scrollbar { display: none; }
            .sidebar-item { 
              flex-direction: column; padding: 8px; gap: 4px; border-radius: 8px; 
              min-width: 70px; justify-content: center; flex-shrink: 0;
            }
            .sidebar-item span { display: block !important; font-size: 0.65rem; text-align: center; }
            .sidebar-group-toggle span { display: none !important; }
            .sidebar-group-toggle .chevron { display: none; }
            .sidebar-group { flex-shrink: 0; }
            .sub-items {
              position: absolute; bottom: 80px; left: 0; background: var(--bg-card); 
              backdrop-filter: blur(12px); border: 1px solid var(--glass-border);
              padding: 10px; border-radius: 12px; display: flex; flex-direction: column;
            }
            .top-bar { height: 60px; padding: 0 15px; }
            .top-bar h1 { font-size: 1.1rem; }
            .user-profile span { display: none; }
          }
        `}</style>
      </Router>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
