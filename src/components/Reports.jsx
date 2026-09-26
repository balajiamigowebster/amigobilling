import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  IndianRupee, 
  Calendar, 
  FileSpreadsheet, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowUpRight, 
  BarChart3, 
  PieChart, 
  Users, 
  ChevronDown,
  Layers,
  ArrowRight
} from 'lucide-react';
import { API_URL } from '../config';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export default function Reports({ onNavigate }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentRealYear = new Date().getFullYear();
  const currentRealMonth = new Date().getMonth(); // 0-indexed (8 = Sept)

  const [selectedYear, setSelectedYear] = useState(currentRealYear);
  const [selectedMonth, setSelectedMonth] = useState(currentRealMonth); // 0-11 or 'all'
  const [hoveredBarIndex, setHoveredBarIndex] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/api/invoices`);
      if (!res.ok) throw new Error('Failed to load invoice records');
      const data = await res.json();
      if (Array.isArray(data)) {
        setInvoices(data);
      }
    } catch (err) {
      console.error('Error fetching invoices in Reports:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper to parse dates accurately in local timezone
  const parseDate = (dateStr) => {
    if (!dateStr) return { year: 0, month: 0, day: 0 };
    const cleanStr = dateStr.slice(0, 10);
    const parts = cleanStr.split('-');
    if (parts.length === 3) {
      return {
        year: parseInt(parts[0], 10),
        month: parseInt(parts[1], 10) - 1,
        day: parseInt(parts[2], 10)
      };
    }
    const d = new Date(dateStr);
    return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
  };

  // Extract all individual payment events (advances, installments, final payments)
  const paymentEvents = useMemo(() => {
    const list = [];
    invoices.forEach(inv => {
      let hasHistory = false;
      if (inv.payments_history) {
        try {
          const history = typeof inv.payments_history === 'string' 
            ? JSON.parse(inv.payments_history) 
            : inv.payments_history;

          if (Array.isArray(history) && history.length > 0) {
            hasHistory = true;
            history.forEach((p, idx) => {
              const pAmt = parseFloat(p.amount) || 0;
              if (pAmt > 0) {
                const dateStr = p.date ? p.date.slice(0, 10) : (inv.invoice_date ? inv.invoice_date.slice(0, 10) : '');
                list.push({
                  id: `hist-${inv.id}-${idx}`,
                  invoiceId: inv.id,
                  invoiceNo: inv.invoice_no,
                  customerName: inv.customer_name,
                  serviceName: inv.service_name,
                  amount: pAmt,
                  date: dateStr,
                  type: idx === 0 ? 'Advance' : `Installment #${idx + 1}`
                });
              }
            });
          }
        } catch (e) {
          console.error('Error parsing payment history:', e);
        }
      }

      if (!hasHistory) {
        const amt = parseFloat(inv.amount) || 0;
        const adv = parseFloat(inv.advance_paid) || 0;

        if (adv > 0) {
          const advDate = inv.advance_payment_date ? inv.advance_payment_date.slice(0, 10) : (inv.invoice_date ? inv.invoice_date.slice(0, 10) : '');
          list.push({
            id: `adv-${inv.id}`,
            invoiceId: inv.id,
            invoiceNo: inv.invoice_no,
            customerName: inv.customer_name,
            serviceName: inv.service_name,
            amount: adv,
            date: advDate,
            type: 'Advance Payment'
          });
        }

        if (inv.status === 'Paid') {
          const finalAmt = Math.max(0, amt - adv);
          if (finalAmt > 0) {
            const finalDate = inv.final_payment_date ? inv.final_payment_date.slice(0, 10) : (inv.invoice_date ? inv.invoice_date.slice(0, 10) : '');
            list.push({
              id: `final-${inv.id}`,
              invoiceId: inv.id,
              invoiceNo: inv.invoice_no,
              customerName: inv.customer_name,
              serviceName: inv.service_name,
              amount: finalAmt,
              date: finalDate,
              type: 'Final Payment'
            });
          }
        }
      }
    });
    return list;
  }, [invoices]);

  // Available Years dynamically populated from data
  const availableYears = useMemo(() => {
    const yearsSet = new Set([currentRealYear]);
    invoices.forEach(inv => {
      if (inv.invoice_date) {
        const y = parseDate(inv.invoice_date).year;
        if (y > 2000) yearsSet.add(y);
      }
    });
    paymentEvents.forEach(p => {
      if (p.date) {
        const y = parseDate(p.date).year;
        if (y > 2000) yearsSet.add(y);
      }
    });
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [invoices, paymentEvents, currentRealYear]);

  // 12-Month Detailed Aggregations for the Selected Year
  const monthlyData = useMemo(() => {
    return Array.from({ length: 12 }, (_, monthIdx) => {
      // 1. Payments / Income collected in this month
      const monthPayments = paymentEvents.filter(p => {
        const { year, month } = parseDate(p.date);
        return year === selectedYear && month === monthIdx;
      });
      const incomePaid = monthPayments.reduce((sum, p) => sum + p.amount, 0);

      // 2. Invoices billed in this month
      const monthInvoices = invoices.filter(inv => {
        const { year, month } = parseDate(inv.invoice_date);
        return year === selectedYear && month === monthIdx;
      });

      const totalBilled = monthInvoices.reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);
      const totalAdvance = monthInvoices.reduce((sum, inv) => sum + (parseFloat(inv.advance_paid) || 0), 0);
      const pendingAmount = monthInvoices.reduce((sum, inv) => {
        const amt = parseFloat(inv.amount) || 0;
        const adv = parseFloat(inv.advance_paid) || 0;
        return sum + (inv.status === 'Paid' ? 0 : Math.max(0, amt - adv));
      }, 0);

      const collectionRate = totalBilled > 0 ? Math.min(100, Math.round((incomePaid / totalBilled) * 100)) : (incomePaid > 0 ? 100 : 0);

      return {
        monthIndex: monthIdx,
        monthName: MONTH_NAMES[monthIdx],
        shortName: MONTH_SHORT[monthIdx],
        incomePaid,
        totalBilled,
        pendingAmount,
        invoicesCount: monthInvoices.length,
        paymentEventsCount: monthPayments.length,
        collectionRate,
        invoices: monthInvoices
      };
    });
  }, [invoices, paymentEvents, selectedYear]);

  // Yearly Summary Totals
  const yearlyTotalAmountPaid = useMemo(() => {
    return monthlyData.reduce((sum, m) => sum + m.incomePaid, 0);
  }, [monthlyData]);

  const yearlyTotalBilled = useMemo(() => {
    return monthlyData.reduce((sum, m) => sum + m.totalBilled, 0);
  }, [monthlyData]);

  const yearlyTotalPending = useMemo(() => {
    return monthlyData.reduce((sum, m) => sum + m.pendingAmount, 0);
  }, [monthlyData]);

  const yearlyTotalInvoicesCount = useMemo(() => {
    return monthlyData.reduce((sum, m) => sum + m.invoicesCount, 0);
  }, [monthlyData]);

  const yearlyCollectionRate = yearlyTotalBilled > 0 
    ? Math.min(100, Math.round((yearlyTotalAmountPaid / yearlyTotalBilled) * 100)) 
    : 0;

  // Selected Month Summary (or active month)
  const activeMonthIdx = selectedMonth === 'all' ? currentRealMonth : selectedMonth;
  const currentMonthData = monthlyData[activeMonthIdx] || monthlyData[0];
  const monthlyIncomeTotal = selectedMonth === 'all' ? currentMonthData.incomePaid : monthlyData[selectedMonth].incomePaid;
  const monthlyBilledTotal = selectedMonth === 'all' ? currentMonthData.totalBilled : monthlyData[selectedMonth].totalBilled;
  const monthlyPendingTotal = selectedMonth === 'all' ? currentMonthData.pendingAmount : monthlyData[selectedMonth].pendingAmount;

  // Invoices to display in detail table
  const displayedInvoices = useMemo(() => {
    if (selectedMonth === 'all') {
      return invoices.filter(inv => parseDate(inv.invoice_date).year === selectedYear);
    }
    return monthlyData[selectedMonth]?.invoices || [];
  }, [invoices, monthlyData, selectedMonth, selectedYear]);

  // Export to Excel / CSV
  const handleExportCSV = () => {
    const headers = ['Month', 'Invoices Count', 'Total Billed (INR)', 'Amount Paid / Income (INR)', 'Pending Amount (INR)', 'Collection Rate (%)'];
    const rows = monthlyData.map(m => [
      m.monthName,
      m.invoicesCount,
      m.totalBilled.toFixed(2),
      m.incomePaid.toFixed(2),
      m.pendingAmount.toFixed(2),
      `${m.collectionRate}%`
    ]);

    rows.push([
      `YEARLY TOTAL (${selectedYear})`,
      yearlyTotalInvoicesCount,
      yearlyTotalBilled.toFixed(2),
      yearlyTotalAmountPaid.toFixed(2),
      yearlyTotalPending.toFixed(2),
      `${yearlyCollectionRate}%`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `financial_report_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Find max value for chart scaling
  const maxChartVal = Math.max(
    ...monthlyData.map(m => Math.max(m.incomePaid, m.totalBilled)),
    10000
  );

  return (
    <div>
      {/* Header with Title and Period Controls */}
      <div className="card-header-flex" style={{ marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Agency Financial Reports</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Analytical breakdown of monthly income, yearly collected payments, and client billing.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Year Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Year:</span>
            <select
              className="form-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              style={{ fontWeight: 700, paddingRight: '28px', cursor: 'pointer', height: '38px' }}
            >
              {availableYears.map(yr => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          </div>

          {/* Month Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Month:</span>
            <select
              className="form-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))}
              style={{ fontWeight: 600, paddingRight: '28px', cursor: 'pointer', height: '38px' }}
            >
              <option value="all">All Months ({selectedYear})</option>
              {MONTH_NAMES.map((name, idx) => (
                <option key={idx} value={idx}>{name}</option>
              ))}
            </select>
          </div>

          {/* Export Report */}
          <button 
            className="btn btn-secondary" 
            onClick={handleExportCSV}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '38px' }}
          >
            <FileSpreadsheet size={16} /> Export Excel
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p style={{ fontWeight: 600 }}>Loading revenue & billing records from live database...</p>
        </div>
      ) : error ? (
        <div className="card" style={{ padding: '24px', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={20} />
            <strong>Error loading reports: {error}</strong>
          </div>
        </div>
      ) : (
        <>
          {/* ================= TOP HIGHLIGHT METRIC CARDS ================= */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            
            {/* 1. Monthly Income Total (HIGHLIGHT) */}
            <div className="card" style={{
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              color: '#ffffff',
              padding: '24px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.9, fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <Calendar size={15} /> Monthly Income Total
                  </div>
                  <h2 style={{ fontSize: '2.1rem', fontWeight: 800, marginTop: '8px', color: '#ffffff' }}>
                    ₹{monthlyIncomeTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h2>
                </div>
                <div style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                  borderRadius: '12px', 
                  padding: '10px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <IndianRupee size={24} color="#ffffff" />
                </div>
              </div>
              <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.2)', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span>{selectedMonth === 'all' ? `${MONTH_NAMES[currentRealMonth]} ${selectedYear}` : `${MONTH_NAMES[selectedMonth]} ${selectedYear}`}</span>
                <span style={{ fontWeight: 600 }}>{selectedMonth === 'all' ? currentMonthData.paymentEventsCount : monthlyData[selectedMonth].paymentEventsCount} receipts</span>
              </div>
            </div>

            {/* 2. Yearly Total Amount Paid (HIGHLIGHT) */}
            <div className="card" style={{
              background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
              color: '#ffffff',
              padding: '24px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.9, fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <TrendingUp size={15} /> Yearly Total Amount Paid
                  </div>
                  <h2 style={{ fontSize: '2.1rem', fontWeight: 800, marginTop: '8px', color: '#ffffff' }}>
                    ₹{yearlyTotalAmountPaid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h2>
                </div>
                <div style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                  borderRadius: '12px', 
                  padding: '10px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <CheckCircle2 size={24} color="#ffffff" />
                </div>
              </div>
              <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.2)', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span>Full Year {selectedYear}</span>
                <span style={{ fontWeight: 600 }}>{yearlyCollectionRate}% Collected</span>
              </div>
            </div>

            {/* 3. Yearly Total Invoiced */}
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Yearly Total Invoiced
                  </span>
                  <h2 style={{ fontSize: '1.9rem', fontWeight: 800, marginTop: '8px', color: 'var(--text-primary)' }}>
                    ₹{yearlyTotalBilled.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h2>
                </div>
                <div style={{ 
                  backgroundColor: 'rgba(99, 102, 241, 0.1)', 
                  borderRadius: '12px', 
                  padding: '10px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: '#6366f1'
                }}>
                  <BarChart3 size={24} />
                </div>
              </div>
              <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <span>Invoices Issued</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{yearlyTotalInvoicesCount} Invoices</span>
              </div>
            </div>

            {/* 4. Yearly Outstanding Receivables */}
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Outstanding Balance ({selectedYear})
                  </span>
                  <h2 style={{ fontSize: '1.9rem', fontWeight: 800, marginTop: '8px', color: yearlyTotalPending > 0 ? 'var(--warning)' : 'var(--success)' }}>
                    ₹{yearlyTotalPending.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h2>
                </div>
                <div style={{ 
                  backgroundColor: yearlyTotalPending > 0 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
                  borderRadius: '12px', 
                  padding: '10px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: yearlyTotalPending > 0 ? 'var(--warning)' : 'var(--success)'
                }}>
                  <Clock size={24} />
                </div>
              </div>
              <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <span>Pending Collection</span>
                <span style={{ fontWeight: 700, color: yearlyTotalPending > 0 ? 'var(--danger)' : 'var(--success)' }}>
                  {yearlyTotalPending > 0 ? `${(100 - yearlyCollectionRate)}% pending` : 'Fully Settled'}
                </span>
              </div>
            </div>

          </div>

          {/* ================= 12-MONTH VISUAL REVENUE BAR CHART ================= */}
          <div className="card" style={{ padding: '24px', marginBottom: '24px', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                  Monthly Income & Billed Breakdown ({selectedYear})
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Hover or click any month to filter invoices and inspect income details.
                </p>
              </div>

              {/* Chart Legend */}
              <div style={{ display: 'flex', gap: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '3px' }} />
                  <span>Amount Paid / Income</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', backgroundColor: '#3b82f6', borderRadius: '3px' }} />
                  <span>Total Invoiced</span>
                </div>
              </div>
            </div>

            {/* Visual Bar Chart */}
            <div style={{ 
              display: 'flex', 
              height: '240px', 
              alignItems: 'flex-end', 
              justifyContent: 'space-between', 
              padding: '30px 10px 10px 10px', 
              borderBottom: '1px solid var(--border-color)',
              gap: '8px',
              overflowX: 'auto'
            }}>
              {monthlyData.map((m, idx) => {
                const paidHeight = maxChartVal > 0 ? Math.max(4, Math.round((m.incomePaid / maxChartVal) * 180)) : 4;
                const billedHeight = maxChartVal > 0 ? Math.max(4, Math.round((m.totalBilled / maxChartVal) * 180)) : 4;
                const isSelected = selectedMonth === idx;
                const isHovered = hoveredBarIndex === idx;

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedMonth(idx)}
                    onMouseEnter={() => setHoveredBarIndex(idx)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      flex: '1 1 0px',
                      minWidth: '55px',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '8px',
                      backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.08)' : (isHovered ? 'rgba(0,0,0,0.02)' : 'transparent'),
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                  >
                    {/* Tooltip on hover */}
                    {isHovered && (
                      <div style={{
                        position: 'absolute',
                        bottom: '220px',
                        backgroundColor: '#1e293b',
                        color: '#fff',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        boxShadow: 'var(--shadow-md)',
                        zIndex: 10,
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none'
                      }}>
                        <div style={{ fontWeight: 700, marginBottom: '2px' }}>{m.monthName} {selectedYear}</div>
                        <div style={{ color: '#10b981' }}>Paid: ₹{m.incomePaid.toLocaleString('en-IN')}</div>
                        <div style={{ color: '#93c5fd' }}>Billed: ₹{m.totalBilled.toLocaleString('en-IN')}</div>
                      </div>
                    )}

                    {/* Dual Bars Container */}
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '180px' }}>
                      {/* Income Paid Bar */}
                      <div
                        title={`Income: ₹${m.incomePaid.toLocaleString('en-IN')}`}
                        style={{
                          width: '18px',
                          height: `${paidHeight}px`,
                          backgroundColor: m.incomePaid > 0 ? '#10b981' : '#e2e8f0',
                          borderRadius: '4px 4px 0 0',
                          boxShadow: m.incomePaid > 0 ? '0 2px 8px rgba(16, 185, 129, 0.3)' : 'none',
                          transition: 'height 0.4s ease'
                        }}
                      />
                      {/* Billed Bar */}
                      <div
                        title={`Billed: ₹${m.totalBilled.toLocaleString('en-IN')}`}
                        style={{
                          width: '18px',
                          height: `${billedHeight}px`,
                          backgroundColor: m.totalBilled > 0 ? '#3b82f6' : '#e2e8f0',
                          borderRadius: '4px 4px 0 0',
                          boxShadow: m.totalBilled > 0 ? '0 2px 8px rgba(59, 130, 246, 0.3)' : 'none',
                          transition: 'height 0.4s ease'
                        }}
                      />
                    </div>

                    {/* Month Label */}
                    <span style={{ 
                      fontSize: '0.8rem', 
                      marginTop: '10px', 
                      fontWeight: isSelected ? 800 : 600,
                      color: isSelected ? 'var(--primary)' : 'var(--text-secondary)'
                    }}>
                      {m.shortName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ================= 12-MONTH FINANCIAL TABLE ================= */}
          <div className="card" style={{ padding: '0 0 20px 0', marginBottom: '24px' }}>
            <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Monthly Income Summary Table ({selectedYear})</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Complete 12-month ledger of billed amounts, income collected, and pending amounts.
                </p>
              </div>
              {selectedMonth !== 'all' && (
                <button
                  className="btn btn-outline"
                  onClick={() => setSelectedMonth('all')}
                  style={{ fontSize: '0.82rem', padding: '6px 12px' }}
                >
                  Show All Months
                </button>
              )}
            </div>

            <div className="table-responsive-container" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Month</th>
                    <th style={{ textAlign: 'center' }}>Invoices</th>
                    <th style={{ textAlign: 'right' }}>Total Billed (INR)</th>
                    <th style={{ textAlign: 'right', color: '#059669' }}>Amount Paid / Income (INR)</th>
                    <th style={{ textAlign: 'right' }}>Pending Balance (INR)</th>
                    <th style={{ textAlign: 'center' }}>Collection Rate</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((m, idx) => {
                    const isSelected = selectedMonth === idx;
                    return (
                      <tr 
                        key={idx}
                        style={{
                          backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.06)' : 'transparent',
                          transition: 'background-color 0.15s ease'
                        }}
                      >
                        <td style={{ fontWeight: 700, color: isSelected ? 'var(--primary)' : 'var(--text-primary)' }}>
                          {m.monthName}
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 600 }}>
                          {m.invoicesCount > 0 ? (
                            <span className="badge badge-secondary" style={{ padding: '2px 8px' }}>
                              {m.invoicesCount} inv
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>0</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>
                          {m.totalBilled > 0 ? `₹${m.totalBilled.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                        </td>
                        <td style={{ 
                          textAlign: 'right', 
                          fontWeight: 800, 
                          color: m.incomePaid > 0 ? '#059669' : 'var(--text-secondary)',
                          backgroundColor: m.incomePaid > 0 ? 'rgba(16, 185, 129, 0.05)' : 'transparent'
                        }}>
                          {m.incomePaid > 0 ? `₹${m.incomePaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                        </td>
                        <td style={{ 
                          textAlign: 'right', 
                          fontWeight: 600, 
                          color: m.pendingAmount > 0 ? 'var(--danger)' : 'var(--text-secondary)' 
                        }}>
                          {m.pendingAmount > 0 ? `₹${m.pendingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`badge ${m.collectionRate === 100 ? 'badge-success' : (m.collectionRate > 0 ? 'badge-warning' : 'badge-secondary')}`}>
                            {m.collectionRate}%
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            className="btn btn-outline"
                            onClick={() => setSelectedMonth(idx)}
                            style={{ 
                              padding: '4px 10px', 
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              borderColor: isSelected ? 'var(--primary)' : undefined,
                              color: isSelected ? 'var(--primary)' : undefined
                            }}
                          >
                            {isSelected ? 'Viewing' : 'Details'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ backgroundColor: 'rgba(0,0,0,0.02)', fontWeight: 800, borderTop: '2.5px solid var(--border-color)', fontSize: '0.92rem' }}>
                    <td>Yearly Total ({selectedYear})</td>
                    <td style={{ textAlign: 'center' }}>{yearlyTotalInvoicesCount} Invoices</td>
                    <td style={{ textAlign: 'right' }}>₹{yearlyTotalBilled.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td style={{ textAlign: 'right', color: '#059669', fontSize: '1.02rem', backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                      ₹{yearlyTotalAmountPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'right', color: yearlyTotalPending > 0 ? 'var(--danger)' : 'var(--text-secondary)' }}>
                      ₹{yearlyTotalPending.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge badge-success" style={{ fontWeight: 800 }}>{yearlyCollectionRate}%</span>
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* ================= INVOICE DETAILS FOR SELECTED MONTH ================= */}
          <div className="card" style={{ padding: '0 0 20px 0' }}>
            <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                  {selectedMonth === 'all' 
                    ? `All Invoices in ${selectedYear} (${displayedInvoices.length})` 
                    : `Invoices for ${MONTH_NAMES[selectedMonth]} ${selectedYear} (${displayedInvoices.length})`}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Breakdown of individual customer invoices and payments contributing to the period's income.
                </p>
              </div>

              {onNavigate && (
                <button
                  className="btn btn-outline"
                  onClick={() => onNavigate('billing')}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                >
                  Go to Invoices Module <ArrowRight size={14} />
                </button>
              )}
            </div>

            {displayedInvoices.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <p>No invoice records found for this period.</p>
              </div>
            ) : (
              <div className="table-responsive-container" style={{ border: 'none', borderRadius: 0 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Invoice #</th>
                      <th>Date</th>
                      <th>Client Name</th>
                      <th>Service Details</th>
                      <th style={{ textAlign: 'right' }}>Total (INR)</th>
                      <th style={{ textAlign: 'right', color: '#059669' }}>Amount Paid (INR)</th>
                      <th style={{ textAlign: 'right' }}>Pending (INR)</th>
                      <th style={{ textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedInvoices.map((inv) => {
                      const amt = parseFloat(inv.amount) || 0;
                      const adv = parseFloat(inv.advance_paid) || 0;
                      const pending = inv.status === 'Paid' ? 0 : Math.max(0, amt - adv);
                      const isPaid = inv.status === 'Paid';

                      return (
                        <tr key={inv.id}>
                          <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{inv.invoice_no}</td>
                          <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {inv.invoice_date ? inv.invoice_date.slice(0, 10) : '—'}
                          </td>
                          <td style={{ fontWeight: 600 }}>{inv.customer_name}</td>
                          <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={inv.service_name}>
                            {inv.service_name || 'Website Design & Development'}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 600 }}>
                            ₹{amt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 800, color: '#059669' }}>
                            ₹{(isPaid ? amt : adv).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 600, color: pending > 0 ? 'var(--danger)' : 'var(--text-secondary)' }}>
                            {pending > 0 ? `₹${pending.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span className={`badge ${inv.status === 'Paid' ? 'badge-success' : (inv.status === 'Pending' ? 'badge-warning' : 'badge-danger')}`}>
                              {inv.status || 'Pending'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
