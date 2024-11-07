// // Firebase-Dienste initialisieren
// var auth = firebase.auth();
// var db = firebase.firestore();

document.addEventListener("DOMContentLoaded", function () {
    // Überprüfung, ob der Benutzer angemeldet ist
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

                // Dozentennamen im Formular anzeigen
                document.getElementById("instructorName").textContent = `${userData.firstName} ${userData.lastName}`;

                // Beispielhafte Equipmentsätze laden und Dropdown auffüllen
                const equipmentsCollection = ["001", "002", "003"];
                const equipmentSelect = document.getElementById("equipmentSetNumber");
                equipmentsCollection.forEach((equipment) => {
                    const option = document.createElement("option");
                    option.value = equipment;
                    option.textContent = equipment;
                    equipmentSelect.appendChild(option);
                });

            } catch (error) {
                console.error("Fehler beim Abrufen der Benutzerdaten:", error);
                alert("Fehler beim Abrufen der Benutzerdaten. Bitte versuchen Sie es erneut.");
            }
        } else {
            // Weiterleitung zur Login-Seite, wenn der Benutzer nicht angemeldet ist
            window.location.href = "index.html";
        }
    });

    // Zeichnen der Unterschrift auf dem Canvas
    const canvas = document.getElementById("signaturePad");
    const ctx = canvas.getContext("2d");
    let drawing = false;

    // Funktion, um die Maus- oder Touch-Position relativ zum Canvas zu berechnen
    function getPosition(event) {
        const rect = canvas.getBoundingClientRect();
        if (event.touches) {
            return {
                x: event.touches[0].clientX - rect.left,
                y: event.touches[0].clientY - rect.top
            };
        } else {
            return {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top
            };
        }
    }

    // Funktion für den Start des Zeichnens
    function startDrawing(event) {
        drawing = true;
        const pos = getPosition(event);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        event.preventDefault(); // Verhindert unerwünschte Scrollen oder anderes Verhalten
    }

    // Funktion für das Zeichnen
    function draw(event) {
        if (!drawing) return;
        const pos = getPosition(event);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        event.preventDefault();
    }

    // Funktion für das Beenden des Zeichnens
    function stopDrawing() {
        drawing = false;
    }

    // Maus-Ereignisse
    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseout", stopDrawing);

    // Touch-Ereignisse
    canvas.addEventListener("touchstart", startDrawing);
    canvas.addEventListener("touchmove", draw);
    canvas.addEventListener("touchend", stopDrawing);
    canvas.addEventListener("touchcancel", stopDrawing);

    // Unterschrift löschen
    document.getElementById("clearSignature").addEventListener("click", () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    // Optionale Größenanpassung des Canvas bei verschiedenen Geräten
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // Initiale Größenanpassung

    function resizeCanvas() {
        const canvasContainer = canvas.parentElement;
        canvas.width = canvasContainer.offsetWidth; // Dynamische Breite
        canvas.height = 200; // Statische Höhe für die Unterschrift
        ctx.lineWidth = 2; // Strichstärke
    }

    // Dateien senden
    document.getElementById("submitButton").addEventListener("click", () => {
        alert("Formular wird verarbeitet und gesendet.");
    });
});
