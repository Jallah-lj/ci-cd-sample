const request = require('supertest');
const app = require('../index');
const store = require('../src/db/store');

describe('AuthVault Microservice API Tests', () => {
  beforeEach(() => {
    store.clear();
  });

  describe('GET /health', () => {
    it('should return 200 OK and health status', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('UP');
      expect(res.body.service).toBe('AuthVault Microservice');
    });
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'Password123!',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user.email).toBe('jane@example.com');
      expect(res.body.tokens).toHaveProperty('accessToken');
      expect(res.body.tokens).toHaveProperty('refreshToken');
    });

    it('should fail registration if email already exists', async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'Password123!',
        });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Jane Clone',
          email: 'jane@example.com',
          password: 'Password123!',
        });

      expect(res.statusCode).toBe(409);
      expect(res.body.error).toBe('Conflict');
    });

    it('should return 400 for missing fields', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'incomplete@example.com',
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'John Smith',
          email: 'john@example.com',
          password: 'SecurePassword123!',
        });
    });

    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'john@example.com',
          password: 'SecurePassword123!',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.tokens).toHaveProperty('accessToken');
      expect(res.body.tokens).toHaveProperty('refreshToken');
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'john@example.com',
          password: 'WrongPassword!',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('Unauthorized');
    });
  });

  describe('Protected Routes & RBAC', () => {
    let userToken;
    let adminToken;

    beforeEach(async () => {
      const userRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Standard User',
          email: 'user@example.com',
          password: 'Password123!',
          role: 'user',
        });
      userToken = userRes.body.tokens.accessToken;

      const adminRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Admin User',
          email: 'admin@example.com',
          password: 'Password123!',
          role: 'admin',
        });
      adminToken = adminRes.body.tokens.accessToken;
    });

    it('should allow authenticated user to access /me', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.user.email).toBe('user@example.com');
    });

    it('should reject /me without access token', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.statusCode).toBe(401);
    });

    it('should allow admin user to access /admin', async () => {
      const res = await request(app)
        .get('/api/v1/auth/admin')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toContain('Admin Vault');
    });

    it('should deny non-admin user access to /admin', async () => {
      const res = await request(app)
        .get('/api/v1/auth/admin')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
    });
  });

  describe('POST /api/v1/auth/refresh & /logout', () => {
    let refreshToken;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Refresh Tester',
          email: 'refresh@example.com',
          password: 'Password123!',
        });
      refreshToken = res.body.tokens.refreshToken;
    });

    it('should rotate refresh token and issue new token pair', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken });

      expect(res.statusCode).toBe(200);
      expect(res.body.tokens).toHaveProperty('accessToken');
      expect(res.body.tokens).toHaveProperty('refreshToken');
      expect(res.body.tokens.refreshToken).not.toBe(refreshToken);
    });

    it('should revoke refresh token on logout', async () => {
      await request(app)
        .post('/api/v1/auth/logout')
        .send({ refreshToken });

      const refreshRes = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken });

      expect(refreshRes.statusCode).toBe(403);
    });
  });
});
