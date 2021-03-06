import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Telegram } from 'telegraf';
import { saveFeed, getFeedsToUpdate } from './_internal/db';
import { ok } from './_internal/responses';
import updateFeed from './_internal/updateFeed';


export default async function handle(req: VercelRequest, res: VercelResponse) {
  const frequency = decodeURIComponent((req.body ? req.body.frequency : '') as string);

  const feeds = await getFeedsToUpdate(frequency || 'asap');

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
