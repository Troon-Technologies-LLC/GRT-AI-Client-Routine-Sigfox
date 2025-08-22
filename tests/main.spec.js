const { test } = require('@playwright/test');
const CharliPirBasement = require('../Fixtures/CharliPirBasement');
const CharliPirKitchen = require('../Fixtures/CharliPirKitchen');
const CharliPirLivingroom = require('../Fixtures/CharliPirLivingroom');
const CharliPirOffice = require('../Fixtures/CharliPirOffice');
const CharliPirRoom = require('../Fixtures/CharliPirRoom');
const CharliPirWashRoom = require('../Fixtures/CharliPirWashRoom');
const ScheduleReader = require('../TestData/schedule_reader');

// 24/7 Continuous PIR Sensor Testing
test('24/7 PIR Sensor Testing - Continuous Operation', async ({ page }) => {
  // Set test timeout to 24 hours (for continuous operation)
  test.setTimeout(24 * 60 * 60 * 1000);
  console.log('🚀 Starting 24/7 PIR Sensor Testing...');
  console.log('⏰ Tests will run every 5 minutes based on client schedule');
  console.log('🛑 Press Ctrl+C to stop\n');

  let testCount = 0;
  
  // Continuous loop - runs until manually stopped
  while (true) {
    try {
      testCount++;
      console.log(`\n🔄 Test Cycle #${testCount} - ${new Date().toLocaleString()}`);
      
      await runCurrentScheduleTest(page);
      
      // Wait 5 minutes before next test
      console.log('⏳ Waiting 5 minutes until next test...\n');
      await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000));
      
    } catch (error) {
      console.error('❌ Error in test cycle:', error.message);
      console.log('🔄 Continuing in 30 seconds...');
      await new Promise(resolve => setTimeout(resolve, 30000));
    }
  }
});

// Function to run the current schedule test
async function runCurrentScheduleTest(page) {
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
  switch (currentSlot.location) {
    case 'Room':
      const charliPirRoom = new CharliPirRoom(page);
      response = await charliPirRoom.sendSensorData();
      console.log('✅ Room PIR Sensor Test - Response Status:', response.status());
      break;
      
    case 'WashRoom':
      const charliPirWashRoom = new CharliPirWashRoom(page);
      response = await charliPirWashRoom.sendSensorData();
      console.log('✅ WashRoom PIR Sensor Test - Response Status:', response.status());
      break;
      
    case 'Kitchen':
      const charliPirKitchen = new CharliPirKitchen(page);
      response = await charliPirKitchen.sendSensorData();
      console.log('✅ Kitchen PIR Sensor Test - Response Status:', response.status());
      break;
      
    case 'Livingroom':
      const charliPirLivingroom = new CharliPirLivingroom(page);
      response = await charliPirLivingroom.sendSensorData();
      console.log('✅ Livingroom PIR Sensor Test - Response Status:', response.status());
      break;
      
    case 'Office':
      const charliPirOffice = new CharliPirOffice(page);
      response = await charliPirOffice.sendSensorData();
      console.log('✅ Office PIR Sensor Test - Response Status:', response.status());
      break;
      
    case 'Basement':
      const charliPirBasement = new CharliPirBasement(page);
      response = await charliPirBasement.sendSensorData();
      console.log('✅ Basement PIR Sensor Test - Response Status:', response.status());
      break;
      
    default:
      console.log(`❌ Unknown location: ${currentSlot.location}`);
      return;
  }
  
  console.log(`🎯 PIR ${currentSlot.location} sensor test completed successfully`);
}