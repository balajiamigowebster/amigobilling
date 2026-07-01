import React, { useState, useEffect } from 'react';
import { Users, IndianRupee, Briefcase, AlertCircle, Plus, Calendar, Video } from 'lucide-react';
import { API_URL } from '../config';

export default function Dashboard({ onNavigate, onPrintInvoice, showToast }) {
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [services, setServices] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch Customers
        const custRes = await fetch(`${API_URL}/api/customers`);
        const custData = await custRes.json();
        if (custRes.ok && Array.isArray(custData)) {
          setCustomers(custData);
        }

        // 2. Fetch Invoices
        const invoicesRes = await fetch(`${API_URL}/api/invoices`);
        const invoicesData = await invoicesRes.json();
        if (invoicesRes.ok && Array.isArray(invoicesData)) {
          setInvoices(invoicesData);
        }

        // 3. Fetch Services
        const servicesRes = await fetch(`${API_URL}/api/services`);
        const servicesData = await servicesRes.json();
        if (servicesRes.ok && Array.isArray(servicesData)) {
          setServices(servicesData);
        }

        // 4. Fetch Today's Meetings
        const todayStr = new Date().toLocaleDateString('sv');
        const meetRes = await fetch(`${API_URL}/api/meetings?date=${todayStr}`);
        const meetData = await meetRes.json();
        if (meetRes.ok && Array.isArray(meetData)) {
          setMeetings(meetData);
        }

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
  
  const parseLocalDate = (dateStr) => {
    if (!dateStr) return { year: 0, month: 0, day: 0 };
    if (dateStr.includes('T')) {
      const d = new Date(dateStr);
      return {
        year: d.getFullYear(),
        month: d.getMonth(),
        day: d.getDate()
      };
    } else {
      const cleanStr = dateStr.slice(0, 10);
      const parts = cleanStr.split('-');
      return {
        year: parseInt(parts[0], 10),
        month: parseInt(parts[1], 10) - 1, // 0-indexed
        day: parseInt(parts[2], 10)
      };
    }
  };

  const today = new Date().toLocaleDateString('sv');
  const todayRevenue = invoices
    .filter(inv => {
      const { year, month, day } = parseLocalDate(inv.invoice_date);
      const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return formattedDate === today && inv.status === 'Paid';
    })
    .reduce((sum, inv) => sum + parseFloat(inv.amount), 0);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const monthRevenue = invoices
    .filter(inv => {
      const { year, month } = parseLocalDate(inv.invoice_date);
      return year === currentYear && month === currentMonth && inv.status === 'Paid';
    })
    .reduce((sum, inv) => sum + parseFloat(inv.amount), 0);

  const yearRevenue = invoices
    .filter(inv => {
      const { year } = parseLocalDate(inv.invoice_date);
      return year === currentYear && inv.status === 'Paid';
    })
    .reduce((sum, inv) => sum + parseFloat(inv.amount), 0);

  const servicesOfferedCount = services.length;

  const pendingPayments = invoices
    .filter(inv => inv.status !== 'Paid')
    .reduce((sum, inv) => sum + parseFloat(inv.amount), 0);

  // --- CHART CALCULATIONS ---
  const monthsData = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(currentYear, i, 1);
    return {
      month: i,
      label: d.toLocaleString('en-US', { month: 'short' }),
      revenue: 0
    };
  });

  invoices.forEach(inv => {
    const { year, month } = parseLocalDate(inv.invoice_date);
    if (year === currentYear && inv.status === 'Paid') {
      monthsData[month].revenue += parseFloat(inv.amount);
    }
  });

  const maxRevenue = Math.max(...monthsData.map(m => m.revenue));
  const scaleMax = maxRevenue > 0 ? maxRevenue * 1.15 : 10000;

  // Chart layout dimensions
  const width = 800;
  const height = 220;
  const paddingLeft = 55;
  const paddingRight = 15;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const points = monthsData.map((d, i) => {
    const x = paddingLeft + (i / 11) * chartWidth;
    const y = paddingTop + chartHeight - (d.revenue / scaleMax) * chartHeight;
    return { x, y, label: d.label, revenue: d.revenue };
  });

  const getBezierPath = (pts) => {
    if (pts.length === 0) return '';
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const curr = pts[i];
      const next = pts[i + 1];
      const cp1x = curr.x + (next.x - curr.x) / 3;
      const cp1y = curr.y;
      const cp2x = curr.x + 2 * (next.x - curr.x) / 3;
      const cp2y = next.y;
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
    }
    return path;
  };

  const linePath = getBezierPath(points);
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`
    : '';

  const yTicks = [0, 0.25, 0.5, 0.75, 1];

  const formatYLabel = (val) => {
    if (val === 0) return '₹0';
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
    return `₹${val.toFixed(0)}`;
  };

  const animationStyle = `
    @keyframes drawPath {
      from {
        stroke-dashoffset: 1200;
      }
      to {
        stroke-dashoffset: 0;
      }
    }
    @keyframes fadeInArea {
      from {
        opacity: 0;
      }
      to {
        opacity: 0.8;
      }
    }
    .chart-line {
      stroke-dasharray: 1200;
      stroke-dashoffset: 1200;
      animation: drawPath 1.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }
    .chart-area {
      opacity: 0;
      animation: fadeInArea 1s ease-out 1.2s forwards;
    }
  `;

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
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Welcome Back, Balaji Nagarajan</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Here is the summary of your digital agency operations today.</p>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid">
        {/* Today's Revenue */}
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

        {/* Month's Revenue */}
        <div className="card" style={{ flexDirection: 'row', gap: '16px', alignItems: 'center', padding: '20px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'hsl(215, 80%, 95%)',
            color: 'hsl(215, 80%, 45%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <IndianRupee size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Month's Revenue</p>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '2px' }}>₹{monthRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          </div>
        </div>

        {/* Year's Revenue */}
        <div className="card" style={{ flexDirection: 'row', gap: '16px', alignItems: 'center', padding: '20px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'hsl(325, 80%, 95%)',
            color: 'hsl(325, 80%, 45%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <IndianRupee size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Year's Revenue</p>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '2px' }}>₹{yearRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          </div>
        </div>

        {/* Pending Payments */}
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

        {/* Active Clients */}
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

        {/* Services Catalog */}
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
      </div>

      {/* Yearly Revenue Trend Curve Chart */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px', position: 'relative' }}>
        <style dangerouslySetInnerHTML={{ __html: animationStyle }} />
        <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 className="card-title" style={{ fontSize: '1.1rem', fontWeight: 700 }}>Yearly Revenue Trend ({currentYear})</h3>
            <p className="card-subtitle">Monthly breakdown of agency billing and closed invoices.</p>
          </div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '0.82rem', fontWeight: 600 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: 'var(--primary)' }}></span>
              <span style={{ color: 'var(--text-secondary)' }}>Paid Revenue</span>
            </div>
          </div>
        </div>

        <div style={{ position: 'relative', width: '100%' }}>
          <svg viewBox="0 0 800 220" width="100%" height="auto" style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.00" />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines */}
            {yTicks.map((tick, idx) => {
              const y = paddingTop + chartHeight - tick * chartHeight;
              return (
                <g key={idx}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={width - paddingRight}
                    y2={y}
                    stroke="hsl(220, 15%, 93%)"
                    strokeWidth={1}
                  />
                  <text
                    x={paddingLeft - 12}
                    y={y + 4}
                    textAnchor="end"
                    style={{ fontSize: '0.72rem', fill: 'var(--text-muted)', fontWeight: 600 }}
                  >
                    {formatYLabel(tick * scaleMax)}
                  </text>
                </g>
              );
            })}

            {/* Area Path */}
            {areaPath && (
              <path
                d={areaPath}
                fill="url(#chartGradient)"
                className="chart-area"
              />
            )}

            {/* Curve Line Path */}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke="var(--primary)"
                strokeWidth={3}
                strokeLinecap="round"
                className="chart-line"
              />
            )}

            {/* Interactive Dots for Data Points */}
            {points.map((pt, idx) => (
              <circle
                key={idx}
                cx={pt.x}
                cy={pt.y}
                r={4}
                fill="var(--bg-card)"
                stroke="var(--primary)"
                strokeWidth={2.5}
                className="chart-dot"
                style={{
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
              />
            ))}

            {/* X-Axis Labels */}
            {points.map((pt, idx) => (
              <text
                key={idx}
                x={pt.x}
                y={height - 5}
                textAnchor="middle"
                style={{ fontSize: '0.75rem', fill: 'var(--text-secondary)', fontWeight: 600 }}
              >
                {pt.label}
              </text>
            ))}

            {/* Vertical guidelines on hover */}
            {hoveredIndex !== null && (
              <line
                x1={points[hoveredIndex].x}
                y1={paddingTop}
                x2={points[hoveredIndex].x}
                y2={paddingTop + chartHeight}
                stroke="var(--primary)"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                opacity={0.4}
              />
            )}

            {/* Hover overlay hitboxes */}
            {points.map((pt, i) => (
              <rect
                key={i}
                x={pt.x - chartWidth / 22}
                y={paddingTop}
                width={chartWidth / 11}
                height={chartHeight}
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            ))}
          </svg>

          {/* Interactive Tooltip */}
          {hoveredIndex !== null && (
            <div
              style={{
                position: 'absolute',
                left: `${(points[hoveredIndex].x / width) * 100}%`,
                top: `${points[hoveredIndex].y - 65}px`,
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(8px)',
                border: '1px solid var(--border-color)',
                padding: '8px 12px',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-md)',
                pointerEvents: 'none',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                alignItems: 'center',
                transition: 'left 0.1s ease, top 0.1s ease'
              }}
            >
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                {points[hoveredIndex].label} {currentYear}
              </span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                ₹{points[hoveredIndex].revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
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
