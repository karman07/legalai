# Server Deployment Guide

## Prerequisites

Your server needs the following installed:

### 1. Node.js (v18 or higher)
```bash
# For Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 2. Python 3.8+ with pip
```bash
# For Ubuntu/Debian
sudo apt update
sudo apt install -y python3 python3-pip python3-venv

# Verify installation
python3 --version
pip3 --version
```

### 3. FFmpeg (required for Whisper audio processing)
```bash
# For Ubuntu/Debian
sudo apt install -y ffmpeg

# For CentOS/RHEL
sudo yum install -y ffmpeg

# Verify installation
ffmpeg -version
```

### 4. Build Tools (for Python packages)
```bash
# For Ubuntu/Debian
sudo apt install -y build-essential python3-dev

# For CentOS/RHEL
sudo yum groupinstall -y "Development Tools"
sudo yum install -y python3-devel
```

---

## Installation Steps

### Step 1: Clone/Upload Your Code
```bash
cd /var/www  # or your preferred directory
# Upload your backend folder here
cd backend
```

### Step 2: Install Node.js Dependencies
```bash
npm install
```

### Step 3: Install Python Dependencies for Whisper
```bash
# Create a virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python packages
pip install -r requirements.txt

# Or install manually:
pip install openai-whisper torch torchaudio

# Deactivate for now
deactivate
```

### Step 4: Create Required Directories
```bash
mkdir -p uploads/audio
mkdir -p uploads/documents
mkdir -p uploads/pdfs
mkdir -p uploads/transcripts

# Set proper permissions
chmod 755 uploads
chmod 755 uploads/audio
chmod 755 uploads/documents
chmod 755 uploads/pdfs
chmod 755 uploads/transcripts
```

### Step 5: Configure Environment Variables
```bash
# Copy .env.example to .env (or create .env)
nano .env

# Update the following:
# - MONGODB_URI (your MongoDB Atlas connection string)
# - JWT_SECRET (generate a secure random string)
# - JWT_REFRESH_SECRET (generate another secure random string)
# - FRONTEND_URL (your frontend domain)
# - PORT (default 3000)
# - TRANSCRIPTION_METHOD=whisper-local
```

### Step 6: Build the Application
```bash
npm run build
```

### Step 7: Update Python Path in Service
Edit `src/audio-lessons/audio-lessons.service.ts` and update the Python path:

```typescript
// Change this line (around line 210):
const pythonPath = 'C:\\Users\\Dell\\AppData\\Local\\Programs\\Python\\Python312\\python.exe';

// To:
const pythonPath = '/usr/bin/python3';
// Or if using venv:
const pythonPath = '/var/www/backend/venv/bin/python3';
```

Or use environment variable approach (recommended).

---

## Running the Application

### Option 1: Direct Run (for testing)
```bash
npm run start:prod
```

### Option 2: Using PM2 (recommended for production)
```bash
# Install PM2 globally
sudo npm install -g pm2

# Start the application
pm2 start dist/main.js --name legalpadhai-backend

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Follow the command it outputs
```

### Option 3: Using systemd (alternative)
Create a service file:
```bash
sudo nano /etc/systemd/system/legalpadhai.service
```

Add this content:
```ini
[Unit]
Description=LegalPadhai Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/backend
Environment="NODE_ENV=production"
ExecStart=/usr/bin/node /var/www/backend/dist/main.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable legalpadhai
sudo systemctl start legalpadhai
sudo systemctl status legalpadhai
```

---

## Nginx Configuration (Reverse Proxy)

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    # File upload size limit (match your backend limit)
    client_max_body_size 500M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Increase timeouts for long transcription requests
        proxy_connect_timeout 600s;
        proxy_send_timeout 600s;
        proxy_read_timeout 600s;
    }

    # Serve uploaded files directly
    location /uploads/ {
        alias /var/www/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/legalpadhai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## SSL Configuration (Let's Encrypt)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

---

## Firewall Configuration
```bash
# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# If accessing Node.js directly (not recommended)
sudo ufw allow 3000/tcp

# Enable firewall
sudo ufw enable
```

---

## Environment-Specific Python Path Fix

### Create a startup script that detects Python path:
```bash
nano start.sh
```

Add this:
```bash
#!/bin/bash

