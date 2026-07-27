import request from 'supertest';
import express, { Express } from 'express';
import cors from 'cors';
import authRouter from '../../src/routes/auth.js';
import errorHandler from '../../src/middleware/errorHandler.js';
import { connectTestDB, disconnectTestDB, clearTestDB } from '../config/database.js';

describe('Auth API E2E Tests', () => {
  let app: Express;

  beforeAll(async () => {
    // Connect to test database
    await connectTestDB();

    // Create Express app for testing
    app = express();
    app.use(cors());
    app.use(express.json());
    app.use('/api/auth', authRouter);
    app.use(errorHandler);
  });

  afterAll(async () => {
    // Disconnect from test database
    await disconnectTestDB();
  });

  beforeEach(async () => {
    // Clear database before each test
    await clearTestDB();
  });

  describe('POST /api/auth/signup', () => {
    it('should successfully create a new user with valid credentials', async () => {
      const newUser = {
        name: 'John Doe',
        email: 'john@example.com',
        number: '9876543210',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(newUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe(newUser.email);
      expect(response.body.data.user.number).toBe(newUser.number);
      expect(response.body.data.user.name).toBe(newUser.name);
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should return 400 error for missing required fields', async () => {
      const invalidUser = {
        name: 'John Doe',
        email: 'john@example.com',
        // missing number and password
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(invalidUser)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toBeDefined();
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it('should return 400 error for invalid email format', async () => {
      const invalidUser = {
        name: 'John Doe',
        email: 'invalid-email',
        number: '9876543210',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(invalidUser)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContainEqual(expect.stringContaining('valid email'));
    });

    it('should return 400 error for invalid phone number (not 10 digits)', async () => {
      const invalidUser = {
        name: 'John Doe',
        email: 'john@example.com',
        number: '12345', // only 5 digits
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(invalidUser)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContainEqual(expect.stringContaining('10 digits'));
    });

    it('should return 400 error for short password (less than 6 characters)', async () => {
      const invalidUser = {
        name: 'John Doe',
        email: 'john@example.com',
        number: '9876543210',
        password: 'pass', // less than 6 characters
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(invalidUser)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContainEqual(expect.stringContaining('6 characters'));
    });

    it('should return 400 error for short name (less than 2 characters)', async () => {
      const invalidUser = {
        name: 'J', // only 1 character
        email: 'john@example.com',
        number: '9876543210',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(invalidUser)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContainEqual(expect.stringContaining('at least 2 characters'));
    });

    it('should return 409 error when email is already registered', async () => {
      const user = {
        name: 'John Doe',
        email: 'john@example.com',
        number: '9876543210',
        password: 'password123',
      };

      // First signup
      await request(app)
        .post('/api/auth/signup')
        .send(user)
        .expect(201);

      // Try to signup again with same email
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          ...user,
          number: '9999999999', // different number
          name: 'Jane Doe', // different name
        })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Email already registered');
    });

    it('should return 409 error when phone number is already registered', async () => {
      const user = {
        name: 'John Doe',
        email: 'john@example.com',
        number: '9876543210',
        password: 'password123',
      };

      // First signup
      await request(app)
        .post('/api/auth/signup')
        .send(user)
        .expect(201);

      // Try to signup again with same number
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          ...user,
          email: 'jane@example.com', // different email
          name: 'Jane Doe', // different name
        })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Phone number already registered');
    });

    it('should return valid JWT token with 5-year expiry', async () => {
      const newUser = {
        name: 'John Doe',
        email: 'john@example.com',
        number: '9876543210',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(newUser)
        .expect(201);

      const token = response.body.data.token;
      expect(token).toBeDefined();

      // Decode JWT to verify expiry
      const parts = token.split('.');
      expect(parts.length).toBe(3); // JWT should have 3 parts

      // Decode payload (without verification, just for testing)
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      expect(payload).toHaveProperty('userId');
      expect(payload).toHaveProperty('email');
      expect(payload).toHaveProperty('iat');
      expect(payload).toHaveProperty('exp');

      // Verify expiry is approximately 5 years (allow 1 minute variance)
      const expiryTime = (payload.exp - payload.iat) * 1000; // convert to milliseconds
      const fiveYearsMs = 5 * 365 * 24 * 60 * 60 * 1000;
      expect(Math.abs(expiryTime - fiveYearsMs)).toBeLessThan(60000); // within 1 minute
    });
  });

  describe('POST /api/auth/login', () => {
    const validUser = {
      name: 'John Doe',
      email: 'john@example.com',
      number: '9876543210',
      password: 'password123',
    };

    beforeEach(async () => {
      // Create a user before each login test
      await request(app)
        .post('/api/auth/signup')
        .send(validUser);
    });

    it('should successfully login with email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          identifier: validUser.email,
          password: validUser.password,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe(validUser.email);
    });

    it('should successfully login with phone number', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          identifier: validUser.number,
          password: validUser.password,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.number).toBe(validUser.number);
    });

    it('should return 400 error for missing identifier', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: validUser.password,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toBeDefined();
    });

    it('should return 400 error for missing password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          identifier: validUser.email,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toBeDefined();
    });

    it('should return 401 error for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          identifier: 'nonexistent@example.com',
          password: validUser.password,
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email/number or password');
    });

    it('should return 401 error for invalid phone number', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          identifier: '1234567890',
          password: validUser.password,
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email/number or password');
    });

    it('should return 401 error for wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          identifier: validUser.email,
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email/number or password');
    });

    it('should return valid JWT token on successful login', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          identifier: validUser.email,
          password: validUser.password,
        })
        .expect(200);

      const token = response.body.data.token;
      expect(token).toBeDefined();

      // Decode JWT to verify structure
      const parts = token.split('.');
      expect(parts.length).toBe(3);

      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      expect(payload).toHaveProperty('userId');
      expect(payload).toHaveProperty('email');
      expect(payload.email).toBe(validUser.email);
    });

    it('should return complete user object (without password)', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          identifier: validUser.email,
          password: validUser.password,
        })
        .expect(200);

      const user = response.body.data.user;
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('number');
      expect(user).not.toHaveProperty('password');
      expect(user.name).toBe(validUser.name);
      expect(user.email).toBe(validUser.email);
      expect(user.number).toBe(validUser.number);
    });
  });

  describe('Integration Tests', () => {
    it('should allow signup and login flow', async () => {
      const newUser = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        number: '8765432109',
        password: 'securepass456',
      };

      // Step 1: Signup
      const signupResponse = await request(app)
        .post('/api/auth/signup')
        .send(newUser)
        .expect(201);

      expect(signupResponse.body.success).toBe(true);
      const signupToken = signupResponse.body.data.token;

      // Step 2: Login with email
      const loginResponse1 = await request(app)
        .post('/api/auth/login')
        .send({
          identifier: newUser.email,
          password: newUser.password,
        })
        .expect(200);

      expect(loginResponse1.body.success).toBe(true);
      expect(loginResponse1.body.data.token).toBeDefined();

      // Step 3: Login with phone number
      const loginResponse2 = await request(app)
        .post('/api/auth/login')
        .send({
          identifier: newUser.number,
          password: newUser.password,
        })
        .expect(200);

      expect(loginResponse2.body.success).toBe(true);
      expect(loginResponse2.body.data.token).toBeDefined();
    });

    it('should handle multiple users without cross-contamination', async () => {
      const user1 = {
        name: 'User One',
        email: 'user1@example.com',
        number: '1111111111',
        password: 'password1',
      };

      const user2 = {
        name: 'User Two',
        email: 'user2@example.com',
        number: '2222222222',
        password: 'password2',
      };

      // Create user1
      const signup1 = await request(app)
        .post('/api/auth/signup')
        .send(user1)
        .expect(201);

      // Create user2
      const signup2 = await request(app)
        .post('/api/auth/signup')
        .send(user2)
        .expect(201);

      // User1 should not be able to login with user2's password
      const wrongLogin = await request(app)
        .post('/api/auth/login')
        .send({
          identifier: user1.email,
          password: user2.password,
        })
        .expect(401);

      expect(wrongLogin.body.success).toBe(false);

      // User1 should login with correct password
      const correctLogin = await request(app)
        .post('/api/auth/login')
        .send({
          identifier: user1.email,
          password: user1.password,
        })
        .expect(200);

      expect(correctLogin.body.success).toBe(true);
      expect(correctLogin.body.data.user.name).toBe(user1.name);
    });
  });
});
