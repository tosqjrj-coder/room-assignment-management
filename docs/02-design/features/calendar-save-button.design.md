# calendar-save-button Design Document

> **Summary**: 달력 사이드바 하단 저장 버튼 + isDirty 상태 추적 + 날짜 변경 경고 팝업
>
> **Project**: room-assignment-management
> **Version**: 0.0.0
> **Author**: tosqjrj-coder
> **Date**: 2026-06-24
> **Status**: Draft
> **Planning Doc**: [calendar-save-button.plan.md](../../01-plan/features/calendar-save-button.plan.md)

---

## Context Anchor

| Key | Value |
|-----|-------|
| **WHY** | 날짜 전환 시 미저장 배정 데이터가 `loadFromCloud` 호출로 덮어써짐 |
| **WHO** | 방배정 업무를 담당하는 내부 운영자 |
| **RISK** | 경고 팝업을 무시하고 이동 시 데이터 유실 가능 |
| **SUCCESS** | 저장 버튼 클릭 시 현재 날짜 배정 데이터가 클라우드에 정상 저장됨, 미저장 상태 표시 |
| **SCOPE** | App.jsx 내 저장 버튼 HTML 추가 + 미저장 상태 추적 로직 + CSS 스타일 |

---

## 1. Overview

### 1.1 Design Goals

- `setAssignmentValue()` 한 곳에 `markDirty()` 추가로 모든 배정 변경을 추적
- `window.confirm()` 으로 날짜 변경 경고 (기존 패턴 유지)
- 헬퍼 함수 3개(`markDirty`, `clearDirty`, `updateSaveBtn`)로 상태 로직 집중

### 1.2 Design Principles

- 기존 전역 변수 / DOM 직접 조작 패턴 유지 (Starter 레벨)
- 변경 최소화: `setAssignmentValue` 1곳 수정으로 모든 경로 커버
- 신규 파일 없음, `App.jsx` + `App.css` 2파일만 수정

---

## 2. Architecture (Option C — Pragmatic)

### 2.0 Architecture Comparison

**Selected: Option C — Pragmatic**

| 항목 | 선택 이유 |
|------|---------|
| dirty 추적 | `setAssignmentValue` 내부에 `markDirty()` 1줄 추가 — 모든 배정 경로 자동 커버 |
| 경고 팝업 | `window.confirm()` — 기존 코드 스타일과 동일, 추가 HTML/JS 불필요 |
| 버튼 UI | `updateSaveBtn()` 함수로 버튼 DOM 직접 업데이트 (기존 `renderTable`, `renderStaff` 패턴과 동일) |

### 2.1 Component Diagram

```
사용자 배정 변경
      │
      ▼
setAssignmentValue()  ──▶  markDirty()  ──▶  updateSaveBtn()
                                                    │
                                              [저장 *] 버튼 강조
사용자 날짜 클릭
      │
      ▼
selectScheduleDate()
      │
      ├─ isDirty === false ──▶ loadFromCloud() ──▶ clearDirty()
      │
      └─ isDirty === true
              │
              ▼
        window.confirm("저장하지 않으면 변경사항이 사라집니다. 이동하시겠습니까?")
              │
        ┌─────┴─────┐
       확인          취소
        │             │
        ▼             ▼
  loadFromCloud()   현재 날짜 유지
  clearDirty()

사용자 저장 버튼 클릭
      │
      ▼
saveToCloud(true) ──▶ 성공 시 clearDirty() ──▶ updateSaveBtn()
```

### 2.2 Data Flow

```
배정 변경 → isDirty=true → 버튼 강조
날짜 클릭 → isDirty 확인 → (경고) → 날짜 전환 → isDirty=false → 버튼 정상
저장 클릭 → saveToCloud → isDirty=false → 버튼 정상
```

### 2.3 수정 대상 함수 목록

| 함수 | 파일:라인 | 변경 내용 |
|------|---------|---------|
| `setAssignmentValue` | App.jsx:451 | 함수 내부 마지막에 `markDirty()` 추가 |
| `selectScheduleDate` | App.jsx:409 | `isDirty` 체크 + `window.confirm()` 추가 |
| `saveToCloud` | App.jsx:1627 | `try` 블록 성공 후 `clearDirty()` 추가 |
| `loadFromCloud` | App.jsx:1649 | `applyData()` 호출 후 `clearDirty()` 추가 |
| `applyData` | App.jsx:1682 | 함수 끝에 `clearDirty()` 추가 (직접 호출 경로용) |

---

## 3. Data Model

### 3.1 신규 전역 상태

```js
// App.jsx 상단 기존 전역 변수 선언부에 추가
let isDirty = false;
```

### 3.2 헬퍼 함수 정의

```js
function markDirty() {
  isDirty = true;
  updateSaveBtn();
}

function clearDirty() {
  isDirty = false;
  updateSaveBtn();
}

function updateSaveBtn() {
  const btn = document.getElementById('calendarSaveBtn');
  if (!btn) return;
  if (isDirty) {
    btn.textContent = '저장 *';
    btn.classList.add('dirty');
  } else {
    btn.textContent = '저장';
    btn.classList.remove('dirty');
  }
}
```

---

## 4. API Specification

해당 없음 — 기존 `saveToCloud()` 재사용. Firebase Firestore 연동은 변경 없음.

---

## 5. UI/UX Design

### 5.1 사이드바 레이아웃 변경

```
┌──────────────────────────┐
│  ← 2026년 06월 →        │  ← .cal-nav (기존)
├──────────────────────────┤
│  일 월 화 수 목 금 토    │  ← #scheduleCalendar (기존)
│  ...                     │
├──────────────────────────┤
│  선택 날짜: 2026-06-24   │  ← .sidebar-selected-date (기존)
├──────────────────────────┤
│  [ 저장 ]                │  ← 신규 추가 (isDirty=false 시)
│  [ 저장 * ]              │  ← isDirty=true 시 강조색
└──────────────────────────┘
```

