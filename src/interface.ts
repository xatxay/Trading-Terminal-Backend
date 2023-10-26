export interface TreeNewsMessage {
  title: string;
  body: string;
  link: string;
  time: number;
  _id: string;
  source: string;
}

export interface UpbitParams {
  search: string;
  page: number;
  per_page: number;
}
