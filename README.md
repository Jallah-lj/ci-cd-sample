# 🛡️ AuthVault Microservice

Enterprise-grade **Authentication & Authorization Microservice** built with Node.js, Express, JWT Token Rotation, Role-Based Access Control (RBAC), OAuth2 (Google & GitHub), Nodemailer, OpenAPI Swagger Docs, and Docker.

---

## 🌟 Key Features

* **JWT Dual-Token System:** Short-lived Access Tokens (15m) + Long-lived Refresh Tokens (7d) with automatic Token Rotation.
* **Role-Based Access Control (RBAC):** Built-in middleware protecting routes based on roles (`user`, `admin`).
* **OAuth2 Social Sign-In:** One-click integration with Google Accounts and GitHub logins via Passport.js.
* **Password Security:** Bcrypt hashing, password reset tokens with HTML email templates (Nodemailer), and secure password update endpoints.
* **Threat Defense:** Brute-force rate limiting (`express-rate-limit`), security headers (`helmet`), and CORS domain whitelisting.
* **Interactive API Documentation:** Full OpenAPI 3.0 Swagger UI hosted at `/api-docs`.
* **CI/CD Pipeline:** Fully automated GitHub Actions workflow executing unit tests, Trivy vulnerability scanning, CodeQL SAST security analysis, and deployment checks.
* **Production Docker Container:** Multi-stage `Dockerfile` (Alpine-based) for instant containerized deployment.

---

## 🚀 Quick Start & Installation

### Prerequisites
* Node.js v20+ or v22+
* npm v10+
* Docker (optional)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Jallah-lj/ci-cd-sample.git
cd ci-cd-sample
npm install
