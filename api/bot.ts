import {NowRequest, NowResponse} from '@now/node';
import Telegraf, {ContextMessageUpdate} from 'telegraf';
import TelegrafInlineMenu from 'telegraf-inline-menu';
import {ok} from './_internal/responses';
import {toArgs, NO_PREVIEW} from './_internal/telegram';
import updateFeed from './_internal/updateFeed';
import {createFeed} from './_internal/model';
import {insertFeed, getFeeds, deleteFeed, saveFeed, getFeed} from './_internal/db';
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
  if (feeds.length === 0) {
    return ctx.reply('No registered feeds');
  }
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
});

bot.command('removeall', async (ctx) => {
  const chatId = ctx.chat!.id;
  const feeds = await getFeeds(chatId);

  if (feeds.length === 0) {
    return ctx.reply('No registered feeds');
  }

  await Promise.all(feeds.map((feed) => deleteFeed(feed.chatId, feed.url)));
  return ctx.reply(`removed feeds:
${feeds.map((feed) => feed.url).join('\n')}`, NO_PREVIEW);
});

const menu = new TelegrafInlineMenu('Main Menu');
const settings = new TelegrafInlineMenu('Settings').setCommand('settings');
const feedOptions = new TelegrafInlineMenu('Feed Options');

menu.submenu('settings', 's', settings);

function fetchFeeds(ctx: ContextMessageUpdate) {
  return getFeeds(ctx.chat!.id).then((feeds) => feeds.map((feed) => feed.url));
}
feedOptions.toggle('show Previews', 'p', {
  setFunc: async (ctx: ContextMessageUpdate, choice) => {
    const url = ctx.match![1];
    const feed = await getFeed(ctx.chat!.id, url);
    feed.previews = choice;
    await saveFeed(feed);
  },
  isSetFunc: async (ctx: ContextMessageUpdate) => {
    const url = ctx.match![1];
    const feed = await getFeed(ctx.chat!.id, url);
    return feed.previews;
  }
});
feedOptions.select('frequency', ['asap', 'hourly', 'daily'], {
  setFunc: async (ctx: ContextMessageUpdate, choice) => {
    const url = ctx.match![1];
    const feed = await getFeed(ctx.chat!.id, url);
    feed.frequency = choice as 'asap' | 'hourly' | 'daily';
    await saveFeed(feed);
  },
  isSetFunc: async (ctx: ContextMessageUpdate, choice) => {
    const url = ctx.match![1];
    const feed = await getFeed(ctx.chat!.id, url);
    return feed.frequency === choice;
  }
});
settings.selectSubmenu('f', fetchFeeds, feedOptions, {
  columns: 2
});

bot.use(menu.init());

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
