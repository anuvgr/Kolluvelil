import React from 'react';
import { useApp } from '../context/AppContext';
import { Users, FileText, RotateCcw } from 'lucide-react';

const FormerTenants = () => {
  const { clients, payments, toggleClientStatus } = useApp();
  const vacatedClients = clients.filter(c => c.status === 'Vacated');

  const handleRestore = (client) => {
    if (window.confirm(`Restore ${client.name} as an Active Tenant?`)) {
      toggleClientStatus(client.id, 'Active');
    }
  };

  return (
    <div className="former-page">
      <div className="page-heading mb-20">
        <h2>Former Tenants</h2>
        <span className="badge badge-error">{vacatedClients.length} Vacated</span>
      </div>

      {vacatedClients.length === 0 ? (
        <div className="glass-card" style={{ padding: '80px', textAlign: 'center' }}>
          <Users size={56} style={{ color: 'var(--text-muted)', margin: '0 auto 16px', display: 'block' }} />
          <h3 style={{ marginBottom: '8px' }}>No Former Tenants</h3>
          <p className="text-muted">Tenants marked as Vacated will appear here with their full records.</p>
        </div>
      ) : (
        <div className="former-grid">
          {vacatedClients.map((c, index) => {
            const cPayments = payments.filter(p => p.clientId === c.id);
            const totalPaid = cPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
            const lastPayment = [...cPayments].sort((a, b) => new Date(b.date) - new Date(a.date))[0];

            return (
              <div key={c.id} className="former-card glass-card">
                {/* Header */}
                <div className="former-header">
                  <span className="serial-badge">{index + 1}</span>
                  <div className="former-photo">
                    {c.photo
                      ? <img src={c.photo} alt={c.name} />
                      : <div className="photo-icon"><Users size={36} /></div>
                    }
                  </div>
                  <div className="former-name">
                    <h3>{c.name}</h3>
                    <span className="badge badge-error">Vacated</span>
                  </div>
                </div>

                {/* Financial Stats Bar */}
                <div className="former-stats">
                  <div className="fstat">
                    <span>Monthly Rent</span>
                    <strong>₹{c.rentAmount}</strong>
                  </div>
                  <div className="fstat-div"></div>
                  <div className="fstat">
                    <span>Total Paid</span>
                    <strong className="text-success">₹{totalPaid.toLocaleString()}</strong>
                  </div>
                  <div className="fstat-div"></div>
                  <div className="fstat">
                    <span>Deposit Held</span>
                    <strong>₹{c.deposit}</strong>
                  </div>
                </div>

                {/* Contact & Details Grid */}
                <div className="former-details">
                  <div className="fd-row"><label>Phone</label><p>{c.phone}</p></div>
                  <div className="fd-row"><label>Email</label><p>{c.email || 'N/A'}</p></div>
                  <div className="fd-row"><label>Address</label><p>{c.address || 'N/A'}</p></div>
                  <div className="fd-row"><label>ID Type</label><p>{c.idType}</p></div>
                  <div className="fd-row"><label>Agreement Date</label><p>{c.agreementDate}</p></div>
                  <div className="fd-row"><label>Vacated On</label><p>{c.vacateDate ? new Date(c.vacateDate).toLocaleDateString('en-GB').replace(/\//g, '-') : 'N/A'}</p></div>
                  <div className="fd-row"><label>Last Payment</label><p>{lastPayment ? `${lastPayment.month} ${lastPayment.year}` : 'No records'}</p></div>
                  <div className="fd-row"><label>Total Transactions</label><p>{cPayments.length} payments</p></div>
                </div>

                {/* ID Card Image */}
                {c.idCard && (
                  <div className="former-id">
                    <label>ID Card</label>
                    <img src={c.idCard} alt="ID Card" />
                  </div>
                )}

                {/* Documents */}
                {c.documents && c.documents.length > 0 && (
                  <div className="former-docs">
                    <label>Documents</label>
                    <div className="doc-tags">
                      {c.documents.map((d, i) => (
                        <span key={i} className="doc-tag">
                          <FileText size={12} style={{ display: 'inline', marginRight: '4px' }} />{d}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Payment History */}
                {cPayments.length > 0 && (
                  <div className="former-payments">
                    <label>Payment History</label>
                    <div className="table-container">
                      <table>
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Period</th>
                            <th>Method</th>
                            <th>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cPayments.sort((a, b) => new Date(b.date) - new Date(a.date)).map(p => (
                            <tr key={p.id}>
                              <td>{new Date(p.date).toLocaleDateString('en-GB').replace(/\//g, '-')}</td>
                              <td>{p.month} {p.year}</td>
                              <td>{p.paymentMethod}</td>
                              <td className="text-success"><strong>₹{p.amount}</strong></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Restore Button */}
                <div className="restore-bar">
                  <button className="btn-restore" onClick={() => handleRestore(c)}>
                    <RotateCcw size={16} />
                    Restore as Active Tenant
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .former-page { }
        .page-heading { display: flex; align-items: center; gap: 14px; }
        .mb-20 { margin-bottom: 20px; }
        .text-success { color: #10b981; }
        .text-muted { color: var(--text-muted); }

        .former-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 24px; }
        .former-card { padding: 24px; display: flex; flex-direction: column; gap: 18px; }

        .former-header { display: flex; align-items: center; gap: 14px; }
        .serial-badge {
          min-width: 32px;
          height: 32px;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: white;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          font-weight: 700;
          flex-shrink: 0;
        }
        .former-photo { width: 72px; height: 72px; border-radius: 14px; overflow: hidden; background: var(--glass); border: 2px solid var(--glass-border); flex-shrink: 0; }
        .former-photo img { width: 100%; height: 100%; object-fit: cover; }
        .photo-icon { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: var(--text-muted); }
        .former-name h3 { margin-bottom: 6px; }

        .former-stats { display: flex; justify-content: space-around; align-items: center; background: rgba(255,255,255,0.03); border-radius: 12px; padding: 14px; }
        .fstat { display: flex; flex-direction: column; align-items: center; gap: 3px; }
        .fstat span { font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
        .fstat strong { font-size: 1.05rem; }
        .fstat-div { width: 1px; height: 30px; background: var(--glass-border); }

        .former-details { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; border-top: 1px solid var(--glass-border); padding-top: 16px; }
        .fd-row label { font-size: 0.7rem; color: var(--text-muted); display: block; margin-bottom: 2px; text-transform: uppercase; letter-spacing: 0.5px; }
        .fd-row p { font-size: 0.92rem; font-weight: 500; }

        .former-id, .former-docs, .former-payments { border-top: 1px solid var(--glass-border); padding-top: 14px; }
        .restore-bar { border-top: 1px solid var(--glass-border); padding-top: 16px; margin-top: 4px; }
        .btn-restore { width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05)); border: 1px solid rgba(16,185,129,0.3); color: #10b981; border-radius: 10px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.3s; }
        .btn-restore:hover { background: #10b981; color: white; transform: translateY(-2px); box-shadow: 0 6px 18px rgba(16,185,129,0.3); }
        .former-id > label, .former-docs > label, .former-payments > label { font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; display: block; margin-bottom: 10px; letter-spacing: 0.5px; }
        .former-id img { width: 100%; border-radius: 10px; max-height: 170px; object-fit: cover; }

        @media (max-width: 768px) {
          .former-grid { grid-template-columns: 1fr; }
          .former-details { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default FormerTenants;
