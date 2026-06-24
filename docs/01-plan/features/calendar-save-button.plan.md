# calendar-save-button Planning Document

> **Summary**: 달력 하단 저장 버튼 추가 — 날짜 변경 시 배정 데이터 초기화 문제 해결
>
> **Project**: room-assignment-management
> **Version**: 0.0.0
> **Author**: tosqjrj-coder
> **Date**: 2026-06-24
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 날짜를 변경하면 현재 날짜의 방배정 내용이 저장 없이 초기화됨 (`selectScheduleDate` → `loadFromCloud` 직접 호출) |
| **Solution** | 달력 사이드바 하단에 명시적 저장 버튼 추가 + 미저장 상태 시각 표시 |
| **Function/UX Effect** | 사용자가 저장 여부를 직접 제어, 미저장 상태를 버튼으로 인지 가능 |
| **Core Value** | 배정 데이터 유실 방지 및 명확한 저장 흐름 제공 |

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

### 1.1 Purpose

달력에서 다른 날짜를 선택하기 전, 사용자가 현재 날짜의 배정 내용을 명시적으로 저장할 수 있는 버튼을 제공한다.

### 1.2 Background

`selectScheduleDate(dateKey)` 함수(App.jsx:409)는 날짜 클릭 즉시 `loadFromCloud(true, ...)` 를 호출한다. 이 과정에서 현재 날짜의 `assignments` 객체가 새 날짜의 데이터로 교체되어 미저장 배정이 사라진다.

날짜 전환 시 경고 팝업은 UX를 방해하므로 제외하고, 대신 저장 버튼에 **미저장 표시**를 통해 사용자가 인지하도록 한다.

### 1.3 Related Documents

- 소스: `react-app/src/App.jsx`

---

## 2. Scope

### 2.1 In Scope

- [x] 달력 사이드바 하단에 저장 버튼 추가
- [x] 미저장 상태 추적 (`isDirty` 플래그)
- [x] 배정/삭제 시 `isDirty = true` 설정
- [x] 저장 완료 / 날짜 로드 후 `isDirty = false` 리셋
- [x] 미저장 시 버튼 텍스트/스타일 변경 (예: `저장 *` or 강조색)
- [x] `isDirty === true` 상태에서 날짜 변경 시 경고 팝업 표시 ("저장하지 않으면 변경사항이 사라집니다. 이동하시겠습니까?")

### 2.2 Out of Scope

- 자동 저장 (일정 주기 자동 saveToCloud)
- 오프라인 큐잉

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | 달력 사이드바 하단에 "저장" 버튼 렌더링 | High | Pending |
| FR-02 | 버튼 클릭 시 `saveToCloud(true)` 호출 | High | Pending |
| FR-03 | 배정 변경(assign/delete) 시 `isDirty = true` 설정 | High | Pending |
| FR-04 | 저장 완료 후 `isDirty = false` 리셋 | High | Pending |
| FR-05 | 날짜 로드(`loadFromCloud`, `applyData`) 완료 후 `isDirty = false` 리셋 | High | Pending |
| FR-06 | `isDirty === true` 시 버튼에 미저장 표시 (텍스트 또는 색상 변경) | Medium | Pending |
| FR-07 | `isDirty === true` 상태에서 날짜 클릭 시 경고 확인 팝업 표시 | High | Pending |
| FR-08 | 경고 팝업 — "이동" 선택 시 저장 없이 날짜 전환, "취소" 선택 시 현재 날짜 유지 | High | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | 저장 버튼 클릭 응답 < 100ms (UI 반응) | 육안 확인 |
| UX | 미저장 표시가 한눈에 인지 가능 | 육안 확인 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [x] 달력 하단 저장 버튼이 렌더링됨
- [x] 버튼 클릭 → 현재 날짜 데이터 클라우드 저장 성공
- [x] 배정 변경 후 버튼에 미저장 표시가 나타남
- [x] 저장 또는 날짜 이동 후 미저장 표시가 사라짐

### 4.2 Quality Criteria

- [x] 기존 저장/불러오기 기능 영향 없음
- [x] 빌드 에러 없음 (`npm run build` 성공)

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| `isDirty` 추적 누락 (일부 배정 변경 경로 미포함) | Medium | Medium | 배정 변경이 발생하는 모든 함수에 `isDirty = true` 추가 확인 |
| 경고 팝업을 "이동" 선택 후 데이터 유실 | Low | Low | 의도된 동작 — 사용자가 명시적으로 선택한 경우 |

---

## 6. Impact Analysis

### 6.1 Changed Resources

| Resource | Type | Change Description |
|----------|------|--------------------|
| `App.jsx` — HTML 마크업 (legacyMarkup) | UI | 달력 사이드바에 저장 버튼 추가 |
| `App.jsx` — JS 로직 | Logic | `isDirty` 플래그 추가, 관련 함수에서 플래그 조작 |
| `App.jsx` — CSS (legacyMarkup 내 스타일) | Style | 저장 버튼 및 미저장 상태 스타일 추가 |

### 6.2 Current Consumers

| Resource | Operation | Code Path | Impact |
|----------|-----------|-----------|--------|
| `saveToCloud` | CALL | App.jsx:1969, 2011, 2197 | 기존 호출 영향 없음 |
| `loadFromCloud` | CALL | App.jsx:413 (`selectScheduleDate`) | 로드 후 `isDirty = false` 추가 필요 |
| `applyData` | CALL | App.jsx:1682 | 적용 후 `isDirty = false` 추가 필요 |
| `assignments` | WRITE | App.jsx:969, 1046, 1149, 1669 | 배정 초기화 후 `isDirty` 리셋 확인 필요 |

### 6.3 Verification

- [x] 기존 `saveToCloud` 호출 경로에 영향 없음
- [x] `isDirty` 추가가 렌더링 루프 방해 없음

---

## 7. Architecture Considerations

### 7.1 Project Level Selection

| Level | Selected |
|-------|:--------:|
| Starter | ☑ |

레거시 HTML/JS 패턴 (`legacyMarkup` 문자열 내 전역 변수) 을 그대로 사용하는 Starter 패턴 프로젝트.

### 7.2 Key Architectural Decisions

| Decision | Selected | Rationale |
|----------|----------|-----------|
| 상태 관리 | 전역 변수 `isDirty` | 기존 코드 패턴과 일관성 유지 |
| UI 업데이트 | `updateSaveButtonState()` 함수 | 버튼 DOM을 직접 조작하는 기존 패턴과 통일 |
| 저장 트리거 | 기존 `saveToCloud(true)` 재사용 | 중복 구현 없이 기존 함수 활용 |

---

## 8. Convention Prerequisites

- 기존 `CLAUDE.md`, ESLint 설정 없음
- 전역 변수 패턴 (`let isDirty = false`) 사용

---

## 9. Next Steps

1. [ ] `/pdca design calendar-save-button` — 설계 문서 작성
2. [ ] 구현 (App.jsx 수정)
3. [ ] 빌드 확인 및 Firebase 재배포

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-06-24 | Initial draft | tosqjrj-coder |
