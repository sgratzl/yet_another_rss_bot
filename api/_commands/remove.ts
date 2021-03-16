import { Context } from 'telegraf';
import { MenuTemplate } from 'telegraf-inline-menu';
import { deleteFeed, getFeeds } from '../_internal/db';
import { NO_PREVIEW } from '../_internal/telegram';

async function deleteImpl(ctx: Context, urls: string[]) {
  const chatId = ctx.chat!.id;
  await Promise.all(urls.map((url) => deleteFeed(chatId, url)));
  return ctx.reply(`removed feeds:\n${urls.join('\n')}`, NO_PREVIEW);
}

function fetchFeeds(ctx: Context) {
  return getFeeds(ctx.chat!.id).then((feeds) => {
    return feeds.map((feed) => feed.url);
  });
}

export const removeMenu = new MenuTemplate('Select Feed to remove');
removeMenu.select('rem', fetchFeeds, {
  setFunc: (ctx, key) => {
    void deleteImpl(ctx, [key]);
  }
});
