const { test } = require('@playwright/test');
const CharliPirLivingroom = require('../../Fixtures/CharliPirLivingroom');

test('PIR Livingroom sensor - Scheduled test', async ({ page }) => {
  const charliPirLivingroom = new CharliPirLivingroom(page);
  const response = await charliPirLivingroom.sendSensorData();
  
  console.log(`Livingroom PIR API Response Status: ${response.status()}`);
  console.log('Livingroom sensor data sent to database');
});
