import TelegramBot from "node-telegram-bot-api";
import { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } from "@/constants.js";
import { Notifier } from "@/types/notifier.js";

if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
  console.log('TELEGRAM_BOT_TOKEN is not provided');
  process.exit(1);
}

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN);

export const telegram: Notifier = {
  async send(message: string) {
    await bot.sendMessage(
      TELEGRAM_CHAT_ID!,
      message,
      {
        parse_mode: 'Markdown'
      }
    );
  }
}