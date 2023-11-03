import * as dotenv from 'dotenv';
import { Proxy } from '../interface.js';

dotenv.config();

const convertProxiesToString = (): Proxy[] => {
  const proxies = process.env.PROXIES;

  const proxiesJson = JSON.parse(proxies);

  const proxiesString = proxiesJson.map((proxiesString: string) => {
    const [host, port, username, password] = proxiesString.split(':');
    return { host, port, username, password };
  });

  return proxiesString;
};

export default convertProxiesToString;
