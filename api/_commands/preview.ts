import {ContextMessageUpdate} from 'telegraf';
import {MARKDOWN} from '../_internal/telegram';

export async function preview(ctx: ContextMessageUpdate) {
  const msg = ctx.message!;
  if (!msg.reply_to_message) {
    return ctx.reply('not a reply message');
  }
  const links = (msg.reply_to_message.entities || []).filter((e) => e.type === 'text_link');
  if (links.length === 0) {
    return ctx.reply('no contained links');
  }
  return ctx.reply(links.map((link) => `[${link.url}](${link.url})`).join('\n'), MARKDOWN);
}
