# break-time-settings Planning Document

> **Summary**: 담당자별 개인 휴게 시간 설정 및 일일 오버라이드 기능 추가
>
> **Project**: 방배정업무표
> **Version**: 0.0.0
> **Author**: tosqjrj-coder
> **Date**: 2026-06-26
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 토요일 공통 휴게 방식은 모든 담당자에게 동일 시간을 강제 적용해 유연성이 없고, 특정 날짜의 담당자 휴게를 임시 변경할 방법이 없음 |
| **Solution** | 담당자별 개인 토요일 휴게 시간 설정 + 배정표에서 담당자 이름 클릭 시 일일 휴게 오버라이드 팝업 제공 |
| **Function/UX Effect** | 공통 휴게 제거로 담당자마다 다른 휴게 시간 적용 가능, 날짜별 임시 변경으로 돌발 상황 대응, 배정표에서 휴게 슬롯 시각적 차단 |
| **Core Value** | 담당자 개인 일정에 맞는 유연한 휴게 시간 관리로 배정표 정확도 향상 |

---

## Context Anchor

| Key | Value |
|-----|-------|
| **WHY** | 담당자마다 다른 휴게 시간이 필요하고, 특정 날에 임시 변경이 필요한데 현재는 공통 고정값만 존재 |
| **WHO** | 배정표를 관리하는 업무 담당자 |
| **RISK** | 기존 공통 휴게 코드/Firebase 데이터 마이그레이션 시 기존 배정 데이터 충돌 |
| **SUCCESS** | 담당자별 토요일 휴게 설정 가능, 날짜별 임시 변경 가능, 휴게 슬롯 배정 차단 동작 |
| **SCOPE** | M1: 공통 휴게 제거 + 개인 토요일 휴게 추가 / M2: 일일 오버라이드 팝업 / M3: 배정표 차단 로직 통합 |

---

## 1. Overview

### 1.1 Purpose

현재 토요일 휴게는 전체 담당자에게 동일하게 적용되는 "공통 휴게" 방식으로, 담당자별로 다른 휴게 시간을 설정할 수 없다. 또한 특정 날짜에 임시로 휴게 시간을 변경하는 방법이 없어 돌발 상황 대응이 어렵다. 이 기능은 담당자별 개인 토요일 휴게 시간 설정과 날짜별 일일 오버라이드를 제공하여 배정표 관리 유연성을 높인다.

### 1.2 Background

- 현재 `isResting()` 함수: 토요일 모드에서 `isCommonBreak()`만 호출 → 개인 `breakStart`/`breakEnd` 무시
- 기존 `CONFIG.saturday.commonBreakStart/End` 방식은 Firebase에 공통 값으로 저장되어 모든 담당자에게 일괄 적용
- 평일은 이미 담당자별 `breakStart`/`breakEnd`로 개인 휴게 차단이 동작 중
- 일일 오버라이드 개념 자체가 없어 날짜별 임시 변경 불가

### 1.3 Related Documents

- 기존 코드: `react-app/src/App.jsx` — `isResting()`, `isCommonBreak()`, `staff[]` 데이터 모델

---

## 2. Scope

### 2.1 In Scope

- [ ] 담당자 추가/수정 폼에 **토요일 휴게 시작/종료** 필드 추가 (`satBreakStart`, `satBreakEnd`)
- [ ] 기존 공통 토요일 휴게 관련 코드 완전 제거 (`isCommonBreak`, `saveSaturdayBreakSetting`, `clearSaturdayBreakSetting`, 관련 모달 UI)
- [ ] Firebase `defaultStaff` 문서의 `saturdayCommonBreakStart/End` 필드 제거 (저장 시 포함 안 함)
- [ ] `isResting()` 함수 수정: 토요일 모드에서도 담당자별 `satBreakStart`/`satBreakEnd` 체크
- [ ] **일일 휴게 오버라이드 팝업**: 배정표 좌측 담당자 이름 클릭 시 오픈
  - 해당 날짜의 담당자 휴게 시간 임시 변경 (평일/토요일 모두)
  - 기본값은 담당자 기본 설정 값
  - `dailySchedules/{date}` 문서에 `staffBreakOverrides: { [staffId]: { breakStart, breakEnd } }` 저장
