import {NowRequest, NowResponse} from '@now/node';
import Telegraf from 'telegraf';
import session, {ISessionContext} from './_internal/session';
import {ok} from './_internal/responses';
import {IRSSSession} from './_internal/model';
// import {toArgs} from './_internal/telegram';

// let serverUrl = '';

const bot = new Telegraf<ISessionContext<IRSSSession>>(process.env.BOT_TOKEN!, {
  username: 'yet_another_rss_bot'
});

bot.use(session);

bot.start((ctx) => {
  ctx.reply('This bot forwards RSS updates as chat messages');
});

export default async function handle(req: NowRequest, res: NowResponse) {
  // serverUrl = `https://${req.headers.host}/api`;

  await bot.handleUpdate(req.body);

  return ok(res);
}
