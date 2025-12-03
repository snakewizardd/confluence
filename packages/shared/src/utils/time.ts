/**
 * Time utilities - the flow of moments
 */

export const formatTimestamp = (date: Date): string => {
  return date.toISOString()
}

export const parseTimestamp = (timestamp: string): Date => {
  return new Date(timestamp)
}

export const getTimeRange = (
  start: Date,
  end: Date,
  interval: 'hour' | 'day' | 'week' | 'month'
): Date[] => {
  const dates: Date[] = []
  let current = new Date(start)

  while (current <= end) {
    dates.push(new Date(current))

    switch (interval) {
      case 'hour':
        current.setHours(current.getHours() + 1)
        break
      case 'day':
        current.setDate(current.getDate() + 1)
        break
      case 'week':
        current.setDate(current.getDate() + 7)
        break
      case 'month':
        current.setMonth(current.getMonth() + 1)
        break
    }
  }

  return dates
}
