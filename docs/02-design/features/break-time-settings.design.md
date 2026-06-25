# break-time-settings Design Document

> **Summary**: 담당자별 개인 휴게 시간 설정 및 일일 오버라이드 기능 — Option C (Pragmatic) 구현 설계
>
> **Project**: 방배정업무표
> **Version**: 0.0.0
> **Author**: tosqjrj-coder
> **Date**: 2026-06-26
> **Status**: Draft
> **Planning Doc**: [break-time-settings.plan.md](../../01-plan/features/break-time-settings.plan.md)

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

### 1.1 Design Goals

- 공통 토요일 휴게 인프라 완전 제거로 코드 단순화
- 담당자별 `satBreakStart`/`satBreakEnd` 필드를 기존 `breakStart`/`breakEnd`와 대칭 구조로 추가
- 배정표 위 컴팩트 담당자 패널로 당일 휴게 현황 한눈에 파악 및 즉시 수정

### 1.2 Design Principles

- 기존 `isResting()` 함수의 단일 진입점 유지 — 오버라이드 우선순위 로직을 이 함수에 집중
- `staffBreakOverrides`는 `buildData`/`applyData` 사이클 안에서만 관리 — 별도 저장 경로 없음
- 제거 대상 코드는 흔적 없이 완전 삭제 (deprecated 주석 금지)

---

## 2. Architecture — Option C: Pragmatic

### 2.0 Architecture Comparison

| 기준 | A: Minimal | B: Clean | **C: Pragmatic (선택)** |
|------|:-:|:-:|:-:|
| 접근 | staffList 클릭 추가 | 테이블 구조 재설계 | **배정표 위 전용 패널** |
| 신규 함수 | 3 | 8+ | 5 |
| 수정 범위 | App.jsx 소규모 | 테이블 전체 재설계 | App.jsx 중간 |
| UX | 스크롤 필요 | 테이블 복잡도 증가 | **배정표 바로 위 직관적 접근** |

**Selected: Option C** — 배정표 바로 위 담당자 컴팩트 패널. 기존 테이블 구조를 유지하면서 일일 오버라이드를 자연스럽게 접근할 수 있는 위치에 배치.

### 2.1 Component Diagram

```
[기본 담당자 설정 모달]
  └─ 담당자 폼: workStart, workEnd, breakStart, breakEnd, satBreakStart, satBreakEnd (신규)
  └─ ❌ 토요일 공통 휴게 섹션 (제거)

[배정표 영역]
  ├─ [담당자 패널 - 신규] renderStaffBreakPanel()
  │    └─ 담당자 카드 × N : 이름 + 유효 휴게 시간 (오버라이드 or 기본값)
  │         └─ 클릭 → openDailyBreakModal(staffId)
  │
  ├─ [일일 휴게 오버라이드 모달 - 신규] #dailyBreakModal
  │    └─ 담당자명, 날짜, 휴게시작/종료 입력, 적용, 해제 버튼
  │
  └─ [배정표 테이블] renderTable() (수정)
       └─ isBreak: isCommonBreak() → getEffectiveBreak() per person
```

### 2.2 Data Flow

```
사용자 클릭 담당자 패널
  → openDailyBreakModal(staffId)
  → 입력 후 saveDailyBreakOverride(staffId)
  → staffBreakOverrides[staffId] = {breakStart, breakEnd}
  → renderStaffBreakPanel() + renderTable()
  → buildData() → saveToCloud() → Firebase dailySchedules/{date}
  → 새로고침 시 applyData()에서 staffBreakOverrides 복원
```

### 2.3 Dependencies

| Component | Depends On | Purpose |
|-----------|-----------|---------|
| `getEffectiveBreak(mode, person)` | `staffBreakOverrides`, `staff[]` | 오버라이드 or 기본값 반환 |
| `isResting()` | `getEffectiveBreak()` | 슬롯-휴게 겹침 판단 |
| `renderTable()` | `isResting()` | 셀 단위 차단 여부 |
| `renderStaffBreakPanel()` | `staffBreakOverrides`, `staff[]` | 패널 렌더링 |
| `saveDailyBreakOverride()` | `staffBreakOverrides`, `saveToCloud()` | 오버라이드 저장 |

