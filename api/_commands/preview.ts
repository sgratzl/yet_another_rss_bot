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
  let resl: string[] = [];
  const instantPrefix = 'https://t.me/iv';
  if (links.some((l) => l.url!.startsWith(instantPrefix))) {
    // preview special mode
    links.forEach((link, i) => {
      if (link.url!.startsWith(instantPrefix)) {
        resl.push(`[${i > 0 ? links[i - 1]!.url : link.url}](${link.url})`);
      }
    });
  } else {
    resl = links.map((link) => `[${link.url}](${link.url})`);
  }
  return ctx.reply(resl.join('\n'), MARKDOWN);
}
