function createStaff() {
  return {
    id: `staff_${Date.now()}`,
    name: '',
    role: '',
    isActive: true,
  }
}

function StaffListEditor({ staffList, onChange }) {
  function addStaff() {
    onChange([...staffList, createStaff()])
  }

  function updateStaff(index, field, value) {
    onChange(
      staffList.map((staff, staffIndex) =>
        staffIndex === index ? { ...staff, [field]: value } : staff,
      ),
    )
  }

  function removeStaff(index) {
    onChange(staffList.filter((_, staffIndex) => staffIndex !== index))
  }

  return (
    <div className="staff-editor">
      {staffList.length === 0 && (
        <p className="empty-message">저장된 기본 담당자가 없습니다. 담당자를 추가해주세요.</p>
      )}

      <table className="staff-editor-table">
        <thead>
          <tr>
            <th>이름</th>
            <th>역할</th>
            <th>사용</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {staffList.map((staff, index) => (
            <tr key={staff.id}>
              <td>
                <input
                  type="text"
                  value={staff.name}
                  onChange={(event) => updateStaff(index, 'name', event.target.value)}
                  placeholder="김OO"
                />
              </td>
              <td>
                <input
                  type="text"
                  value={staff.role}
                  onChange={(event) => updateStaff(index, 'role', event.target.value)}
                  placeholder="관리사"
                />
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={staff.isActive}
                  onChange={(event) => updateStaff(index, 'isActive', event.target.checked)}
                  aria-label={`${staff.name || '담당자'} 사용 여부`}
                />
              </td>
              <td>
                <button className="danger-button" type="button" onClick={() => removeStaff(index)}>
                  삭제
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="secondary-button" type="button" onClick={addStaff}>
        담당자 추가
      </button>
    </div>
  )
}

export default StaffListEditor
