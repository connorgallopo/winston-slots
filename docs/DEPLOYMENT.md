# Deployment Guide

This guide covers deploying the Slot Machine application to production.

## Quick Start

### Local Development

```bash
# Terminal 1: Backend
bundle exec rails server

# Terminal 2: Frontend
cd frontend && npm run dev
```

Access:
- iPad: http://localhost:5173
- TV: http://localhost:5173?display=tv

## Production Deployment

### Option 1: Single Server Deployment

Deploy both backend and frontend on one server.

#### Prerequisites
- Ubuntu 20.04+ or similar
- Ruby 3.2.0+
- Node.js 18+
- Nginx
- systemd

#### Backend Setup

1. **Install Dependencies**
```bash
# On the server
cd /var/www/slot_machine
bundle install --deployment --without development test
```

2. **Configure Environment**
```bash
# Create .env file
cat > .env << EOF
RAILS_ENV=production
SECRET_KEY_BASE=$(rails secret)
DATABASE_URL=sqlite3:db/production.sqlite3
ALLOWED_ORIGINS=https://yourdomain.com
EOF
```

3. **Setup Database**
```bash
RAILS_ENV=production rails db:create db:migrate
```

4. **Create systemd Service**
```bash
# /etc/systemd/system/slot-machine.service
[Unit]
Description=Slot Machine Rails Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/slot_machine
Environment=RAILS_ENV=production
ExecStart=/usr/local/bin/bundle exec rails server -b 0.0.0.0 -p 3000
Restart=always

[Install]
WantedBy=multi-user.target
```

5. **Start Service**
```bash
sudo systemctl daemon-reload
sudo systemctl enable slot-machine
sudo systemctl start slot-machine
```

#### Frontend Build

1. **Build Static Files**
```bash
cd frontend
npm install
npm run build
```

2. **Configure Nginx**
```nginx
# /etc/nginx/sites-available/slot-machine
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend static files
    root /var/www/slot_machine/frontend/dist;
    index index.html;

    # Serve frontend
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to Rails
    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket proxy
    location /cable {
        proxy_pass http://localhost:3000/cable;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

3. **Enable and Restart Nginx**
```bash
sudo ln -s /etc/nginx/sites-available/slot-machine /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Option 2: Cloud Deployment (Heroku)

#### Backend Deployment

1. **Create Heroku App**
```bash
heroku create slot-machine-api
```

2. **Configure Environment**
```bash
heroku config:set RAILS_ENV=production
heroku config:set SECRET_KEY_BASE=$(rails secret)
```

3. **Deploy**
```bash
git push heroku main
heroku run rails db:migrate
```

#### Frontend Deployment (Netlify/Vercel)

1. **Build Configuration**
```toml
# netlify.toml
[build]
  command = "cd frontend && npm run build"
  publish = "frontend/dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. **Environment Variables**
```
VITE_API_URL=https://slot-machine-api.herokuapp.com
VITE_WS_URL=wss://slot-machine-api.herokuapp.com/cable
```

3. **Deploy**
```bash
# Connect to Git and Netlify will auto-deploy
# Or use Netlify CLI:
netlify deploy --prod
```

### Option 3: Docker Deployment

#### Backend Dockerfile

Already included in project root:
```dockerfile
# Dockerfile
FROM ruby:3.2.0
WORKDIR /app
COPY Gemfile* ./
RUN bundle install
COPY . .
EXPOSE 3000
CMD ["rails", "server", "-b", "0.0.0.0"]
```

#### Frontend Dockerfile

```dockerfile
# frontend/Dockerfile
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

#### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - RAILS_ENV=production
      - SECRET_KEY_BASE=${SECRET_KEY_BASE}
    volumes:
      - ./db:/app/db
      - ./storage:/app/storage

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    environment:
      - VITE_API_URL=http://backend:3000
      - VITE_WS_URL=ws://backend:3000/cable
