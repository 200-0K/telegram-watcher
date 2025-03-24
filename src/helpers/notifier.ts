import { telegram } from "../notifiers/telegram.js";

export const report = async (watcherName: string, message: string) => {
  await telegram.send(`☀️ *Watcher*: _${watcherName}_\n\n📋 *Report*:\n${message}`);
}