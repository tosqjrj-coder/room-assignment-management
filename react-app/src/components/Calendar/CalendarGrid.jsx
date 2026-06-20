import { DAY_NAMES, formatDateKey, getMonthDays, getToday } from '../../utils/dateUtils.js'
import CalendarDayCell from './CalendarDayCell.jsx'

function CalendarGrid({ year, month, selectedDateKey, onSelectDate }) {
  const todayKey = formatDateKey(getToday())
  const days = getMonthDays(year, month)

  return (
    <div className="calendar-grid">
      {DAY_NAMES.map((dayName) => (
        <div className="weekday-label" key={dayName}>
          {dayName}
        </div>
      ))}

      {days.map((day) => (
        <CalendarDayCell
          key={day.dateKey}
          day={day}
          isToday={day.dateKey === todayKey}
          isSelected={day.dateKey === selectedDateKey}
          onSelectDate={onSelectDate}
        />
      ))}
    </div>
  )
}

export default CalendarGrid
