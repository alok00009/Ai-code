import { db } from './database.js';
import { ref, set, push, onValue } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-database.js";

// --- MASTER 31 LOGICS (Don't Touch) ---
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

let lastInjectedPeriod = null;
const userKey = localStorage.getItem('active_key');

// --- ⚡ ULTRA STABLE FETCH (CORS BYPASS) ---
async function getRealResults() {
    const target = "https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json";
    
    // 3 Different Proxies to ensure it NEVER fails
    const proxies = [
        `https://api.allorigins.win/get?url=${encodeURIComponent(target)}&t=${Date.now()}`,
        `https://corsproxy.io/?${encodeURIComponent(target)}`,
        `https://thingproxy.freeboard.io/fetch/${target}`
    ];

    for (let url of proxies) {
        try {
            const res = await fetch(url);
            if (!res.ok) continue;
            const data = await res.json();
            
            // AllOrigins wrap data in .contents string, others might not
            const finalData = data.contents ? JSON.parse(data.contents) : data;
            
            if (finalData && finalData.data) {
                console.log("Data loaded via:", url);
                return finalData.data.list;
            }
        } catch (e) {
            console.warn("Proxy failed, trying next...");
        }
    }
    return [];
}

// --- 🧠 EXPERT INJECTION LOGIC ---
async function autoInject(num, period, fullHistory) {
    const nextIssue = (BigInt(period) + 1n).toString();
    if (lastInjectedPeriod === nextIssue) return;
    
    const loader = document.getElementById('aiLoader');
    if(loader) loader.classList.remove('hidden');
    
    setTimeout(async () => {
        const historyNums = fullHistory.map(item => parseInt(item.number));
        
        let size = null;
        let usedLogic = "PROBABILITY";

        // Execute 31 Patterns
        for (let i = 1; i <= 31; i++) {
            let res = PatternLogic[`L${i}`](historyNums);
            if (res !== null) {
                size = res;
                usedLogic = "Expert L" + i;
                break;
            }
        }

        if (!size) size = (parseInt(num) >= 5) ? "BIG" : "SMALL";
        let opNums = (size === "BIG") ? "1, 3, 7" : "2, 4, 6";

        // Save to Firebase
        try {
            const historyRef = push(ref(db, `user_history/${userKey}`));
            await set(historyRef, {
                period: nextIssue,
                prediction: size,
                opNums: opNums,
                logic: usedLogic,
                time: new Date().toLocaleTimeString()
            });
        } catch(e) { console.error("Firebase save failed"); }

        // UI Update
        const wRes = document.getElementById('wRes');
        if(wRes) {
            wRes.innerText = size;
            wRes.className = `hacker-font text-8xl ${size === 'BIG' ? 'text-red-500' : 'text-emerald-500'}`;
        }
        
        const opNumsElem = document.getElementById('opNums');
        if(opNumsElem) opNumsElem.innerText = opNums;
        
        if(loader) loader.classList.add('hidden');
        lastInjectedPeriod = nextIssue;
        console.log("Prediction success:", size, "Logic:", usedLogic);
    }, 1500);
}

// --- 🔄 SYNC ENGINE ---
async function syncAPI() {
    const data = await getRealResults();
    if(data && data.length > 0) {
        const currentAPINum = data[0].number;
        const currentAPIPeriod = data[0].issueNumber;
        
        const nextLive = (BigInt(currentAPIPeriod) + 1n).toString();
        const periodElem = document.getElementById("nextPeriod");
        if(periodElem) periodElem.innerText = "LIVE PERIOD: " + nextLive.slice(-4);
        
        autoInject(currentAPINum, currentAPIPeriod, data);
    } else {
        console.error("Critical: API still not loading. Check your internet or Game URL.");
    }
}

setInterval(syncAPI, 5000); 
syncAPI();
