import request from 'supertest';
import app from '../src/server.js';
import { User } from '../src/models/index.js';
import sequelize from '../src/config/database.js';

describe('Authentication Tests', () => {
  beforeAll(async () => {
    // Initialize database
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'Password123!',
          role: 'cliente',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe('john@example.com');
    });

    it('should not register duplicate email', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          password: 'Password123!',
        });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          password: 'Password123!',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('already registered');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'John',
          // Missing other required fields
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      const user = await User.create({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'Password123!',
        emailVerified: true,
        role: 'cliente',
      });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should not login with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword123!',
        });

      expect(response.status).toBe(401);
    });

    it('should not login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Logout successful');
    });
  });
});
