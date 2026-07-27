import bcryptjs from 'bcryptjs';

const SALT_ROUNDS = 10;

const hashPassword = async (password: string): Promise<string> => {
  return await bcryptjs.hash(password, SALT_ROUNDS);
};

const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcryptjs.compare(password, hashedPassword);
};

export { hashPassword, comparePassword };
