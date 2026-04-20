async function fetchAndAnalyze() {
    const status = document.getElementById('status');
    status.innerText = "SCANNING EXPERT ALGORITHMS...";

    try {
        const proxy = "https://api.allorigins.win/get?url=";
        const target = "https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json";
        const res = await fetch(proxy + encodeURIComponent(target));
        const json = await res.json();
        const data = JSON.parse(json.contents);
        
        const list = data.data.list;
        const history = list.slice(0, 12).map(item => parseInt(item.number));
        const nextP = (BigInt(list[0].issueNumber) + 1n).toString();

        let finalRes = null;
        let selectedLogic = "NONE";

        // Sabhi 31 logics ko loop mein check karna
        for (let i = 1; i <= 31; i++) {
            let result = PatternLogic[`L${i}`](history);
            if (result !== null) {
                finalRes = result;
                selectedLogic = "ALGORITHM L" + i;
                break; // Sahi pattern milte hi ruk jao
            }
        }

        // Final prediction display aur database update
        document.getElementById('p_res').innerText = finalRes;
        document.getElementById('p_res').style.color = finalRes === "BIG" ? "#f43f5e" : "#10b981";
        document.getElementById('p_type').innerText = "SELECTED: " + selectedLogic;
        document.getElementById('periodDisplay').innerText = "PERIOD: " + nextP;
        status.innerText = "SCAN SUCCESSFUL";

        // Database ko data bhejna
        saveToDatabase(nextP, finalRes, selectedLogic);

    } catch (e) {
        status.innerText = "CONNECTION ERROR...";
        console.error(e);
    }
}
