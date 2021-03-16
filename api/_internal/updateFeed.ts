import { IRSSFeed } from './model';
import fetch from 'node-fetch';
import FeedParser, { Item } from 'feedparser';
import { NO_PREVIEW, MARKDOWN, hiddenCharacter } from './telegram';
import { Telegram } from 'telegraf';

function escape(v: string) {
  return v.replace(/([{}[]])/gm, '\\$1');
}

export default async function updateFeed(feed: IRSSFeed, telegram: Telegram) {
  const parser = new FeedParser({
    feedurl: feed.url,
    addmeta: true
  });
  const lastUpdate = new Date(feed.lastUpdateTime);

  const url = (item: Item) => {
    let t = `[${item.title}](${item.link})`;
    if (feed.instantView) {
      t = `${t}[${hiddenCharacter}](https://t.me/iv?rhash=${feed.instantView}&url=${encodeURIComponent(item.link)})`;
    }
    return t;
  };

  const stream = await fetch(feed.url);
  const items = await new Promise<Item[]>((resolve, reject) => {
    const items: Item[] = [];
    stream.body.pipe(parser)
      .on('data', (item: Item) => {
        const date = item.date || item.meta.date;
        if (date && date > lastUpdate) {
          items.push(item);
        }
      })
      .on('end', () => resolve(items))
      .on('error', (error: any) => reject(error));
  });

  return Promise.all(items).then((items) => {
    if (items.length === 0) {
      return null;
    }
    items.sort((a, b) => (a.date || a.meta.date!).getTime() - (b.date || b.meta.date!).getTime());
    const msgs = items.map((item) => {
      const details = feed.noDetails ? '' : `\n${escape(item.summary || item.description || '')}`;
      return `${escape(item.meta.title)}\n${url(item)}${details}`;
    });
    const replies: string[] = [];
    if (msgs.length <= 5) {
      replies.push(...msgs);
    } else {
      // bundle
      let acc = '';
      msgs.forEach((msg) => {
        if (acc.length >= 4000) {
          replies.push(acc);
          acc = '';
        }
        acc = `${acc}${msg}\n\n`;
      });
      replies.push(acc);
    }

    feed.lastUpdateTime = items.reduce((acc, item) => Math.max(acc, (item.date || item.meta.date!).getTime()), feed.lastUpdateTime);
    const mode = feed.previews ? MARKDOWN : NO_PREVIEW;
    return Promise.all(replies.map((r) => {
      const m = telegram.sendMessage(feed.chatId, r, mode);
      if (!feed.previews) {
        return m;
      }
      return m.catch(() => telegram.sendMessage(feed.chatId, r, NO_PREVIEW));
    })).catch(() => telegram.sendMessage(feed.chatId, 'error during sending message', NO_PREVIEW)).then(() => feed);
  });
}
