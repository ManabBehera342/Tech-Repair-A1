# Email Notification System Setup Guide

## 🚀 Quick Setup for Hackathon Demo

### 1. Gmail SMTP Setup (5 minutes)

#### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Security → 2-Step Verification → Turn On
3. Complete the setup with your phone number

#### Step 2: Generate App Password
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Security → 2-Step Verification → App passwords
3. Select app: "Mail"
4. Select device: "Other (custom name)" → Type "TechRepair App"
5. Click "Generate"
6. **Copy the 16-character password** (you'll need this for EMAIL_PASS)

### 2. Environment Variables

Create/update your `.env` file in the backend directory:

```env
# Existing variables...
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
# ... other existing vars ...

# New notification variables
EMAIL_USER=your.gmail.address@gmail.com
EMAIL_PASS=your_16_character_app_password_here
```

**Example:**
```env
EMAIL_USER=techrepair.demo@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
```

### 3. Required Dependencies

```bash
cd backend
npm install nodemailer
```

### 4. Test Your Setup

#### Option A: API Endpoint Test
```bash
# 1. Start your server
node index.js

# 2. Login to get a token
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email": "your@email.com", "password": "your_password"}'

# 3. Test email configuration
curl -X GET http://localhost:3000/api/test-email-config \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"

# Should return: {"success": true, "message": "Email configuration is valid"}
```

#### Option B: Direct Function Test
Add this to your `index.js` temporarily for testing:

```javascript
// Test notification on server start (remove after testing)
const { testEmailConfiguration, sendNotification } = require('./services/notificationService');

app.listen(PORT || 3000, async () => {
  console.log(`Server running on port ${PORT || 3000}`);

  // Test email config
  await testEmailConfiguration();

  // Send a test notification
  try {
    await sendNotification(
      {
        name: 'Test User',
        email: 'your.test.email@gmail.com', // Change to your email
        phone: '+91-9999999999'
      },
      'Created',
      { id: 'TEST-001' }
    );
  } catch (error) {
    console.log('Test notification failed:', error.message);
  }
});
```

## 📧 Demo Usage Examples

### 1. Update Status API Call

```bash
# Get JWT token first (login)
TOKEN="your_jwt_token_here"

# Test "Created" notification
curl -X POST http://localhost:3000/api/update-status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "requestId": "REQ-001",
    "newStatus": "Created"
  }'

# Test "Cost Estimate" notification
curl -X POST http://localhost:3000/api/update-status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "requestId": "REQ-001",
    "newStatus": "CostEstimate",
    "extraData": {
      "amount": "3,500",
      "description": "Screen replacement + labor"
    }
  }'

# Test "Repaired" notification
curl -X POST http://localhost:3000/api/update-status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "requestId": "REQ-001",
    "newStatus": "Repaired",
    "extraData": {
      "workDone": "LCD screen replaced and fully tested"
    }
  }'

# Test "Dispatched" notification
curl -X POST http://localhost:3000/api/update-status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "requestId": "REQ-001",
    "newStatus": "Dispatched",
    "extraData": {
      "trackingNo": "BD123456789",
      "courier": "BlueDart",
      "expectedDelivery": "2024-01-20"
    }
  }'
```

### 2. JavaScript/Axios Examples

```javascript
// Frontend code to update status and send notifications
const updateRequestStatus = async (requestId, newStatus, extraData = {}) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/update-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        requestId,
        newStatus,
        extraData
      })
    });

    const result = await response.json();
    if (result.success) {
      console.log('✅ Status updated and notification sent');
      return result;
    } else {
      console.error('❌ Failed to update status:', result.error);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

// Usage examples:
updateRequestStatus('REQ-001', 'Created');

updateRequestStatus('REQ-001', 'CostEstimate', {
  amount: '2,800',
  description: 'Battery replacement'
});

updateRequestStatus('REQ-001', 'Dispatched', {
  trackingNo: 'XYZ789',
  courier: 'FedEx',
  expectedDelivery: '2024-01-18'
});
```

## 🎯 Hackathon Demo Script

### Demo Flow (3 minutes):

1. **Show API Working**:
   ```bash
   curl -X GET http://localhost:3000/api/test-email-config -H "Authorization: Bearer TOKEN"
   ```

2. **Create Service Request** → Email sent automatically

3. **Update to Cost Estimate**:
   ```bash
   curl -X POST http://localhost:3000/api/update-status \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer TOKEN" \
     -d '{"requestId": "DEMO-001", "newStatus": "CostEstimate", "extraData": {"amount": "1,500"}}'
   ```

4. **Update to Dispatched**:
   ```bash
   curl -X POST http://localhost:3000/api/update-status \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer TOKEN" \
     -d '{"requestId": "DEMO-001", "newStatus": "Dispatched", "extraData": {"trackingNo": "DEMO123"}}'
   ```

5. **Show email inbox** - Beautiful HTML emails received!
6. **Show console logs** - SMS/WhatsApp notifications logged

## 🔧 Troubleshooting

### Common Issues:

1. **"Invalid login" error**:
   - Make sure 2FA is enabled
   - Use App Password, not regular password
   - Check EMAIL_USER format (must include @gmail.com)

2. **"Connection refused"**:
   - Check if Gmail is blocking "less secure apps"
   - Try App Password again
   - Verify email format

3. **Emails not sending**:
   - Check spam folder
   - Verify EMAIL_USER and EMAIL_PASS in .env
   - Run test configuration endpoint

### Quick Debug:
```javascript
// Add to your route for debugging
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS set:', !!process.env.EMAIL_PASS);
```

## 📱 SMS/WhatsApp Integration (Future)

To add real SMS/WhatsApp in production, integrate:

- **SMS**: Twilio, AWS SNS, TextLocal
- **WhatsApp**: Twilio WhatsApp API, Meta WhatsApp Business API

Replace the console.log in `notificationService.js` with actual API calls.

## 🎨 Customization

### Email Templates:
Edit templates in `backend/services/notificationService.js`:
- HTML styling
- Brand colors
- Logo images
- Button links

### Notification Stages:
Add new stages in the `notificationTemplates` object:
```javascript
NewStage: {
  subject: 'New Stage - #{id}',
  emailTemplate: '...',
  smsTemplate: '...'
}
```

---

**🎯 Ready for Demo!** Your notification system is now production-ready for hackathon presentation!