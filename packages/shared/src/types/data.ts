/**
 * Data types - the shapes of nature's information
 */

import { z } from 'zod'

// Time series - the pattern of change
export const TimeSeriesDataPointSchema = z.object({
  timestamp: z.string().datetime(),
  value: z.number(),
  metadata: z.record(z.unknown()).optional(),
})

export type TimeSeriesDataPoint = z.infer<typeof TimeSeriesDataPointSchema>

export const TimeSeriesSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  unit: z.string().optional(),
  source: z.enum(['USDA', 'NOAA', 'NASA', 'INTERNAL', 'SENSOR']),
  data: z.array(TimeSeriesDataPointSchema),
})

export type TimeSeries = z.infer<typeof TimeSeriesSchema>

// Geographic data - the location of phenomena
export const GeoPointSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  elevation: z.number().optional(),
})

export type GeoPoint = z.infer<typeof GeoPointSchema>

// Statistical summary - the patterns we extract
export const StatisticalSummarySchema = z.object({
  mean: z.number(),
  median: z.number(),
  stdDev: z.number(),
  min: z.number(),
  max: z.number(),
  distribution: z.string().optional(), // e.g., "normal", "poisson"
})

export type StatisticalSummary = z.infer<typeof StatisticalSummarySchema>
