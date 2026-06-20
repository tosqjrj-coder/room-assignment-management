import { useEffect } from 'react'
import './App.css'

const legacyMarkup = `<section id="authScreen" class="auth-screen" aria-label="비밀번호 확인">
    <form id="authForm" class="auth-card">
      <h1>배정표</h1>
      <p>비밀번호를 입력하면 업무표를 열고 Firebase 클라우드 데이터에 자동으로 연결합니다.</p>
      <label for="authPassword">비밀번호</label>
      <input id="authPassword" type="password" autocomplete="current-password" autofocus />
      <button id="authSubmit" type="submit">확인</button>
      <div id="authMessage" class="auth-message" role="status"></div>
    </form>
  </section>

  <header>
    <h1>배정표</h1>
    <p>평일 화·수·목·금 / 토요일 탭 분리 · 4-1/4-2방 분리 · 담당자 중복 방지 · 포인트 합산</p>
  </header>

  <main>
    <section class="card staff-card">
      <h2>담당자 설정</h2>

      <div class="row">
        <div>
          <label>담당자명</label>
          <input id="staffName" placeholder="예: 김OO" />
        </div>
        <div>
          <label>근무 구분</label>
          <div class="check-group">
            <label class="check-label"><input id="worksWeekday" type="checkbox" checked /> 평일</label>
            <label class="check-label"><input id="worksSaturday" type="checkbox" checked /> 토요일</label>
          </div>
        </div>
        <div>
          <label>평일 근무 시작</label>
          <input id="workStart" type="time" value="10:00" step="1800" />
        </div>
        <div>
          <label>평일 근무 종료</label>
          <input id="workEnd" type="time" value="21:00" step="1800" />
        </div>
        <div>
          <label>평일 휴식 시작</label>
          <input id="breakStart" type="time" value="13:00" step="1800" />
        </div>
        <div>
          <label>평일 휴식 종료</label>
          <input id="breakEnd" type="time" value="14:00" step="1800" />
        </div>
        <button id="saveStaffBtn" onclick="saveStaff()">담당자 추가</button>
        <button id="cancelEditBtn" class="secondary" onclick="cancelEdit()" style="display:none;">수정 취소</button>
        <button class="secondary" onclick="saveData()">전체 저장</button>
        <button class="firebase" onclick="saveToCloud()">클라우드 저장</button>
        <button class="firebase" onclick="loadFromCloud(true)">클라우드 불러오기</button>
        <button class="secondary" onclick="loadData(true)">이 PC 불러오기</button>
        <button class="danger" onclick="resetAll()">초기화</button>
      </div>

      <div id="notice" class="notice"></div>
      <div id="staffList" class="staff-list"></div>

      <p class="help">
        담당자별로 평일 근무자와 토요일 근무자를 구분할 수 있습니다. 평일은 담당자별 평일 근무/휴식 시간을 기준으로 배정하고, 토요일은 토요일 근무자로 체크된 담당자만 10:00~19:00 전체 영업시간 기준으로 배정됩니다. 토요일 13:00~14:00은 공통 휴게 시간입니다.
      </p>

      <details class="firebase-settings">
        <summary>Firebase 연결 설정</summary>
        <label>firebaseConfig 전체 붙여넣기</label>
        <textarea id="firebaseConfigPaste" class="firebase-paste" placeholder='const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "project-id.firebaseapp.com",
  projectId: "project-id",
  storageBucket: "project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123:web:abc"
};'></textarea>
        <div class="row" style="margin-bottom:10px;">
          <button class="secondary" onclick="fillFirebaseConfigFromPaste()">자동 입력 및 연결</button>
        </div>
        <div class="firebase-grid">
          <div>
            <label>apiKey</label>
            <input id="firebaseApiKey" placeholder="AIza..." />
          </div>
          <div>
            <label>authDomain</label>
            <input id="firebaseAuthDomain" placeholder="project-id.firebaseapp.com" />
          </div>
          <div>
            <label>projectId</label>
            <input id="firebaseProjectId" placeholder="project-id" />
          </div>
          <div>
            <label>storageBucket</label>
            <input id="firebaseStorageBucket" placeholder="project-id.appspot.com" />
          </div>
          <div>
            <label>messagingSenderId</label>
            <input id="firebaseMessagingSenderId" placeholder="123456789" />
          </div>
          <div>
            <label>appId</label>
            <input id="firebaseAppId" placeholder="1:123:web:abc" />
          </div>
        </div>
        <div class="row">
          <button class="firebase" onclick="saveFirebaseSettings()">Firebase 설정 저장</button>
          <button class="secondary" onclick="testFirebaseConnection()">연결 확인</button>
          <button class="secondary" onclick="clearCloudAccess()">인증 해제</button>
        </div>
        <p class="help">
          Firebase 콘솔에서 웹 앱을 추가한 뒤 표시되는 firebaseConfig 값을 입력하세요. 설정은 이 브라우저에만 저장됩니다.
        </p>
      </details>
    </section>

    <section class="card">
      <h2>자동 배정 설정</h2>

      <div class="tabs controls">
        <button id="tabWeekday" class="tab active" onclick="switchMode('weekday')">평일 화·수·목·금</button>
        <button id="tabSaturday" class="tab" onclick="switchMode('saturday')">토요일</button>
      </div>

      <div class="row controls" id="weekdayControls">
        <div>
          <label>평일 첫 90분 블록 배정 방</label>
          <select id="startParity">
            <option value="odd">1·3·5번방 시작</option>
            <option value="even">2·4·6번방 시작</option>
          </select>
        </div>
      </div>

      <div class="row controls">
        <button onclick="autoFillCurrentMode()">현재 탭 자동 배정</button>
        <button class="secondary" onclick="window.print()">인쇄 / PDF 저장</button>
      </div>

      <div class="rule-box" id="ruleBox"></div>
    </section>

    <section class="card">
      <h2>배정 요약</h2>
      <div class="summary">
        <div class="summary-box">현재 탭<strong id="currentModeLabel">평일</strong></div>
        <div class="summary-box">영업 시간<strong id="businessHoursLabel">10:00~21:00</strong></div>
        <div class="summary-box">전체 시간 구간<strong id="totalSlots">22</strong></div>
        <div class="summary-box">현재 배정 완료<strong id="assignedCount">0</strong></div>
      </div>
    </section>

    <section class="card">
      <h2>담당자별 포인트</h2>
      <div id="pointSummary" class="point-summary"></div>
      <p class="help">
        평일과 토요일 포인트를 각각 구분해서 표시합니다. 30분 배정 1칸을 1포인트로 계산합니다.
      </p>
    </section>

    <section class="card">
      <div class="row controls" style="justify-content: space-between; margin-bottom: 10px;">
        <h2 style="margin:0;">30분 단위 업무 배정</h2>
        <div class="row">
          <button class="danger" onclick="clearCurrentAssignments()">현재 탭 배정 삭제</button>
        </div>
      </div>

      <div class="table-wrap">
        <table id="scheduleTable"></table>
      </div>

      <div class="legend">
        <span><span class="dot ok"></span>배정 완료</span>
        <span><span class="dot bad-dot"></span>선택 가능한 담당자 없음</span>
        <span><span class="dot break-dot"></span>휴게 시간</span>
      </div>
    </section>
  </main>`

