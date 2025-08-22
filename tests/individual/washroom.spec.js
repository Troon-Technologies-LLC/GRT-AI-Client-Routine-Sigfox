const { test } = require('@playwright/test');
const CharliPirWashRoom = require('../../Fixtures/CharliPirWashRoom');

test('PIR WashRoom sensor - Scheduled test', async ({ page }) => {
  const charliPirWashRoom = new CharliPirWashRoom(page);
  const response = await charliPirWashRoom.sendSensorData();
  
  console.log(`WashRoom PIR API Response Status: ${response.status()}`);
  console.log('WashRoom sensor data sent to database');
});
