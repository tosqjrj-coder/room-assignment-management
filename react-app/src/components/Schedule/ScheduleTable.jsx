import ScheduleRow from './ScheduleRow.jsx'

function ScheduleTable({ rows, staffList, onRowChange }) {
  return (
    <div className="table-wrap">
      <table className="schedule-table">
        <thead>
          <tr>
            <th>시간</th>
            <th>담당자</th>
            <th>업무 내용</th>
            <th>방/공간</th>
            <th>비고</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <ScheduleRow
              key={row.time}
              row={row}
              rowIndex={index}
              staffList={staffList}
              onRowChange={onRowChange}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ScheduleTable
