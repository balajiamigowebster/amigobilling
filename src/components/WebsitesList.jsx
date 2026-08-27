import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  X, 
  Sparkles, 
  Globe, 
  ExternalLink, 
  Calendar, 
  FileSpreadsheet, 
  ShieldAlert, 
  AlertCircle, 
  Info, 
  CheckCircle,
  Clock
} from 'lucide-react';
import { API_URL } from '../config';

export default function WebsitesList({ showToast }) {
  const [websites, setWebsites] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [showModal, setShowModal] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState(null);
  const [deletingWebsite, setDeletingWebsite] = useState(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Form State
  const [form, setForm] = useState({
    customerId: '',
    websiteName: '',
    websiteUrl: '',
    status: 'Active',
    launchDate: new Date().toLocaleDateString('sv'),
    expiryDate: '',
    notes: ''
  });

  useEffect(() => {
    fetchWebsites();
    fetchCustomers();
  }, []);

  const fetchWebsites = async () => {
    try {
      const res = await fetch(`${API_URL}/api/websites`);
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setWebsites(data);
      }
    } catch (err) {
      console.error('Error fetching websites:', err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/customers`);
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setCustomers(data);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  const handleOpenAddModal = () => {
    setEditingWebsite(null);
    setForm({
      customerId: customers.length > 0 ? customers[0].id.toString() : '',
      websiteName: '',
      websiteUrl: '',
      status: 'Active',
      launchDate: new Date().toLocaleDateString('sv'),
      expiryDate: '',
      notes: ''
    });
    setFormError('');
    setShowModal(true);
  };

  const handleOpenEditModal = (web) => {
    setEditingWebsite(web);
    setForm({
      customerId: web.customer_id ? web.customer_id.toString() : '',
      websiteName: web.website_name || '',
      websiteUrl: web.website_url || '',
      status: web.status || 'Active',
      launchDate: web.launch_date ? web.launch_date.slice(0, 10) : '',
      expiryDate: web.expiry_date ? web.expiry_date.slice(0, 10) : '',
      notes: web.notes || ''
    });
    setFormError('');
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setForm(f => {
      const updated = { ...f, [id]: value };
      
      // Auto-calculate expiry date to exactly 1 year from launch date if expiry date is empty
      if (id === 'launchDate' && value && !f.expiryDate) {
        const launch = new Date(value);
        const expiry = new Date(launch);
        expiry.setFullYear(launch.getFullYear() + 1);
        updated.expiryDate = expiry.toLocaleDateString('sv');
      }
      
      return updated;
    });
  };

  const handleSaveWebsite = async (e) => {
    e.preventDefault();
    if (!form.websiteName || !form.websiteUrl) {
      setFormError('Website Name and URL are required.');
      return;
    }

    setSaving(true);
    setFormError('');

    const payload = {
      ...form,
      customerId: form.customerId ? parseInt(form.customerId, 10) : null
    };

    try {
      let res;
      if (editingWebsite) {
        res = await fetch(`${API_URL}/api/websites/${editingWebsite.id}/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`${API_URL}/api/websites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save website record.');
      }

      setShowModal(false);
      fetchWebsites();
      if (showToast) {
        showToast(
          editingWebsite ? 'Website subscription updated!' : 'New website successfully added to catalog!',
          'success'
        );
      }
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteWebsite = async () => {
    if (!deletingWebsite) return;

    try {
      const res = await fetch(`${API_URL}/api/websites/${deletingWebsite.id}/delete`, {
        method: 'POST'
      });

      if (!res.ok) {
        throw new Error('Failed to delete website.');
      }

      setDeletingWebsite(null);
      fetchWebsites();
      if (showToast) {
        showToast('Website subscription deleted.', 'success');
      }
    } catch (err) {
      console.error(err);
      alert(err.message || 'Could not delete website.');
    }
  };

  const handleExportToExcel = () => {
    if (filteredWebsites.length === 0) return;
    
    const headers = ['S.No', 'Website Title', 'Website Link', 'Associated Client', 'Status', 'Launch Date', 'Expiry Date', 'Notes'];
    const rows = filteredWebsites.map((web, idx) => [
      idx + 1,
      web.website_name,
      web.website_url,
      web.customer_name || 'Independent',
      web.status,
      web.launch_date ? web.launch_date.slice(0, 10) : '—',
      web.expiry_date ? web.expiry_date.slice(0, 10) : '—',
      web.notes || ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `websites_list_${new Date().toLocaleDateString('sv')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter logic
  const filteredWebsites = websites.filter(web => {
    const query = search.toLowerCase();
    const name = web.website_name || '';
    const url = web.website_url || '';
    const cust = web.customer_name || '';
    
    const matchesSearch = (
      name.toLowerCase().includes(query) ||
      url.toLowerCase().includes(query) ||
      cust.toLowerCase().includes(query)
    );

    const today = new Date().toISOString().slice(0, 10);
    const matchesStatus = 
      statusFilter === 'All' ||
      (statusFilter === 'Active' && web.status === 'Active') ||
      (statusFilter === 'Expired' && web.status === 'Active' && web.expiry_date && web.expiry_date.slice(0,10) < today) ||
      (statusFilter === 'Inactive' && web.status === 'Inactive');

    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const totalSites = websites.length;
  const activeSites = websites.filter(w => w.status === 'Active').length;
  
  const todayStr = new Date().toISOString().slice(0, 10);
  const expiredSites = websites.filter(w => w.status === 'Active' && w.expiry_date && w.expiry_date.slice(0, 10) < todayStr).length;

  const next30Days = new Date();
  next30Days.setDate(next30Days.getDate() + 30);
  const next30DaysStr = next30Days.toISOString().slice(0, 10);

  const upcomingRenewals = websites.filter(w => 
    w.status === 'Active' && 
    w.expiry_date && 
    w.expiry_date.slice(0, 10) >= todayStr && 
    w.expiry_date.slice(0, 10) <= next30DaysStr
  ).length;

  // Pagination
  const totalItems = filteredWebsites.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedWebsites = filteredWebsites.slice(startIndex, endIndex);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const formatDateSafe = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '—';
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return '—';
    }
  };

  const isExpired = (expiryStr) => {
    if (!expiryStr) return false;
    const expiry = expiryStr.slice(0, 10);
    return expiry < todayStr;
  };

  const isExpiringSoon = (expiryStr) => {
    if (!expiryStr) return false;
    const expiry = expiryStr.slice(0, 10);
    return expiry >= todayStr && expiry <= next30DaysStr;
  };

  return (
    <div className="page-enter">
      <div className="card-header-flex" style={{ marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Website Subscriptions</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Track client web properties, domain hosting validity, and yearly completion/renewal alerts.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={handleExportToExcel} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileSpreadsheet size={18} /> Export CSV
          </button>
          <button className="btn btn-primary" onClick={handleOpenAddModal}>
            <Plus size={18} /> Add Web Property
          </button>
        </div>
      </div>

      {/* Website Stats Grid */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="card" style={{ flexDirection: 'row', gap: '16px', alignItems: 'center', padding: '16px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Globe size={20} />
          </div>
          <div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Monitored Sites</p>
            <h4 style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '2px' }}>{totalSites}</h4>
          </div>
        </div>

        <div className="card" style={{ flexDirection: 'row', gap: '16px', alignItems: 'center', padding: '16px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: 'var(--success-light)',
            color: 'var(--success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CheckCircle size={20} />
          </div>
          <div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Active Properties</p>
            <h4 style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '2px' }}>{activeSites}</h4>
          </div>
        </div>

        <div className="card" style={{ flexDirection: 'row', gap: '16px', alignItems: 'center', padding: '16px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: 'var(--danger-light)',
            color: 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldAlert size={20} />
          </div>
          <div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Expired domains</p>
            <h4 style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '2px', color: expiredSites > 0 ? 'var(--danger)' : 'var(--text-primary)' }}>{expiredSites}</h4>
          </div>
        </div>

        <div className="card" style={{ flexDirection: 'row', gap: '16px', alignItems: 'center', padding: '16px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: 'var(--warning-light)',
            color: 'var(--warning)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Clock size={20} />
          </div>
          <div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Renewals Due (30d)</p>
            <h4 style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '2px', color: upcomingRenewals > 0 ? 'var(--warning)' : 'var(--text-primary)' }}>{upcomingRenewals}</h4>
          </div>
        </div>
      </div>

      {/* Main List Card */}
      <div className="card" style={{ padding: '0 0 24px 0', gap: '16px' }}>
        {/* Search and Filters */}
        <div style={{ padding: '24px 24px 0 24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flexGrow: 1 }}>
            <Search size={18} style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '38px' }}
              placeholder="Search websites by name, URL, or customer..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div style={{ width: '180px' }}>
            <select 
              className="form-select" 
              value={statusFilter} 
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{ width: '100%' }}
            >
              <option value="All">All Subscriptions</option>
              <option value="Active">Active / Active Hosting</option>
              <option value="Expired">Expired Subscriptions</option>
              <option value="Inactive">Inactive / Suspended</option>
            </select>
          </div>
        </div>

        {/* Websites List Table */}
        {filteredWebsites.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <Globe size={48} style={{ color: 'var(--text-muted)', marginBottom: '12px', opacity: 0.3 }} />
            <p>No web property records found.</p>
          </div>
        ) : (
          <div className="table-responsive-container" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Website Title</th>
                  <th>Website URL Link</th>
                  <th>Associated Client</th>
                  <th>Subscription Expiry</th>
                  <th>Launch Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedWebsites.map((web) => {
                  const expired = isExpired(web.expiry_date);
                  const soon = isExpiringSoon(web.expiry_date);

                  return (
                    <tr key={web.id}>
                      <td style={{ fontWeight: 600, padding: '16px 8px' }}>
                        {web.website_name}
                      </td>
                      <td>
                        <a 
                          href={web.website_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          style={{ color: 'var(--primary)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <span>{web.website_url.replace(/(^\w+:|^)\/\//, '')}</span>
                          <ExternalLink size={12} />
                        </a>
                      </td>
                      <td style={{ fontWeight: 500 }}>
                        {web.customer_name ? (
                          <div>
                            <div>{web.customer_name}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ID: {web.customer_id_seq}</div>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Independent Setup</span>
                        )}
                      </td>
                      <td>
                        <div>
                          <div style={{ 
                            fontWeight: 600, 
                            color: expired ? 'var(--danger)' : soon ? 'var(--warning)' : 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            {expired && <ShieldAlert size={14} />}
                            {soon && <AlertCircle size={14} />}
                            {formatDateSafe(web.expiry_date)}
                          </div>
                          {expired && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--danger)', fontWeight: 500, marginTop: '2px' }}>
                              Subscription Expired
                            </div>
                          )}
                          {soon && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--warning)', fontWeight: 500, marginTop: '2px' }}>
                              Renewal Due Soon
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                        {formatDateSafe(web.launch_date)}
                      </td>
                      <td>
                        <span className={`badge ${web.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                          {web.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button className="btn btn-outline btn-icon-only" onClick={() => handleOpenEditModal(web)} title="Edit Web Property">
                            <Pencil size={14} />
                          </button>
                          <button className="btn btn-danger btn-icon-only" onClick={() => setDeletingWebsite(web)} title="Delete Record">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {filteredWebsites.length > 0 && (
          <div className="pagination-container">
            <span className="pagination-info">
              Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} entries
            </span>
            <div className="pagination-buttons">
              <button 
                className="btn-pagination" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              >
                Previous
              </button>
              {getPageNumbers().map(page => (
                <button
                  key={page}
                  className={`btn-pagination-number ${currentPage === page ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              <button 
                className="btn-pagination" 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Web Property Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="invoice-modal" style={{ maxWidth: '550px' }} onClick={e => e.stopPropagation()}>
            <div className="invoice-modal-header">
              <h3 style={{ fontWeight: 700, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} style={{ color: 'var(--primary)' }} />
                {editingWebsite ? 'Edit Web Property' : 'Add Web Property'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveWebsite}>
              <div className="invoice-modal-body" style={{ maxHeight: '70vh' }}>
                {formError && (
                  <div style={{ 
                    backgroundColor: 'var(--danger-light)', 
                    color: 'var(--danger)', 
                    padding: '12px', 
                    borderRadius: '8px', 
                    marginBottom: '16px', 
                    fontSize: '0.88rem',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Info size={16} />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="customerId">Associate Client (Customer)</label>
                    <select
                      id="customerId"
                      className="form-select"
                      value={form.customerId}
                      onChange={handleInputChange}
                    >
                      <option value="">Independent (No Client Association)</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.customer_name} ({c.customer_id_seq})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="websiteName">Website Name *</label>
                    <input
                      id="websiteName"
                      type="text"
                      className="form-input"
                      value={form.websiteName}
                      onChange={handleInputChange}
                      placeholder="e.g. Sri Bhavani Packers"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="websiteUrl">Website URL Link *</label>
                    <input
                      id="websiteUrl"
                      type="url"
                      className="form-input"
                      value={form.websiteUrl}
                      onChange={handleInputChange}
                      placeholder="e.g. https://sribhavanipackersandmovers.com/"
                      required
                    />
                  </div>

                  <div className="form-grid" style={{ padding: 0, gap: '16px', gridTemplateColumns: '1fr 1fr' }}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="launchDate">Launch Date</label>
                      <input
                        id="launchDate"
                        type="date"
                        className="form-input"
                        value={form.launchDate}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="expiryDate">Renewal/Expiry Date</label>
                      <input
                        id="expiryDate"
                        type="date"
                        className="form-input"
                        value={form.expiryDate}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="status">Property Status *</label>
                    <select
                      id="status"
                      className="form-select"
                      value={form.status}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="notes">Notes / Server Details</label>
                    <textarea
                      id="notes"
                      className="form-input"
                      rows={3}
                      value={form.notes}
                      onChange={handleInputChange}
                      placeholder="Server hosting info, domain registration details, cPanel login notes..."
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                </div>
              </div>

              <div className="invoice-modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Processing...' : editingWebsite ? 'Save Changes' : 'Register Property'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingWebsite && (
        <div className="modal-backdrop centered" onClick={() => setDeletingWebsite(null)}>
          <div className="invoice-modal centered" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <div className="invoice-modal-header" style={{ borderBottom: 'none' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)' }}>
                <ShieldAlert size={22} />
                Delete Web Property?
              </h3>
            </div>
            <div className="invoice-modal-body" style={{ textAlign: 'center', padding: '0 24px 16px 24px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.5 }}>
                Are you sure you want to delete <strong>{deletingWebsite.website_name}</strong>? This will permanently remove its domain/hosting expiry tracking from the system.
              </p>
            </div>
            <div className="invoice-modal-footer" style={{ borderTop: 'none', justifyContent: 'center', gap: '12px' }}>
              <button className="btn btn-outline" onClick={() => setDeletingWebsite(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDeleteWebsite}>Delete Property</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
