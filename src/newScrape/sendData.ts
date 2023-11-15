// import EventEmitter from 'events';
// import TreeNews from './treeNews.js';
// import { BybitPrice } from './getPrice.js';
// import { BothData, TreeNewsMessage } from '../interface.js';

// class DataCombine extends EventEmitter {
//   private treeNews: TreeNews;
//   private bybitPercentage: BybitPrice;
//   private bothData: BothData;

//   constructor(treeNews: TreeNews, bybitPercentage: BybitPrice) {
//     super();
//     this.treeNews = treeNews;
//     this.bybitPercentage = bybitPercentage;
//     this.bothData = {
//       news: null,
//       price: [],
//     };
//     this.setupListener();
//   }

//   private setupListener(): void {
//     this.treeNews.on('news', (data: TreeNewsMessage) => {
//       this.bothData.news = data;
//       data.suggestions.map((coin) => {
//         console.log('coins: ', coin);
//         this.bybitPercentage.subscribeV5(coin);
//       });
//       //   console.log('this.news: ', this.bothData);
//     });
//     this.bybitPercentage.on('percentage', (priceData) => {
//       this.bothData.price = this.bothData.price.map((percentage) => ({
//         ...percentage,
//         percentage: priceData.percentage,
//       }));
//       //   console.log('this.percentage: ', this.bothData);
//       if (this.bothData.price !== null) {
//         this.emit('combineData', this.bothData);
//       }
//     });
//   }
// }

// export default DataCombine;
