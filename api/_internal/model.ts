
export interface IRSSFeed {
  uid: string;
  url: string;

  intervalUnit: 'seconds' | 'minutes' | 'hours' | 'days' | 'months' | 'years';
  interval: number;

  lastUpdateTime: number;
  callbackId: string;
}

export interface IRSSSession {
  chatId: number;
  feeds: IRSSFeed[];
}
