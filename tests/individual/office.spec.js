const { test } = require('@playwright/test');
const CharliPirOffice = require('../../Fixtures/CharliPirOffice');

test('PIR Office sensor - Scheduled test', async ({ page }) => {
  const charliPirOffice = new CharliPirOffice(page);
  const response = await charliPirOffice.sendSensorData();
  
  console.log(`Office PIR API Response Status: ${response.status()}`);
  console.log('Office sensor data sent to database');
});
