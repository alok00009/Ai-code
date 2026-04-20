// --- NOBITA EXPERT LOGIC ENGINE ---

const PatternLogic = {
    L1: (h) => h.slice(0, 5).every(n => n >= 5) ? "BIG" : null,
    L2: (h) => h.slice(0, 5).every(n => n < 5) ? "SMALL" : null,
    L3: (h) => h.slice(0, 3).every(n => n >= 5) && h[3] < 5 ? "BIG" : null,
    L4: (h) => h[0] >= 5 && h[1] >= 5 && h[2] < 5 && h[3] < 5 ? "BIG" : null,
    L5: (h) => h[0] >= 5 && h[1] < 5 && h[2] >= 5 && h[3] < 5 ? "BIG" : null,
    L6: (h) => h.slice(0, 6).every(n => n >= 5) ? "SMALL" : null,
    L7: (h) => h.slice(0, 6).every(n => n < 5) ? "BIG" : null,
    L8: (h) => h[0] >= 5 && h[1] < 5 && h[2] >= 5 && h[3] < 5 && h[4] >= 5 ? "SMALL" : null,
    L9: (h) => h[0] < 5 && h[1] >= 5 && h[2] < 5 && h[3] >= 5 && h[4] < 5 ? "BIG" : null,
    L10: (h) => h[0] === h[1] && h[0] === h[2] ? (h[0] >= 5 ? "SMALL" : "BIG") : null,
    L11: (h) => (h[0]>=5 && h[1]<5 && h[2]<5 && h[3]>=5) ? "SMALL" : null,
    L12: (h) => (h[0]<5 && h[1]>=5 && h[2]>=5 && h[3]<5) ? "BIG" : null,
    L13: (h) => (h[0]>=5 && h[1]>=5 && h[2]<5 && h[3]>=5 && h[4]>=5) ? "SMALL" : null,
    L14: (h) => (h[0]<5 && h[1]<5 && h[2]>=5 && h[3]>=5 && h[4]<5) ? "BIG" : null,
    L15: (h) => (h[0]>=5 && h[1]<5 && h[2]>=5 && h[3]>=5 && h[4]<5) ? "BIG" : null,
    L16: (h) => (h[0] + h[1] + h[2]) % 2 === 0 ? "BIG" : "SMALL",
    L17: (h) => (h[0] * h[1]) > 25 ? "BIG" : "SMALL",
    L18: (h) => (h[0] > h[1] && h[1] > h[2]) ? "SMALL" : "BIG",
    L19: (h) => (h[0] < h[1] && h[1] < h[2]) ? "BIG" : "SMALL",
    L20: (h) => (h[0] + h[1]) > 9 ? "SMALL" : "BIG",
    L21: (h) => [0, 5].includes(h[0]) ? (h[0] === 0 ? "BIG" : "SMALL") : null,
    L22: (h) => [1, 3, 7, 9].includes(h[0]) ? "BIG" : null,
    L23: (h) => [2, 4, 6, 8].includes(h[0]) ? "SMALL" : null,
    L24: (h) => h[0] === 9 ? "SMALL" : null,
    L25: (h) => h[0] === 0 ? "BIG" : null,
    L26: (h) => h.filter(n => n >= 5).length > 7 ? "SMALL" : null,
    L27: (h) => h.filter(n => n < 5).length > 7 ? "BIG" : null,
    L28: (h) => (h[0]+h[1]+h[2]) > 20 ? "SMALL" : null,
    L29: (h) => (h[0]+h[1]+h[2]) < 7 ? "BIG" : null,
    L30: (h) => h[0] === h[2] && h[1] === h[3] ? (h[0] >= 5 ? "SMALL" : "BIG") : null,
    L31: (h) => h[0] % 2 === 0 && h[1] % 2 === 0 && h[2] % 2 === 0 ? "SMALL" : "BIG"
};

async function fetchAndAnalyze() {
    const status = document.getElementById('status');
    const pRes = document.getElementById('p_res');
    const pType = document.getElementById('p_type');
    const periodDisp = document.getElementById('periodDisplay');

    try {
        const target = "https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json";
        const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(target)}&timestamp=${Date.now()}`;
        
        const response = await fetch(proxy);
        const json = await response.json();
        const data = JSON.parse(json.contents);
        
        const list = data.data.list;
        const history = list.slice(0, 15).map(item => parseInt(item.number));
        const nextPeriod = (BigInt(list[0].issueNumber) + 1n).toString();

        let finalRes = null;
        let logicName = "NONE";

        // Logic Selector Loop
        for (let i = 1; i <= 31; i++) {
            let res = PatternLogic[`L${i}`](history);
            if (res !== null) {
                finalRes = res;
                logicName = "L" + i;
                break;
            }
        }

        // UI Updates
        if(pRes) {
            pRes.innerText = finalRes;
            pRes.style.color = finalRes === "BIG" ? "#ff4444" : "#00ff88";
        }
        if(pType) pType.innerText = "SELECTED LOGIC: " + logicName;
        if(periodDisp) periodDisp.innerText = "PERIOD: " + nextPeriod;
        if(status) status.innerText = "LIVE SCANNING ACTIVE";

        // Firebase Update
        saveToDatabase(nextPeriod, finalRes, logicName);

    } catch (e) {
        console.error("Error:", e);
        if(status) status.innerText = "RECONNECTING...";
    }
}

setInterval(fetchAndAnalyze, 30000);
window.onload = fetchAndAnalyze;
