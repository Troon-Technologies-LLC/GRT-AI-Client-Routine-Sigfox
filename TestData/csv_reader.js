const fs = require('fs');
const path = require('path');

class CSVReader {
  static readSensorData(csvFileName = 'sensor_data.csv') {
    try {
      const csvPath = path.join(__dirname, csvFileName);
      const csvContent = fs.readFileSync(csvPath, 'utf-8');
      const lines = csvContent.trim().split('\n');
      const headers = lines[0].split(',');
      
      const data = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });
        data.push(row);
      }
      
      console.log(`Successfully read ${data.length} rows from CSV file: ${csvPath}`);
      return data;
      
    } catch (error) {
      console.error('Error reading CSV file:', error.message);
      throw error;
    }
  }

  static validateCSVData(data) {
    const requiredColumns = ['TestName', 'SensorLocation', 'SerialNumber', 'SigfoxSensors', 'ExpectedStatus'];
    
    if (!data || data.length === 0) {
      throw new Error('CSV file is empty or has no data');
    }

    const firstRow = data[0];
    const missingColumns = requiredColumns.filter(col => !(col in firstRow));
    
    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
    }

    console.log('✅ CSV data validation passed');
    return true;
  }
}

module.exports = CSVReader;
