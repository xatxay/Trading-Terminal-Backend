import OpenAI from 'openai';

class OpenAiAnalyze {
  private openai: OpenAI;
  private promptContent: string;
  private newsHeadline: string;
  private systemContent: string;
  private promptContentWithTicker: string;

  constructor(apiKey: string, newsHeadline: string) {
    this.promptContent = process.env.CONTENT;
    this.promptContentWithTicker = process.env.CONTENTWITHTICKER;
    this.openai = new OpenAI({ apiKey: apiKey });
    this.newsHeadline = newsHeadline;
    this.systemContent = process.env.SYSTEMCONTENT;
  }

  public callOpenAi = async (ticker?: string[]): Promise<string> => {
    try {
      const completion = await this.openai.chat.completions.create({
        messages: [
          { role: 'system', content: this.systemContent },
          {
            role: 'user',
            content: ticker
              ? `${this.promptContentWithTicker} ${ticker} , news headline: ${this.newsHeadline}.`
              : `${this.promptContent} ${this.newsHeadline}`,
          },
        ],
        model: 'gpt-4-1106-preview',
        temperature: 0.2,
      });
      ticker
        ? console.log(
            `${this.promptContentWithTicker} ${ticker} , news headline: ${this.newsHeadline}.`,
          )
        : console.log(`${this.promptContent} ${this.newsHeadline}`);
      return completion.choices[0].message.content;
    } catch (err) {
      console.error('Error getting chatgpt response: ', err);
      throw err;
    }
  };
}

export default OpenAiAnalyze;
