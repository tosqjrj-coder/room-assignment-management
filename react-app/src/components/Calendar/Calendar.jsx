import CalendarGrid from './CalendarGrid.jsx'
import CalendarHeader from './CalendarHeader.jsx'

function Calendar({
  year,
  month,
  selectedDateKey,
  onYearChange,
  onMonthChange,
  onSelectDate,
}) {
  function moveMonth(offset) {
    const next = new Date(year, month + offset, 1)
    onYearChange(next.getFullYear())
    onMonthChange(next.getMonth())
  }

  return (
    <div className="calendar">
      <CalendarHeader
        year={year}
        month={month}
        onYearChange={onYearChange}
        onMonthChange={onMonthChange}
        onPrev={() => moveMonth(-1)}
        onNext={() => moveMonth(1)}
      />
      <CalendarGrid
        year={year}
        month={month}
        selectedDateKey={selectedDateKey}
        onSelectDate={onSelectDate}
      />
    </div>
  )
}

export default Calendar
