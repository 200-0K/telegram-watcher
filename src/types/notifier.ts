export interface Notifier {
  send(message: string): Promise<any>;
}