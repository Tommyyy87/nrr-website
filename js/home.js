// js/home.js

// Überprüfung, ob Firebase verfügbar ist
console.log('Firebase in home.js:', firebase);

// Firebase-Dienste sind bereits in firebase-config.js initialisiert, wir müssen sie nicht erneut initialisieren

document.addEventListener("DOMContentLoaded", function () {
    // Funktion zum Hinzufügen von Touch- und Click-Events
    function addTouchAndClickEvent(element, callback) {
        if (element) {
            element.addEventListener('click', callback);
            element.addEventListener('touchstart', callback);
        }
    }

    // Überprüfen, ob der Benutzer angemeldet ist
    auth.onAuthStateChanged(async function (user) {
        if (user) {
            try {
                // Token des Benutzers abrufen
                var idToken = await user.getIdToken();

                // Anfrage an Backend-Funktion senden, um Benutzerdaten zu überprüfen
                var response = await fetch("https://us-central1-notfallschulungenrheinruhr.cloudfunctions.net/getUserData", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": 'Bearer ' + idToken
                    },
                    body: JSON.stringify({ userId: user.uid })
                });

                if (!response.ok) {
                    throw new Error('Fehler beim Abrufen der Benutzerdaten');
                }

                var userData = await response.json();

                // Persönliche Begrüßung hinzufügen
                var welcomeMessage = `Hallo ${userData.firstName},`;
                document.querySelector('h2').textContent = welcomeMessage;

                // Benutzerdaten überprüfen und Admin-Seite-Button anzeigen
                if (userData.isAdmin || userData.isMainAdmin) {
                    document.getElementById("adminSeiteButton").style.display = "block";
                }
            } catch (error) {
                console.error("Fehler beim Abrufen der Benutzerdaten:", error);
                // Anzeige einer Fehlermeldung
                showNotification("Fehler beim Abrufen der Benutzerdaten. Bitte versuchen Sie es erneut.", "error");
            }
        } else {
            // Weiterleitung zur Login-Seite, wenn der Benutzer nicht angemeldet ist
            window.location.href = "index.html";
        }
    });

    // Funktion zur Anzeige von Benachrichtigungen
    function showNotification(message, type) {
        var notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = 'notification ' + type;
        notification.style.display = 'block';

        setTimeout(function () {
            notification.style.display = 'none';
        }, 3000);
    }

    // Event-Handling für die Buttons
    var kursformularButton = document.getElementById('kursformularButton');
    addTouchAndClickEvent(kursformularButton, function () {
        window.location.href = 'course_form.html';
    });

    var adminSeiteButton = document.getElementById('adminSeiteButton');
    addTouchAndClickEvent(adminSeiteButton, function () {
        window.location.href = 'admin.html';
    });

    var logoutButton = document.getElementById('logoutButton');
    addTouchAndClickEvent(logoutButton, function () {
        auth.signOut().then(function () {
            // Anzeige einer Erfolgsmeldung
            showNotification("Erfolgreich abgemeldet", "success");
            window.location.href = "index.html";
        }).catch(function (error) {
            console.error("Fehler beim Abmelden:", error);
            // Anzeige einer Fehlermeldung
            showNotification("Fehler beim Abmelden. Bitte versuchen Sie es erneut.", "error");
        });
    });
});
