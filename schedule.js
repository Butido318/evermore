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
    updateScheduleOptions(scheduleData, limits, records);
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

