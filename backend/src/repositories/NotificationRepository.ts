import Notification, { INotification } from '../models/Notification';

class NotificationRepository {
  async create(text: string): Promise<INotification> {
    const notification = new Notification({ text });
    return await notification.save();
  }

  async findAll(): Promise<INotification[]> {
    return await Notification.find().sort({ createdAt: -1 });
  }

  async findById(id: string): Promise<INotification | null> {
    return await Notification.findById(id);
  }
}

export default new NotificationRepository();
