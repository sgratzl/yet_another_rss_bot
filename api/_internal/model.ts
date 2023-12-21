import type { ObjectId } from 'mongodb';

export interface IRSSFeed {
  _id?: ObjectId;

  chatId: number;
  url: string;
  previews: boolean;
  instantView?: string;
  noDetails?: boolean;

  frequency: 'asap' | 'hourly' | 'daily';


  lastUpdateTime: number;
}

export function createFeed(url: string, chatId: number): IRSSFeed {
  return {
    chatId,
    url,
    previews: false,
    frequency: 'hourly',

    lastUpdateTime: 0
  };
}
