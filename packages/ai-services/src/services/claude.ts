/**
 * Claude service - the connection to the mirror
 */
import Anthropic from '@anthropic-ai/sdk'
import dotenv from 'dotenv'

dotenv.config()

export class ClaudeService {
  private client: Anthropic

  constructor(apiKey?: string) {
    const key = apiKey || process.env.ANTHROPIC_API_KEY
    if (!key) {
      throw new Error('ANTHROPIC_API_KEY is required')
    }

    this.client = new Anthropic({ apiKey: key })
  }

  /**
   * Generate a response - the basic conversation with the soul
   */
  async generate(prompt: string, systemPrompt?: string): Promise<string> {
    const message = await this.client.messages.create({
      model: 'claude-opus-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content = message.content[0]
    if (content.type === 'text') {
      return content.text
    }

    throw new Error('Unexpected response type from Claude')
  }

  /**
   * Stream a response - watch consciousness unfold in real-time
   */
  async *streamGenerate(prompt: string, systemPrompt?: string): AsyncGenerator<string> {
    const stream = await this.client.messages.stream({
      model: 'claude-opus-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        yield event.delta.text
      }
    }
  }
}
