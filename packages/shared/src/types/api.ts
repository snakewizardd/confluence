/**
 * API types - the shapes of communication
 *
 * How different parts of the system speak to each other.
 */

import { z } from 'zod'

/**
 * Standard API response wrapper.
 * All API responses follow this structure for consistency.
 */
export const ApiResponseSchema = z.object({
  /** Whether the request succeeded */
  success: z.boolean(),
  /** Response data (type varies by endpoint) */
  data: z.unknown().optional(),
  /** Error message if request failed */
  error: z.string().optional(),
  /** ISO 8601 timestamp of when response was generated */
  timestamp: z.string().datetime(),
})

/**
 * Standard wrapper for all API responses.
 * Generic type T specifies the shape of the data field.
 */
export type ApiResponse<T = unknown> = {
  success: boolean
  data?: T
  error?: string
  timestamp: string
}

/**
 * Parameters for paginated requests.
 * Controls which page of results to return.
 */
export const PaginationParamsSchema = z.object({
  /** Page number (1-indexed) */
  page: z.number().int().positive().default(1),
  /** Number of items per page (max 100) */
  limit: z.number().int().positive().max(100).default(20),
})

/**
 * Pagination parameters for list endpoints.
 */
export type PaginationParams = z.infer<typeof PaginationParamsSchema>

/**
 * Response structure for paginated endpoints.
 * Includes items and metadata about the pagination state.
 */
export const PaginatedResponseSchema = z.object({
  /** Array of items for this page */
  items: z.array(z.unknown()),
  /** Total number of items across all pages */
  total: z.number().int(),
  /** Current page number */
  page: z.number().int(),
  /** Items per page */
  limit: z.number().int(),
  /** Whether there are more pages available */
  hasMore: z.boolean(),
})

/**
 * Paginated list response with items and pagination metadata.
 * Generic type T specifies the type of items in the array.
 */
export type PaginatedResponse<T = unknown> = {
  items: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}
