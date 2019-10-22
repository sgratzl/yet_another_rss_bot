
export interface IRSSFeed {
  url: string;
  chatId: string;

  intervalUnit: 'seconds' | 'minutes' | 'hours' | 'days' | 'months' | 'years';
  interval: number;

  lastUpdateTime: number;
}

export interface IRSSSession {
  feeds: IRSSFeed[];
}
