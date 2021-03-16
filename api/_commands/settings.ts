import { Context } from 'telegraf';
import {getFeeds, saveFeed} from '../_internal/db';
import {IRSSFeed} from '../_internal/model';
import { MenuTemplate } from 'telegraf-inline-menu';


interface IStateContext extends Context {
  state: {
    feeds: IRSSFeed[];
  };
}

export const settingsMenu = new MenuTemplate('Change Feed Settings');
// .setCommand('settings');
const feedOptions = new MenuTemplate('Feed Options');

function fetchFeeds(ctx: Context) {
  return getFeeds(ctx.chat!.id).then((feeds) => {
    (ctx as IStateContext).state.feeds = feeds;
    return feeds.map((feed) => feed.url);
  });
}
feedOptions.toggle('show Previews', 'p', {
  set: async (ctx, choice) => {
    const url = ctx.match![1];
    const feed = (ctx as IStateContext).state.feeds.find((feed) => feed.url === url)!;
    feed.previews = choice;
    await saveFeed(feed);
  },
  isSet: (ctx) => {
    const url = ctx.match![1];
    const feed = (ctx as IStateContext).state.feeds.find((feed) => feed.url === url)!;
    return feed.previews;
  }
});
feedOptions.select('frequency', ['asap', 'hourly', 'daily'], {
  set: async (ctx, choice) => {
    const url = ctx.match![1];
    const feed = (ctx as IStateContext).state.feeds.find((feed) => feed.url === url)!;
    if (!feed) {
      return;
    }
    feed.frequency = choice as 'asap' | 'hourly' | 'daily';
    await saveFeed(feed);
  },
  isSet: (ctx, choice) => {
    const url = ctx.match![1];
    const feed = (ctx as IStateContext).state.feeds.find((feed) => feed.url === url)!;
    if (!feed) {
      return false;
    }
    return feed.frequency === choice;
  }
});

settingsMenu.listSubmenus('f', fetchFeeds, feedOptions, {
  columns: 2
});
