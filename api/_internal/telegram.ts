import type { ExtraReplyMessage } from 'telegraf/typings/telegram-types';

export function toArgs(text: string) {
  const regex = /^\/([^@\s]+)@?(?:(\S+)|)\s?([\s\S]+)?$/i;
  const parts = regex.exec(text.trim());
  if (!parts) {
    return [];
  }
  return !parts[3] ? [] : parts[3].split(/\s+/).filter((arg) => arg.length);
}

export const HTML: ExtraReplyMessage = {
  parse_mode: 'HTML'
};

export const NO_PREVIEW_HTML: ExtraReplyMessage = {
  disable_web_page_preview: true,
  parse_mode: 'HTML'
};

export const hiddenCharacter = '\u200b';
// export const hiddenCharacter = 'Preview';
