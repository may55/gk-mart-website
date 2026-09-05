import NotificationRepository from '../repositories/NotificationRepository';
import UserRepository from '../repositories/UserRepository';
import { INotification } from '../models/Notification';
import { IUserNotification } from '../models/User';
import { Types } from 'mongoose';

interface PopulatedUserNotification {
  notificationId: INotification;
  read: boolean;
  receivedAt: Date;
}

class NotificationService {
  /** Publishes a notification for users to receive. */
  async publish(text: string): Promise<INotification> {
    const notification = await NotificationRepository.create(text);
    await UserRepository.pushNotificationToAllUsers(notification._id as Types.ObjectId);
    return notification;
  }

  /** Lists all published notifications. */
  async listAll(): Promise<INotification[]> {
    return await NotificationRepository.findAll();
  }

  /** Returns notifications addressed to one user with their read state. */
  async getUserNotifications(userId: string): Promise<PopulatedUserNotification[]> {
    const user = await UserRepository.getUserNotifications(userId);
    if (!user) return [];
    return (user.notifications as unknown as PopulatedUserNotification[]).sort(
      (a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
    );
  }

  /** Marks one user's notification as read. */
  async markRead(userId: string, notificationId: string): Promise<void> {
    await UserRepository.markNotificationRead(userId, notificationId);
  }
}

export default new NotificationService();
