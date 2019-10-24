import {IRSSFeed} from './model';
import fetch from 'node-fetch';
import FeedParser, {Item} from 'feedparser';
import {NO_PREVIEW, MARKDOWN} from './telegram';
import {Telegram} from 'telegraf';

export default async function updateFeed(feed: IRSSFeed, telegram: Telegram) {
  const parser = new FeedParser({
    feedurl: feed.url,
    addmeta: true
  });
  const lastUpdate = new Date(feed.lastUpdateTime);

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
    const msgs = items.map((item) => `${item.meta.title}\n**[${item.title}](${item.link})**\n${item.summary || item.description || ''}`);
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
        acc = acc + msg + '\n\n';
      });
      replies.push(acc);
    }

    feed.lastUpdateTime = items.reduce((acc, item) => Math.max(acc, (item.date || item.meta.date!).getTime()), feed.lastUpdateTime);
    const mode = feed.previews ? MARKDOWN : NO_PREVIEW;
    return Promise.all(replies.map((r) => telegram.sendMessage(feed.chatId, r, mode))).then(() => feed);
  });
}
