import type { Context } from 'telegraf';
import { getFeed, saveFeed } from '../_internal/db';
import { toArgs } from '../_internal/telegram';

export async function instantViewImpl(ctx: Context, url: string, iv?: string) {
  const chatId = ctx.chat!.id;
  const feed = await getFeed(chatId, url);
  if (!feed) {
    return ctx.reply('feed not found');
  }
  feed.instantView = iv;
  await saveFeed(feed);
  return ctx.reply('feed updated');
}

export function instantView(ctx: Context & { message: { text: string } }) {
  const args = toArgs(ctx.message.text);
  if (args.length === 0) {
    return ctx.reply('use /instantview rss-url iv-hash');
  }
  return instantViewImpl(ctx, args[0]!, args[1]);
}
