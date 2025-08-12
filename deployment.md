# BugMyShow - Deployment Guide

⚠️ **CRITICAL WARNING**: This application contains intentional security vulnerabilities and should NEVER be deployed in production or on public servers. Use only in isolated, controlled environments for security research and education.

## Overview

BugMyShow is a deliberately vulnerable web application designed for security testing and educational purposes. This guide covers deployment options for controlled environments only.

## Prerequisites

- Node.js 18+ and npm
- Supabase account (for database)
- Isolated network environment
- Security testing authorization

## Environment Setup

### 1. Database Configuration (Supabase)

1. Create a new Supabase project at https://supabase.com
2. Navigate to Project Settings > API
3. Copy your Project URL and anon public key
4. Create a `.env` file in the root directory:

```env
SUPABASE_URL="https://your-project-id.supabase.co"
SUPABASE_ANON_KEY="your-anon-key-here"
```

### 2. Database Schema Setup

The application will automatically create the required tables on first run:
- `users` - User accounts and authentication
- `movies` - Movie catalog
- `bookings` - Ticket bookings
- `ticket_numbers` - Sequential ticket numbering

## Deployment Options

### Option 1: Local Development (Recommended for Testing)

```bash
# Clone the repository
git clone <repository-url>
cd bugmyshow

# Install dependencies
npm install
cd server && npm install && cd ..

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start the application
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5001

### Option 2: Docker Deployment (Isolated Environment)

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install dependencies
RUN npm install
RUN cd server && npm install

# Copy application code
COPY . .

# Build frontend
RUN npm run build

# Expose ports
EXPOSE 5001 5173

# Start command
CMD ["npm", "run", "dev"]
```

Build and run:

```bash
docker build -t bugmyshow .
docker run -p 5001:5001 -p 5173:5173 --env-file .env bugmyshow
```

### Option 3: VM/Isolated Server Deployment

For security research labs or controlled environments:

```bash
# On the target server
git clone <repository-url>
cd bugmyshow

# Install Node.js and dependencies
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install application dependencies
npm install
cd server && npm install && cd ..

# Configure environment
cp .env.example .env
nano .env  # Add your Supabase credentials

# Start with PM2 for process management
npm install -g pm2
pm2 start npm --name "bugmyshow-server" -- run server
pm2 start npm --name "bugmyshow-client" -- run client

# Configure firewall (restrict access)
sudo ufw allow from 192.168.1.0/24 to any port 5173
sudo ufw allow from 192.168.1.0/24 to any port 5001
```

## Network Security Configuration

### Firewall Rules (iptables example)

```bash
# Allow only local network access
iptables -A INPUT -s 192.168.1.0/24 -p tcp --dport 5173 -j ACCEPT
iptables -A INPUT -s 192.168.1.0/24 -p tcp --dport 5001 -j ACCEPT
iptables -A INPUT -p tcp --dport 5173 -j DROP
iptables -A INPUT -p tcp --dport 5001 -j DROP
```

### Nginx Reverse Proxy (Optional)

```nginx
server {
    listen 80;
    server_name bugmyshow.local;
    
    # Restrict access to internal network only
    allow 192.168.1.0/24;
    deny all;
    
    location / {
        proxy_pass http://localhost:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api {
        proxy_pass http://localhost:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Default Credentials

The application creates default accounts for testing:

### Admin Account
- **Username**: `admin`
- **Password**: `admin123`
- **Access**: Full admin panel access

### Test User Account
- **Username**: `test`
- **Password**: `password123`
- **Access**: Regular user features

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login (vulnerable to NoSQL injection)
- `POST /api/auth/register` - User registration (weak password policy)

### Movies
- `GET /api/movies` - List all movies
- `GET /api/movies/:id` - Get movie details
- `POST /api/movies/:id/review` - Add review (vulnerable to stored XSS)

### Bookings
- `POST /api/bookings` - Create booking (price manipulation vulnerability)
- `GET /api/bookings/:id` - Get booking (IDOR vulnerability)
- `GET /api/bookings/user/:userId` - User bookings

### Admin Panel
- `POST /api/admin/login` - Admin login (hardcoded credentials)
- `GET /api/admin/movies` - Manage movies
- `POST /api/admin/movies` - Add movie
- `PUT /api/admin/movies/:id` - Update movie
- `DELETE /api/admin/movies/:id` - Delete movie

### Tickets
- `GET /api/tickets/generate/:bookingId` - Generate ticket (SSTI vulnerability)
- `GET /api/tickets/by-number/:ticketNumber` - Access ticket by number (IDOR)

### Debug (Intentionally Exposed)
- `GET /api/debug` - System information disclosure

## Vulnerability Testing Checklist

### Authentication Vulnerabilities
- [ ] NoSQL injection in login endpoint
- [ ] JWT token forgery (no signature verification)
- [ ] Weak password policy
- [ ] Insecure session cookies

### Input Validation
- [ ] Reflected XSS in search functionality
- [ ] Stored XSS in movie reviews
- [ ] Server-Side Template Injection in ticket generation
- [ ] Unrestricted file upload

### Access Control
- [ ] IDOR in booking access
- [ ] IDOR in ticket access by number
- [ ] Broken access control in user profiles
- [ ] Privilege escalation via hardcoded credentials

### Business Logic
- [ ] Price manipulation in booking
- [ ] Race condition in seat reservation

### Information Disclosure
- [ ] Debug endpoint exposure
- [ ] Verbose error messages
- [ ] Sensitive data exposure in API responses

## Security Testing Tools

### Recommended Tools for Testing
- **Burp Suite** - Web application security testing
- **OWASP ZAP** - Automated security scanning
- **SQLMap** - SQL injection testing
- **XSSHunter** - XSS payload testing
- **Postman** - API endpoint testing

### Sample Testing Commands

```bash
# NoSQL injection test
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": {"$ne": null}, "password": {"$ne": null}}'

