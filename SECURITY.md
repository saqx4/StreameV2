# Security Policy

## Security Improvements Implemented

### 1. **API Security**
- ✅ API key validation before requests
- ✅ Request timeout protection (10 seconds)
- ✅ Input sanitization for all user inputs
- ✅ URL parameter validation

### 2. **HTTP Security Headers**
- ✅ Content Security Policy (CSP)
- ✅ X-Frame-Options: DENY (prevents clickjacking)
- ✅ X-Content-Type-Options: nosniff
- ✅ X-XSS-Protection: enabled
- ✅ Referrer-Policy: strict-origin-when-cross-origin
- ✅ Permissions-Policy: restricts camera, microphone, geolocation

### 3. **Authentication & Database**
- ✅ Supabase secure authentication
- ✅ Row-level security policies
- ✅ Secure session management
- ✅ Password strength validation
- ✅ Email validation

### 4. **Input Validation**
- ✅ XSS prevention through input sanitization
- ✅ SQL injection protection (Supabase parameterized queries)
- ✅ URL sanitization to prevent javascript: and data: URI attacks
- ✅ Rate limiting for API requests

### 5. **Data Protection**
- ✅ Environment variables for sensitive data
- ✅ No hardcoded credentials
- ✅ Secure token generation
- ✅ HTTPS-only connections

## Security Best Practices

### For Developers

1. **Never commit `.env` files** - They contain sensitive API keys
2. **Always sanitize user input** - Use `sanitizeInput()` from `utils/security`
3. **Validate all external data** - Don't trust any user input
4. **Use parameterized queries** - Supabase handles this automatically
5. **Keep dependencies updated** - Run `npm audit` regularly

### For Users

1. **Use strong passwords** - Minimum 8 characters with uppercase, lowercase, and numbers
2. **Enable two-factor authentication** - When available in Supabase
3. **Don't share your account** - Keep credentials private
4. **Report security issues** - See reporting section below

## Reporting Security Vulnerabilities

If you discover a security vulnerability, please email:
**security@streame.app**

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

**Do not** create public GitHub issues for security vulnerabilities.

## Security Checklist

- [x] API keys stored in environment variables
- [x] Input sanitization implemented
- [x] Security headers configured
- [x] Authentication with Supabase
- [x] Rate limiting for API calls
- [x] XSS protection
- [x] CSRF protection via Supabase
- [x] SQL injection protection
- [x] Secure password requirements
- [x] HTTPS enforcement

## Dependencies Security

Run regular security audits:
```bash
npm audit
npm audit fix
```

## License

This security policy is part of the Streame project.
SPDX-License-Identifier: MIT
Copyright (c) 2025 SnoozeScript