const legacyScript = `const rooms = [
      { id: "1", name: "1번방", parity: "odd", autoAssign: true },
      { id: "2", name: "2번방", parity: "even", autoAssign: true },
      { id: "3", name: "3번방", parity: "odd", autoAssign: true },
      { id: "4-1", name: "4-1방", parity: "even", autoAssign: true },
      { id: "4-2", name: "4-2방", parity: "even", autoAssign: false },
      { id: "5", name: "5번방", parity: "odd", autoAssign: true },
      { id: "6", name: "6번방", parity: "even", autoAssign: true },
      { id: "junior", name: "주니어", parity: null, autoAssign: false },
      { id: "head", name: "헤드", parity: null, autoAssign: false }
    ];

    const CONFIG = {
      weekday: {
        label: "평일",
        fullLabel: "평일 화·수·목·금",
        dayStart: "10:00",
        dayEnd: "21:00",
        usesShift: true,
        usesParity: true,
        commonBreakStart: null,
        commonBreakEnd: null
      },
      saturday: {
        label: "토요일",
        fullLabel: "토요일",
        dayStart: "10:00",
        dayEnd: "19:00",
        usesShift: false,
        usesParity: false,
        commonBreakStart: "13:00",
        commonBreakEnd: "14:00"
      }
    };

    const STORAGE_KEY = "roomScheduleAppV22";
    const FIREBASE_CONFIG_KEY = "roomScheduleFirebaseConfig";
    const CLOUD_AUTH_KEY = "roomScheduleCloudAuthenticated";
    const CLOUD_PASSWORD = "room2026";
    const FIRESTORE_COLLECTION = "roomAssignments";
    const FIRESTORE_DOCUMENT = "current";
    const DEFAULT_FIREBASE_CONFIG = {
      apiKey: "AIzaSyB0fDEHLZlMYc4rxU4RQTdbUMNCHvcmzOE",
      authDomain: "task-assignment-8dcee.firebaseapp.com",
      projectId: "task-assignment-8dcee",
      storageBucket: "task-assignment-8dcee.firebasestorage.app",
      messagingSenderId: "539684009478",
      appId: "1:539684009478:web:494171114272baa479b587",
      measurementId: "G-06FWCSC884"
    };

    let activeMode = "weekday";
    let staff = [];
    let assignments = {
      weekday: {},
      saturday: {}
    };
    let editingStaffId = null;
    let firestoreDb = null;
    let cloudSaveTimer = null;
    let firebaseConfig = { ...DEFAULT_FIREBASE_CONFIG };

    const staffColors = [
      "#dbeafe", "#dcfce7", "#fef3c7", "#fce7f3", "#ede9fe", "#cffafe",
      "#ffedd5", "#e0e7ff", "#ccfbf1", "#fee2e2", "#ecfccb", "#fae8ff"
    ];

    const staffBorders = [
      "#60a5fa", "#4ade80", "#facc15", "#f472b6", "#a78bfa", "#22d3ee",
      "#fb923c", "#818cf8", "#2dd4bf", "#f87171", "#a3e635", "#e879f9"
    ];

    function uid() {
      return "s_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
    }

    function toMin(t) {
      if (!t) return null;
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    }

    function toTime(min) {
      const h = String(Math.floor(min / 60)).padStart(2, "0");
      const m = String(min % 60).padStart(2, "0");
      return \`\${h}:\${m}\`;
    }

    function getConfig(mode = activeMode) {
      return CONFIG[mode];
    }

    function getAssignments(mode = activeMode) {
      if (!assignments[mode]) assignments[mode] = {};
      return assignments[mode];
    }

    function setAssignmentValue(mode, slot, roomId, staffId) {
      const map = getAssignments(mode);
      if (staffId) {
        map[roomKey(slot, roomId)] = staffId;
      } else {
        delete map[roomKey(slot, roomId)];
      }
    }

    function getAssignmentValue(mode, slot, roomId) {
      return getAssignments(mode)[roomKey(slot, roomId)] || "";
    }

    function makeSlots(mode = activeMode) {
      const cfg = getConfig(mode);
      const result = [];
      for (let t = toMin(cfg.dayStart); t < toMin(cfg.dayEnd); t += 30) {
        result.push(\`\${toTime(t)}~\${toTime(t + 30)}\`);
      }
      return result;
    }

    function slotStart(slot) {
      return toMin(slot.split("~")[0]);
    }

    function slotEnd(slot) {
      return toMin(slot.split("~")[1]);
    }

    function slotByStart(mode, startMin) {
      const slot = \`\${toTime(startMin)}~\${toTime(startMin + 30)}\`;
      return makeSlots(mode).includes(slot) ? slot : null;
    }

    function adjacentSlotsForBlock(mode, block) {
      if (!block || block.length === 0) return [];
      const sorted = [...block].sort((a, b) => slotStart(a) - slotStart(b));
      const before = slotByStart(mode, slotStart(sorted[0]) - 30);
      const after = slotByStart(mode, slotEnd(sorted[sorted.length - 1]));
      return [before, after].filter(Boolean);
    }

    function blockSlots(mode, startTime, duration = 90) {
      const cfg = getConfig(mode);
      const result = [];
      const start = toMin(startTime);
      const end = Math.min(start + duration, toMin(cfg.dayEnd));

      for (let t = start; t < end; t += 30) {
        const slot = \`\${toTime(t)}~\${toTime(t + 30)}\`;
        if (makeSlots(mode).includes(slot)) result.push(slot);
      }

      return result;
    }

    function roomKey(slot, roomId) {
      return \`\${slot}_\${roomId}\`;
    }

    function parityOfRoom(roomId) {
      const room = rooms.find(r => r.id === String(roomId));
      return room ? room.parity : "odd";
    }

    function isAutoAssignableRoom(roomId) {
      const room = rooms.find(r => r.id === String(roomId));
      return !!(room && room.autoAssign);
    }

    function oppositeParity(parity) {
      return parity === "odd" ? "even" : "odd";
    }

    function parityName(parity) {
      return parity === "odd" ? "1·3·5번방" : "2·4·6번방";
    }

    function shiftType(person) {
      return toMin(person.workStart) < toMin("12:00") ? "morning" : "afternoon";
    }

    function shiftName(type) {
      return type === "morning" ? "오전" : "오후";
    }

    function colorForStaff(id) {
      const idx = staff.findIndex(s => s.id === id);
      return idx >= 0 ? staffColors[idx % staffColors.length] : "#ffffff";
    }

    function borderForStaff(id) {
      const idx = staff.findIndex(s => s.id === id);
      return idx >= 0 ? staffBorders[idx % staffBorders.length] : "#dcdfea";
    }

    function showNotice(msg, type = "info") {
      const el = document.getElementById("notice");
      if (!el) return;
      el.textContent = msg;
      el.className = \`notice show \${type}\`;
      setTimeout(() => el.className = "notice", 4500);
    }

    function shuffle(arr) {
      const copied = [...arr];
      for (let i = copied.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copied[i], copied[j]] = [copied[j], copied[i]];
      }
      return copied;
    }

    function overlaps(startA, endA, startB, endB) {
      return startA < endB && endA > startB;
    }

    function isCommonBreak(mode, slot) {
      const cfg = getConfig(mode);
      if (!cfg.commonBreakStart || !cfg.commonBreakEnd) return false;
      return overlaps(slotStart(slot), slotEnd(slot), toMin(cfg.commonBreakStart), toMin(cfg.commonBreakEnd));
    }

    function isWorking(mode, person, slot) {
      const cfg = getConfig(mode);

      if (isCommonBreak(mode, slot)) return false;

      if (mode === "saturday") {
        if (person.worksSaturday === false) return false;
        return slotStart(slot) >= toMin(cfg.dayStart) && slotEnd(slot) <= toMin(cfg.dayEnd);
      }

      if (person.worksWeekday === false) return false;
      return slotStart(slot) >= toMin(person.workStart) && slotEnd(slot) <= toMin(person.workEnd);
    }

    function isResting(mode, person, slot) {
      if (mode === "saturday") return isCommonBreak(mode, slot);
      if (!person.breakStart || !person.breakEnd) return false;
      return overlaps(slotStart(slot), slotEnd(slot), toMin(person.breakStart), toMin(person.breakEnd));
    }

    function canWork(mode, person, slot) {
      return isWorking(mode, person, slot) && !isResting(mode, person, slot);
    }

    function canWorkBlock(mode, person, block) {
      return block.every(slot => canWork(mode, person, slot));
    }

    function isStaffFreeInSlot(mode, staffId, slot, exceptRoomId = null) {
      return !rooms.some(room => {
        if (exceptRoomId !== null && room.id === exceptRoomId) return false;
        return getAssignmentValue(mode, slot, room.id) === staffId;
      });
    }

    function isStaffFreeInBlock(mode, staffId, block) {
      return block.every(slot => {
        return !rooms.some(room => getAssignmentValue(mode, slot, room.id) === staffId);
      });
    }

    function isRoomFreeInBlock(mode, roomId, block) {
      return block.every(slot => !getAssignmentValue(mode, slot, roomId));
    }

    function assignedStaffIdsInSlot(mode, slot, exceptRoomId = null) {
      const ids = new Set();

      rooms.forEach(room => {
        if (exceptRoomId !== null && room.id === exceptRoomId) return;
        const id = getAssignmentValue(mode, slot, room.id);
        if (id) ids.add(id);
      });

      return ids;
    }

    function availableStaffForCell(mode, slot, roomId) {
      const currentId = getAssignmentValue(mode, slot, roomId);
      const used = assignedStaffIdsInSlot(mode, slot, roomId);

      return staff.filter(person => {
        if (person.id === currentId) return true;
        return canWork(mode, person, slot) && !used.has(person.id);
      });
    }

    function sameRoomAdjacentIds(mode, roomId, block) {
      const ids = [];

      adjacentSlotsForBlock(mode, block).forEach(slot => {
        const id = getAssignmentValue(mode, slot, roomId);
        if (id && !ids.includes(id)) ids.push(id);
      });

      return ids;
    }

    function allAdjacentIds(mode, block) {
      const ids = [];

      adjacentSlotsForBlock(mode, block).forEach(slot => {
        rooms.forEach(room => {
          const id = getAssignmentValue(mode, slot, room.id);
          if (id && !ids.includes(id)) ids.push(id);
        });
      });

      return ids;
    }

    function pickRoomsForBlock(mode, block, count, parity = null, previousRoomIds = []) {
      const autoRooms = rooms.filter(room => room.autoAssign);
      let roomOrder;

      if (mode === "saturday") {
        // 토요일은 담당자 기준이 아니라 방 기준으로, 마지막으로 사용된 5번방/6번방을 우선 피한다.
        const avoidRooms = new Set(previousRoomIds.map(String).filter(id => ["5", "6"].includes(id)));
        const notAvoided = autoRooms.filter(room => !avoidRooms.has(String(room.id)));
        const avoided = autoRooms.filter(room => avoidRooms.has(String(room.id)));
        roomOrder = [...notAvoided, ...avoided];
      } else if (parity) {
        const preferred = autoRooms.filter(room => parityOfRoom(room.id) === parity);
        const others = autoRooms.filter(room => parityOfRoom(room.id) !== parity);
        roomOrder = [...preferred, ...others];
      } else {
        roomOrder = [...autoRooms];
      }

      const picked = [];
      roomOrder.forEach(room => {
        if (picked.length >= count) return;
        if (isRoomFreeInBlock(mode, room.id, block)) picked.push(room);
      });

      return picked;
    }

    function chooseStaffForRooms({ mode, targetRooms, block, baseFilter, initiallyUsed = new Set() }) {
      const used = new Set(initiallyUsed);
      const results = targetRooms.map(room => ({ room, person: null }));

      // 1차: 각 방의 바로 앞/뒤 같은 방 담당자를 최우선 배정
      results.forEach(result => {
        const ids = sameRoomAdjacentIds(mode, result.room.id, block);

        for (const id of ids) {
          if (used.has(id)) continue;

          const person = staff.find(s => s.id === id);
          if (!person) continue;
          if (!baseFilter(person)) continue;

          result.person = person;
          used.add(id);
          break;
        }
      });

      // 2차: 남은 방은 전체 앞/뒤 연결 담당자 우선 후 랜덤
      results.forEach(result => {
        if (result.person) return;

        const adjacentPriority = allAdjacentIds(mode, block);
        const candidates = staff.filter(person => baseFilter(person) && !used.has(person.id));

        const prioritized = adjacentPriority
          .map(id => candidates.find(person => person.id === id))
          .filter(Boolean);

        const prioritizedSet = new Set(prioritized.map(p => p.id));
        const randomRest = shuffle(candidates.filter(person => !prioritizedSet.has(person.id)));
        const chosen = [...prioritized, ...randomRest][0];

        if (chosen) {
          result.person = chosen;
          used.add(chosen.id);
        }
      });

      return results;
    }

    function validateStaffForm(name, workStart, workEnd, breakStart, breakEnd) {
      if (!name) {
        showNotice("담당자명을 입력해주세요.", "error");
        return false;
      }

      const duplicated = staff.some(s => s.name === name && s.id !== editingStaffId);
      if (duplicated) {
        showNotice("동일한 담당자명이 이미 있습니다.", "error");
        return false;
      }

      if (toMin(workStart) >= toMin(workEnd)) {
        showNotice("근무 종료 시간은 근무 시작 시간보다 늦어야 합니다.", "error");
        return false;
      }

      if (breakStart && breakEnd && toMin(breakStart) >= toMin(breakEnd)) {
        showNotice("휴식 종료 시간은 휴식 시작 시간보다 늦어야 합니다.", "error");
        return false;
      }

      return true;
    }

    function saveStaff() {
      const name = document.getElementById("staffName").value.trim();
      const worksWeekday = document.getElementById("worksWeekday").checked;
      const worksSaturday = document.getElementById("worksSaturday").checked;
      const workStart = document.getElementById("workStart").value;
      const workEnd = document.getElementById("workEnd").value;
      const breakStart = document.getElementById("breakStart").value;
      const breakEnd = document.getElementById("breakEnd").value;

      if (!worksWeekday && !worksSaturday) {
        showNotice("평일 또는 토요일 중 최소 1개 근무 구분을 선택해주세요.", "error");
        return;
      }

      if (!validateStaffForm(name, workStart, workEnd, breakStart, breakEnd)) return;

      if (editingStaffId) {
        const target = staff.find(s => s.id === editingStaffId);
        if (target) {
          target.name = name;
          target.worksWeekday = worksWeekday;
          target.worksSaturday = worksSaturday;
          target.workStart = workStart;
          target.workEnd = workEnd;
          target.breakStart = breakStart;
          target.breakEnd = breakEnd;
          cleanInvalidAssignments();
          showNotice("담당자 정보가 수정되었습니다.", "info");
        }
      } else {
        staff.push({ id: uid(), name, worksWeekday, worksSaturday, workStart, workEnd, breakStart, breakEnd });
        showNotice("담당자가 추가되었습니다.", "info");
      }

      cancelEdit();
      renderStaff();
      renderTable();
      saveData(false);
    }

    function editStaff(id) {
      const target = staff.find(s => s.id === id);
      if (!target) return;

      editingStaffId = id;
      document.getElementById("staffName").value = target.name;
      document.getElementById("worksWeekday").checked = target.worksWeekday !== false;
      document.getElementById("worksSaturday").checked = target.worksSaturday !== false;
      document.getElementById("workStart").value = target.workStart;
      document.getElementById("workEnd").value = target.workEnd;
      document.getElementById("breakStart").value = target.breakStart || "";
      document.getElementById("breakEnd").value = target.breakEnd || "";
      document.getElementById("saveStaffBtn").textContent = "수정 저장";
      document.getElementById("cancelEditBtn").style.display = "inline-block";
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function cancelEdit() {
      editingStaffId = null;
      document.getElementById("staffName").value = "";
      document.getElementById("worksWeekday").checked = true;
      document.getElementById("worksSaturday").checked = true;
      document.getElementById("workStart").value = "10:00";
      document.getElementById("workEnd").value = "21:00";
      document.getElementById("breakStart").value = "13:00";
      document.getElementById("breakEnd").value = "14:00";
      document.getElementById("saveStaffBtn").textContent = "담당자 추가";
      document.getElementById("cancelEditBtn").style.display = "none";
    }

    function removeStaff(id) {
      const target = staff.find(s => s.id === id);
      if (!target) return;
      if (!confirm(\`\${target.name} 담당자를 삭제할까요? 기존 배정도 함께 삭제됩니다.\`)) return;

      staff = staff.filter(s => s.id !== id);

      Object.keys(assignments).forEach(mode => {
        Object.keys(assignments[mode]).forEach(key => {
          if (assignments[mode][key] === id) delete assignments[mode][key];
        });
      });

      if (editingStaffId === id) cancelEdit();

      renderStaff();
      renderTable();
      saveData(false);
      showNotice("담당자가 삭제되었습니다.", "info");
    }

    function renderStaff() {
      const list = document.getElementById("staffList");
      list.innerHTML = "";

      if (staff.length === 0) {
        list.innerHTML = \`<div class="staff-item"><span>아직 등록된 담당자가 없습니다.</span></div>\`;
        return;
      }

      staff.forEach(s => {
        const div = document.createElement("div");
        div.className = "staff-item";
        div.innerHTML = \`
          <div>
            <strong><span class="color-chip" style="background:\${colorForStaff(s.id)}; border-color:\${borderForStaff(s.id)};"></span>\${s.name}</strong>
            <span>근무 구분: \${s.worksWeekday !== false ? "평일" : ""}\${s.worksWeekday !== false && s.worksSaturday !== false ? " / " : ""}\${s.worksSaturday !== false ? "토요일" : ""}</span>
            <span>평일 근무 \${s.workStart}~\${s.workEnd} / \${shiftName(shiftType(s))} 출근자</span>
            <span>평일 휴식 \${s.breakStart || "-"}~\${s.breakEnd || "-"}</span>
            <span>토요일 근무자는 10:00~19:00 전체 근무 / 13:00~14:00 공통 휴게</span>
          </div>
          <div class="staff-actions">
            <button class="secondary" onclick="editStaff('\${s.id}')">수정</button>
            <button class="danger" onclick="removeStaff('\${s.id}')">삭제</button>
          </div>
        \`;
        list.appendChild(div);
      });
    }

    function setAssignment(mode, slot, roomId, selectedStaffId) {
      if (!selectedStaffId) {
        setAssignmentValue(mode, slot, roomId, "");
        renderTable();
        saveData(false);
        return;
      }

      const person = staff.find(s => s.id === selectedStaffId);
      if (!person) return;

      if (!canWork(mode, person, slot)) {
        showNotice(\`\${person.name}님은 해당 시간에 근무 가능 상태가 아닙니다.\`, "error");
        renderTable();
        return;
      }

      if (!isStaffFreeInSlot(mode, selectedStaffId, slot, roomId)) {
        showNotice(\`\${person.name}님은 이미 같은 시간대에 다른 방에 배정되어 있습니다.\`, "error");
        renderTable();
        return;
      }

      setAssignmentValue(mode, slot, roomId, selectedStaffId);

      if (mode === "weekday") {
        autoFillWeekdaySameParityFromManual(slot, roomId, selectedStaffId);
      }

      renderTable();
      saveData(false);
    }

    function autoFillWeekdaySameParityFromManual(slot, fixedRoomId, fixedStaffId) {
      const mode = "weekday";
      if (!isAutoAssignableRoom(fixedRoomId)) return;

      const parity = parityOfRoom(fixedRoomId);
      const targetRooms = rooms
        .filter(room => room.autoAssign && parityOfRoom(room.id) === parity && room.id !== String(fixedRoomId));

      // 자동 대상 방은 기존 값을 유지하지 않고 다시 계산한다.
      targetRooms.forEach(room => {
        setAssignmentValue(mode, slot, room.id, "");
      });

      const used = assignedStaffIdsInSlot(mode, slot);
      used.add(fixedStaffId);

      const chosen = chooseStaffForRooms({
        mode,
        targetRooms,
        block: [slot],
        baseFilter: person => canWork(mode, person, slot) && isStaffFreeInSlot(mode, person.id, slot),
        initiallyUsed: used
      });

      chosen.forEach(item => {
        if (item.person) {
          setAssignmentValue(mode, slot, item.room.id, item.person.id);
        }
      });

      const filled = targetRooms.filter(room => getAssignmentValue(mode, slot, room.id)).length;
      if (filled < targetRooms.length) {
        showNotice(\`\${slot} \${parityName(parity)} 자동 배정 중 일부 방을 채우지 못했습니다.\`, "warn");
      } else {
        showNotice(\`\${slot} \${parityName(parity)} 자동 배정 완료\`, "info");
      }
    }

    function autoFillCurrentMode() {
      if (staff.length === 0) {
        showNotice("담당자를 먼저 등록해주세요.", "error");
        return;
      }

      if (activeMode === "weekday") {
        autoFillWeekday();
      } else {
        autoFillSaturday();
      }
    }

    function autoFillWeekday() {
      assignments.weekday = {};

      let parity = document.getElementById("startParity").value;
      const warnings = [];

      getWeekdayBlocks().forEach(blockInfo => {
        const result = assignWeekdayBlock(blockInfo.start, blockInfo.shift, parity, blockInfo.label);
        if (result.warning) warnings.push(result.warning);
        parity = oppositeParity(parity);
      });

      cleanInvalidAssignments();
      renderTable();
      saveData(false);

      if (warnings.length > 0) {
        showNotice(warnings.slice(0, 2).join(" / ") + (warnings.length > 2 ? \` 외 \${warnings.length - 2}건\` : ""), "warn");
      } else {
        showNotice("평일 자동 배정이 완료되었습니다.", "info");
      }
    }

    function getWeekdayBlocks() {
      return [
        { shift: "morning", start: "10:00", label: "오전" },
        { shift: "afternoon", start: "12:00", label: "오후" },
        { shift: "morning", start: "11:30", label: "오전" },
        { shift: "afternoon", start: "13:30", label: "오후" },
        { shift: "morning", start: "14:00", label: "오전" },
        { shift: "afternoon", start: "16:00", label: "오후" },
        { shift: "morning", start: "15:30", label: "오전" },
        { shift: "afternoon", start: "18:00", label: "오후" },
        { shift: "morning", start: "17:30", label: "오전" },
        { shift: "afternoon", start: "19:30", label: "오후" }
      ].sort((a, b) => toMin(a.start) - toMin(b.start));
    }

    function assignWeekdayBlock(startTime, shift, parity, label) {
      const mode = "weekday";
      const block = blockSlots(mode, startTime, 90);
      const targetRooms = pickRoomsForBlock(mode, block, 3, parity);

      if (block.length === 0) {
        return { warning: \`\${label} \${startTime} 블록이 운영 시간 밖입니다.\` };
      }

      const chosen = chooseStaffForRooms({
        mode,
        targetRooms,
        block,
        baseFilter: person => {
          return shiftType(person) === shift &&
            canWorkBlock(mode, person, block) &&
            isStaffFreeInBlock(mode, person.id, block);
        },
        initiallyUsed: new Set()
      });

      block.forEach(slot => {
        chosen.forEach(item => {
          if (item.person) setAssignmentValue(mode, slot, item.room.id, item.person.id);
        });
      });

      const filled = chosen.filter(item => item.person).length;
      if (targetRooms.length < 3) {
        return { warning: \`\${label} \${startTime} 블록은 비어 있는 방이 부족하여 \${targetRooms.length}명만 배정되었습니다.\` };
      }
      if (filled < targetRooms.length) {
        return { warning: \`\${label} \${startTime} 블록은 근무 가능 담당자가 부족하여 \${filled}명만 배정되었습니다.\` };
      }

      return { warning: "" };
    }

    function autoFillSaturday() {
      assignments.saturday = {};
      const warnings = [];
      let lastSpecialRoomIds = [];

      getSaturdayBlocks().forEach(blockInfo => {
        const result = assignSaturdayBlock(blockInfo.start, blockInfo.count, lastSpecialRoomIds);

        if (result.specialRoomIds && result.specialRoomIds.length > 0) {
          lastSpecialRoomIds = result.specialRoomIds;
        }

        if (result.warning) warnings.push(result.warning);
      });

      cleanInvalidAssignments();
      renderTable();
      saveData(false);

      if (warnings.length > 0) {
        showNotice(warnings.slice(0, 2).join(" / ") + (warnings.length > 2 ? \` 외 \${warnings.length - 2}건\` : ""), "warn");
      } else {
        showNotice("토요일 자동 배정이 완료되었습니다.", "info");
      }
    }

    function getSaturdayBlocks() {
      return [
        { start: "10:00", count: 5 },
        { start: "11:30", count: 5 },
        { start: "14:00", count: 3 },
        { start: "14:30", count: 2 },
        { start: "15:30", count: 3 },
        { start: "16:00", count: 2 },
        { start: "17:00", count: 3 },
        { start: "17:30", count: 2 }
      ];
    }

    function chooseStaffForSaturdayRooms({ targetRooms, block, baseFilter }) {
      const used = new Set();
      const results = targetRooms.map(room => ({ room, person: null }));

      results.forEach(result => {
        const candidates = shuffle(staff.filter(person => {
          return baseFilter(person) && !used.has(person.id);
        }));

        if (candidates.length > 0) {
          result.person = candidates[0];
          used.add(candidates[0].id);
        }
      });

      return results;
    }

    function assignSaturdayBlock(startTime, count, avoidSpecialRoomIds = []) {
      const mode = "saturday";
      const block = blockSlots(mode, startTime, 90);
      const targetRooms = pickRoomsForBlock(mode, block, count, null, avoidSpecialRoomIds);

      if (block.length === 0) {
        return { warning: \`토요일 \${startTime} 블록이 운영 시간 밖입니다.\`, roomIds: [], specialRoomIds: [] };
      }

      const chosen = chooseStaffForSaturdayRooms({
        targetRooms,
        block,
        baseFilter: person => {
          return canWorkBlock(mode, person, block) &&
            isStaffFreeInBlock(mode, person.id, block);
        }
      });

      block.forEach(slot => {
        chosen.forEach(item => {
          if (item.person) setAssignmentValue(mode, slot, item.room.id, item.person.id);
        });
      });

      const filled = chosen.filter(item => item.person).length;
      const specialRoomIds = chosen
        .filter(item => item.person && ["5", "6"].includes(String(item.room.id)))
        .map(item => String(item.room.id));
      if (targetRooms.length < count) {
        return { warning: \`토요일 \${startTime} 블록은 비어 있는 방이 부족하여 \${targetRooms.length}명만 배정되었습니다.\`, roomIds: chosen.filter(item => item.person).map(item => item.room.id), specialRoomIds };
      }
      if (filled < targetRooms.length) {
        return { warning: \`토요일 \${startTime} 블록은 근무 가능 담당자가 부족하여 \${filled}명만 배정되었습니다.\`, roomIds: chosen.filter(item => item.person).map(item => item.room.id), specialRoomIds };
      }

      return { warning: "", roomIds: chosen.filter(item => item.person).map(item => item.room.id), specialRoomIds };
    }

    function clearSlot(mode, slot) {
      rooms.forEach(room => setAssignmentValue(mode, slot, room.id, ""));
      renderTable();
      saveData(false);
    }

    function clearCurrentAssignments() {
      if (!confirm("현재 탭의 배정을 삭제할까요? 담당자 설정은 유지됩니다.")) return;
      assignments[activeMode] = {};
      renderTable();
      saveData(false);
      showNotice("현재 탭 배정을 삭제했습니다.", "info");
    }

    function cleanInvalidAssignments() {
      Object.keys(assignments).forEach(mode => {
        makeSlots(mode).forEach(slot => {
          const used = new Set();

          rooms.forEach(room => {
            const key = roomKey(slot, room.id);
            const id = assignments[mode][key];
            if (!id) return;

            const person = staff.find(s => s.id === id);

            if (!person || !canWork(mode, person, slot) || used.has(id)) {
              delete assignments[mode][key];
              return;
            }

            used.add(id);
          });
        });
      });
    }

    function updateSummary() {
      const mode = activeMode;
      const assigned = Object.values(getAssignments(mode)).filter(Boolean).length;
      const slots = makeSlots(mode);
      const cfg = getConfig(mode);

      document.getElementById("currentModeLabel").textContent = cfg.label;
      document.getElementById("businessHoursLabel").textContent = \`\${cfg.dayStart}~\${cfg.dayEnd}\`;
      document.getElementById("totalSlots").textContent = slots.length;
      document.getElementById("assignedCount").textContent = assigned;
      updatePointSummary();
    }

    function getPointMap(mode = activeMode) {
      const points = {};
      staff.forEach(s => points[s.id] = 0);

      Object.values(getAssignments(mode)).forEach(id => {
        if (!id) return;
        if (points[id] === undefined) points[id] = 0;
        points[id] += 1;
      });

      return points;
    }

    function renderPointCardsForMode(mode) {
      const points = getPointMap(mode);

      if (staff.length === 0) {
        return \`<div class="point-card"><div class="sub">담당자를 등록하면 포인트가 표시됩니다.</div></div>\`;
      }

      return staff.map(s => {
        const point = points[s.id] || 0;
        const minutes = point * 30;
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        const timeText = h > 0 ? \`\${h}시간\${m ? " " + m + "분" : ""}\` : \`\${m}분\`;

        return \`
          <div class="point-card" style="background:\${colorForStaff(s.id)}; border-left:5px solid \${borderForStaff(s.id)};">
            <div class="name"><span class="color-chip" style="background:\${colorForStaff(s.id)}; border-color:\${borderForStaff(s.id)};"></span>\${s.name}</div>
            <div class="point">\${point} P</div>
            <div class="sub">\${timeText} 배정</div>
          </div>
        \`;
      }).join("");
    }

    function totalPointsForMode(mode) {
      return Object.values(getPointMap(mode)).reduce((sum, value) => sum + value, 0);
    }

    function updatePointSummary() {
      const el = document.getElementById("pointSummary");
      const weekdayTotal = totalPointsForMode("weekday");
      const saturdayTotal = totalPointsForMode("saturday");

      el.innerHTML = \`
        <div class="point-section">
          <h3>평일 포인트 <span class="section-sub">총 \${weekdayTotal} P</span></h3>
          <div class="point-grid">\${renderPointCardsForMode("weekday")}</div>
        </div>
        <div class="point-section">
          <h3>토요일 포인트 <span class="section-sub">총 \${saturdayTotal} P</span></h3>
          <div class="point-grid">\${renderPointCardsForMode("saturday")}</div>
        </div>
      \`;
    }

    function renderRules() {
      const box = document.getElementById("ruleBox");

      if (activeMode === "weekday") {
        box.innerHTML = \`
          <div class="rule">
            <strong>평일 영업시간</strong>
            화·수·목·금 10:00~21:00 기준입니다.
          </div>
          <div class="rule">
            <strong>평일 자동 배정</strong>
            오전/오후 출근자를 구분하고, 선택한 첫 블록 기준에 따라 1·3·5번방 또는 2·4·6번방을 우선 배정합니다.
          </div>
          <div class="rule">
            <strong>오전 마지막 배정 기준</strong>
            오전 타임 마지막 자동 배정 시작 시간은 17:30으로 고정되어 있습니다.
          </div>
          <div class="rule">
            <strong>4-1방 / 4-2방 기준</strong>
            4번방은 4-1방과 4-2방으로 분리됩니다. 자동 배정은 4-1방만 사용하고, 4-2방은 수동 배정 전용입니다.
          </div>
          <div class="rule">
            <strong>자동 배정 우선순위</strong>
            각 방별로 같은 방의 바로 앞/뒤 담당자를 1차 우선 배정하고, 남는 방만 랜덤 배정합니다.
          </div>
        \`;
      } else {
        box.innerHTML = \`
          <div class="rule">
            <strong>토요일 영업시간</strong>
            토요일은 10:00~19:00 기준이며, 13:00~14:00은 공통 휴게 시간입니다. 토요일 근무자로 체크된 담당자만 자동/수동 배정 후보가 됩니다.
          </div>
          <div class="rule">
            <strong>토요일 근무 기준</strong>
            오전/오후 출근자 구분 없이 토요일 근무자로 체크된 담당자가 영업시간 전체 근무 기준으로 배정됩니다.
          </div>
          <div class="rule">
            <strong>토요일 자동 배정</strong>
            10:00 5명, 11:30 5명, 14:00 3명, 14:30 2명, 15:30 3명, 16:00 2명, 17:00 3명, 17:30 2명으로 배정합니다.
          </div>
          <div class="rule">
            <strong>4-1방 / 4-2방 기준</strong>
            4번방은 4-1방과 4-2방으로 분리됩니다. 자동 배정은 4-1방만 사용하고, 4-2방은 수동 배정 전용입니다.
          </div>
          <div class="rule">
            <strong>토요일 방 기준</strong>
            짝수방/홀수방 조건은 적용하지 않습니다. 5번방과 6번방은 담당자와 관계없이, 마지막으로 사용된 5·6번방을 기억해 다음 90분 자동 배정에서는 반대 방을 우선 사용합니다. 4-2방은 자동 배정하지 않습니다.
          </div>
        \`;
      }
    }

    function renderTable() {
      const mode = activeMode;
      const slots = makeSlots(mode);
      const table = document.getElementById("scheduleTable");
      const freezeRoomClass = {
        "1": "freeze-room-1",
        "2": "freeze-room-2",
        "3": "freeze-room-3",
        "4-1": "freeze-room-4-1",
        "4-2": "freeze-room-4-2",
        "5": "freeze-room-5",
        "6": "freeze-room-6",
        "junior": "freeze-room-junior",
        "head": "freeze-room-head"
      };

      const renderRoomCell = (room, slot, isBreak) => {
        const selectedId = getAssignmentValue(mode, slot, room.id);
        const options = availableStaffForCell(mode, slot, room.id);
        const noStaff = !selectedId && staff.length > 0 && options.length === 0 && !isBreak;
        const freezeClass = freezeRoomClass[String(room.id)] ? \` freeze-col \${freezeRoomClass[String(room.id)]}\${String(room.id) === "head" ? " freeze-last" : ""}\` : "";
        const cls = isBreak ? \`break-time room-col\${freezeClass}\` : selectedId ? \`assigned room-col\${freezeClass}\` : noStaff ? \`no-staff room-col\${freezeClass}\` : \`room-col\${freezeClass}\`;
        const bg = selectedId ? \`background:\${colorForStaff(selectedId)}; border-left:4px solid \${borderForStaff(selectedId)};\` : "";
        const selectBg = selectedId ? \`background:\${colorForStaff(selectedId)};\` : "";

        let cellHtml = \`<td class="\${cls}" style="\${bg}">\`;

        if (isBreak) {
          cellHtml += \`<select disabled><option>휴게</option></select>\`;
        } else {
          cellHtml += \`<select onchange="setAssignment('\${mode}', '\${slot}', '\${room.id}', this.value)" style="\${selectBg}">\`;
          cellHtml += \`<option value="">-</option>\`;

          options.forEach(person => {
            const selected = selectedId === person.id ? "selected" : "";
            cellHtml += \`<option value="\${person.id}" \${selected}>\${person.name}</option>\`;
          });

          cellHtml += \`</select>\`;
        }

        cellHtml += \`</td>\`;
        return cellHtml;
      };

      let html = "<thead><tr>";
      html += '<th class="time-col freeze-col freeze-time">시간</th>';
      html += '<th class="delete-col freeze-col freeze-delete">삭제</th>';
      rooms.forEach(room => {
        const freezeClass = freezeRoomClass[String(room.id)] ? \` freeze-col \${freezeRoomClass[String(room.id)]}\${String(room.id) === "head" ? " freeze-last" : ""}\` : "";
        html += \`<th class="room-col\${freezeClass}">\${room.name}</th>\`;
      });
      html += "</tr></thead><tbody>";

      slots.forEach(slot => {
        const isBreak = isCommonBreak(mode, slot);
        html += \`<tr>\`;
        html += \`<td class="time-col freeze-col freeze-time">\${slot}</td>\`;
        html += \`<td class="delete-col freeze-col freeze-delete"><button class="danger" onclick="clearSlot('\${mode}', '\${slot}')">삭제</button></td>\`;
        rooms.forEach(room => html += renderRoomCell(room, slot, isBreak));
        html += \`</tr>\`;
      });

      html += "</tbody>";
      table.innerHTML = html;

      document.getElementById("tabWeekday").classList.toggle("active", activeMode === "weekday");
      document.getElementById("tabSaturday").classList.toggle("active", activeMode === "saturday");
      document.getElementById("weekdayControls").style.display = activeMode === "weekday" ? "flex" : "none";

      renderRules();
      updateSummary();
    }

    function switchMode(mode) {
      activeMode = mode;
      renderTable();
      saveData(false);
    }

    function buildData() {
      return {
        version: 22,
        activeMode,
        staff,
        assignments,
        settings: {
          startParity: document.getElementById("startParity").value
        }
      };
    }

    function applyData(rawData) {
      const migrated = migrateData(rawData);

      activeMode = migrated.activeMode === "saturday" ? "saturday" : "weekday";
      staff = migrated.staff;
      assignments = migrated.assignments;

      if (migrated.settings.startParity) {
        document.getElementById("startParity").value = migrated.settings.startParity;
      }

      cleanInvalidAssignments();
      renderStaff();
      renderTable();
    }

    function getFirebaseInputConfig() {
      return {
        apiKey: document.getElementById("firebaseApiKey").value.trim(),
        authDomain: document.getElementById("firebaseAuthDomain").value.trim(),
        projectId: document.getElementById("firebaseProjectId").value.trim(),
        storageBucket: document.getElementById("firebaseStorageBucket").value.trim(),
        messagingSenderId: document.getElementById("firebaseMessagingSenderId").value.trim(),
        appId: document.getElementById("firebaseAppId").value.trim()
      };
    }

    function setFirebaseInputConfig(config) {
      document.getElementById("firebaseApiKey").value = config.apiKey || "";
      document.getElementById("firebaseAuthDomain").value = config.authDomain || "";
      document.getElementById("firebaseProjectId").value = config.projectId || "";
      document.getElementById("firebaseStorageBucket").value = config.storageBucket || "";
      document.getElementById("firebaseMessagingSenderId").value = config.messagingSenderId || "";
      document.getElementById("firebaseAppId").value = config.appId || "";
    }

    function parseFirebaseConfigText(text) {
      const config = {};
      const keys = ["apiKey", "authDomain", "projectId", "storageBucket", "messagingSenderId", "appId", "measurementId"];

      keys.forEach(key => {
        const match = text.match(new RegExp(\`\${key}\\s*:\\s*["']([^"']+)["']\`));
        if (match) config[key] = match[1];
      });

      return config;
    }

    async function fillFirebaseConfigFromPaste() {
      showNotice(hasCloudAccess() ? "Firebase 자동 입력 및 연결을 시작합니다." : "Firebase 자동 입력을 시작합니다. 비밀번호를 입력해주세요.", "info");
      if (!requestCloudAccess()) return;

      const text = document.getElementById("firebaseConfigPaste").value.trim();
      const parsed = text ? parseFirebaseConfigText(text) : {};
      const nextConfig = { ...DEFAULT_FIREBASE_CONFIG, ...parsed };

      document.getElementById("firebaseConfigPaste").value = \`const firebaseConfig = {
  apiKey: "\${nextConfig.apiKey}",
  authDomain: "\${nextConfig.authDomain}",
  projectId: "\${nextConfig.projectId}",
  storageBucket: "\${nextConfig.storageBucket}",
  messagingSenderId: "\${nextConfig.messagingSenderId}",
  appId: "\${nextConfig.appId}",
  measurementId: "\${nextConfig.measurementId || ""}"
};\`;

      if (!parsed.apiKey || !parsed.projectId || !parsed.appId) {
        showNotice("기본 Firebase 설정값을 자동 입력했습니다. 연결을 확인하는 중입니다...", "info");
      } else {
        showNotice("붙여넣은 Firebase 설정값을 자동 입력했습니다. 연결을 확인하는 중입니다...", "info");
      }

      setFirebaseInputConfig(nextConfig);
      await saveFirebaseSettings();
      await verifyFirebaseConnection();
    }

    function hasCloudAccess() {
      return !CLOUD_PASSWORD || localStorage.getItem(CLOUD_AUTH_KEY) === "true";
    }

    function setAppLocked(locked) {
      document.body.classList.toggle("auth-locked", locked);
      const authScreen = document.getElementById("authScreen");
      if (authScreen) authScreen.style.display = locked ? "grid" : "none";

      if (locked) {
        const input = document.getElementById("authPassword");
        if (input) {
          input.value = "";
          setTimeout(() => input.focus(), 0);
        }
      }
    }

    function showAuthMessage(message, type = "error") {
      const el = document.getElementById("authMessage");
      if (!el) return;
      el.textContent = message;
      el.className = \`auth-message \${type}\`;
    }

    async function unlockAppWithPassword(password) {
      if (CLOUD_PASSWORD && password !== CLOUD_PASSWORD) {
        showAuthMessage("비밀번호가 올바르지 않습니다.");
        return;
      }

      localStorage.setItem(CLOUD_AUTH_KEY, "true");
      showAuthMessage("Firebase에 연결하는 중입니다...", "info");
      setAppLocked(false);
      loadFirebaseSettings();
      await loadFromCloud(true, { skipAccessPrompt: true });
    }

    function setupAuthScreen() {
      const form = document.getElementById("authForm");
      if (!form) return;

      form.addEventListener("submit", async event => {
        event.preventDefault();
        const input = document.getElementById("authPassword");
        const button = document.getElementById("authSubmit");
        if (button) button.disabled = true;

        try {
          await unlockAppWithPassword(input ? input.value : "");
        } finally {
          if (button) button.disabled = false;
        }
      });
    }

    function requestCloudAccess() {
      if (hasCloudAccess()) return true;
      if (!CLOUD_PASSWORD) return true;

      const input = prompt("클라우드 기능 사용 비밀번호를 입력하세요.");
      if (input === CLOUD_PASSWORD) {
        localStorage.setItem(CLOUD_AUTH_KEY, "true");
        showNotice("클라우드 기능 인증이 완료되었습니다.", "info");
        return true;
      }

      if (input !== null) {
        showNotice("비밀번호가 올바르지 않습니다.", "error");
      }
      return false;
    }

    function clearCloudAccess() {
      localStorage.removeItem(CLOUD_AUTH_KEY);
      setAppLocked(true);
      showNotice("클라우드 인증이 해제되었습니다.", "info");
    }

    function loadFirebaseSettings() {
      try {
        const saved = JSON.parse(localStorage.getItem(FIREBASE_CONFIG_KEY) || "{}");
        firebaseConfig = { ...DEFAULT_FIREBASE_CONFIG, ...saved };
      } catch (e) {
        firebaseConfig = { ...DEFAULT_FIREBASE_CONFIG };
      }
      setFirebaseInputConfig(firebaseConfig);
    }

    async function saveFirebaseSettings() {
      const nextConfig = getFirebaseInputConfig();
      firebaseConfig = { ...DEFAULT_FIREBASE_CONFIG, ...nextConfig };
      localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(firebaseConfig));
      firestoreDb = null;
      if (window.firebase && firebase.apps && firebase.apps.length) {
        await Promise.all(firebase.apps.map(app => app.delete()));
      }
      showNotice("Firebase 설정이 저장되었습니다. 이제 클라우드 저장/불러오기를 사용할 수 있습니다.", "info");
    }

    function isFirebaseConfigured() {
      return firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId;
    }

    function getFirestoreDb() {
      if (!isFirebaseConfigured()) return null;
      if (firestoreDb) return firestoreDb;
      if (!window.firebase || !window.firebase.firestore) return null;

      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }

      firestoreDb = firebase.firestore();
      return firestoreDb;
    }

    async function testFirebaseConnection() {
      if (!requestCloudAccess()) return;

      await saveFirebaseSettings();
      await verifyFirebaseConnection();
    }

    async function verifyFirebaseConnection() {
      const db = getFirestoreDb();
      if (!db) {
        showNotice("Firebase 설정값을 확인해주세요.", "error");
        return;
      }

      try {
        await db.collection(FIRESTORE_COLLECTION).doc("_connectionTest").set({
          ok: true,
          checkedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        showNotice("Firestore 연결이 확인되었습니다.", "info");
      } catch (e) {
        showNotice(\`Firestore 연결 실패: \${cloudErrorMessage(e)}\`, "error");
      }
    }

    function saveData(show = true, options = {}) {
      const data = buildData();

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

      if (show) showNotice("저장되었습니다.", "info");
    }

    function queueCloudSave() {
      return;
    }

    async function saveToCloud(show = true, options = {}) {
      if (show) showNotice(hasCloudAccess() ? "클라우드 저장을 시작합니다." : "클라우드 저장을 시작합니다. 비밀번호를 입력해주세요.", "info");
      if (!requestCloudAccess()) return;
      if (show) showNotice("클라우드에 저장 중입니다...", "info");

      const db = getFirestoreDb();
      if (!db) {
        showNotice("Firebase 설정값을 먼저 입력해야 클라우드 저장이 가능합니다.", "error");
        return;
      }

      try {
        await db.collection(FIRESTORE_COLLECTION).doc(FIRESTORE_DOCUMENT).set({
          ...buildData(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        if (show) showNotice("클라우드에 저장되었습니다.", "info");
      } catch (e) {
        showNotice(\`클라우드 저장 실패: \${cloudErrorMessage(e)}\`, "error");
      }
    }

    async function loadFromCloud(show = false, options = {}) {
      if (show) showNotice(hasCloudAccess() ? "클라우드 불러오기를 시작합니다." : "클라우드 불러오기를 시작합니다. 비밀번호를 입력해주세요.", "info");
      if (!hasCloudAccess()) {
        if (show && !options.skipAccessPrompt && !requestCloudAccess()) return;
        if (!hasCloudAccess()) {
          loadData(false);
          return;
        }
      }
      if (show) showNotice("클라우드에서 불러오는 중입니다...", "info");
      const db = getFirestoreDb();
      if (!db) {
        loadData(show);
        if (show) showNotice("Firebase 설정값이 없어 이 PC 저장 데이터를 불러왔습니다.", "error");
        return;
      }

      try {
        const snap = await db.collection(FIRESTORE_COLLECTION).doc(FIRESTORE_DOCUMENT).get();
        if (!snap.exists) {
          loadData(false);
          if (show) showNotice("클라우드 저장 데이터가 아직 없습니다. 먼저 클라우드 저장을 실행해주세요.", "info");
          return;
        }

        applyData(snap.data());
        localStorage.setItem(STORAGE_KEY, JSON.stringify(buildData()));
        if (show) showNotice("클라우드에서 불러왔습니다.", "info");
      } catch (e) {
        loadData(false);
        showNotice(\`클라우드 불러오기 실패: \${cloudErrorMessage(e)}\`, "error");
      }
    }

    function cloudErrorMessage(error) {
      const code = error && error.code ? String(error.code) : "";
      const message = error && error.message ? String(error.message) : "";

      if (code.includes("permission-denied")) {
        return "Firestore 규칙에서 읽기/쓰기가 차단되었습니다.";
      }

      if (code.includes("not-found") || message.includes("404")) {
        return "Firestore Database가 없거나 저장 문서가 아직 없습니다.";
      }

      if (code.includes("unavailable")) {
        return "Firestore 서버에 연결할 수 없습니다. 네트워크를 확인해주세요.";
      }

      return code || message || "Firebase 설정과 Firestore 규칙을 확인해주세요.";
    }

    function normalizeAssignments(rawAssignments, migratedStaff) {
      const result = { weekday: {}, saturday: {} };

      if (!rawAssignments) return result;

      const looksTabbed = rawAssignments.weekday || rawAssignments.saturday;

      if (looksTabbed) {
        ["weekday", "saturday"].forEach(mode => {
          const source = rawAssignments[mode] || {};
          Object.keys(source).forEach(key => {
            const value = source[key];
            const person = migratedStaff.find(s => s.id === value || s.name === value);
            if (person) result[mode][key] = person.id;
          });
        });
      } else {
        Object.keys(rawAssignments).forEach(key => {
          const value = rawAssignments[key];
          const person = migratedStaff.find(s => s.id === value || s.name === value);
          if (person) result.weekday[key] = person.id;
        });
      }

      return result;
    }

    function migrateData(rawData) {
      const migratedStaff = (rawData.staff || []).map(s => ({
        id: s.id || uid(),
        name: s.name,
        worksWeekday: s.worksWeekday !== false,
        worksSaturday: s.worksSaturday !== false,
        workStart: s.workStart || "10:00",
        workEnd: s.workEnd || "21:00",
        breakStart: s.breakStart || "",
        breakEnd: s.breakEnd || ""
      }));

      return {
        activeMode: rawData.activeMode || "weekday",
        staff: migratedStaff,
        assignments: normalizeAssignments(rawData.assignments, migratedStaff),
        settings: rawData.settings || {}
      };
    }

    function loadData(show = false) {
      const keys = [
        "roomScheduleAppV22", "roomScheduleAppV14", "roomScheduleAppV13", "roomScheduleAppV12",
        "roomScheduleAppV11", "roomScheduleAppV10", "roomScheduleAppV9", "roomScheduleAppV8",
        "roomScheduleAppV7", "roomScheduleAppV6", "roomScheduleAppV5", "roomScheduleAppV4",
        "roomScheduleAppV3", "roomScheduleAppV2", "roomScheduleApp"
      ];

      const foundKey = keys.find(key => localStorage.getItem(key));
      if (!foundKey) {
        renderStaff();
        renderTable();
        return;
      }

      try {
        const raw = JSON.parse(localStorage.getItem(foundKey));
        applyData(raw);

        if (foundKey !== STORAGE_KEY) {
          saveData(false, { cloud: false });
          showNotice("기존 저장 데이터를 새 버전으로 불러왔습니다.", "info");
        } else if (show) {
          showNotice("불러왔습니다.", "info");
        }
      } catch (e) {
        showNotice("저장 데이터를 불러오지 못했습니다.", "error");
        renderStaff();
        renderTable();
      }
    }

    function resetAll() {
      if (!confirm("전체 데이터를 초기화할까요?")) return;

      staff = [];
      assignments = { weekday: {}, saturday: {} };
      activeMode = "weekday";

      [
        "roomScheduleAppV22", "roomScheduleAppV14", "roomScheduleAppV13", "roomScheduleAppV12",
        "roomScheduleAppV11", "roomScheduleAppV10", "roomScheduleAppV9", "roomScheduleAppV8",
        "roomScheduleAppV7", "roomScheduleAppV6", "roomScheduleAppV5", "roomScheduleAppV4",
        "roomScheduleAppV3", "roomScheduleAppV2", "roomScheduleApp"
      ].forEach(key => localStorage.removeItem(key));

      cancelEdit();
      renderStaff();
      renderTable();
      showNotice("초기화되었습니다.", "info");
    }

    function initApp() {
      setupAuthScreen();
      localStorage.removeItem(CLOUD_AUTH_KEY);
      loadFirebaseSettings();
      loadData(false);
      setAppLocked(true);
    }

    
    window.__roomAssignmentApi = {
      initApp,
      saveStaff,
      cancelEdit,
      saveData,
      saveToCloud,
      loadFromCloud,
      loadData,
      resetAll,
      fillFirebaseConfigFromPaste,
      saveFirebaseSettings,
      testFirebaseConnection,
      clearCloudAccess,
      switchMode,
      autoFillCurrentMode,
      clearCurrentAssignments,
      setAssignment,
      editStaff,
      removeStaff,
      init: initApp
    };
    initApp();`

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing) {
      if (existing.dataset.loaded === 'true') resolve()
      else existing.addEventListener('load', resolve, { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = src
    script.async = false
    script.onload = () => {
      script.dataset.loaded = 'true'
      resolve()
    }
    script.onerror = reject
    document.head.appendChild(script)
  })
}

function App() {
  useEffect(() => {
    document.body.classList.add('auth-locked')
    let scriptEl
    let cancelled = false

    loadScript('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js')
      .then(() => loadScript('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore-compat.js'))
      .then(() => {
      if (cancelled) return
      scriptEl = document.createElement('script')
      scriptEl.textContent = legacyScript
      document.body.appendChild(scriptEl)
    })

    return () => {
      cancelled = true
      if (scriptEl) scriptEl.remove()
      delete window.__roomAssignmentApi
      document.body.classList.remove('auth-locked')
    }
  }, [])

  return <div dangerouslySetInnerHTML={{ __html: legacyMarkup }} />
}

export default App
