/**
 * Test utilities and helper functions
 */

/**
 * Decode JWT token payload (for testing purposes only)
 * @param token - JWT token string
 * @returns Decoded payload object
 */
export const decodeJWT = (token: string): any => {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT token format');
  }

  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    return payload;
  } catch (error) {
    throw new Error('Failed to decode JWT payload');
  }
};

/**
 * Extract expiry duration from JWT token
 * @param token - JWT token string
 * @returns Duration in milliseconds
 */
export const getJWTExpiryDuration = (token: string): number => {
  const payload = decodeJWT(token);
  if (!payload.iat || !payload.exp) {
    throw new Error('Token missing iat or exp claim');
  }

  return (payload.exp - payload.iat) * 1000; // convert to milliseconds
};

/**
 * Check if JWT token is approximately valid for duration
 * @param token - JWT token string
 * @param expectedDurationMs - Expected duration in milliseconds
 * @param toleranceMs - Tolerance in milliseconds (default: 60000 = 1 minute)
 * @returns true if token duration matches expected
 */
export const isValidJWTDuration = (
  token: string,
  expectedDurationMs: number,
  toleranceMs: number = 60000
): boolean => {
  try {
    const actualDuration = getJWTExpiryDuration(token);
    const difference = Math.abs(actualDuration - expectedDurationMs);
    return difference <= toleranceMs;
  } catch {
    return false;
  }
};

/**
 * Test data factory for creating valid user data
 */
export const testUserFactory = {
  /**
   * Create valid user data
   * @param overrides - Partial user data to override defaults
   * @returns Valid user object
   */
  create(overrides: Partial<any> = {}) {
    return {
      name: 'Test User',
      email: 'test@example.com',
      number: '9876543210',
      password: 'password123',
      ...overrides,
    };
  },

  /**
   * Create multiple users with unique data
   * @param count - Number of users to create
   * @returns Array of user objects
   */
  createMany(count: number) {
    return Array.from({ length: count }, (_, i) => ({
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      number: `${1000000000 + i}`,
      password: `password${i + 1}`,
    }));
  },

  /**
   * Create invalid user data for validation testing
   */
  createInvalid() {
    return {
      missingName: {
        email: 'test@example.com',
        number: '9876543210',
        password: 'password123',
      },
      invalidEmail: {
        name: 'Test User',
        email: 'invalid-email',
        number: '9876543210',
        password: 'password123',
      },
      shortNumber: {
        name: 'Test User',
        email: 'test@example.com',
        number: '123',
        password: 'password123',
      },
      shortPassword: {
        name: 'Test User',
        email: 'test@example.com',
        number: '9876543210',
        password: 'pass',
      },
      shortName: {
        name: 'A',
        email: 'test@example.com',
        number: '9876543210',
        password: 'password123',
      },
    };
  },
};

/**
 * Response assertion helpers
 */
export const assertSuccessResponse = (response: any, expectedMessage?: string) => {
  expect(response.body.success).toBe(true);
  if (expectedMessage) {
    expect(response.body.message).toBe(expectedMessage);
  }
  expect(response.body.data).toBeDefined();
};

export const assertErrorResponse = (response: any, expectedMessage?: string) => {
  expect(response.body.success).toBe(false);
  if (expectedMessage) {
    expect(response.body.message).toBe(expectedMessage);
  }
};

export const assertValidationError = (response: any) => {
  expect(response.body.success).toBe(false);
  expect(response.body.message).toBe('Validation failed');
  expect(response.body.errors).toBeDefined();
  expect(Array.isArray(response.body.errors)).toBe(true);
};

export const assertUserData = (user: any, expected: any) => {
  expect(user).toHaveProperty('id');
  expect(user).toHaveProperty('name', expected.name);
  expect(user).toHaveProperty('email', expected.email);
  expect(user).toHaveProperty('number', expected.number);
  expect(user).not.toHaveProperty('password');
};

export const assertAuthResponse = (response: any) => {
  expect(response.body.data).toHaveProperty('user');
  expect(response.body.data).toHaveProperty('token');
  expect(typeof response.body.data.token).toBe('string');
  expect(response.body.data.token.split('.').length).toBe(3); // JWT format
};

/**
 * Constants for testing
 */
export const TEST_CONSTANTS = {
  // JWT token duration
  JWT_EXPIRY_SECONDS: 157680000, // 5 years
  JWT_EXPIRY_MS: 157680000 * 1000,

  // Validation errors
  VALIDATION_ERROR_MESSAGE: 'Validation failed',

  // Auth error messages
  EMAIL_ALREADY_REGISTERED: 'Email already registered',
  PHONE_ALREADY_REGISTERED: 'Phone number already registered',
  INVALID_CREDENTIALS: 'Invalid email/number or password',

  // HTTP status codes
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
};
