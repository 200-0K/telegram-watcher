import { telegram } from "../notifiers/telegram";

export const report = async (watcherName: string, message: string) => {
  await telegram.send(`☀️ *Watcher*: _${watcherName}_\n\n📋 *Report*:\n${message}`);
}