### 5.2 User Flow

```
배정표 수정
    ↓
버튼 "저장 *" 로 변경 (강조 색상)
    ↓
사용자 저장 버튼 클릭 → 저장 완료 → "저장" 으로 복귀
    또는
사용자 다른 날짜 클릭 → 경고 팝업
    ├─ 확인 → 저장 없이 이동
    └─ 취소 → 현재 날짜 유지
```

### 5.3 Page UI Checklist

#### 달력 사이드바 (`.calendar-sidebar`)

- [ ] 버튼: "저장" — `id="calendarSaveBtn"`, `onclick="saveToCloud(true)"` 
- [ ] 버튼 상태 (clean): 텍스트 `저장`, 일반 스타일 (`.sidebar-save-btn`)
- [ ] 버튼 상태 (dirty): 텍스트 `저장 *`, 강조 스타일 (`.sidebar-save-btn.dirty`) — 주황색 테두리

---

## 6. Error Handling

| 상황 | 처리 |
|------|------|
| Firebase 미설정 | `saveToCloud` 내부에서 기존 오류 메시지 처리 (변경 없음) |
| 저장 실패 | `saveToCloud` catch 블록 기존 처리 유지 — `clearDirty()` 호출 안 함 (실패 시 dirty 유지) |
| 날짜 로드 실패 | `loadFromCloud` catch → `clearDirty()` 미호출 (실패 시 dirty 상태 유지) |

---

## 7. Security Considerations

- 변경 없음 — Firebase 인증 / Firestore 규칙 기존 동작 유지

---

## 8. Test Plan

### 8.1 Test Scope

| Type | Target | Tool |
|------|--------|------|
| L2: UI 수동 테스트 | 저장 버튼 렌더링 / dirty 표시 / 경고 팝업 | 브라우저 육안 확인 |

### 8.2 L2: UI 시나리오

| # | 상황 | 액션 | 기대 결과 |
|---|------|------|---------|
| 1 | 앱 초기 로드 | 달력 사이드바 확인 | "저장" 버튼 표시, 강조 없음 |
| 2 | 방 배정 후 | 버튼 확인 | "저장 *" + 주황 테두리 |
| 3 | dirty 상태에서 다른 날짜 클릭 | 날짜 선택 | 경고 팝업 표시 |
| 4 | 경고 팝업 — "확인" | 확인 클릭 | 날짜 이동, 버튼 "저장" 복귀 |
| 5 | 경고 팝업 — "취소" | 취소 클릭 | 현재 날짜 유지, 배정 데이터 유지 |
| 6 | 저장 버튼 클릭 | 클릭 | 클라우드 저장, "저장" 복귀 |
| 7 | 저장 후 날짜 변경 | 날짜 선택 | 경고 팝업 없이 날짜 이동 |

---

## 9. Clean Architecture

해당 없음 — Starter 레벨 단일 파일 구조 유지.

---

## 10. Coding Convention Reference

### 10.1 이 피처의 컨벤션

| 항목 | 적용 |
|------|------|
| 전역 변수 | 기존 `let` 선언 패턴 (`let isDirty = false`) |
| 함수명 | camelCase (`markDirty`, `clearDirty`, `updateSaveBtn`) |
| DOM 접근 | `document.getElementById()` (기존 패턴 동일) |
| 이벤트 | `onclick="..."` 인라인 (기존 패턴 동일) |
| CSS 클래스 | `classList.add/remove` |

---

## 11. Implementation Guide

### 11.1 수정 파일

```
react-app/src/
├── App.jsx          ← JS 로직 + legacyMarkup HTML 수정
└── App.css          ← .sidebar-save-btn 스타일 추가
```

### 11.2 Implementation Order

1. [ ] **App.css**: `.sidebar-save-btn` / `.sidebar-save-btn.dirty` 스타일 추가
2. [ ] **App.jsx — HTML**: `legacyMarkup` 내 `</aside>` 바로 위에 저장 버튼 추가
3. [ ] **App.jsx — JS 전역**: `let isDirty = false` 선언 추가
4. [ ] **App.jsx — JS 헬퍼**: `markDirty()` / `clearDirty()` / `updateSaveBtn()` 함수 추가
5. [ ] **App.jsx — `setAssignmentValue`**: 함수 끝에 `markDirty()` 호출 추가
6. [ ] **App.jsx — `selectScheduleDate`**: `isDirty` 체크 + `window.confirm()` 추가
7. [ ] **App.jsx — `saveToCloud`**: 성공 시 `clearDirty()` 추가
8. [ ] **App.jsx — `loadFromCloud`**: `applyData` 호출 후 `clearDirty()` 추가
9. [ ] **빌드 확인**: `npm run build`
10. [ ] **Firebase 배포**: `firebase deploy`

### 11.3 Session Guide

#### Module Map

| Module | Scope Key | Description | 예상 턴 |
|--------|-----------|-------------|:------:|
| CSS + HTML | `module-1` | 버튼 스타일 + 마크업 추가 | 2-3 |
| JS 로직 | `module-2` | isDirty 추적 + 경고 팝업 + 저장 | 3-5 |

#### Recommended Session Plan

| Session | Scope | 내용 |
|---------|-------|------|
| Session 1 (현재) | Plan + Design | 완료 |
| Session 2 | Do (전체) | `--scope module-1,module-2` 단일 세션으로 처리 가능 |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-06-24 | Initial draft (Option C — Pragmatic) | tosqjrj-coder |
