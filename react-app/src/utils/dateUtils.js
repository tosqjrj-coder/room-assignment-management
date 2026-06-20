export const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']
export const DAY_NAMES_LONG = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']

function pad(value) {
  return String(value).padStart(2, '0')
}

export function getToday() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

export function formatDateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function isSameDate(left, right) {
  return formatDateKey(left) === formatDateKey(right)
}

export function formatScheduleTitle(date) {
  return `${formatDateKey(date)} (${DAY_NAMES[date.getDay()]}) 업무 배정표`
}

export function getYearOptions(baseYear = getToday().getFullYear(), range = 5) {
  const years = []
  for (let year = baseYear - range; year <= baseYear + range; year += 1) {
    years.push(year)
  }
  return years
}

export function getMonthDays(year, month) {
  const firstDate = new Date(year, month, 1)
  const firstDay = firstDate.getDay()
  const gridStart = new Date(year, month, 1 - firstDay)

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart)
    date.setDate(gridStart.getDate() + index)

    return {
      date,
      dateKey: formatDateKey(date),
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
    }
  })
}
