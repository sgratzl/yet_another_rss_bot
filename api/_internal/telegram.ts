import {Telegram, ContextMessageUpdate} from 'telegraf';

const DEFAULT_TRUNCATION_LIMIT = 4096;
const TRUNCATED_MESSAGE = '**Truncated message, open on GitHub to read more**';

export function truncateMessage(header: string, body: string, footer = '') {
  const full = `${header}\n\n${body}\n${footer}`;
  if (full.length < DEFAULT_TRUNCATION_LIMIT) {
    return full;
  }
  const remaining = DEFAULT_TRUNCATION_LIMIT - header.length - footer.length - TRUNCATED_MESSAGE.length - 10;
  return `${header}\n\n${body.slice(0, remaining)}\n${TRUNCATED_MESSAGE}\n${footer}`;

}

export function toArgs(ctx: ContextMessageUpdate) {
  const regex = /^\/([^@\s]+)@?(?:(\S+)|)\s?([\s\S]+)?$/i;
  const parts = regex.exec(ctx.message!.text!.trim());
  if (!parts) {
    return [];
  }
  return !parts[3] ? [] : parts[3].split(/\s+/).filter((arg) => arg.length);
}


export function replyer(chatId: string | number) {
  const telegram = new Telegram(process.env.BOT_TOKEN!);

  return telegram.sendMessage.bind(telegram, chatId);
}
