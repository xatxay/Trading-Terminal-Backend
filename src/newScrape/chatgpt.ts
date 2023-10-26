import OpenAI from 'openai';

class OpenAiAnalyze {
  private openai: OpenAI;
  private promptContent: string;
  public newsHeadline: string;

  constructor(apiKey: string, promptContent: string, newsHeadline: string) {
    this.promptContent = promptContent;
    this.openai = new OpenAI({ apiKey: apiKey });
    this.newsHeadline = newsHeadline;
  }

  public callOpenAi = async (): Promise<void> => {
    try {
      const completion = await this.openai.chat.completions.create({
        messages: [
          { role: 'user', content: this.promptContent + this.newsHeadline },
        ],
        model: 'gpt-4',
        temperature: 0,
      });
      console.log(this.promptContent + this.newsHeadline);
      console.log('chatgpt response: ', completion.choices[0].message);
    } catch (err) {
      console.error('Error getting chatgpt response: ', err);
    }
  };
}

export default OpenAiAnalyze;
