require('dotenv').config();
const { test } = require('@playwright/test');
const CharliPirBasement = require('../Fixtures/CharliPirBasement');
const CharliPirKitchen = require('../Fixtures/CharliPirKitchen');
const CharliPirLivingroom = require('../Fixtures/CharliPirLivingroom');
const CharliPirOffice = require('../Fixtures/CharliPirOffice');
const CharliPirRoom = require('../Fixtures/CharliPirRoom');
const CharliPirWashRoom = require('../Fixtures/CharliPirWashRoom');
const ScheduleReader = require('../TestData/schedule_reader');
const EmailReporter = require('../TestData/email_reporter');

// 24/7 Continuous PIR Sensor Testing
test('24/7 PIR Sensor Testing - Continuous Operation', async ({ page }) => {
  // Set test timeout to 0 (infinite - no timeout)
  test.setTimeout(0);
  console.log('🚀 Starting 24/7 PIR Sensor Testing....');
  console.log('⏰ Tests will run every 5 minutes based on client schedule');
  console.log('📧 Hourly email reports will be sent automatically');
  console.log('🛑 Press Ctrl+C to stop\n');

  // Initialize email reporter
  const emailReporter = new EmailReporter();
  
  // Test email configuration (non-blocking)
  let emailValid = false;
  try {
    emailValid = await emailReporter.testEmailConnection();
    if (emailValid) {
      console.log('✅ Email reporting system initialized');
      emailReporter.startHourlyReporting();
    } else {
      console.log('⚠️ Email reporting disabled - continuing without emails');
    }
  } catch (error) {
    console.log('⚠️ Email system error - continuing without emails:', error.message);
  }

  let testCount = 0;
  
  // Continuous loop - runs until manually stopped
  while (true) {
    try {
      testCount++;
      console.log(`\n🔄 Test Cycle #${testCount} - ${new Date().toLocaleString()}`);
      
      await runCurrentScheduleTest(page, testCount, emailReporter, emailValid);
      
      // Wait 5 minutes before next test
      console.log('⏳ Waiting 5 minutes until next test...\n');
      await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000));
      
    } catch (error) {
      console.error('❌ Error in test cycle:', error.message);
      console.log('🔄 Continuing in 30 seconds...');
      
      // Log error to email reporter (only if email is working)
      if (emailReporter && emailValid) {
        try {
          const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const today = new Date().getDay();
          const dayName = days[today];
          
          emailReporter.logTestResult({
            testCycle: testCount,
            dayName: dayName,
            currentTime: new Date().toLocaleTimeString(),
            location: 'Unknown',
            device: 'Unknown',
            timeSlot: 'Error occurred',
            status: 'error',
            responseStatus: 'N/A',
            error: error.message
          });
        } catch (emailError) {
          // Silently ignore email logging errors
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 30000));
    }
  }
});

// Function to run the current schedule test
async function runCurrentScheduleTest(page, testCount, emailReporter, emailValid) {
  // Get current day and load schedule
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date().getDay();
  const dayName = days[today];
  const csvFileName = `${dayName}.csv`;
  
  console.log(`📅 Testing for: ${dayName}`);
  
  // Load today's schedule
  const schedule = ScheduleReader.readDailySchedule(csvFileName);
  const currentSlot = ScheduleReader.getCurrentTimeSlot(schedule);
  
  if (!currentSlot) {
    console.log('⏰ No active time slot found for current time');
    
    // Log "no active slot" to email reporter (only if email is working)
    if (emailReporter && emailValid) {
      try {
        emailReporter.logTestResult({
          testCycle: testCount,
          dayName: dayName,
          currentTime: new Date().toLocaleTimeString(),
          location: 'N/A',
          device: 'N/A',
          timeSlot: 'No active time slot',
          status: 'success',
          responseStatus: 'Skipped',
          error: null
        });
      } catch (emailError) {
        // Silently ignore email logging errors
      }
    }
    return;
  }
  
  const now = new Date();
  const timeStr = now.toLocaleTimeString();
  
  console.log(`🕐 Current Time: ${timeStr}`);
  console.log(`📍 Client Location: ${currentSlot.location}`);
  console.log(`🔍 Testing PIR Sensor: ${currentSlot.device}`);
  console.log(`⏰ Time Slot: ${currentSlot.startTime} - ${currentSlot.endTime}`);
  
  // Call appropriate fixture based on current location
  let response;
  let testStatus = 'success';
  let responseStatus = 'N/A';
  
  try {
    switch (currentSlot.location) {
      case 'Room':
        const charliPirRoom = new CharliPirRoom(page);
        response = await charliPirRoom.sendSensorData();
        responseStatus = response.status();
        console.log('✅ Room PIR Sensor Test - Response Status:', responseStatus);
        break;
        
      case 'WashRoom':
        const charliPirWashRoom = new CharliPirWashRoom(page);
        response = await charliPirWashRoom.sendSensorData();
        responseStatus = response.status();
        console.log('✅ WashRoom PIR Sensor Test - Response Status:', responseStatus);
        break;
        
      case 'Kitchen':
        const charliPirKitchen = new CharliPirKitchen(page);
        response = await charliPirKitchen.sendSensorData();
        responseStatus = response.status();
        console.log('✅ Kitchen PIR Sensor Test - Response Status:', responseStatus);
        break;
        
      case 'Livingroom':
        const charliPirLivingroom = new CharliPirLivingroom(page);
        response = await charliPirLivingroom.sendSensorData();
        responseStatus = response.status();
        console.log('✅ Livingroom PIR Sensor Test - Response Status:', responseStatus);
        break;
        
      case 'Office':
        const charliPirOffice = new CharliPirOffice(page);
        response = await charliPirOffice.sendSensorData();
        responseStatus = response.status();
        console.log('✅ Office PIR Sensor Test - Response Status:', responseStatus);
        break;
        
      case 'Basement':
        const charliPirBasement = new CharliPirBasement(page);
        response = await charliPirBasement.sendSensorData();
        responseStatus = response.status();
        console.log('✅ Basement PIR Sensor Test - Response Status:', responseStatus);
        break;
        
      default:
        console.log(`❌ Unknown location: ${currentSlot.location}`);
        testStatus = 'error';
        responseStatus = 'Unknown Location';
        
        // Log unknown location error (only if email is working)
        if (emailReporter && emailValid) {
          try {
            emailReporter.logTestResult({
              testCycle: testCount,
              dayName: dayName,
              currentTime: timeStr,
              location: currentSlot.location,
              device: currentSlot.device,
              timeSlot: `${currentSlot.startTime} - ${currentSlot.endTime}`,
              status: 'error',
              responseStatus: 'Unknown Location',
              error: `Unknown location: ${currentSlot.location}`
            });
          } catch (emailError) {
            // Silently ignore email logging errors
          }
        }
        return;
    }
    
    console.log(`🎯 PIR ${currentSlot.location} sensor test completed successfully`);
    
  } catch (error) {
    console.error(`❌ Error testing ${currentSlot.location} PIR sensor:`, error.message);
    testStatus = 'error';
    responseStatus = 'Error';
  }
  
  // Log test result to email reporter (only if email is working)
  if (emailReporter && emailValid) {
    try {
      emailReporter.logTestResult({
        testCycle: testCount,
        dayName: dayName,
        currentTime: timeStr,
        location: currentSlot.location,
        device: currentSlot.device,
        timeSlot: `${currentSlot.startTime} - ${currentSlot.endTime}`,
        status: testStatus,
        responseStatus: responseStatus,
        error: testStatus === 'error' ? 'API call failed' : null
      });
    } catch (emailError) {
      // Silently ignore email logging errors
    }
  }
}