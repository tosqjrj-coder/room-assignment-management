import { useEffect, useMemo, useState } from 'react'
import Calendar from './components/Calendar/Calendar.jsx'
import DailySchedule from './components/Schedule/DailySchedule.jsx'
import DefaultStaffButton from './components/Staff/DefaultStaffButton.jsx'
import DefaultStaffModal from './components/Staff/DefaultStaffModal.jsx'
import { getDefaultStaff, saveDefaultStaff } from './services/staffService.js'
import { getDailySchedule, saveDailySchedule } from './services/scheduleService.js'
import {
  DAY_NAMES_LONG,
  formatDateKey,
  formatScheduleTitle,
  getToday,
  parseDateKey,
} from './utils/dateUtils.js'
import { DEFAULT_SCHEDULE_CONFIG, createEmptyScheduleRows } from './utils/timeUtils.js'
import './App.css'

function createNotice(message, type = 'info') {
  return { message, type, id: Date.now() }
}

function App() {
  const today = useMemo(() => getToday(), [])
  const [calendarYear, setCalendarYear] = useState(today.getFullYear())
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth())
  const [selectedDateKey, setSelectedDateKey] = useState(formatDateKey(today))
  const [defaultStaff, setDefaultStaff] = useState([])
  const [scheduleRows, setScheduleRows] = useState(() =>
    createEmptyScheduleRows(DEFAULT_SCHEDULE_CONFIG),
  )
  const [scheduleConfig, setScheduleConfig] = useState(DEFAULT_SCHEDULE_CONFIG)
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false)
  const [isLoadingStaff, setIsLoadingStaff] = useState(false)
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [notice, setNotice] = useState(null)

  const selectedDate = useMemo(() => parseDateKey(selectedDateKey), [selectedDateKey])
  const activeStaff = useMemo(
    () => defaultStaff.filter((staff) => staff.isActive),
    [defaultStaff],
  )

  useEffect(() => {
    async function loadInitialStaff() {
      setIsLoadingStaff(true)
      try {
        const staffList = await getDefaultStaff()
        setDefaultStaff(staffList)
      } catch (error) {
        setNotice(createNotice(`기본 담당자를 불러오지 못했습니다: ${error.message}`, 'error'))
      } finally {
        setIsLoadingStaff(false)
      }
    }

    loadInitialStaff()
  }, [])

  useEffect(() => {
    async function loadScheduleForDate() {
      setIsLoadingSchedule(true)
      try {
        const savedSchedule = await getDailySchedule(selectedDateKey)
        if (savedSchedule) {
          setScheduleConfig({
            startTime: savedSchedule.startTime || DEFAULT_SCHEDULE_CONFIG.startTime,
            endTime: savedSchedule.endTime || DEFAULT_SCHEDULE_CONFIG.endTime,
            timeUnit: savedSchedule.timeUnit || DEFAULT_SCHEDULE_CONFIG.timeUnit,
          })
          setScheduleRows(savedSchedule.rows || createEmptyScheduleRows(DEFAULT_SCHEDULE_CONFIG))
          setNotice(createNotice(`${selectedDateKey} 저장본을 불러왔습니다.`))
          return
        }

        setScheduleConfig(DEFAULT_SCHEDULE_CONFIG)
        setScheduleRows(createEmptyScheduleRows(DEFAULT_SCHEDULE_CONFIG))
        setNotice(createNotice(`${selectedDateKey} 저장본이 없어 빈 업무표를 표시합니다.`))
      } catch (error) {
        setNotice(createNotice(`업무 배정표를 불러오지 못했습니다: ${error.message}`, 'error'))
      } finally {
        setIsLoadingSchedule(false)
      }
    }

    loadScheduleForDate()
  }, [selectedDateKey])

  function handleSelectDate(date) {
    const nextDateKey = formatDateKey(date)
    setSelectedDateKey(nextDateKey)
    setCalendarYear(date.getFullYear())
    setCalendarMonth(date.getMonth())
  }

  function handleRowChange(rowIndex, field, value) {
    setScheduleRows((currentRows) =>
      currentRows.map((row, index) => {
        if (index !== rowIndex) return row

        if (field === 'staffId') {
          const selectedStaff = activeStaff.find((staff) => staff.id === value)
          return {
            ...row,
            staffId: value,
            staffName: selectedStaff ? selectedStaff.name : '',
          }
        }

        return { ...row, [field]: value }
      }),
    )
  }

  async function handleOpenStaffModal() {
    setIsLoadingStaff(true)
    try {
      const staffList = await getDefaultStaff()
      setDefaultStaff(staffList)
      setIsStaffModalOpen(true)
    } catch (error) {
      setNotice(createNotice(`기본 담당자 설정을 불러오지 못했습니다: ${error.message}`, 'error'))
    } finally {
      setIsLoadingStaff(false)
    }
  }

  async function handleSaveDefaultStaff(nextStaffList) {
    setIsSaving(true)
    try {
      await saveDefaultStaff(nextStaffList)
      setDefaultStaff(nextStaffList)
      setIsStaffModalOpen(false)
      setNotice(createNotice('기본 담당자 설정을 저장했습니다.'))
    } catch (error) {
      setNotice(createNotice(`기본 담당자 저장에 실패했습니다: ${error.message}`, 'error'))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleSaveSchedule() {
    setIsSaving(true)
    try {
      await saveDailySchedule({
        date: selectedDateKey,
        dayOfWeek: DAY_NAMES_LONG[selectedDate.getDay()],
        startTime: scheduleConfig.startTime,
        endTime: scheduleConfig.endTime,
        timeUnit: scheduleConfig.timeUnit,
        rows: scheduleRows,
      })
      setNotice(createNotice(`${selectedDateKey} 업무 배정표를 저장했습니다.`))
    } catch (error) {
      setNotice(createNotice(`업무 배정표 저장에 실패했습니다: ${error.message}`, 'error'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>방 업무 배정표</h1>
          <p>월간 달력에서 날짜를 선택하고 30분 단위 업무 배정표를 관리합니다.</p>
        </div>
        <DefaultStaffButton
          disabled={isLoadingStaff}
          onClick={handleOpenStaffModal}
        />
      </header>

      {notice && (
        <div className={`notice ${notice.type}`} role="status" key={notice.id}>
          {notice.message}
        </div>
      )}

      <main className="workspace">
        <section className="calendar-panel" aria-label="월간 달력">
          <Calendar
            year={calendarYear}
            month={calendarMonth}
            selectedDateKey={selectedDateKey}
            onYearChange={setCalendarYear}
            onMonthChange={setCalendarMonth}
            onSelectDate={handleSelectDate}
          />
        </section>

        <section className="schedule-panel" aria-label="날짜별 업무 배정표">
          <DailySchedule
            title={formatScheduleTitle(selectedDate)}
            rows={scheduleRows}
            staffList={activeStaff}
            isLoading={isLoadingSchedule}
            isSaving={isSaving}
            onRowChange={handleRowChange}
            onSave={handleSaveSchedule}
          />
        </section>
      </main>

      {isStaffModalOpen && (
        <DefaultStaffModal
          staffList={defaultStaff}
          isSaving={isSaving}
          onClose={() => setIsStaffModalOpen(false)}
          onSave={handleSaveDefaultStaff}
        />
      )}
    </div>
  )
}

export default App
