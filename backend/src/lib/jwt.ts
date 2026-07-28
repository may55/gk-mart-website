import jwt from 'jsonwebtoken';

export interface TokenPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

const generateToken = (userId: string, email: string): string => {
  const secret = process.env.JWT_SECRET || 'your_secret_key';
  const expiresIn = process.env.JWT_EXPIRY || '157680000'; // 5 years in seconds

  return jwt.sign(
    { userId, email },
    secret,
    { expiresIn: parseInt(expiresIn) }
  );
};

const verifyToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'your_secret_key';
    const decoded = jwt.verify(token, secret) as TokenPayload;
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};

export { generateToken, verifyToken };
