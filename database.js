const firebaseConfig = {
    apiKey: "AIzaSy...",
    authDomain: "ghhhh-fb825.firebaseapp.com",
    databaseURL: "https://ghhhh-fb825-default-rtdb.firebaseio.com",
    projectId: "ghhhh-fb825",
    storageBucket: "ghhhh-fb825.appspot.com",
    messagingSenderId: "...",
    appId: "..."
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

function saveToDatabase(period, prediction, logic) {
    db.ref('live_ai_prediction').set({
        period: period,
        prediction: prediction,
        logicUsed: logic,
        timestamp: Date.now()
    });
}
