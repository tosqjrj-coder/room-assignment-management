export const rooms = [
  { id: "1",      name: "1번방",  parity: "odd",  autoAssign: true  },
  { id: "2",      name: "2번방",  parity: "even", autoAssign: true  },
  { id: "3",      name: "3번방",  parity: "odd",  autoAssign: true  },
  { id: "4-1",   name: "4-1방", parity: "even", autoAssign: true  },
  { id: "4-2",   name: "4-2방", parity: "even", autoAssign: false },
  { id: "5",      name: "5번방",  parity: "odd",  autoAssign: true  },
  { id: "6",      name: "6번방",  parity: "even", autoAssign: true  },
  { id: "junior", name: "주니어", parity: null,   autoAssign: false },
  { id: "head",   name: "헤드",   parity: null,   autoAssign: false },
];

export const CONFIG = {
  weekday: {
    label: "평일",
    fullLabel: "평일 화·수·목·금",
    dayStart: "10:00",
    dayEnd: "21:00",
    usesShift: true,
    usesParity: true,
    commonBreakStart: null,
    commonBreakEnd: null,
  },
  saturday: {
    label: "토요일",
    fullLabel: "토요일",
    dayStart: "10:00",
    dayEnd: "19:00",
    usesShift: false,
    usesParity: false,
    commonBreakStart: "13:00",
    commonBreakEnd: "14:00",
  },
};

export const dayNames     = ["일", "월", "화", "수", "목", "금", "토"];
export const dayNamesLong = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];

export const staffColors = [
  "#dbeafe", "#dcfce7", "#fef3c7", "#fce7f3", "#ede9fe", "#cffafe",
  "#ffedd5", "#e0e7ff", "#ccfbf1", "#fee2e2", "#ecfccb", "#fae8ff",
];

export const staffBorders = [
  "#60a5fa", "#4ade80", "#facc15", "#f472b6", "#a78bfa", "#22d3ee",
  "#fb923c", "#818cf8", "#2dd4bf", "#f87171", "#a3e635", "#e879f9",
];

export function pad2(value) {
  return String(value).padStart(2, "0");
}

export function uid() {
  return "s_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}

export function toMin(t) {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function toTime(min) {
  const h = String(Math.floor(min / 60)).padStart(2, "0");
  const m = String(min % 60).padStart(2, "0");
  return `${h}:${m}`;
}

export function formatDateKey(date) {
  return date.getFullYear() + "-" + pad2(date.getMonth() + 1) + "-" + pad2(date.getDate());
}

export function parseDateKey(dateKey) {
  const parts = dateKey.split("-").map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

export function shuffle(arr) {
  const copied = [...arr];
  for (let i = copied.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copied[i], copied[j]] = [copied[j], copied[i]];
  }
  return copied;
}

export function overlaps(startA, endA, startB, endB) {
  return startA < endB && endA > startB;
}
