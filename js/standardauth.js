// Das ist die standardauth.js:

document.addEventListener("DOMContentLoaded", async () => {
    // Firebase-Dienste initialisieren
    const auth = firebase.auth();
    const db = firebase.firestore();

    // Überprüfen, ob der Benutzer angemeldet ist und Admin-Rechte hat
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            try {
                const userRef = db.collection('users').doc(user.uid);
                const userDoc = await userRef.get();

                if (userDoc.exists && userDoc.data().isAdmin) {
                    console.log("Admin-Berechtigung bestätigt.");
                } else {
                    alert("Sie haben keine Berechtigung, diese Seite zu sehen.");
                    window.location.href = "home.html";
                }
            } catch (error) {
                console.error("Fehler beim Überprüfen der Admin-Rechte:", error);
                window.location.href = "home.html";
            }
        } else {
            // Nicht eingeloggt, Weiterleitung zur Login-Seite
            window.location.href = "index.html";
        }
    });
});

// Logout-Funktion
function logout() {
    firebase.auth().signOut().then(() => {
        alert("Erfolgreich abgemeldet");
        window.location.href = "index.html";
    }).catch((error) => {
        console.error("Fehler beim Abmelden:", error.message);
    });
}
