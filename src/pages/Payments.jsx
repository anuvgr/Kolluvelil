import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CreditCard, Receipt, Printer, Download, Search, MessageCircle, AlertCircle, TrendingUp, FileSpreadsheet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const Payments = () => {
  const { clients, payments, expenses, addPayment } = useApp();
  const [showReceipt, setShowReceipt] = useState(null);
  const [formData, setFormData] = useState({
    clientId: '',
    amount: '',
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear(),
    paymentMethod: 'UPI'
  });
  const [filterMonth, setFilterMonth] = useState('All');
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [filterTenant, setFilterTenant] = useState('All');
  const [isGenerating, setIsGenerating] = useState(false);
  const receiptRef = React.useRef(null);
  const reportTableRef = React.useRef(null);

  const filteredPayments = payments.filter(p => {
    const matchMonth = filterMonth === 'All' || p.month === filterMonth;
    const matchYear = filterYear === 'All' || p.year.toString() === filterYear;
    const matchTenant = filterTenant === 'All' || p.clientId === filterTenant;
    return matchMonth && matchYear && matchTenant;
  });

  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const currentYear = new Date().getFullYear();
  
  const collectedThisMonth = payments
    .filter(p => p.month === currentMonth && p.year == currentYear)
    .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

  const pendingCount = clients.filter(c => 
    (c.status || 'Active') === 'Active' && 
    !payments.some(p => p.clientId === c.id && p.month === currentMonth && p.year == currentYear)
  ).length;

  const handleDownloadReport = async () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.setFontSize(18);
    pdf.text('Payment Collection Report', 14, 22);
    pdf.setFontSize(11);
    pdf.setTextColor(100);
    pdf.text(`Generated on: ${new Date().toLocaleDateString()} | Period: ${filterMonth} ${filterYear}`, 14, 30);
    
    const tableData = filteredPayments.map((p, i) => [
      i + 1,
      p.tenantName,
      `${p.month} ${p.year}`,
      p.paymentMethod,
      `Rs. ${p.amount}`
    ]);

    // Use autoTable if available, otherwise manual (simplified for now)
    let y = 40;
    pdf.setFontSize(10);
    pdf.setTextColor(0);
    pdf.text(['#', 'Tenant', 'Period', 'Method', 'Amount'].join('     '), 14, y);
    y += 10;
    filteredPayments.forEach((p, i) => {
      pdf.text(`${i+1}   ${p.tenantName.padEnd(20)} ${p.month.padEnd(10)} ${p.paymentMethod.padEnd(15)} Rs. ${p.amount}`, 14, y);
      y += 7;
      if (y > 280) { pdf.addPage(); y = 20; }
    });

    pdf.save(`Payment_Report_${filterMonth}_${filterYear}.pdf`);
  };

  const handleDownloadExcel = () => {
    const headers = ["#", "Tenant Name", "Month", "Year", "Method", "Amount", "Date"];
    const rows = filteredPayments.map((p, i) => [
      i + 1,
      `"${p.tenantName}"`,
      p.month,
      p.year,
      p.paymentMethod,
      p.amount,
      new Date(p.date).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Payment_Report_${filterMonth}_${filterYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPDF = async () => {
    if (!receiptRef.current || isGenerating) return;
    
    setIsGenerating(true);
    try {
      const element = receiptRef.current;
      const canvas = await html2canvas(element, {
        scale: 3, // Higher resolution for professional look
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        windowWidth: 800 // Ensure consistent width for capture
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Kolluvelil_Receipt_${showReceipt.id.slice(-6)}.pdf`);
    } catch (error) {
      console.error("PDF Generation failed", error);
      alert("Could not generate PDF. Please try the Print option.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleWhatsAppShare = () => {
    if (!showReceipt) return;
    
    const message = `*RENT RECEIPT - KOLLUVELIL RENTALS*%0A%0A` +
      `Hello *${showReceipt.tenantName}*,%0A` +
      `This is a confirmation of your rent payment.%0A%0A` +
      `*Receipt No:* #RCP-${showReceipt.id.slice(-6)}%0A` +
      `*Amount:* ₹${showReceipt.amount}%0A` +
      `*Period:* ${showReceipt.month} ${showReceipt.year}%0A` +
      `*Status:* Paid via ${showReceipt.paymentMethod}%0A%0A` +
      `Thank you for your payment!`;
    
    const whatsappUrl = `https://wa.me/${showReceipt.tenantPhone.replace(/\D/g, '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const handlePay = (e) => {
    e.preventDefault();
    const client = clients.find(c => c.id === formData.clientId);
    if (!client) {
      alert("Please select a tenant first.");
      return;
    }

    const paymentId = Date.now().toString();
    const payment = {
      ...formData,
      id: paymentId,
      date: new Date().toISOString(),
      tenantName: client.name,
      tenantPhone: client.phone
    };
    addPayment(payment);
    alert("Payment Created Successfully!");
    setShowReceipt(payment);
    setFormData({ ...formData, amount: '' });
  };

  // Auto-fill amount when tenant is selected
  React.useEffect(() => {
    if (formData.clientId) {
      const client = clients.find(c => c.id === formData.clientId);
      if (client) {
        setFormData(prev => ({ ...prev, amount: client.rentAmount }));
      }
    }
  }, [formData.clientId, clients]);

  return (
    <div className="payments-page">
      {/* Stats Bar */}
      <div className="payment-stats-bar mb-20">
        <div className="p-stat glass-card">
          <div className="p-icon blue"><Receipt size={20} /></div>
          <div className="p-info">
            <label>Collected ({currentMonth})</label>
            <h3>₹{collectedThisMonth.toLocaleString()}</h3>
          </div>
        </div>
        <div className="p-stat glass-card">
          <div className="p-icon orange"><AlertCircle size={20} /></div>
          <div className="p-info">
            <label>Pending Tenants</label>
            <h3>{pendingCount}</h3>
          </div>
        </div>
        <div className="p-stat glass-card">
          <div className="p-icon green"><TrendingUp size={20} /></div>
          <div className="p-info">
            <label>Total Collection</label>
            <h3>₹{payments.reduce((s, p) => s + parseFloat(p.amount || 0), 0).toLocaleString()}</h3>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="glass-card">
          <h3>Record Rent Payment</h3>
          <form onSubmit={handlePay} className="mt-20">
            <div className="input-group">
              <label>Select Tenant</label>
              <select required value={formData.clientId} onChange={e => setFormData({...formData, clientId: e.target.value})}>
                <option value="">-- Choose Tenant --</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name} (Rent: ₹{c.rentAmount})</option>
                ))}
              </select>
            </div>

            {formData.clientId && expenses && expenses.filter(e => e.tenantId === formData.clientId).length > 0 && (
              <div className="glass-card" style={{ padding: '15px', border: '1px solid rgba(245, 158, 11, 0.3)', background: 'rgba(245, 158, 11, 0.05)', marginBottom: '20px' }}>
                <h4 style={{ color: '#fbbf24', marginBottom: '10px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tenant Expense History</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                  {expenses.filter(e => e.tenantId === formData.clientId).map(exp => (
                    <div key={exp.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span>{exp.title} ({new Date(exp.date).toLocaleDateString('en-GB').replace(/\//g, '-')})</span>
                      <strong style={{ color: '#f87171' }}>₹{exp.amount}</strong>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" className="btn-secondary" style={{ flex: 1, fontSize: '0.8rem', padding: '8px', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981' }} onClick={() => {
                    const client = clients.find(c => c.id === formData.clientId);
                    const totalExpenses = expenses.filter(e => e.tenantId === formData.clientId).reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
                    const newAmount = Math.max(0, (parseFloat(client?.rentAmount || 0) - totalExpenses));
                    setFormData(prev => ({ ...prev, amount: newAmount }));
                  }}>
                    Deduct
                  </button>
                  <button type="button" className="btn-secondary" style={{ flex: 1, fontSize: '0.8rem', padding: '8px', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444' }} onClick={() => {
                    const client = clients.find(c => c.id === formData.clientId);
                    const totalExpenses = expenses.filter(e => e.tenantId === formData.clientId).reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
                    const newAmount = parseFloat(client?.rentAmount || 0) + totalExpenses;
                    setFormData(prev => ({ ...prev, amount: newAmount }));
                  }}>
                    Debit (Add)
                  </button>
                </div>
              </div>
            )}

            <div className="grid-2">
              <div className="input-group">
                <label>Amount Paid (₹)</label>
                <input required type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Payment Method</label>
                <select value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value})}>
                  <option>UPI</option>
                  <option>Cash</option>
                  <option>Bank Transfer</option>
                  <option>Cheque</option>
                  <option>Advance Adjustment</option>
                </select>
                {formData.paymentMethod === 'Advance Adjustment' && formData.clientId && (
                  <div className="mt-10">
                    <span className="badge badge-warning" style={{ textTransform: 'none', fontSize: '0.8rem' }}>
                      Available Deposit: ₹{clients.find(c => c.id === formData.clientId)?.deposit || '0'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid-2">
              <div className="input-group">
                <label>Month</label>
                <select value={formData.month} onChange={e => setFormData({...formData, month: e.target.value})}>
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>Year</label>
                <input type="number" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full">
              <CreditCard size={20} />
              <span>Record Payment & Generate Receipt</span>
            </button>
          </form>
        </div>

        <div className="glass-card">
          <div className="flex-row justify-between align-center mb-10">
            <h3>Payment History & Reports</h3>
            <div className="flex-row">
              <button className="btn-small btn-excel" onClick={handleDownloadExcel}>
                <FileSpreadsheet size={14} /> Excel
              </button>
              <button className="btn-small" onClick={handleDownloadReport}>
                <Download size={14} /> PDF
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="filter-bar mb-10">
            <select value={filterTenant} onChange={e => setFilterTenant(e.target.value)}>
              <option value="All">All Tenants</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
              <option value="All">All Months</option>
              {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                <option key={m}>{m}</option>
              ))}
            </select>
            <select value={filterYear} onChange={e => setFilterYear(e.target.value)}>
              <option value="All">All Years</option>
              {[2024, 2025, 2026].map(y => <option key={y}>{y}</option>)}
            </select>
          </div>

          <div className="table-container mt-10">
            <table>
              <thead>
                <tr>
                  <th>Tenant</th>
                  <th>Amount</th>
                  <th>Period</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map(p => (
                  <tr key={p.id}>
                    <td>{p.tenantName}</td>
                    <td>₹{p.amount}</td>
                    <td>{p.month} {p.year}</td>
                    <td>
                      <button className="icon-btn" onClick={() => setShowReceipt(p)}>
                        <Receipt size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredPayments.length === 0 && (
                  <tr><td colSpan="4" style={{textAlign: 'center', padding: '20px'}}>No records match these filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showReceipt && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
          >
            <div className="receipt-container glass-card" ref={receiptRef} style={{ background: '#ffffff', color: '#000000' }}>
              <div className="receipt-header">
                <div className="logo-section">
                  <Receipt size={40} style={{ color: '#6366f1' }} />
                  <h4 style={{ color: '#64748b', marginBottom: '-10px', fontSize: '0.8rem', letterSpacing: '2px' }}>KOLLUVELIL RENTALS</h4>
                  <h2 style={{ color: '#6366f1' }}>RENT RECEIPT</h2>
                </div>
                <button className="close-btn" style={{ color: '#64748b' }} onClick={() => setShowReceipt(null)}>&times;</button>
              </div>
              
              <div className="receipt-body">
                <div className="receipt-meta" style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                  <p><strong>Receipt No:</strong> #RCP-{showReceipt.id.slice(-6)}</p>
                  <p><strong>Date:</strong> {new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}</p>
                </div>
                
                <div className="receipt-details">
                  <div className="detail-row">
                    <span style={{ color: '#64748b' }}>Received from:</span>
                    <strong style={{ color: '#1e293b' }}>{showReceipt.tenantName}</strong>
                  </div>
                  <div className="detail-row">
                    <span style={{ color: '#64748b' }}>Amount:</span>
                    <strong className="amount" style={{ color: '#10b981' }}>₹{showReceipt.amount}</strong>
                  </div>
                  <div className="detail-row">
                    <span style={{ color: '#64748b' }}>For the period:</span>
                    <strong style={{ color: '#1e293b' }}>{showReceipt.month} {showReceipt.year}</strong>
                  </div>
                  <div className="detail-row">
                    <span style={{ color: '#64748b' }}>Payment Mode:</span>
                    <strong style={{ color: '#1e293b' }}>{showReceipt.paymentMethod}</strong>
                  </div>
                </div>

                <div className="receipt-footer">
                  <p className="thank-you" style={{ color: '#64748b' }}>Thank you for your payment!</p>
                  <div className="signature">
                    <div className="sig-line" style={{ borderTop: '1px solid #1e293b' }}></div>
                    <span style={{ color: '#64748b' }}>Authorized Signatory</span>
                  </div>
                </div>
              </div>

              <div className="receipt-actions" data-html2canvas-ignore="true">
                <button className="btn-secondary" onClick={() => window.print()}>
                  <Printer size={18} /> Print
                </button>
                <button 
                  className="btn-whatsapp" 
                  onClick={handleWhatsAppShare}
                >
                  <MessageCircle size={18} /> WhatsApp
                </button>
                <button 
                  className="btn-primary" 
                  onClick={handleDownloadPDF}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>Generating...</>
                  ) : (
                    <>
                      <Download size={18} /> Download PDF
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .w-full { width: 100%; }
        .mt-20 { margin-top: 20px; }
        .mt-10 { margin-top: 10px; }
        .mb-20 { margin-bottom: 20px; }
        .mb-10 { margin-bottom: 10px; }
        .flex-row { display: flex; gap: 10px; }
        .justify-between { justify-content: space-between; }
        .align-center { align-items: center; }

        .payment-stats-bar { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .p-stat { display: flex; align-items: center; gap: 15px; padding: 20px; }
        .p-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
        .p-icon.blue { background: rgba(99,102,241,0.1); color: #818cf8; }
        .p-icon.orange { background: rgba(245,158,11,0.1); color: #fbbf24; }
        .p-icon.green { background: rgba(16,185,129,0.1); color: #10b981; }
        .p-info label { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
        .p-info h3 { font-size: 1.25rem; margin-top: 2px; }

        .filter-bar { display: flex; gap: 10px; background: rgba(255,255,255,0.02); padding: 10px; border-radius: 8px; border: 1px solid var(--glass-border); }
        .filter-bar select { flex: 1; background: transparent; border: none; color: var(--text-main); font-size: 0.85rem; outline: none; }
        
        .receipt-container { width: 100%; max-width: 500px; padding: 40px; }
        .receipt-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; }
        .logo-section h2 { margin-top: 10px; font-size: 1.5rem; letter-spacing: 4px; color: var(--primary); }
        
        .receipt-meta { display: flex; justify-content: space-between; margin-bottom: 30px; padding-bottom: 15px; border-bottom: 1px solid var(--glass-border); color: var(--text-muted); font-size: 0.9rem; }
        
        .receipt-details { display: flex; flex-direction: column; gap: 16px; margin-bottom: 40px; }
        .detail-row { display: flex; justify-content: space-between; align-items: center; }
        .detail-row span { color: var(--text-muted); }
        .amount { font-size: 1.5rem; color: #34d399; }
        
        .receipt-footer { display: flex; justify-content: space-between; align-items: flex-end; }
        .thank-you { font-style: italic; color: var(--text-muted); font-size: 0.9rem; }
        .signature { text-align: center; width: 150px; }
        .sig-line { border-top: 1px solid var(--text-main); margin-bottom: 8px; }
        .signature span { font-size: 0.75rem; color: var(--text-muted); }
        
        .receipt-actions { display: flex; gap: 12px; margin-top: 30px; }
        .receipt-actions button { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; }

        .btn-whatsapp {
          background: #25d366;
          color: white;
          box-shadow: 0 4px 14px rgba(37, 211, 102, 0.3);
        }
        .btn-whatsapp:hover {
          background: #128c7e;
          transform: translateY(-2px);
        }

        .btn-excel {
          background: #10b981;
          color: white;
          border: none;
        }
        .btn-excel:hover {
          background: #059669;
        }

        @media print {
          .sidebar, .top-bar, .receipt-actions, .close-btn, form { display: none !important; }
          .receipt-container { border: none; box-shadow: none; background: white; color: black; }
          .receipt-container * { color: black !important; }
        }
      `}</style>
    </div>
  );
};

export default Payments;
