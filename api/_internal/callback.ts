import fetch from 'node-fetch';
import {IRSSFeed} from './model';
import {URL} from 'url';

const API_KEY = process.env.CALLMYAPP_KEY!;

export function registerCallback(feed: IRSSFeed, serverUrl: string) {
  const url = new URL('https://callmyapp.com/api/1.0/create');
  url.searchParams.set('api_key', API_KEY);
  url.searchParams.set('callback_url', `${serverUrl}/update?id=${encodeURIComponent(feed.uid)}`);
  url.searchParams.set('callback_time', new Date(Date.now() + 1000).toISOString());
  url.searchParams.set('callback_repeat', '1');
  url.searchParams.set('callback_repeat_type', 'interval');
  url.searchParams.set('callback_repeat_interval_unit', feed.intervalUnit);
  url.searchParams.set('callback_repeat_interval', feed.interval.toString());

  return fetch(url).then((r) => r.json()).then((r: any) => {
    if (!r.success) {
      Promise.reject(r.error);
    }
    feed.callbackId = r.callback_id;
    return r.callback_id;
  });
}

export function deregisterCallback(feed: IRSSFeed) {
  const url = new URL(`https://callmyapp.com/api/1.0/delete/${feed.callbackId}`);
  url.searchParams.set('api_key', API_KEY);
  return fetch(url).then((r) => r.json());
}

export async function updateCallback(feed: IRSSFeed, serverUrl: string) {
  if (feed.callbackId) {
    await deregisterCallback(feed);
  }
  await registerCallback(feed, serverUrl);
}
