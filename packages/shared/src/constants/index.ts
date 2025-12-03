/**
 * Constants - the unchanging truths
 */

export const API_VERSION = 'v1'

export const DATA_SOURCES = {
  USDA: 'United States Department of Agriculture',
  NOAA: 'National Oceanic and Atmospheric Administration',
  NASA: 'National Aeronautics and Space Administration',
  INTERNAL: 'Internal System',
  SENSOR: 'IoT Sensors',
} as const

export const MUSICAL_SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  pentatonic: [0, 2, 4, 7, 9],
  chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
} as const

export const HARMONY_THRESHOLDS = {
  EXCELLENT: 0.9,
  GOOD: 0.7,
  MODERATE: 0.5,
  POOR: 0.3,
} as const
