import UserRepository from '../repositories/UserRepository';
import { hashPassword } from '../lib/password';
import { IUser, IAddress } from '../models/User';

interface CreateUserData {
  name: string;
  email: string;
  number: string;
  password: string;
  userRole?: 'admin' | 'customer';
  addresses?: IAddress[];
}

interface UpdateUserData {
  name?: string;
  email?: string;
  number?: string;
  userRole?: 'admin' | 'customer';
  addresses?: IAddress[];
}

class AdminUserService {
  /** Returns all users for administrative management. */
  async getAll(): Promise<IUser[]> {
    return await UserRepository.findAll();
  }

  /** Returns one user by id or throws a not-found error. */
  async getById(id: string): Promise<IUser> {
    const user = await UserRepository.findById(id);
    if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
    return user;
  }

  /** Creates an administrative user record. */
  async create(data: CreateUserData): Promise<IUser> {
    const existingEmail = await UserRepository.findByEmail(data.email);
    if (existingEmail) throw new Error('Email already registered');

    const existingNumber = await UserRepository.findByNumber(data.number);
    if (existingNumber) throw new Error('Phone number already registered');

    const hashedPassword = await hashPassword(data.password);
    return await UserRepository.createUser({
      name: data.name,
      email: data.email.toLowerCase(),
      number: data.number,
      password: hashedPassword,
      userRole: data.userRole ?? 'customer',
      addresses: data.addresses ?? [],
    });
  }

  /** Updates an administrative user record. */
  async update(id: string, data: UpdateUserData): Promise<IUser> {
    const user = await UserRepository.updateUser(id, data);
    if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
    return user;
  }
}

export default new AdminUserService();
