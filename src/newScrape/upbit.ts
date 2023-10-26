import axios from 'axios';
import { UpbitParams } from '../interface.js';

class Upbit {
  private url: string;
  private params: UpbitParams;

  constructor() {
    this.url = process.env.UPBIT;
    this.params = {
      search: process.env.UPBITSEARCH,
      page: 1,
      per_page: 3,
    };
  }

  public getListing = async (): Promise<void> => {
    const response = await axios.get(this.url, {
      headers: {
        'accept-language': 'en-KR, en;q=1, en;q=0.1',
      },
      params: this.params,
    });
    console.log(response.data.data.list);
  };
}

export default Upbit;
