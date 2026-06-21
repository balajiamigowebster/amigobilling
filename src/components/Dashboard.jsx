import React, { useState, useEffect } from 'react';
import { Users, IndianRupee, Briefcase, AlertCircle, Plus, Calendar, Video } from 'lucide-react';

export default function Dashboard({ onNavigate, onPrintInvoice, showToast }) {
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [services, setServices] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : `http://${window.location.hostname}:5000`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch Customers
        const custRes = await fetch(`${API_URL}/api/customers`);
        const custData = await custRes.json();
        setCustomers(custData);

        // 2. Fetch Invoices
        const invoicesRes = await fetch(`${API_URL}/api/invoices`);
        const invoicesData = await invoicesRes.json();
        setInvoices(invoicesData);

        // 3. Fetch Services
        const servicesRes = await fetch(`${API_URL}/api/services`);
        const servicesData = await servicesRes.json();
        setServices(servicesData);

        // 4. Fetch Today's Meetings
        const today = new Date().toISOString().slice(0, 10);
        const meetRes = await fetch(`${API_URL}/api/meetings?date=${today}`);
        const meetData = await meetRes.json();
        setMeetings(meetData);

      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Summary Metrics
  const totalCustomers = customers.length;
  
  const today = new Date().toISOString().slice(0, 10);
  const todayRevenue = invoices
    .filter(inv => inv.invoice_date.slice(0, 10) === today && inv.status === 'Paid')
    .reduce((sum, inv) => sum + parseFloat(inv.amount), 0);

  const servicesOfferedCount = services.length;

  const pendingPayments = invoices
    .filter(inv => inv.status !== 'Paid')
    .reduce((sum, inv) => sum + parseFloat(inv.amount), 0);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Loading Dashboard metrics...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Welcome Back, Arjun</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Here is the summary of your digital agency operations today.</p>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="card" style={{ flexDirection: 'row', gap: '16px', alignItems: 'center', padding: '20px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Users size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Active Clients</p>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '2px' }}>{totalCustomers}</h3>
          </div>
        </div>

        <div className="card" style={{ flexDirection: 'row', gap: '16px', alignItems: 'center', padding: '20px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'var(--success-light)',
            color: 'var(--success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <IndianRupee size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Today's Revenue</p>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '2px' }}>₹{todayRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          </div>
        </div>

        <div className="card" style={{ flexDirection: 'row', gap: '16px', alignItems: 'center', padding: '20px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'hsl(190, 80%, 94%)',
            color: 'var(--secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Briefcase size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Services Catalog</p>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '2px' }}>{servicesOfferedCount}</h3>
          </div>
        </div>

        <div className="card" style={{ flexDirection: 'row', gap: '16px', alignItems: 'center', padding: '20px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'var(--warning-light)',
            color: 'var(--warning)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AlertCircle size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Pending Payments</p>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '2px' }}>₹{pendingPayments.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* Left Side: Recent Customers */}
        <div className="card" style={{ gap: '16px' }}>
          <div className="card-header-flex">
            <div>
              <h3 className="card-title">Recent Customer Accounts</h3>
              <p className="card-subtitle">List of newly registered corporate client accounts.</p>
            </div>
            <button className="btn btn-primary" onClick={() => onNavigate('customer-list')} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              <Plus size={16} /> Add Customer
            </button>
          </div>

          {customers.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <Users size={40} style={{ opacity: .3 }} />
              <p>No customer records registered yet.</p>
            </div>
          ) : (
            <div className="table-responsive-container" style={{ border: 'none' }}>
              <table>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    <th style={{ padding: '12px 8px', fontWeight: 600 }}>ID</th>
                    <th style={{ padding: '12px 8px', fontWeight: 600 }}>Company / Client</th>
                    <th style={{ padding: '12px 8px', fontWeight: 600 }}>Mobile</th>
                    <th style={{ padding: '12px 8px', fontWeight: 600 }}>City</th>
                    <th style={{ padding: '12px 8px', fontWeight: 600 }}>Project Scope Brief</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.slice(0, 5).map((customer) => (
                    <tr key={customer.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      <td style={{ padding: '12px 8px', fontWeight: 600, color: 'var(--primary)' }}>{customer.customer_id_seq}</td>
                      <td style={{ padding: '12px 8px', fontWeight: 500 }}>{customer.customer_name}</td>
                      <td style={{ padding: '12px 8px' }}>{customer.mobile_number}</td>
                      <td style={{ padding: '12px 8px' }}>{customer.city || '—'}</td>
                      <td style={{
                        padding: '12px 8px',
                        color: 'var(--text-secondary)',
                        maxWidth: '200px',
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

        {/* Right Side: Today's Meetings */}
        <div className="card" style={{ gap: '16px' }}>
          <div className="card-header-flex">
            <div>
              <h3 className="card-title">Today's Consultations</h3>
              <p className="card-subtitle">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
            </div>
            <button className="btn btn-secondary" onClick={() => onNavigate('meetings')} style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
              <Calendar size={14} /> Schedule
            </button>
          </div>

          {meetings.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', border: '1.5px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>
              <Video size={36} style={{ opacity: .3, color: 'var(--primary)' }} />
              <p style={{ fontSize: '0.85rem' }}>No client meetings scheduled today.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {meetings.map((meet) => (
                <div key={meet.id} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary-light)',
                  borderLeft: '4px solid var(--primary)',
                  gap: '4px'
                }}>
                  <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{meet.customer_name}</span>
                    <span style={{ fontSize: '0.78rem', backgroundColor: 'var(--bg-card)', padding: '2px 8px', borderRadius: '50px', fontWeight: 600, color: 'var(--primary)' }}>
                      {meet.meeting_time}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Agenda: {meet.agenda}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>Lead: {meet.lead_name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
