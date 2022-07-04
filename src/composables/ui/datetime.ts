import { DateTime, Interval } from 'luxon'
export function useDatetime() {

  const getTimeRangeString = (item:any) => {
    if (item !== null) {
      const startTime = DateTime.fromISO(item.start_time)
      const endTime = DateTime.fromISO(item.end_time)
      const timeRange = Interval.fromDateTimes(startTime, endTime)
      return timeRange.toFormat('MMMM yyyy')
    }
  }

  const parseDatetime = (item:any) => {
    const datetime = DateTime.fromISO(item)
    return datetime.toFormat('dd.MM.yyyy HH:MM')
  }

  return {
    getTimeRangeString,
    parseDatetime
  }
}
