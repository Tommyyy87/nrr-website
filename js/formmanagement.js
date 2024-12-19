// Das ist die formmanagement.js:

document.addEventListener("DOMContentLoaded", function () {
    const formList = document.getElementById("formList");

    // Überprüfen, ob der Benutzer angemeldet ist
    auth.onAuthStateChanged(async function (user) {
        if (user) {
            try {
                const userDoc = await db.collection('users').doc(user.uid).get();
                const userData = userDoc.data();

                if (!userData.isAdmin) {
                    showNotification("Sie haben keine Berechtigung, diese Seite zu sehen.", 'error');
                    window.location.href = "home.html";
                    return;
                }

                await loadForms();
            } catch (error) {
                console.error("Fehler beim Laden der Benutzerdaten:", error);
                showNotification("Fehler beim Laden der Benutzerdaten.", 'error');
                window.location.href = "index.html";
            }
        } else {
            window.location.href = "index.html";
        }
    });

    // Funktion zum Laden der gespeicherten Formulare aus Firestore
    async function loadForms() {
        try {
            const formsSnapshot = await db.collection('forms').get();
            formList.innerHTML = "";

            formsSnapshot.forEach((doc) => {
                const formData = doc.data();
                const formId = doc.id;
                const formItem = document.createElement("div");
                formItem.classList.add("form-item");

                formItem.innerHTML = `
                    <p><strong>Formularname:</strong> ${formData.name}</p>
                    <p><strong>Erstellt am:</strong> ${new Date(formData.createdAt).toLocaleDateString()}</p>
                    <button class="button small" onclick="editForm('${formId}')">📝 Bearbeiten</button>
                    <button class="button small publish" onclick="togglePublish('${formId}', ${formData.published})">
                        ${formData.published ? "Unveröffentlichen" : "Veröffentlichen"}
                    </button>
                    <button class="button small delete" onclick="deleteForm('${formId}')">🗑️ Löschen</button>
                    <hr>
                `;
                formList.appendChild(formItem);
            });
        } catch (error) {
            console.error("Fehler beim Laden der Formulare:", error);
            showNotification("Fehler beim Laden der Formulare.", 'error');
        }
    }

    // Formular bearbeiten
    window.editForm = function (formId) {
        window.location.href = `form-builder.html?formId=${formId}`;
    };

    // Formular veröffentlichen oder unveröffentlichen
    window.togglePublish = async function (formId, currentStatus) {
        try {
            await db.collection('forms').doc(formId).update({ published: !currentStatus });
            showNotification(currentStatus ? "Formular unveröffentlicht." : "Formular veröffentlicht.", 'success');
            await loadForms();
        } catch (error) {
            console.error("Fehler beim Veröffentlichen/Unveröffentlichen des Formulars:", error);
            showNotification("Fehler beim Veröffentlichen/Unveröffentlichen des Formulars.", 'error');
        }
    };

    // Formular löschen
    window.deleteForm = async function (formId) {
        if (confirm("🗑️ Möchten Sie dieses Formular wirklich löschen?")) {
            try {
                await db.collection('forms').doc(formId).delete();
                showNotification("🗑️ Formular wurde gelöscht.", 'success');
                await loadForms();
            } catch (error) {
                console.error("Fehler beim Löschen des Formulars:", error);
                showNotification("Fehler beim Löschen des Formulars.", 'error');
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
        }, 3000);
    }

    // Funktion zum Abmelden
    window.logout = () => {
        auth.signOut().then(() => {
            showNotification("Erfolgreich abgemeldet.", 'success');
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1500);
        }).catch((error) => {
            console.error("Fehler beim Abmelden:", error.message);
            showNotification("Fehler beim Abmelden.", 'error');
        });
    };
});
