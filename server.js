const admin = require('firebase-admin');
const fetch = require('node-fetch');

// --- 1. FIREBASE SETUP ---
// Apne Firebase Settings se 'Service Account Key' download kar aur yahan uska path de
const serviceAccount = require("./serviceAccountKey.json"); 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ghhhh-fb825-default-rtdb.firebaseio.com"
});

const db = admin.database();

// --- 2. AI MEMORY & LOGIC ---
let aiMemory = [];
let lastInjectedPeriod = null;

async function getGameResult() {
    try {
        const res = await fetch("https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json");
        const json = await res.json();
        return json.data.list[0];
    } catch (e) { return null; }
}

async function runNeuralEngine() {
    const latest = await getGameResult();
    if (!latest) return;

    const currentPeriod = latest.issueNumber;
    const currentNum = parseInt(latest.number);
    const nextPeriod = (BigInt(currentPeriod) + 1n).toString();

    if (lastInjectedPeriod === nextPeriod) return;

    console.log(`[AI SYNC] Training on Period ${currentPeriod}, Num: ${currentNum}`);

    // --- 3. THE SELF-LEARNING LOGIC ---
    // AI Memory mein result add ho raha hai
    aiMemory.push({ num: currentNum, size: currentNum >= 5 ? "BIG" : "SMALL" });
    if (aiMemory.length > 100) aiMemory.shift();

    // AI Check karega ki pichle 5 results mein kya trend hai
    let prediction;
    let jackpot;

    // Nobita V15 Adaptive Math:
    // Agar last 3 result same size ke hain (Dragon), toh trend follow karo
    const last3 = aiMemory.slice(-3);
    const isDragon = last3.length === 3 && last3.every(v => v.size === last3[0].size);

    if (isDragon) {
        prediction = last3[0].size; // Trend Follow
    } else {
        // Default V15 Math: Even -> BIG, Odd -> SMALL
        prediction = (currentNum % 2 === 0) ? "BIG" : "SMALL";
    }

    // Jackpot Numbers Logic (2 Perfect Numbers)
    if (prediction === "BIG") {
        let n1 = (currentNum + 6) % 10; if(n1 < 5) n1 += 5;
        let n2 = (currentNum + 8) % 10; if(n2 < 5) n2 += 5;
        jackpot = `${n1}, ${n2}`;
    } else {
        let n1 = Math.abs(currentNum - 2) % 5;
        let n2 = Math.abs(currentNum - 4) % 5;
        jackpot = `${n1}, ${n2}`;
    }

    // --- 4. CLOUD UPDATE ---
    // Ye data Firebase mein 'live_ai_prediction' node par jayega
    // Taaki dashboard use turant utha sake
    await db.ref('live_ai_prediction').set({
        period: nextPeriod,
        prediction: prediction,
        jackpot: jackpot,
        updateTime: new Date().toLocaleTimeString(),
        trainingStatus: "Neural Sync Active"
    });

    lastInjectedPeriod = nextPeriod;
    console.log(`[AI SUCCESS] Predicted ${prediction} for ${nextPeriod}`);
}

// Har 10 second mein API check karo
setInterval(runNeuralEngine, 10000);

console.log("🚀 NOBITA NEURAL ENGINE 24/7 STARTED...");
const http = require('http');
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Nobita AI is Alive!');
}).listen(process.env.PORT || 3000);

