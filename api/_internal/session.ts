import {connect} from 'mongodb';
import {ContextMessageUpdate} from 'telegraf';

export function getCollection() {
  const client = connect(process.env.MONGODB_URL!, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  return client.then((client) => client.db().collection('yet_another_rss_bot_session'));
}

export function getSession<T>(q: {key: string}): Promise<T> {
  return getCollection().then((col) => {
    return col.findOne(q);
  }).then((doc) => doc || {...q});
}

export function saveSession<T>(q: {key: string}, session: T): Promise<any> {
  return getCollection().then((col) => {
    return col.updateOne(q, {$set: {...q, ...session}}, {upsert: true});
  });
}

export declare interface ISessionContext<T> extends ContextMessageUpdate {
  session: T;
}

function getSessionKey(ctx: ContextMessageUpdate) {
  if (ctx.from && ctx.chat) {
    return `${ctx.from.id}:${ctx.chat.id}`
  } else if (ctx.from && ctx.inlineQuery) {
    return `${ctx.from.id}:${ctx.from.id}`
  }
  return null;
}

export async function session<T>(ctx: ISessionContext<T>, next?: (ctx?: ISessionContext<T>) => any) {
  const key = getSessionKey(ctx) || 'all';
  ctx.session = await getSession({key});
  if (next) {
    await next(ctx);
  }
  await saveSession({key}, ctx.session);
};
export default session;
