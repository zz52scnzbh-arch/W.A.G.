# 🚀 Deployment Guide - Endelave Forecast Agent

This guide provides step-by-step instructions for deploying the Endelave Forecast Agent in production.

## Prerequisites

- Node.js 16+ installed
- MongoDB instance (local, MongoDB Atlas, or other)
- OpenAI API key
- OpenWeather API key
- Email SMTP credentials (Gmail, SendGrid, etc.)

## Quick Deployment Steps

### 1. Clone and Install

```bash
git clone https://github.com/zz52scnzbh-arch/W.A.G.git
cd W.A.G
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Server
PORT=3000
NODE_ENV=production

# MongoDB (use MongoDB Atlas for cloud)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/endelave-forecast

# OpenAI (required)
OPENAI_API_KEY=sk-...your-key-here

# OpenWeather (required)
OPENWEATHER_API_KEY=your-key-here
OPENWEATHER_LAT=55.75
OPENWEATHER_LON=10.27

# Email (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_TO=manager@endelave.dk

# Cron (4 AM daily)
CRON_SCHEDULE=0 4 * * *
CRON_ENABLED=true
```

### 3. Test the Application

```bash
# Run validation tests
npm test

# Start the server
npm start
```

### 4. Verify API

```bash
# Check health
curl http://localhost:3000/

# Test forecast
curl -X POST http://localhost:3000/forecast/run
```

## Production Deployment Options

### Option 1: Traditional Server (VPS, Dedicated)

#### Using PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start src/index.js --name endelave-forecast

# Enable startup script
pm2 startup
pm2 save

# Monitor
pm2 logs endelave-forecast
pm2 status
```

#### Using systemd

Create `/etc/systemd/system/endelave-forecast.service`:

```ini
[Unit]
Description=Endelave Forecast Agent
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/W.A.G
ExecStart=/usr/bin/node src/index.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable endelave-forecast
sudo systemctl start endelave-forecast
sudo systemctl status endelave-forecast
```

### Option 2: Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src ./src
COPY .env .env

EXPOSE 3000

CMD ["node", "src/index.js"]
```

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/endelave-forecast
    depends_on:
      - mongo
    restart: unless-stopped

  mongo:
    image: mongo:7
    volumes:
      - mongo-data:/data/db
    restart: unless-stopped

volumes:
  mongo-data:
```

Deploy:

```bash
docker-compose up -d
```

### Option 3: Cloud Platforms

#### Heroku

```bash
# Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login
heroku login

# Create app
heroku create endelave-forecast

# Add MongoDB
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set OPENAI_API_KEY=sk-...
heroku config:set OPENWEATHER_API_KEY=...
heroku config:set EMAIL_USER=...
heroku config:set EMAIL_PASS=...

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

#### Railway

1. Sign up at [railway.app](https://railway.app)
2. Create new project from GitHub repo
3. Add MongoDB plugin
4. Set environment variables in dashboard
5. Deploy automatically

#### DigitalOcean App Platform

1. Create App Platform project
2. Connect GitHub repository
3. Add MongoDB managed database
4. Configure environment variables
5. Deploy

## Database Setup

### MongoDB Atlas (Recommended for Cloud)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster (M0)
3. Create database user
4. Whitelist IP (0.0.0.0/0 for testing, specific IPs for production)
5. Get connection string
6. Add to `.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/endelave-forecast
   ```

### Local MongoDB

```bash
# Ubuntu/Debian
sudo apt-get install mongodb

# Start service
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Connection string
MONGODB_URI=mongodb://localhost:27017/endelave-forecast
```

## Email Configuration

### Gmail

1. Enable 2-factor authentication
2. Generate App Password: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Use App Password in `.env`:
   ```
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-char-app-password
   ```

### SendGrid

```bash
# Install SendGrid
npm install @sendgrid/mail

# Configure
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=SG.your-api-key
```

## Reverse Proxy (Nginx)

Create `/etc/nginx/sites-available/endelave-forecast`:

```nginx
server {
    listen 80;
    server_name forecast.endelave.dk;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable and restart:

```bash
sudo ln -s /etc/nginx/sites-available/endelave-forecast /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d forecast.endelave.dk

# Auto-renewal is configured automatically
sudo certbot renew --dry-run
```

## Monitoring and Logging

### PM2 Monitoring

```bash
# View logs
pm2 logs endelave-forecast

# Monitor resources
pm2 monit

# Web dashboard
pm2 plus
```

### Log Rotation

Create `/etc/logrotate.d/endelave-forecast`:

```
/var/log/endelave-forecast/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
}
```

## Backup Strategy

### MongoDB Backup

```bash
# Manual backup
mongodump --uri="mongodb+srv://..." --out=/backups/$(date +%Y%m%d)

