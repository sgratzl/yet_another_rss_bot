import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Context, Telegraf } from 'telegraf';
import { MenuMiddleware, MenuTemplate } from 'telegraf-inline-menu';
import { add, list, removeMenu, removeAll, settingsMenu, update, preview, instantView } from './_commands';
import { ok } from './_internal/responses';

console.log(process.env);
const bot = new Telegraf(process.env.BOT_TOKEN!);

bot.start((ctx) => {
  return ctx.reply('This bot forwards RSS updates as chat messages');
});

const menu = new MenuTemplate<Context>('Main Menu');

const menuMiddleware = new MenuMiddleware('/', menu);
bot.command('start', ctx => menuMiddleware.replyToContext(ctx));
bot.use(menuMiddleware);

menu.submenu('settings', 's', settingsMenu);
menu.submenu('remove', 'r', removeMenu);

bot.command('add', add);
bot.command('list', list);
bot.command('update', update);
bot.command('removeall', removeAll);
bot.command('preview', preview);
bot.command('instantview', instantView);

export default async function handle(req: VercelRequest, res: VercelResponse) {
  await bot.handleUpdate(req.body);

  return ok(res);
}

async function _main() {
  // Enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
  const lastArg = process.argv[process.argv.length - 1];
  if (lastArg.startsWith('https')) {
    await bot.telegram.setWebhook(lastArg);
    console.log('set webhook', lastArg);
    return;
  }

  console.log('start bot');
  await bot.telegram.deleteWebhook();
  await bot.launch();
}

if (require.main === module) {
  void _main();
}
