import {ContextMessageUpdate} from 'telegraf';
import {ExtraReplyMessage} from 'telegraf/typings/telegram-types';

export function toArgs(ctx: ContextMessageUpdate) {
  const regex = /^\/([^@\s]+)@?(?:(\S+)|)\s?([\s\S]+)?$/i;
  const parts = regex.exec(ctx.message!.text!.trim());
  if (!parts) {
    return [];
  }
  return !parts[3] ? [] : parts[3].split(/\s+/).filter((arg) => arg.length);
}

export const MARKDOWN: ExtraReplyMessage = {
  parse_mode: 'Markdown', // eslint-disable-line @typescript-eslint/camelcase,
};

export const NO_PREVIEW: ExtraReplyMessage = Object.assign({
  ...MARKDOWN,
  disable_web_page_preview: true // eslint-disable-line @typescript-eslint/camelcase,
});
