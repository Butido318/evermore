// schedule.js
// ✅ 設定 Google Apps Script 的網址（請改成你自己的 exec 網址）
const GAS_URL = 'https://script.google.com/macros/s/AKfycbyu9QQgTe_06-DcKHGHv4YFQfc_42lf9V186cu6ZTPkMWuswTiQLW0vpEAs0OznyWAUAA/exec';

// ✅ 載入小名選單
function loadNames() {
  fetch(`${GAS_URL}?action=names`)
    .then(res => res.json())
    .then(data => {
      const nameSelect = document.getElementById('name');
      nameSelect.innerHTML = '<option value="">請選擇小名</option>';
      data.forEach(name => {
        const option = document.createElement('option');
        option.value = name.value;
        option.textContent = name.label;
        nameSelect.appendChild(option);
      });
    });
}

// ✅ 載入排班選項
function loadShifts(name) {
  fetch(`${GAS_URL}?action=shifts&name=${encodeURIComponent(name)}`)
    .then(res => res.json())
    .then(data => {
      updateScheduleOptions(data.scheduleData, data.scheduleLimits, data.scheduleRecords);
    })
    .catch(err => {
      console.error('錯誤：無法載入班表時段', err);
    });
}

// ✅ 更新「我要排班」選單內容
function updateScheduleOptions(scheduleData, limits, records) {
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

    if (remaining > 0 && !isDuplicate && slotTime > now && !violates3hr) {
      const option = document.createElement('option');
      option.value = slot.time;
      option.textContent = `${slot.time}（剩${remaining}）`;
      scheduleSelect.appendChild(option);
    }
  });
}

// ✅ 載入公告
function loadAnnouncement() {
  fetch(`${GAS_URL}?action=announcement`)
    .then(res => res.text())
    .then(text => {
      document.getElementById('announcement').textContent = text;
    });
}

// ✅ 初始化
window.addEventListener('DOMContentLoaded', () => {
  loadNames();
  loadAnnouncement();

  const nameSelect = document.getElementById('name');
  nameSelect.addEventListener('change', () => {
    const selected = nameSelect.value;
    if (selected) loadShifts(selected);
  });
});
