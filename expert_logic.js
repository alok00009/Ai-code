import { db } from './database.js';
import { ref, set, push, onValue } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-database.js";

// --- NEW MASTER LOGIC (31 EXPERT ALGORITHMS) ---
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
let currentAPIPeriod = null;
let currentAPINum = null;
const userKey = localStorage.getItem('active_key');

// --- API FETCH WITH PROXY (Fixed Data Not Loading) ---
async function getRealResults() {
    try {
        const target = "https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json";
        // Proxy use kar rahe hain taaki CORS block na ho
        const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(target)}&timestamp=${Date.now()}`;
        
        const res = await fetch(proxy);
        const json = await res.json();
        const data = JSON.parse(json.contents); // Proxy data parse
        return data.data.list;
    } catch (e) { 
        console.error("API Fetch Error:", e);
        return []; 
    }
}

// --- AUTO PREDICTION LOGIC WITH 31 ALGORITHMS ---
async function autoInject(num, period, fullHistory) {
    const nextIssue = (BigInt(period) + 1n).toString();
    if (lastInjectedPeriod === nextIssue) return;
    
    document.getElementById('aiLoader').classList.remove('hidden');
    
    setTimeout(async () => {
        const historyNums = fullHistory.map(item => parseInt(item.number));
        
        // --- LOGIC SELECTOR ---
        let size = null;
        let usedLogic = "PROBABILITY";

        for (let i = 1; i <= 31; i++) {
            let res = PatternLogic[`L${i}`](historyNums);
            if (res !== null) {
                size = res;
                usedLogic = "L" + i;
                break;
            }
        }

        if (!size) size = (parseInt(num) % 2 === 0) ? "BIG" : "SMALL";
        let opNums = (size === "BIG") ? "1, 3, 7" : "2, 4, 6";

        const historyRef = push(ref(db, `user_history/${userKey}`));
        await set(historyRef, {
            period: nextIssue,
            prediction: size,
            opNums: opNums,
            logic: usedLogic, // Konsa logic use hua save karega
            time: new Date().toLocaleTimeString()
        });

        document.getElementById('wRes').innerText = size;
        document.getElementById('wRes').className = `hacker-font text-8xl ${size === 'BIG' ? 'text-red-500' : 'text-emerald-500'}`;
        document.getElementById('opNums').innerText = opNums;
        document.getElementById('aiLoader').classList.add('hidden');
        
        lastInjectedPeriod = nextIssue;
    }, 1500);
}

// --- SYNC API (No Touch to Structure) ---
async function syncAPI() {
    const data = await getRealResults();
    if(data.length > 0) {
        currentAPINum = data[0].number;
        currentAPIPeriod = data[0].issueNumber;
        
        const nextLive = (BigInt(currentAPIPeriod) + 1n).toString();
        document.getElementById("nextPeriod").innerText = "LIVE PERIOD: " + nextLive.slice(-4);
        
        // Pass full history to autoInject for 31 logic analysis
        autoInject(currentAPINum, currentAPIPeriod, data);
    }
}

// (Baki loadHistory aur copyHack wahi rahenge)
