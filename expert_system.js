async function fetchAndAnalyze() {
    const status = document.getElementById('status');
    status.innerText = "SCANNING MARKET...";

    try {
        // CORS bypass ke liye proxy use kar rahe hain
        const targetUrl = "https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json";
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}&timestamp=${Date.now()}`;
        
        const response = await fetch(proxyUrl);
        const json = await response.json();
        const data = JSON.parse(json.contents);
        
        const list = data.data.list;
        const history = list.slice(0, 12).map(item => parseInt(item.number));
        const nextP = (BigInt(list[0].issueNumber) + 1n).toString();

        let finalRes = null;
        let selectedLogic = "NONE";

        // Sabhi 31 logics check honge
        for (let i = 1; i <= 31; i++) {
            let result = PatternLogic[`L${i}`](history);
            if (result !== null) {
                finalRes = result;
                selectedLogic = "L" + i;
                break;
            }
        }

        // Display Update
        document.getElementById('p_res').innerText = finalRes || "--";
        document.getElementById('p_res').style.color = finalRes === "BIG" ? "#f43f5e" : "#10b981";
        document.getElementById('p_type').innerText = "LOGIC: " + selectedLogic;
        document.getElementById('periodDisplay').innerText = "PERIOD: " + nextP;
        status.innerText = "AUTO SCAN ACTIVE";

        // Save to Firebase
        saveToDatabase(nextP, finalRes, selectedLogic);

    } catch (e) {
        console.error(e);
        status.innerText = "FETCH ERROR. RETRYING...";
    }
}

// Auto Prediction: Har 30 second mein check karega
setInterval(fetchAndAnalyze, 30000);
window.onload = fetchAndAnalyze;