- [ ] 배정표: 각 담당자의 휴게 슬롯을 시각적으로 차단 (현재 공통 휴게 방식과 동일한 UX 유지)

### 2.2 Out of Scope

- 공통 휴게 기능 신규 재도입 (완전 제거)
- 담당자별 복수 휴게 시간 (여러 구간 설정)
- 휴게 시간 내 예외 배정 허용 옵션

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | 담당자 설정 폼에 `satBreakStart`/`satBreakEnd` 필드 추가 | High | Pending |
| FR-02 | 공통 토요일 휴게 관련 코드 (CONFIG, 함수, 모달 UI) 완전 제거 | High | Pending |
| FR-03 | `isResting()` 수정: 토요일 모드에서 `person.satBreakStart`/`satBreakEnd` 사용 | High | Pending |
| FR-04 | 배정표 좌측 담당자 이름 클릭 → 일일 휴게 오버라이드 팝업 표시 | High | Pending |
| FR-05 | 일일 오버라이드 팝업: 해당 날짜 담당자 휴게 시간 변경 + Firebase 저장 | High | Pending |
| FR-06 | 일일 오버라이드 적용 시 `isResting()`이 오버라이드 값 우선 적용 | High | Pending |
| FR-07 | 오버라이드가 없을 때는 기본 담당자 설정값 사용 (폴백) | Medium | Pending |
| FR-08 | 배정표에서 각 담당자의 휴게 슬롯에 시각적 차단 표시 | Medium | Pending |
| FR-09 | `buildData` / `applyData`에서 `staffBreakOverrides` 저장/복원 | High | Pending |
| FR-10 | Firebase `defaultStaff` 저장 시 `saturdayCommonBreakStart/End` 필드 제외 | Medium | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| 하위 호환성 | 기존 `staff[]`에 `satBreakStart`/`satBreakEnd` 없어도 정상 동작 | 빈 값 시 휴게 없음으로 처리 |
| 데이터 무결성 | 기존 Firebase 일일 스케줄에 `saturdayCommonBreak` 필드 있어도 오류 없음 | `migrateData()` 에서 무시 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] FR-01~FR-10 모두 구현 완료
- [ ] 기본 담당자 설정에서 토요일 휴게 설정 후 배정표에서 해당 슬롯 차단 확인
- [ ] 배정표 담당자 이름 클릭 → 일일 팝업 열림 → 휴게 변경 → 해당 날짜에만 반영 확인
- [ ] 페이지 새로고침 후 오버라이드 유지 확인 (Firebase 저장)
- [ ] 공통 휴게 코드 완전 제거 확인 (`isCommonBreak` grep 결과 없음)

### 4.2 Quality Criteria

- [ ] 기존 평일 휴게 차단 로직 회귀 없음
- [ ] `satBreakStart`/`satBreakEnd` 미설정 담당자는 토요일 전 슬롯 배정 가능
- [ ] 빌드 오류 없음

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| 기존 Firebase `saturdayCommonBreakStart` 데이터 잔존 시 오류 | Medium | Medium | `loadDefaultStaffFromCloud`에서 해당 필드 읽지 않음, `migrateData`에서 무시 |
| 공통 휴게 제거로 기존 차단된 슬롯이 갑자기 열림 | Low | High | 의도된 동작. 담당자가 개인 토요일 휴게를 재설정하면 다시 차단됨 |
| 일일 오버라이드 데이터 구조 변경으로 기존 `dailySchedules` 문서 비호환 | Medium | Low | 없는 필드는 기본값 처리, `buildData` version 올려 마이그레이션 |

---

## 6. Impact Analysis

### 6.1 Changed Resources