# Automated daily backup (cron)
0 2 * * * mongodump --uri="..." --out=/backups/$(date +\%Y\%m\%d)
```

### Environment Backup

```bash
# Backup .env securely
gpg -c .env
# Store .env.gpg in secure location
```

## Scaling Considerations

### Horizontal Scaling

- Use load balancer (nginx, HAProxy)
- Multiple app instances
- Shared MongoDB cluster
- Redis for session management (if needed)

### Performance Optimization

```javascript
// Enable compression
const compression = require('compression');
app.use(compression());

// Enable caching headers
app.use((req, res, next) => {
  res.set('Cache-Control', 'public, max-age=300');
  next();
});
```

## Troubleshooting

### Application Won't Start

```bash
# Check logs
pm2 logs endelave-forecast --lines 100

# Check MongoDB connection
mongo "mongodb+srv://..." --eval "db.adminCommand('ping')"

# Verify environment variables
pm2 env 0
```

### Cron Job Not Running

```bash
# Check cron is enabled
# In .env: CRON_ENABLED=true

# Verify cron schedule format
# Use: https://crontab.guru/

# Check logs for cron execution
pm2 logs | grep "Cron job triggered"
```

### Email Not Sending

```bash
# Test SMTP connection
node -e "
const nodemailer = require('nodemailer');
const transport = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: { user: 'email', pass: 'pass' }
});
transport.verify().then(console.log).catch(console.error);
"
```

## Security Checklist

- [ ] Use strong MongoDB authentication
- [ ] Enable MongoDB encryption at rest
- [ ] Rotate API keys regularly
- [ ] Use HTTPS (SSL/TLS)
- [ ] Set secure environment variables
- [ ] Enable rate limiting (already included)
- [ ] Regular security updates (`npm audit`)
- [ ] Firewall configuration
- [ ] Regular backups
- [ ] Monitor logs for anomalies

## Maintenance

### Regular Updates

```bash
# Update dependencies
npm update

# Security audit
npm audit
npm audit fix

# Test after updates
npm test
```

### Database Maintenance

```bash
# MongoDB cleanup (monthly)
mongo endelave-forecast --eval "db.runCommand({ compact: 'forecast_results' })"

# Index optimization
mongo endelave-forecast --eval "db.forecast_results.reIndex()"
```

## Cost Estimation

### Free Tier Option
- **MongoDB Atlas**: Free M0 cluster (512 MB)
- **Heroku/Railway**: Free tier available
- **OpenAI**: Pay-as-you-go (~$0.02 per forecast)
- **OpenWeather**: Free tier (1000 calls/day)
- **Total**: ~$5-10/month

### Production Tier
- **VPS (DigitalOcean)**: $12/month
- **MongoDB Atlas**: $9/month (M10)
- **OpenAI API**: ~$15/month
- **OpenWeather**: Free tier sufficient
- **Domain + SSL**: $10/year
- **Total**: ~$35/month

## Support and Updates

For issues or questions:
- GitHub Issues: [github.com/zz52scnzbh-arch/W.A.G/issues](https://github.com/zz52scnzbh-arch/W.A.G/issues)
- Email: support@endelave.dk

---

**Ready to deploy!** Start with the Quick Deployment steps above, then choose your preferred production deployment option.
