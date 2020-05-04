import {Context} from 'telegraf';
import {getFeeds} from '../_internal/db';
import {NO_PREVIEW} from '../_internal/telegram';

export async function list(ctx: Context) {
  const chatId = ctx.chat!.id;
  const feeds = await getFeeds(chatId);
  if (feeds.length === 0) {
    return ctx.reply('No registered feeds');
  }
  return ctx.reply(`registered feeds:
${feeds.map((feed) => feed.url).join('\n')}`, NO_PREVIEW);
}
