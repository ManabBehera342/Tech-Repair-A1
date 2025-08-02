require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const fs = require('fs');
const { google } = require('googleapis');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

const app = express();
app.use(express.json());
app.use(cors());

const {
  PORT,
  MONGODB_URI,
  JWT_SECRET,
  SPREADSHEET_ID,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = process.env;

// MongoDB User Schema and Model
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['customer', 'service_team', 'epr_team', 'channel_partner', 'system_integrator'],
      default: 'customer',
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

// Connect MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Google Sheets API Client Setup
const credentials = JSON.parse(fs.readFileSync('./service-account.json', 'utf8'));
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });
const spreadsheetId = SPREADSHEET_ID;

// Cloudinary Config
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

// Multer setup for in-memory upload
const upload = multer({ storage: multer.memoryStorage() });

// JWT Authentication Middleware
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

// Utility: Append rows to Google Sheets
async function appendToSheet(tabName, values) {
  const client = await auth.getClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: tabName,
    valueInputOption: 'RAW',
    requestBody: { values },
  });
}

// Upload buffer to Cloudinary
function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder: 'service-requests' }, (error, result) => {
      if (error) return reject(error);
      resolve(result.secure_url);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

// Signup
app.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role)
      return res.status(400).json({ error: 'Name, email, password and role required' });

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) return res.status(409).json({ error: 'Email already registered' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({ name, email: email.toLowerCase(), passwordHash, role });
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

    res.json({ token, user: { name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout (stateless)
app.post('/logout', (req, res) =>
  res.json({ message: 'Logged out successfully. Please remove token from client.' })
);

// Get Profile
app.get('/profile', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// Add Service Request
app.post('/service-requests', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'customer')
      return res.status(403).json({ error: 'Only customers can create service requests' });

    const { customerName, serialNumber, productDetails, purchaseDate, photos, faultDescription } = req.body;

    if (!customerName || !serialNumber || !productDetails || !purchaseDate || !faultDescription)
      return res.status(400).json({ error: 'Missing required fields' });

    const photoString = Array.isArray(photos) ? photos.join('; ') : '';

    const row = [
      customerName,
      serialNumber,
      productDetails,
      purchaseDate,
      photoString,
      faultDescription,
      'new', // status
      '', // assignedTo
      '', // estimatedCost
      '', // dispatchDetails
      '', // repairDetails
      new Date().toISOString(),
    ];

    await appendToSheet('ServiceRequests', [row]);

    res.status(201).json({ message: 'Request saved to Google Sheets' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save request' });
  }
});

// Fetch Service Requests
app.get('/service-requests', authenticateToken, async (req, res) => {
  try {
    const resp = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'ServiceRequests!A2:L',
    });

    const rows = resp.data.values || [];

    const tickets = rows.map((row, idx) => ({
      id: (idx + 1).toString(),
      ticketNumber: row[1] || `TICKET-${idx + 1}`,          // SERIAL NUMBER as ID!
      customerName: row[0] || '',
      serialNumber: row[1] || '',
      productType: row[2] || '',
      issue: row[5] || '',
      status: row[6] || 'new',
      priority: 'medium',
      assignedTo: row[7] || '',
      estimatedCost: row[8] || '',
      dispatchDetails: row[9] || '',
      repairDetails: row[10] || '',
      createdAt: row[11] || '',
      updatedAt: row[11] || '',
      photos: row[4] ? row[4].split('; ') : [],
      description: row[5] || '',
    }));

    res.json({ tickets });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// Update Service Request - match on serial number (column B)
app.patch('/service-requests/:ticketNumber', authenticateToken, async (req, res) => {
  try {
    const { ticketNumber } = req.params;
    const updates = req.body;

    const resp = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'ServiceRequests!A2:L',
    });

    const rows = resp.data.values || [];

    // -------- MATCH ON row[1] (SERIAL NUMBER)
    const rowIndex = rows.findIndex((row) => row[1] === ticketNumber);
    if (rowIndex === -1) return res.status(404).json({ error: 'Ticket not found' });

    const row = rows[rowIndex];

    if (updates.status !== undefined) row[6] = updates.status;
    if (updates.assignedTo !== undefined) row[7] = updates.assignedTo;
    if (updates.estimatedCost !== undefined) row[8] = updates.estimatedCost;
    if (updates.dispatchDetails !== undefined) row[9] = updates.dispatchDetails;
    if (updates.repairDetails !== undefined) row[10] = updates.repairDetails;

    row[11] = new Date().toISOString();

    const updateRange = `ServiceRequests!A${rowIndex + 2}:L${rowIndex + 2}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: updateRange,
      valueInputOption: 'RAW',
      requestBody: { values: [row] },
    });

    res.json({ message: 'Ticket updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

// Upload Photos Endpoint - match on serial number (column B)
app.post('/upload-photos/:ticketNumber', authenticateToken, upload.array('photos'), async (req, res) => {
  try {
    const { ticketNumber } = req.params;
    const files = req.files;

    if (!files || files.length === 0)
      return res.status(400).json({ error: 'No photos uploaded' });

    // Upload each photo to Cloudinary
    const uploads = files.map((file) => uploadToCloudinary(file.buffer));
    const urls = await Promise.all(uploads);

    // Fetch existing sheet data
    const resp = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'ServiceRequests!A2:L',
    });

    const rows = resp.data.values || [];
    // --------- MATCH ON row[1] (SERIAL NUMBER)
    const rowIndex = rows.findIndex((row) => row[1] === ticketNumber);
    if (rowIndex === -1) return res.status(404).json({ error: 'Ticket not found' });

    const row = rows[rowIndex];

    // Merge old and new photo URLs
    const existingPhotos = row[4] ? row[4].split('; ') : [];
    const allPhotos = [...existingPhotos, ...urls];
    row[4] = allPhotos.join('; ');

    row[11] = new Date().toISOString();

    // Update the row in Google Sheets
    const updateRange = `ServiceRequests!A${rowIndex + 2}:L${rowIndex + 2}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: updateRange,
      valueInputOption: 'RAW',
      requestBody: { values: [row] },
    });

    res.json({ message: 'Photos uploaded and attached', photoUrls: urls });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upload photos' });
  }
});

// Start server
app.listen(PORT || 3000, () => {
  console.log(`Server running on port ${PORT || 3000}`);
});
