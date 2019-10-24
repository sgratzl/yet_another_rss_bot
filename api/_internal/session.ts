import {connect} from 'mongodb';
import {ContextMessageUpdate} from 'telegraf';

export function getCollection() {
  const client = connect(process.env.MONGODB_URL!, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  return client.then((client) => client.db().collection('yet_another_rss_bot_session'));
}

export function getSession<T>(q: {key?: string; [key: string]: any}): Promise<T> {
  return getCollection().then((col) => {
    return col.findOne(q);
  }).then((doc) => doc || {...q});
}

export function getAllSessions<T>(q: {key?: string; [key: string]: any}): Promise<T[]> {
  return getCollection().then((col) => {
    return col.find(q).toArray();
  });
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
    return `${ctx.from.id}:${ctx.chat.id}`;
  } else if (ctx.from && ctx.inlineQuery) {
    return `${ctx.from.id}:${ctx.from.id}`;
  }
  return null;
}

export default async function session<T>(ctx: ISessionContext<T>, next?: (ctx?: ISessionContext<T>) => any) {
  const key = getSessionKey(ctx) || 'all';
  let session = await getSession<T>({key});
  Object.defineProperty(ctx, 'session', {
    get() {
      return session;
    },
    set(value) {
      session = value;
    }
  });
  if (next) {
    await next(ctx);
  }
  await saveSession({key}, session);
}
