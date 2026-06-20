function DefaultStaffButton({ disabled, onClick }) {
  return (
    <button className="primary-button" type="button" onClick={onClick} disabled={disabled}>
      기본 담당자 설정
    </button>
  )
}

export default DefaultStaffButton
