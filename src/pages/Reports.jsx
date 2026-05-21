import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FileBarChart, Download, Calendar, Filter, PieChart, TrendingUp, TrendingDown, Users, AlertCircle, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';

const Reports = () => {
  const { clients = [], payments = [], expenses = [], properties = [] } = useApp();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'summary');
  const [selectedTenantId, setSelectedTenantId] = useState('');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const totalRevenue = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  const totalDeposits = clients.reduce((sum, c) => sum + parseFloat(c.deposit || 0), 0);
  const netProfit = totalRevenue - totalExpenses;

  const renderIndividualReport = () => {
    const selectedClient = clients.find(c => c.id === selectedTenantId);
    const clientPayments = payments.filter(p => p.clientId === selectedTenantId);
    const totalPaid = clientPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

    return (
      <div className="individual-report animate-in">
        <div className="glass-card mb-20">
          <div className="flex-row gap-20 align-center">
            <label style={{ whiteSpace: 'nowrap' }}>Select Tenant:</label>
            <select 
              className="report-select"
              value={selectedTenantId} 
              onChange={(e) => setSelectedTenantId(e.target.value)}
            >
              <option value="">-- Choose a Tenant --</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.status || 'Active'})</option>
              ))}
            </select>
          </div>
        </div>

        {selectedClient ? (
          <div className="tenant-ledger">
            <div className="glass-card compact-stats-bar mb-20">
              <div className="stat-item">
                <span className="label">Monthly Rent</span>
                <span className="value">₹{selectedClient.rentAmount}</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="label">Total Paid to Date</span>
                <span className="value text-success">₹{totalPaid.toLocaleString()}</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="label">Security Deposit</span>
                <span className="value">₹{selectedClient.deposit}</span>
              </div>
            </div>

            <div className="glass-card">
              <div className="flex-row justify-between mb-20">
                <h3>Payment Ledger: {selectedClient.name}</h3>
                <button className="btn-small" onClick={() => window.print()}><Download size={16} /> Export Statement</button>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Receipt #</th>
                      <th>For Period</th>
                      <th>Method</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientPayments.sort((a, b) => new Date(b.date) - new Date(a.date)).map(p => (
                      <tr key={p.id}>
                        <td>{new Date(p.date).toLocaleDateString('en-GB').replace(/\//g, '-')}</td>
                        <td>#RCP-{p.id.slice(-6)}</td>
                        <td>{p.month} {p.year}</td>
                        <td>{p.paymentMethod}</td>
                        <td className="text-success"><strong>₹{p.amount}</strong></td>
                      </tr>
                    ))}
                    {clientPayments.length === 0 && (
                      <tr><td colSpan="5" style={{textAlign: 'center', padding: '30px'}}>No payments recorded for this tenant.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card empty-state" style={{ padding: '60px', textAlign: 'center' }}>
            <Users size={48} className="text-muted mb-10" style={{ margin: '0 auto' }} />
            <p className="text-muted">Please select a tenant from the dropdown above to view their financial statement.</p>
          </div>
        )}
      </div>
    );
  };

  // Monthly breakdown
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const currentYear = new Date().getFullYear();

  const monthlyRentReport = payments.reduce((acc, p) => {
    const key = `${p.month} ${p.year}`;
    acc[key] = (acc[key] || 0) + parseFloat(p.amount);
    return acc;
  }, {});

  // Pending Rent Report (Simulated logic: Tenants who don't have a payment record for the current month)
  const pendingTenants = clients.filter(client => {
    const hasPaid = payments.some(p => p.clientId === client.id && p.month === currentMonth && p.year === currentYear);
    return !hasPaid;
  });

  const renderPropertyReport = () => {
    const totalUnits = properties.length;
    const occupiedUnits = properties.filter(p => p.status === 'Occupied').length;
    const vacantUnits = totalUnits - occupiedUnits;
    const occupancyRate = totalUnits ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

    return (
      <div className="property-reports animate-in">
        <div className="compact-stats-bar glass-card mb-20 animate-in">
          <div className="stat-item">
            <span className="label">Total Units</span>
            <span className="value">{totalUnits}</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="label">Occupied Units</span>
            <span className="value text-success">{occupiedUnits}</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="label">Vacant Units</span>
            <span className="value text-warning">{vacantUnits}</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="label">Occupancy Rate</span>
            <span className="value" style={{ color: '#818cf8' }}>{occupancyRate}%</span>
          </div>
        </div>

        <div className="glass-card mt-20 animate-in">
          <div className="flex-row justify-between mb-20 align-center">
            <h3>Property Wise Financial Performance</h3>
            <span className="badge badge-success">Unit Breakdown</span>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Unit Number</th>
                  <th>Floor</th>
                  <th>BHK Type</th>
                  <th>Standard Rent</th>
                  <th>Current Status</th>
                  <th>Current Tenant</th>
                  <th>Total Revenue</th>
                  <th>Total Expenses</th>
                  <th>Net Earnings</th>
                </tr>
              </thead>
              <tbody>
                {properties.map(property => {
                  const propertyClients = clients.filter(c => c.propertyUnit === property.unit_number);
                  const clientIds = propertyClients.map(c => c.id);
                  const activeTenant = propertyClients.find(c => (c.status || 'Active') === 'Active');
                  
                  const totalCollected = payments
                    .filter(p => clientIds.includes(p.clientId))
                    .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
                    
                  const totalIncurredExpenses = expenses
                    .filter(e => e.tenantId && clientIds.includes(e.tenantId))
                    .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
                    
                  const netReturn = totalCollected - totalIncurredExpenses;

                  return (
                    <tr key={property.id}>
                      <td><strong>{property.unit_number}</strong></td>
                      <td>Floor {property.floor}</td>
                      <td>
                        <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', border: '1px solid var(--glass-border)' }}>
                          {property.type}
                        </span>
                      </td>
                      <td>₹{parseFloat(property.rent || 0).toLocaleString()}</td>
                      <td>
                        <span className={`badge ${property.status === 'Occupied' ? 'badge-success' : 'badge-warning'}`}>
                          {property.status || 'Vacant'}
                        </span>
                      </td>
                      <td>
                        {activeTenant ? (
                          <span style={{ fontWeight: '500' }}>{activeTenant.name}</span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="text-success"><strong>₹{totalCollected.toLocaleString()}</strong></td>
                      <td className="text-error">₹{totalIncurredExpenses.toLocaleString()}</td>
                      <td>
                        <strong className={netReturn >= 0 ? 'text-success' : 'text-error'}>
                          ₹{netReturn.toLocaleString()}
                        </strong>
                      </td>
                    </tr>
                  );
                })}
                {properties.length === 0 && (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                      No properties registered in the system.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderSummary = () => (
    <div className="report-section animate-in">
      <div className="grid-2">
        <div className="glass-card p-loss-card">
          <h3>Profit & Loss Summary</h3>
          <div className="pl-grid mt-20">
            <div className="pl-item">
              <span>Total Revenue</span>
              <h2 className="text-success">₹{totalRevenue.toLocaleString()}</h2>
            </div>
            <div className="pl-item">
              <span>Total Expenses</span>
              <h2 className="text-error">₹{totalExpenses.toLocaleString()}</h2>
            </div>
            <div className="pl-divider"></div>
            <div className="pl-item">
              <span>Net Profit</span>
              <h2 className={netProfit >= 0 ? "text-success" : "text-error"}>₹{netProfit.toLocaleString()}</h2>
            </div>
          </div>
        </div>

        <div className="glass-card">
          <h3>Cash Flow Overview</h3>
          <div className="cashflow-stats mt-20">
            <div className="cf-item">
              <label>Opening Deposits</label>
              <p>₹{totalDeposits.toLocaleString()}</p>
            </div>
            <div className="cf-item">
              <label>Operational Cash</label>
              <p>₹{totalRevenue.toLocaleString()}</p>
            </div>
            <div className="cf-item highlight">
              <label>Total Assets (Cash + Deposit)</label>
              <h2>₹{(totalRevenue + totalDeposits).toLocaleString()}</h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMonthlyReport = () => (
    <div className="glass-card mt-20 animate-in">
      <h3>Monthly Rent Collection Report</h3>
      <div className="table-container mt-20">
        <table>
          <thead>
            <tr>
              <th>Month/Year</th>
              <th>Collection Target</th>
              <th>Actual Collected</th>
              <th>Variance</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(monthlyRentReport).map(([key, val]) => (
              <tr key={key}>
                <td><strong>{key}</strong></td>
                <td>₹{clients.reduce((sum, c) => sum + parseFloat(c.rentAmount || 0), 0).toLocaleString()}</td>
                <td className="text-success">₹{val.toLocaleString()}</td>
                <td><span className="badge badge-success">On Track</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPendingReport = () => (
    <div className="glass-card mt-20 animate-in">
      <div className="flex-row justify-between mb-20">
        <h3>Pending Rent Report - {currentMonth} {currentYear}</h3>
        <span className="badge badge-error">{pendingTenants.length} Pending</span>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Tenant Name</th>
              <th>Contact</th>
              <th>Monthly Rent</th>
              <th>Last Paid</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingTenants.map(client => (
              <tr key={client.id}>
                <td>{client.name}</td>
                <td>{client.phone}</td>
                <td>₹{client.rentAmount}</td>
                <td className="text-muted">No record this month</td>
                <td>
                  <button 
                    className="btn-small btn-whatsapp"
                    onClick={() => {
                      const message = `*RENT REMINDER - KOLLUVELIL RENTALS*%0A%0A` +
                        `Hello *${client.name}*,%0A` +
                        `This is a friendly reminder that the rent of *₹${client.rentAmount}* for *${currentMonth} ${currentYear}* is pending.%0A%0A` +
                        `Kindly process the payment at your earliest convenience. If you have already paid, please ignore this message.%0A%0A` +
                        `Thank you!`;
                      const whatsappUrl = `https://wa.me/${client.phone.replace(/\D/g, '')}?text=${message}`;
                      window.open(whatsappUrl, '_blank');
                    }}
                  >
                    <MessageCircle size={14} /> Send Reminder
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAdvanceReport = () => (
    <div className="glass-card mt-20 animate-in">
      <h3>Advance Deposit Report</h3>
      <div className="table-container mt-20">
        <table>
          <thead>
            <tr>
              <th>Tenant Name</th>
              <th>Agreement Date</th>
              <th>Deposit Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {clients.map(client => (
              <tr key={client.id}>
                <td>{client.name}</td>
                <td>{client.agreementDate}</td>
                <td><strong>₹{client.deposit}</strong></td>
                <td><span className="badge badge-success">Held in Escrow</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderExpenseReport = () => {
    const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
      <div className="glass-card mt-20 animate-in">
        <h3>Expense Breakdown Report</h3>
        <div className="grid-2 mt-20">
          <div className="chart-visual">
            {Object.entries(expenses.reduce((acc, e) => {
              acc[e.category] = (acc[e.category] || 0) + parseFloat(e.amount);
              return acc;
            }, {})).map(([cat, amt]) => (
              <div key={cat} className="cat-bar">
                <label>{cat}</label>
                <div className="bar-bg"><div className="bar-fill" style={{ width: `${(amt/totalExpenses)*100}%` }}></div></div>
                <span>₹{amt}</span>
              </div>
            ))}
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Total</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody>
                {['Maintenance', 'Utility Bills', 'Taxes', 'Cleaning', 'Other'].map(cat => {
                  const amt = expenses.filter(e => e.category === cat).reduce((s, e) => s + parseFloat(e.amount), 0);
                  if (amt === 0) return null;
                  return (
                    <tr key={cat}>
                      <td>{cat}</td>
                      <td>₹{amt}</td>
                      <td>{totalExpenses ? ((amt/totalExpenses)*100).toFixed(1) : 0}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Full Expense History */}
        <div style={{ marginTop: '30px', borderTop: '1px solid var(--glass-border)', paddingTop: '24px' }}>
          <div className="flex-row justify-between mb-20">
            <h3>Expense History</h3>
            <span className="badge badge-error">{expenses.length} Records · ₹{totalExpenses.toLocaleString()} Total</span>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Title</th>
                  <th>Linked Tenant</th>
                  <th>Category</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {sortedExpenses.length > 0 ? sortedExpenses.map(exp => (
                  <tr key={exp.id}>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {new Date(exp.date).toLocaleDateString('en-GB').replace(/\//g, '-')}
                    </td>
                    <td><strong>{exp.title}</strong></td>
                    <td>
                      {exp.tenantId
                        ? <span className="badge badge-warning" style={{ textTransform: 'none', fontSize: '0.8rem' }}>
                            {clients.find(c => c.id === exp.tenantId)?.name || 'Former Tenant'}
                          </span>
                        : <span style={{ color: 'var(--text-muted)' }}>—</span>
                      }
                    </td>
                    <td><span className="badge badge-error">{exp.category}</span></td>
                    <td><strong style={{ color: '#f87171' }}>₹{exp.amount}</strong></td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                      No expenses recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderTenantReports = () => {
    const activeClients = clients.filter(c => (c.status || 'Active') === 'Active');
    const vacatedClients = clients.filter(c => c.status === 'Vacated');
    
    // Simulating expiry: show tenants whose agreement was signed > 10 months ago
    const expiringSoon = activeClients.filter(c => {
      const agDate = new Date(c.agreementDate);
      const today = new Date();
      const diffMonths = (today.getFullYear() - agDate.getFullYear()) * 12 + (today.getMonth() - agDate.getMonth());
      return diffMonths >= 10;
    });

    return (
      <div className="tenant-reports animate-in">
        <div className="grid-2">
          <div className="glass-card">
            <div className="flex-row justify-between">
              <h3>Active Tenants</h3>
              <span className="badge badge-success">{activeClients.length}</span>
            </div>
            <div className="table-container mt-10">
              <table>
                <thead>
                  <tr><th>Name</th><th>Contact</th><th>Joined</th></tr>
                </thead>
                <tbody>
                  {activeClients.map(c => <tr key={c.id}><td>{c.name}</td><td>{c.phone}</td><td>{c.agreementDate}</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass-card">
            <div className="flex-row justify-between">
              <h3>Vacated Tenants</h3>
              <span className="badge badge-error">{vacatedClients.length}</span>
            </div>
            <div className="table-container mt-10">
              <table>
                <thead>
                  <tr><th>Name</th><th>Phone</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {vacatedClients.map(c => <tr key={c.id}><td>{c.name}</td><td>{c.phone}</td><td><span className="badge badge-error">Vacated</span></td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="glass-card mt-20">
          <div className="flex-row justify-between">
            <h3>Agreement Expiry Alerts (Expiring or Expired)</h3>
            <span className="badge badge-warning">{expiringSoon.length} Alerts</span>
          </div>
          <div className="table-container mt-10">
            <table>
              <thead>
                <tr><th>Tenant</th><th>Agreement Date</th><th>Term Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {expiringSoon.map(c => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{c.agreementDate}</td>
                    <td><span className="badge badge-warning">Expiry Imminent (11 Months)</span></td>
                    <td><button className="btn-small">Renew</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderFormerTenants = () => {
    const vacatedClients = clients.filter(c => c.status === 'Vacated');
    return (
      <div className="former-tenants animate-in">
        <div className="flex-row justify-between mb-20">
          <h3>Former Tenants</h3>
          <span className="badge badge-error">{vacatedClients.length} Vacated</span>
        </div>
        {vacatedClients.length === 0 ? (
          <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
            <Users size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 12px', display: 'block' }} />
            <p className="text-muted">No vacated tenants recorded yet.</p>
          </div>
        ) : (
          <div className="former-grid">
            {vacatedClients.map(c => {
              const cPayments = payments.filter(p => p.clientId === c.id);
              const totalPaid = cPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
              const lastPayment = [...cPayments].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
              return (
                <div key={c.id} className="former-card glass-card">
                  <div className="former-header">
                    <div className="former-photo">
                      {c.photo ? <img src={c.photo} alt={c.name} /> : <div className="photo-icon"><Users size={36} /></div>}
                    </div>
                    <div className="former-name">
                      <h3>{c.name}</h3>
                      <span className="badge badge-error">Vacated</span>
                    </div>
                  </div>
                  <div className="former-stats">
                    <div className="fstat"><span>Monthly Rent</span><strong>&#8377;{c.rentAmount}</strong></div>
                    <div className="fstat-div"></div>
                    <div className="fstat"><span>Total Paid</span><strong className="text-success">&#8377;{totalPaid.toLocaleString()}</strong></div>
                    <div className="fstat-div"></div>
                    <div className="fstat"><span>Deposit Held</span><strong>&#8377;{c.deposit}</strong></div>
                  </div>
                  <div className="former-details">
                    <div className="fd-row"><label>Phone</label><p>{c.phone}</p></div>
                    <div className="fd-row"><label>Email</label><p>{c.email || 'N/A'}</p></div>
                    <div className="fd-row"><label>Address</label><p>{c.address || 'N/A'}</p></div>
                    <div className="fd-row"><label>ID Type</label><p>{c.idType}</p></div>
                    <div className="fd-row"><label>Agreement Date</label><p>{c.agreementDate}</p></div>
                    <div className="fd-row"><label>Last Payment</label><p>{lastPayment ? `${lastPayment.month} ${lastPayment.year}` : 'No records'}</p></div>
                    <div className="fd-row"><label>Total Transactions</label><p>{cPayments.length} payments</p></div>
                  </div>
                  {c.idCard && (
                    <div className="former-id">
                      <label>ID Card</label>
                      <img src={c.idCard} alt="ID Card" />
                    </div>
                  )}
                  {c.documents && c.documents.length > 0 && (
                    <div className="former-docs">
                      <label>Documents</label>
                      <div className="doc-tags">
                        {c.documents.map((d, i) => <span key={i} className="doc-tag">{typeof d === 'string' ? d : d.name}</span>)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="reports-page">
      <div className="report-tabs glass-card">
        <button className={activeTab === 'summary'    ? 'active' : ''} onClick={() => setActiveTab('summary')}>Financial Summary</button>
        <button className={activeTab === 'monthly'    ? 'active' : ''} onClick={() => setActiveTab('monthly')}>Monthly Rent</button>
        <button className={activeTab === 'pending'    ? 'active' : ''} onClick={() => setActiveTab('pending')}>Pending Rent</button>
        <button className={activeTab === 'advance'    ? 'active' : ''} onClick={() => setActiveTab('advance')}>Advance Deposits</button>
        <button className={activeTab === 'expenses'   ? 'active' : ''} onClick={() => setActiveTab('expenses')}>Expense Report</button>
        <button className={activeTab === 'properties' ? 'active' : ''} onClick={() => setActiveTab('properties')}>Property Wise</button>
        <button className={activeTab === 'tenants'    ? 'active' : ''} onClick={() => setActiveTab('tenants')}>Tenant Reports</button>
        <button className={activeTab === 'individual' ? 'active' : ''} onClick={() => setActiveTab('individual')}>Tenant Wise</button>
      </div>

      <div className="tab-content mt-20">
        {activeTab === 'summary' && renderSummary()}
        {activeTab === 'monthly' && renderMonthlyReport()}
        {activeTab === 'pending' && renderPendingReport()}
        {activeTab === 'advance' && renderAdvanceReport()}
        {activeTab === 'expenses' && renderExpenseReport()}
        {activeTab === 'properties' && renderPropertyReport()}
        {activeTab === 'tenants' && renderTenantReports()}
        {activeTab === 'individual' && renderIndividualReport()}
        {activeTab === 'former' && renderFormerTenants()}
      </div>

      <style>{`
        .btn-whatsapp {
          background: #25d366 !important;
          color: white !important;
          border: none !important;
          box-shadow: 0 4px 14px rgba(37, 211, 102, 0.3);
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .btn-whatsapp:hover {
          background: #128c7e !important;
          transform: translateY(-2px);
        }

        .report-tabs { display: flex; gap: 10px; padding: 10px; overflow-x: auto; margin-bottom: 20px; }
        .report-tabs button { 
          background: transparent; color: var(--text-muted); padding: 10px 20px; white-space: nowrap; 
          border-radius: 10px; font-size: 0.9rem; transition: 0.3s;
        }
        .report-tabs button:hover { background: rgba(255,255,255,0.05); color: var(--text-main); }
        .report-tabs button.active { background: var(--primary); color: white; }

        .report-select {
          background: var(--bg-dark);
          border: 1px solid var(--glass-border);
          color: var(--text-main);
          padding: 8px 16px;
          border-radius: 8px;
          outline: none;
          min-width: 200px;
        }

        .align-center { align-items: center; }
        .gap-20 { gap: 20px; }

        .compact-stats-bar { 
          display: flex; 
          justify-content: space-around; 
          align-items: center; 
          padding: 15px; 
          background: rgba(255,255,255,0.03);
        }
        .stat-item { display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .stat-item .label { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; }
        .stat-item .value { font-size: 1.2rem; font-weight: 700; }
        .stat-divider { width: 1px; height: 30px; background: var(--glass-border); }

        .mini-stat { text-align: center; padding: 20px; }
        .mini-stat label { font-size: 0.8rem; color: var(--text-muted); margin-bottom: 5px; display: block; }
        .mini-stat h3 { font-size: 1.5rem; }

        .pl-grid { display: flex; flex-direction: column; gap: 15px; }
        .pl-item { display: flex; justify-content: space-between; align-items: center; }
        .pl-divider { height: 1px; background: var(--glass-border); margin: 5px 0; }
        
        .text-success { color: #10b981; }
        .text-error { color: #ef4444; }
        
        .cf-item { display: flex; justify-content: space-between; margin-bottom: 15px; }
        .cf-item.highlight { margin-top: 20px; padding-top: 20px; border-top: 2px dashed var(--glass-border); }

        .cat-bar { margin-bottom: 15px; }
        .cat-bar label { font-size: 0.8rem; margin-bottom: 5px; display: block; }
        .bar-bg { height: 8px; background: var(--glass); border-radius: 4px; overflow: hidden; margin-bottom: 5px; }
        .bar-fill { height: 100%; background: var(--primary); border-radius: 4px; }
        
        .animate-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        /* Former Tenants */
        .former-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 24px; }
        .former-card { padding: 24px; display: flex; flex-direction: column; gap: 16px; }

        .former-header { display: flex; align-items: center; gap: 16px; }
        .former-photo { width: 70px; height: 70px; border-radius: 14px; overflow: hidden; background: var(--glass); border: 2px solid var(--glass-border); flex-shrink: 0; }
        .former-photo img { width: 100%; height: 100%; object-fit: cover; }
        .photo-icon { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: var(--text-muted); }
        .former-name h3 { margin-bottom: 6px; }

        .former-stats { display: flex; justify-content: space-around; align-items: center; background: rgba(255,255,255,0.03); border-radius: 12px; padding: 12px; }
        .fstat { display: flex; flex-direction: column; align-items: center; gap: 3px; }
        .fstat span { font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
        .fstat strong { font-size: 1rem; }
        .fstat-div { width: 1px; height: 28px; background: var(--glass-border); }

        .former-details { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; border-top: 1px solid var(--glass-border); padding-top: 14px; }
        .fd-row label { font-size: 0.72rem; color: var(--text-muted); display: block; margin-bottom: 2px; text-transform: uppercase; letter-spacing: 0.5px; }
        .fd-row p { font-size: 0.9rem; font-weight: 500; }

        .former-id { border-top: 1px solid var(--glass-border); padding-top: 14px; }
        .former-id label, .former-docs label { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; display: block; margin-bottom: 8px; letter-spacing: 0.5px; }
        .former-id img { width: 100%; border-radius: 10px; max-height: 160px; object-fit: cover; }

        .former-docs { border-top: 1px solid var(--glass-border); padding-top: 14px; }

        @media (max-width: 600px) {
          .former-details { grid-template-columns: 1fr; }
          .former-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default Reports;
