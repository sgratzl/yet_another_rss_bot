import type { Context } from 'telegraf';
import {getFeeds, saveFeed} from '../_internal/db';
import type {IRSSFeed} from '../_internal/model';
import { MenuTemplate } from 'telegraf-inline-menu';


export interface MenuTemplateContext extends Context {
  readonly match?: RegExpExecArray;
  state: {
    feeds?: IRSSFeed[];
  };
}

export const settingsMenu = new MenuTemplate<MenuTemplateContext>('Change Feed Settings');
const feedOptions = new MenuTemplate<MenuTemplateContext>('Feed Options');

function fetchFeeds(ctx: Context) {
  return getFeeds(ctx.chat!.id).then((feeds) => {
    ctx.state.feeds = feeds;
    return feeds.map((feed) => feed.url);
  });
}
feedOptions.toggle('show Previews', 'p', {
  set: async (ctx, choice) => {
    const url = ctx.match![1];
    const feed = ctx.state.feeds!.find((feed) => feed.url === url)!;
    feed.previews = choice;
    await saveFeed(feed);
    return true;
  },
  isSet: (ctx) => {
    const url = ctx.match![1];
    const feed = ctx.state.feeds!.find((feed) => feed.url === url)!;
    return feed.previews;
  }
});
feedOptions.select('frequency', ['asap', 'hourly', 'daily'], {
  set: async (ctx, choice) => {
    const url = ctx.match![1];
    const feed = ctx.state.feeds!.find((feed) => feed.url === url)!;
    if (!feed) {
      return false;
    }
    feed.frequency = choice as 'asap' | 'hourly' | 'daily';
    await saveFeed(feed);
    return true;
  },
  isSet: (ctx, choice) => {
    const url = ctx.match![1];
    const feed = ctx.state.feeds!.find((feed) => feed.url === url)!;
    if (!feed) {
      return false;
    }
    return feed.frequency === choice;
  }
});

settingsMenu.chooseIntoSubmenu('f', fetchFeeds, feedOptions, {
  columns: 2
});
