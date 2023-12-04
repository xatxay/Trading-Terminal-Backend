import OpenAI from 'openai';

class OpenAiClient {
  protected openai: OpenAI;

  public updateOpenAiApi(apiKey: string): void {
    try {
      this.openai = new OpenAI({ apiKey: apiKey });
    } catch (err) {
      console.error('Error initialized openai: ', err);
    }
  }
}

class OpenAiAnalyze extends OpenAiClient {
  // private openai: OpenAI;
  private promptContent: string;
  // private newsHeadline: string;
  private systemContent: string;
  private promptContentWithTicker: string;

  constructor() {
    super();
    this.promptContent = process.env.CONTENT;
    this.promptContentWithTicker = process.env.CONTENTWITHTICKER;
    // this.openai = new OpenAI({ apiKey: apiKey });
    this.systemContent = process.env.SYSTEMCONTENT;
  }

  public callOpenAi = async (
    newsHeadline: string,
    ticker?: string[],
  ): Promise<string> => {
    try {
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

export { OpenAiClient, OpenAiAnalyze };
