import { useState } from 'react'
import StaffListEditor from './StaffListEditor.jsx'

function DefaultStaffModal({ staffList, isSaving, onClose, onSave }) {
  const [draftStaffList, setDraftStaffList] = useState(staffList)

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="staff-modal-title">
        <div className="modal-header">
          <div>
            <h2 id="staff-modal-title">기본 담당자 설정</h2>
            <p>날짜별 업무표에서 담당자 선택 목록으로 사용됩니다.</p>
          </div>
          <button className="secondary-button" type="button" onClick={onClose}>
            닫기
          </button>
        </div>

        <StaffListEditor
          staffList={draftStaffList}
          onChange={setDraftStaffList}
        />

        <div className="modal-footer">
          <button className="secondary-button" type="button" onClick={onClose}>
            취소
          </button>
          <button
            className="primary-button"
            type="button"
            onClick={() => onSave(draftStaffList)}
            disabled={isSaving}
          >
            {isSaving ? '저장 중' : '기본 담당자 저장'}
          </button>
        </div>
      </section>
    </div>
  )
}

export default DefaultStaffModal
