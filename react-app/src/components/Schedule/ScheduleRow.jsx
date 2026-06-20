function ScheduleRow({ row, rowIndex, staffList, onRowChange }) {
  function update(field, value) {
    onRowChange(rowIndex, field, value)
  }

  return (
    <tr>
      <td>{row.time}</td>
      <td>
        <select
          value={row.staffId}
          onChange={(event) => update('staffId', event.target.value)}
          aria-label={`${row.time} 담당자`}
        >
          <option value="">선택</option>
          {staffList.map((staff) => (
            <option key={staff.id} value={staff.id}>
              {staff.name}
              {staff.role ? ` · ${staff.role}` : ''}
            </option>
          ))}
        </select>
      </td>
      <td>
        <input
          value={row.task}
          onChange={(event) => update('task', event.target.value)}
          placeholder="업무 내용"
        />
      </td>
      <td>
        <input
          value={row.room}
          onChange={(event) => update('room', event.target.value)}
          placeholder="방/공간"
        />
      </td>
      <td>
        <input
          value={row.memo}
          onChange={(event) => update('memo', event.target.value)}
          placeholder="비고"
        />
      </td>
    </tr>
  )
}

export default ScheduleRow
