import {IRSSFeed} from './model';
import fetch from 'node-fetch';
import FeedParser, {Item} from 'feedparser';
import {MARKDOWN, IReplyer} from './telegram';

export default async function updateFeed(feed: IRSSFeed, replyer: IReplyer) {
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
    items.sort((a, b) => (a.date || a.meta.date!).getTime() - (b.date || b.meta.date!).getTime());
    const msgs = items.map((item) => `${item.meta.title}\n**[${item.title}](${item.link})**\n${item.summary || item.description || ''}`);
    const replies: string[] = [];
    let acc = '';
    msgs.forEach((msg) => {
      if (acc.length >= 4000) {
        replies.push(acc);
        acc = '';
      }
      acc = acc + msg + '\n\n';
    });
    if (acc.length > 0) {
      replies.push(acc);
    }

    feed.lastUpdateTime = items.reduce((acc, item) => Math.max(acc, (item.date || item.meta.date!).getTime()), feed.lastUpdateTime);
    return Promise.all(replies.map((r) => replyer.reply(r, MARKDOWN)));
  });
}
