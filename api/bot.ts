import {NowRequest, NowResponse} from '@now/node';
import Telegraf from 'telegraf';
import {ok} from './_internal/responses';
import {toArgs, NO_PREVIEW} from './_internal/telegram';
import updateFeed from './_internal/updateFeed';
import {createFeed} from './_internal/model';
import {insertFeed, getFeeds, deleteFeed, saveFeed} from './_internal/db';
// import {deregisterCallback} from './_internal/callback';

// let serverUrl = '';

const bot = new Telegraf(process.env.BOT_TOKEN!, {
  username: 'yet_another_rss_bot'
});

bot.start((ctx) => {
  return ctx.reply('This bot forwards RSS updates as chat messages');
});

bot.command('add', async (ctx) => {
  const args = toArgs(ctx);
  if (args.length === 0) {
    return ctx.reply('Please provide one or more RSS URLs as arguments');
  }
  const chatId = ctx.chat!.id;
  const feeds = await Promise.all(args.map((url) => insertFeed(createFeed(url, chatId))));
  return ctx.reply(`registered feeds:
  ${feeds.map((feed) => feed.url).join('\n')}`, NO_PREVIEW);
});

bot.command('list', async (ctx) => {
  const chatId = ctx.chat!.id;
  const feeds = await getFeeds(chatId);
  return ctx.reply(`registered feeds:
${feeds.map((feed) => feed.url).join('\n')}`, NO_PREVIEW);
});

bot.command('remove', async (ctx) => {
  const args = toArgs(ctx);
  if (args.length === 0) {
    return ctx.reply('Please provide one or more RSS URLs as arguments');
  }
  const chatId = ctx.chat!.id;
  await Promise.all(args.map((url) => deleteFeed(chatId, url)));
  return ctx.reply(`removed feeds:
${args.join('\n')}`, NO_PREVIEW);
});

bot.command('update', async (ctx) => {
  const chatId = ctx.chat!.id;
  const feeds = await getFeeds(chatId);

  await ctx.telegram.sendChatAction(chatId, 'typing');
  await Promise.all(
    feeds.map((feed) => updateFeed(feed, ctx.telegram)
      .then((update) => update ? saveFeed(update) : null))
  );
  await ctx.reply(`updated feeds:
  ${feeds.map((feed) => feed.url).join('\n')}`, NO_PREVIEW);
});

bot.command('removeall', async (ctx) => {
  const chatId = ctx.chat!.id;
  const feeds = await getFeeds(chatId);

  await Promise.all(feeds.map((feed) => deleteFeed(feed.chatId, feed.url)));
  return ctx.reply(`removed feeds:
${feeds.map((feed) => feed.url).join('\n')}`, NO_PREVIEW);
});

export default async function handle(req: NowRequest, res: NowResponse) {
  // serverUrl = `https://${req.headers.host}/api`;

  await bot.handleUpdate(req.body);

  return ok(res);
}

async function _main() {
  const lastArg = process.argv[process.argv.length - 1];
  if (lastArg.startsWith('https')) {
    await bot.telegram.setWebhook(lastArg);
    console.log('set webhook ', lastArg);
    return;
  }

  console.log('start bot');
  await bot.telegram.deleteWebhook();
  bot.startPolling();
}

if (require.main === module) {
  _main();
}
