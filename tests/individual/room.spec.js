const { test } = require('@playwright/test');
const CharliPirRoom = require('../../Fixtures/CharliPirRoom');

test('PIR Room sensor - Scheduled test', async ({ page }) => {
  const charliPirRoom = new CharliPirRoom(page);
  const response = await charliPirRoom.sendSensorData();
  
  console.log(`Room PIR API Response Status: ${response.status()}`);
  console.log('Room sensor data sent to database');
});
