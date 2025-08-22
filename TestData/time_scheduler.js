const ScheduleReader = require('./schedule_reader');
const { spawn } = require('child_process');
const path = require('path');

class TimeScheduler {
  constructor() {
    this.schedule = [];
    this.currentInterval = null;
    this.isRunning = false;
  }

  loadSchedule() {
    this.schedule = ScheduleReader.readMondaySchedule();
    console.log('📅 Monday schedule loaded:', this.schedule);
  }

  start() {
    if (this.isRunning) {
      console.log('⚠️ Scheduler is already running');
      return;
    }

    this.loadSchedule();
    this.isRunning = true;
    
    console.log('🚀 Starting time-based PIR sensor scheduler...');
    console.log('⏰ Tests will run every 5 minutes based on Monday routine');
    
    // Run immediately
    this.executeCurrentTest();
    
    // Set interval to run every 5 minutes (300,000 ms)
    this.currentInterval = setInterval(() => {
      this.executeCurrentTest();
    }, 5 * 60 * 1000);
  }

  stop() {
    if (this.currentInterval) {
      clearInterval(this.currentInterval);
      this.currentInterval = null;
    }
    this.isRunning = false;
    console.log('⏹️ Scheduler stopped');
  }

  executeCurrentTest() {
    const currentSlot = ScheduleReader.getCurrentTimeSlot(this.schedule);
    
    if (!currentSlot) {
      console.log('⏰ No active time slot found for current time');
      return;
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString();
    
    console.log(`\n🕐 ${timeStr} - Client should be in: ${currentSlot.location}`);
    console.log(`📍 Triggering PIR sensor: ${currentSlot.device}`);
    
    this.runPirTest(currentSlot.location);
  }

  runPirTest(location) {
    const testCommand = this.getTestCommand(location);
    
    if (!testCommand) {
      console.log(`❌ No test command found for location: ${location}`);
      return;
    }

    console.log(`🧪 Running test: ${testCommand}`);
    
    // Run the Playwright test
    const child = spawn('npx', ['playwright', 'test', testCommand, '--project=chromium'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe'
    });

    child.stdout.on('data', (data) => {
      console.log(`📊 Test Output: ${data.toString().trim()}`);
    });

    child.stderr.on('data', (data) => {
      console.error(`❌ Test Error: ${data.toString().trim()}`);
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ PIR ${location} test completed successfully`);
      } else {
        console.log(`❌ PIR ${location} test failed with code ${code}`);
      }
    });
  }

  getTestCommand(location) {
    const testMap = {
      'Room': 'tests/individual/room.spec.js',
      'WashRoom': 'tests/individual/washroom.spec.js', 
      'Kitchen': 'tests/individual/kitchen.spec.js',
      'Livingroom': 'tests/individual/livingroom.spec.js',
      'Office': 'tests/individual/office.spec.js',
      'Basement': 'tests/individual/basement.spec.js'
    };
    
    return testMap[location] || null;
  }

  getStatus() {
    const currentSlot = ScheduleReader.getCurrentTimeSlot(this.schedule);
    const now = new Date();
    
    return {
      isRunning: this.isRunning,
      currentTime: now.toLocaleTimeString(),
      currentSlot: currentSlot,
      nextCheck: this.isRunning ? 'Every 5 minutes' : 'Not scheduled'
    };
  }
}

module.exports = TimeScheduler;
