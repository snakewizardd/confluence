/**
 * Data types - the shapes of nature's information
 */

import { z } from 'zod'

/**
 * A single point in time with a measured value.
 * Represents a moment in the river of data.
 */
export const TimeSeriesDataPointSchema = z.object({
  /** ISO 8601 timestamp of the measurement */
  timestamp: z.string().datetime(),
  /** Numeric value of the measurement */
  value: z.number(),
  /** Optional metadata about this specific data point */
  metadata: z.record(z.unknown()).optional(),
})

/**
 * A single point in a time series with timestamp, value, and optional metadata.
 */
export type TimeSeriesDataPoint = z.infer<typeof TimeSeriesDataPointSchema>

/**
 * A complete time series dataset.
 * The pattern of change - how values flow through time.
 */
export const TimeSeriesSchema = z.object({
  /** Human-readable name of the time series */
  name: z.string(),
  /** Optional description of what this series measures */
  description: z.string().optional(),
  /** Unit of measurement (e.g., "cm", "°C", "kg/ha") */
  unit: z.string().optional(),
  /** Data source - where this information originates */
  source: z.enum(['USDA', 'NOAA', 'NASA', 'INTERNAL', 'SENSOR']),
  /** Array of data points making up the series */
  data: z.array(TimeSeriesDataPointSchema),
})

/**
 * A time series dataset with name, source, and array of timestamped values.
 */
export type TimeSeries = z.infer<typeof TimeSeriesSchema>

/**
 * A geographic point on Earth.
 * The location of phenomena - where things happen in space.
 */
export const GeoPointSchema = z.object({
  /** Latitude in decimal degrees (-90 to 90) */
  latitude: z.number().min(-90).max(90),
  /** Longitude in decimal degrees (-180 to 180) */
  longitude: z.number().min(-180).max(180),
  /** Optional elevation in meters above sea level */
  elevation: z.number().optional(),
})

/**
 * A geographic coordinate with latitude, longitude, and optional elevation.
 */
export type GeoPoint = z.infer<typeof GeoPointSchema>

/**
 * Statistical summary of a dataset.
 * The patterns we extract - the essence of distribution.
 */
export const StatisticalSummarySchema = z.object({
  /** Arithmetic mean (average) */
  mean: z.number(),
  /** Median value (50th percentile) */
  median: z.number(),
  /** Standard deviation (measure of spread) */
  stdDev: z.number(),
  /** Minimum value in dataset */
  min: z.number(),
  /** Maximum value in dataset */
  max: z.number(),
  /** Optional distribution type (e.g., "normal", "poisson", "exponential") */
  distribution: z.string().optional(),
})

/**
 * Statistical summary containing mean, median, standard deviation, and range.
 */
export type StatisticalSummary = z.infer<typeof StatisticalSummarySchema>
