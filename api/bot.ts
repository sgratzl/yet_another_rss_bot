import {NowRequest, NowResponse} from '@now/node';
import Telegraf from 'telegraf';
import {ok} from './_internal/responses';
// import {toArgs} from './_internal/telegram';

// let serverUrl = '';

const bot = new Telegraf(process.env.BOT_TOKEN!, {
  username: 'yet_another_rss_bot'
});

bot.start((ctx) => {
  ctx.reply('This bot forwards RSS updates as chat messages');
});

export default async function handle(req: NowRequest, res: NowResponse) {
  // serverUrl = `https://${req.headers.host}/api`;

  await bot.handleUpdate(req.body);

  return ok(res);
}
