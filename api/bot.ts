import {NowRequest, NowResponse} from '@now/node';
import Telegraf, {ContextMessageUpdate, Middleware, Stage, session} from 'telegraf';
import TelegrafInlineMenu from 'telegraf-inline-menu';
import {add, addScene, list, removeMenu, removeall, settingsMenu, update} from './_commands';
import {ok} from './_internal/responses';

const bot = new Telegraf(process.env.BOT_TOKEN!, {
  username: 'yet_another_rss_bot'
});

bot.start((ctx) => {
  return ctx.reply('This bot forwards RSS updates as chat messages');
});

const menu = new TelegrafInlineMenu('Main Menu');
const stage = new Stage([], {ttl: 10});

stage.register(addScene);

menu.submenu('settings', 's', settingsMenu);
menu.submenu('remove', 'r', removeMenu);

bot.use(session());
bot.use(menu.init());
bot.use(stage.middleware() as Middleware<ContextMessageUpdate>);

bot.command('add', add);
bot.command('list', list);
bot.command('update', update);
bot.command('removeall', removeall);

export default async function handle(req: NowRequest, res: NowResponse) {
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
