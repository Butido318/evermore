
const GAS_URL = 'https://script.google.com/macros/s/AKfycbyu9QQgTe_06-DcKHGHv4YFQfc_42lf9V186cu6ZTPkMWuswTiQLW0vpEAs0OznyWAUAA/exec';

async function fetchJSON(url) {
  const res = await fetch(url);
  return res.json();
}

async function loadNames() {
  const names = await fetchJSON(GAS_URL + '?action=names');
  const select = document.getElementById('nameSelect');
  select.innerHTML = names.map(n => `<option value="${n}">${n}</option>`).join('');
  select.onchange = () => {
    loadShifts(select.value);
    loadCancels(select.value);
  };
}

async function loadShifts(name) {
  const shifts = await fetchJSON(GAS_URL + '?action=shifts&name=' + name);
  document.getElementById('shiftSelect').innerHTML = shifts.map(s => `<option value="${s}">${s}</option>`).join('');
}

async function loadCancels(name) {
  const cancels = await fetchJSON(GAS_URL + '?action=cancels&name=' + name);
  const sel = document.getElementById('cancelSelect');
  sel.innerHTML = cancels.length ? cancels.map(s => `<option value="${s}">${s}</option>`).join('') : '<option disabled>無可取消時段，請洽廳主</option>';
}

async function submitShift() {
  const name = document.getElementById('nameSelect').value;
  const shift = document.getElementById('shiftSelect').value;
  const res = await fetchJSON(GAS_URL + `?action=submit&name=${name}&shift=${shift}`);
  document.getElementById('message').innerText = res.message;
  loadTable(); loadCancels(name);
}

async function loadTable() {
  const data = await fetchJSON(GAS_URL + '?action=schedule');
  let html = '<table border="1">';
  for (const row of data) {
    html += '<tr>';
    for (const cell of row) {
      const style = cell.isSelf ? ' class="self"' : cell.full ? ' class="full"' : '';
      html += `<td${style}>${cell.text}<br><small>${cell.remain}</small></td>`;
    }
    html += '</tr>';
  }
  html += '</table>';
  document.getElementById('scheduleTable').innerHTML = html;
}

async function loadTodayStats() {
  const stats = await fetchJSON(GAS_URL + '?action=todayStats');
  document.getElementById('todayStats').innerText = stats.join(', ');
}

async function loadAnnouncement() {
  const ann = await fetchJSON(GAS_URL + '?action=announcement');
  document.getElementById('announcement').innerText = ann.text || '無公告';
}

window.onload = () => {
  loadNames(); loadTable(); loadTodayStats(); loadAnnouncement();
};
