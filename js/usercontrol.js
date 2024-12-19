// Das ist die usercontrol.js:

document.addEventListener("DOMContentLoaded", async function () {
    // Überprüft, ob der Benutzer angemeldet ist
    window.auth.onAuthStateChanged(async function (user) {
        if (user) {
            try {
                const userDoc = await window.db.collection('users').doc(user.uid).get();
                const userData = userDoc.data();

                if (!userData.isAdmin) {
                    showNotification("Sie haben keine Berechtigung, diese Seite zu sehen.", 'error');
                    window.location.href = "home.html";
                    return;
                }

                const isMainAdmin = userData.isMainAdmin;
                document.getElementById("userInfo").textContent = `Angemeldet als: ${user.email}`;
                await loadUsers(isMainAdmin);  // MainAdmin-Status an loadUsers übergeben
            } catch (error) {
                console.error("Fehler beim Laden der Benutzerdaten:", error);
                showNotification("Fehler beim Laden der Benutzerdaten.", 'error');
                window.location.href = "index.html";
            }
        } else {
            window.location.href = "index.html";
        }
    });
});

// Funktion zum Laden der Benutzerliste aus Firestore
async function loadUsers(isMainAdmin) {
    try {
        const usersSnapshot = await window.db.collection('users').get();
        const usersList = document.getElementById("usersList");

        usersList.innerHTML = "";

        // Filteroptionen abrufen
        const filterApproved = document.getElementById("filterApproved").value;
        const filterAdmin = document.getElementById("filterAdmin").value;

        usersSnapshot.forEach((doc) => {
            const userData = doc.data();
            const userId = doc.id;

            // Filterlogik: Nur Benutzer anzeigen, die den Filtern entsprechen
            if (
                (filterApproved === "approved" && !userData.approved) ||
                (filterApproved === "notApproved" && userData.approved) ||
                (filterAdmin === "admin" && !userData.isAdmin) ||
                (filterAdmin === "notAdmin" && userData.isAdmin)
            ) {
                return; // Benutzer überspringen, wenn sie nicht den Filtern entsprechen
            }

            const userItem = document.createElement("div");
            userItem.classList.add("user-item");

            userItem.innerHTML = `
                <p>Vorname: ${userData.firstName}</p>
                <p>Nachname: ${userData.lastName}</p>
                <p>Email: ${userData.email}</p>
                <p>Freigeschaltet: ${userData.approved ? "Ja" : "Nein"}</p>
                <p>Admin: ${userData.isAdmin ? "Ja" : "Nein"}</p>
                <p>Main-Admin: ${userData.isMainAdmin ? "Ja" : "Nein"}</p>
                <button class="button small approve" onclick="approveUser('${userId}', ${userData.approved})">
                    ${userData.approved ? "✅ Freischaltung zurücknehmen" : "✅ Freischalten"}
                </button>
                ${isMainAdmin ? `<button class="button small admin" onclick="makeAdmin('${userId}', ${userData.isAdmin})">
                    ${userData.isAdmin ? "👑 Admin-Rechte entziehen" : "👑 Zum Admin machen"}</button>` : ''}
                <button class="button small delete" onclick="deleteUser('${userId}')">🗑️ Benutzer löschen</button>
                <hr>
            `;
            usersList.appendChild(userItem);
        });
    } catch (error) {
        console.error("Fehler beim Abrufen der Benutzerliste:", error);
        showNotification("Fehler beim Abrufen der Benutzerliste.", 'error');
    }
}

// Funktion zum Anwenden der Filter
function applyFilters() {
    loadUsers(true); // MainAdmin-Status übergeben
}

// Funktion zum Freischalten eines Benutzers
window.approveUser = async (userId, currentStatus) => {
    try {
        await window.db.collection('users').doc(userId).update({ approved: !currentStatus });
        showNotification(currentStatus ? "✅ Freischaltung zurückgenommen." : "✅ Benutzer freigeschaltet.", 'success');
        await loadUsers(true); // MainAdmin-Status übergeben
    } catch (error) {
        console.error("Fehler beim Freischalten:", error);
        showNotification("Fehler beim Freischalten.", 'error');
    }
};

// Funktion zum Admin machen (nur für Hauptadmin)
window.makeAdmin = async (userId, currentStatus) => {
    try {
        await window.db.collection('users').doc(userId).update({ isAdmin: !currentStatus });
        showNotification(currentStatus ? "👑 Admin-Rechte entzogen." : "👑 Zum Admin gemacht.", 'success');
        await loadUsers(true); // MainAdmin-Status übergeben
    } catch (error) {
        console.error("Fehler beim Ändern der Admin-Rechte:", error);
        showNotification("Fehler beim Ändern der Admin-Rechte.", 'error');
    }
};

// Funktion zum Löschen eines Benutzers aus Firebase Auth und Firestore
window.deleteUser = async (userId) => {
    if (confirm("🗑️ Möchten Sie diesen Benutzer wirklich löschen?")) {
        try {
            const idToken = await window.auth.currentUser.getIdToken();

            const response = await fetch('https://us-central1-notfallschulungenrheinruhr.cloudfunctions.net/deleteUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({ uid: userId })
            });

            const responseText = await response.text();

            if (response.ok) {
                await window.db.collection('users').doc(userId).delete();
                showNotification("🗑️ Benutzer wurde gelöscht.", 'success');
                await loadUsers(true); // MainAdmin-Status übergeben
            } else {
                throw new Error(`Fehler beim Löschen des Benutzers aus Firebase Auth: ${responseText}`);
            }
        } catch (error) {
            console.error("Fehler beim Löschen des Benutzers:", error);
            showNotification("Fehler beim Löschen des Benutzers. Bitte versuchen Sie es erneut.", 'error');
        }
    }
};

// Funktion zur Anzeige von Benachrichtigungen
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';

    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000); // Benachrichtigung nach 3 Sekunden ausblenden
}

// Funktion zum Abmelden
window.logout = () => {
    window.auth.signOut().then(() => {
        showNotification("Erfolgreich abgemeldet.", 'success');
        setTimeout(() => {
            window.location.href = "index.html";
        }, 1500);
    }).catch((error) => {
        console.error("Fehler beim Abmelden:", error.message);
        showNotification("Fehler beim Abmelden.", 'error');
    });
};
