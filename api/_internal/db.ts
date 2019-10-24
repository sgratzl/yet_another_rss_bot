import {connect} from 'mongodb';
import {IRSSFeed} from './model';

function getDB() {
  const client = connect(process.env.MONGODB_URL!, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  return client.then((client) => client.db());
}

// function getSessionCollection() {
//   return getDB().then((db) => db.collection('yet_another_rss_bot_session'));
// }

function getFeedCollection() {
  return getDB().then((db) => db.collection('yet_another_rss_bot_feed'));
}


export function getFeedsToUpdate(frequency: string): Promise<IRSSFeed[]> {
  return getFeedCollection().then((c) => c.find({frequency})).then((c) => c.toArray());
}

export function getFeeds(chatId: number): Promise<IRSSFeed[]> {
  return getFeedCollection().then((c) => c.find({chatId})).then((c) => c.toArray());
}

export function deleteFeed(chatId: number, url: string) {
  return getFeedCollection().then((c) => c.deleteOne({chatId, url}));
}

export function deleteAllFeeds(chatId: number) {
  return getFeedCollection().then((c) => c.deleteMany({chatId}));
}

export function insertFeed(feed: IRSSFeed) {
  return getFeedCollection().then((c) => c.insertOne(feed)).then(() => feed);
}

export function saveFeed(feed: IRSSFeed) {
  return getFeedCollection().then((c) => {
    const update: any = {};
    Object.keys(feed).filter((k) => !k.startsWith('_')).map((k) => {
      update[k] = {'$set': feed[k as keyof IRSSFeed]};
    });
    return c.updateOne({_id: feed._id}, update);
  });
}
