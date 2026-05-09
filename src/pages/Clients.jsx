import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Plus, User, FileText, Upload, Trash2, Search, Eye, Edit3, ArrowLeft, LogOut, Printer, Download, UserX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const Clients = () => {
  const { clients, addClient, updateClient, toggleClientStatus, deleteClient, payments } = useApp();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState(null); // 'add', 'edit', 'view'
  const [profileTab, setProfileTab] = useState('profile');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [vacateConfirm, setVacateConfirm] = useState(null); // holds client id to vacate
  const downloadRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    idType: 'Aadhar',
    idNumber: '',
    address: '',
    rentAmount: '',
    deposit: '',
    agreementDate: new Date().toISOString().split('T')[0],
    photo: null,
    idCard: null,
    agreement: null,
    documents: []
  });

  const [previews, setPreviews] = useState({
    photo: null,
    idCard: null,
    agreement: null
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (viewMode === 'edit') {
      updateClient(selectedClient.id, formData);
    } else {
      addClient(formData);
    }
    setViewMode(null);
    setSelectedClient(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '', phone: '', email: '', idType: 'Aadhar', 
      idNumber: '', address: '', rentAmount: '', deposit: '',
      agreementDate: new Date().toISOString().split('T')[0],
      photo: null,
      idCard: null,
      agreement: null,
      documents: []
    });
    setPreviews({ photo: null, idCard: null, agreement: null });
  };

  const handleEdit = (client) => {
    setSelectedClient(client);
    setFormData(client);
    setPreviews({ photo: client.photo, idCard: client.idCard, agreement: client.agreement });
    setViewMode('edit');
  };

  const handleView = (client) => {
    setSelectedClient(client);
    setProfileTab('profile');
    setViewMode('view');
  };

  const handleVacate = (id) => {
    setVacateConfirm(id);
  };

  const confirmVacate = () => {
    if (vacateConfirm) {
      toggleClientStatus(vacateConfirm, 'Vacated');
      setVacateConfirm(null);
      navigate('/former-tenants');
    }
  };

  const compressImage = (file, callback) => {
    if (!file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => callback(reader.result);
      reader.readAsDataURL(file);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1000;
        const MAX_HEIGHT = 1000;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        callback(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      compressImage(file, (result) => {
        setFormData(prev => ({
          ...prev,
          documents: [...prev.documents, { name: file.name, data: result }]
        }));
      });
    });
  };

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      compressImage(file, (result) => {
        setPreviews(prev => ({ ...prev, [type]: result }));
        setFormData(prev => ({ ...prev, [type]: result }));
      });
    }
  };

  const filteredClients = clients.filter(c => {
    const status = c.status || 'Active';
    return status === 'Active' && (
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.phone.includes(searchTerm)
    );
  });

  return (
    <div className="clients-page">
      <div className="page-header">
        <div className="search-bar glass-card">
          <Search size={20} className="text-muted" />
          <input 
            type="text" 
            placeholder="Search tenants by Name or Mobile No..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn-primary" onClick={() => setViewMode('add')}>
          <Plus size={20} />
          <span>Add New Tenant</span>
        </button>
      </div>

      <AnimatePresence>
        {(viewMode === 'add' || viewMode === 'edit') && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="modal-overlay"
          >
            <div className="modal-content glass-card">
              <div className="modal-header">
                <h2>{viewMode === 'edit' ? 'Edit Tenant Details' : 'New Tenant Registration'}</h2>
                <button className="close-btn" onClick={() => setViewMode(null)}>&times;</button>
              </div>
              <form onSubmit={handleSubmit}>
                {/* Form fields same as before */}
                <div className="grid-2">
                  <div className="input-group">
                    <label>Full Name</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label>Phone Number</label>
                    <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="input-group">
                    <label>Email Address</label>
                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label>ID Proof Type</label>
                    <select value={formData.idType} onChange={e => setFormData({...formData, idType: e.target.value})}>
                      <option>Aadhar Card</option>
                      <option>PAN Card</option>
                      <option>Voter ID</option>
                      <option>Passport</option>
                    </select>
                  </div>
                </div>

                <div className="input-group">
                  <label>Current Address</label>
                  <textarea rows="2" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}></textarea>
                </div>

                <div className="grid-2">
                  <div className="input-group">
                    <label>Monthly Rent (₹)</label>
                    <input required type="number" value={formData.rentAmount} onChange={e => setFormData({...formData, rentAmount: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label>Security Deposit (₹)</label>
                    <input required type="number" value={formData.deposit} onChange={e => setFormData({...formData, deposit: e.target.value})} />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="input-group">
                    <label>Agreement Date</label>
                    <input type="date" value={formData.agreementDate} onChange={e => setFormData({...formData, agreementDate: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label>Agreement Copy</label>
                    <div className="image-upload-box" style={{ height: '70px' }}>
                      {previews.agreement ? (
                        <img src={previews.agreement} alt="Preview" className="preview-img" />
                      ) : (
                        <div className="placeholder">
                          <span>Upload Agreement</span>
                        </div>
                      )}
                      <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'agreement')} />
                    </div>
                  </div>
                </div>

                <div className="grid-2">
                  <div className="input-group">
                    <label>Tenant Photo</label>
                    <div className="image-upload-box">
                      {previews.photo ? (
                        <img src={previews.photo} alt="Preview" className="preview-img" />
                      ) : (
                        <div className="placeholder">
                          <User size={32} />
                          <span>Upload Photo</span>
                        </div>
                      )}
                      <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'photo')} />
                    </div>
                  </div>
                  <div className="input-group">
                    <label>ID Card Copy (Front/Back)</label>
                    <div className="image-upload-box">
                      {previews.idCard ? (
                        <img src={previews.idCard} alt="Preview" className="preview-img" />
                      ) : (
                        <div className="placeholder">
                          <FileText size={32} />
                          <span>Upload ID</span>
                        </div>
                      )}
                      <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'idCard')} />
                    </div>
                  </div>
                </div>

                <div className="input-group">
                  <label>Other Documents</label>
                  <div className="file-upload-zone">
                    <Upload size={24} />
                    <span>Click to upload other docs</span>
                    <input type="file" multiple onChange={handleFileChange} />
                  </div>
                  <div className="doc-tags">
                    {formData.documents.map((doc, i) => (
                      <span key={i} className="doc-tag">{typeof doc === 'string' ? doc : doc.name}</span>
                    ))}
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setViewMode(null)}>Cancel</button>
                  <button type="submit" className="btn-primary">{viewMode === 'edit' ? 'Update Details' : 'Register Tenant'}</button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {viewMode === 'view' && selectedClient && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
          >
            <div className="modal-content glass-card profile-view">
              <div className="modal-header">
                <h2>Tenant Profile</h2>
                <button className="close-btn" onClick={() => setViewMode(null)}>&times;</button>
              </div>

              {/* Tab Navigation */}
              <div className="profile-tabs">
                <button className={profileTab === 'profile' ? 'active' : ''} onClick={() => setProfileTab('profile')}>
                  <User size={14} /> Profile
                </button>
                <button className={profileTab === 'download' ? 'active' : ''} onClick={() => setProfileTab('download')}>
                  <Download size={14} /> Download
                </button>
              </div>

              {/* ── PROFILE TAB ── */}
              {profileTab === 'profile' && (
                <div className="profile-grid">
                  <div className="profile-aside">
                    <div className="profile-photo-large">
                      {selectedClient.photo ? (
                        <img src={selectedClient.photo} alt={selectedClient.name} />
                      ) : (
                        <div className="photo-placeholder"><User size={64} /></div>
                      )}
                    </div>
                    <div className="profile-main-info mt-20">
                      <h3>{selectedClient.name}</h3>
                      <p className="text-muted">{selectedClient.idType}: {selectedClient.idNumber || 'N/A'}</p>
                    </div>
                    <div className="rent-badge mt-20">
                      <p>Monthly Rent</p>
                      <h2>&#8377;{selectedClient.rentAmount}</h2>
                    </div>
                    <div className="deposit-badge mt-20">
                      <p>Security Deposit</p>
                      <h2>&#8377;{selectedClient.deposit}</h2>
                    </div>
                    <div className="deposit-badge mt-20" style={{ background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.2)' }}>
                      <p>Total Payments</p>
                      <h2>{payments.filter(p => p.clientId === selectedClient.id).length} receipts</h2>
                    </div>
                  </div>

                  <div className="profile-details">
                    <section>
                      <h4>Contact Information</h4>
                      <div className="detail-item"><label>Phone</label><p>{selectedClient.phone}</p></div>
                      <div className="detail-item"><label>Email</label><p>{selectedClient.email || 'N/A'}</p></div>
                      <div className="detail-item"><label>Address</label><p>{selectedClient.address}</p></div>
                    </section>

                    <section className="mt-20">
                      <h4>ID Verification</h4>
                      <div className="id-card-view">
                        {selectedClient.idCard ? (
                          <img src={selectedClient.idCard} alt="ID Card" className="id-img" />
                        ) : (
                          <div className="no-id">No ID image uploaded</div>
                        )}
                      </div>
                    </section>

                    <section className="mt-20">
                      <h4>Documents &amp; Agreement</h4>
                      <div className="detail-item"><label>Agreement Date</label><p>{selectedClient.agreementDate}</p></div>
                      {selectedClient.agreement && (
                        <div className="id-card-view mt-10" style={{ marginBottom: '16px' }}>
                          <img src={selectedClient.agreement} alt="Agreement" className="id-img" />
                        </div>
                      )}
                      <div className="doc-list mt-10">
                        {selectedClient.documents.length > 0 ? (
                          selectedClient.documents.map((doc, i) => (
                            <div key={i} className="doc-item"><FileText size={18} /><span>{typeof doc === 'string' ? doc : doc.name}</span></div>
                          ))
                        ) : (
                          <p className="text-muted">No additional documents</p>
                        )}
                      </div>
                    </section>
                  </div>
                </div>
              )}

              {/* ── DOWNLOAD TAB ── */}
              {profileTab === 'download' && (
                <div>
                  <div ref={downloadRef} style={{ background: '#ffffff', color: '#111', padding: '32px', borderRadius: '12px', marginBottom: '20px' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '20px', marginBottom: '24px' }}>
                      {selectedClient.photo ? (
                        <img src={selectedClient.photo} alt="" style={{ width: '90px', height: '90px', borderRadius: '14px', objectFit: 'cover', border: '2px solid #e2e8f0' }} />
                      ) : (
                        <div style={{ width: '90px', height: '90px', borderRadius: '14px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                          <User size={40} />
                        </div>
                      )}
                      <div>
                        <h2 style={{ color: '#1e293b', marginBottom: '4px' }}>{selectedClient.name}</h2>
                        <p style={{ color: '#64748b' }}>{selectedClient.idType} &middot; {selectedClient.phone}</p>
                        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{selectedClient.email}</p>
                      </div>
                      <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>KOLLUVELIL RENTALS</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Tenant Record</div>
                        <div style={{ fontSize: '0.85rem', color: '#6366f1', fontWeight: '700' }}>#{selectedClient.id?.slice(-6)}</div>
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                      {[
                        ['Monthly Rent', `\u20b9${selectedClient.rentAmount}`],
                        ['Security Deposit', `\u20b9${selectedClient.deposit}`],
                        ['Agreement Date', selectedClient.agreementDate],
                        ['Total Payments', `${payments.filter(p => p.clientId === selectedClient.id).length} receipts`]
                      ].map(([l, v]) => (
                        <div key={l} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                          <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{l}</div>
                          <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '0.95rem' }}>{v}</div>
                        </div>
                      ))}
                    </div>

                    {/* Details Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                      {[
                        ['Address', selectedClient.address || 'N/A'],
                        ['ID Type', selectedClient.idType],
                        ['ID Number', selectedClient.idNumber || 'N/A'],
                        ['Email', selectedClient.email || 'N/A']
                      ].map(([l, v]) => (
                        <div key={l} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px' }}>
                          <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' }}>{l}</div>
                          <div style={{ fontWeight: '600', color: '#1e293b' }}>{v}</div>
                        </div>
                      ))}
                    </div>

                    {/* ID Card */}
                    {selectedClient.idCard && (
                      <div style={{ marginBottom: '24px' }}>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>ID Card Copy</div>
                        <img src={selectedClient.idCard} alt="ID" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'block' }} />
                      </div>
                    )}

                    {/* Documents */}
                    {selectedClient.documents.length > 0 && (
                      <div style={{ marginBottom: '20px' }}>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>Attached Documents</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                          {selectedClient.documents.map((d, i) => (
                            <span key={i} style={{ background: '#eff6ff', color: '#3b82f6', padding: '4px 12px', borderRadius: '6px', fontSize: '0.82rem', border: '1px solid #bfdbfe' }}>{typeof d === 'string' ? d : d.name}</span>
                          ))}
                        </div>
                        {selectedClient.agreement && (
                          <div style={{ marginBottom: '16px' }}>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>Agreement Copy</div>
                            <img src={selectedClient.agreement} alt="Agreement" style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'block' }} />
                          </div>
                        )}
                        <div id="documents-images-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          {selectedClient.documents.map((d, i) => (
                            typeof d === 'object' && d.data && d.data.startsWith('data:image/') ? (
                              <div key={`img-${i}`} style={{ width: '100%' }}>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>{d.name}</div>
                                <img src={d.data} alt={d.name} style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'block' }} />
                              </div>
                            ) : null
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14px', fontSize: '0.72rem', color: '#94a3b8', textAlign: 'center' }}>
                      Generated by Kolluvelil Rental Management &middot; {new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="modal-footer" id="profile-actions">
                    <button className="btn-secondary" onClick={() => window.print()}>
                      <Printer size={16} /> Print
                    </button>
                    <button className="btn-primary" onClick={async () => {
                      if (!downloadRef.current) return;
                      
                      const modalContent = downloadRef.current.closest('.modal-content');
                      const originalMaxHeight = modalContent ? modalContent.style.maxHeight : '';
                      const originalOverflow = modalContent ? modalContent.style.overflowY : '';
                      
                      if (modalContent) {
                        modalContent.style.maxHeight = 'none';
                        modalContent.style.overflowY = 'visible';
                      }

                      try {
                        const canvas = await html2canvas(downloadRef.current, { 
                          scale: 2, 
                          backgroundColor: '#ffffff', 
                          useCORS: true,
                          scrollY: -window.scrollY
                        });
                        
                        const imgData = canvas.toDataURL('image/png');
                        const pdf = new jsPDF('p', 'mm', 'a4');
                        const pdfW = pdf.internal.pageSize.getWidth();
                        const pdfH = (canvas.height * pdfW) / canvas.width;
                        const pageHeight = pdf.internal.pageSize.getHeight();
                        
                        let heightLeft = pdfH;
                        let position = 0;

                        pdf.addImage(imgData, 'PNG', 0, position, pdfW, pdfH);
                        heightLeft -= pageHeight;

                        while (heightLeft > 0) {
                          position = position - pageHeight;
                          pdf.addPage();
                          pdf.addImage(imgData, 'PNG', 0, position, pdfW, pdfH);
                          heightLeft -= pageHeight;
                        }
                        
                        pdf.save(`Tenant_${selectedClient.name.replace(/ /g,'_')}.pdf`);
                      } finally {
                        if (modalContent) {
                          modalContent.style.maxHeight = originalMaxHeight;
                          modalContent.style.overflowY = originalOverflow;
                        }
                      }
                    }}>
                      <Download size={16} /> Download PDF
                    </button>
                  </div>
                </div>
              )}

              {/* Footer for Profile Tab */}
              {profileTab === 'profile' && (
                <div className="modal-footer mt-20" id="profile-actions">
                  <button className="btn-secondary" onClick={() => setProfileTab('download')}>
                    <Download size={16} /> Download
                  </button>
                  <button className="btn-primary" onClick={() => handleEdit(selectedClient)}>Edit Profile</button>
                </div>
              )}
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Vacate Confirmation Modal */}
      {vacateConfirm && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="glass-card" style={{ maxWidth: '420px', padding: '32px', textAlign: 'center' }}>
            <div style={{ width: '60px', height: '60px', background: 'rgba(245,158,11,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <LogOut size={28} style={{ color: '#fbbf24' }} />
            </div>
            <h3 style={{ marginBottom: '10px' }}>Mark as Vacated?</h3>
            <p className="text-muted" style={{ marginBottom: '28px', fontSize: '0.9rem' }}>
              {clients.find(c => c.id === vacateConfirm)?.name} will be moved to <strong>Former Tenants</strong>. You can restore them anytime.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setVacateConfirm(null)}>Cancel</button>
              <button className="btn-primary" style={{ flex: 1, background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }} onClick={confirmVacate}>Yes, Vacate</button>
            </div>
          </div>
        </div>
      )}

      <div className="clients-list mt-20">
        <div className="glass-card">
          <h3>Active Tenants</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>#</th>
                  <th>Tenant Name</th>
                  <th>Contact</th>
                  <th>Rent</th>
                  <th>Agreement</th>
                  <th>Documents</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client, index) => (
                  <tr key={client.id}>
                    <td>
                      <span className="serial-num">{index + 1}</span>
                    </td>
                    <td>
                      <div className="user-info">
                        {client.photo ? (
                          <img src={client.photo} className="avatar sm" alt="" />
                        ) : (
                          <div className="avatar sm"></div>
                        )}
                        <span>{client.name}</span>
                      </div>
                    </td>
                    <td>
                      <p>{client.phone}</p>
                      <small className="text-muted">{client.email}</small>
                    </td>
                    <td>₹{client.rentAmount}</td>
                    <td>{client.agreementDate}</td>
                    <td>
                      <div className="doc-icons">
                        <FileText size={16} className="text-muted" title={client.documents.map(d => typeof d === 'string' ? d : d.name).join(', ')} />
                        <small>{client.documents.length} docs</small>
                      </div>
                    </td>
                    <td>
                      <div className="actions">
                        <button className="icon-btn view" title="View Profile" onClick={() => handleView(client)}><Eye size={18} /></button>
                        <button className="icon-btn edit" title="Edit Details" onClick={() => handleEdit(client)}><Edit3 size={18} /></button>
                        <button className="icon-btn vacate" title="Mark as Vacated" onClick={() => handleVacate(client.id)}><LogOut size={18} /></button>
                        <button className="icon-btn delete" title="Delete Records" onClick={() => deleteClient(client.id)}><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredClients.length === 0 && (
                  <tr><td colSpan="6" style={{textAlign: 'center', padding: '40px'}}>No tenants found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        .page-header { display: flex; justify-content: space-between; gap: 20px; margin-bottom: 24px; }
        .search-bar { flex: 1; display: flex; align-items: center; gap: 12px; padding: 0 20px; }
        .search-bar input { background: transparent; border: none; padding: 14px 0; }
        
        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center; z-index: 1000;
          padding: 20px;
        }
        .modal-content { width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .close-btn { background: transparent; font-size: 24px; color: var(--text-muted); }
        
        .file-upload-zone {
          border: 2px dashed var(--glass-border);
          border-radius: 12px;
          padding: 30px;
          text-align: center;
          position: relative;
          color: var(--text-muted);
          transition: 0.3s;
        }
        .file-upload-zone:hover { border-color: var(--primary); background: rgba(255, 255, 255, 0.02); }
        .file-upload-zone input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
        
        .doc-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
        .doc-tag { background: var(--glass); padding: 4px 12px; border-radius: 6px; font-size: 0.75rem; border: 1px solid var(--glass-border); }
        
        .user-info { display: flex; align-items: center; gap: 12px; font-weight: 500; }
        .doc-icons { display: flex; align-items: center; gap: 4px; }
        .modal-footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
        .btn-secondary { background: var(--glass); color: var(--text-main); }
        .mt-20 { margin-top: 20px; }
        .serial-num {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(236,72,153,0.1));
          border: 1px solid rgba(99,102,241,0.3);
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--primary);
        }

        .image-upload-box {
          height: 120px;
          border: 2px dashed var(--glass-border);
          border-radius: 12px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          transition: 0.3s;
          background: rgba(255, 255, 255, 0.02);
        }
        .image-upload-box:hover { border-color: var(--primary); }
        .image-upload-box input { position: absolute; inset: 0; opacity: 0; cursor: pointer; z-index: 2; }
        .image-upload-box .placeholder { display: flex; flex-direction: column; align-items: center; gap: 8px; color: var(--text-muted); font-size: 0.8rem; }
        .preview-img { width: 100%; height: 100%; object-fit: cover; }
        
        .avatar.sm { width: 40px; height: 40px; border-radius: 10px; object-fit: cover; background: var(--glass); }

        /* Profile View Styles */
        .profile-view { max-width: 800px; }
        .profile-grid { display: grid; grid-template-columns: 280px 1fr; gap: 40px; }
        .profile-photo-large { width: 100%; aspect-ratio: 1; border-radius: 20px; overflow: hidden; background: var(--glass); border: 1px solid var(--glass-border); }
        .profile-photo-large img { width: 100%; height: 100%; object-fit: cover; }
        .photo-placeholder { height: 100%; display: flex; align-items: center; justify-content: center; color: var(--text-muted); }
        
        .rent-badge { background: rgba(99, 102, 241, 0.1); padding: 20px; border-radius: 16px; border: 1px solid rgba(99, 102, 241, 0.2); }
        .rent-badge p { font-size: 0.8rem; color: var(--primary); margin-bottom: 4px; }

        .deposit-badge { background: rgba(245, 158, 11, 0.1); padding: 16px 20px; border-radius: 16px; border: 1px solid rgba(245, 158, 11, 0.2); }
        .deposit-badge p { font-size: 0.75rem; color: #f59e0b; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
        .deposit-badge h2 { font-size: 1.4rem; }

        @media print {
          body * { visibility: hidden; }
          .modal-content, .modal-content * { visibility: visible; }
          .modal-content { position: absolute; top: 0; left: 0; width: 100%; max-height: none !important; overflow: visible !important; background: white !important; color: black !important; padding: 30px; }
          #profile-actions { display: none !important; }
          .close-btn { display: none !important; }
          .modal-overlay { position: static !important; background: none !important; }
          h2, h3, h4, p, label, span, strong { color: black !important; }
          .glass-card, .profile-aside, .profile-details { background: white !important; border: 1px solid #ddd !important; }
          .rent-badge, .deposit-badge { background: #f8f9fa !important; border: 1px solid #ddd !important; }
          .id-img { max-height: 200px; }
        }
        
        .profile-details section { border-bottom: 1px solid var(--glass-border); padding-bottom: 20px; }
        .profile-details h4 { margin-bottom: 15px; color: var(--primary); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; }
        .detail-item { margin-bottom: 12px; }
        .detail-item label { margin-bottom: 2px; }
        .detail-item p { font-weight: 500; font-size: 1.1rem; }
        
        .id-card-view { border-radius: 12px; overflow: hidden; border: 1px solid var(--glass-border); max-height: 200px; }
        .id-img { width: 100%; height: 100%; object-fit: cover; }
        .no-id { padding: 40px; text-align: center; color: var(--text-muted); background: var(--glass); }
        
        .doc-item { display: flex; align-items: center; gap: 10px; background: var(--glass); padding: 10px; border-radius: 8px; margin-bottom: 8px; font-size: 0.9rem; }
        
        .actions { display: flex; gap: 8px; }
        .icon-btn.view { color: #818cf8; }
        .icon-btn.edit { color: #34d399; }
        .icon-btn.vacate { color: #fbbf24; }
        .icon-btn.delete { color: #f87171; }
        
        @media (max-width: 768px) {
          .profile-grid { grid-template-columns: 1fr; gap: 20px; }
          .profile-aside { text-align: center; }
          .profile-photo-large { width: 150px; margin: 0 auto; }
        }
      `}</style>
    </div>
  );
};

export default Clients;
