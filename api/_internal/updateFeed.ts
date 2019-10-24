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

  function handleItem(item: Item) {
    const msg = `${item.meta.title}\n**[${item.title}](${item.link})**\n${item.summary || item.description}`;
    return replyer.reply(msg, MARKDOWN).then(() => item);
  }

  const stream = await fetch(feed.url);
  const items = await new Promise<Promise<Item>[]>((resolve, reject) => {
    const items: Promise<Item>[] = [];
    stream.body.pipe(parser)
      .on('data', (item: Item) => {
        const date = item.date || item.meta.date;
        if (date && date > lastUpdate) {
          items.push(handleItem(item));
        }
      })
      .on('end', () => resolve(items))
      .on('error', (error: any) => reject(error));
  });

  return Promise.all(items).then((items) => {
    feed.lastUpdateTime = items.reduce((acc, item) => Math.max(acc, (item.date || item.meta.date!).getTime()), feed.lastUpdateTime);
  });
}
