import { Notification } from 'electron';

interface AlertState {
  key: string;
  lastSentAt: number;
}

export class NotificationService {
  private alerts = new Map<string, AlertState>();
  private debounceMs = 5 * 60 * 1000;

  notify(key: string, title: string, body: string) {
    const now = Date.now();
    const existing = this.alerts.get(key);

    if (existing && now - existing.lastSentAt < this.debounceMs) {
      return;
    }

    this.alerts.set(key, { key, lastSentAt: now });

    const notification = new Notification({ title, body });
    notification.show();
  }
}

export const notificationService = new NotificationService();
