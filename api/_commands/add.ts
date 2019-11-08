import {ContextMessageUpdate, BaseScene, Stage} from 'telegraf';
import {insertFeed} from '../_internal/db';
import {NO_PREVIEW, toArgs} from '../_internal/telegram';
import {createFeed} from '../_internal/model';

async function addImpl(ctx: ContextMessageUpdate, urls: string[]) {
  const chatId = ctx.chat!.id;
  const feeds = await Promise.all(urls.map((url) => insertFeed(createFeed(url, chatId))));
  return ctx.reply(`registered feeds:
  ${feeds.map((feed) => feed.url).join('\n')}`, NO_PREVIEW);
}

const leaver = Stage.leave();

export const addScene = new BaseScene('adder');
addScene.enter((ctx) => {
  return ctx.reply('enter RSS URL');
});
addScene.leave((ctx) => {
  return ctx.reply('done RSS URL');
});
addScene.command('cancel', leaver);
addScene.on('text', async (ctx) => {
  if (!ctx.message!.text || !ctx.message!.text.startsWith('http')) {
    return leaver(ctx as any);
  }
  const url = ctx.message!.text;
  console.log('got scene text', url);
  await addImpl(ctx, [url]);
  console.log('added');
  await Stage.leave()(ctx as any);
  console.log('left');
});

export function add(ctx: ContextMessageUpdate) {
  const args = toArgs(ctx);
  if (args.length === 0) {
    return Stage.enter('adder')(ctx as any);
  }
  return addImpl(ctx, args);
}
