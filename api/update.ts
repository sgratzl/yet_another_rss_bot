import {NowRequest, NowResponse} from '@now/node';
import {Telegram} from 'telegraf';
import {saveFeed, getFeedsToUpdate} from './_internal/db';
import {ok} from './_internal/responses';
import updateFeed from './_internal/updateFeed';


export default async function handle(req: NowRequest, res: NowResponse) {
  const frequency = decodeURIComponent(req.body.frequency as string);

  const feeds = await getFeedsToUpdate(frequency || 'asap');
  console.log(frequency, feeds.map((feed) => feed.url));

  if (feeds.length === 0) {
    return ok(res);
  }

  const telegram = new Telegram(process.env.BOT_TOKEN!);
  await Promise.all(
    feeds.map((feed) => updateFeed(feed, telegram)
      .then((update) => update ? saveFeed(update) : null))
  );

  return ok(res);
}
