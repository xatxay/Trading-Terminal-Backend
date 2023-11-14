// import EventEmitter from 'events';
// import TreeNews from './treeNews.js';
// import { BybitPrice } from './getPrice.js';

// class DataCombine extends EventEmitter {
//   private treeNews: TreeNews;
//   private bybitPercentage: BybitPrice;
//   private bothData;

//   constructor(treeNews: TreeNews, bybitPercentage: BybitPrice) {
//     super();
//     this.treeNews = treeNews;
//     this.bybitPercentage = bybitPercentage;
//     this.bothData = {
//       news: null,
//       price: null,
//     };
//     this.setupListener();
//     this.combineData();
//   }

//   private setupListener(): void {
//     this.treeNews.on('news', (data) => {
//       this.bothData.news = data;
//     });
//     this.bybitPercentage.on('percentage', (priceData) => {
//       this.bothData.price = priceData;
//     });
//   }

//   private combineData(): void {
//     this.emit('combineData', this.bothData);
//   }
// }

// export default DataCombine;
