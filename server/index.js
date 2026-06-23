const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Handle subdirectory/context path routing (e.g. Passenger/cPanel)
app.use((req, res, next) => {
  if (req.url.startsWith('/amigobilling')) {
    req.url = req.url.substring('/amigobilling'.length);
    if (!req.url.startsWith('/')) {
      req.url = '/' + req.url;
    }
  }
  next();
});

let dbInitialized = false;
let dbInitializingPromise = null;

// Middleware to ensure DB connection is initialized
const checkDbConnection = async (req, res, next) => {
  try {
    if (!dbInitialized) {
      if (!dbInitializingPromise) {
        dbInitializingPromise = db.initializeDatabase().then(() => {
          dbInitialized = true;
          dbInitializingPromise = null;
        }).catch(err => {
          dbInitializingPromise = null;
          throw err;
        });
      }
      await dbInitializingPromise;
    }
    next();
  } catch (error) {
    console.error('Database connection failed in middleware:', error.message);
    res.status(500).json({ error: 'Database connection failed. Please check your cloud database credentials in Vercel environment variables.' });
  }
};
app.use(checkDbConnection);

// ================= CUSTOMER ROUTES =================

// Get all customers
app.get('/api/customers', async (req, res) => {
  try {
    const customers = await db.query('SELECT * FROM customers ORDER BY id DESC');
    res.json(customers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch customers.' });
  }
});

// Get next sequential customer ID (e.g. C-104)
app.get('/api/customers/next-id', async (req, res) => {
  try {
    const customers = await db.query('SELECT customer_id_seq FROM customers');
    let nextNum = 101;
    if (customers.length > 0) {
      const nums = customers.map(c => {
        const parts = c.customer_id_seq.split('-');
        return parts.length === 2 ? parseInt(parts[1], 10) : null;
      }).filter(n => n !== null && !isNaN(n));
      if (nums.length > 0) {
        nextNum = Math.max(...nums) + 1;
      }
    }
    res.json({ nextId: `C-${nextNum}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get next customer ID.' });
  }
});

// Save new customer
app.post('/api/customers', async (req, res) => {
  const {
    customerIdSeq,
    customerName,
    mobileNumber,
    email,
    pincode,
    city,
    address,
    assignedLead,
    projectBrief
  } = req.body;

  if (!customerName || !mobileNumber) {
    return res.status(400).json({ error: 'Customer Name and Mobile Number are required.' });
  }

  try {
    let seqId = customerIdSeq;
    if (!seqId) {
      const countRes = await db.query('SELECT COUNT(*) as count FROM customers');
      seqId = `C-${101 + countRes[0].count}`;
    }

    const checkDup = await db.query('SELECT id FROM customers WHERE customer_id_seq = ?', [seqId]);
    if (checkDup.length > 0) {
      const customers = await db.query('SELECT customer_id_seq FROM customers');
      const nums = customers.map(c => {
        const parts = c.customer_id_seq.split('-');
        return parts.length === 2 ? parseInt(parts[1], 10) : null;
      }).filter(n => n !== null && !isNaN(n));
      seqId = `C-${Math.max(...nums) + 1}`;
    }

    const result = await db.query(
      `INSERT INTO customers 
      (customer_id_seq, customer_name, mobile_number, email, pincode, city, address, assigned_lead, project_brief) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [seqId, customerName, mobileNumber, email || null, pincode || null, city || null, address || null, assignedLead || 'Arjun Sharma', projectBrief || null]
    );

    res.status(201).json({ id: result.insertId, customerIdSeq: seqId, message: 'Customer registered successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to register customer.' });
  }
});

// Update customer details
app.put('/api/customers/:id', async (req, res) => {
  const { id } = req.params;
  const {
    customerName,
    mobileNumber,
    email,
    pincode,
    city,
    address,
    assignedLead,
    projectBrief
  } = req.body;

  if (!customerName || !mobileNumber) {
    return res.status(400).json({ error: 'Customer Name and Mobile Number are required.' });
  }

  try {
    await db.query(
      `UPDATE customers SET 
        customer_name = ?, 
        mobile_number = ?, 
        email = ?, 
        pincode = ?, 
        city = ?, 
        address = ?, 
        assigned_lead = ?, 
        project_brief = ? 
      WHERE id = ?`,
      [customerName, mobileNumber, email || null, pincode || null, city || null, address || null, assignedLead || 'Arjun Sharma', projectBrief || null, id]
    );
    res.json({ message: 'Customer updated successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update customer.' });
  }
});

// Delete customer
app.delete('/api/customers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM customers WHERE id = ?', [id]);
    res.json({ message: 'Customer deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete customer.' });
  }
});


