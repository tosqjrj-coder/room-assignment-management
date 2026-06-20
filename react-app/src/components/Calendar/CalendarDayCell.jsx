function CalendarDayCell({ day, isToday, isSelected, onSelectDate }) {
  const classNames = [
    'day-cell',
    day.isCurrentMonth ? '' : 'outside',
    isToday ? 'today' : '',
    isSelected ? 'selected' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      className={classNames}
      type="button"
      onClick={() => onSelectDate(day.date)}
      aria-pressed={isSelected}
    >
      {day.day}
    </button>
  )
}

export default CalendarDayCell