| Resource | Type | Change Description |
|----------|------|--------------------|
| `staff[]` 데이터 모델 | In-memory / Firebase | `satBreakStart`, `satBreakEnd` 필드 추가 |
| `dailySchedules/{date}` Firebase 문서 | Firebase | `staffBreakOverrides` 객체 필드 추가 |
| `defaultStaff` Firebase 문서 | Firebase | `saturdayCommonBreakStart/End` 저장 제거 |
| `CONFIG.saturday` | In-memory | `commonBreakStart/End` 필드 제거 |
| `isResting()` 함수 | Logic | 토요일 모드에서 개인 `satBreakStart/End` + 오버라이드 체크 |
| `isCommonBreak()` 함수 | Logic | 완전 제거 |
| 기본 담당자 설정 모달 HTML | UI | 토요일 공통 휴게 섹션 제거, 담당자 폼에 토요일 휴게 필드 추가 |
| 배정표 좌측 담당자 이름 셀 | UI | 클릭 이벤트 추가 → 일일 오버라이드 팝업 |

### 6.2 Current Consumers

| Resource | Operation | Code Path | Impact |
|----------|-----------|-----------|--------|
| `CONFIG.saturday.commonBreakStart/End` | READ | `isCommonBreak()` | Breaking — 제거 |
| `CONFIG.saturday.commonBreakStart/End` | READ | `renderRules()`, `renderStaff()` | Breaking — 조건부 표시 제거 |
| `saveSaturdayBreakSetting()` | CALL | 기본 담당자 설정 모달 버튼 | Breaking — 함수 제거 |
| `clearSaturdayBreakSetting()` | CALL | 기본 담당자 설정 모달 버튼 | Breaking — 함수 제거 |
| `localStorage "roomScheduleSaturdayBreakConfig"` | READ/WRITE | `initApp()`, `saveSaturdayBreakSetting()` | Breaking — 제거 |
| `saveDefaultStaffToCloud()` | WRITE | `saturdayCommonBreakStart/End` 포함 | Needs update — 해당 필드 제거 |
| `loadDefaultStaffFromCloud()` | READ | `saturdayCommonBreakStart/End` 처리 | Needs update — 해당 필드 처리 제거 |
| `buildData()` | WRITE | `version` | Needs update — version 올림 |
| `applyData()` | READ | `migrateData()` | Needs update — 구 버전 필드 무시 |

### 6.3 Verification

- [ ] `isCommonBreak` grep 결과 없음 확인
- [ ] `roomScheduleSaturdayBreakConfig` localStorage 참조 없음 확인
- [ ] 평일 배정 정상 동작 확인
- [ ] 토요일 개인 휴게 설정 없는 담당자 전 슬롯 배정 가능 확인

---

## 7. Architecture Considerations

### 7.1 Project Level Selection

| Level | Selected |
|-------|:--------:|
| **Starter** (단일 HTML+JS, Firebase) | ✅ |

### 7.2 Key Architectural Decisions

| Decision | Selected | Rationale |
|----------|----------|-----------|
| 오버라이드 저장 위치 | `dailySchedules/{date}.staffBreakOverrides` | 날짜별 독립 데이터, 기존 저장 구조와 일관성 |
| 오버라이드 우선순위 | 일일 오버라이드 > 기본 담당자 설정 | 더 구체적인 값 우선 |
| 팝업 트리거 | 배정표 좌측 담당자 이름 셀 클릭 | 직관적인 위치, 기존 셀 구조 활용 |
| 공통 휴게 처리 | 완전 제거 (코드 + Firebase 저장) | 사용자 결정, 코드 단순화 |

---

## 8. Convention Prerequisites

### 8.1 Existing Project Conventions

- [ ] 기존 코드 스타일: `legacyScript` JS 문자열 내 vanilla JS
- [ ] Firebase 저장: `buildData()` / `saveToCloud()` / `saveDefaultStaffToCloud()` 패턴
- [ ] 모달: `showModal()` / 인라인 HTML 문자열 패턴

---

## 9. Next Steps

1. [ ] `/pdca design break-time-settings` — 상세 설계 문서 작성
2. [ ] `/pdca do break-time-settings` — 구현 시작

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-06-26 | Initial draft | tosqjrj-coder |
