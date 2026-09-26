import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Home, 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  X, 
  Sparkles, 
  IndianRupee, 
  ShieldCheck, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ShieldAlert, 
  FileSpreadsheet, 
  Printer, 
  CreditCard, 
  FileText, 
  Phone, 
  Mail, 
  User, 
  Building,
  RotateCcw,
  Check,
  Send
} from 'lucide-react';
import { API_URL } from '../config';

const STORAGE_KEY = 'amigo_house_rents_data';

const WhatsAppIcon = ({ size = 16 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 448 512"
    width={size}
    height={size}
    fill="currentColor"
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L3.2 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
  </svg>
);

const INITIAL_HOUSE_RENTS = [
  {
    id: 1,
    propertyName: "Amigo Webster House #1 (Ground Floor)",
    unitNumber: "Ground Floor, Door #6",
    propertyAddress: "Plot No 6 Anna Main Road, Vengambakkam, Chennai - 600128",
    tenantName: "Santhosh Kumar",
    tenantPhone: "+91 94453 32233",
    tenantEmail: "santhosh.k@gmail.com",
    monthlyRent: 15000,
    advanceAmount: 75000,
    advancePaymentDate: "2026-01-10",
    rentDueDay: 5,
    maintenanceCharge: 500,
    leaseStartDate: "2026-01-15",
    leaseEndDate: "2026-12-31",
    status: "Occupied",
    notes: "Security deposit held in full. Electricity metered separately.",
    paymentHistory: [
      { id: 'pay-1', month: "August 2026", amount: 15000, paidDate: "2026-08-05", paymentMode: "GPay / UPI", receiptNo: "RENT-REC-101", notes: "Paid via GPay", status: "Paid" },
      { id: 'pay-2', month: "September 2026", amount: 15000, paidDate: "2026-09-04", paymentMode: "GPay / UPI", receiptNo: "RENT-REC-102", notes: "Timely payment", status: "Paid" }
    ]
  },
  {
    id: 2,
    propertyName: "Anna Main Road Villa (First Floor)",
    unitNumber: "First Floor, Unit 1A",
    propertyAddress: "Plot No 6 Anna Main Road, Vengambakkam, Chennai - 600128",
    tenantName: "Venkatesh R",
    tenantPhone: "+91 98841 78494",
    tenantEmail: "venkatesh.r@yahoo.com",
    monthlyRent: 18000,
    advanceAmount: 100000,
    advancePaymentDate: "2026-03-01",
    rentDueDay: 1,
    maintenanceCharge: 1000,
    leaseStartDate: "2026-03-01",
    leaseEndDate: "2027-02-28",
    status: "Occupied",
    notes: "10 months advance received via NEFT transfer.",
    paymentHistory: [
      { id: 'pay-3', month: "August 2026", amount: 18000, paidDate: "2026-08-01", paymentMode: "Bank Transfer", receiptNo: "RENT-REC-103", notes: "NEFT Ref #992817", status: "Paid" }
    ]
  },
  {
    id: 3,
    propertyName: "Vengambakkam Flat 204",
    unitNumber: "Flat 204, Second Floor",
    propertyAddress: "Rajeshwari Nagar, Vengambakkam, Chennai - 600128",
    tenantName: "Priya Sundaram",
    tenantPhone: "+91 99623 68821",
    tenantEmail: "priya.sundaram@gmail.com",
    monthlyRent: 12500,
    advanceAmount: 60000,
    advancePaymentDate: "2026-05-15",
    rentDueDay: 10,
    maintenanceCharge: 400,
    leaseStartDate: "2026-05-15",
    leaseEndDate: "2027-05-14",
    status: "Occupied",
    notes: "Advance ₹60,000 received in cash upon agreement signing.",
    paymentHistory: [
      { id: 'pay-4', month: "August 2026", amount: 12500, paidDate: "2026-08-10", paymentMode: "Cash", receiptNo: "RENT-REC-104", notes: "Cash received", status: "Paid" }
    ]
  }
];

export default function HouseRent({ showToast }) {
  const [houseRents, setHouseRents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPayment, setFilterPayment] = useState('All');

  // Modal States
  const [showHouseModal, setShowHouseModal] = useState(false);
  const [editingHouse, setEditingHouse] = useState(null);
  const [deletingHouse, setDeletingHouse] = useState(null);
  const [payingHouse, setPayingHouse] = useState(null);
  const [viewingReceipt, setViewingReceipt] = useState(null);

  // Form for House/Tenant details
  const [form, setForm] = useState({
    propertyName: '',
    unitNumber: '',
    propertyAddress: '',
    tenantName: '',
    tenantPhone: '',
    tenantEmail: '',
    monthlyRent: '',
    advanceAmount: '',
    advancePaymentDate: new Date().toLocaleDateString('sv'),
    rentDueDay: '1',
    maintenanceCharge: '0',
    leaseStartDate: new Date().toLocaleDateString('sv'),
    leaseEndDate: '',
    status: 'Occupied',
    notes: ''
  });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Form for recording rent payment
  const currentMonthYearName = useMemo(() => {
    return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, []);

  const [paymentForm, setPaymentForm] = useState({
    month: currentMonthYearName,
    amount: '',
    paidDate: new Date().toLocaleDateString('sv'),
    paymentMode: 'GPay / UPI',
    referenceId: '',
    notes: ''
  });

  // Print Ref
  const receiptPrintRef = useRef(null);

  // Load Initial Data
  useEffect(() => {
    fetchHouseRents();
  }, []);

  const fetchHouseRents = async () => {
    try {
      setLoading(true);
      // Try backend first
      const res = await fetch(`${API_URL}/api/house-rents`).catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setHouseRents(data);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          setLoading(false);
          return;
        }
      }

      // Fallback to localStorage or initial seeds
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setHouseRents(parsed);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error("Error reading saved house rents:", e);
        }
      }

      // If completely empty, seed initial houses
      setHouseRents(INITIAL_HOUSE_RENTS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_HOUSE_RENTS));
    } catch (err) {
      console.error("Error in fetchHouseRents:", err);
      setHouseRents(INITIAL_HOUSE_RENTS);
    } finally {
      setLoading(false);
    }
  };

  const saveHouseRentsState = async (updatedList) => {
    setHouseRents(updatedList);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

    // Try background sync with backend if online
    try {
      fetch(`${API_URL}/api/house-rents/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedList)
      }).catch(() => null);
    } catch (e) {
      // Offline fallback silent
    }
  };

  // Helper to check if tenant has paid current month
  const isPaidThisMonth = (house) => {
    if (!house.paymentHistory || house.paymentHistory.length === 0) return false;
    return house.paymentHistory.some(p => p.month === currentMonthYearName && p.status === 'Paid');
  };

  // KPI Calculations
  const metrics = useMemo(() => {
    const totalProperties = houseRents.length;
    const occupiedHouses = houseRents.filter(h => h.status === 'Occupied');
    const occupiedCount = occupiedHouses.length;
    const vacantCount = houseRents.filter(h => h.status === 'Vacant').length;

    // Total Advance / Security Deposit Received
    const totalAdvanceReceived = houseRents.reduce((sum, h) => sum + (parseFloat(h.advanceAmount) || 0), 0);

    // Total Expected Monthly Rent
    const totalMonthlyRentExpected = occupiedHouses.reduce((sum, h) => sum + (parseFloat(h.monthlyRent) || 0), 0);

    // Total Collected for Current Month
    let rentCollectedThisMonth = 0;
    let paidTenantsCount = 0;
    occupiedHouses.forEach(h => {
      const thisMonthPayments = (h.paymentHistory || []).filter(p => p.month === currentMonthYearName && p.status === 'Paid');
      const paidAmt = thisMonthPayments.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
      rentCollectedThisMonth += paidAmt;
      if (paidAmt >= (parseFloat(h.monthlyRent) || 0)) {
        paidTenantsCount++;
      }
    });

    const pendingRentThisMonth = Math.max(0, totalMonthlyRentExpected - rentCollectedThisMonth);
    const pendingTenantsCount = occupiedCount - paidTenantsCount;

    return {
      totalProperties,
      occupiedCount,
      vacantCount,
      totalAdvanceReceived,
      totalMonthlyRentExpected,
      rentCollectedThisMonth,
      pendingRentThisMonth,
      paidTenantsCount,
      pendingTenantsCount
    };
  }, [houseRents, currentMonthYearName]);

  // Filtered List
  const filteredHouses = useMemo(() => {
    return houseRents.filter(h => {
      const q = search.toLowerCase();
      const matchSearch = (
        (h.propertyName || '').toLowerCase().includes(q) ||
        (h.unitNumber || '').toLowerCase().includes(q) ||
        (h.tenantName || '').toLowerCase().includes(q) ||
        (h.tenantPhone || '').includes(q)
      );

      let matchStatus = true;
      if (filterStatus !== 'All') {
        matchStatus = h.status === filterStatus;
      }

      let matchPayment = true;
      if (filterPayment !== 'All') {
        const paid = isPaidThisMonth(h);
        if (filterPayment === 'Paid') matchPayment = paid;
        if (filterPayment === 'Pending') matchPayment = !paid && h.status === 'Occupied';
      }

      return matchSearch && matchStatus && matchPayment;
    });
  }, [houseRents, search, filterStatus, filterPayment, currentMonthYearName]);

  // Open Add House Modal
  const handleOpenAddModal = () => {
    setEditingHouse(null);
    setForm({
      propertyName: '',
      unitNumber: '',
      propertyAddress: '',
      tenantName: '',
      tenantPhone: '',
      tenantEmail: '',
      monthlyRent: '',
      advanceAmount: '',
      advancePaymentDate: new Date().toLocaleDateString('sv'),
      rentDueDay: '1',
      maintenanceCharge: '0',
      leaseStartDate: new Date().toLocaleDateString('sv'),
      leaseEndDate: '',
      status: 'Occupied',
      notes: ''
    });
    setFormError('');
    setShowHouseModal(true);
  };

  // Open Edit House Modal
  const handleOpenEditModal = (house) => {
    setEditingHouse(house);
    setForm({
      propertyName: house.propertyName || '',
      unitNumber: house.unitNumber || '',
      propertyAddress: house.propertyAddress || '',
      tenantName: house.tenantName || '',
      tenantPhone: house.tenantPhone || '',
      tenantEmail: house.tenantEmail || '',
      monthlyRent: house.monthlyRent ? house.monthlyRent.toString() : '',
      advanceAmount: house.advanceAmount ? house.advanceAmount.toString() : '',
      advancePaymentDate: house.advancePaymentDate || '',
      rentDueDay: house.rentDueDay ? house.rentDueDay.toString() : '1',
      maintenanceCharge: house.maintenanceCharge ? house.maintenanceCharge.toString() : '0',
      leaseStartDate: house.leaseStartDate || '',
      leaseEndDate: house.leaseEndDate || '',
      status: house.status || 'Occupied',
      notes: house.notes || ''
    });
    setFormError('');
    setShowHouseModal(true);
  };

  // Save House / Tenant Record
  const handleSaveHouse = async (e) => {
    e.preventDefault();
    if (!form.propertyName || !form.tenantName || !form.monthlyRent || !form.advanceAmount) {
      setFormError('Property Name, Tenant Name, Monthly Rent, and Advance Amount are required.');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      const rentNum = parseFloat(form.monthlyRent) || 0;
      const advNum = parseFloat(form.advanceAmount) || 0;
      const maintNum = parseFloat(form.maintenanceCharge) || 0;
      const dueDayNum = parseInt(form.rentDueDay, 10) || 1;

      if (editingHouse) {
        const updatedList = houseRents.map(h => {
          if (h.id === editingHouse.id) {
            return {
              ...h,
              ...form,
              monthlyRent: rentNum,
              advanceAmount: advNum,
              maintenanceCharge: maintNum,
              rentDueDay: dueDayNum
            };
          }
          return h;
        });
        await saveHouseRentsState(updatedList);
        if (showToast) showToast('House & tenant details updated successfully.');
      } else {
        const newId = Date.now();
        const newHouse = {
          id: newId,
          ...form,
          monthlyRent: rentNum,
          advanceAmount: advNum,
          maintenanceCharge: maintNum,
          rentDueDay: dueDayNum,
          paymentHistory: []
        };
        const updatedList = [newHouse, ...houseRents];
        await saveHouseRentsState(updatedList);
        if (showToast) showToast('New house rent profile registered successfully!');
      }

      setShowHouseModal(false);
      setEditingHouse(null);
    } catch (err) {
      setFormError(err.message || 'Failed to save house rent profile.');
    } finally {
      setSaving(false);
    }
  };

  // Delete House Record
  const handleDeleteConfirm = async () => {
    if (!deletingHouse) return;
    try {
      const updatedList = houseRents.filter(h => h.id !== deletingHouse.id);
      await saveHouseRentsState(updatedList);
      setDeletingHouse(null);
      if (showToast) showToast('House rent record removed successfully.');
    } catch (err) {
      alert('Could not delete house record.');
    }
  };

  // Open Payment & History Modal
  const handleOpenPaymentModal = (house) => {
    setPayingHouse(house);
    setPaymentForm({
      month: currentMonthYearName,
      amount: house.monthlyRent ? house.monthlyRent.toString() : '',
      paidDate: new Date().toLocaleDateString('sv'),
      paymentMode: 'GPay / UPI',
      referenceId: '',
      notes: ''
    });
  };

  // Record a Rent Payment
  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!payingHouse || !paymentForm.amount || !paymentForm.month) return;

    try {
      const pAmt = parseFloat(paymentForm.amount) || 0;
      const receiptNo = `RENT-REC-${Math.floor(1000 + Math.random() * 9000)}`;

      const newPayment = {
        id: `pay-${Date.now()}`,
        month: paymentForm.month,
        amount: pAmt,
        paidDate: paymentForm.paidDate,
        paymentMode: paymentForm.paymentMode,
        referenceId: paymentForm.referenceId || '—',
        receiptNo,
        notes: paymentForm.notes || 'Monthly rent paid',
        status: 'Paid'
      };

      const updatedList = houseRents.map(h => {
        if (h.id === payingHouse.id) {
          const currentHistory = h.paymentHistory || [];
          return {
            ...h,
            paymentHistory: [newPayment, ...currentHistory]
          };
        }
        return h;
      });

      await saveHouseRentsState(updatedList);
      
      // Update paying house in view
      const freshPaying = updatedList.find(h => h.id === payingHouse.id);
      setPayingHouse(freshPaying);

      if (showToast) showToast(`Rent payment of ₹${pAmt.toLocaleString('en-IN')} recorded (${receiptNo})!`);
      
      // Offer receipt view
      setViewingReceipt({
        house: freshPaying,
        payment: newPayment
      });
    } catch (err) {
      console.error(err);
      alert('Failed to record rent payment.');
    }
  };

  // Print Receipt Slip
  const handlePrintReceipt = () => {
    window.print();
  };

  // Export to Excel / CSV
  const handleExportCSV = () => {
    const headers = [
      'House / Property Name', 
      'Unit #', 
      'Tenant Name', 
      'Tenant Phone', 
      'Monthly Rent (INR)', 
      'Advance Received (INR)', 
      'Advance Date', 
      'Rent Due Day', 
      'Current Month Status', 
      'Property Status'
    ];

    const rows = filteredHouses.map(h => [
      h.propertyName,
      h.unitNumber || '',
      h.tenantName,
      h.tenantPhone,
      h.monthlyRent,
      h.advanceAmount,
      h.advancePaymentDate || '',
      h.rentDueDay || 1,
      isPaidThisMonth(h) ? 'Paid' : 'Pending',
      h.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `house_rent_ledger_${new Date().toLocaleDateString('sv')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Send WhatsApp Reminder
  const handleWhatsAppReminder = (house) => {
    const cleanPhone = (house.tenantPhone || '').replace(/[^0-9]/g, '');
    const msg = `Dear ${house.tenantName},\n\nThis is a friendly reminder regarding the monthly house rent of ₹${parseFloat(house.monthlyRent).toLocaleString('en-IN')} for ${house.propertyName} (${currentMonthYearName}).\n\nAdvance / Security Deposit on record: ₹${parseFloat(house.advanceAmount).toLocaleString('en-IN')}.\n\nPlease remit the rent at your earliest convenience.\n\nThank you!`;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div>
      {/* Header */}
      <div className="card-header-flex" style={{ marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Home size={28} style={{ color: 'var(--primary)' }} /> House Rent & Advance Ledger
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Maintain rental properties, tenants, monthly rent collections, and security advances received.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-secondary" 
            onClick={handleExportCSV}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FileSpreadsheet size={16} /> Export Excel
          </button>

          <button 
            className="btn btn-primary" 
            onClick={handleOpenAddModal}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={18} /> Add House / Tenant
          </button>
        </div>
      </div>

      {/* ================= TOP METRIC CARDS ================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* 1. Total Advance Received (CRUCIAL USER REQUIREMENT) */}
        <div className="card" style={{
          background: 'linear-gradient(135deg, #047857 0%, #10b981 100%)',
          color: '#ffffff',
          padding: '22px',
          boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.9 }}>
                Total Advance Received
              </span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px', color: '#ffffff' }}>
                ₹{metrics.totalAdvanceReceived.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h2>
            </div>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px' }}>
              <ShieldCheck size={24} color="#ffffff" />
            </div>
          </div>
          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.2)', fontSize: '0.82rem', opacity: 0.9 }}>
            Security Deposits Held in Hand
          </div>
        </div>

        {/* 2. Monthly Rent Expected */}
        <div className="card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Monthly Rent Expected
              </span>
              <h2 style={{ fontSize: '1.9rem', fontWeight: 800, marginTop: '8px', color: 'var(--text-primary)' }}>
                ₹{metrics.totalMonthlyRentExpected.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h2>
            </div>
            <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '10px', borderRadius: '12px', color: 'var(--primary)' }}>
              <Calendar size={24} />
            </div>
          </div>
          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-color)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Across {metrics.occupiedCount} Occupied Properties
          </div>
        </div>

        {/* 3. Rent Collected This Month */}
        <div className="card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Rent Collected ({currentMonthYearName.split(' ')[0]})
              </span>
              <h2 style={{ fontSize: '1.9rem', fontWeight: 800, marginTop: '8px', color: '#059669' }}>
                ₹{metrics.rentCollectedThisMonth.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h2>
            </div>
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '12px', color: '#059669' }}>
              <CheckCircle2 size={24} />
            </div>
          </div>
          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-color)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            {metrics.paidTenantsCount} Tenants Paid
          </div>
        </div>

        {/* 4. Pending Rent This Month */}
        <div className="card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Pending Rent ({currentMonthYearName.split(' ')[0]})
              </span>
              <h2 style={{ fontSize: '1.9rem', fontWeight: 800, marginTop: '8px', color: metrics.pendingRentThisMonth > 0 ? 'var(--danger)' : 'var(--success)' }}>
                ₹{metrics.pendingRentThisMonth.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h2>
            </div>
            <div style={{ backgroundColor: metrics.pendingRentThisMonth > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '12px', color: metrics.pendingRentThisMonth > 0 ? 'var(--danger)' : 'var(--success)' }}>
              <Clock size={24} />
            </div>
          </div>
          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-color)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            {metrics.pendingRentThisMonth > 0 ? `${metrics.pendingTenantsCount} Tenants Pending` : 'All Collected!'}
          </div>
        </div>

      </div>

      {/* ================= SEARCH & FILTER BAR ================= */}
      <div className="card" style={{ padding: '0 0 24px 0', gap: '16px' }}>
        <div style={{ padding: '20px 24px 0 24px', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 260px' }}>
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
              style={{ paddingLeft: '38px', height: '40px' }}
              placeholder="Search house, unit number, tenant name, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Occupancy Status Filter */}
          <div style={{ flex: '0 1 170px' }}>
            <select
              className="form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ height: '40px', cursor: 'pointer' }}
            >
              <option value="All">All Occupancy</option>
              <option value="Occupied">Occupied</option>
              <option value="Vacant">Vacant</option>
              <option value="Notice Period">Notice Period</option>
            </select>
          </div>

          {/* Current Month Rent Status Filter */}
          <div style={{ flex: '0 1 180px' }}>
            <select
              className="form-select"
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              style={{ height: '40px', cursor: 'pointer' }}
            >
              <option value="All">All Rent Statuses</option>
              <option value="Paid">Rent Paid ({currentMonthYearName.split(' ')[0]})</option>
              <option value="Pending">Rent Pending</option>
            </select>
          </div>

          {(search || filterStatus !== 'All' || filterPayment !== 'All') && (
            <button
              className="btn btn-outline"
              onClick={() => {
                setSearch('');
                setFilterStatus('All');
                setFilterPayment('All');
              }}
              style={{ height: '40px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--danger)', borderColor: 'var(--danger)' }}
            >
              <RotateCcw size={14} /> Reset
            </button>
          )}
        </div>

        {/* ================= TABLE LIST ================= */}
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading house rent records...
          </div>
        ) : filteredHouses.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p>No house rent records matching the filter.</p>
          </div>
        ) : (
          <div className="table-responsive-container" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Property / Unit</th>
                  <th>Tenant Details</th>
                  <th style={{ textAlign: 'right' }}>Monthly Rent</th>
                  <th style={{ textAlign: 'right', color: '#047857' }}>Advance Received</th>
                  <th style={{ textAlign: 'center' }}>Due Day</th>
                  <th style={{ textAlign: 'center' }}>Current Month</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHouses.map((house) => {
                  const paid = isPaidThisMonth(house);
                  const cleanPhone = (house.tenantPhone || '').replace(/[^0-9]/g, '');

                  return (
                    <tr key={house.id}>
                      {/* Property / Unit */}
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          {house.propertyName}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <Building size={12} /> {house.unitNumber || 'Single Unit'}
                        </div>
                      </td>

                      {/* Tenant Details */}
                      <td>
                        <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <User size={14} style={{ color: 'var(--primary)' }} />
                          {house.tenantName}
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          <Phone size={12} style={{ display: 'inline', marginRight: '4px' }} />
                          {house.tenantPhone}
                        </div>
                      </td>

                      {/* Monthly Rent */}
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>
                        ₹{parseFloat(house.monthlyRent).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        {parseFloat(house.maintenanceCharge) > 0 && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            +₹{parseFloat(house.maintenanceCharge)} maint.
                          </div>
                        )}
                      </td>

                      {/* Advance Received (HIGHLIGHT) */}
                      <td style={{ 
                        textAlign: 'right', 
                        fontWeight: 800, 
                        color: '#047857',
                        backgroundColor: 'rgba(16, 185, 129, 0.05)'
                      }}>
                        ₹{parseFloat(house.advanceAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        {house.advancePaymentDate && (
                          <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 500 }}>
                            Recd: {house.advancePaymentDate}
                          </div>
                        )}
                      </td>

                      {/* Rent Due Day */}
                      <td style={{ textAlign: 'center', fontWeight: 600, fontSize: '0.88rem' }}>
                        {house.rentDueDay ? `${house.rentDueDay}th` : '1st'}
                      </td>

                      {/* Current Month Rent Status */}
                      <td style={{ textAlign: 'center' }}>
                        {house.status !== 'Occupied' ? (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>—</span>
                        ) : paid ? (
                          <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={12} /> Paid
                          </span>
                        ) : (
                          <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={12} /> Pending
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${house.status === 'Occupied' ? 'badge-primary' : (house.status === 'Vacant' ? 'badge-secondary' : 'badge-danger')}`}>
                          {house.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                          {/* Collect Rent / View History */}
                          <button
                            className="btn btn-outline"
                            onClick={() => handleOpenPaymentModal(house)}
                            style={{ padding: '6px 10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                            title="Rent Collection & Payment Ledger"
                          >
                            <CreditCard size={14} /> Rent Ledger
                          </button>

                          {/* WhatsApp Reminder */}
                          {cleanPhone && (
                            <button
                              className="btn btn-whatsapp btn-icon-only"
                              onClick={() => handleWhatsAppReminder(house)}
                              title="Send Rent Reminder via WhatsApp"
                            >
                              <WhatsAppIcon size={14} />
                            </button>
                          )}

                          {/* Edit */}
                          <button
                            className="btn btn-outline btn-icon-only"
                            onClick={() => handleOpenEditModal(house)}
                            title="Edit House Details"
                          >
                            <Pencil size={14} />
                          </button>

                          {/* Delete */}
                          <button
                            className="btn btn-danger btn-icon-only"
                            onClick={() => setDeletingHouse(house)}
                            title="Delete Record"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ backgroundColor: 'rgba(0,0,0,0.015)', fontWeight: 800, borderTop: '2px solid var(--border-color)', fontSize: '0.9rem' }}>
                  <td colSpan="2" style={{ textAlign: 'right', padding: '16px' }}>Total ({filteredHouses.length} Properties):</td>
                  <td style={{ textAlign: 'right', padding: '16px' }}>
                    ₹{filteredHouses.reduce((sum, h) => sum + (parseFloat(h.monthlyRent) || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ textAlign: 'right', padding: '16px', color: '#047857', backgroundColor: 'rgba(16, 185, 129, 0.08)' }}>
                    ₹{filteredHouses.reduce((sum, h) => sum + (parseFloat(h.advanceAmount) || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td colSpan="4"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* ================= ADD / EDIT HOUSE MODAL ================= */}
      {showHouseModal && (
        <div className="modal-backdrop centered" onClick={() => setShowHouseModal(false)}>
          <div className="invoice-modal centered" style={{ maxWidth: '680px', width: '95%' }} onClick={e => e.stopPropagation()}>
            <div className="invoice-modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800 }}>
                <Sparkles size={20} style={{ color: 'var(--primary)' }} />
                {editingHouse ? 'Edit House & Tenant Profile' : 'Register New House & Tenant'}
              </h3>
              <button 
                onClick={() => setShowHouseModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveHouse}>
              <div className="invoice-modal-body" style={{ maxHeight: '70vh', padding: '20px 24px', overflowY: 'auto' }}>
                {formError && (
                  <div style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)', padding: '10px 14px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={16} />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Section 1: Property Details */}
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.5px' }}>
                  1. House / Property Info
                </div>

                <div className="form-grid" style={{ marginBottom: '14px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="propertyName">House / Property Name *</label>
                    <input
                      id="propertyName"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Amigo Webster House (Ground Floor)"
                      value={form.propertyName}
                      onChange={e => setForm({ ...form, propertyName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="unitNumber">Unit / Door #</label>
                    <input
                      id="unitNumber"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Flat 101 / Door No. 6"
                      value={form.unitNumber}
                      onChange={e => setForm({ ...form, unitNumber: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '18px' }}>
                  <label className="form-label" htmlFor="propertyAddress">Property Address</label>
                  <input
                    id="propertyAddress"
                    type="text"
                    className="form-input"
                    placeholder="Enter complete building address"
                    value={form.propertyAddress}
                    onChange={e => setForm({ ...form, propertyAddress: e.target.value })}
                  />
                </div>

                {/* Section 2: Tenant Info */}
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.5px' }}>
                  2. Tenant Details
                </div>

                <div className="form-grid" style={{ marginBottom: '14px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="tenantName">Tenant Full Name *</label>
                    <input
                      id="tenantName"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Santhosh Kumar"
                      value={form.tenantName}
                      onChange={e => setForm({ ...form, tenantName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="tenantPhone">Tenant Phone / WhatsApp *</label>
                    <input
                      id="tenantPhone"
                      type="tel"
                      className="form-input"
                      placeholder="+91 94453 32233"
                      value={form.tenantPhone}
                      onChange={e => setForm({ ...form, tenantPhone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-grid" style={{ marginBottom: '18px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="tenantEmail">Tenant Email</label>
                    <input
                      id="tenantEmail"
                      type="email"
                      className="form-input"
                      placeholder="tenant@gmail.com"
                      value={form.tenantEmail}
                      onChange={e => setForm({ ...form, tenantEmail: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="status">Occupancy Status</label>
                    <select
                      id="status"
                      className="form-select"
                      value={form.status}
                      onChange={e => setForm({ ...form, status: e.target.value })}
                    >
                      <option value="Occupied">Occupied</option>
                      <option value="Vacant">Vacant</option>
                      <option value="Notice Period">Notice Period</option>
                    </select>
                  </div>
                </div>

                {/* Section 3: Financials & Advance */}
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.5px' }}>
                  3. Rent & Advance (Deposit) Details
                </div>

                <div className="form-grid" style={{ marginBottom: '14px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="monthlyRent">Monthly Rent Amount (INR) *</label>
                    <input
                      id="monthlyRent"
                      type="number"
                      step="any"
                      className="form-input"
                      placeholder="e.g. 15000"
                      value={form.monthlyRent}
                      onChange={e => setForm({ ...form, monthlyRent: e.target.value })}
                      required
                    />
                  </div>

                  {/* Advance Received Field (PRIMARY) */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="advanceAmount" style={{ color: '#047857', fontWeight: 700 }}>
                      Advance / Security Deposit Received (INR) *
                    </label>
                    <input
                      id="advanceAmount"
                      type="number"
                      step="any"
                      className="form-input"
                      style={{ borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.05)' }}
                      placeholder="e.g. 75000"
                      value={form.advanceAmount}
                      onChange={e => setForm({ ...form, advanceAmount: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-grid" style={{ marginBottom: '14px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="advancePaymentDate">Advance Received Date</label>
                    <input
                      id="advancePaymentDate"
                      type="date"
                      className="form-input"
                      value={form.advancePaymentDate}
                      onChange={e => setForm({ ...form, advancePaymentDate: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="rentDueDay">Rent Due Day of Month</label>
                    <select
                      id="rentDueDay"
                      className="form-select"
                      value={form.rentDueDay}
                      onChange={e => setForm({ ...form, rentDueDay: e.target.value })}
                    >
                      {[1, 5, 10, 15, 20, 25, 30].map(d => (
                        <option key={d} value={d}>{d}th of every month</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-grid" style={{ marginBottom: '14px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="leaseStartDate">Lease Start Date</label>
                    <input
                      id="leaseStartDate"
                      type="date"
                      className="form-input"
                      value={form.leaseStartDate}
                      onChange={e => setForm({ ...form, leaseStartDate: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="leaseEndDate">Lease End Date</label>
                    <input
                      id="leaseEndDate"
                      type="date"
                      className="form-input"
                      value={form.leaseEndDate}
                      onChange={e => setForm({ ...form, leaseEndDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="notes">Agreement Notes & Deposit Terms</label>
                  <textarea
                    id="notes"
                    className="form-textarea"
                    rows="2"
                    placeholder="e.g. 10 months advance received via NEFT. 1 month notice period required before vacating."
                    value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="invoice-modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowHouseModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : (editingHouse ? 'Save Changes' : 'Register House & Advance')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= RENT PAYMENT & HISTORY MODAL ================= */}
      {payingHouse && (
        <div className="modal-backdrop centered" onClick={() => setPayingHouse(null)}>
          <div className="invoice-modal centered" style={{ maxWidth: '780px', width: '95%' }} onClick={e => e.stopPropagation()}>
            <div className="invoice-modal-header">
              <div>
                <h3 style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CreditCard size={20} style={{ color: 'var(--primary)' }} />
                  Rent Collection & Ledger — {payingHouse.propertyName}
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Tenant: <strong>{payingHouse.tenantName}</strong> ({payingHouse.tenantPhone}) | Unit: {payingHouse.unitNumber}
                </p>
              </div>
              <button onClick={() => setPayingHouse(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div className="invoice-modal-body" style={{ maxHeight: '72vh', padding: '20px 24px', overflowY: 'auto' }}>
              
              {/* Tenant & Advance Summary Banner */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr 1fr', 
                gap: '12px', 
                padding: '14px', 
                backgroundColor: 'var(--bg-secondary)', 
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid var(--border-color)'
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Monthly Rent</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>
                    ₹{parseFloat(payingHouse.monthlyRent).toLocaleString('en-IN')}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: '#047857', textTransform: 'uppercase', fontWeight: 700 }}>Security Advance Held</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#047857' }}>
                    ₹{parseFloat(payingHouse.advanceAmount).toLocaleString('en-IN')}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Rent Due Day</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                    {payingHouse.rentDueDay ? `${payingHouse.rentDueDay}th of month` : '1st of month'}
                  </div>
                </div>
              </div>

              {/* Record Payment Form */}
              <form onSubmit={handleRecordPayment} style={{ 
                padding: '16px', 
                border: '1.5px dashed var(--primary)', 
                borderRadius: '8px', 
                backgroundColor: 'rgba(59, 130, 246, 0.03)',
                marginBottom: '24px'
              }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Plus size={16} /> Record Rent Collection Receipt
                </h4>

                <div className="form-grid" style={{ marginBottom: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Rent Month / Period *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. September 2026"
                      value={paymentForm.month}
                      onChange={e => setPaymentForm({ ...paymentForm, month: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Amount Paid (INR) *</label>
                    <input
                      type="number"
                      step="any"
                      className="form-input"
                      placeholder="15000"
                      value={paymentForm.amount}
                      onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-grid" style={{ marginBottom: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Payment Date *</label>
                    <input
                      type="date"
                      className="form-input"
                      value={paymentForm.paidDate}
                      onChange={e => setPaymentForm({ ...paymentForm, paidDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Payment Mode</label>
                    <select
                      className="form-select"
                      value={paymentForm.paymentMode}
                      onChange={e => setPaymentForm({ ...paymentForm, paymentMode: e.target.value })}
                    >
                      <option value="GPay / UPI">GPay / PhonePe / UPI</option>
                      <option value="Bank Transfer">Bank Transfer / NEFT / IMPS</option>
                      <option value="Cash">Cash</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  </div>
                </div>

                <div className="form-grid" style={{ marginBottom: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Transaction / Ref ID (Optional)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. UPI Ref #492810928"
                      value={paymentForm.referenceId}
                      onChange={e => setPaymentForm({ ...paymentForm, referenceId: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Notes</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. On-time payment"
                      value={paymentForm.notes}
                      onChange={e => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
                    <CheckCircle2 size={16} /> Save Rent Payment & Generate Receipt
                  </button>
                </div>
              </form>

              {/* Past Rent Payment History Table */}
              <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '12px' }}>
                Payment History ({payingHouse.paymentHistory?.length || 0} Receipts)
              </h4>

              {(!payingHouse.paymentHistory || payingHouse.paymentHistory.length === 0) ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                  No payment receipts recorded yet. Use the form above to record rent payments.
                </div>
              ) : (
                <div className="table-responsive-container" style={{ border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Receipt #</th>
                        <th>Rent Month</th>
                        <th>Payment Date</th>
                        <th style={{ textAlign: 'right' }}>Amount Paid</th>
                        <th>Payment Mode</th>
                        <th>Ref #</th>
                        <th style={{ textAlign: 'center' }}>Receipt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payingHouse.paymentHistory.map((p) => (
                        <tr key={p.id}>
                          <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{p.receiptNo}</td>
                          <td style={{ fontWeight: 600 }}>{p.month}</td>
                          <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{p.paidDate}</td>
                          <td style={{ textAlign: 'right', fontWeight: 800, color: '#059669' }}>
                            ₹{parseFloat(p.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td>
                            <span className="badge badge-secondary">{p.paymentMode}</span>
                          </td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{p.referenceId || '—'}</td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              className="btn btn-outline"
                              onClick={() => setViewingReceipt({ house: payingHouse, payment: p })}
                              style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Printer size={12} /> View Receipt
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>

            <div className="invoice-modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setPayingHouse(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= PRINTABLE RENT RECEIPT MODAL ================= */}
      {viewingReceipt && (
        <div className="modal-backdrop centered" onClick={() => setViewingReceipt(null)}>
          <div className="invoice-modal centered" style={{ maxWidth: '620px', width: '95%', backgroundColor: '#fff', color: '#111' }} onClick={e => e.stopPropagation()}>
            <div className="invoice-modal-header" style={{ borderBottom: '1px solid #e2e8f0', padding: '14px 20px', backgroundColor: '#f8fafc' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>
                House Rent Payment Receipt
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-primary" onClick={handlePrintReceipt} style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
                  <Printer size={15} /> Print Receipt
                </button>
                <button onClick={() => setViewingReceipt(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>
            </div>

            <div ref={receiptPrintRef} style={{ padding: '30px', fontFamily: "'Inter', sans-serif", fontSize: '13px', lineHeight: 1.5 }}>
              {/* Receipt Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: '14px', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    HOUSE RENT RECEIPT
                  </h2>
                  <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '2px' }}>
                    Amigo Webster Property Management
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, color: '#047857', fontSize: '1.05rem' }}>
                    {viewingReceipt.payment.receiptNo}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                    Date: {viewingReceipt.payment.paidDate}
                  </div>
                </div>
              </div>

              {/* Receipt Content */}
              <div style={{ marginBottom: '20px' }}>
                <p style={{ margin: '8px 0' }}>
                  Received with thanks from <strong>{viewingReceipt.house.tenantName}</strong> ({viewingReceipt.house.tenantPhone})
                </p>
                <p style={{ margin: '8px 0' }}>
                  the sum of <strong style={{ fontSize: '1.1rem', color: '#047857' }}>₹{parseFloat(viewingReceipt.payment.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                </p>
                <p style={{ margin: '8px 0' }}>
                  towards monthly house rent for the month of <strong>{viewingReceipt.payment.month}</strong>
                </p>
                <p style={{ margin: '8px 0' }}>
                  for property: <strong>{viewingReceipt.house.propertyName}</strong> ({viewingReceipt.house.unitNumber || 'Main Unit'}).
                </p>
              </div>

              {/* Details Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', border: '1px solid #cbd5e1' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 600, width: '40%' }}>Monthly Rent Rate</td>
                    <td style={{ padding: '8px 12px', fontWeight: 700 }}>₹{parseFloat(viewingReceipt.house.monthlyRent).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 600, color: '#047857' }}>Security Advance on Record</td>
                    <td style={{ padding: '8px 12px', fontWeight: 800, color: '#047857' }}>₹{parseFloat(viewingReceipt.house.advanceAmount).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 600 }}>Payment Mode</td>
                    <td style={{ padding: '8px 12px' }}>{viewingReceipt.payment.paymentMode}</td>
                  </tr>
                  {viewingReceipt.payment.referenceId && viewingReceipt.payment.referenceId !== '—' && (
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 600 }}>Transaction / Ref #</td>
                      <td style={{ padding: '8px 12px' }}>{viewingReceipt.payment.referenceId}</td>
                    </tr>
                  )}
                  <tr>
                    <td style={{ padding: '8px 12px', fontWeight: 600 }}>Payment Status</td>
                    <td style={{ padding: '8px 12px', color: '#047857', fontWeight: 700 }}>PAID / RECEIVED</td>
                  </tr>
                </tbody>
              </table>

              {/* Signatures */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', paddingTop: '20px' }}>
                <div>
                  <div style={{ borderTop: '1px solid #94a3b8', width: '160px', textAlign: 'center', paddingTop: '6px', fontSize: '0.85rem' }}>
                    Tenant Signature
                  </div>
                </div>
                <div>
                  <div style={{ borderTop: '1px solid #94a3b8', width: '160px', textAlign: 'center', paddingTop: '6px', fontSize: '0.85rem', fontWeight: 700 }}>
                    Landlord / Amigo Webster
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      {deletingHouse && (
        <div className="modal-backdrop centered" onClick={() => setDeletingHouse(null)}>
          <div className="invoice-modal centered" style={{ maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
            <div className="invoice-modal-header" style={{ borderBottom: 'none' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)', fontWeight: 800 }}>
                <ShieldAlert size={22} />
                Delete House Profile?
              </h3>
            </div>
            <div className="invoice-modal-body" style={{ padding: '0 24px 20px 24px' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Are you sure you want to delete <strong>{deletingHouse.propertyName}</strong> (Tenant: {deletingHouse.tenantName})? All associated rent receipts and advance records will be removed.
              </p>
            </div>
            <div className="invoice-modal-footer" style={{ borderTop: 'none' }}>
              <button type="button" className="btn btn-outline" onClick={() => setDeletingHouse(null)}>Cancel</button>
              <button type="button" className="btn btn-danger" onClick={handleDeleteConfirm}>
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
