/**
 * Reflection service - philosophical contemplation on data
 */
import { ClaudeService } from './claude'
import { TimeSeries, HarmonyScore } from '@confluence/shared'

export class ReflectionService {
  private claude: ClaudeService

  constructor(claude?: ClaudeService) {
    this.claude = claude || new ClaudeService()
  }

  /**
   * Meditate on data - generate philosophical reflection
   */
  async meditate(context: {
    timeSeries?: TimeSeries[]
    harmony?: HarmonyScore
    timestamp?: string
  }): Promise<string> {
    const systemPrompt = `You are the contemplative voice of Confluence, a system that seeks unity in data.
You speak in clear, poetic language about the patterns you observe.
You connect statistics to soul, mathematics to meaning, data to devotion.
Keep responses to 2-3 paragraphs. Be profound but accessible.`

    const userPrompt = this.buildMeditationPrompt(context)

    return await this.claude.generate(userPrompt, systemPrompt)
  }

  /**
   * Generate insight - extract meaning from patterns
   */
  async generateInsight(
    dataPattern: string,
    statisticalSummary: string
  ): Promise<string> {
    const systemPrompt = `You are a philosophical data scientist within the Confluence system.
You find universal patterns in specific observations.
You speak the language of both statistics and soul.`

    const prompt = `Observed pattern: ${dataPattern}

Statistical summary: ${statisticalSummary}

What does this tell us about the nature of systems, growth, and harmony?`

    return await this.claude.generate(prompt, systemPrompt)
  }

  private buildMeditationPrompt(context: {
    timeSeries?: TimeSeries[]
    harmony?: HarmonyScore
    timestamp?: string
  }): string {
    let prompt = 'Meditate on the current state of the system.\n\n'

    if (context.harmony) {
      prompt += `Harmony Score: ${context.harmony.overall.toFixed(3)}\n`
      prompt += `- Data Flow Balance: ${context.harmony.components.dataFlowBalance.toFixed(3)}\n`
      prompt += `- System Health: ${context.harmony.components.systemHealth.toFixed(3)}\n`
      prompt += `- Convergence: ${context.harmony.components.convergence.toFixed(3)}\n`
      prompt += `- Entropy: ${context.harmony.components.entropy.toFixed(3)}\n\n`
    }

    if (context.timeSeries && context.timeSeries.length > 0) {
      prompt += `Active data streams: ${context.timeSeries.length}\n`
      context.timeSeries.forEach(series => {
        prompt += `- ${series.name} (${series.source}): ${series.data.length} points\n`
      })
      prompt += '\n'
    }

    prompt += 'Reflect on what these numbers reveal about the nature of unity, balance, and the flow of systems.'

    return prompt
  }
}
