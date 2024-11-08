// js/form_view.js

document.addEventListener("DOMContentLoaded", function () {
    // Überprüfen, ob der Benutzer angemeldet ist
    auth.onAuthStateChanged(async function (user) {
        if (user) {
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const formId = urlParams.get('formId');

                if (!formId) {
                    throw new Error("Keine Formular-ID gefunden.");
                }

                console.log("Lade Formular für ID:", formId);

                // Formular aus der Datenbank abrufen
                const formDoc = await db.collection('forms').doc(formId).get();

                if (formDoc.exists) {
                    const formData = formDoc.data();
                    displayForm(formData);
                } else {
                    showNotification("Formular nicht gefunden.", "error");
                }
            } catch (error) {
                console.error("Fehler beim Laden des Formulars:", error);
                showNotification("Fehler beim Laden des Formulars. Bitte versuchen Sie es erneut.", "error");
            }
        } else {
            // Weiterleitung zur Login-Seite, wenn der Benutzer nicht angemeldet ist
            window.location.href = "index.html";
        }
    });

    // Funktion zur Anzeige des Formulars
    function displayForm(formData) {
        document.getElementById('formName').textContent = formData.name;

        const formContainer = document.getElementById('dynamicForm');
        formContainer.innerHTML = '';

        formData.elements.forEach((element) => {
            let formElement;
            switch (element.type) {
                case 'text':
                    formElement = createTextInput(element);
                    break;
                case 'textarea':
                    formElement = createTextArea(element);
                    break;
                case 'select':
                    formElement = createSelect(element);
                    break;
                // Füge hier weitere Typen hinzu, falls notwendig
                default:
                    console.warn("Unbekannter Elementtyp:", element.type);
                    return;
            }
            formContainer.appendChild(formElement);
        });
    }

    // Funktion zur Erstellung eines Text-Eingabefeldes
    function createTextInput(element) {
        const wrapper = document.createElement('div');
        wrapper.className = 'form-group';

        const label = document.createElement('label');
        label.textContent = element.label;

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'input-field';
        input.name = element.id;

        wrapper.appendChild(label);
        wrapper.appendChild(input);
        return wrapper;
    }

    // Funktion zur Erstellung einer Textarea
    function createTextArea(element) {
        const wrapper = document.createElement('div');
        wrapper.className = 'form-group';

        const label = document.createElement('label');
        label.textContent = element.label;

        const textarea = document.createElement('textarea');
        textarea.className = 'input-field';
        textarea.name = element.id;

        wrapper.appendChild(label);
        wrapper.appendChild(textarea);
        return wrapper;
    }

    // Funktion zur Erstellung eines Select-Feldes
    function createSelect(element) {
        const wrapper = document.createElement('div');
        wrapper.className = 'form-group';

        const label = document.createElement('label');
        label.textContent = element.label;

        const select = document.createElement('select');
        select.className = 'input-field';
        select.name = element.id;

        element.options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option.value;
            opt.textContent = option.label;
            select.appendChild(opt);
        });

        wrapper.appendChild(label);
        wrapper.appendChild(select);
        return wrapper;
    }

    // Funktion zur Anzeige von Benachrichtigungen
    function showNotification(message, type) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = 'notification ' + type;
        notification.style.display = 'block';

        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }
});
