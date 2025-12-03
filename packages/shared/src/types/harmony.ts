/**
 * Harmony types - the metrics of balance
 *
 * Harmony is not uniformity—it is coherence amid diversity.
 * These types measure how well the system flows as one.
 */

import { z } from 'zod'

/**
 * A harmony score measuring system balance.
 * Quantifies how well different parts work together as a unified whole.
 */
export const HarmonyScoreSchema = z.object({
  /** Overall harmony score (0 = dissonance, 1 = perfect harmony) */
  overall: z.number().min(0).max(1),
  /** Individual components contributing to overall harmony */
  components: z.object({
    /** Balance of data flow - are inputs and outputs in equilibrium? */
    dataFlowBalance: z.number().min(0).max(1),
    /** System health - are all services functioning properly? */
    systemHealth: z.number().min(0).max(1),
    /** Convergence - are patterns aligning and stabilizing? */
    convergence: z.number().min(0).max(1),
    /** Entropy - measure of disorder (inverted: 1 = low entropy) */
    entropy: z.number().min(0).max(1),
  }),
  /** When this harmony score was calculated */
  timestamp: z.string().datetime(),
})

/**
 * Represents the harmony state of the system at a point in time.
 * Includes overall score and breakdown of contributing components.
 */
export type HarmonyScore = z.infer<typeof HarmonyScoreSchema>

/**
 * Musical parameters for sonification.
 * Data becomes sound - these parameters define how numbers transform into melody.
 */
export const SonificationParamsSchema = z.object({
  /** Musical root note (e.g., "C4", "A3", "F#5") */
  rootNote: z.string(),
  /** Musical scale to use for pitch mapping */
  scale: z.enum(['major', 'minor', 'pentatonic', 'chromatic', 'dorian']),
  /** Tempo in beats per minute */
  tempo: z.number().min(20).max(300),
  /** Mapping of data dimensions to musical dimensions */
  dataMapping: z.object({
    /** Which data dimension becomes the melody */
    melodicDimension: z.string(),
    /** Which data dimension becomes the rhythm */
    rhythmicDimension: z.string(),
    /** Optional dimension for harmony/chords */
    harmonicDimension: z.string().optional(),
  }),
})

/**
 * Configuration for transforming data into sound.
 * Defines the musical parameters and dimension mappings.
 */
export type SonificationParams = z.infer<typeof SonificationParamsSchema>
