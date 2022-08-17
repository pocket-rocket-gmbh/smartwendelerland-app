import { DateTime, Interval } from 'luxon'
export function useDatetime() {

  const getTimeRangeString = (item:any) => {
    if (item !== null) {
      const startTime = DateTime.fromISO(item.start_time, { locale: 'de-DE' })
      const endTime = DateTime.fromISO(item.end_time, { locale: 'de-DE' })
      const timeRange = Interval.fromDateTimes(startTime, endTime)
      return timeRange.toFormat('MMMM yyyy')
    }
  }

  const parseDatetime = (item:any) => {
    const datetime = DateTime.fromISO(item, { locale: 'de-DE' })
    return datetime.toFormat('dd.MM.yyyy HH:MM')
  }

  const parseDate = (item:any) => {
    const datetime = DateTime.fromISO(item, { locale: 'de-DE' })
    return datetime.toFormat('dd.MM.yyyy')
  }

  const isInPast = (item:any) => {
    const today = DateTime.now()
    const compareableTime = DateTime.fromISO(item, { locale: 'de-DE' })

    return compareableTime <= today
  }

  return {
    getTimeRangeString,
    parseDatetime,
    parseDate,
    isInPast
  }
}
