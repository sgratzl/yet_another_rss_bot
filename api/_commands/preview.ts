import type { Context } from 'telegraf';
import type { Message, MessageEntity } from 'typegram';
import { HTML } from '../_internal/telegram';

export function preview(ctx: Context & { message: Message.TextMessage }) {
  const msg = ctx.message;
  if (!msg.reply_to_message) {
    return ctx.reply('not a reply message');
  }
  const links = (msg.reply_to_message as Message.TextMessage).entities?.filter((e): e is MessageEntity.TextLinkMessageEntity => e.type === 'text_link') ?? [];
  if (links.length === 0) {
    return ctx.reply('no contained links');
  }
  let resl: string[] = [];
  const instantPrefix = 'https://t.me/iv';
  if (links.some((l) => l.url.startsWith(instantPrefix))) {
    // preview special mode
    links.forEach((link, i) => {
      if (link.url.startsWith(instantPrefix)) {
        resl.push(`[${i > 0 ? links[i - 1]!.url : link.url}](${link.url})`);
      }
    });
  } else {
    resl = links.map((link) => `<a href="${link.url}">${link.url}</a>`);
  }
  return ctx.reply(resl.join('<br>'), HTML);
}
