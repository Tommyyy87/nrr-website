// Das ist die auth.js

// Warten, bis das DOM vollständig geladen ist
document.addEventListener("DOMContentLoaded", function () {
    console.log('Firebase in auth.js:', firebase);

    // Firebase-Dienste sind bereits in firebase-config.js initialisiert
    // auth und db werden hier verwendet, nachdem sie in firebase-config.js initialisiert wurden

    // Funktion zur Anzeige einer Benachrichtigung
    function showNotification(message, type = 'success') {
        var notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = 'notification ' + type;
        notification.style.display = 'block';

        // Blendet die Benachrichtigung nach 3 Sekunden aus
        setTimeout(function () {
            notification.style.display = 'none';
        }, 3000);
    }

    // Funktion zur Token-Erstellung für Backend-Anfragen
    async function getIdToken() {
        var user = auth.currentUser;
        if (user) {
            return await user.getIdToken();
        } else {
            throw new Error('Benutzer ist nicht angemeldet.');
        }
    }

    // Login-Funktion
    var loginButton = document.getElementById("loginButton");
    if (loginButton) {
        loginButton.addEventListener("click", async function () {
            var email = document.getElementById("email").value;
            var password = document.getElementById("password").value;

            if (!email || !password) {
                showNotification('Bitte E-Mail und Passwort eingeben!', 'error');
                return;
            }

            try {
                var userCredential = await auth.signInWithEmailAndPassword(email, password);
                var user = userCredential.user;
                showNotification('Login erfolgreich', 'success');

                // Überprüfen, ob der Benutzer freigeschaltet ist
                var userDoc = await db.collection('users').doc(user.uid).get();
                if (userDoc.exists) {
                    var userData = userDoc.data();
                    if (!userData.approved) {
                        showNotification('Sie sind registriert, aber noch nicht freigeschaltet. Bitte warten Sie auf die Bestätigung durch einen Admin.', 'error');
                        auth.signOut(); // Benutzer abmelden
                    } else {
                        // Benutzer ist freigeschaltet, Weiterleitung zur Hauptseite
                        setTimeout(function () {
                            window.location.href = "home.html";
                        }, 1500);
                    }
                } else {
                    showNotification('Fehler: Benutzerdaten nicht gefunden!', 'error');
                    auth.signOut(); // Benutzer abmelden
                }
            } catch (error) {
                if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
                    showNotification('E-Mail oder Passwort falsch. Bitte überprüfen.', 'error');
                } else {
                    showNotification('Fehler beim Login: ' + error.message, 'error');
                }
            }
        });
    }

    // Passwort-Zurücksetzen-Funktion
    var resetPasswordLink = document.getElementById("resetPasswordLink");
    if (resetPasswordLink) {
        resetPasswordLink.addEventListener("click", function () {
            var email = document.getElementById("email").value;
            if (!email) {
                showNotification('Bitte geben Sie Ihre E-Mail-Adresse ein, um das Passwort zurückzusetzen.', 'error');
                return;
            }

            auth.sendPasswordResetEmail(email)
                .then(function () {
                    showNotification('Passwort-Reset-E-Mail wurde gesendet.', 'success');
                })
                .catch(function (error) {
                    showNotification('Fehler beim Senden der Passwort-Reset-E-Mail: ' + error.message, 'error');
                });
        });
    }

    // Registrierungs-Funktion
    var registerButton = document.getElementById("registerButton");
    if (registerButton) {
        registerButton.addEventListener("click", async function () {
            console.log('Registrieren-Button wurde geklickt');

            var email = document.getElementById("registerEmail").value;
            var password = document.getElementById("registerPassword").value;
            var firstName = document.getElementById("registerFirstName").value;
            var lastName = document.getElementById("registerLastName").value;

            if (!email || !password || !firstName || !lastName) {
                showNotification('Bitte alle Felder ausfüllen!', 'error');
                return;
            }

            try {
                var userCredential = await auth.createUserWithEmailAndPassword(email, password);
                var user = userCredential.user;
                console.log("Benutzer erfolgreich registriert:", user.uid);

                // Benutzer in Firestore speichern – über Cloud Function
                var response = await protectedRequest('https://us-central1-notfallschulungenrheinruhr.cloudfunctions.net/addUser', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        uid: user.uid,
                        email: email,
                        firstName: firstName,
                        lastName: lastName,
                        approved: false,
                        isAdmin: false,
                        isMainAdmin: false
                    })
                });

                if (response && response.message) {
                    showNotification('Registrierung erfolgreich. Bitte warten Sie auf die Freischaltung durch den Admin.', 'success');
                } else {
                    throw new Error('Fehler bei der Registrierung.');
                }
            } catch (error) {
                console.error("Fehler bei der Registrierung oder beim Speichern:", error);
                showNotification('Fehler bei der Registrierung: ' + error.message, 'error');
            }
        });
    }

    // Umschalten zwischen Login und Registrierung
    var registerLink = document.getElementById("registerLink");
    var registerContainer = document.getElementById("registerContainer");

    if (registerLink && registerContainer) {
        registerLink.addEventListener("click", function (e) {
            e.preventDefault();
            registerContainer.style.display = registerContainer.style.display === "none" || registerContainer.style.display === "" ? "block" : "none";
        });
    }

    // Funktion für geschützte Backend-Anfragen
    async function protectedRequest(url, options = {}) {
        try {
            var idToken = await getIdToken();
            options.headers = options.headers || {};
            options.headers['Authorization'] = 'Bearer ' + idToken;

            var response = await fetch(url, options);

            if (!response.ok) {
                throw new Error('Fehler beim Zugriff auf das Backend: ' + response.statusText);
            }

            return response.headers.get("content-type")?.includes("application/json")
                ? await response.json()
                : { message: "Benutzer erfolgreich gespeichert." };

        } catch (error) {
            console.error("Fehler bei geschützter Anfrage:", error);
            showNotification('Fehler bei geschützter Anfrage: ' + error.message, 'error');
            throw error;
        }
    }

    // Funktion zum Abmelden
    var logoutButton = document.getElementById("logoutButton");
    if (logoutButton) {
        logoutButton.addEventListener("click", async function () {
            try {
                await auth.signOut();
                showNotification('Erfolgreich abgemeldet', 'success');
                setTimeout(function () {
                    window.location.href = "index.html";
                }, 1500);
            } catch (error) {
                showNotification('Fehler beim Abmelden: ' + error.message, 'error');
            }
        });
    }
});
