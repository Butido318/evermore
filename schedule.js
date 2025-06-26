// schedule.js

const sheetID = "1VITkwb0Sbn4dqxNd3h4SXT9YEesely8J9jydzgLzvaQ";
const GAS_URL = "https://script.google.com/macros/s/AKfycbyu9QQgTe_06-DcKHGHv4YFQfc_42lf9V186cu6ZTPkMWuswTiQLW0vpEAs0OznyWAUAA/exec";

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
  const announcementBox = document.getElementById("announcement");

  // 載入小名列表
  const namesRes = await fetch(`${GAS_URL}?action=names`);
  const names = await namesRes.json();
  names.forEach(n => {
    const opt = document.createElement("option");
    opt.value = n;
    opt.textContent = n;
    nicknameSelect.appendChild(opt);
  });

  // 載入公告
  const annRes = await fetch(`${GAS_URL}?action=announcement`);
  const annText = await annRes.text();
  announcementBox.innerHTML = `<marquee>${annText}</marquee>`;

  // 小名變更 → 載入班表與取消選項
  nicknameSelect.addEventListener("change", async () => {
    const name = nicknameSelect.value;
    if (!name) return;
    const shiftRes = await fetch(`${GAS_URL}?action=shifts&name=${name}`);
    const shiftData = await shiftRes.json();

    scheduleSelect.innerHTML = '<option value="">請選擇</option>';
    shiftData.available.forEach(s => {
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = s;
      scheduleSelect.appendChild(opt);
    });

    cancelSelect.innerHTML = '<option value="">請選擇</option>';
    shiftData.booked.forEach(s => {
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = s;
      cancelSelect.appendChild(opt);
    });
  });

  // 表單送出
  document.getElementById("shiftForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = nicknameSelect.value;
    const shift = scheduleSelect.value;
    const cancel = cancelSelect.value;
    let result = "";
    if (shift && !cancel) {
      result = await fetch(GAS_URL, {
        method: "POST",
        body: JSON.stringify({ action: "submit", name, shift })
      }).then(res => res.text());
    } else if (!shift && cancel) {
      result = await fetch(GAS_URL, {
        method: "POST",
        body: JSON.stringify({ action: "cancel", name, shift: cancel })
      }).then(res => res.text());
    } else {
      result = "請選擇一個時段進行排班或取消";
    }
    responseMsg.innerText = result;
    nicknameSelect.dispatchEvent(new Event("change"));
  });
});
