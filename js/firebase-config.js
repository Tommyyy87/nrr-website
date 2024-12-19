// Das ist die firebase-config.js

// Überprüfen, ob Firebase verfügbar ist
console.log('Firebase vor Initialisierung:', firebase);

// Deine Firebase-Konfiguration
var firebaseConfig = {
    apiKey: "AIzaSyBWCqD1BfvoZ8PiTY8j4-QG9G7nkA73ftM",
    authDomain: "notfallschulungenrheinruhr.firebaseapp.com",
    projectId: "notfallschulungenrheinruhr",
    storageBucket: "notfallschulungenrheinruhr.appspot.com",
    messagingSenderId: "7210919121",
    appId: "1:7210919121:web:ae59c90a99de8c7d3ad1f0",
    measurementId: "G-1EMWY9Q90Q"
};

// Überprüfen, ob Firebase bereits initialisiert wurde, um Mehrfachinitialisierungen zu verhindern
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase wurde initialisiert.');
} else {
    console.log('Firebase ist bereits initialisiert.');
}

// Firebase-Dienste verfügbar machen und global auf `window` legen
window.auth = firebase.auth();
window.db = firebase.firestore();

// Überprüfung, ob Firebase initialisiert wurde
console.log('Firebase nach Initialisierung:', firebase.apps.length > 0);
