/**
 * Test Script for Notification System
 * Run this script to test notifications without starting the full server
 *
 * Usage: node test-notifications.js
 */

require('dotenv').config();
const { sendNotification, testEmailConfiguration } = require('./services/notificationService');

const runTests = async () => {
  console.log('🧪 Testing Notification System...\n');

  // Test 1: Email Configuration
  console.log('1. Testing Email Configuration...');
  try {
    const configValid = await testEmailConfiguration();
    console.log(configValid ? '✅ Email config valid' : '❌ Email config invalid');
  } catch (error) {
    console.log('❌ Email config test failed:', error.message);
    return; // Exit if email config is invalid
  }

  // Test Customer Data
  const testCustomer = {
    name: 'John Demo',
    email: process.env.TEST_EMAIL || 'test@example.com', // Use TEST_EMAIL env var if available
    phone: '+91-9876543210'
  };

  console.log(`\n📧 Sending test notifications to: ${testCustomer.email}\n`);

  // Test 2: Created Notification
  console.log('2. Testing "Created" notification...');
  try {
    await sendNotification(testCustomer, 'Created', {
      id: 'TEST-001'
    });
    console.log('✅ Created notification sent');
  } catch (error) {
    console.log('❌ Created notification failed:', error.message);
  }

  // Wait 2 seconds between emails
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 3: Cost Estimate Notification
  console.log('\n3. Testing "CostEstimate" notification...');
  try {
    await sendNotification(testCustomer, 'CostEstimate', {
      id: 'TEST-001',
      amount: '2,500',
      description: 'LCD screen replacement + labor charges'
    });
    console.log('✅ Cost estimate notification sent');
  } catch (error) {
    console.log('❌ Cost estimate notification failed:', error.message);
  }

  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 4: Repaired Notification
  console.log('\n4. Testing "Repaired" notification...');
  try {
    await sendNotification(testCustomer, 'Repaired', {
      id: 'TEST-001',
      workDone: 'LCD screen replaced, digitizer calibrated, and quality tested'
    });
    console.log('✅ Repaired notification sent');
  } catch (error) {
    console.log('❌ Repaired notification failed:', error.message);
  }

  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 5: Dispatched Notification
  console.log('\n5. Testing "Dispatched" notification...');
  try {
    await sendNotification(testCustomer, 'Dispatched', {
      id: 'TEST-001',
      trackingNo: 'BD' + Date.now(),
      courier: 'BlueDart Express',
      expectedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      trackingUrl: 'https://www.bluedart.com/tracking/BD' + Date.now()
    });
    console.log('✅ Dispatched notification sent');
  } catch (error) {
    console.log('❌ Dispatched notification failed:', error.message);
  }

  console.log('\n🎉 Notification system test completed!');
  console.log('📧 Check your email inbox for the test notifications');
  console.log('📱 Check console above for SMS/WhatsApp log messages');

  process.exit(0);
};

// Run tests
runTests().catch(error => {
  console.error('🔥 Test script failed:', error);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Test script interrupted');
  process.exit(0);
});