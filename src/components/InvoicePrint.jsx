import React from 'react';
import { X, Printer } from 'lucide-react';

const getStateFromCity = (city) => {
  if (!city) return 'Tamil Nadu';
  const cleanCity = city.trim().toLowerCase();
  
  const cityToStateMap = {
    chennai: 'Tamil Nadu',
    coimbatore: 'Tamil Nadu',
    madurai: 'Tamil Nadu',
    trichy: 'Tamil Nadu',
    salem: 'Tamil Nadu',
    tirunelveli: 'Tamil Nadu',
    vellore: 'Tamil Nadu',
    erode: 'Tamil Nadu',
    thanjavur: 'Tamil Nadu',
    vengambakkam: 'Tamil Nadu',
    kilkattalai: 'Tamil Nadu',
    
    mumbai: 'Maharashtra',
    pune: 'Maharashtra',
    nagpur: 'Maharashtra',
    thane: 'Maharashtra',
    nashik: 'Maharashtra',
    
    bangalore: 'Karnataka',
    bengaluru: 'Karnataka',
    mysore: 'Karnataka',
    hubli: 'Karnataka',
    mangalore: 'Karnataka',
    
    delhi: 'Delhi',
    'new delhi': 'Delhi',
    noida: 'Uttar Pradesh',
    gurugram: 'Haryana',
    gurgaon: 'Haryana',
    
    hyderabad: 'Telangana',
    secunderabad: 'Telangana',
    visakhapatnam: 'Andhra Pradesh',
    
    kolkata: 'West Bengal',
    
    ahmedabad: 'Gujarat',
    surat: 'Gujarat',
    vadodara: 'Gujarat',
    
    jaipur: 'Rajasthan',
    lucknow: 'Uttar Pradesh',
    patna: 'Bihar',
    bhopal: 'Madhya Pradesh',
    indore: 'Madhya Pradesh',
    kochi: 'Kerala',
    trivandrum: 'Kerala'
  };

  return cityToStateMap[cleanCity] || 'Tamil Nadu';
};

