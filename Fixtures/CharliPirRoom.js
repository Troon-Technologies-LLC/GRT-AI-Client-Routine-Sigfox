// Charli PIR Room sensor fixture - Page Object Model
class CharliPirRoom {
  constructor(page) {
    this.page = page;
    this.apiUrl = 'https://grt-dev.grtinsight.com/api/Devices/StoreSigfoxTestData';
    this.sensorData = {
      name: "Charli PIR Room",
      type: "PIR",
      location: "Room",
      status: "active",
      serialNumber: "Charli PIR Room",
      sigfoxSensors: "motion"
    };
  }

  // Send sensor data to API
  async sendSensorData() {
    const formData = new FormData();
    formData.append('SigfoxSensors', this.sensorData.sigfoxSensors);
    formData.append('SerialNumber', this.sensorData.serialNumber);

    const response = await this.page.request.post(this.apiUrl, {
      form: {
        SigfoxSensors: this.sensorData.sigfoxSensors,
        SerialNumber: this.sensorData.serialNumber
      }
    });

    if (response.status() >= 400) {
      const responseText = await response.text();
      console.log('Error response body:', responseText);
    }

    return response;
  }

  // Get sensor information
  // getSensorInfo() {
  //   return this.sensorData;
  // }

  // // Update sensor status
  // updateStatus(newStatus) {
  //   this.sensorData.status = newStatus;
  // }
}

module.exports = CharliPirRoom;
