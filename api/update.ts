import {ok, badRequest} from "./_internal/responses";
import {NowRequest, NowResponse} from "@now/node";
import {getSession} from "./_internal/session";
import {IRSSSession} from "./_internal/model";
import updateFeed from "./_internal/updateFeed";
import {replyer} from "./_internal/telegram";


export default async function handle(req: NowRequest, res: NowResponse) {
  const uid = decodeURIComponent(req.query.id as string);
  const session = await getSession<IRSSSession>({'feeds.uid': uid});
  if (!session.feeds) {
    return badRequest(res);
  }
  const feed = session.feeds.find((d) => d.uid === uid);
  if (!feed) {
    return badRequest(res);
  }

  await updateFeed(feed, {reply: replyer(session.chatId)});
  return ok(res);
}
