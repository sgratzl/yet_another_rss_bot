import {ContextMessageUpdate} from "telegraf";
import TelegrafInlineMenu from "telegraf-inline-menu/dist/source";
import {getFeeds, saveFeed} from "../_internal/db";
import {IRSSFeed} from "../_internal/model";


interface IStateContext extends ContextMessageUpdate {
  state: {
    feeds: IRSSFeed[];
  }
}

export const settingsMenu = new TelegrafInlineMenu('Settings').setCommand('settings');
const feedOptions = new TelegrafInlineMenu('Feed Options');

function fetchFeeds(ctx: ContextMessageUpdate) {
  return getFeeds(ctx.chat!.id).then((feeds) => {
    (ctx as IStateContext).state.feeds = feeds;
    return feeds.map((feed) => feed.url);
  });
}
feedOptions.toggle('show Previews', 'p', {
  setFunc: async (ctx: ContextMessageUpdate, choice) => {
    const url = ctx.match![1];
    const feed = (ctx as IStateContext).state.feeds.find((feed) => feed.url === url)!;
    feed.previews = choice;
    await saveFeed(feed);
  },
  isSetFunc: async (ctx: ContextMessageUpdate) => {
    const url = ctx.match![1];
    const feed = (ctx as IStateContext).state.feeds.find((feed) => feed.url === url)!;
    return feed.previews;
  }
});
feedOptions.select('frequency', ['asap', 'hourly', 'daily'], {
  setFunc: async (ctx: ContextMessageUpdate, choice) => {
    const url = ctx.match![1];
    const feed = (ctx as IStateContext).state.feeds.find((feed) => feed.url === url)!;
    feed.frequency = choice as 'asap' | 'hourly' | 'daily';
    await saveFeed(feed);
  },
  isSetFunc: async (ctx: ContextMessageUpdate, choice) => {
    const url = ctx.match![1];
    const feed = (ctx as IStateContext).state.feeds.find((feed) => feed.url === url)!;
    return feed.frequency === choice;
  }
});

settingsMenu.selectSubmenu('f', fetchFeeds, feedOptions, {
  columns: 2
});
