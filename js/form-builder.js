import { createApp } from 'https://cdn.jsdelivr.net/npm/vue@3/dist/vue.esm-browser.js';
import formElements from './form-elements.js';
import { handleFileUpload, removeUploadedFile, getUploadedFiles, validateUploadedFiles } from './file-upload-utils.js';



(async () => {
    // Laden des Templates
    const response = await fetch('../template.html');
    const template = await response.text();

    const App = {
        template: template,

        data() {
            return {
                formId: null,
                formName: 'Neues Formular',
                userData: {}, // `userData` hinzugefügt, damit die Fehlermeldung verschwindet
                formNameInput: '',
                showNameModal: false,
                elements: formElements,
                formElements: [],
                history: [],
                historyIndex: -1,
                selectedElement: null,
                user: null,
                isFormSaved: true,
                notificationMessage: '',
                notificationType: '',
                notificationVisible: false,
                activeTooltipId: null,
                uploadedImageDimensions: null,
                dragOverIndex: null,
                draggedElement: null,
                draggedIndex: null,
                isGeneralVisible: true, // Hinzugefügt: Standardmäßig sichtbar
                isSpecificVisible: true,  // Hinzugefügt: Standardmäßig sichtbar

            };
        },
        methods: {
            // Speichern des Formularnamens
            saveFormName() {
                this.formName = this.formNameInput;
                this.showNameModal = false;
            },
            // Abbrechen der Formularerstellung
            cancelFormCreation() {
                this.showNameModal = false;
            },
            // Bearbeiten des Formularnamens
            editFormName() {
                this.formNameInput = this.formName;
                this.showNameModal = true;
                this.saveToHistory(); // Änderung speichern
            },
            // Anzeigen einer Benachrichtigung
            showNotification(message, type = 'success') {
                this.notificationMessage = message;
                this.notificationType = type;
                this.notificationVisible = true;
                setTimeout(() => {
                    this.notificationVisible = false;
                }, 3000);
            },


            // Bausteine
            updateSpecificProperty(key, value) {
                if (this.selectedElement && this.selectedElement.specificProperties) {
                    this.selectedElement.specificProperties[key] = value;
                    this.$forceUpdate(); // Ansicht aktualisieren
                    this.saveToHistory(); // Änderungen speichern
                    this.isFormSaved = false; // Formular als nicht gespeichert markieren

                    // Delegiere Datei-Handling an die zentrale Funktion
                    if (key === 'uploadedFiles' && value instanceof FileList) {
                        handleFileUpload(value, this.selectedElement);
                    }
                }
            },
            // Variable in den Text einfügen
            insertVariable(variableKey) {
                const currentText = this.selectedElement.specificProperties.content || '';
                this.selectedElement.specificProperties.content = `${currentText} ((${variableKey}))`;
            },
            // saveToDatabase() {
            //     if (!this.formId) {
            //         console.error("Fehler: formId ist nicht verfügbar. Speichern abgebrochen.");
            //         return;
            //     }

            //     // Entfernen von Funktionen wie `render` für die Speicherung
            //     const cleanElements = this.formElements.map((element) => {
            //         const { render, ...rest } = element; // Entfernt `render`
            //         return JSON.parse(JSON.stringify(rest)); // Entfernt restliche nicht-JSON-kompatible Werte
            //     });
            //     db.collection('forms').doc(this.formId).set({
            //         name: this.formName,
            //         elements: cleanElements, // Gespeicherte Daten enthalten keine Funktionen
            //         createdAt: new Date().toISOString(),
            //         published: false,
            //         userId: this.user ? this.user.uid : null
            //     }, { merge: true }).then(() => {
            //         console.log("Formular erfolgreich gespeichert.");
            //         this.showNotification("Formular erfolgreich gespeichert.", "success");
            //     }).catch(error => {
            //         console.error("Fehler beim Speichern des Formulars:", error);
            //         this.showNotification("Fehler beim Speichern des Formulars.", 'error');
            //     });
            // },

            toggleSection(section) {
                if (section === 'general') {
                    this.isGeneralVisible = !this.isGeneralVisible;
                } else if (section === 'specific') {
                    this.isSpecificVisible = !this.isSpecificVisible;
                }
            },

            updateVisibility() {
                if (this.selectedElement) {
                    console.log("Sichtbarkeit geändert für Element:", this.selectedElement.id, this.selectedElement.generalProperties.visible);
                    this.saveToHistory();
                    this.isFormSaved = false;
                }
            },

            toggleVisibility() {
                if (this.selectedElement && this.selectedElement.specificProperties) {
                    // Umschalten der Sichtbarkeit und Erzwingen eines Updates
                    this.selectedElement.specificProperties.visible = !this.selectedElement.specificProperties.visible;
                    this.$forceUpdate();
                    console.log("Sichtbarkeit geändert auf:", this.selectedElement.specificProperties.visible);
                } else {
                    console.log("Kein Element ausgewählt oder spezifische Eigenschaften fehlen.");
                }
            },


            toggleFileType(fileType) {
                const allowedFileTypes = this.selectedElement.specificProperties.allowedFileTypes || [];

                if (allowedFileTypes.includes(fileType)) {
                    // Entferne den Dateityp, wenn er bereits vorhanden ist
                    this.selectedElement.specificProperties.allowedFileTypes = allowedFileTypes.filter(
                        (type) => type !== fileType
                    );
                } else {
                    // Füge den Dateityp hinzu, wenn er noch nicht vorhanden ist
                    this.selectedElement.specificProperties.allowedFileTypes.push(fileType);
                }

                // Speichere Änderungen und aktualisiere die Ansicht
                this.updateSpecificProperty('allowedFileTypes', this.selectedElement.specificProperties.allowedFileTypes);
            },

            // Ausgewähltes Element setzen
            selectElement(element) {
                // Initialisierung der allgemeinen Eigenschaften, falls nicht vorhanden
                if (!element.generalProperties) {
                    console.warn(`Allgemeine Eigenschaften fehlen für Element mit ID ${element.id}.`);
                }

                // Initialisierung der spezifischen Eigenschaften, falls nicht vorhanden
                if (!element.specificProperties) {
                    console.warn(`Spezifische Eigenschaften fehlen für Element mit ID ${element.id}.`);
                }
                // Element als ausgewählt setzen
                this.selectedElement = element;
                console.log("Allgemeine Sichtbarkeit:", this.selectedElement.generalProperties.visible);
                console.log("Spezifische Sichtbarkeit:", this.selectedElement.specificProperties.visible);
            },
            // Hinzufügen eines Elements zur Vorschau per Doppelklick
            addElementToPreview(element) {
                const newElement = {
                    ...element,
                    id: Date.now(), // Neue eindeutige ID
                    generalProperties: { ...element.generalProperties },
                    specificProperties: {
                        ...element.specificProperties,
                        uploadedFiles: element.specificProperties?.uploadedFiles || [] // Initialisiere `uploadedFiles`, falls nicht vorhanden
                    },
                    render: element.render, // Sicherstellen, dass `render` übernommen wird
                };
                this.formElements.push(newElement);
                this.saveToHistory();
                this.isFormSaved = false;
            },

            // Hinzufügen eines Elements zur Vorschau per Drag-and-Drop
            startDrag(element, event) {
                this.draggedElement = { ...element };
                event.dataTransfer.effectAllowed = 'copy';
                event.dataTransfer.setData('application/json', JSON.stringify({ type: 'new', id: element.id }));
            },
            // Startet das Dragging eines Elements zur Neupositionierung
            startReorderDrag(index, event) {
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('application/json', JSON.stringify({ type: 'existing', index }));
                this.draggedIndex = index;
            },
            // Rücksetzen des Dragging-Status
            resetDragState() {
                this.draggedElement = null;
                this.dragOverIndex = null;
                this.draggedIndex = null;
            },
            // DragOver-Ereignis für bestehende Elemente
            onDragOver(event, index) {
                event.preventDefault();
                if (this.dragOverIndex !== index) {
                    this.dragOverIndex = index;
                }
            },
            // DragLeave-Ereignis für bestehende Elemente
            onDragLeave(event, index) {
                const rect = event.currentTarget.getBoundingClientRect();
                if (
                    event.clientX < rect.left ||
                    event.clientX > rect.right ||
                    event.clientY < rect.top ||
                    event.clientY > rect.bottom
                ) {
                    this.dragOverIndex = null;
                }
            },

            updateGeneralProperty(property, value) {
                if (this.selectedElement && this.selectedElement.generalProperties) {
                    this.selectedElement.generalProperties[property] = value;
                }
            },

            // Drop-Ereignis für bestehende Elemente
            onDrop(event, index) {
                event.preventDefault();
                const data = JSON.parse(event.dataTransfer.getData('application/json'));
                if (data.type === 'existing') {
                    // Verschieben eines vorhandenen Elements
                    const draggedIndex = data.index;
                    if (draggedIndex !== index) {
                        const [element] = this.formElements.splice(draggedIndex, 1);
                        // Index anpassen, wenn Element nach unten verschoben wird
                        if (draggedIndex < index) {
                            index--;
                        }
                        this.formElements.splice(index, 0, element);
                    }
                } else if (data.type === 'new') {
                    // Hinzufügen eines neuen Elements
                    const elementId = data.id;
                    const element = this.elements.find(el => el.id === elementId);
                    if (element) {
                        const newElement = {
                            ...element,
                            id: Date.now(),
                            specificProperties: { ...element.specificProperties }
                        };
                        this.formElements.splice(index, 0, newElement);
                    }
                }
                this.dragOverIndex = null;
                this.resetDragState();
                this.isFormSaved = false;
                this.saveToHistory(); // Änderung speichern
            },
            // DragOver-Ereignis für den Vorschau-Bereich
            onDragOverPreview(event) {
                event.preventDefault();
                if (this.dragOverIndex !== this.formElements.length) {
                    this.dragOverIndex = this.formElements.length;
                }
            },
            // DragLeave-Ereignis für den Vorschau-Bereich
            onDragLeavePreview(event) {
                const rect = event.currentTarget.getBoundingClientRect();
                if (
                    event.clientX < rect.left ||
                    event.clientX > rect.right ||
                    event.clientY < rect.top ||
                    event.clientY > rect.bottom
                ) {
                    this.dragOverIndex = null;
                }
            },
            // Drop-Ereignis für den Vorschau-Bereich
            onDropPreview(event) {
                event.preventDefault();
                this.onDrop(event, this.formElements.length);
            },
            // Tastatureingaben verarbeiten
            handleKeyUp(event) {
                const activeElement = document.activeElement;
                const isInputActive = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'SELECT' || activeElement.tagName === 'TEXTAREA');
                if (isInputActive) {
                    return;
                }
                if (this.selectedElement) {
                    const index = this.formElements.indexOf(this.selectedElement);
                    if (event.key === '-' || event.key === 'ArrowUp') {
                        // Element nach oben verschieben
                        if (index > 0) {
                            this.moveElementUp(index);
                            // Aktualisiere das ausgewählte Element
                            this.selectedElement = this.formElements[index - 1];
                        }
                    } else if (event.key === '+' || event.key === 'ArrowDown') {
                        // Element nach unten verschieben
                        if (index < this.formElements.length - 1) {
                            this.moveElementDown(index);
                            // Aktualisiere das ausgewählte Element
                            this.selectedElement = this.formElements[index + 1];
                        }
                    } else if (event.key === 'Delete') {
                        this.deleteSelectedElement();
                    }
                }
            },
            // Element nach oben verschieben
            moveElementUp(index) {
                if (index > 0) {
                    const temp = this.formElements[index];
                    this.formElements.splice(index, 1);
                    this.formElements.splice(index - 1, 0, temp);
                    this.isFormSaved = false;
                    this.saveToHistory();
                }
            },
            // Element nach unten verschieben
            moveElementDown(index) {
                if (index < this.formElements.length - 1) {
                    const temp = this.formElements[index];
                    this.formElements.splice(index, 1);
                    this.formElements.splice(index + 1, 0, temp);
                    this.isFormSaved = false;
                    this.saveToHistory();
                }
            },
            // Element duplizieren
            duplicateElement() {
                if (this.selectedElement) {
                    const duplicate = JSON.parse(JSON.stringify(this.selectedElement)); // Tiefe Kopie erstellen
                    duplicate.id = Date.now(); // Eindeutige ID für das Duplikat setzen
                    const index = this.formElements.indexOf(this.selectedElement);
                    this.formElements.splice(index + 1, 0, duplicate); // Duplikat nach dem Original einfügen
                    this.isFormSaved = false;
                    this.selectedElement = duplicate; // Optional: das Duplikat als ausgewähltes Element setzen
                    this.saveToHistory(); // Änderung speichern
                }
            },
            // Ausgewähltes Element löschen (aus Eigenschaftenbereich)
            deleteSelectedElementFromProperties() {
                if (this.selectedElement) {
                    const index = this.formElements.indexOf(this.selectedElement);
                    if (index > -1) {
                        this.formElements.splice(index, 1);
                        this.isFormSaved = false;
                        this.saveToHistory(); // Änderung speichern
                    }
                    // Ausgewähltes Element zurücksetzen
                    this.selectedElement = null;
                }
            },

            // Ausgewähltes Element löschen (mit Delete-Taste)
            deleteSelectedElement(event) {
                const activeElement = document.activeElement;
                const isInputActive = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'SELECT' || activeElement.tagName === 'TEXTAREA');
                if (!isInputActive && this.selectedElement) {
                    const index = this.formElements.indexOf(this.selectedElement);
                    if (index > -1) {
                        this.formElements.splice(index, 1);
                        this.isFormSaved = false;
                        this.saveToHistory(); // Änderung speichern
                        this.selectedElement = null;
                    }
                }
            },
            // Änderungshistorie speichern
            saveToHistory() {
                // Zustände speichern, wenn Änderungen auftreten
                if (this.historyIndex < this.history.length - 1) {
                    this.history = this.history.slice(0, this.historyIndex + 1);
                }
                this.history.push(JSON.parse(JSON.stringify(this.formElements)));
                this.historyIndex++;
            },
            // Rückgängig machen
            undo() {
                if (this.historyIndex > 0) {
                    this.historyIndex--;
                    this.formElements = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
                }
            },
            // Wiederholen
            redo() {
                if (this.historyIndex < this.history.length - 1) {
                    this.historyIndex++;
                    this.formElements = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
                }
            },

            async createNewForm() {
                try {
                    // Ein leeres Formular in Firebase erstellen und ID erhalten
                    const docRef = await db.collection('forms').add({});
                    this.formId = docRef.id; // Die neue ID setzen
                    console.log(`Neue FormId erstellt: ${this.formId}`);

                    // Direkt speichern mit der neuen FormId
                    await this.saveForm();
                    console.log("Formular sofort nach Erstellung gespeichert.");
                } catch (error) {
                    console.error("Fehler beim Erstellen eines neuen Formulars:", error);
                    this.showNotification("Fehler beim Erstellen eines neuen Formulars.", 'error');
                }
            },

            // Formular speichern
            async saveForm() {
                if (!this.formName || this.formName === 'Neues Formular') {
                    this.showNameModal = true; // Zeigt Modal an, um den Formularnamen einzugeben
                    return;
                }

                try {
                    // Entfernen von Funktionen und nicht-JSON-kompatiblen Daten
                    const cleanElements = this.formElements.map((element) => {
                        const { render, ...rest } = element; // Entferne `render`
                        return JSON.parse(JSON.stringify(rest)); // Entferne alle nicht-serialisierbaren Eigenschaften
                    });

                    // Daten für Firestore vorbereiten
                    const formData = {
                        name: this.formName,
                        elements: cleanElements,
                        createdAt: new Date().toISOString(),
                        published: false,
                        userId: this.user ? this.user.uid : null // Aktuellen Benutzer speichern, falls vorhanden
                    };

                    // Daten in Firestore speichern (entweder neues Formular oder Update)
                    if (this.formId) {
                        // Update eines bestehenden Formulars
                        await db.collection('forms').doc(this.formId).update(formData);
                    } else {
                        // Neues Formular erstellen
                        const docRef = await db.collection('forms').add(formData);
                        this.formId = docRef.id; // Speichere die neue FormId
                    }

                    // Erfolgreiche Speicherung anzeigen
                    this.showNotification("Formular erfolgreich gespeichert.", "success");
                    this.isFormSaved = true; // Status auf "gespeichert" setzen
                } catch (error) {
                    // Fehlerbehandlung
                    console.error("Fehler beim Speichern des Formulars:", error);
                    this.showNotification("Fehler beim Speichern des Formulars.", "error");
                }
            },
            // Zurück zum Formularmanagement mit Bestätigung
            confirmBack() {
                if (!this.isFormSaved) {
                    if (confirm("Sie haben ungespeicherte Änderungen. Möchten Sie wirklich zurückkehren und Änderungen verwerfen?")) {
                        this.goBackToFormManagement();
                    }
                } else {
                    this.goBackToFormManagement();
                }
            },
            // Navigation zum Formularmanagement
            goBackToFormManagement() {
                window.location.href = "formmanagement.html";
            },
            // Formular-Daten laden
            async loadFormData() {
                const urlParams = new URLSearchParams(window.location.search);
                this.formId = urlParams.get('formId');
                if (this.formId) {
                    try {
                        const doc = await db.collection('forms').doc(this.formId).get();
                        if (doc.exists) {
                            const formData = doc.data();
                            this.formName = formData.name;

                            // Wiederherstellen der `render`-Funktionen für die Vorschau
                            this.formElements = formData.elements.map(savedElement => {
                                const matchingDefinition = formElements.find(el => el.type === savedElement.type);
                                if (matchingDefinition) {
                                    return {
                                        ...savedElement,
                                        render: matchingDefinition.render,
                                    };
                                } else {
                                    return savedElement;
                                }
                            });
                        }
                    } catch (error) {
                        console.error("Fehler beim Laden des Formulars:", error);
                        this.showNotification("Fehler beim Laden des Formulars.", 'error');
                    }
                } else {
                    // Neues Formular erstellen, wenn keine ID vorhanden ist
                    await this.createNewForm();
                }
            },

            // Admin-Status prüfen
            async checkAdminStatus() {
                try {
                    const user = await auth.currentUser;
                    if (user) {
                        const userDoc = await db.collection('users').doc(user.uid).get();
                        const userData = userDoc.data();
                        if (!userData.isAdmin && !userData.isMainAdmin) {
                            this.showNotification("Sie haben keine Berechtigung, diese Seite zu sehen.", 'error');
                            window.location.href = "home.html";
                        } else {
                            this.user = user;
                        }
                    } else {
                        auth.onAuthStateChanged(async (user) => {
                            if (user) {
                                const userDoc = await db.collection('users').doc(user.uid).get();
                                const userData = userDoc.data();
                                if (userData.isAdmin || userData.isMainAdmin) {
                                    this.user = user;
                                } else {
                                    this.showNotification("Sie haben keine Berechtigung, diese Seite zu sehen.", 'error');
                                    window.location.href = "home.html";
                                }
                            } else {
                                window.location.href = "index.html";
                            }
                        });
                    }
                } catch (error) {
                    window.location.href = "index.html";
                }
            }
        },

        computed: {
            // Mögliche Variablen
            variableOptions() {
                return {
                    Vorname: 'Vorname',
                    Nachname: 'Nachname',
                    Email: 'Email Adresse',
                    Benutzerrolle: 'Benutzerrolle'
                };
            }
        },
        async mounted() {
            await this.checkAdminStatus();
            await this.loadFormData();
            // this.$el.focus();

            // Globaler Klick-Event-Listener zum Testen
            // Event-Listener für Hover-Events
            document.querySelectorAll('.help-icon').forEach((icon) => {
                const elementId = icon.getAttribute('data-id');
                const elementData = formElements.find((el) => el.id === parseInt(elementId));

                if (!elementData || !elementData.description) {
                    console.warn(`Tooltip konnte für Icon mit ID ${elementId} nicht geladen werden.`);
                    return;
                }

                let tooltip = icon.querySelector('.tooltip');
                if (!tooltip) {
                    tooltip = document.createElement('span');
                    tooltip.className = 'tooltip';
                    tooltip.innerText = elementData.description;
                    document.body.appendChild(tooltip); // Tooltip direkt zum Body hinzufügen
                }

                icon.addEventListener('mouseover', (event) => {
                    const { top, left, width, height } = icon.getBoundingClientRect();
                    const tooltipWidth = tooltip.offsetWidth;
                    const tooltipHeight = tooltip.offsetHeight;

                    // Scrollposition des Dokuments berücksichtigen
                    const scrollY = window.scrollY || document.documentElement.scrollTop;
                    const scrollX = window.scrollX || document.documentElement.scrollLeft;

                    // Tooltip-Position berechnen
                    tooltip.style.position = 'absolute';
                    tooltip.style.top = `${top + scrollY - tooltipHeight - 10}px`; // Über dem Icon
                    tooltip.style.left = `${left + scrollX + width / 2 - tooltipWidth / 2}px`; // Zentrieren
                    tooltip.style.display = 'block';
                    tooltip.style.opacity = '1';
                    tooltip.style.zIndex = '9999';

                    // Sicherstellen, dass der Tooltip im Viewport bleibt
                    const viewportWidth = window.innerWidth;
                    const viewportHeight = window.innerHeight;

                    if (top - tooltipHeight < 0) {
                        tooltip.style.top = `${top + scrollY + height + 10}px`; // Unter dem Icon
                    }

                    if (left + tooltipWidth > viewportWidth) {
                        tooltip.style.left = `${viewportWidth - tooltipWidth - 10}px`; // Rechts begrenzen
                    }

                    if (left < 0) {
                        tooltip.style.left = `10px`; // Links begrenzen
                    }
                });

                icon.addEventListener('mouseout', () => {
                    tooltip.style.opacity = '0';
                    setTimeout(() => {
                        tooltip.style.display = 'none';
                    }, 300);
                });
            });
        }

    };

    // Vue-App erstellen und die Komponente mounten
    createApp(App).mount('#app');
})(); // <-- Fehlende schließende Klammern hinzugefügt
