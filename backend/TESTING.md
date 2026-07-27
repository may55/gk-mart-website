# Testing Guide

## Overview

The backend includes comprehensive end-to-end (E2E) tests for the authentication API endpoints (signup and login). Tests use **Jest** as the test framework, **Supertest** for HTTP testing, and **MongoDB Memory Server** for in-memory MongoDB testing.

## Test Architecture

### Test Stack

- **Jest** — Test framework and test runner
- **Supertest** — HTTP assertion library for testing Express routes
- **MongoDB Memory Server** — In-memory MongoDB for isolated testing
- **ts-jest** — TypeScript support for Jest
- **Mongoose** — ODM for database operations

### Benefits

1. **Isolated Testing** — Each test runs against a fresh in-memory MongoDB instance
2. **No External Dependencies** — No need for MongoDB to be running
3. **Fast Execution** — In-memory database is much faster than network calls
4. **Parallel Execution** — Tests can run in parallel without conflicts
5. **Clean State** — Database is cleared before each test

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
Watch mode automatically reruns tests when files change:
```bash
npm run test:watch
```

### Run Tests with Coverage
Generate code coverage report:
```bash
npm run test:coverage
```

This creates a `coverage/` directory with detailed coverage statistics.

## Test Structure

Tests are located in `tests/e2e/` directory and follow the pattern: `*.test.ts`

### Current Test Suite: `tests/e2e/auth.test.ts`

**Total Tests:** 20

**Test Categories:**

1. **POST /api/auth/signup** (9 tests)
   - ✓ Valid user creation
   - ✓ Missing fields validation
   - ✓ Invalid email format
   - ✓ Invalid phone number (not 10 digits)
   - ✓ Short password validation
   - ✓ Short name validation
   - ✓ Duplicate email prevention
   - ✓ Duplicate phone number prevention
   - ✓ JWT token generation with 5-year expiry

2. **POST /api/auth/login** (9 tests)
   - ✓ Login with email
   - ✓ Login with phone number
   - ✓ Missing identifier error
   - ✓ Missing password error
   - ✓ Invalid email error
   - ✓ Invalid phone number error
   - ✓ Wrong password error
   - ✓ Valid JWT token on login
   - ✓ Complete user object response

3. **Integration Tests** (2 tests)
   - ✓ Signup and login flow
   - ✓ Multiple users without cross-contamination

## Test Configuration

### Test Database Setup

File: `tests/config/database.ts`

Provides three main functions:

```typescript
// Connect to in-memory MongoDB
connectTestDB(): Promise<void>

// Disconnect from in-memory MongoDB
disconnectTestDB(): Promise<void>

// Clear all collections
clearTestDB(): Promise<void>
```

**Setup Flow:**
1. `beforeAll()` — Creates in-memory MongoDB server and connects
2. `beforeEach()` — Clears database before each test
3. `afterAll()` — Disconnects from MongoDB server

This ensures:
- Each test starts with a clean state
- Tests don't interfere with each other
- No actual MongoDB instance needed

### Jest Configuration

File: `jest.config.js`

Key settings:
- **testEnvironment:** `node` (not browser)
- **testTimeout:** 30000ms (for slower CI environments)
- **testMatch:** Finds `*.test.ts` and `*.spec.ts` files
- **transform:** Uses ts-jest for TypeScript support
- **moduleNameMapper:** Handles ES module imports

## Writing New Tests

### Test Template

```typescript
import request from 'supertest';
import express, { Express } from 'express';
import { connectTestDB, disconnectTestDB, clearTestDB } from '../config/database.js';

describe('Feature Name', () => {
  let app: Express;

  beforeAll(async () => {
    await connectTestDB();
    // Setup Express app
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  it('should test specific behavior', async () => {
    const response = await request(app)
      .post('/api/endpoint')
      .send({ data: 'value' })
      .expect(200);

    expect(response.body).toHaveProperty('success');
  });
});
```

### Common Assertions