---

## 3. Data Model

### 3.1 Staff 객체 변경

```javascript
// 기존
{
  id, name, worksWeekday, worksSaturday, isActive, staffAutoAssignDefault,
  workStart, workEnd,
  breakStart, breakEnd       // 평일 휴게
}

// 변경 후
{
  id, name, worksWeekday, worksSaturday, isActive, staffAutoAssignDefault,
  workStart, workEnd,
  breakStart, breakEnd,      // 평일 휴게 (유지)
  satBreakStart, satBreakEnd // 토요일 휴게 (신규)
}
```

### 3.2 dailySchedules/{date} 문서 변경

```javascript
// buildData() 반환값 (version 23)
{
  version: 23,
  activeMode,
  staff,              // satBreakStart/satBreakEnd 포함
  assignments,
  autoAssignOverrides,
  staffBreakOverrides: {   // 신규
    "[staffId]": { breakStart: "13:00", breakEnd: "14:00" }
  },
  settings: { startParity }
}
```

### 3.3 defaultStaff Firebase 문서 변경

```javascript
// saveDefaultStaffToCloud() 저장 내용
{
  staffList: [
    { ..., satBreakStart: "13:00", satBreakEnd: "14:00" }  // 신규 필드
    // saturdayCommonBreakStart/End 제거
  ],
  updatedAt: serverTimestamp()
}
```

### 3.4 getEffectiveBreak() — 핵심 신규 함수

```javascript
// 오버라이드 우선순위: 일일 오버라이드 > 담당자 기본값
function getEffectiveBreak(mode, person) {
  const override = staffBreakOverrides[person.id];
  if (override && override.breakStart && override.breakEnd) {
    return { breakStart: override.breakStart, breakEnd: override.breakEnd };
  }
  if (mode === "saturday") {
    return { breakStart: person.satBreakStart || "", breakEnd: person.satBreakEnd || "" };
  }
  return { breakStart: person.breakStart || "", breakEnd: person.breakEnd || "" };
}
```

---

## 4. API Specification

Firebase Firestore 직접 호출 (REST API 없음). 기존 `saveToCloud()` / `saveDefaultStaffToCloud()` 패턴 그대로 사용.

---

## 5. UI/UX Design

### 5.1 담당자 패널 레이아웃

```
┌─────────────────────────────────────────────────────────┐
│ [담당자 휴게 현황]                               [접기▲] │
├──────────┬──────────┬──────────┬──────────┬─────────────┤
│ 홍길동   │ 김철수   │ 이영희   │ 박민준   │             │
│13:00~14:00│ (휴게없음)│12:00~13:00│ 14:00~15:00│          │
│  [✎수정] │  [✎수정] │  [✎수정] │  [✎수정] │             │
└──────────┴──────────┴──────────┴──────────┴─────────────┘
```

### 5.2 일일 오버라이드 팝업 레이아웃

```
┌─────────────────────────────────┐
│ 홍길동 — 2026-06-27 휴게 시간   │
│ (기본값: 13:00~14:00)           │
├─────────────────────────────────┤
│ 휴게 시작: [13:00 ▾]            │
│ 휴게 종료: [14:00 ▾]            │
├─────────────────────────────────┤
│ [적용]  [오버라이드 해제]  [닫기] │
└─────────────────────────────────┘
```

### 5.3 기본 담당자 설정 모달 폼 변경

```
기존:
  평일 휴식 시작 [13:00]
  평일 휴식 종료 [14:00]

변경:
  평일 휴식 시작 [13:00]
  평일 휴식 종료 [14:00]
  토요일 휴게 시작 [    ]  ← 신규
  토요일 휴게 종료 [    ]  ← 신규
  
❌ [토요일 공통 휴게 시간] 섹션 전체 제거
```

### 5.4 Page UI Checklist

#### 기본 담당자 설정 모달

- [ ] Input: `modalSatBreakStart` (time, 토요일 휴게 시작, 빈 값 허용)
- [ ] Input: `modalSatBreakEnd` (time, 토요일 휴게 종료, 빈 값 허용)
- [ ] ❌ 제거: `modalSatBreakStart`/`modalSatBreakEnd` (공통 휴게용 — 신규 개인 휴게용으로 재사용 또는 새 ID 사용)