// ================= LEAD ROUTES (PMs) =================

app.get('/api/leads', async (req, res) => {
  try {
    const leads = await db.query('SELECT * FROM leads ORDER BY lead_name ASC');
    res.json(leads);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch project leads.' });
  }
});


// ================= MEETING ROUTES =================

// Get meetings
app.get('/api/meetings', async (req, res) => {
  const { date } = req.query;
  try {
    let sql = `
      SELECT m.*, c.customer_name, c.customer_id_seq, c.mobile_number, c.project_brief 
      FROM meetings m
      JOIN customers c ON m.customer_id = c.id
    `;
    const params = [];
    if (date) {
      sql += ' WHERE m.meeting_date = ?';
      params.push(date);
    }
    sql += ' ORDER BY m.meeting_date ASC, m.meeting_time ASC';
    const meetings = await db.query(sql, params);
    res.json(meetings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch meetings.' });
  }
});

// Book meeting
app.post('/api/meetings', async (req, res) => {
  const { customerId, meetingDate, meetingTime, agenda, leadName } = req.body;

  if (!customerId || !meetingDate || !meetingTime || !agenda) {
    return res.status(400).json({ error: 'Customer, Date, Time, and Agenda are required.' });
  }

  try {
    const result = await db.query(
      'INSERT INTO meetings (customer_id, meeting_date, meeting_time, agenda, lead_name) VALUES (?, ?, ?, ?, ?)',
      [customerId, meetingDate, meetingTime, agenda, leadName || 'Arjun Sharma']
    );
    res.status(201).json({ id: result.insertId, message: 'Meeting scheduled successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save meeting.' });
  }
});


// ================= SERVICE ROUTES =================

// Get all services
app.get('/api/services', async (req, res) => {
  try {
    const services = await db.query('SELECT * FROM services ORDER BY id DESC');
    res.json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch services.' });
  }
});

// Save service
app.post('/api/services', async (req, res) => {
  const { serviceCode, serviceName, cost, timeline } = req.body;

  if (!serviceName || !cost) {
    return res.status(400).json({ error: 'Service Name and Cost are required.' });
  }

  try {
    let code = serviceCode;
    if (!code) {
      const countRes = await db.query('SELECT COUNT(*) as count FROM services');
      code = `S-${101 + countRes[0].count}`;
    }

    const checkDup = await db.query('SELECT id FROM services WHERE service_code = ?', [code]);
    if (checkDup.length > 0) {
      const services = await db.query('SELECT service_code FROM services');
      const nums = services.map(s => {
        const parts = s.service_code.split('-');
        return parts.length === 2 ? parseInt(parts[1], 10) : null;
      }).filter(n => n !== null && !isNaN(n));
      code = `S-${Math.max(...nums) + 1}`;
    }

    const result = await db.query(
      'INSERT INTO services (service_code, service_name, cost, timeline) VALUES (?, ?, ?, ?)',
      [code, serviceName, parseFloat(cost), timeline || '2 weeks']
    );
    res.status(201).json({ id: result.insertId, serviceCode: code, message: 'Service cataloged successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save service.' });
  }
});

// Update service
app.put('/api/services/:id', async (req, res) => {
  const { id } = req.params;
  const { serviceName, cost, timeline } = req.body;

  if (!serviceName || !cost) {
    return res.status(400).json({ error: 'Service Name and Cost are required.' });
  }

  try {
    await db.query(
      'UPDATE services SET service_name = ?, cost = ?, timeline = ? WHERE id = ?',
      [serviceName, parseFloat(cost), timeline || '2 weeks', id]
    );
    res.json({ message: 'Service updated successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update service.' });
  }
});

// Delete service
app.delete('/api/services/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM services WHERE id = ?', [id]);
    res.json({ message: 'Service deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete service.' });
  }
});


// ================= INVOICE ROUTES =================

