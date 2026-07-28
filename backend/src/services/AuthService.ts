import UserRepository from '../repositories/UserRepository';
import { hashPassword, comparePassword } from '../lib/password';
import { generateToken } from '../lib/jwt';
import { IUser } from '../models/User';

interface SignupData {
  name: string;
  email: string;
  number: string;
  password: string;
}

interface LoginData {
  identifier: string;
  password: string;
}

interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    number: string;
  };
  token: string;
}

class AuthService {
  async signup(data: SignupData): Promise<AuthResponse> {
    // Check if user already exists by email
    const existingEmail = await UserRepository.findByEmail(data.email);
    if (existingEmail) {
      throw new Error('Email already registered');
    }

    // Check if user already exists by number
    const existingNumber = await UserRepository.findByNumber(data.number);
    if (existingNumber) {
      throw new Error('Phone number already registered');
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user
    const user = await UserRepository.createUser({
      name: data.name,
      email: data.email.toLowerCase(),
      number: data.number,
      password: hashedPassword,
    });

    // Generate token
    const token = generateToken(user._id.toString(), user.email);

    // Return response
    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        number: user.number,
      },
      token,
    };
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const { identifier, password } = data;

    // Find user by email or number
    let user = await UserRepository.findByEmailWithPassword(identifier);
    if (!user) {
      user = await UserRepository.findByNumberWithPassword(identifier);
    }

    if (!user) {
      throw new Error('Invalid email/number or password');
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email/number or password');
    }

    // Generate token
    const token = generateToken(user._id.toString(), user.email);

    // Return response
    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        number: user.number,
      },
      token,
    };
  }
}

export default new AuthService();
