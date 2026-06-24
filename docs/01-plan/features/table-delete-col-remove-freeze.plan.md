# Plan: 배정표 삭제 컬럼 제거 + 시간 열 단독 틀고정

- **Feature**: table-delete-col-remove-freeze
- **Phase**: Plan
- **Date**: 2026-06-24

---

## Executive Summary

| 관점 | 내용 |
|------|------|
| 문제 | 30분 단위 배정표에 불필요한 「삭제」컬럼이 있고, 시간 외 모든 방 컬럼이 sticky로 묶여 가로 스크롤 시 레이아웃이 복잡함 |
| 해결 | 삭제 컬럼 제거, 시간 컬럼만 sticky 유지 |
| 기능 UX 효과 | 테이블이 더 넓게 보이고, 스크롤 시 시간만 고정되어 가독성 향상 |
| 핵심 가치 | 불필요한 UI 요소 제거로 화면 공간 확보 및 사용성 개선 |

---

## Context Anchor

| 항목 | 내용 |
|------|------|
| WHY | 삭제 컬럼이 공간 낭비 + 방 전체 sticky로 스크롤 UX 불편 |
| WHO | 배정표 사용자 (관리자) |
| RISK | clearSlot 기능이 삭제 컬럼에만 있으므로, 삭제 후 해당 기능 접근 불가 확인 필요 (→ 테이블 위 「현재 탭 배정 삭제」버튼으로 대체 가능) |
| SUCCESS | 삭제 컬럼 미표시, 시간 컬럼만 sticky, 방 컬럼은 자유 스크롤 |
| SCOPE | App.jsx (renderTable 함수 내 HTML 생성 부분), App.css (freeze 관련 스타일) |

---

## 1. 요구사항

### 기능 요구사항

| ID | 요구사항 | 우선순위 |
|----|----------|----------|
| FR-01 | 배정표 테이블 헤더에서 「삭제」컬럼 제거 | Must |
| FR-02 | 배정표 테이블 각 행에서 삭제 버튼 `<td>` 제거 | Must |
| FR-03 | 시간(`time-col`) 컬럼만 `sticky` 유지 | Must |
| FR-04 | 방 컬럼들(`freeze-room-*`)의 `freeze-col` 클래스 및 `left` 위치 제거 | Must |

### 비기능 요구사항

- 기존 배정 저장/불러오기 로직 영향 없음
- 「현재 탭 배정 삭제」버튼(테이블 상단)은 그대로 유지 (row 단위 삭제는 제거되지만 전체 삭제는 유지)

---

## 2. 범위

### 변경 파일

| 파일 | 변경 내용 |
|------|-----------|
| `react-app/src/App.jsx` | `renderTable()` 내 delete 컬럼 HTML 제거, room 컬럼 freeze 클래스 제거 |
| `react-app/src/App.css` | `.freeze-delete`, `.freeze-room-*` 위치 제거, 시간 컬럼 오른쪽 그림자 추가 |

### 변경하지 않는 것

- `clearSlot()` 함수 — 코드는 유지 (혹시 다른 용도로 사용될 수 있음)
- 테이블 상단의 「현재 탭 배정 삭제」버튼
- 담당자 설정 / 자동 배정 관련 로직 전체

---

## 3. 구현 가이드

### App.jsx — renderTable() 수정

**제거할 항목:**
1. `thead` 내 `<th class="delete-col freeze-col freeze-delete">삭제</th>` 라인
2. `tbody` 내 `<td class="delete-col freeze-col freeze-delete"><button ...>삭제</button></td>` 라인
3. `renderRoomCell()` 내 `freezeRoomClass` 관련 코드 및 각 room `<th>`/`<td>`에 추가되는 `freeze-col freeze-room-*` 클래스

### App.css — sticky 정리

**제거할 항목:**
- `.freeze-delete { left: 130px; }` 라인
- `.freeze-room-1` ~ `.freeze-room-head` 의 `left` 값들 (또는 전체 라인)

**추가할 항목:**
- `.freeze-time`에 오른쪽 그림자 추가 (freeze-last 스타일 적용)
  ```css
  .freeze-time {
    box-shadow: 1px 0 0 var(--line), 8px 0 12px rgba(15, 23, 42, 0.08);
  }
  ```

---

## 4. 성공 기준

- [ ] 배정표 테이블에 「삭제」컬럼이 없음
- [ ] 시간 컬럼은 가로 스크롤 시 좌측에 고정됨
- [ ] 방 컬럼들은 자유롭게 스크롤됨
- [ ] 기존 배정 선택(담당자 select) 정상 동작
- [ ] 클라우드 저장/불러오기 정상 동작
