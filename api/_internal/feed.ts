import {IRSSFeed, IRSSSession} from './model';
import {ISessionContext} from './session';
import uuid  from 'uuid/v4';
// import {registerCallback} from './callback';

export async function createFeed(url: string, ctx: ISessionContext<IRSSSession>): Promise<IRSSFeed> {

  const feed: IRSSFeed = {
    url,
    intervalUnit: 'minutes',
    interval: 15,
    lastUpdateTime: Date.now(),
    uid: uuid(),
    callbackId: '',
  };

  // await registerCallback(feed, serverUrl);

  await ctx.reply(`added ${url}`);
  return feed;
}
