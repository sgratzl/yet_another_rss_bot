import type { Context } from 'telegraf';
import { insertFeed } from '../_internal/db';
import { NO_PREVIEW, toArgs } from '../_internal/telegram';
import { createFeed } from '../_internal/model';

export async function addImpl(ctx: Context, url: string) {
  const chatId = ctx.chat!.id;
  const feed = await insertFeed(createFeed(url, chatId));
  return ctx.reply(`registered feed: ${feed.url}`, NO_PREVIEW);
}

export function add(ctx: Context & { message: { text: string } }) {
  const args = toArgs(ctx.message.text);
    if (args.length === 0) {
      return ctx.reply('use /add rss-url');
    }
  return addImpl(ctx, args[0]!);
  }