```

**Deploy:**
```bash
docker-compose up -d
```

## Display Setup

### iPad Configuration

1. **Setup iPad Kiosk Mode**
   - Install Guided Access (Settings > Accessibility > Guided Access)
   - Open Safari to http://yourdomain.com
   - Triple-click home button to enable Guided Access
   - This locks the iPad to registration screen

2. **Auto-Reload on Network Loss**
   - Add service worker for offline detection
   - Auto-reload when connection restored

### TV Configuration

1. **Setup TV Browser**
   - Use Chrome/Firefox in full-screen mode
   - Navigate to http://yourdomain.com?display=tv
   - Press F11 for full screen
   - Disable screen saver

2. **Auto-Start on Boot**

**Linux:**
```bash
# ~/.config/autostart/slot-machine.desktop
[Desktop Entry]
Type=Application
Name=Slot Machine TV Display
Exec=chromium-browser --kiosk http://yourdomain.com?display=tv
```

**Raspberry Pi:**
```bash
# /etc/xdg/lxsession/LXDE-pi/autostart
@chromium-browser --kiosk --disable-session-crashed-bubble http://yourdomain.com?display=tv
```

## Monitoring

### Health Checks

**Backend:**
```bash
curl http://localhost:3000/api/game_state
```

**Frontend:**
```bash
curl http://localhost/
```

### Logs

**Rails:**
```bash
tail -f log/production.log
```

**Systemd:**
```bash
sudo journalctl -u slot-machine -f
```

**Nginx:**
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Process Monitoring

Use PM2 for Node.js processes:
```bash
npm install -g pm2
pm2 start "rails server" --name slot-machine
pm2 startup
pm2 save
```

## Security

### SSL/TLS

**Let's Encrypt:**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### CORS Configuration

Update `config/initializers/cors.rb`:
```ruby
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins ENV.fetch('ALLOWED_ORIGINS', 'http://localhost:5173').split(',')
    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true
  end
end
```

### Rate Limiting

Add to Nginx config:
```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

location /api {
    limit_req zone=api burst=20;
    # ... rest of config
}
```

## Backup

### Database Backup

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
cp db/production.sqlite3 backups/production_$DATE.sqlite3
# Upload to S3 or backup storage
```

**Cron Job:**
```bash
0 2 * * * /var/www/slot_machine/backup.sh
```

### Frontend Assets

Frontend is statically built, no backup needed. Rebuild from Git if needed.

## Troubleshooting

### Backend Not Responding

1. Check service status:
```bash
sudo systemctl status slot-machine
```

2. Check logs:
```bash
tail -100 log/production.log
```

3. Restart service:
```bash
sudo systemctl restart slot-machine
```

### WebSocket Connection Issues

1. Verify WebSocket endpoint:
```bash
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" \
  http://localhost:3000/cable
```

2. Check Nginx WebSocket config

3. Verify ActionCable allowed origins in `config/cable.yml`

### Frontend Not Loading

1. Check Nginx config:
```bash
sudo nginx -t
```

2. Verify static files exist:
```bash
ls -la frontend/dist/
```

3. Check browser console for errors

### Database Locked Errors

SQLite specific:
1. Increase timeout in `config/database.yml`:
```yaml
production:
  timeout: 5000  # milliseconds
```

2. Consider switching to PostgreSQL for production:
```bash
# Install PostgreSQL adapter
bundle add pg

# Update config/database.yml
production:
  adapter: postgresql
  database: slot_machine_production
  host: localhost
  username: slot_machine
  password: <%= ENV['DATABASE_PASSWORD'] %>
```

## Performance Optimization

### Backend

1. **Enable caching:**
```ruby
# config/environments/production.rb
config.cache_store = :memory_store
```

2. **Preload classes:**
```ruby
config.eager_load = true
```

### Frontend

1. **Enable gzip in Nginx:**
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

2. **Add caching headers:**
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## Rollback Procedure

### Backend Rollback

```bash
# Using systemd
sudo systemctl stop slot-machine
git checkout previous-commit-hash
bundle install
RAILS_ENV=production rails db:migrate
sudo systemctl start slot-machine
```

### Frontend Rollback

```bash
cd frontend
git checkout previous-commit-hash
npm install
npm run build
sudo systemctl restart nginx
```

## Scaling Considerations

For high traffic:

1. **Load Balancer**: Use Nginx or HAProxy to distribute traffic
2. **Multiple Backend Instances**: Run Rails on multiple servers
3. **Redis**: Switch ActionCable to Redis adapter for multi-server support
4. **CDN**: Serve frontend assets through CloudFlare or AWS CloudFront
5. **Database**: Migrate from SQLite to PostgreSQL with connection pooling

## Support

For deployment issues, check:
- [TESTING_RESULTS.md](TESTING_RESULTS.md) for manual testing
- [README.md](../README.md) for general documentation
- Project logs and error messages

---

Last Updated: 2025-11-05
