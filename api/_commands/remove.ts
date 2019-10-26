import {ContextMessageUpdate} from 'telegraf';
import {deleteFeed, getFeeds} from '../_internal/db';
import {NO_PREVIEW} from '../_internal/telegram';
import TelegrafInlineMenu from 'telegraf-inline-menu/dist/source';

async function deleteImpl(ctx: ContextMessageUpdate, urls: string[]) {
  const chatId = ctx.chat!.id;
  await Promise.all(urls.map((url) => deleteFeed(chatId, url)));
  return ctx.reply(`removed feeds:\n${urls.join('\n')}`, NO_PREVIEW);
}

function fetchFeeds(ctx: ContextMessageUpdate) {
  return getFeeds(ctx.chat!.id).then((feeds) => {
    return feeds.map((feed) => feed.url);
  });
}

export const removeMenu = new TelegrafInlineMenu('Select Feed to remove').setCommand('remove');
removeMenu.select('rem', fetchFeeds, {
  setFunc: (ctx, key) => {
    deleteImpl(ctx, [key]);
  }
});
