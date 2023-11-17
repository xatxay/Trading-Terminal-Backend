import OpenAI from 'openai';

class OpenAiAnalyze {
  private openai: OpenAI;
  private promptContent: string;
  private newsHeadline: string;
  private systemContent: string;

  constructor(apiKey: string, newsHeadline: string) {
    this.promptContent = process.env.CONTENT;
    this.openai = new OpenAI({ apiKey: apiKey });
    this.newsHeadline = newsHeadline;
    this.systemContent = process.env.SYSTEMCONTENT;
  }

  public callOpenAi = async (): Promise<string> => {
    try {
      const completion = await this.openai.chat.completions.create({
        messages: [
          { role: 'system', content: this.systemContent },
          { role: 'user', content: this.promptContent + this.newsHeadline },
        ],
        model: 'gpt-4-1106-preview',
      });
      return completion.choices[0].message.content;
    } catch (err) {
      console.error('Error getting chatgpt response: ', err);
      throw err;
    }
  };
}

export default OpenAiAnalyze;
