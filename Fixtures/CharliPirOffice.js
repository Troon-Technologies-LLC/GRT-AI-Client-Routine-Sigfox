// Charli PIR Office sensor fixture - Page Object Model
class CharliPirOffice {
  constructor(page) {
    this.page = page;
    this.apiUrl = 'https://grt-dev.grtinsight.com/api/Devices/StoreSigfoxTestData';
    this.sensorData = {
      name: "Charli PIR Office",
      type: "PIR",
      location: "Office",
      status: "active",
      serialNumber: "Charli PIR Office",
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

  // // Get sensor information
  // getSensorInfo() {
  //   return this.sensorData;
  // }

  // // Update sensor status
  // updateStatus(newStatus) {
  //   this.sensorData.status = newStatus;
  // }
}

module.exports = CharliPirOffice;
