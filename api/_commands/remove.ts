import type { Context } from 'telegraf';
import { MenuTemplate } from 'telegraf-inline-menu';
import { deleteFeed, getFeeds } from '../_internal/db';
import { NO_PREVIEW_HTML } from '../_internal/telegram';

async function deleteImpl(ctx: Context, urls: string[]) {
  const chatId = ctx.chat!.id;
  await Promise.all(urls.map((url) => deleteFeed(chatId, url)));
  return ctx.reply(`removed feeds:\n${urls.join('\n')}`, NO_PREVIEW_HTML);
}

function fetchFeeds(ctx: Context) {
  return getFeeds(ctx.chat!.id).then((feeds) => {
    return feeds.map((feed) => feed.url);
  });
}

export const removeMenu = new MenuTemplate<Context>('Select Feed to remove');
removeMenu.select('rem', fetchFeeds, {
  isSet: () => false,
  set: async (ctx, key) => {
    await deleteImpl(ctx, [key]);
    return true;
  }
});
