import OpenAI from 'openai';
import { appEmit } from './utils.js';

class OpenAiAnalyze {
  private openai: OpenAI | null = null;
  private promptContent: string;
  private systemContent: string;
  private promptContentWithTicker: string;

  constructor() {
    this.promptContent = process.env.CONTENT;
    this.promptContentWithTicker = process.env.CONTENTWITHTICKER;
    this.systemContent = process.env.SYSTEMCONTENT;
    appEmit.on('openai', (apiKey: string) => {
      console.log('emitting');
      if (apiKey) {
        console.log('checking openai***', apiKey);

        this.updateOpenAiClient(apiKey);
      }
    });
  }

  private hasOpenApi = (): boolean => {
    return this.openai !== null;
  };

  private updateOpenAiClient(apiKey: string): void {
    this.openai = new OpenAI({ apiKey: apiKey });
    console.log('updateddd: ', this.openai);
  }

  public callOpenAi = async (
    newsHeadline: string,
    ticker?: string[],
  ): Promise<string> => {
    try {
      const hasApi = this.hasOpenApi();
      console.log('hasopenapi: ', hasApi);
      if (!hasApi) {
        console.log('nulllllllllll');
        return null;
      }
      const completion = await this.openai.chat.completions.create({
        messages: [
          { role: 'system', content: this.systemContent },
          {
            role: 'user',
            content: ticker
              ? `${this.promptContentWithTicker} ${ticker} , news headline: ${newsHeadline}.`
              : `${this.promptContent} ${newsHeadline}`,
          },
        ],
        model: 'gpt-4-1106-preview',
      });
      ticker
        ? console.log(
            `${this.promptContentWithTicker} ${ticker} , news headline: ${newsHeadline}.`,
          )
        : console.log(`${this.promptContent} ${newsHeadline}`);
      return completion.choices[0].message.content;
    } catch (err) {
      console.error('Error getting chatgpt response: ', err);
      throw err;
    }
  };
}

export default OpenAiAnalyze;
