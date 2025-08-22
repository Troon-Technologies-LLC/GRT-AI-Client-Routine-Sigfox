const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

class EmailReporter {
  constructor() {
    this.testResults = [];
    this.hourlyTimer = null;
    this.lastReportTime = new Date();
    
    // Email configuration - Custom SMTP for troontechnologies.com
    this.emailConfig = {
      host: 'smtp.gmail.com', // Gmail SMTP for custom domain
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    };
    
    this.recipients = [
      process.env.REPORT_EMAIL
    ];
    
    this.transporter = nodemailer.createTransport(this.emailConfig);
  }

  // Start hourly email reporting
  startHourlyReporting() {
    console.log('📧 Starting hourly email reporting...');
    
    // Send report every hour (3600000 ms)
    this.hourlyTimer = setInterval(() => {
      this.sendHourlyReport();
    }, 60 * 60 * 1000); // 1 hour
    
    // Also send initial report after 5 minutes for testing
    setTimeout(() => {
      console.log('📧 Sending initial test report...');
      this.sendHourlyReport();
    }, 5 * 60 * 1000); // 5 minutes
  }

  // Stop hourly reporting
  stopHourlyReporting() {
    if (this.hourlyTimer) {
      clearInterval(this.hourlyTimer);
      this.hourlyTimer = null;
      console.log('📧 Hourly email reporting stopped');
    }
  }

  // Log test result
  logTestResult(testData) {
    const result = {
      timestamp: new Date(),
      testCycle: testData.testCycle,
      dayName: testData.dayName,
      currentTime: testData.currentTime,
      location: testData.location,
      device: testData.device,
      timeSlot: testData.timeSlot,
      status: testData.status,
      responseStatus: testData.responseStatus,
      error: testData.error || null
    };
    
    this.testResults.push(result);
    
    // Keep only last 24 hours of results to prevent memory issues
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.testResults = this.testResults.filter(result => result.timestamp > oneDayAgo);
  }

  // Get results from last hour
  getLastHourResults() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return this.testResults.filter(result => result.timestamp > oneHourAgo);
  }

  // Generate HTML email report
  generateEmailReport(results) {
    const now = new Date();
    const reportPeriod = `${this.lastReportTime.toLocaleString()} - ${now.toLocaleString()}`;
    
    const totalTests = results.length;
    const successfulTests = results.filter(r => r.status === 'success').length;
    const failedTests = results.filter(r => r.status === 'error').length;
    const successRate = totalTests > 0 ? ((successfulTests / totalTests) * 100).toFixed(1) : 0;

    let html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 15px; border-radius: 5px; }
            .summary { background-color: #f9f9f9; padding: 15px; margin: 10px 0; border-radius: 5px; }
            .test-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            .test-table th, .test-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .test-table th { background-color: #f2f2f2; }
            .success { color: #4CAF50; font-weight: bold; }
            .error { color: #f44336; font-weight: bold; }
            .no-test { color: #ff9800; font-style: italic; }
        </style>
    </head>
    <body>
        <div class="header">
            <h2>🔍 PIR Sensor Testing - Hourly Report</h2>
            <p>Report Period: ${reportPeriod}</p>
        </div>
        
        <div class="summary">
            <h3>📊 Summary</h3>
            <p><strong>Total Tests:</strong> ${totalTests}</p>
            <p><strong>Successful:</strong> <span class="success">${successfulTests}</span></p>
            <p><strong>Failed:</strong> <span class="error">${failedTests}</span></p>
            <p><strong>Success Rate:</strong> ${successRate}%</p>
        </div>`;

    if (totalTests > 0) {
      html += `
        <h3>📋 Test Details</h3>
        <table class="test-table">
            <tr>
                <th>Time</th>
                <th>Cycle #</th>
                <th>Day</th>
                <th>Location</th>
                <th>Device</th>
                <th>Time Slot</th>
                <th>Status</th>
                <th>Response</th>
            </tr>`;

      results.forEach(result => {
        const statusClass = result.status === 'success' ? 'success' : 'error';
        const statusText = result.status === 'success' ? '✅ Success' : '❌ Failed';
        
        html += `
            <tr>
                <td>${result.timestamp.toLocaleTimeString()}</td>
                <td>${result.testCycle}</td>
                <td>${result.dayName}</td>
                <td>${result.location || 'N/A'}</td>
                <td>${result.device || 'N/A'}</td>
                <td>${result.timeSlot || 'No active slot'}</td>
                <td class="${statusClass}">${statusText}</td>
                <td>${result.responseStatus || 'N/A'}</td>
            </tr>`;
      });

      html += `</table>`;
    } else {
      html += `<p class="no-test">⏰ No tests were executed in the last hour (outside of scheduled time slots)</p>`;
    }

    html += `
        <div style="margin-top: 20px; padding: 10px; background-color: #e3f2fd; border-radius: 5px;">
            <p><strong>🤖 PIR Sensor Scheduler Status:</strong> Running 24/7</p>
            <p><strong>⏰ Next Report:</strong> ${new Date(Date.now() + 60 * 60 * 1000).toLocaleString()}</p>
        </div>
    </body>
    </html>`;

    return html;
  }

  // Send hourly email report
  async sendHourlyReport() {
    try {
      const results = this.getLastHourResults();
      const htmlContent = this.generateEmailReport(results);
      
      const now = new Date();
      const subject = `PIR Sensor Report - ${now.toLocaleDateString()} ${now.getHours()}:00`;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: this.recipients.join(', '),
        subject: subject,
        html: htmlContent
      };

      await this.transporter.sendMail(mailOptions);
      
      console.log(`📧 Hourly report sent successfully to: ${this.recipients.join(', ')}`);
      console.log(`📊 Report included ${results.length} test results from the last hour`);
      
      this.lastReportTime = now;
      
    } catch (error) {
      console.error('❌ Failed to send hourly report:', error.message);
    }
  }

  // Test email configuration
  async testEmailConnection() {
    try {
      // Skip email verification if credentials are not provided
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('⚠️ Email credentials not configured - email reporting disabled');
        return false;
      }
      
      await this.transporter.verify();
      console.log('✅ Email configuration is valid');
      return true;
    } catch (error) {
      console.error('❌ Email configuration error:', error.message);
      console.log('💡 For Gmail: You need an App Password, not your regular password');
      console.log('💡 Visit: https://support.google.com/accounts/answer/185833');
      return false;
    }
  }
}

module.exports = EmailReporter;
