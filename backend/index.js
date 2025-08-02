require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const fs = require('fs');
const { google } = require('googleapis');

const app = express();
app.use(express.json());
app.use(cors());

const { PORT, MONGODB_URI, JWT_SECRET, SPREADSHEET_ID } = process.env;

// -------- MongoDB User schema and model --------

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true, 
    trim: true
  },
  passwordHash: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['customer', 'service_team', 'epr_team', 'channel_partner', 'system_integrator'], 
    default: 'customer' 
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// -------- Connect to MongoDB --------

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// -------- Google Sheets API Setup --------

const credentials = JSON.parse(fs.readFileSync('./service-account.json', 'utf8'));
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });
const spreadsheetId = SPREADSHEET_ID;

// Utility to append rows to Google Sheets
async function appendToSheet(tabName, values) {
  const client = await auth.getClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: tabName,
    valueInputOption: 'RAW',
    requestBody: { values },
  });
}

// -------- JWT Authentication Middleware --------

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Authorization header missing' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token missing' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// -------- Routes --------

// Signup
app.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password and role required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
    });

    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign(
      { userId: user._id, name: user.name, email: user.email, role: user.role }, 
      JWT_SECRET, 
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: { name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout (stateless)
app.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully. Please remove token from client.' });
});

// Get Profile
app.get('/profile', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// Add a new service request (customer only)
app.post('/service-requests', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ error: 'Only customers can create service requests' });
    }

    const {
      customerName,
      serialNumber,
      productDetails,
      purchaseDate,
      photos,
      faultDescription,
    } = req.body;

    if (!customerName || !serialNumber || !productDetails || !purchaseDate || !faultDescription) {
      return res.status(400).json({ error: 'Missing required service request fields' });
    }

    const photoString = Array.isArray(photos) ? photos.join('; ') : '';

    const row = [
      customerName,
      serialNumber,
      productDetails,
      purchaseDate,
      photoString,
      faultDescription,
      'new',          // status
      '',             // assignedTo
      '',             // estimatedCost
      '',             // dispatchDetails
      '',             // repairDetails
      new Date().toISOString()
    ];

    await appendToSheet('ServiceRequests', [row]);

    res.status(201).json({ message: 'Service request saved to Google Sheets' });
  } catch (err) {
    console.error('Error saving service request:', err);
    res.status(500).json({ error: 'Failed to save service request' });
  }
});

// Fetch all service requests (GET)
app.get('/service-requests', authenticateToken, async (req, res) => {
  try {
    const sheetsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'ServiceRequests!A2:L' // skip header row 1
    });

    const rows = sheetsResponse.data.values || [];

    const tickets = rows.map((row, index) => ({
      id: (index + 1).toString(),
      ticketNumber: row[0] || `TICKET-${index + 1}`, // fallback ticket number
      customerName: row[0] || '',
      productType: row[2] || '',
      issue: row[5] || '',
      status: row[6] || 'new',
      priority: 'medium', // Default priority - change as per your data model if stored
      assignedTo: row[7] || '',
      createdAt: row[11] || '',
      updatedAt: row[11] || '',
      photos: row[4] ? row[4].split('; ') : [],
      description: row[5] || '',
    }));

    res.json({ tickets });
  } catch (err) {
    console.error('Error fetching service requests:', err);
    res.status(500).json({ error: 'Failed to fetch service requests' });
  }
});

// Update a service request by ticketNumber (PATCH)
app.patch('/service-requests/:ticketNumber', authenticateToken, async (req, res) => {
  const { ticketNumber } = req.params;
  const updates = req.body;

  try {
    // Fetch existing rows
    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'ServiceRequests!A2:L',
    });

    const rows = sheetData.data.values || [];

    // Find row index for the ticketNumber
    const rowIndex = rows.findIndex(row => row[0] === ticketNumber);
    if (rowIndex === -1) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const row = rows[rowIndex];

    if (updates.status !== undefined) {
      row[6] = updates.status;
    }
    if (updates.assignedTo !== undefined) {
      row[7] = updates.assignedTo;
    }

    // Update the updatedAt column with current timestamp
    row[11] = new Date().toISOString();

    // Write the updated row back to the sheet
    const updateRange = `ServiceRequests!A${rowIndex + 2}:L${rowIndex + 2}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: updateRange,
      valueInputOption: 'RAW',
      requestBody: {
        values: [row]
      }
    });

    res.json({ message: 'Ticket updated successfully' });
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

// Add product details (existing route)
app.post('/product', authenticateToken, async (req, res) => {
  try {
    const { id, name, description, price } = req.body;
    if (!id || !name || !description || price === undefined) {
      return res.status(400).json({ error: 'Missing product fields' });
    }

    await appendToSheet('ProductDescriptions', [[id, name, description, price]]);
    res.json({ message: 'Product details saved to Google Sheets' });
  } catch (err) {
    console.error('Error saving product details:', err);
    res.status(500).json({ error: 'Failed to save product details' });
  }
});

// -------- Start server --------

const port = PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
