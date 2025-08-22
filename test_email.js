// Test script for email reporter functionality
require('dotenv').config();
const EmailReporter = require('./TestData/email_reporter');

async function testEmailReporter() {
  console.log('🧪 Testing Email Reporter System...\n');
  
  // Create email reporter instance
  const emailReporter = new EmailReporter();
  
  // Test 1: Check email configuration
  console.log('📧 Testing email configuration...');
  const emailValid = await emailReporter.testEmailConnection();
  
  if (!emailValid) {
    console.log('❌ Email configuration failed. Check your credentials in .env file');
    return;
  }
  
  // Test 2: Add some sample test results
  console.log('📊 Adding sample test results...');
  
  // Sample successful test
  emailReporter.logTestResult({
    testCycle: 1,
    dayName: 'Thursday',
    currentTime: new Date().toLocaleTimeString(),
    location: 'Kitchen',
    device: 'Charli PIR Kitchen',
    timeSlot: '2:00 PM - 3:00 PM',
    status: 'success',
    responseStatus: 200,
    error: null
  });
  
  // Sample failed test
  emailReporter.logTestResult({
    testCycle: 2,
    dayName: 'Thursday',
    currentTime: new Date().toLocaleTimeString(),
    location: 'Office',
    device: 'Charli PIR Office',
    timeSlot: '3:00 PM - 4:00 PM',
    status: 'error',
    responseStatus: 'Error',
    error: 'Network timeout'
  });
  
  // Sample no active slot
  emailReporter.logTestResult({
    testCycle: 3,
    dayName: 'Thursday',
    currentTime: new Date().toLocaleTimeString(),
    location: 'N/A',
    device: 'N/A',
    timeSlot: 'No active time slot',
    status: 'success',
    responseStatus: 'Skipped',
    error: null
  });
  
  console.log('✅ Sample test results added');
  
  // Test 3: Send test email report
  console.log('📨 Sending test email report...');
  
  try {
    await emailReporter.sendHourlyReport();
    console.log('✅ Test email sent successfully!');
    console.log('📬 Check your email: amin@troontechnologies.com');
    
  } catch (error) {
    console.error('❌ Failed to send test email:', error.message);
  }
  
  console.log('\n🎯 Email Reporter Test Complete!');
}

// Run the test
testEmailReporter().catch(console.error);
