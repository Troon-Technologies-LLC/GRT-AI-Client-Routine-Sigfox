# VM Setup Guide for GRT-AI PIR Sensor Testing

## Prerequisites
1. **VM Requirements**:
   - Ubuntu 20.04+ or Windows Server 2019+
   - Node.js 18+
   - Git
   - 2GB+ RAM
   - Stable internet connection

## Installation Steps

### 1. Clone Repository
```bash
git clone https://github.com/your-username/GRT-AI.git
cd GRT-AI
```

### 2. Install Dependencies
```bash
npm install
npx playwright install chromium --with-deps
```

### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your settings:
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASS=your-app-password
# REPORT_EMAIL=recipient@example.com
# TIME_ZONE=-4
```

### 4. Test Installation
```bash
# Quick test (runs once and exits)
ONE_SHOT=1 SKIP_EMAIL=1 npx playwright test tests/main.spec.js --project=chromium
```

### 5. Run 24/7 Monitoring
```bash
# Start continuous monitoring
npx playwright test tests/main.spec.js --project=chromium
```

## VM-Specific Configurations

### For Linux VM:
```bash
# Install system dependencies
sudo apt update
sudo apt install -y curl wget gnupg

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Set timezone (optional)
sudo timedatectl set-timezone America/Toronto
```

### For Windows VM:
```powershell
# Install Node.js from https://nodejs.org/
# Install Git from https://git-scm.com/

# Set execution policy (if needed)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Running as Service

### Linux (systemd):
Create `/etc/systemd/system/grt-ai.service`:
```ini
[Unit]
Description=GRT-AI PIR Sensor Testing
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/GRT-AI
ExecStart=/usr/bin/npx playwright test tests/main.spec.js --project=chromium
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable grt-ai
sudo systemctl start grt-ai
sudo systemctl status grt-ai
```

### Windows (Task Scheduler):
1. Open Task Scheduler
2. Create Basic Task
3. Set trigger: "At startup"
4. Action: Start program
5. Program: `npx`
6. Arguments: `playwright test tests/main.spec.js --project=chromium`
7. Start in: `D:\GRT-AI`

## Monitoring & Logs

### View Logs:
```bash
# Linux
sudo journalctl -u grt-ai -f

# Windows
# Check Task Scheduler history or console output
```

### Health Check:
```bash
# Check if process is running
ps aux | grep playwright  # Linux
Get-Process | Where-Object {$_.ProcessName -like "*node*"}  # Windows
```

## Troubleshooting

### Common Issues:
1. **Playwright browser not found**: Run `npx playwright install chromium --with-deps`
2. **Permission denied**: Check file permissions and user access
3. **Email not working**: Verify Gmail app password and SMTP settings
4. **Timezone issues**: Set `TIME_ZONE` environment variable

### VM Performance:
- Minimum 2GB RAM recommended
- Monitor CPU usage during peak hours
- Consider headless mode for better performance (already enabled)

## Security Notes
- Never commit `.env` file with real credentials
- Use app passwords for Gmail (not regular password)
- Restrict VM network access to required ports only
- Regular security updates for VM OS
