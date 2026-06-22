import React from 'react';
import { X, Printer } from 'lucide-react';

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
  const igstRate = invoice.gst_rate !== undefined ? parseFloat(invoice.gst_rate) : 18;
  const igstAmount = subTotal * (igstRate / 100);
  const grandTotal = subTotal + igstAmount;

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
          fontSize: '0.82rem',
          lineHeight: '1.35'
        }}>
          
          {/* Header Grid */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            {/* Left Company Block */}
            <div style={{ width: '55%' }}>
              <div style={{
                backgroundColor: '#2b3e50',
                color: '#ffffff',
                padding: '6px 18px',
                fontWeight: '700',
                fontSize: '1rem',
                letterSpacing: '1px',
                width: 'fit-content',
                borderRadius: '2px',
                marginBottom: '10px',
                textTransform: 'uppercase'
              }}>
                INVOICE
              </div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#111', lineHeight: '1.2', marginBottom: '4px' }}>
                Amigo Webster
              </h2>
              <div style={{ color: '#555', fontSize: '0.78rem' }}>
                <p>Plot No 6 Anna Main Road Vengambakkam,</p>
                <p>Chennai - 600129</p>
                <p style={{ marginTop: '2px' }}>Mob: 9445332233</p>
                <p>Email: balaji@amigowebster.com</p>
                {/* <p style={{ marginTop: '2px', fontSize: '0.75rem', color: '#777' }}>
                  GSTIN: 33AAVFG9372Q1ZA • PAN: AAVFG9372Q
                </p> */}
              </div>
            </div>

            {/* Right Logo Block */}
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
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              padding: '12px 14px',
              backgroundColor: '#f8fafc'
            }}>
              <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '6px' }}>
                BILL TO:
              </span>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '30%', padding: '3px 0', color: '#64748b', fontWeight: 500, whiteSpace: 'normal' }}>Company Name</td>
                    <td style={{ padding: '3px 0', fontWeight: '700', color: '#1e293b', whiteSpace: 'normal' }}>{invoice.customer_name}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '3px 0', color: '#64748b', fontWeight: 500, verticalAlign: 'top', whiteSpace: 'normal' }}>Address</td>
                    <td style={{ padding: '3px 0', color: '#334155', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                      {invoice.address || 'Plot No 6, Vengambakkam Road, IT Hub, Chennai'}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '3px 0', color: '#64748b', fontWeight: 500, whiteSpace: 'normal' }}>Pincode</td>
                    <td style={{ padding: '3px 0', color: '#334155', whiteSpace: 'normal' }}>{invoice.pincode || '600129'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '3px 0', color: '#64748b', fontWeight: 500, whiteSpace: 'normal' }}>State</td>
                    <td style={{ padding: '3px 0', color: '#334155', whiteSpace: 'normal' }}>
                      {invoice.city ? (invoice.city.toLowerCase() === 'delhi' ? 'Delhi' : invoice.city.toLowerCase() === 'mumbai' ? 'Maharashtra' : invoice.city.toLowerCase() === 'bangalore' ? 'Karnataka' : 'Tamil Nadu') : 'Tamil Nadu'}
                    </td>
                  </tr>
                  {/* <tr>
                    <td style={{ padding: '3px 0', color: '#64748b', fontWeight: 500, whiteSpace: 'normal' }}>GST</td>
                    <td style={{ padding: '3px 0', color: '#334155', whiteSpace: 'normal' }}>33ABQCS5582H1ZJ</td>
                  </tr> */}
                </tbody>
              </table>
            </div>

            {/* Invoice Details Table */}
            <div style={{ width: '38%' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse', 
                border: '1px solid #cbd5e1', 
                fontSize: '0.75rem',
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
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '4px 8px', fontWeight: '600', color: '#475569', backgroundColor: '#f1f5f9', width: '50%', whiteSpace: 'normal' }}>
                        {row.label}
                      </th>
                      <td style={{ padding: '4px 8px', color: '#1e293b', fontWeight: '500', textAlign: 'center', whiteSpace: 'normal' }}>
                        {row.val}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Service scope message */}
          <div style={{ 
            fontSize: '0.78rem', 
            color: '#333', 
            marginBottom: '10px', 
            padding: '2px 0',
            fontWeight: 500
          }}>
            Towards the charges of Design and Development for project: <strong style={{ color: '#2b3e50' }}>Website Implementation & Digital Assets</strong>
          </div>

          {/* Description Itemized Table */}
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse', 
            border: '1px solid #cbd5e1', 
            marginBottom: '16px'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#2b3e50', color: '#ffffff' }}>
                <th style={{ padding: '8px', fontSize: '0.75rem', fontWeight: '700', textAlign: 'center', border: '1px solid #cbd5e1', width: '8%', whiteSpace: 'normal' }}>S. No</th>
                <th style={{ padding: '8px', fontSize: '0.75rem', fontWeight: '700', textAlign: 'left', border: '1px solid #cbd5e1', width: '52%', whiteSpace: 'normal' }}>DESCRIPTION OF ITEMS</th>
                <th style={{ padding: '8px', fontSize: '0.75rem', fontWeight: '700', textAlign: 'center', border: '1px solid #cbd5e1', width: '12%', whiteSpace: 'normal' }}>HSN / SAC</th>
                <th style={{ padding: '8px', fontSize: '0.75rem', fontWeight: '700', textAlign: 'center', border: '1px solid #cbd5e1', width: '8%', whiteSpace: 'normal' }}>QTY</th>
                <th style={{ padding: '8px', fontSize: '0.75rem', fontWeight: '700', textAlign: 'right', border: '1px solid #cbd5e1', width: '10%', whiteSpace: 'normal' }}>PRICE</th>
                <th style={{ padding: '8px', fontSize: '0.75rem', fontWeight: '700', textAlign: 'right', border: '1px solid #cbd5e1', width: '10%', whiteSpace: 'normal' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {parsedItems.map((item, idx) => (
                <tr key={idx} style={{ verticalAlign: 'top' }}>
                  <td style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1', whiteSpace: 'normal' }}>{idx + 1}</td>
                  <td style={{ padding: '8px', color: '#1e293b', borderRight: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                    <div style={{ fontWeight: '600' }}>{item.title}</div>
                    {item.description && (
                      <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px', fontWeight: 'normal' }}>
                        {item.description}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'center', color: '#475569', borderRight: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1', whiteSpace: 'normal' }}>998382</td>
                  <td style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1', whiteSpace: 'normal' }}>{item.qty}</td>
                  <td style={{ padding: '8px', textAlign: 'right', fontWeight: '500', borderRight: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1', whiteSpace: 'normal' }}>
                    ₹{parseFloat(item.rate || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'right', fontWeight: '600', borderBottom: '1px solid #cbd5e1', whiteSpace: 'normal' }}>
                    ₹{parseFloat(item.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
              {/* Fill mock empty rows to match paper layout look */}
              {Array.from({ length: Math.max(0, 2 - parsedItems.length) }).map((_, idx) => (
                <tr key={`empty-${idx}`} style={{ height: '24px' }}>
                  <td style={{ borderRight: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1' }}></td>
                  <td style={{ borderRight: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1' }}></td>
                  <td style={{ borderRight: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1' }}></td>
                  <td style={{ borderRight: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1' }}></td>
                  <td style={{ borderRight: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1' }}></td>
                  <td style={{ borderBottom: '1px solid #cbd5e1' }}></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer Grid - Banks and Totals */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
            
            {/* Left Column: Customer Code and Bank Details */}
            <div style={{ width: '58%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                Customer Code: <strong>{invoice.customer_id_seq}</strong>
              </div>
              
              {/* Bank Details Box */}
              <div style={{
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                padding: '8px 12px',
                backgroundColor: '#f8fafc',
                fontSize: '0.75rem',
                lineHeight: '1.4'
              }}>
                <div style={{ fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>Amigo Webster</div>
                <p>Bank: <strong>STATE BANK OF INDIA</strong></p>
                <p>Account Number: <strong>43126406283</strong></p>
                <p>Branch: <strong>Kilkattalai</strong></p>
                <p>IFSC Code: <strong>SBIN0016545</strong></p>
              </div>
            </div>

            {/* Right Column: Totals details */}
            <div style={{ width: '38%' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse', 
                fontSize: '0.78rem',
                lineHeight: '1.5'
              }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '3px 0', color: '#64748b', fontWeight: 500 }}>Sub Total</td>
                    <td style={{ padding: '3px 0', textAlign: 'right', fontWeight: '600' }}>
                      ₹{subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '3px 0', color: '#64748b', fontWeight: 500 }}>Discount (0%)</td>
                    <td style={{ padding: '3px 0', textAlign: 'right', fontWeight: '600' }}>₹0.00</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '3px 0', color: '#64748b', fontWeight: 500 }}>CGST (0%)</td>
                    <td style={{ padding: '3px 0', textAlign: 'right', fontWeight: '600' }}>₹0.00</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '3px 0', color: '#64748b', fontWeight: 500 }}>SGST (0%)</td>
                    <td style={{ padding: '3px 0', textAlign: 'right', fontWeight: '600' }}>₹0.00</td>
                  </tr>
                  <tr style={{ borderBottom: '1.5px solid #1e293b' }}>
                    <td style={{ padding: '3px 0', color: '#64748b', fontWeight: 500 }}>IGST ({igstRate}%)</td>
                    <td style={{ padding: '3px 0', textAlign: 'right', fontWeight: '600' }}>
                      ₹{igstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr style={{ fontSize: '0.92rem' }}>
                    <td style={{ padding: '6px 0', fontWeight: '800', color: '#2b3e50' }}>Grand Total</td>
                    <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: '800', color: '#2b3e50' }}>
                      ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '3px 0', color: '#64748b', fontWeight: 500 }}>Advance Paid</td>
                    <td style={{ padding: '3px 0', textAlign: 'right', fontWeight: '600' }}>
                      ₹{parseFloat(invoice.advance_paid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr style={{ fontSize: '0.92rem', borderTop: '1.5px solid #1e293b' }}>
                    <td style={{ padding: '6px 0', fontWeight: '800', color: '#2b3e50' }}>Balance Due</td>
                    <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: '800', color: '#2b3e50' }}>
                      ₹{(grandTotal - parseFloat(invoice.advance_paid || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Remarks and Signatures section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginTop: '20px', alignItems: 'flex-end' }}>
            
            {/* Remarks Box */}
            <div style={{ width: '58%' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748b', marginBottom: '2px' }}>Remarks / Declaration</div>
              <div style={{
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                height: '60px',
                padding: '6px',
                fontSize: '0.7rem',
                color: '#475569'
              }}>
                1. Please remit payments within 15 days of invoice date.
                <br />
                2. Goods/Services once delivered are subject to contract terms.
              </div>
            </div>

            {/* Authorised Signatures */}
            <div style={{ width: '38%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', marginBottom: '24px' }}>
                For Amigowebster
              </div>
              <div style={{ borderBottom: '1px solid #94a3b8', width: '130px', marginBottom: '4px' }}></div>
              <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#1e293b' }}>
                Balaji
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                Managing Director
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
