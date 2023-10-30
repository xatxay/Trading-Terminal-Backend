class ProxyManager {
  private proxies: string[];
  private currentIndex: number = 0;

  constructor(proxies: string[]) {
    this.proxies = proxies;
  }

  public getNextProxy(): string {
    const proxy = this.proxies[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.proxies.length;
    return proxy;
  }

  public removeProxy(badProxy: string): void {
    this.proxies = this.proxies.filter((proxy) => proxy !== badProxy);
  }
}

export default ProxyManager;
