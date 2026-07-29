import User, { IUser } from '../models/User';
import { Types } from 'mongoose';

class UserRepository {
  async createUser(userData: Partial<IUser>): Promise<IUser> {
    const user = new User(userData);
    return await user.save();
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email: email.toLowerCase() });
  }

  async findByNumber(number: string): Promise<IUser | null> {
    return await User.findOne({ number });
  }

  async findById(id: string): Promise<IUser | null> {
    return await User.findById(id);
  }

  async findByEmailOrNumber(identifier: string): Promise<IUser | null> {
    return await User.findOne({
      $or: [{ email: identifier.toLowerCase() }, { number: identifier }],
    });
  }

  async findByIdWithPassword(id: string): Promise<IUser | null> {
    return await User.findById(id).select('+password');
  }

  async findByEmailWithPassword(email: string): Promise<IUser | null> {
    return await User.findOne({ email: email.toLowerCase() }).select('+password');
  }

  async findByNumberWithPassword(number: string): Promise<IUser | null> {
    return await User.findOne({ number }).select('+password');
  }

  async updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
    return await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await User.findByIdAndDelete(id);
    return result !== null;
  }

  async findAll(): Promise<IUser[]> {
    return await User.find().sort({ createdAt: -1 });
  }

  async pushNotificationToAllUsers(notificationId: Types.ObjectId): Promise<void> {
    await User.updateMany(
      {},
      {
        $push: {
          notifications: {
            notificationId,
            read: false,
            receivedAt: new Date(),
          },
        },
      }
    );
  }

  async getUserNotifications(userId: string): Promise<IUser | null> {
    return await User.findById(userId).populate('notifications.notificationId');
  }

  async markNotificationRead(userId: string, notificationId: string): Promise<void> {
    await User.updateOne(
      { _id: userId, 'notifications.notificationId': new Types.ObjectId(notificationId) },
      { $set: { 'notifications.$.read': true } }
    );
  }
}

export default new UserRepository();