> 주의: 기존 `id="modalSatBreakStart"`는 공통 휴게용으로 쓰였음. 개인 휴게용 필드는 `id="modalPersonSatBreakStart"` 등 새 ID 사용 권장.

#### 담당자 패널 (`#staffBreakPanel`)

- [ ] 섹션 헤더: "담당자 휴게 현황"
- [ ] 담당자별 카드: 이름 텍스트
- [ ] 담당자별 카드: 유효 휴게 시간 텍스트 (오버라이드 or 기본값, 없으면 "(휴게없음)")
- [ ] 담당자별 카드: "✎ 수정" 버튼 (클릭 → `openDailyBreakModal(staffId)`)
- [ ] 오버라이드 적용 중인 카드: 구별 가능한 시각적 표시 (예: 배경색 변경)

#### 일일 오버라이드 팝업 (`#dailyBreakModal`)

- [ ] 제목: "[담당자명] — [날짜] 휴게 시간"
- [ ] 기본값 안내 문구: "(기본값: X:XX~X:XX)"
- [ ] Input: `dailyBreakStart` (time)
- [ ] Input: `dailyBreakEnd` (time)
- [ ] Button: "적용" → `saveDailyBreakOverride(staffId)`
- [ ] Button: "오버라이드 해제" → `clearDailyBreakOverride(staffId)`
- [ ] Button: "닫기"

---

## 6. Error Handling

| 상황 | 처리 방법 |
|------|---------|
| `dailyBreakStart` ≥ `dailyBreakEnd` | "종료 시간은 시작 시간보다 늦어야 합니다." 오류 표시 |
| 빈 시간 입력 후 적용 | "휴게 시간을 입력해주세요." 오류 표시 |
| `satBreakStart` 있고 `satBreakEnd` 없음 (또는 반대) | 유효성 검사: 둘 다 있거나 둘 다 없어야 함 |
| Firebase 저장 실패 | 기존 `showNotice()` 에러 패턴 사용 |

---

## 7. Security Considerations

- 시간 입력값은 `toMin()` 함수로 파싱 — 기존 검증 로직 재사용
- Firebase 접근은 기존 `requestCloudAccess()` 게이트 통과 후에만 가능

---

## 8. Test Plan

### 8.1 Test Scope

| Type | Target |
|------|--------|
| 수동 기능 테스트 | 담당자별 토요일 휴게 설정 → 배정표 차단 확인 |
| 수동 기능 테스트 | 일일 오버라이드 설정 → 새로고침 후 유지 확인 |
| 수동 기능 테스트 | 오버라이드 해제 → 기본값으로 복원 확인 |
| 회귀 테스트 | 평일 휴게 차단 로직 정상 동작 확인 |
| 회귀 테스트 | `satBreakStart`/`satBreakEnd` 미설정 담당자 전 슬롯 배정 가능 확인 |

### 8.2 L2: UI Action Test Scenarios

| # | 액션 | 기대 결과 |
|---|------|---------|
| 1 | 기본 담당자 설정 → 담당자 추가 시 satBreakStart 입력 | `staff[].satBreakStart` 저장됨 |
| 2 | 토요일 모드 → 해당 담당자의 satBreak 시간 슬롯 | 배정 불가(disabled) + 휴게 표시 |
| 3 | 담당자 패널 "✎ 수정" 클릭 | 일일 오버라이드 팝업 열림 |
| 4 | 팝업에서 시간 변경 후 적용 | 패널 카드 업데이트 + 배정표 차단 슬롯 변경 |
| 5 | 새로고침 후 | 오버라이드 값 유지 (Firebase 저장 확인) |
| 6 | "오버라이드 해제" 클릭 | 기본값으로 복원 |

---

## 9. Clean Architecture

단일 파일(`react-app/src/App.jsx`) 내 `legacyScript` 문자열 구조 그대로 유지.

---

## 10. Implementation Guide

### 10.1 변경 파일

| 파일 | 변경 유형 |
|------|---------|
| `react-app/src/App.jsx` | 수정 (legacyMarkup + legacyScript) |

