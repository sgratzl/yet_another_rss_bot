import {ok} from './_internal/responses';
import {NowRequest, NowResponse} from '@now/node';
import {getAllSessions} from './_internal/session';
import {IRSSSession, IRSSFeed} from './_internal/model';
import updateFeed from './_internal/updateFeed';
import {replyer, IReplyer} from './_internal/telegram';


export default async function handle(_req: NowRequest, res: NowResponse) {
  // const uid = decodeURIComponent(req.query.id as string);
  const sessions = await getAllSessions<IRSSSession>({
    feeds: { $exists: true, $not: {$size: 0} }
  });

  const feeds = ([] as (IReplyer & {feed: IRSSFeed})[]).concat(...sessions.map((entry) => {
    const reply = replyer(entry.chatId);
    return entry.feeds.map((feed) => ({feed, reply}));
  }));

  await Promise.all(feeds.map((entry) => updateFeed(entry.feed, entry)));
  return ok(res);
}
