export const DEFAULT_SCHEDULE_CONFIG = {
  startTime: '10:00',
  endTime: '22:00',
  timeUnit: 30,
}

export function timeToMinutes(time) {
  const [hour, minute] = time.split(':').map(Number)
  return hour * 60 + minute
}

export function minutesToTime(minutes) {
  const hour = Math.floor(minutes / 60)
  const minute = minutes % 60
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

export function createTimeSlots({ startTime, endTime, timeUnit }) {
  const slots = []
  const start = timeToMinutes(startTime)
  const end = timeToMinutes(endTime)

  for (let minute = start; minute < end; minute += timeUnit) {
    slots.push(minutesToTime(minute))
  }

  return slots
}

export function createEmptyScheduleRows(config = DEFAULT_SCHEDULE_CONFIG) {
  return createTimeSlots(config).map((time) => ({
    time,
    staffId: '',
    staffName: '',
    task: '',
    room: '',
    memo: '',
  }))
}
