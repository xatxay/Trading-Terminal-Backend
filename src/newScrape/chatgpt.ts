import OpenAI from 'openai';

class OpenAiClient {
  protected openai: OpenAI;

  public updateOpenAiApi(apiKey: string): void {
    if (!apiKey) return;
    try {
      this.openai = new OpenAI({ apiKey: apiKey });
    } catch (err) {
      console.error('Error initialized openai: ', err);
    }
  }
}

class OpenAiAnalyze extends OpenAiClient {
  private promptContent: string;
  private systemContent: string;

  constructor() {
    super();
    this.promptContent = process.env.CONTENT;
    this.systemContent = process.env.SYSTEMCONTENT;
  }

  public callOpenAi = async (
    newsHeadline: string,
    // ticker?: string[],
  ): Promise<string> => {
    try {
      const completion = await this.openai.chat.completions.create({
        messages: [
          { role: 'system', content: this.systemContent },
          {
            role: 'user',
            content: `${this.promptContent} ${newsHeadline}`,
          },
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

export { OpenAiClient, OpenAiAnalyze };
