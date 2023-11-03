import { Proxy } from '../interface.js';

class ProxyManager {
  private proxies: Proxy[];
  private currentIndex: number = 0;

  constructor(proxies: Proxy[]) {
    this.proxies = proxies;
  }

  public getNextProxy(): Proxy {
    const proxy = this.proxies[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.proxies.length;
    return proxy;
  }

  public removeProxy(badProxy: Proxy): void {
    this.proxies = this.proxies.filter((proxy) => proxy !== badProxy);
  }
}

export default ProxyManager;
