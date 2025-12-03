/**
 * Types for The Pulse - the first breath of the system
 */

export interface DataPoint {
  timestamp: number
  value: number
}

export interface PulseData {
  growth: DataPoint[]
  flow: DataPoint[]
}
