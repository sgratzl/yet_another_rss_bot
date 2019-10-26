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

export const addScene = new BaseScene('adder');
addScene.enter((ctx) => ctx.reply('enter RSS URL'));
addScene.on('text', (ctx) => addImpl(ctx, [ctx.message!.text!]).then(() => Stage.leave()));

export async function add(ctx: ContextMessageUpdate) {
  const args = toArgs(ctx);
  if (args.length === 0) {
    return Stage.enter('adder');
  }
  return addImpl(ctx, args);
};
