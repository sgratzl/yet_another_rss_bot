import {Context} from 'telegraf';
import {getFeeds, saveFeed} from '../_internal/db';
import {NO_PREVIEW} from '../_internal/telegram';
import updateFeed from '../_internal/updateFeed';

export async function update(ctx: Context) {
  const chatId = ctx.chat!.id;
  const feeds = await getFeeds(chatId);

  if (feeds.length === 0) {
    return ctx.reply('No registered feeds');
  }

  await ctx.replyWithChatAction('typing');
  await Promise.all(
    feeds.map((feed) => updateFeed(feed, ctx.telegram)
      .then((update) => update ? saveFeed(update) : null))
  );
  return ctx.reply(`updated feeds:
  ${feeds.map((feed) => feed.url).join('\n')}`, NO_PREVIEW);
}
