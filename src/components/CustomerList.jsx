import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, AlertCircle, Sparkles, X } from 'lucide-react';

export default function CustomerList({ onNavigate, openRegisterModal, onCloseRegisterModal, onSaveSuccess }) {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [leads, setLeads] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [nextCustomerId, setNextCustomerId] = useState('');
  
  // Registration Form State
  const [form, setForm] = useState({
    customerName: '',
    mobileNumber: '',
    email: '',
    pincode: '',
    city: '',
    address: '',
    assignedLead: '',
    projectBrief: ''
  });
  
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : (window.location.hostname.includes('192.168.') || window.location.hostname.includes('10.') || window.location.hostname.includes('172.'))
      ? `http://${window.location.hostname}:5000`
      : '';

  useEffect(() => {
    fetchCustomers();
    fetchLeads();
    if (openRegisterModal) {
      handleOpenAddModal();
    }
  }, [openRegisterModal]);

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/customers`);
      const data = await res.json();
      setCustomers(data);
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  const fetchLeads = async () => {
    try {
      const res = await fetch(`${API_URL}/api/leads`);
      const data = await res.json();
      setLeads(data);
      if (data.length > 0) {
        setForm(f => ({ ...f, assignedLead: data[0].lead_name }));
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
    }
  };

  const handleOpenAddModal = async () => {
    setForm({
      customerName: '',
      mobileNumber: '',
      email: '',
      pincode: '',
      city: '',
      address: '',
      assignedLead: leads.length > 0 ? leads[0].lead_name : 'Arjun Sharma',
      projectBrief: ''
    });
    setFormError('');
    setShowAddModal(true);

    try {
      const res = await fetch(`${API_URL}/api/customers/next-id`);
      const data = await res.json();
      setNextCustomerId(data.nextId);
    } catch (err) {
      console.error('Error getting next customer ID:', err);
      setNextCustomerId('C-101');
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    if (onCloseRegisterModal) {
      onCloseRegisterModal();
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setForm(f => ({ ...f, [id]: value }));
  };

  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    if (!form.customerName || !form.mobileNumber) {
      setFormError('Customer Name and Mobile Number are required.');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      const res = await fetch(`${API_URL}/api/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerIdSeq: nextCustomerId,
          ...form
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to register customer.');
      }

      handleCloseModal();
      fetchCustomers();
      if (onSaveSuccess) {
        onSaveSuccess('Customer added successfully!');
      }
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Filter customers
  const filteredCustomers = customers.filter(customer => {
    const query = search.toLowerCase();
    const name = customer.customer_name || '';
    const idSeq = customer.customer_id_seq || '';
    const mobile = customer.mobile_number || '';
    const city = customer.city || '';
    return (
      name.toLowerCase().includes(query) ||
      idSeq.toLowerCase().includes(query) ||
      mobile.includes(query) ||
      city.toLowerCase().includes(query)
    );
  });

  return (
    <div>
      <div className="card-header-flex" style={{ marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Customer Accounts</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage corporate clients, active customers, and project details.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          <Plus size={18} /> Add Customer
        </button>
      </div>

      <div className="card" style={{ padding: '0 0 24px 0', gap: '16px' }}>
        {/* Search Bar */}
        <div style={{ padding: '24px 24px 0 24px', display: 'flex', gap: '16px' }}>
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
              placeholder="Search by customer name, mobile, ID, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Customer Table */}
        {filteredCustomers.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p>No customer records found.</p>
          </div>
        ) : (
          <div className="table-responsive-container" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Customer ID</th>
                  <th>Customer Name</th>
                  <th>Mobile Number</th>
                  <th>Email</th>
                  <th>City</th>
                  <th>Project Lead</th>
                  <th>Project Brief / Req</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{customer.customer_id_seq}</td>
                    <td style={{ fontWeight: 600 }}>{customer.customer_name}</td>
                    <td>{customer.mobile_number}</td>
                    <td>{customer.email || '—'}</td>
                    <td>{customer.city || '—'}</td>
                    <td style={{ fontSize: '0.85rem', fontWeight: 500 }}>{customer.assigned_lead}</td>
                    <td style={{
                      color: 'var(--text-secondary)',
                      maxWidth: '220px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }} title={customer.project_brief}>
                      {customer.project_brief || 'No details recorded'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={handleCloseModal}>
          <div className="invoice-modal" style={{ maxWidth: '650px' }} onClick={e => e.stopPropagation()}>
            <div className="invoice-modal-header">
              <h3 style={{ fontWeight: 700, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} style={{ color: 'var(--primary)' }} />
                Add Customer Account
              </h3>
              <button onClick={handleCloseModal} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveCustomer}>
              <div className="invoice-modal-body" style={{ maxHeight: '70vh' }}>
                {formError && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: 'var(--danger-light)',
                    color: 'var(--danger)',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.85rem',
                    marginBottom: '16px'
                  }}>
                    <AlertCircle size={16} />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="form-grid" style={{ marginBottom: '16px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="customerIdSeq">Customer ID (Auto)</label>
                    <input
                      id="customerIdSeq"
                      type="text"
                      className="form-input"
                      value={nextCustomerId}
                      disabled
                      readOnly
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="customerName">Customer Name *</label>
                    <input
                      id="customerName"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Dharma Productions"
                      value={form.customerName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-grid" style={{ marginBottom: '16px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="mobileNumber">Mobile Number *</label>
                    <input
                      id="mobileNumber"
                      type="tel"
                      className="form-input"
                      placeholder="Enter mobile number"
                      value={form.mobileNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="email">Email Address</label>
                    <input
                      id="email"
                      type="email"
                      className="form-input"
                      placeholder="client@company.com"
                      value={form.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-grid" style={{ marginBottom: '16px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="assignedLead">Assigned Project Lead</label>
                    <select
                      id="assignedLead"
                      className="form-select"
                      value={form.assignedLead}
                      onChange={handleInputChange}
                    >
                      {leads.map(l => (
                        <option key={l.id} value={l.lead_name}>{l.lead_name} ({l.role})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-grid" style={{ gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="city">City</label>
                      <input
                        id="city"
                        type="text"
                        className="form-input"
                        placeholder="e.g. Bangalore"
                        value={form.city}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="pincode">Pincode</label>
                      <input
                        id="pincode"
                        type="text"
                        className="form-input"
                        placeholder="560001"
                        value={form.pincode}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label" htmlFor="address">Billing Address</label>
                  <textarea
                    id="address"
                    className="form-textarea"
                    rows="2"
                    placeholder="Enter company billing address"
                    value={form.address}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="projectBrief">Project Requirements / Brief</label>
                  <textarea
                    id="projectBrief"
                    className="form-textarea"
                    rows="4"
                    placeholder="Describe main project requirements, technologies needed, scope..."
                    value={form.projectBrief}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="invoice-modal-footer">
                <button type="button" className="btn btn-outline" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Add Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
