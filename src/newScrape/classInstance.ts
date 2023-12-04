import FrontEndWebsocket from './sendFrontEndData.js';
import BybitTrading from './bybit.js';
import { BybitPrice } from './getPrice.js';
import { OpenAiAnalyze } from './chatgpt.js';

export const bybitAccount = new BybitTrading();
export const bybitWsClient = new BybitPrice();
export const openAiClass = new OpenAiAnalyze();
export const dataFrontEnd = new FrontEndWebsocket();
