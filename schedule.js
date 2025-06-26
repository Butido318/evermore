// schedule.js

const GAS_URL = "https://script.google.com/macros/s/AKfycbyu9QQgTe_06-DcKHGHv4YFQfc_42lf9V186cu6ZTPkMWuswTiQLW0vpEAs0OznyWAUAA/exec";

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

document.addEventListener("DOMContentLoaded", async () => {
  const nicknameSelect = document.getElementById("nickname");
  const scheduleSelect = document.getElementById("schedule");
  const cancelSelect = document.getElementById("cancel");
  const responseMsg = document.getElementById("responseMsg");

  // 取得小名清單
  const names = await fetchJSON(`${GAS_URL}?action=names`);
  names.forEach(n => {
    const opt = document.createElement("option");
    opt.value = n;
    opt.textContent = n;
    nicknameSelect.appendChild(opt);
  });

  // 公告欄
  fetch(`${GAS_URL}?action=announcement`)
    .then(res => res.text())
    .then(txt => {
      document.getElementById("announcement").innerHTML = `<marquee>${txt}</marquee>`;
    });

  // 小名選擇後載入排班 / 取消 / 今日資訊
  nicknameSelect.addEventListener("change", async () => {
    const name = nicknameSelect.value;
    if (!name) return;

    // 取得可排與已排
    const data = await fetchJSON(`${GAS_URL}?action=shifts&name=${name}`);
    scheduleSelect.innerHTML = "<option value=''>請選擇</option>";
    cancelSelect.innerHTML = "<option value=''>請選擇</option>";

    data.available.forEach(s => {
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = s;
      scheduleSelect.appendChild(opt);
    });
    data.booked.forEach(s => {
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = s;
      cancelSelect.appendChild(opt);
    });

    // 今日值班統計
    fetch(`${GAS_URL}?action=todayStats`)
      .then(res => res.text())
      .then(txt => {
        document.getElementById("todayStats").innerHTML = txt;
      });
  });

  // 表單送出
  document.getElementById("shiftForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = nicknameSelect.value;
    const shift = scheduleSelect.value;
    const cancel = cancelSelect.value;
    if (!name) return alert("請先選擇小名");
    if (!shift && !cancel) return alert("請選擇要排班或取消的時段");

    const action = shift ? "submit" : "cancel";
    const slot = shift || cancel;

    const res = await fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify({ action, name, shift: slot }),
      headers: { "Content-Type": "application/json" }
    });
    const msg = await res.text();
    responseMsg.innerText = msg;
    nicknameSelect.dispatchEvent(new Event("change"));
  });

  // 初次載入（自動觸發）
  nicknameSelect.dispatchEvent(new Event("change"));
});
