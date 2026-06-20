# Room Assignment Management

Vite + React version of the room assignment management table.

## Structure

```txt
src/
 ├─ components/
 │   ├─ Calendar/   월간 달력, 연도/월 선택, 날짜 선택
 │   ├─ Schedule/   날짜별 30분 단위 업무 배정표
 │   └─ Staff/      기본 담당자 설정 모달
 ├─ services/       Firebase Firestore 연동
 ├─ utils/          날짜/시간 생성 유틸
 └─ App.jsx         화면 상태와 데이터 흐름 조합
```

## Firestore Collections

```txt
defaultStaffSettings/default
dailySchedules/YYYY-MM-DD
```

## Commands

```bash
npm install
npm run dev
npm run lint
npm run build
```

Firebase Hosting serves the production build from `react-app/dist`.
