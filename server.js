const admin = require('firebase-admin');
const fetch = require('node-fetch');

// --- 1. SETTINGS ---
const GEMINI_API_KEY = "AIzaSyAb5RWf5SeX2apMcwnEyswl6wtOu4PJ..."; // Apni poori key yahan daal
const serviceAccount = require("./serviceAccountKey.json"); 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ghhhh-fb825-default-rtdb.firebaseio.com"
});

const db = admin.database();
let lastInjectedPeriod = null;
let history = [];

// --- 2. AI BRAIN FUNCTION (GEMINI) ---
async function askGemini(data) {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        const prompt = {
            contents: [{
                parts: [{
                    text: `Analyze this Wingo history: ${JSON.stringify(data)}. 
                    Predict the next round: BIG or SMALL. 
                    Give 2 jackpot numbers (0-9). 
                    Answer in this exact format: PREDICTION: [BIG/SMALL], JACKPOT: [num1, num2]`
                }]
            }]
        };

        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(prompt)
        });
        const json = await res.json();
        return json.candidates[0].content.parts[0].text;
    } catch (e) { return "PREDICTION: BIG, JACKPOT: 1, 3"; } // Default if AI fails
}

// --- 3. MAIN LOOP ---
async function runSmartAI() {
    try {
        const res = await fetch("https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json");
        const json = await res.json();
        const latest = json.data.list[0];
        
        const currentPeriod = latest.issueNumber;
        const nextPeriod = (BigInt(currentPeriod) + 1n).toString();

        if (lastInjectedPeriod === nextPeriod) return;

        // Add to history and keep last 15
        history.push({ period: currentPeriod, num: latest.number });
        if (history.length > 15) history.shift();

        console.log(`[SYNC] Training on ${currentPeriod}...`);

        // Ask AI for Prediction
        const aiResponse = await askGemini(history);
        console.log("AI Response:", aiResponse);

        // Parse AI Result
        const prediction = aiResponse.includes("BIG") ? "BIG" : "SMALL";
        const jackpotMatch = aiResponse.match(/\d, \d/);
        const jackpot = jackpotMatch ? jackpotMatch[0] : "1, 3";

        // Update Firebase
        await db.ref('live_ai_prediction').set({
            period: nextPeriod,
            prediction: prediction,
            jackpot: jackpot,
            updateTime: new Date().toLocaleTimeString(),
            status: "Gemini Neural Active"
        });

        lastInjectedPeriod = nextPeriod;
    } catch (e) { console.log("Error:", e); }
}

// Every 10 seconds check for new round
setInterval(runSmartAI, 10000);

// Keep server alive for Render
require('http').createServer((req, res) => res.end('Nobita AI is Alive')).listen(process.env.PORT || 3000);
