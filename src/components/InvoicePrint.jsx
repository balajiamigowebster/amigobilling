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
        <div className="invoice-modal-body printable-invoice" style={{
          padding: '12px 20px',
          backgroundColor: '#ffffff',
          color: '#333333',
          fontFamily: "'Inter', sans-serif",
          fontSize: '8px',
          lineHeight: '1.3'
        }}>
          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          
          {/* Header Grid */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            {/* Left Company Block */}
            <div style={{ width: '55%' }}>
              <div style={{
                backgroundColor: '#3b4b5a',
                color: '#ffffff',
                padding: '4px 16px',
                fontWeight: '700',
                fontSize: '1.25em',
                letterSpacing: '1px',
                width: '150px',
                textAlign: 'center',
                borderRadius: '2px',
                marginBottom: '6px'
              }}>
                INVOICE
              </div>
              <h2 style={{ fontSize: '1.75em', fontWeight: 800, color: '#111', lineHeight: '1.2', marginBottom: '4px', fontFamily: "'Outfit', sans-serif" }}>
                Amigo Webster
              </h2>
              <div style={{ color: '#333', fontSize: '1.2em', lineHeight: '1.45' }}>
                <p>Plot No 6 Anna Main Road Vengambakkam,</p>
                <p>Chennai - 600128</p>
                <p style={{ marginTop: '1px' }}>Mob: 9445332233</p>
                <p>Email: balaji@amigowebster.com</p>
              </div>
            </div>

            {/* Right Logo Block (AMIGO WEBSTER Logo image) */}
            <div style={{ width: '40%', textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <img 
                src="/logo.png" 
                alt="Amigo Webster Logo" 
                style={{ 
                  maxHeight: '48px', 
                  width: 'auto', 
                  marginBottom: '6px',
                  objectFit: 'contain'
                }} 
              />
            </div>
          </div>

          {/* Metadata & Billing Address Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '8px' }}>
            
            {/* BILL TO Client Box */}
            <div style={{
              width: '58%',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 10px',
              backgroundColor: '#f8fafc'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.92em' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '30%', padding: '2px 0', color: '#475569', fontWeight: 700 }}>BILL TO:</td>
                    <td style={{ padding: '2px 0 2px 4px', fontWeight: '700', color: '#1e293b', borderBottom: '1px solid #cbd5e1' }}>{invoice.customer_name}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '2px 0', color: '#475569', fontWeight: 600 }}>Company Name</td>
                    <td style={{ padding: '2px 0 2px 4px', fontWeight: '700', color: '#1e293b', borderBottom: '1px solid #cbd5e1' }}>{invoice.customer_name}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '2px 0', color: '#475569', fontWeight: 600, verticalAlign: 'top', paddingTop: '2px' }}>Address</td>
                    <td style={{ 
                      padding: '2px 0 2px 4px', 
                      color: '#333', 
                      lineHeight: '18px',
                      backgroundImage: 'linear-gradient(to bottom, transparent 17px, #cbd5e1 17px)',
                      backgroundSize: '100% 18px',
                      whiteSpace: 'normal', 
                      wordBreak: 'break-word' 
                    }}>
                      {invoice.address || 'No. 303, C Block, Sapthagiri Sandalwood, Krishnarajapuram, Kadugodi, Bengaluru,'}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '2px 0', color: '#475569', fontWeight: 600 }}>Pincode</td>
                    <td style={{ padding: '2px 0 2px 4px', color: '#333', borderBottom: '1px solid #cbd5e1' }}>{invoice.pincode || '560067'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '2px 0', color: '#475569', fontWeight: 600 }}>State</td>
                    <td style={{ padding: '2px 0 2px 4px', color: '#333', borderBottom: '1px solid #cbd5e1' }}>
                      {getStateFromCity(invoice.city)}
                    </td>
                  </tr>
                  {invoice.gst_no && invoice.gst_no.trim() !== '' && (
                    <tr>
                      <td style={{ padding: '2px 0', color: '#475569', fontWeight: 600 }}>GST</td>
                      <td style={{ padding: '2px 0 2px 4px', color: '#333', borderBottom: '1px solid #cbd5e1' }}>
                        {invoice.gst_no}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Invoice Details Table */}
            <div style={{ width: '38%' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse', 
                border: '1px solid #cbd5e1', 
                fontSize: '0.88em',
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
                        padding: '3px 6px', 
                        fontWeight: '600', 
                        color: '#333', 
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#ffffff',
                        width: '50%',
                        whiteSpace: 'normal' 
                      }}>
                        {row.label}
                      </th>
                      <td style={{ 
                        padding: '3px 6px', 
                        color: '#1e293b', 
                        fontWeight: '600', 
                        textAlign: 'center', 
                        border: '1px solid #cbd5e1',
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
            border: '1px solid #cbd5e1', 
            marginBottom: '8px'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#3b4b5a', color: '#ffffff' }}>
                <th style={{ padding: '6px 4px', fontSize: '11px', fontWeight: '700', textAlign: 'center', border: '1px solid #cbd5e1', width: '8%', whiteSpace: 'normal' }}>S. NO</th>
                <th style={{ padding: '6px 4px', fontSize: '11px', fontWeight: '700', textAlign: 'left', border: '1px solid #cbd5e1', width: '52%', whiteSpace: 'normal' }}>DESCRIPTION OF ITEMS</th>
                <th style={{ padding: '6px 4px', fontSize: '11px', fontWeight: '700', textAlign: 'center', border: '1px solid #cbd5e1', width: '12%', whiteSpace: 'normal' }}>HSN / SAC</th>
                <th style={{ padding: '6px 4px', fontSize: '11px', fontWeight: '700', textAlign: 'center', border: '1px solid #cbd5e1', width: '8%', whiteSpace: 'normal' }}>QTY</th>
                <th style={{ padding: '6px 4px', fontSize: '11px', fontWeight: '700', textAlign: 'right', border: '1px solid #cbd5e1', width: '10%', whiteSpace: 'normal' }}>PRICE</th>
                <th style={{ padding: '6px 4px', fontSize: '11px', fontWeight: '700', textAlign: 'right', border: '1px solid #cbd5e1', width: '10%', whiteSpace: 'normal' }}>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {/* Service scope message row inside table body - right below table headers and before first product row */}
              <tr>
                <td colSpan={6} style={{ 
                  padding: '6px 8px', 
                  borderBottom: '1px solid #cbd5e1', 
                  fontSize: '0.95em', 
                  lineHeight: '1.3', 
                  color: '#111',
                  backgroundColor: '#ffffff',
                  textAlign: 'left'
                }}>
                  Towards the charges of Design and Development
                  <br />
                  <strong style={{ color: '#111', fontSize: '1em' }}>
                    {invoice.project_brief || invoice.service_name || 'SEO Audit & Optimization'}
                  </strong>
                </td>
              </tr>
              {parsedItems.map((item, idx) => (
                <tr key={idx} style={{ verticalAlign: 'top', backgroundColor: idx % 2 === 1 ? '#f8fafc' : '#ffffff' }}>
                  <td style={{ padding: '4px 6px', textAlign: 'center', borderRight: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1', whiteSpace: 'normal' }}>{idx + 1}</td>
                  <td style={{ padding: '4px 6px', color: '#1e293b', borderRight: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                    <div style={{ fontWeight: '600' }}>{item.title}</div>
                    {item.description && (
                      <div style={{ fontSize: '0.82em', color: '#64748b', marginTop: '1px', fontWeight: 'normal' }}>
                        {item.description}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '4px 6px', textAlign: 'center', color: '#475569', borderRight: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1', whiteSpace: 'normal' }}>998382</td>
                  <td style={{ padding: '4px 6px', textAlign: 'center', borderRight: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1', whiteSpace: 'normal' }}>{item.qty}</td>
                  <td style={{ padding: '4px 6px', textAlign: 'right', fontWeight: '500', borderRight: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1', whiteSpace: 'normal' }}>
                    {formatCurrency(item.rate)}
                  </td>
                  <td style={{ padding: '4px 6px', textAlign: 'right', fontWeight: '600', borderBottom: '1px solid #cbd5e1', whiteSpace: 'normal' }}>
                    {formatCurrency(item.amount)}
                  </td>
                </tr>
              ))}
              {/* Fill mock empty rows to match paper layout look (Guarantees at least 6 line items space!) */}
              {Array.from({ length: Math.max(0, 6 - parsedItems.length) }).map((_, idx) => {
                const globalIdx = parsedItems.length + idx;
                return (
                  <tr key={`empty-${idx}`} style={{ height: '18px', backgroundColor: globalIdx % 2 === 0 ? '#f8fafc' : '#ffffff' }}>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
            
            {/* Left Column: Customer Code and Signatures */}
            <div style={{ width: '58%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.92em', borderBottom: '1px solid #cbd5e1', paddingBottom: '2px' }}>
                <span style={{ color: '#475569', fontWeight: 600 }}>Customer Code:</span>
                <strong style={{ marginLeft: '8px', color: '#111' }}>{invoice.customer_id_seq}</strong>
              </div>

              {/* Signatures on the left */}
              <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ borderBottom: '1px solid #cbd5e1', width: '200px', display: 'flex', justifyContent: 'space-between', fontSize: '0.92em', paddingBottom: '2px' }}>
                  <span style={{ color: '#475569', fontWeight: 600 }}>Customer :</span>
                  <span></span>
                </div>
                <div style={{ borderBottom: '1px solid #cbd5e1', width: '200px', display: 'flex', justifyContent: 'space-between', fontSize: '0.92em', paddingBottom: '2px', marginTop: '4px' }}>
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
                fontSize: '0.92em',
                lineHeight: '1.4'
              }}>
                <tbody>
                  <tr style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #cbd5e1' }}>
                    <td style={{ padding: '3px 6px', color: '#475569', fontWeight: 500 }}>Sub Total</td>
                    <td style={{ padding: '3px 6px', textAlign: 'right', fontWeight: '600' }}>
                      {formatCurrency(subTotal)}
                    </td>
                  </tr>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                    <td style={{ padding: '3px 6px', color: '#475569', fontWeight: 500, display: 'flex', justifyContent: 'space-between' }}>
                      <span>Discount</span>
                      <span style={{ fontSize: '0.82em', color: '#64748b' }}>₹ 0</span>
                    </td>
                    <td style={{ padding: '3px 6px', textAlign: 'right', fontWeight: '600' }}>
                      ₹ 0
                    </td>
                  </tr>
                  <tr style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #cbd5e1' }}>
                    <td style={{ padding: '3px 6px', color: '#475569', fontWeight: 500, display: 'flex', justifyContent: 'space-between' }}>
                      <span>CGST</span>
                      <span style={{ fontSize: '0.82em', color: '#64748b' }}>{cgstRate}%</span>
                    </td>
                    <td style={{ padding: '3px 6px', textAlign: 'right', fontWeight: '600' }}>
                      {formatCurrency(cgstAmount)}
                    </td>
                  </tr>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                    <td style={{ padding: '3px 6px', color: '#475569', fontWeight: 500, display: 'flex', justifyContent: 'space-between' }}>
                      <span>SGST</span>
                      <span style={{ fontSize: '0.82em', color: '#64748b' }}>{sgstRate}%</span>
                    </td>
                    <td style={{ padding: '3px 6px', textAlign: 'right', fontWeight: '600' }}>
                      {formatCurrency(sgstAmount)}
                    </td>
                  </tr>
                  <tr style={{ backgroundColor: '#ffffff', borderBottom: '1.2px solid #cbd5e1' }}>
                    <td style={{ padding: '3px 6px', color: '#475569', fontWeight: 500, display: 'flex', justifyContent: 'space-between' }}>
                      <span>IGST</span>
                      <span style={{ fontSize: '0.82em', color: '#64748b' }}>{igstRate}%</span>
                    </td>
                    <td style={{ padding: '3px 6px', textAlign: 'right', fontWeight: '600' }}>
                      {formatCurrency(igstAmount)}
                    </td>
                  </tr>
                  <tr style={{ backgroundColor: '#f8fafc', fontSize: '1.02em', fontWeight: '800' }}>
                    <td style={{ padding: '4px 6px', color: '#2b3e50' }}>Grand Total</td>
                    <td style={{ padding: '4px 6px', textAlign: 'right', color: '#2b3e50' }}>
                      {formatCurrency(grandTotal)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Remarks and Signatures section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginTop: '10px', alignItems: 'flex-end' }}>
            
            {/* Remarks Box */}
            <div style={{ width: '58%' }}>
              <div style={{ fontSize: '0.85em', fontWeight: '700', color: '#475569', marginBottom: '2px' }}>Remarks / Declaration</div>
              <div style={{
                border: '1px solid #cbd5e1',
                borderRadius: '2px',
                height: '42px',
                padding: '4px 6px',
                fontSize: '0.8em',
                color: '#333',
                lineHeight: '1.3'
              }}>
                1. Please remit payments within 15 days of invoice date.
                <br />
                2. Goods/Services once delivered are subject to contract terms.
              </div>
            </div>

            {/* Authorised Signatures */}
            <div style={{ width: '38%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }}>
              <div style={{ fontSize: '1.3em', fontWeight: 700, color: '#111', marginBottom: '4px' }}>
                For Amigo Webster
              </div>

              {/* Spacer for physical signature */}
              <div style={{ height: '30px' }}></div>

              <div style={{ borderBottom: '1.5px solid #cbd5e1', width: '150px', marginBottom: '4px' }}></div>
              <div style={{ fontSize: '1.2em', fontWeight: '700', color: '#111' }}>
                Proprietor
              </div>
            </div>
          </div>
          </div>

          {/* Bank Details at the very bottom of the A4 page */}
          <div style={{ 
            marginTop: '16px', 
            borderTop: '1px solid #cbd5e1', 
            paddingTop: '8px'
          }}>
            <div style={{ fontWeight: '700', fontSize: '0.92em', color: '#111', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Bank Account Details (For Remittance / Wire Transfer)
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88em' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '2px 0', color: '#475569', fontWeight: 600, width: '15%' }}>Account Name:</td>
                  <td style={{ padding: '2px 0', color: '#111', fontWeight: 700, width: '35%' }}>Amigo Webster</td>
                  <td style={{ padding: '2px 0', color: '#475569', fontWeight: 600, width: '15%' }}>Bank Name:</td>
                  <td style={{ padding: '2px 0', color: '#111', fontWeight: 700, width: '35%' }}>STATE BANK OF INDIA</td>
                </tr>
                <tr>
                  <td style={{ padding: '2px 0', color: '#475569', fontWeight: 600 }}>Account Number:</td>
                  <td style={{ padding: '2px 0', color: '#111', fontWeight: 700 }}>43126406283</td>
                  <td style={{ padding: '2px 0', color: '#475569', fontWeight: 600 }}>IFSC Code:</td>
                  <td style={{ padding: '2px 0', color: '#111', fontWeight: 700 }}>SBIN0016545</td>
                </tr>
                <tr>
                  <td style={{ padding: '2px 0', color: '#475569', fontWeight: 600 }}>Branch Name:</td>
                  <td style={{ padding: '2px 0', color: '#111', fontWeight: 700 }} colSpan={3}>Kilkattalai</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
