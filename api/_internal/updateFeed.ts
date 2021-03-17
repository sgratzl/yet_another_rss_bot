import type { IRSSFeed } from './model';
import fetch from 'node-fetch';
import FeedParser, { Item } from 'feedparser';
import { NO_PREVIEW_HTML, HTML, hiddenCharacter } from './telegram';
import type { Telegram } from 'telegraf';
import sanitizeHtml from 'sanitize-html';

function escapeHTML(text: string) {
  return sanitizeHtml(text, {
    allowedAttributes: false,
    allowedTags: false,
    disallowedTagsMode: 'recursiveEscape'
  });
}

export default async function updateFeed(feed: IRSSFeed, telegram: Telegram) {
  const parser = new FeedParser({
    feedurl: feed.url,
    addmeta: true
  });
  const lastUpdate = new Date(feed.lastUpdateTime);

  const url = (item: Item) => {
    let t = `<a href="${item.link}">${escapeHTML(item.title)}</a>`;
    if (feed.instantView) {
      t = `${t}<a href="https://t.me/iv?rhash=${feed.instantView}&url=${encodeURIComponent(item.link)}">${hiddenCharacter}</a>`;
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
      const details = feed.noDetails ? '' : `\n\n${escapeHTML(item.summary || item.description || '')}`;
      return `${escapeHTML(item.meta.title)}\n\n${url(item)}${details}`;
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
    const mode = feed.previews ? HTML : NO_PREVIEW_HTML;
    return Promise.all(replies.map((r) => {
      const m = telegram.sendMessage(feed.chatId, r, mode);
      if (!feed.previews) {
        return m;
      }
      return m.catch(() => telegram.sendMessage(feed.chatId, r, NO_PREVIEW_HTML));
    })).catch(() => telegram.sendMessage(feed.chatId, 'error during sending message', NO_PREVIEW_HTML)).then(() => feed);
  });
}
