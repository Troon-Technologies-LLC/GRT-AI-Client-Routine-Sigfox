const { test } = require('@playwright/test');
const CharliPirKitchen = require('../../Fixtures/CharliPirKitchen');

test('PIR Kitchen sensor - Scheduled test', async ({ page }) => {
  const charliPirKitchen = new CharliPirKitchen(page);
  const response = await charliPirKitchen.sendSensorData();
  
  console.log(`Kitchen PIR API Response Status: ${response.status()}`);
  console.log('Kitchen sensor data sent to database');
});
