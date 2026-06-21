import React, { useState, useEffect } from 'react';
import { Plus, Search, Printer, Pencil, Trash2, Sparkles, AlertCircle, ShieldAlert, X } from 'lucide-react';
import { API_URL } from '../config';

export default function Billing({ onNavigate, onPrintInvoice, showToast }) {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Invoice Create/Edit State
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [nextInvoiceNo, setNextInvoiceNo] = useState('');
  
  // Form State
  const [form, setForm] = useState({
    invoiceNo: '',
    patientId: '', // Maps to customer ID
    treatmentName: '', // Maps to service name (summary)
    amount: '0',
    advancePaid: '0', // Advance paid field
    status: 'Paid',
    invoiceDate: new Date().toLocaleDateString('sv'),
    gstRate: '18'
  });

  const [items, setItems] = useState([
    { title: '', description: '', rate: '', qty: 1, amount: 0 }
  ]);
  
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete State
  const [deletingInvoice, setDeletingInvoice] = useState(null);


  useEffect(() => {
    fetchInvoices();
    fetchCustomersAndServices();
  }, []);

  // Update total invoice amount when items change
  useEffect(() => {
    const total = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    setForm(f => ({ ...f, amount: total.toString() }));
  }, [items]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/invoices`);
      const data = await res.json();
      setInvoices(data);
    } catch (err) {
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomersAndServices = async () => {
    try {
      const custRes = await fetch(`${API_URL}/api/customers`);
      const custData = await custRes.json();
      setCustomers(custData);

      const servRes = await fetch(`${API_URL}/api/services`);
      const servData = await servRes.json();
      setServices(servData);
      
      if (custData.length > 0) {
        setForm(f => ({ ...f, patientId: custData[0].id }));
      }
      
      if (servData.length > 0) {
        setItems([
          { title: servData[0].service_name, description: '', rate: servData[0].cost.toString(), qty: 1, amount: servData[0].cost }
        ]);
      }
    } catch (err) {
      console.error('Error fetching lists:', err);
    }
  };

  const handleOpenAddModal = async () => {
    setEditingInvoice(null);
    const defaultItem = services.length > 0
      ? { title: services[0].service_name, description: '', rate: services[0].cost.toString(), qty: 1, amount: services[0].cost }
      : { title: '', description: '', rate: '', qty: 1, amount: 0 };

    setForm({
      invoiceNo: '',
      patientId: customers.length > 0 ? customers[0].id : '',
      treatmentName: '',
      amount: defaultItem.amount.toString(),
      advancePaid: '0',
      status: 'Paid',
      invoiceDate: new Date().toLocaleDateString('sv'),
      gstRate: '18'
    });
    setItems([defaultItem]);
    setFormError('');
    setShowModal(true);

    try {
      const res = await fetch(`${API_URL}/api/invoices/next-no`);
      const data = await res.json();
      setNextInvoiceNo(data.nextNo);
      setForm(f => ({ ...f, invoiceNo: data.nextNo }));
    } catch (err) {
      console.error('Error getting next invoice no:', err);
      setNextInvoiceNo('INV-1001');
      setForm(f => ({ ...f, invoiceNo: 'INV-1001' }));
    }
  };

  const handleOpenEditModal = (invoice) => {
    setEditingInvoice(invoice);
    const matchCust = customers.find(c => c.customer_id_seq === invoice.customer_id_seq);
    
    let parsedItems = [];
    try {
      parsedItems = typeof invoice.items === 'string' ? JSON.parse(invoice.items) : invoice.items;
      if (!Array.isArray(parsedItems)) parsedItems = [];
    } catch (e) {
      parsedItems = [];
    }

    if (parsedItems.length === 0) {
      parsedItems = [
        {
          title: invoice.service_name || '',
          description: '',
          rate: invoice.amount.toString(),
          qty: 1,
          amount: parseFloat(invoice.amount)
        }
      ];
    }

    setForm({
      invoiceNo: invoice.invoice_no,
      patientId: matchCust ? matchCust.id : '',
      treatmentName: invoice.service_name,
      amount: invoice.amount.toString(),
      advancePaid: (invoice.advance_paid || 0).toString(),
      status: invoice.status,
      invoiceDate: invoice.invoice_date.slice(0, 10),
      gstRate: (invoice.gst_rate !== undefined ? invoice.gst_rate : 18).toString()
    });
    setItems(parsedItems);
    setFormError('');
    setShowModal(true);
  };

  const addRow = () => {
    setItems([...items, { title: '', description: '', rate: '', qty: 1, amount: 0 }]);
  };

  const removeRow = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, idx) => idx !== index));
    } else {
      setItems([{ title: '', description: '', rate: '', qty: 1, amount: 0 }]);
    }
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;

    if (field === 'title') {
      const match = services.find(s => s.service_name === value);
      if (match) {
        updated[index].rate = match.cost.toString();
        updated[index].amount = match.cost * (parseInt(updated[index].qty, 10) || 1);
      }
    } else if (field === 'rate' || field === 'qty') {
      const rate = parseFloat(updated[index].rate) || 0;
      const qty = parseInt(updated[index].qty, 10) || 0;
      updated[index].amount = rate * qty;
    }
    setItems(updated);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setForm(f => ({ ...f, [id]: value }));
  };

  const handleSaveInvoice = async (e) => {
    e.preventDefault();
    if (!form.patientId || items.some(item => !item.title || !item.rate) || !form.invoiceDate) {
      setFormError('Customer, Date, and all Product Titles/Rates are required.');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      const payload = {
        ...form,
        items
      };

      let res;
      if (editingInvoice) {
        res = await fetch(`${API_URL}/api/invoices/${editingInvoice.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`${API_URL}/api/invoices`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save invoice.');
      }

      setShowModal(false);
      fetchInvoices();
      if (showToast) {
        showToast(
          editingInvoice ? 'Invoice updated successfully!' : 'Invoice generated successfully!',
          'success'
        );
      }
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingInvoice) return;

    try {
      const res = await fetch(`${API_URL}/api/invoices/${deletingInvoice.id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        throw new Error('Failed to delete invoice.');
      }

      setDeletingInvoice(null);
      fetchInvoices();
      if (showToast) {
        showToast('Invoice deleted successfully.', 'success');
      }
    } catch (err) {
      console.error(err);
      if (showToast) {
        showToast('Could not delete invoice record.', 'error');
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    if (status === 'Paid') return 'badge badge-success';
    if (status === 'Pending') return 'badge badge-warning';
    return 'badge badge-danger';
  };

  const filteredInvoices = invoices.filter(inv => {
    const query = search.toLowerCase();
    const invNo = inv.invoice_no || '';
    const name = inv.customer_name || '';
    const service = inv.service_name || '';
    const status = inv.status || '';
    return (
      invNo.toLowerCase().includes(query) ||
      name.toLowerCase().includes(query) ||
      service.toLowerCase().includes(query) ||
      status.toLowerCase().includes(query)
    );
  });

  return (
    <div>
      <div className="card-header-flex" style={{ marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Billing & Invoices</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Track accounts receivables, client invoices, and billing history.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          <Plus size={18} /> Create Invoice
        </button>
      </div>

      <div className="card" style={{ padding: '0 0 24px 0', gap: '16px' }}>
        {/* Search */}
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
              placeholder="Search invoices by invoice number, company name, service description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Invoice list */}
        {loading ? (
          <p style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>Loading billing records...</p>
        ) : filteredInvoices.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>No billing records found.</p>
        ) : (
          <div className="table-responsive-container" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Invoice No</th>
                  <th>Customer ID</th>
                  <th>Company / Client</th>
                  <th>Service Description</th>
                  <th>Amount (INR)</th>
                  <th>Invoice Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{inv.invoice_no}</td>
                    <td style={{ fontWeight: 600 }}>{inv.customer_id_seq}</td>
                    <td style={{ fontWeight: 600 }}>{inv.customer_name}</td>
                    <td>{inv.service_name}</td>
                    <td style={{ fontWeight: 700 }}>₹{parseFloat(inv.amount).toFixed(2)}</td>
                    <td>{new Date(inv.invoice_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td>
                      <span className={getStatusBadgeClass(inv.status)}>{inv.status}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary btn-icon-only" onClick={() => onPrintInvoice(inv)} title="Print Invoice Receipt">
                          <Printer size={14} />
                        </button>
                        <button className="btn btn-outline btn-icon-only" onClick={() => handleOpenEditModal(inv)} title="Edit Details">
                          <Pencil size={14} />
                        </button>
                        <button className="btn btn-danger btn-icon-only" onClick={() => setDeletingInvoice(inv)} title="Delete Record">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Form Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="invoice-modal" style={{ maxWidth: '750px' }} onClick={e => e.stopPropagation()}>
            <div className="invoice-modal-header">
              <h3 style={{ fontWeight: 700, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} style={{ color: 'var(--primary)' }} />
                {editingInvoice ? 'Modify Invoice Record' : 'Generate Project Invoice'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveInvoice} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <div className="invoice-modal-body">
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
                    <label className="form-label" htmlFor="invoiceNo">Invoice No (Auto)</label>
                    <input
                      id="invoiceNo"
                      type="text"
                      className="form-input"
                      value={form.invoiceNo}
                      disabled
                      readOnly
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="invoiceDate">Invoice Date *</label>
                    <input
                      id="invoiceDate"
                      type="date"
                      className="form-input"
                      value={form.invoiceDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label" htmlFor="patientId">Select Customer / Corporate Client *</label>
                  {editingInvoice ? (
                    <input
                      type="text"
                      className="form-input"
                      value={`${editingInvoice.customer_name} (${editingInvoice.customer_id_seq})`}
                      disabled
                      readOnly
                    />
                  ) : (
                    <select
                      id="patientId"
                      className="form-select"
                      value={form.patientId}
                      onChange={handleInputChange}
                      required
                    >
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.customer_name} ({c.customer_id_seq})</option>
                      ))}
                    </select>
                  )}
                  {customers.length === 0 && !editingInvoice && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '4px' }}>
                      No customers registered yet. Add a customer account first.
                    </span>
                  )}
                </div>

                {/* Products Grid */}
                <div style={{ marginTop: '24px', marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>Products / Services</h4>
                  
                  <div className="table-responsive-container" style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflowX: 'auto', marginBottom: '12px' }}>
                    <table style={{ width: '100%', minWidth: '600px' }}>
                      <thead>
                        <tr>
                          <th style={{ width: '25%', padding: '10px' }}>Title</th>
                          <th style={{ width: '35%', padding: '10px' }}>Description</th>
                          <th style={{ width: '15%', padding: '10px', textAlign: 'right' }}>Rate</th>
                          <th style={{ width: '10%', padding: '10px', textAlign: 'center' }}>Qty</th>
                          <th style={{ width: '15%', padding: '10px', textAlign: 'right' }}>Amount</th>
                          <th style={{ width: '5%', padding: '10px', textAlign: 'center' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, index) => (
                          <tr key={index}>
                            <td style={{ padding: '8px', verticalAlign: 'top' }}>
                              <input
                                type="text"
                                className="form-input"
                                placeholder="Service Title"
                                value={item.title}
                                onChange={e => handleItemChange(index, 'title', e.target.value)}
                                list="services-list"
                                required
                                style={{ padding: '8px 10px', fontSize: '0.85rem' }}
                              />
                              <datalist id="services-list">
                                {services.map(s => (
                                  <option key={s.id} value={s.service_name} />
                                ))}
                              </datalist>
                            </td>
                            <td style={{ padding: '8px', verticalAlign: 'top' }}>
                              <textarea
                                className="form-textarea"
                                placeholder="Description of deliverables..."
                                value={item.description}
                                onChange={e => handleItemChange(index, 'description', e.target.value)}
                                rows={2}
                                style={{ padding: '8px 10px', fontSize: '0.85rem', resize: 'vertical', minHeight: '60px' }}
                              />
                            </td>
                            <td style={{ padding: '8px', verticalAlign: 'top' }}>
                              <input
                                type="number"
                                className="form-input"
                                placeholder="0"
                                value={item.rate}
                                onChange={e => handleItemChange(index, 'rate', e.target.value)}
                                required
                                style={{ padding: '8px 10px', fontSize: '0.85rem', textAlign: 'right' }}
                              />
                            </td>
                            <td style={{ padding: '8px', verticalAlign: 'top' }}>
                              <input
                                type="number"
                                className="form-input"
                                placeholder="1"
                                min="1"
                                value={item.qty}
                                onChange={e => handleItemChange(index, 'qty', e.target.value)}
                                required
                                style={{ padding: '8px 10px', fontSize: '0.85rem', textAlign: 'center' }}
                              />
                            </td>
                            <td style={{ padding: '8px', verticalAlign: 'top', textAlign: 'right', fontWeight: '600', fontSize: '0.88rem', paddingTop: '16px' }}>
                              ₹{(parseFloat(item.amount) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td style={{ padding: '8px', verticalAlign: 'middle', textAlign: 'center' }}>
                              <button
                                type="button"
                                className="btn btn-danger btn-icon-only"
                                onClick={() => removeRow(index)}
                                style={{ width: '32px', height: '32px', padding: 0 }}
                                title="Remove Item"
                              >
                                <X size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={addRow}
                    style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Plus size={16} /> Add Product
                  </button>
                </div>

                <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="amount">Sub Total (INR)</label>
                    <input
                      id="amount"
                      type="number"
                      className="form-input"
                      value={form.amount}
                      disabled
                      readOnly
                      style={{ fontWeight: '700', backgroundColor: 'var(--bg-primary)' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="gstRate">GST Rate (%)</label>
                    <input
                      id="gstRate"
                      type="number"
                      className="form-input"
                      value={form.gstRate}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      placeholder="18"
                      style={{ fontWeight: '600' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">GST Amount (INR)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={(parseFloat(form.amount || 0) * (parseFloat(form.gstRate || 0) / 100)).toFixed(2)}
                      disabled
                      readOnly
                      style={{ fontWeight: '600', backgroundColor: 'var(--bg-primary)' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Grand Total (INR)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={(parseFloat(form.amount || 0) * (1 + parseFloat(form.gstRate || 0) / 100)).toFixed(2)}
                      disabled
                      readOnly
                      style={{ fontWeight: '700', backgroundColor: 'var(--bg-primary)' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="advancePaid">Advance Paid (INR)</label>
                    <input
                      id="advancePaid"
                      type="number"
                      className="form-input"
                      value={form.advancePaid}
                      onChange={handleInputChange}
                      placeholder="0"
                      style={{ fontWeight: '600' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Balance Due (INR)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={(parseFloat(form.amount || 0) * (1 + parseFloat(form.gstRate || 0) / 100) - parseFloat(form.advancePaid || 0)).toFixed(2)}
                      disabled
                      readOnly
                      style={{ 
                        fontWeight: '700', 
                        backgroundColor: 'var(--bg-primary)', 
                        color: (parseFloat(form.amount || 0) * (1 + parseFloat(form.gstRate || 0) / 100) - parseFloat(form.advancePaid || 0)) > 0 ? 'var(--warning)' : 'var(--success)'
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="status">Payment Status *</label>
                    <select
                      id="status"
                      className="form-select"
                      value={form.status}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Paid">Paid</option>
                      <option value="Unpaid">Unpaid</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="invoice-modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving || (customers.length === 0 && !editingInvoice)}>
                  {saving ? 'Processing...' : 'Generate Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingInvoice && (
        <div className="modal-backdrop centered" onClick={() => setDeletingInvoice(null)}>
          <div className="invoice-modal centered" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <div className="invoice-modal-header" style={{ borderBottom: 'none' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)' }}>
                <ShieldAlert size={22} />
                Delete Invoice Record?
              </h3>
            </div>
            <div className="invoice-modal-body" style={{ padding: '0 24px 20px 24px', minHeight: 'auto' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Are you sure you want to delete invoice record <strong>{deletingInvoice.invoice_no}</strong> for {deletingInvoice.customer_name}? This action cannot be undone.
              </p>
            </div>
            <div className="invoice-modal-footer" style={{ borderTop: 'none' }}>
              <button type="button" className="btn btn-outline" onClick={() => setDeletingInvoice(null)}>Cancel</button>
              <button type="button" className="btn btn-danger" onClick={handleDeleteConfirm}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