# XSS test in search
curl "http://localhost:5173/movies?search=%22%3E%3Cimg%20src%3Dx%20onerror%3Dalert%281%29%3E"

# IDOR test
curl http://localhost:5001/api/bookings/1
curl http://localhost:5001/api/bookings/2

# Price manipulation test
curl -X POST http://localhost:5001/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"movieId": "1", "seats": 2, "totalPrice": 0.01, "showTime": "19:00"}'
```

## Monitoring and Logging

### Application Logs
- Server logs: `server/logs/`
- Access logs: Monitor API endpoint usage
- Error logs: Track vulnerability exploitation attempts

### Security Monitoring
```bash
# Monitor failed login attempts
tail -f server/logs/auth.log | grep "Invalid credentials"

# Monitor XSS attempts
tail -f server/logs/access.log | grep -E "<script|javascript:|onerror="

# Monitor IDOR attempts
tail -f server/logs/access.log | grep -E "/bookings/[0-9]+|/tickets/by-number/"
```

## Cleanup and Decommissioning

### After Testing
1. **Stop all services**:
   ```bash
   pm2 stop all
   pm2 delete all
   ```

2. **Remove database data**:
   - Delete Supabase project or clear all tables
   - Remove local database files

3. **Clean up files**:
   ```bash
   rm -rf uploads/
   rm .env
   ```

4. **Network cleanup**:
   ```bash
   sudo ufw delete allow 5173
   sudo ufw delete allow 5001
   ```

## Legal and Ethical Considerations

### ⚠️ IMPORTANT DISCLAIMERS

1. **Authorization Required**: Only test on systems you own or have explicit written permission to test
2. **Isolated Environment**: Never deploy on public networks or production systems
3. **Educational Purpose**: This application is for learning and authorized security testing only
4. **Compliance**: Ensure testing complies with local laws and organizational policies
5. **Data Protection**: Do not use real user data or sensitive information

### Responsible Disclosure
If you discover additional vulnerabilities not documented:
1. Document the vulnerability thoroughly
2. Report through appropriate channels
3. Do not exploit in unauthorized environments
4. Follow responsible disclosure practices

## Support and Documentation

### Additional Resources
- `vulnerabilities.md` - Detailed vulnerability documentation
- `README.md` - Application overview and features
- Server logs - Located in `server/logs/`
- API documentation - Available at `/api/debug` endpoint

### Troubleshooting

**Database Connection Issues**:
```bash
# Check Supabase connection
curl -H "apikey: YOUR_ANON_KEY" \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     "https://your-project.supabase.co/rest/v1/users?select=*"
```

**Port Conflicts**:
```bash
# Check what's using the ports
lsof -i :5173
lsof -i :5001

# Kill processes if needed
kill -9 $(lsof -t -i:5173)
kill -9 $(lsof -t -i:5001)
```

**Permission Issues**:
```bash
# Fix file permissions
chmod +x server/server.js
chown -R $USER:$USER .
```

---

**Final Warning**: This application contains serious security vulnerabilities by design. Never use in production environments or expose to untrusted networks. Always follow responsible disclosure practices and obtain proper authorization before security testing.