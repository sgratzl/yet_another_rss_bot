import { MongoClient } from 'mongodb';
import type { IRSSFeed } from './model';

function getDB() {
  const client = new MongoClient(process.env.MONGODB_URL!);

  return client.db();
}

function getFeedCollection() {
  return getDB().collection('yet_another_rss_bot_feed');
}

export function getFeedsToUpdate(frequency: string): Promise<IRSSFeed[]> {
  const c = getFeedCollection();
  return c.find({ frequency }).toArray() as Promise<IRSSFeed[]>;
}

export function getFeeds(chatId: number): Promise<IRSSFeed[]> {
  const c = getFeedCollection();
  return c.find({ chatId }).toArray() as Promise<IRSSFeed[]>;
}

export function getFeed(chatId: number, url: string): Promise<IRSSFeed> {
  const c = getFeedCollection();
  return c.findOne<IRSSFeed>({ chatId, url }) as Promise<IRSSFeed>;
}

export function deleteFeed(chatId: number, url: string) {
  const c = getFeedCollection();
  return c.deleteOne({ chatId, url });
}

export function deleteAllFeeds(chatId: number) {
  const c = getFeedCollection();
  return c.deleteMany({ chatId });
}

export function insertFeed(feed: IRSSFeed) {
  const c = getFeedCollection();
  return c.insertOne(feed).then(() => feed);
}

export async function saveFeed(feed: IRSSFeed) {
  const c = getFeedCollection();
  const clone = { ...feed };
  delete clone._id;
  await c.updateOne({ _id: feed._id }, { '$set': clone }, { upsert: true });
  return true;
}
