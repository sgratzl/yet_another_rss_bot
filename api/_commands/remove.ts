import {ContextMessageUpdate} from 'telegraf';
import {deleteFeed} from '../_internal/db';
import {NO_PREVIEW, toArgs} from '../_internal/telegram';

async function deleteImpl(ctx: ContextMessageUpdate, urls: string[]) {
  const chatId = ctx.chat!.id;
  await Promise.all(urls.map((url) => deleteFeed(chatId, url)));
  return ctx.reply(`removed feeds:\n${urls.join('\n')}`, NO_PREVIEW);
}

export async function remove(ctx: ContextMessageUpdate) {
  const args = toArgs(ctx);
  if (args.length === 0) {
    return ctx.reply('Please provide one or more RSS URLs as arguments');
  }
  return deleteImpl(ctx, args);
}
