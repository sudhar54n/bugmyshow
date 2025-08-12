# BugMyShow - Vulnerable Movie Booking Application

A deliberately vulnerable web application designed for security testing and educational purposes.

## ⚠️ WARNING
This application contains intentional security vulnerabilities and should NEVER be deployed in production or on public servers. Use only in isolated, controlled environments for security research and education.

## Features
- Movie ticket booking system
- User registration and authentication
- Profile management with file upload
- Admin panel for movie management
- MongoDB integration
- Dark hacker-themed UI

## Vulnerabilities Included

### Authentication
- SQL/NoSQL Injection in login
- Weak password policy
- Insecure session cookies
- JWT forgery (no signature verification)

### File Upload
- Unrestricted file upload
- Path traversal in filenames

### XSS
- Reflected XSS in search
- Stored XSS in reviews

### Access Control
- IDOR in booking access
- Broken access control
- Privilege escalation

### Business Logic
- Price manipulation
- Race conditions

### Information Disclosure
- Debug endpoints
- Verbose error messages
- Exposed backup files

## Setup Instructions

1. Install MongoDB locally
2. Install dependencies: `npm install`
3. Start the application: `npm run dev`
4. Access at: http://localhost:5173

## Default Credentials
- Admin: admin / admin123
- Test User: test / password123

## API Endpoints
- Authentication: `/api/auth/login`, `/api/auth/register`
- Movies: `/api/movies`, `/api/movies/search`
- Bookings: `/api/bookings`
- Admin: `/api/admin`
- Debug: `/api/debug` (exposed)
- File Download: `/api/tickets/download` (path traversal)

## Educational Use
This application demonstrates common web vulnerabilities for:
- Security training
- Penetration testing practice
- Vulnerability assessment learning
- Secure coding education

## Disclaimer
Created for educational purposes only. The authors are not responsible for any misuse of this vulnerable application.