/**
 * Poetry service - words as manifestation of data's soul
 */
import { ClaudeService } from './claude'

export class PoetryService {
  private claude: ClaudeService

  constructor(claude?: ClaudeService) {
    this.claude = claude || new ClaudeService()
  }

  /**
   * Compose a poem from data patterns
   */
  async compose(inspiration: {
    theme?: string
    dataValues?: number[]
    pattern?: string
  }): Promise<string> {
    const systemPrompt = `You are a poet within the Confluence system.
You write short, contemplative poems that bridge data and spirit.
Your style is clear, imagistic, profound but not pretentious.
Each poem is 3-5 stanzas. Use concrete images from nature and mathematics.`

    const prompt = this.buildPoetryPrompt(inspiration)

    return await this.claude.generate(prompt, systemPrompt)
  }

  /**
   * Generate a haiku - the essence distilled
   */
  async haiku(observation: string): Promise<string> {
    const systemPrompt = `You are a haiku master within Confluence.
Write a single haiku (5-7-5) that captures the essence of the observation.
No explanation, just the haiku.`

    return await this.claude.generate(observation, systemPrompt)
  }

  private buildPoetryPrompt(inspiration: {
    theme?: string
    dataValues?: number[]
    pattern?: string
  }): string {
    let prompt = 'Compose a poem inspired by:\n\n'

    if (inspiration.theme) {
      prompt += `Theme: ${inspiration.theme}\n`
    }

    if (inspiration.pattern) {
      prompt += `Pattern observed: ${inspiration.pattern}\n`
    }

    if (inspiration.dataValues && inspiration.dataValues.length > 0) {
      const stats = this.calculateSimpleStats(inspiration.dataValues)
      prompt += `Data pattern: ${stats}\n`
    }

    prompt += '\nWrite a poem that makes the invisible visible, the abstract concrete.'

    return prompt
  }

  private calculateSimpleStats(values: number[]): string {
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const sorted = [...values].sort((a, b) => a - b)
    const min = sorted[0]
    const max = sorted[sorted.length - 1]
    const range = max - min

    return `mean=${mean.toFixed(2)}, range=${range.toFixed(2)}, points=${values.length}`
  }
}