### 10.2 Implementation Order

#### Module 1: 공통 휴게 제거 + 개인 토요일 휴게 데이터 모델

1. **`legacyScript` — CONFIG 수정**
   - `CONFIG.saturday.commonBreakStart/End` 제거
   - `CONFIG.saturday` 전체 제거 가능 (공통 휴게만 담고 있었음)

2. **`legacyScript` — 제거 대상 함수들**
   - `isCommonBreak()` 함수 전체 제거
   - `saveSaturdayBreakSetting()` 함수 전체 제거
   - `clearSaturdayBreakSetting()` 함수 전체 제거

3. **`legacyScript` — `initApp()` 수정**
   - `localStorage.getItem("roomScheduleSaturdayBreakConfig")` 관련 코드 제거

4. **`legacyScript` — `migrateData()` 수정**
   - `migratedStaff` 에 `satBreakStart: s.satBreakStart || ""`, `satBreakEnd: s.satBreakEnd || ""` 추가
   - return 객체에 `staffBreakOverrides: rawData.staffBreakOverrides || {}` 추가

5. **`legacyScript` — `buildData()` 수정**
   - `version: 23` 으로 올림
   - `staffBreakOverrides` 추가

6. **`legacyScript` — `applyData()` 수정**
   - `staffBreakOverrides = migrated.staffBreakOverrides || {}` 적용

7. **`legacyScript` — `saveDefaultStaffToCloud()` 수정**
   - `saturdayCommonBreakStart`, `saturdayCommonBreakEnd` 필드 제거

8. **`legacyScript` — `loadDefaultStaffFromCloud()` 수정**
   - `saturdayCommonBreakStart/End` 처리 블록 제거
   - `staff` 매핑에 `satBreakStart`, `satBreakEnd` 추가

9. **`legacyScript` — 새 상태 변수 추가**
   - `let staffBreakOverrides = {};` (상단 변수 선언부)

10. **`legacyScript` — `getEffectiveBreak(mode, person)` 신규 함수 추가**
    ```javascript
    function getEffectiveBreak(mode, person) {
      const override = staffBreakOverrides[person.id];
      if (override && override.breakStart && override.breakEnd) {
        return { breakStart: override.breakStart, breakEnd: override.breakEnd };
      }
      if (mode === "saturday") {
        return { breakStart: person.satBreakStart || "", breakEnd: person.satBreakEnd || "" };
      }
      return { breakStart: person.breakStart || "", breakEnd: person.breakEnd || "" };
    }
    ```

11. **`legacyScript` — `isResting()` 수정**
    ```javascript
    function isResting(mode, person, slot) {
      const { breakStart, breakEnd } = getEffectiveBreak(mode, person);
      if (!breakStart || !breakEnd) return false;
      return overlaps(slotStart(slot), slotEnd(slot), toMin(breakStart), toMin(breakEnd));
    }
    ```

#### Module 2: UI — 기본 담당자 설정 폼 + 담당자 패널 + 팝업 모달

12. **`legacyMarkup` — 기본 담당자 설정 모달 HTML 수정**
    - 토요일 공통 휴게 `<div class="default-staff-form-section">` 섹션 전체 제거
    - 담당자 폼에 토요일 휴게 필드 추가:
      ```html
      <div><label>토요일 휴게 시작</label><input id="modalPersonSatBreakStart" type="time" step="1800" /></div>
      <div><label>토요일 휴게 종료</label><input id="modalPersonSatBreakEnd" type="time" step="1800" /></div>
      ```

13. **`legacyMarkup` — 일일 오버라이드 팝업 HTML 추가** (`#dailyBreakModal`)
    ```html
    <div id="dailyBreakModal" class="modal-overlay" style="display:none;" onclick="handleDailyBreakModalOverlay(event)">
      <div class="modal-card">
        <div class="modal-header">
          <h3 id="dailyBreakModalTitle">담당자 — 날짜 휴게 시간</h3>
          <button class="secondary" onclick="closeDailyBreakModal()">닫기</button>
        </div>
        <div class="modal-body">
          <p id="dailyBreakDefaultInfo" class="help"></p>
          <div class="row">
            <div><label>휴게 시작</label><input id="dailyBreakStart" type="time" step="1800" /></div>
            <div><label>휴게 종료</label><input id="dailyBreakEnd" type="time" step="1800" /></div>
          </div>
          <div id="dailyBreakNotice" class="notice"></div>
        </div>
        <div class="modal-footer row">
          <button onclick="saveDailyBreakOverride()">적용</button>
          <button class="danger" onclick="clearDailyBreakOverride()">오버라이드 해제</button>
        </div>
      </div>
    </div>
    ```

