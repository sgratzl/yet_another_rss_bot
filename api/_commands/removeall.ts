import {ContextMessageUpdate} from 'telegraf';
import {deleteFeed, getFeeds} from '../_internal/db';
import {NO_PREVIEW} from '../_internal/telegram';

export async function removeall(ctx: ContextMessageUpdate) {
  const chatId = ctx.chat!.id;
  const feeds = await getFeeds(chatId);

  if (feeds.length === 0) {
    return ctx.reply('No registered feeds');
  }

  await Promise.all(feeds.map((feed) => deleteFeed(feed.chatId, feed.url)));
  return ctx.reply(`removed feeds:
${feeds.map((feed) => feed.url).join('\n')}`, NO_PREVIEW);
};
