import {ObjectID} from 'mongodb';

export interface IRSSFeed {
  _id?: ObjectID;

  chatId: number;
  url: string;
  previews: boolean;
  instantView?: string;

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