```typescript
// Status codes
.expect(200)     // OK
.expect(201)     // Created
.expect(400)     // Bad Request
.expect(401)     // Unauthorized
.expect(409)     // Conflict

// Response structure
expect(response.body.success).toBe(true);
expect(response.body.message).toBe('Success message');
expect(response.body.data).toHaveProperty('user');
expect(response.body.errors).toBeDefined();

// Arrays and objects
expect(array).toContainEqual(expect.stringContaining('text'));
expect(object).not.toHaveProperty('password');

// JWT token validation
const token = response.body.data.token;
const parts = token.split('.');
const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
expect(payload.userId).toBeDefined();
```

## Test Coverage

### Current Coverage

Run `npm run test:coverage` to generate detailed coverage report.

**Endpoints Covered:**
- ✓ POST /api/auth/signup
- ✓ POST /api/auth/login

**Scenarios Covered:**
- ✓ Valid requests (happy path)
- ✓ Invalid input (validation)
- ✓ Duplicate data (uniqueness constraints)
- ✓ Authentication errors (wrong credentials)
- ✓ Token generation and structure
- ✓ User data isolation (multiple users)

**Layers Tested:**
- ✓ Routes (HTTP endpoints)
- ✓ Controllers (request handling)
- ✓ Validators (input validation)
- ✓ Services (business logic)
- ✓ Repositories (database operations)
- ✓ Models (schema validation)

## Adding More Tests

### Example: Testing Protected Routes

```typescript
describe('Protected Route', () => {
  it('should return 401 without token', async () => {
    const response = await request(app)
      .get('/api/protected')
      .expect(401);

    expect(response.body.success).toBe(false);
  });

  it('should return 401 with invalid token', async () => {
    const response = await request(app)
      .get('/api/protected')
      .set('Authorization', 'Bearer invalid_token')
      .expect(401);
  });

  it('should allow request with valid token', async () => {
    // First, signup and get token
    const signupRes = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'User', email: 'u@ex.com', number: '1234567890', password: 'pass' });

    const token = signupRes.body.data.token;

    // Use token in protected route
    const response = await request(app)
      .get('/api/protected')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});
```

## Troubleshooting

### Issue: Tests timeout
**Solution:** Increase `testTimeout` in `jest.config.js`
```javascript
testTimeout: 60000, // 60 seconds
```

### Issue: MongoDB Memory Server fails to download binary
**Solution:** Set environment variable before running tests
```bash
MONGODB_MEMORY_SERVER_DOWNLOAD_DIR=./downloads npm test
```

### Issue: Port already in use
**Solution:** Tests use in-memory MongoDB, but if port 27017 is in use, MongoDB Memory Server may conflict
```bash
# Kill MongoDB
brew services stop mongodb-community
npm test
```

### Issue: Tests pass locally but fail in CI
**Solution:** CI environments need more time. Add to `jest.config.js`:
```javascript
testTimeout: 30000,
// and in package.json
"test": "jest --forceExit --detectOpenHandles"
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v2
```

## Best Practices

1. **One assertion per test** — Each test should validate one behavior
2. **Descriptive test names** — Use clear, specific names like "should return 409 when email exists"
3. **Setup and teardown** — Use `beforeEach()` and `afterEach()` for test isolation
4. **Test data factories** — Create reusable test data:
   ```typescript
   const createTestUser = () => ({
     name: 'Test User',
     email: 'test@example.com',
     number: '1234567890',
     password: 'password123',
   });
   ```
5. **Clean assertions** — Use expect() rather than complex conditions
6. **Test edge cases** — Boundary values, empty strings, null, undefined
7. **Test error messages** — Verify users get helpful error messages

## Next Steps

To add more test coverage:

1. **Database tests** — Create `tests/unit/repositories/` for repository layer tests
2. **Service tests** — Create `tests/unit/services/` for business logic tests
3. **Middleware tests** — Create `tests/unit/middleware/` for auth and error handling
4. **Integration tests** — Create `tests/integration/` for multi-layer scenarios
5. **Performance tests** — Create `tests/performance/` for load testing

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)
- [Testing Best Practices](https://testingjavascript.com/)
