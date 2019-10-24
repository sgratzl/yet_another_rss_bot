import {NowRequest, NowResponse} from '@now/node';
import Telegraf from 'telegraf';
import session, {ISessionContext} from './_internal/session';
import {ok} from './_internal/responses';
import {IRSSSession} from './_internal/model';
import {toArgs, MARKDOWN} from './_internal/telegram';
import {createFeed} from './_internal/feed';
import {deregisterCallback} from './_internal/callback';

// let serverUrl = '';

const bot = new Telegraf<ISessionContext<IRSSSession>>(process.env.BOT_TOKEN!, {
  username: 'yet_another_rss_bot'
});

bot.use(session);

bot.start((ctx) => {
  Object.assign(ctx.session, {
    feeds: []
  }, ctx.session);
  ctx.reply('This bot forwards RSS updates as chat messages');
});

bot.command('add', async (ctx) => {
  const args = toArgs(ctx);
  if (args.length === 0) {
    return ctx.reply('Please provide one or more RSS URLs as arguments');
  }
  const newFeeds = args.slice(0, 1).map((url) => createFeed(url, ctx));
  if (!ctx.session.feeds) {
    ctx.session.feeds = [];
  }
  ctx.session.chatId = ctx.chat!.id;
  return Promise.all(newFeeds).then((feeds) => ctx.session.feeds.push(...feeds));
});

bot.command('list', (ctx) => {
  if (!ctx.session.feeds) {
    ctx.session.feeds = [];
  }
  if (!ctx.session.feeds) {
    return ctx.reply('No feeds registered');
  }
  return ctx.reply(`registered feeds:
${ctx.session.feeds.map((feed) => ` * ${feed.url}`).join('\n')}`, MARKDOWN);
});

bot.command('remove', async (ctx) => {
  const args = toArgs(ctx);
  if (args.length === 0) {
    return ctx.reply('Please provide one or more RSS URLs as arguments');
  }
  const feeds = ctx.session.feeds.filter((d) => args.includes(d.url));
  ctx.session.feeds = ctx.session.feeds.filter((d) => !args.includes(d.url));

  await Promise.all(feeds.map((feed) => deregisterCallback(feed)));

  return ctx.reply(`deregistered feeds:
${feeds.map((feed) => feed.url)}`, MARKDOWN);
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

  console.log('start bot', process.argv);
  await bot.telegram.deleteWebhook();
  bot.startPolling();
}

if (require.main === module) {
  _main();
}
