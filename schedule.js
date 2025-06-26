// schedule.js

const sheetID = "1VITkwb0Sbn4dqxNd3h4SXT9YEesely8J9jydzgLzvaQ";
const apiBase = `https://opensheet.elk.sh/${sheetID}`;

async function fetchJSON(url) {
  const res = await fetch(url);
  return res.json();
}

function switchTab(tab) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelector(`#${tab}-tab`).classList.add('active');
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`.tab-button[onclick*='${tab}']`).classList.add('active');
}

async function init() {
  const [names, scheduleData, records, limits, announcement] = await Promise.all([
    fetchJSON(`${apiBase}/人員名單`),
    fetchJSON(`${apiBase}/排班表`),
    fetchJSON(`${apiBase}/紀錄表單`),
    fetchJSON(`${apiBase}/時間上限`),
    fetchJSON(`${apiBase}/公告區`)
  ]);

  const nicknameSelect = document.getElementById("nickname");
  names.forEach(p => {
    const option = document.createElement("option");
    option.value = `${p["序號"]}_${p["小名"]}`;
    option.textContent = `${p["序號"]}_${p["小名"]}`;
    nicknameSelect.appendChild(option);
  });

  renderAnnouncement(announcement);

  nicknameSelect.addEventListener("change", () => {
    function updateScheduleOptions(scheduleData, limits, records)
{
  const nameSelect = document.getElementById('name');
  const scheduleSelect = document.getElementById('schedule');
  const selectedName = nameSelect.value;

  if (!selectedName) return;

  scheduleSelect.innerHTML = '<option value="">請選擇排班時段</option>';

  const nameOnly = selectedName.split('_')[1]; // 取得小名
  const now = new Date();
  const userRecords = records
    .filter((r) => r.name === nameOnly)
    .map((r) => new Date(r.time));

  scheduleData.forEach((slot) => {
    const slotTime = new Date(slot.time);
    const slotKey = slot.time;
    const remaining = (limits[slotKey] || 0) - records.filter((r) => r.time === slotKey).length;

    const isDuplicate = userRecords.some((r) => r.getTime() === slotTime.getTime());

    // 判斷是否違反連續 3 小時（允許排2小時 + 休息1小時）
    const timestamps = userRecords.map(d => d.getTime());
    timestamps.push(slotTime.getTime());
    timestamps.sort();

    let violates3hr = false;
    for (let i = 0; i < timestamps.length - 2; i++) {
      const diff1 = (timestamps[i+1] - timestamps[i]) / (1000 * 60 * 60);
      const diff2 = (timestamps[i+2] - timestamps[i+1]) / (1000 * 60 * 60);
      if (diff1 === 1 && diff2 === 1) {
        violates3hr = true;
        break;
      }
    }

    if (
      remaining > 0 &&
      !isDuplicate &&
      slotTime > now &&
      !violates3hr
    ) {
      const option = document.createElement('option');
      option.value = slot.time;
      option.textContent = `${slot.time}（剩${remaining}）`;
      scheduleSelect.appendChild(option);
    }
  });

    updateCancelOptions(records);
    updateTodaySchedule(records);
  });

  document.getElementById("shiftForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const nickname = nicknameSelect.value;
    const schedule = document.getElementById("schedule").value;
    const cancel = document.getElementById("cancel").value;
    let msg = "";
    if (schedule && !cancel) {
      msg = await submitRecord(nickname, schedule);
    } else if (!schedule && cancel) {
      msg = await cancelRecord(nickname, cancel);
    } else {
      msg = "請選擇一個時段進行排班或取消";
    }
    document.getElementById("responseMsg").innerText = msg;
    nicknameSelect.dispatchEvent(new Event("change"));
  });

  document.getElementById("weekFilter").addEventListener("change", () => {
    const custom = document.getElementById("weekFilter").value === 'custom';
    document.getElementById("startDate").style.display = custom ? 'inline' : 'none';
    document.getElementById("endDate").style.display = custom ? 'inline' : 'none';
  });

  renderStats();
}

function renderAnnouncement(data) {
  const box = document.getElementById("announcement");
  box.innerHTML = `<marquee>${data.map(d => d["內容"]).join(" ｜ ")}</marquee>`;
}

function updateScheduleOptions(scheduleData, limits, records) {
  // TODO: 篩選剩餘、檢查不可重複、不可連續 3 小時邏輯
}

function updateCancelOptions(records) {
  // TODO: 顯示登入者可取消的班表（僅限未來班表）
}

function updateTodaySchedule(records) {
  // TODO: 顯示今日過後的班表（小名＋時段）
}

function submitRecord(name, slot) {
  return fetch("https://script.google.com/macros/s/AKfycbz54L51159btyzitDS3fjbS9Axn4H-KuZ1xFVyBBp--yCVfRR-YtoW6Nc2gBkLvQDNe7Q/exec", {
    method: "POST",
    body: new URLSearchParams({ name, slot })
  }).then(res => res.text());
}

function cancelRecord(name, slot) {
  return fetch("https://script.google.com/macros/s/AKfycbz54L51159btyzitDS3fjbS9Axn4H-KuZ1xFVyBBp--yCVfRR-YtoW6Nc2gBkLvQDNe7Q/exec?action=cancel", {
    method: "POST",
    body: new URLSearchParams({ name, slot })
  }).then(res => res.text());
}

function renderStats() {
  // TODO: 根據篩選條件產生統計表格，含：剩餘名額、自己著色、反灰
}

document.addEventListener("DOMContentLoaded", init);

