export abstract class NotificationService {
  abstract success(message: string): void;

  abstract info(message: string): void;

  abstract warning(message: string): void;

  abstract error(message: string): void;
}
