/**
 * API types - the shapes of communication
 */

import { z } from 'zod'

// Standard API response wrapper
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.string().optional(),
  timestamp: z.string().datetime(),
})

export type ApiResponse<T = unknown> = {
  success: boolean
  data?: T
  error?: string
  timestamp: string
}

// Pagination
export const PaginationParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
})

export type PaginationParams = z.infer<typeof PaginationParamsSchema>

export const PaginatedResponseSchema = z.object({
  items: z.array(z.unknown()),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
  hasMore: z.boolean(),
})

export type PaginatedResponse<T = unknown> = {
  items: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}
