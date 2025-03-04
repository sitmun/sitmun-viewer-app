import { NotificationType } from "./NotificationType";

export interface INotification {
  message: string,
  type: NotificationType,
  duration: number
}
