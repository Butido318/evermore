
const GAS_URL = '你的 Google Apps Script Web App 網址';

async function loadData() {
    try {
        const res = await fetch(`${GAS_URL}?action=loadData`);
        const data = await res.json();
        console.log('取得資料：', data);
    } catch (err) {
        console.error('錯誤：', err);
    }
}
document.addEventListener('DOMContentLoaded', loadData);