// Get all invoices
app.get('/api/invoices', async (req, res) => {
  try {
    const invoices = await db.query(`
      SELECT i.*, c.mobile_number, c.email, c.city, c.pincode, c.address, c.assigned_lead, c.project_brief 
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id_seq = c.customer_id_seq 
      ORDER BY i.id DESC
    `);
    res.json(invoices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch invoices.' });
  }
});

// Get next sequential invoice number (e.g. INV-1004)
app.get('/api/invoices/next-no', async (req, res) => {
  try {
    const invoices = await db.query('SELECT invoice_no FROM invoices');
    let nextNum = 1001;
    if (invoices.length > 0) {
      const nums = invoices.map(i => {
        const parts = i.invoice_no.split('-');
        return parts.length === 2 ? parseInt(parts[1], 10) : null;
      }).filter(n => n !== null && !isNaN(n));
      if (nums.length > 0) {
        nextNum = Math.max(...nums) + 1;
      }
    }
    res.json({ nextNo: `INV-${nextNum}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get next invoice number.' });
  }
});

// Save invoice
app.post('/api/invoices', async (req, res) => {
  const { invoiceNo, patientId, items, amount, advancePaid, status, invoiceDate, gstRate } = req.body;

  if (!patientId || !items || !amount || !invoiceDate) {
    return res.status(400).json({ error: 'Customer, Items, Total Amount, and Date are required.' });
  }

  try {
    const customerRes = await db.query('SELECT customer_id_seq, customer_name FROM customers WHERE id = ?', [patientId]);
    if (customerRes.length === 0) {
      return res.status(404).json({ error: 'Customer not found.' });
    }

    const { customer_id_seq, customer_name } = customerRes[0];

    // Determine invoice number
    let finalInvNo = invoiceNo;
    if (!finalInvNo) {
      const invoices = await db.query('SELECT invoice_no FROM invoices');
      let nextNum = 1001;
      if (invoices.length > 0) {
        const nums = invoices.map(i => {
          const parts = i.invoice_no.split('-');
          return parts.length === 2 ? parseInt(parts[1], 10) : null;
        }).filter(n => n !== null && !isNaN(n));
        nextNum = Math.max(...nums) + 1;
      }
      finalInvNo = `INV-${nextNum}`;
    }

    // Determine summary service name
    let serviceName = 'Services';
    if (Array.isArray(items) && items.length > 0) {
      serviceName = items.length === 1 ? items[0].title : `${items[0].title} (+ ${items.length - 1} more)`;
    }
    const itemsStr = JSON.stringify(items);

    const result = await db.query(
      `INSERT INTO invoices (invoice_no, customer_id_seq, customer_name, service_name, items, amount, advance_paid, status, invoice_date, gst_rate) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [finalInvNo, customer_id_seq, customer_name, serviceName, itemsStr, parseFloat(amount), parseFloat(advancePaid || 0), status || 'Paid', invoiceDate, parseFloat(gstRate !== undefined ? gstRate : 18.00)]
    );

    res.status(201).json({ id: result.insertId, invoiceNo: finalInvNo, message: 'Invoice saved successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save invoice.' });
  }
});

// Update invoice
app.put('/api/invoices/:id', async (req, res) => {
  const { id } = req.params;
  const { items, amount, advancePaid, status, invoiceDate, gstRate } = req.body;

  try {
    // Determine summary service name
    let serviceName = 'Services';
    if (Array.isArray(items) && items.length > 0) {
      serviceName = items.length === 1 ? items[0].title : `${items[0].title} (+ ${items.length - 1} more)`;
    }
    const itemsStr = JSON.stringify(items);

    await db.query(
      'UPDATE invoices SET service_name = ?, items = ?, amount = ?, advance_paid = ?, status = ?, invoice_date = ?, gst_rate = ? WHERE id = ?',
      [serviceName, itemsStr, parseFloat(amount), parseFloat(advancePaid || 0), status, invoiceDate, parseFloat(gstRate !== undefined ? gstRate : 18.00), id]
    );
    res.json({ message: 'Invoice updated successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update invoice.' });
  }
});

// Delete invoice
app.delete('/api/invoices/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM invoices WHERE id = ?', [id]);
    res.json({ message: 'Invoice deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete invoice.' });
  }
});

// Download database SQL file
app.get('/api/download-db', (req, res) => {
  const path = require('path');
  const { exec } = require('child_process');
  const dumpCmd = `"D:\\xampp-portable-windows-x64-7.1.33-1-VC14\\xampp\\mysql\\bin\\mysqldump.exe" -u root ranga_agency_db`;
  const backupPath = path.join(__dirname, 'ranga_agency_db_backup.sql');
  
  exec(`${dumpCmd} > "${backupPath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`mysqldump error: ${error.message}`);
      return res.status(500).json({ error: 'Failed to generate database backup.' });
    }
    res.download(backupPath, 'ranga_agency_db.sql', (err) => {
      if (err) {
        console.error(`Download error: ${err.message}`);
      }
    });
  });
});

// ================= GLOBAL ERROR HANDLING =================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error.' });
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Express Backend Server is running on port ${PORT}`);
  });
}

module.exports = app;
