import {NowRequest, NowResponse} from '@now/node';
import { Telegraf, Context, Middleware } from 'telegraf';
import { MenuMiddleware, MenuTemplate } from 'telegraf-inline-menu';
import {add, addScene, list, removeMenu, removeall, settingsMenu, update, preview, instantView} from './_commands';
import {ok} from './_internal/responses';

const bot = new Telegraf(process.env.BOT_TOKEN!, {
  username: 'yet_another_rss_bot'
});

bot.start((ctx) => {
  return ctx.reply('This bot forwards RSS updates as chat messages');
});

const menu = new MenuTemplate('Main Menu');

stage.register(addScene);

const menuMiddleware = new MenuMiddleware('/', menu);
bot.command('start', ctx => menuMiddleware.replyToContext(ctx))
bot.use(menuMiddleware);

menu.submenu('settings', 's', settingsMenu);
menu.submenu('remove', 'r', removeMenu);

bot.use(session());
bot.use(menu.init());
bot.use(stage.middleware() as Middleware<Context>);

bot.command('add', add);
bot.command('list', list);
bot.command('update', update);
bot.command('removeall', removeall);
bot.command('preview', preview);
bot.command('instantview', instantView);

export default async function handle(req: NowRequest, res: NowResponse) {
  await bot.handleUpdate(req.body);

  return ok(res);
}

async function _main() {
  const lastArg = process.argv[process.argv.length - 1];
  if (lastArg.startsWith('https')) {
    await bot.telegram.setWebhook(lastArg);
    console.log('set webhook', lastArg);
    return;
  }

  console.log('start bot');
  await bot.telegram.deleteWebhook();
  bot.startPolling();
}

if (require.main === module) {
  void _main();
}
