const fs = require('fs');
const path = require('path');

class ScheduleReader {
  static readDailySchedule(csvFileName) {
    try {
      const csvPath = path.join(__dirname, csvFileName);
      const csvContent = fs.readFileSync(csvPath, 'utf-8');
      const lines = csvContent.trim().split('\n');
      
      const schedule = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line && line !== '.') {
          const [device, timeRange] = line.split(',');
          if (device && timeRange) {
            const [startTime, endTime] = timeRange.trim().split(' - ');
            schedule.push({
              device: device.trim(),
              startTime: startTime.trim(),
              endTime: endTime.trim(),
              location: this.extractLocation(device.trim())
            });
          }
        }
      }
      
      console.log(`Successfully read ${schedule.length} schedule entries from ${csvFileName}`);
      return schedule;
      
    } catch (error) {
      console.error('Error reading schedule:', error.message);
      throw error;
    }
  }

  static extractLocation(deviceName) {
    // Extract location from device name (e.g., "Charli PIR Room" -> "Room")
    const parts = deviceName.split(' ');
    return parts[parts.length - 1];
  }

  static getCurrentTimeSlot(schedule) {
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                       now.getMinutes().toString().padStart(2, '0');
    
    for (const slot of schedule) {
      if (this.isTimeInRange(currentTime, slot.startTime, slot.endTime)) {
        return slot;
      }
    }
    
    return null;
  }

  static isTimeInRange(currentTime, startTime, endTime) {
    const current = this.timeToMinutes(currentTime);
    const start = this.timeToMinutes(startTime);
    let end = this.timeToMinutes(endTime);
    
    // Handle overnight time ranges (e.g., 20:00 - 8:00)
    if (end < start) {
      end += 24 * 60; // Add 24 hours in minutes
      if (current < start) {
        return current + 24 * 60 >= start && current + 24 * 60 <= end;
      }
    }
    
    return current >= start && current <= end;
  }

  static timeToMinutes(timeStr) {
    // Handle both 12-hour format (with AM/PM) and 24-hour format
    const timeString = timeStr.trim();
    
    if (timeString.includes('AM') || timeString.includes('PM')) {
      // 12-hour format parsing
      const isPM = timeString.includes('PM');
      const cleanTime = timeString.replace(/\s*(AM|PM)\s*/, '');
      const [hours, minutes] = cleanTime.split(':').map(Number);
      
      let hour24 = hours;
      if (isPM && hours !== 12) {
        hour24 = hours + 12;
      } else if (!isPM && hours === 12) {
        hour24 = 0; // 12:00 AM is 00:00 in 24-hour format
      }
      
      return hour24 * 60 + minutes;
    } else {
      // 24-hour format parsing (fallback)
      const [hours, minutes] = timeString.split(':').map(Number);
      return hours * 60 + minutes;
    }
  }

  static getNextScheduleChange(schedule) {
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                       now.getMinutes().toString().padStart(2, '0');
    
    // Find the next time slot change
    for (const slot of schedule) {
      const startMinutes = this.timeToMinutes(slot.startTime);
      const currentMinutes = this.timeToMinutes(currentTime);
      
      if (startMinutes > currentMinutes) {
        return slot;
      }
    }
    
    // If no slot found for today, return first slot of next day
    return schedule[0];
  }
}

module.exports = ScheduleReader;
