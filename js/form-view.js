import formElements from './form-elements.js'; // Importiere zentrale Baustein-Definition
import { handleFileUpload, removeUploadedFile, getUploadedFiles, validateUploadedFiles } from './file-upload-utils.js';


document.addEventListener("DOMContentLoaded", function () {
    const app = new Vue({
        el: '#app',
        data: {
            formName: 'Lade Formular...',
            formElements: [], // Bausteine aus der Datenbank
            userData: {}, // Benutzerdaten
            notification: {
                message: '',
                type: '',
                visible: false,
            },
        },
        methods: {
            // Formular aus der Datenbank laden
            async loadForm() {
                auth.onAuthStateChanged(async (user) => {
                    if (user) {
                        try {
                            const urlParams = new URLSearchParams(window.location.search);
                            const formId = urlParams.get('formId');
                            if (!formId) throw new Error("Keine Formular-ID gefunden.");

                            console.log("Lade Formular für ID:", formId);

                            const formDoc = await db.collection('forms').doc(formId).get();

                            if (formDoc.exists) {
                                const formData = formDoc.data();
                                this.formName = formData.name || 'Unbenanntes Formular';
                                this.formElements = formData.elements || [];

                                if (!Array.isArray(this.formElements)) {
                                    console.error('Formularelemente sind ungültig:', this.formElements);
                                    this.showNotification("Ungültige Formularelemente gefunden.", "error");
                                    return;
                                }

                                await this.loadUserData(user.uid);
                            } else {
                                console.warn("Formular nicht gefunden:", formId);
                                this.showNotification("Formular nicht gefunden.", "error");
                            }
                        } catch (error) {
                            console.error("Fehler beim Laden des Formulars:", error);
                            this.showNotification("Fehler beim Laden des Formulars. Bitte versuchen Sie es erneut.", "error");
                        }
                    } else {
                        window.location.href = "index.html";
                    }
                });
            },

            validateRequiredFields(formElements) {
                const errors = [];
                formElements.forEach(element => {
                    if (element.generalProperties.isRequired && element.generalProperties.visible) {
                        const value = element.userInput || ''; // Benutzerinput überprüfen
                        if (!value.trim() && element.type !== 'file-upload') {
                            errors.push(`Das Feld "${element.generalProperties.label}" muss ausgefüllt werden.`);
                            element.hasError = true; // Markiere das Feld als fehlerhaft
                        } else if (
                            element.type === 'file-upload' &&
                            (!element.specificProperties?.uploadedFiles || element.specificProperties.uploadedFiles.length === 0)
                        ) {
                            errors.push(`Mindestens eine Datei muss für "${element.generalProperties.label}" hochgeladen werden.`);
                            element.hasError = true; // Markiere das Feld als fehlerhaft
                        } else {
                            element.hasError = false; // Entferne die Fehlermarkierung
                        }
                    }
                });
                return errors;
            },


            handleSubmit() {
                const errors = this.validateRequiredFields(this.formElements);
                if (errors.length > 0) {
                    this.notification.message = errors.join('\n'); // Fehlermeldungen anzeigen
                    this.notification.type = 'error';
                    this.notification.visible = true;
                    setTimeout(() => (this.notification.visible = false), 5000); // Meldung ausblenden
                    return false; // Verhindert Absenden/Speichern
                }

                // Falls keine Fehler vorhanden sind
                console.log('Formular wurde erfolgreich abgesendet!');
                this.showNotification("Formular erfolgreich abgesendet!", "success");
                return true;
            },


            // Benutzerdaten laden
            async loadUserData(userId) {
                try {
                    const userDoc = await db.collection('users').doc(userId).get();
                    if (userDoc.exists) {
                        this.userData = {
                            Vorname: userDoc.data().firstName || 'Unbekannt',
                            Nachname: userDoc.data().lastName || 'Unbekannt',
                            Email: userDoc.data().email || 'Keine E-Mail angegeben',
                            Benutzerrolle: userDoc.data().role || 'Unbekannt'
                        };
                    } else {
                        console.warn("Benutzerdaten nicht gefunden.");
                    }
                } catch (error) {
                    console.error("Fehler beim Laden der Benutzerdaten:", error);
                }
            },

            // Dynamisches Rendern der Elemente basierend auf `form-elements.js`
            renderElement(element) {
                const definition = formElements.find(el => el.type === element.type);
                if (!definition) {
                    console.error(`Unbekannter Typ: ${element.type}`);
                    return `<div>Unbekannter Typ: ${element.type}</div>`;
                }

                if (typeof definition.render === 'function') {
                    try {
                        const renderedHtml = definition.render(element, this.userData || {});
                        if (element.type === 'file-upload') {
                            const fileListHtml = `
                                <ul id="file-list-${element.id}" class="uploaded-files">
                                    ${element.specificProperties.uploadedFiles
                                    ?.map(
                                        (file, index) =>
                                            `<li>
                                                    ${file.name} (${file.size})
                                                    <button type="button" onclick="import('./file-upload-utils.js').then(module => module.removeUploadedFile(${index}, '${element.id}', window.formElements))">Löschen</button>
                                                </li>`
                                    )
                                    .join('') || '<li>Keine Dateien hochgeladen</li>'}
                                </ul>
                            `;
                            return renderedHtml + fileListHtml;
                        }
                        return renderedHtml;
                    } catch (error) {
                        console.error(`Fehler beim Rendern von ${definition.label}:`, error);
                        return `<div>Fehler beim Rendern von ${definition.label}</div>`;
                    }
                }

                console.warn(`Kein Renderer definiert für: ${definition.label}`);
                return `<div>Kein Renderer für ${definition.label} definiert</div>`;
            },

            // Benachrichtigungen
            showNotification(message, type) {
                this.notification.message = message;
                this.notification.type = type;
                this.notification.visible = true;
                setTimeout(() => {
                    this.notification.visible = false;
                }, 3000);
            },
        },
        mounted() {
            this.loadForm(); // Daten laden
        },
    });
});