# Find Python path
if [ -f "./venv/bin/python3" ]; then
    export PYTHON_PATH="$(pwd)/venv/bin/python3"
elif command -v python3 &> /dev/null; then
    export PYTHON_PATH="$(which python3)"
else
    echo "Python 3 not found!"
    exit 1
fi

echo "Using Python: $PYTHON_PATH"

# Start the application
node dist/main.js
```

Make it executable:
```bash
chmod +x start.sh
```

Update your service or PM2 to use `./start.sh` instead.

---

## Monitoring & Logs

### PM2 Logs
```bash
pm2 logs legalpadhai-backend
pm2 logs legalpadhai-backend --lines 100
```

### Systemd Logs
```bash
sudo journalctl -u legalpadhai -f
sudo journalctl -u legalpadhai --since "1 hour ago"
```

### Application Logs
Check your application logs in the configured directory.

---

## Troubleshooting

### Whisper Transcription Issues
```bash
# Test Python and Whisper
source venv/bin/activate
python3 -c "import whisper; print('Whisper installed:', whisper.__version__)"

# Test FFmpeg
ffmpeg -version

# Test transcription manually
python3 scripts/transcribe.py uploads/audio/test.wav output.txt
```

### Permission Issues
```bash
# Fix upload directory permissions
sudo chown -R www-data:www-data uploads
sudo chmod -R 755 uploads
```

### Out of Memory (for large audio files)
```bash
# Increase Node.js memory limit
node --max-old-space-size=4096 dist/main.js
```

Or in PM2:
```bash
pm2 start dist/main.js --name legalpadhai-backend --node-args="--max-old-space-size=4096"
```

---

## Performance Optimization

### 1. Enable gzip in Nginx
Add to nginx config:
```nginx
gzip on;
gzip_vary on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
```

### 2. Use a Process Manager
PM2 with cluster mode:
```bash
pm2 start dist/main.js -i max --name legalpadhai-backend
```

### 3. Database Indexes
Ensure MongoDB has proper indexes (already configured in schemas).

### 4. Redis Caching (optional)
For improved performance, consider adding Redis for caching.

---

## Backup Strategy

### 1. MongoDB Backup
```bash
# Using MongoDB Atlas: Automated backups available
# Or manual backup:
mongodump --uri="your_mongodb_uri" --out=/backups/mongodb
```

### 2. Uploaded Files Backup
```bash
# Daily backup of uploads directory
tar -czf /backups/uploads-$(date +%Y%m%d).tar.gz uploads/
```

### 3. Environment Variables
```bash
# Backup .env file securely
cp .env /secure/location/.env.backup
```

---

## Security Checklist

- [ ] Change default JWT secrets
- [ ] Use HTTPS (SSL certificate)
- [ ] Set proper file permissions (755 for directories, 644 for files)
- [ ] Configure firewall (UFW/iptables)
- [ ] Keep Node.js and npm updated
- [ ] Keep Python and pip updated
- [ ] Regular security updates: `sudo apt update && sudo apt upgrade`
- [ ] Use MongoDB Atlas IP whitelist
- [ ] Set up rate limiting (in application or nginx)
- [ ] Implement monitoring and alerts
- [ ] Regular backups

---

## Quick Commands Reference

```bash
# Start application
pm2 start dist/main.js --name legalpadhai-backend

# Stop application
pm2 stop legalpadhai-backend

# Restart application
pm2 restart legalpadhai-backend

# View logs
pm2 logs legalpadhai-backend

# Check status
pm2 status

# Monitor resources
pm2 monit

# Update application
git pull
npm install
npm run build
pm2 restart legalpadhai-backend
```

---

## Minimum Server Requirements

- **CPU**: 2 cores (4+ recommended for transcription)
- **RAM**: 4GB minimum (8GB+ recommended for Whisper)
- **Storage**: 50GB minimum (more for uploaded files)
- **OS**: Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- **Network**: Stable internet connection for MongoDB Atlas

---

## Support

For issues with:
- Node.js/NestJS: Check application logs
- Python/Whisper: Check Python logs and verify FFmpeg
- MongoDB: Check Atlas dashboard and connection string
- Nginx: Check nginx error logs at `/var/log/nginx/error.log`
