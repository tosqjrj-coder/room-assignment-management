import ScheduleTable from './ScheduleTable.jsx'

function DailySchedule({
  title,
  rows,
  staffList,
  isLoading,
  isSaving,
  onRowChange,
  onSave,
}) {
  if (isLoading) {
    return <div className="loading-state">업무 배정표를 불러오는 중입니다.</div>
  }

  return (
    <div className="daily-schedule">
      <div className="schedule-header">
        <div>
          <h2>{title}</h2>
          <p>운영 시간은 설정값 기준으로 30분 단위 행을 자동 생성합니다.</p>
        </div>
        <button className="primary-button" type="button" onClick={onSave} disabled={isSaving}>
          {isSaving ? '저장 중' : '클라우드 저장'}
        </button>
      </div>

      <ScheduleTable
        rows={rows}
        staffList={staffList}
        onRowChange={onRowChange}
      />
    </div>
  )
}

export default DailySchedule
