import jwt from 'jsonwebtoken';

export interface AdminTokenPayload {
  userId: string;
  email: string;
  role: 'admin';
  iat?: number;
  exp?: number;
}

const generateAdminToken = (userId: string, email: string): string => {
  const secret = process.env.ADMIN_JWT_SECRET || 'admin_secret_key';
  const expiresIn = process.env.ADMIN_JWT_EXPIRY || '157680000'; // 5 years

  return jwt.sign({ userId, email, role: 'admin' }, secret, {
    expiresIn: parseInt(expiresIn),
  });
};

const verifyAdminToken = (token: string): AdminTokenPayload | null => {
  try {
    const secret = process.env.ADMIN_JWT_SECRET || 'admin_secret_key';
    const decoded = jwt.verify(token, secret) as AdminTokenPayload;
    if (decoded.role !== 'admin') return null;
    return decoded;
  } catch {
    return null;
  }
};

export { generateAdminToken, verifyAdminToken };
