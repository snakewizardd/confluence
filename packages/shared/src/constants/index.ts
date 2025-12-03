/**
 * Constants - the unchanging truths
 */

/**
 * Shared library version.
 * Updated when breaking changes occur.
 */
export const VERSION = '0.1.0'

/**
 * API version for backend endpoints.
 */
export const API_VERSION = 'v1'

/**
 * Mapping of data source codes to their full names.
 * These are the wells from which our data flows.
 */
export const DATA_SOURCES = {
  USDA: 'United States Department of Agriculture',
  NOAA: 'National Oceanic and Atmospheric Administration',
  NASA: 'National Aeronautics and Space Administration',
  INTERNAL: 'Internal System',
  SENSOR: 'IoT Sensors',
} as const

/**
 * Musical scale definitions as semitone intervals from root.
 * Each array represents the intervals that define a scale's character.
 */
export const MUSICAL_SCALES = {
  /** Major scale - bright, consonant */
  major: [0, 2, 4, 5, 7, 9, 11],
  /** Natural minor scale - darker, introspective */
  minor: [0, 2, 3, 5, 7, 8, 10],
  /** Pentatonic scale - universal, ancient */
  pentatonic: [0, 2, 4, 7, 9],
  /** Chromatic scale - all twelve tones */
  chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  /** Dorian mode - jazz, folk, balance of light and dark */
  dorian: [0, 2, 3, 5, 7, 9, 10],
} as const

/**
 * Thresholds for interpreting harmony scores.
 * These define the boundaries between states of balance.
 */
export const HARMONY_THRESHOLDS = {
  /** Excellent harmony (>= 0.9) */
  EXCELLENT: 0.9,
  /** Good harmony (>= 0.7) */
  GOOD: 0.7,
  /** Moderate harmony (>= 0.5) */
  MODERATE: 0.5,
  /** Poor harmony (>= 0.3) */
  POOR: 0.3,
} as const