14. **`legacyMarkup` — 배정표 섹션에 담당자 패널 div 추가**
    ```html
    <div id="staffBreakPanel" class="staff-break-panel"></div>
    ```
    (scheduleTable 위에 삽입)

15. **`legacyScript` — 기본 담당자 설정 폼 함수 수정**
    - `saveStaff()` in modal: `satBreakStart`/`satBreakEnd` 읽기 추가
    - `editStaff()` in modal: `satBreakStart`/`satBreakEnd` 폼 채우기 추가
    - `resetDefaultStaffForm()`: 새 필드 초기화

16. **`legacyScript` — `renderStaffBreakPanel()` 신규 함수**
    - 현재 모드에서 활성 담당자별 카드 렌더링
    - 유효 휴게 시간(`getEffectiveBreak()`) 표시
    - 오버라이드 적용 중이면 다른 스타일

17. **`legacyScript` — `openDailyBreakModal(staffId)` 신규 함수**
    - 모달 제목, 기본값 안내, 입력 필드 초기값 설정 후 표시

18. **`legacyScript` — `saveDailyBreakOverride()` / `clearDailyBreakOverride()` 신규 함수**
    - `staffBreakOverrides[currentModalStaffId]` 업데이트
    - `renderStaffBreakPanel()`, `renderTable()` 호출
    - `saveData(false)`, `saveToCloud(false)` 호출

19. **`legacyScript` — `window` exports에 신규 함수 등록**

#### Module 3: 배정표 차단 로직 + 빌드/배포

20. **`legacyScript` — `renderTable()` 수정**
    - `isCommonBreak(mode, slot)` 호출 제거
    - `renderRoomCell(room, slot)` 시그니처에서 `isBreak` 파라미터 제거

21. **`legacyScript` — `renderRoomCell()` 수정**
    ```javascript
    const renderRoomCell = (room, slot) => {
      const selectedId = getAssignmentValue(mode, slot, room.id);
      const assignedPerson = selectedId ? staff.find(s => s.id === selectedId) : null;
      const isBreak = assignedPerson ? isResting(mode, assignedPerson, slot) : false;
      ...
    };
    ```
    - 할당된 담당자가 해당 슬롯에 휴게 중이면 `isBreak = true`
    - 미할당 셀: `availableStaffForCell()`이 `isResting()`을 내부적으로 이미 사용

22. **`legacyScript` — `cleanInvalidAssignments()` 확인**
    - 휴게 시간으로 인해 기존 배정이 무효화되는 경우 처리 확인

23. **빌드 + 배포**
    - `npm run build` (react-app)
    - gh-pages 브랜치 업데이트 + push

### 11.3 Session Guide

#### Module Map

| Module | Scope Key | Description | 예상 작업량 |
|--------|-----------|-------------|:-----------:|
| 공통 휴게 제거 + 데이터 모델 | `module-1` | CONFIG 제거, 함수 제거, migrateData/buildData/applyData/isResting 수정 | 중간 |
| UI 추가 (폼 + 패널 + 팝업) | `module-2` | HTML 수정, 신규 렌더링 함수, 팝업 함수 | 중간 |
| 배정표 차단 통합 + 빌드 | `module-3` | renderTable/renderRoomCell 수정, 빌드, 배포 | 소규모 |

#### Recommended Session Plan

| Session | Scope | 내용 |
|---------|-------|------|
| Session 1 | Plan + Design | 완료 |
| Session 2 | `--scope module-1,module-2,module-3` | 전체 구현 (단일 세션 가능) |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-06-26 | Initial draft | tosqjrj-coder |