export default function InvoicePrint({ invoice, onClose }) {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  let parsedItems = [];
  try {
    parsedItems = typeof invoice.items === 'string' ? JSON.parse(invoice.items) : invoice.items;
    if (!Array.isArray(parsedItems)) parsedItems = [];
  } catch (e) {
    parsedItems = [];
  }

  // Fallback for older invoice entries
  if (parsedItems.length === 0) {
    parsedItems = [
      {
        title: invoice.service_name || 'Website Design & Development',
        description: 'Design and Development Services',
        rate: invoice.amount,
        qty: 1,
        amount: invoice.amount
      }
    ];
  }

  const subTotal = parseFloat(invoice.amount) || 0;
  
  // Dynamic Tax Calculation based on interstate customer rules
  const customerState = getStateFromCity(invoice.city);
  const isInterState = customerState.trim().toLowerCase() !== 'tamil nadu';
  
  let cgstRate = 0;
  let sgstRate = 0;
  let igstRate = 0;
  
  if (isInterState) {
    igstRate = invoice.gst_rate !== undefined ? parseFloat(invoice.gst_rate) : 18;
  } else {
    cgstRate = (invoice.gst_rate !== undefined ? parseFloat(invoice.gst_rate) : 18) / 2;
    sgstRate = cgstRate;
  }
  
  const cgstAmount = subTotal * (cgstRate / 100);
  const sgstAmount = subTotal * (sgstRate / 100);
  const igstAmount = subTotal * (igstRate / 100);
  const grandTotal = subTotal + cgstAmount + sgstAmount + igstAmount;

  // Currency formatter matching image representation
  const formatCurrency = (val) => {
    const num = parseFloat(val) || 0;
    if (num % 1 === 0) {
      return '₹ ' + Math.round(num).toLocaleString('en-IN');
    }
    return '₹ ' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="modal-backdrop centered" onClick={onClose}>
      <div className="invoice-modal centered" style={{ maxWidth: '800px', width: '95%', backgroundColor: '#fff', color: '#333' }} onClick={e => e.stopPropagation()}>
        
        {/* Modal Controls (Not printed) */}
        <div className="invoice-modal-header" style={{ borderBottom: '1px solid #ddd', padding: '16px 24px', backgroundColor: '#f9fafb' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#111' }}>Print Invoice Receipt</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-primary" onClick={handlePrint} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              <Printer size={16} /> Print
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Invoice Printable Sheet */}
        <div className="invoice-modal-body" style={{
          padding: '24px 32px',
          backgroundColor: '#ffffff',
          color: '#333333',
          fontFamily: "'Inter', sans-serif",
          fontSize: '8pt',
          lineHeight: '1.35'
        }}>
          
          {/* Header Grid */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            {/* Left Company Block */}
            <div style={{ width: '55%' }}>
              <div style={{
                backgroundColor: '#3b4b5a',
                color: '#ffffff',
                padding: '6px 20px',
                fontWeight: '700',
                fontSize: '1.2em',
                letterSpacing: '1.5px',
                width: '180px',
                textAlign: 'center',
                borderRadius: '2px',
                marginBottom: '10px'
              }}>
                INVOICE
              </div>
              <h2 style={{ fontSize: '1.5em', fontWeight: 800, color: '#111', lineHeight: '1.2', marginBottom: '4px', fontFamily: "'Outfit', sans-serif" }}>
                Amigo Webster
              </h2>
              <div style={{ color: '#333', fontSize: '0.95em', lineHeight: '1.4' }}>
                <p>Plot No 6 Anna Main Road Vengambakkam,</p>
                <p>Chennai - 600129</p>
                <p style={{ marginTop: '2px' }}>Mob: 9445332233</p>
                <p>Email: balaji@amigowebster.com</p>
              </div>
            </div>

            {/* Right Logo Block (AMIGO WEBSTER Logo image) */}
            <div style={{ width: '40%', textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <img 
                src="/logo.png" 
                alt="Amigo Webster Logo" 
                style={{ 
                  maxHeight: '68px', 
                  width: 'auto', 
                  marginBottom: '12px',
                  objectFit: 'contain'
                }} 
              />
            </div>
          </div>

          {/* Metadata & Billing Address Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginBottom: '20px' }}>
            
            {/* BILL TO Client Box */}
            <div style={{
              width: '58%',
              border: 'none',
              borderRadius: '4px',
              padding: '12px 14px',
              backgroundColor: '#f8fafc'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95em' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '30%', padding: '4px 0', color: '#475569', fontWeight: 700 }}>BILL TO:</td>
                    <td style={{ padding: '4px 0 4px 6px', fontWeight: '700', color: '#1e293b', borderBottom: '1px solid #111' }}>{invoice.customer_name}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px 0', color: '#475569', fontWeight: 600 }}>Company Name</td>
                    <td style={{ padding: '4px 0 4px 6px', fontWeight: '700', color: '#1e293b', borderBottom: '1px solid #111' }}>{invoice.customer_name}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px 0', color: '#475569', fontWeight: 600, verticalAlign: 'top', paddingTop: '4px' }}>Address</td>
                    <td style={{ 
                      padding: '4px 0 4px 6px', 
                      color: '#333', 
                      lineHeight: '20px',
                      backgroundImage: 'linear-gradient(to bottom, transparent 19px, #111 19px)',
                      backgroundSize: '100% 20px',
                      whiteSpace: 'normal', 
                      wordBreak: 'break-word' 
                    }}>
                      {invoice.address || 'No. 303, C Block, Sapthagiri Sandalwood, Krishnarajapuram, Kadugodi, Bengaluru,'}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px 0', color: '#475569', fontWeight: 600 }}>Pincode</td>
                    <td style={{ padding: '4px 0 4px 6px', color: '#333', borderBottom: '1px solid #111' }}>{invoice.pincode || '560067'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px 0', color: '#475569', fontWeight: 600 }}>State</td>
                    <td style={{ padding: '4px 0 4px 6px', color: '#333', borderBottom: '1px solid #111' }}>
                      {getStateFromCity(invoice.city)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px 0', color: '#475569', fontWeight: 600 }}>GST</td>
                    <td style={{ padding: '4px 0 4px 6px', color: '#333', borderBottom: '1px solid #111' }}>
                      {invoice.gst_no || '29ABQCS5582H1ZJ'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Invoice Details Table */}
            <div style={{ width: '38%' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse', 
                border: '1.5px solid #2b3e50', 
                fontSize: '0.9em',
                textAlign: 'left'
              }}>
                <tbody>
                  {[
                    { label: 'Invoice #', val: invoice.invoice_no },
                    { label: 'Invoice Date', val: new Date(invoice.invoice_date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) },
                    { label: 'Quotation #', val: '—' },
                    { label: 'Quotation Date', val: '—' },
                    { label: 'PO Reference', val: '—' },
                    { label: 'PO Date', val: '—' },
                    { label: 'Vendor Code', val: '—' }
                  ].map((row, idx) => (
                    <tr key={idx}>
                      <th style={{ 
                        padding: '4px 8px', 
                        fontWeight: '600', 
                        color: '#333', 
                        border: '1.5px solid #2b3e50',
                        backgroundColor: '#ffffff',
                        width: '50%',
                        whiteSpace: 'normal' 
                      }}>
                        {row.label}
                      </th>
                      <td style={{ 
                        padding: '4px 8px', 
                        color: '#1e293b', 
                        fontWeight: '600', 
                        textAlign: 'center', 
                        border: '1.5px solid #2b3e50',
                        whiteSpace: 'normal' 
                      }}>
                        {row.val}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Description Itemized Table */}
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse', 
            border: '1.5px solid #2b3e50', 
            marginBottom: '16px'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#3b4b5a', color: '#ffffff' }}>
                <th style={{ padding: '8px', fontSize: '0.95em', fontWeight: '700', textAlign: 'center', border: '1.5px solid #2b3e50', width: '8%', whiteSpace: 'normal' }}>S. No</th>
                <th style={{ padding: '8px', fontSize: '0.95em', fontWeight: '700', textAlign: 'left', border: '1.5px solid #2b3e50', width: '52%', whiteSpace: 'normal' }}>DESCRIPTION OF ITEMS</th>
                <th style={{ padding: '8px', fontSize: '0.95em', fontWeight: '700', textAlign: 'center', border: '1.5px solid #2b3e50', width: '12%', whiteSpace: 'normal' }}>HSN / SAC</th>
                <th style={{ padding: '8px', fontSize: '0.95em', fontWeight: '700', textAlign: 'center', border: '1.5px solid #2b3e50', width: '8%', whiteSpace: 'normal' }}>QTY</th>
                <th style={{ padding: '8px', fontSize: '0.95em', fontWeight: '700', textAlign: 'right', border: '1.5px solid #2b3e50', width: '10%', whiteSpace: 'normal' }}>PRICE</th>
                <th style={{ padding: '8px', fontSize: '0.95em', fontWeight: '700', textAlign: 'right', border: '1.5px solid #2b3e50', width: '10%', whiteSpace: 'normal' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {/* Service scope message row inside table body - right below table headers and before first product row */}
              <tr>
                <td colSpan={6} style={{ 
                  padding: '10px 12px', 
                  borderBottom: '1.5px solid #2b3e50', 
                  fontSize: '1em', 
                  lineHeight: '1.4', 
                  color: '#111',
                  backgroundColor: '#ffffff',
                  textAlign: 'left'
                }}>
                  Towards the charges of Design and Development
                  <br />
                  <strong style={{ color: '#111', fontSize: '1.05em' }}>
                    {invoice.project_brief || invoice.service_name || 'SEO Audit & Optimization'}
                  </strong>
                </td>
              </tr>
              {parsedItems.map((item, idx) => (
                <tr key={idx} style={{ verticalAlign: 'top', backgroundColor: idx % 2 === 1 ? '#f8fafc' : '#ffffff' }}>
                  <td style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1', whiteSpace: 'normal' }}>{idx + 1}</td>
                  <td style={{ padding: '8px', color: '#1e293b', borderRight: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                    <div style={{ fontWeight: '600' }}>{item.title}</div>
                    {item.description && (
                      <div style={{ fontSize: '0.85em', color: '#64748b', marginTop: '2px', fontWeight: 'normal' }}>
                        {item.description}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'center', color: '#475569', borderRight: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1', whiteSpace: 'normal' }}>998382</td>
                  <td style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1', whiteSpace: 'normal' }}>{item.qty}</td>
                  <td style={{ padding: '8px', textAlign: 'right', fontWeight: '500', borderRight: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1', whiteSpace: 'normal' }}>
                    {formatCurrency(item.rate)}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'right', fontWeight: '600', borderBottom: '1px solid #cbd5e1', whiteSpace: 'normal' }}>
                    {formatCurrency(item.amount)}
                  </td>
                </tr>
              ))}
              {/* Fill mock empty rows to match paper layout look */}
              {Array.from({ length: Math.max(0, 4 - parsedItems.length) }).map((_, idx) => {
                const globalIdx = parsedItems.length + idx;
                return (
                  <tr key={`empty-${idx}`} style={{ height: '24px', backgroundColor: globalIdx % 2 === 0 ? '#f8fafc' : '#ffffff' }}>
                    <td style={{ borderRight: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1' }}></td>
                    <td style={{ borderRight: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1' }}></td>
                    <td style={{ borderRight: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1' }}></td>
                    <td style={{ borderRight: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1' }}></td>
                    <td style={{ borderRight: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1' }}></td>
                    <td style={{ borderBottom: '1px solid #cbd5e1' }}></td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Footer Grid - Banks and Totals */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
            
            {/* Left Column: Customer Code and Bank Details */}
            <div style={{ width: '58%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.95em', borderBottom: '1px solid #111', paddingBottom: '3px' }}>
                <span style={{ color: '#475569', fontWeight: 600 }}>Customer Code:</span>
                <strong style={{ marginLeft: '8px', color: '#111' }}>{invoice.customer_id_seq}</strong>
              </div>
              
              {/* Bank Details Lines with underlines */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9em', marginTop: '4px' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '4px 0', fontWeight: '700', color: '#111', borderBottom: '1px solid #111' }}>Amigo Webster</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px 0', color: '#333', borderBottom: '1px solid #111' }}>Bank: <strong>STATE BANK OF INDIA</strong></td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px 0', color: '#333', borderBottom: '1px solid #111' }}>Account Number: <strong>43126406283</strong></td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px 0', color: '#333', borderBottom: '1px solid #111' }}>Branch: <strong>Kilkattalai</strong></td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px 0', color: '#333', borderBottom: '1px solid #111' }}>IFSC Code: <strong>SBIN0016545</strong></td>
                  </tr>
                </tbody>
              </table>

              {/* Signatures on the left */}
              <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ borderBottom: '1px solid #111', width: '220px', display: 'flex', justifyContent: 'space-between', fontSize: '0.95em', paddingBottom: '3px' }}>
                  <span style={{ color: '#475569', fontWeight: 600 }}>Customer :</span>
                  <span></span>
                </div>
                <div style={{ borderBottom: '1px solid #111', width: '220px', display: 'flex', justifyContent: 'space-between', fontSize: '0.95em', paddingBottom: '3px', marginTop: '10px' }}>
                  <span style={{ color: '#475569', fontWeight: 600 }}>Authorized Signatory</span>
                  <span></span>
                </div>
              </div>
            </div>

            {/* Right Column: Totals details */}
            <div style={{ width: '38%' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse', 
                fontSize: '0.95em',
                lineHeight: '1.6'
              }}>
                <tbody>
                  <tr style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #cbd5e1' }}>
                    <td style={{ padding: '4px 8px', color: '#475569', fontWeight: 500 }}>Sub Total</td>
                    <td style={{ padding: '4px 8px', textAlign: 'right', fontWeight: '600' }}>
                      {formatCurrency(subTotal)}
                    </td>
                  </tr>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                    <td style={{ padding: '4px 8px', color: '#475569', fontWeight: 500, display: 'flex', justifyContent: 'space-between' }}>
                      <span>Discount</span>
                      <span style={{ fontSize: '0.85em', color: '#64748b' }}>₹ 0</span>
                    </td>
                    <td style={{ padding: '4px 8px', textAlign: 'right', fontWeight: '600' }}>
                      ₹ 0
                    </td>
                  </tr>
                  <tr style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #cbd5e1' }}>
                    <td style={{ padding: '4px 8px', color: '#475569', fontWeight: 500, display: 'flex', justifyContent: 'space-between' }}>
                      <span>CGST</span>
                      <span style={{ fontSize: '0.85em', color: '#64748b' }}>{cgstRate}%</span>
                    </td>
                    <td style={{ padding: '4px 8px', textAlign: 'right', fontWeight: '600' }}>
                      {formatCurrency(cgstAmount)}
                    </td>
                  </tr>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                    <td style={{ padding: '4px 8px', color: '#475569', fontWeight: 500, display: 'flex', justifyContent: 'space-between' }}>
                      <span>SGST</span>
                      <span style={{ fontSize: '0.85em', color: '#64748b' }}>{sgstRate}%</span>
                    </td>
                    <td style={{ padding: '4px 8px', textAlign: 'right', fontWeight: '600' }}>
                      {formatCurrency(sgstAmount)}
                    </td>
                  </tr>
                  <tr style={{ backgroundColor: '#ffffff', borderBottom: '1.5px solid #1e293b' }}>
                    <td style={{ padding: '4px 8px', color: '#475569', fontWeight: 500, display: 'flex', justifyContent: 'space-between' }}>
                      <span>IGST</span>
                      <span style={{ fontSize: '0.85em', color: '#64748b' }}>{igstRate}%</span>
                    </td>
                    <td style={{ padding: '4px 8px', textAlign: 'right', fontWeight: '600' }}>
                      {formatCurrency(igstAmount)}
                    </td>
                  </tr>
                  <tr style={{ backgroundColor: '#f8fafc', fontSize: '1.1em', fontWeight: '800' }}>
                    <td style={{ padding: '6px 8px', color: '#2b3e50' }}>Grand Total</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', color: '#2b3e50' }}>
                      {formatCurrency(grandTotal)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Remarks and Signatures section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginTop: '24px', alignItems: 'flex-end' }}>
            
            {/* Remarks Box */}
            <div style={{ width: '58%' }}>
              <div style={{ fontSize: '0.85em', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Remarks / Declaration</div>
              <div style={{
                border: '1.5px solid #2b3e50',
                borderRadius: '2px',
                height: '75px',
                padding: '8px',
                fontSize: '0.8em',
                color: '#333',
                lineHeight: '1.4'
              }}>
                1. Please remit payments within 15 days of invoice date.
                <br />
                2. Goods/Services once delivered are subject to contract terms.
              </div>
            </div>

            {/* Authorised Signatures */}
            <div style={{ width: '38%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }}>
              <div style={{ fontSize: '0.95em', fontWeight: 700, color: '#111', marginBottom: '8px' }}>
                For Amigo Webster
              </div>

              {/* Signature Graphic SVG */}
              <div style={{ height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '4px 0' }}>
                <svg width="100" height="36" viewBox="0 0 100 36" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 10 20 Q 20 5, 30 25 T 50 10 T 70 25 T 90 15" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" />
                  <path d="M 25 10 Q 35 30, 45 10" fill="none" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>

              <div style={{ borderBottom: '1.5px solid #111', width: '160px', marginBottom: '4px' }}></div>
              <div style={{ fontSize: '0.9em', fontWeight: '700', color: '#111' }}>
                Proprietor
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
