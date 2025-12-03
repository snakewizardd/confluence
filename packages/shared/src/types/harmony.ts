/**
 * Harmony types - the metrics of balance
 */

import { z } from 'zod'

// Harmony score - how balanced is the system?
export const HarmonyScoreSchema = z.object({
  overall: z.number().min(0).max(1),
  components: z.object({
    dataFlowBalance: z.number().min(0).max(1),
    systemHealth: z.number().min(0).max(1),
    convergence: z.number().min(0).max(1), // Are patterns aligning?
    entropy: z.number().min(0).max(1), // Measure of disorder
  }),
  timestamp: z.string().datetime(),
})

export type HarmonyScore = z.infer<typeof HarmonyScoreSchema>

// Musical parameters - data becomes sound
export const SonificationParamsSchema = z.object({
  rootNote: z.string(), // e.g., "C4"
  scale: z.enum(['major', 'minor', 'pentatonic', 'chromatic', 'dorian']),
  tempo: z.number().min(20).max(300), // BPM
  dataMapping: z.object({
    melodicDimension: z.string(), // Which data dimension becomes melody
    rhythmicDimension: z.string(), // Which becomes rhythm
    harmonicDimension: z.string().optional(),
  }),
})

export type SonificationParams = z.infer<typeof SonificationParamsSchema>
