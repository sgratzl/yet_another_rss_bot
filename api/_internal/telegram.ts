import {Telegram, ContextMessageUpdate} from 'telegraf';
import {ExtraReplyMessage, Message} from 'telegraf/typings/telegram-types';

export function toArgs(ctx: ContextMessageUpdate) {
  const regex = /^\/([^@\s]+)@?(?:(\S+)|)\s?([\s\S]+)?$/i;
  const parts = regex.exec(ctx.message!.text!.trim());
  if (!parts) {
    return [];
  }
  return !parts[3] ? [] : parts[3].split(/\s+/).filter((arg) => arg.length);
}

export interface IReplyer {
  reply: (text: string, extra?: ExtraReplyMessage) => Promise<Message>;
}


export function replyer(chatId: string | number) {
  const telegram = new Telegram(process.env.BOT_TOKEN!);

  return telegram.sendMessage.bind(telegram, chatId);
}

export const MARKDOWN: ExtraReplyMessage = {
  parse_mode: 'Markdown', // eslint-disable-line @typescript-eslint/camelcase,
  disable_web_page_preview: true // eslint-disable-line @typescript-eslint/camelcase,
};
