const { test } = require('@playwright/test');
const CharliPirBasement = require('../../Fixtures/CharliPirBasement');

test('PIR Basement sensor - Scheduled test', async ({ page }) => {
  const charliPirBasement = new CharliPirBasement(page);
  const response = await charliPirBasement.sendSensorData();
  
  console.log(`Basement PIR API Response Status: ${response.status()}`);
  console.log('Basement sensor data sent to database');
});
