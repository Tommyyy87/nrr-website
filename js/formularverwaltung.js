// Firestore-Datenbankreferenz
const db = firebase.firestore();

// Liste der Formulare abrufen und anzeigen
window.addEventListener('DOMContentLoaded', async () => {
    const formularListe = document.getElementById('formularListe').querySelector('tbody');

    try {
        const snapshot = await db.collection('forms').get();
        snapshot.forEach((doc) => {
            const formData = doc.data();
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${formData.name}</td>
                <td>
                    <button onclick="editForm('${doc.id}')">Bearbeiten</button>
                    <button onclick="deleteForm('${doc.id}')">Löschen</button>
                </td>
            `;

            formularListe.appendChild(row);
        });
    } catch (error) {
        console.error('Fehler beim Abrufen der Formulare:', error);
    }
});

// Funktion zum Löschen eines Formulars
async function deleteForm(formId) {
    if (confirm("Möchten Sie dieses Formular wirklich löschen?")) {
        try {
            await db.collection('forms').doc(formId).delete();
            location.reload(); // Seite neu laden, um das Formular zu entfernen
        } catch (error) {
            console.error('Fehler beim Löschen des Formulars:', error);
        }
    }
}

// Funktion zum Bearbeiten eines Formulars (leitet zur Form-Builder-Seite weiter)
function editForm(formId) {
    window.location.href = `form-builder.html?edit=${formId}`;
}
