import { getYearOptions } from '../../utils/dateUtils.js'

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => index)

function CalendarHeader({ year, month, onYearChange, onMonthChange, onPrev, onNext }) {
  return (
    <div className="calendar-header">
      <button className="icon-button" type="button" onClick={onPrev} aria-label="이전 달">
        ‹
      </button>

      <select
        aria-label="연도 선택"
        value={year}
        onChange={(event) => onYearChange(Number(event.target.value))}
      >
        {getYearOptions().map((optionYear) => (
          <option key={optionYear} value={optionYear}>
            {optionYear}년
          </option>
        ))}
      </select>

      <select
        aria-label="월 선택"
        value={month}
        onChange={(event) => onMonthChange(Number(event.target.value))}
      >
        {MONTH_OPTIONS.map((optionMonth) => (
          <option key={optionMonth} value={optionMonth}>
            {optionMonth + 1}월
          </option>
        ))}
      </select>

      <button className="icon-button" type="button" onClick={onNext} aria-label="다음 달">
        ›
      </button>
    </div>
  )
}

export default CalendarHeader
