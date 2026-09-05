import UserRepository from '../repositories/UserRepository';
import { comparePassword } from '../lib/password';
import { generateAdminToken } from '../lib/adminJwt';

interface AdminLoginData {
  email: string;
  password: string;
}

interface AdminAuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
  token: string;
}

class AdminAuthService {
  /** Authenticates an admin account and returns an admin session token. */
  async login(data: AdminLoginData): Promise<AdminAuthResponse> {
    const user = await UserRepository.findByEmailWithPassword(data.email);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (user.userRole !== 'admin') {
      throw Object.assign(new Error('Access denied: admin only'), { statusCode: 403 });
    }

    const isPasswordValid = await comparePassword(data.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const token = generateAdminToken(user._id.toString(), user.email);

    return {
      user: { id: user._id.toString(), name: user.name, email: user.email },
      token,
    };
  }
}

export default new AdminAuthService();
