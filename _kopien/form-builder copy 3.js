import { createApp } from 'https://cdn.jsdelivr.net/npm/vue@3/dist/vue.esm-browser.js';
import formElements from './form-elements.js';

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
                proportionLocked: true,
                uploadedImageDimensions: null,
                dragOverIndex: null,
                draggedElement: null,
                draggedIndex: null,
                isGeneralVisible: true, // Hinzugefügt: Standardmäßig sichtbar


            };
        },
        methods: {
            // Umschalten der Tooltip-Anzeige
            toggleTooltip(id) {
                this.activeTooltipId = this.activeTooltipId === id ? null : id;
            },
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


            // Ausgewähltes Element setzen
            selectElement(element) {
                // Initialisierung der allgemeinen Eigenschaften, falls nicht vorhanden
                if (!element.generalProperties) {
                    element.generalProperties = {
                        visible: true // Standardwert für allgemeine Sichtbarkeit
                    };
                }
                // Initialisierung der spezifischen Eigenschaften, falls nicht vorhanden
                if (!element.specificProperties) {
                    element.specificProperties = {
                        datasetField: 'firstName',
                        alignment: 'left',
                        fontSize: 'medium',
                        fontFamily: 'Arial',
                        title: '',
                    };
                }
                // Sicherstellen, dass proportionLocked in den spezifischen Eigenschaften existiert
                if (typeof element.specificProperties.proportionLocked === 'undefined') {
                    element.specificProperties.proportionLocked = true;
                }
                // Sicherstellen, dass visible in den spezifischen Eigenschaften existiert
                if (typeof element.specificProperties.visible === 'undefined') {
                    element.specificProperties.visible = true;
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
                    id: Date.now(),
                    generalProperties: {
                        ...element.generalProperties,
                        visible: element.generalProperties?.visible ?? true // Sichtbarkeit sicherstellen
                    },
                    specificProperties: {
                        ...element.specificProperties,
                        title: element.specificProperties?.title || "",
                        datasetField: element.specificProperties?.datasetField || "firstName",
                        alignment: element.specificProperties?.alignment || "left",
                        fontSize: element.specificProperties?.fontSize || "medium",
                        fontFamily: element.specificProperties?.fontFamily || "Arial"
                    }
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
                    console.log("Eingabefeld aktiv, Löschen deaktiviert.");
                    return;
                }

                if (this.selectedElement) {
                    const index = this.formElements.indexOf(this.selectedElement);
                    if (event.key === '+') {
                        if (index > 0) {
                            this.moveElementUp(index);
                            this.selectedElement = this.formElements[index - 1];
                        }
                    } else if (event.key === '-') {
                        if (index < this.formElements.length - 1) {
                            this.moveElementDown(index);
                            this.selectedElement = this.formElements[index + 1];
                        }
                    } else if (event.key === 'Delete') {
                        console.log("Löschen-Taste gedrückt");
                        this.deleteSelectedElement();
                    }
                } else {
                    console.log("Kein Element ausgewählt, Löschen-Taste ignoriert.");
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
        deleteSelectedElement() {
            if (this.selectedElement) {
                const index = this.formElements.indexOf(this.selectedElement);
                if (index > -1) {
                    console.log(`Element mit ID ${this.selectedElement.id} wird gelöscht.`);
                    this.formElements.splice(index, 1);
                    this.isFormSaved = false;
                    this.saveToHistory(); // Änderung speichern
                    this.selectedElement = null;
                } else {
                    console.log("Ausgewähltes Element nicht in der Liste gefunden.");
                }
            } else {
                console.log("Kein Element ausgewählt. Löschen abgebrochen.");
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
        // Formular speichern
        async saveForm() {
            if (!this.formName || this.formName === 'Neues Formular') {
                this.showNameModal = true;
                return;
            }
            try {
                const formData = {
                    name: this.formName,
                    elements: this.formElements.map(element => ({
                        ...element,
                        generalProperties: {
                            ...element.generalProperties,
                            visible: element.generalProperties?.visible ?? true // Allgemeine Sichtbarkeit sicherstellen
                        },
                        specificProperties: {
                            ...element.specificProperties,
                            visible: element.specificProperties?.visible ?? true // Spezifische Sichtbarkeit sicherstellen
                        }
                    })),
                    createdAt: new Date().toISOString(),
                    published: false,
                    userId: this.user ? this.user.uid : null
                };
                if (this.formId) {
                    await db.collection('forms').doc(this.formId).update(formData);
                } else {
                    const docRef = await db.collection('forms').add(formData);
                    this.formId = docRef.id;
                }
                this.showNotification("Formular erfolgreich gespeichert.", "success");
                this.isFormSaved = true;
            } catch (error) {
                this.showNotification("Fehler beim Speichern des Formulars.", 'error');
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
                        this.formElements = formData.elements.map(element => ({
                            ...element,
                            generalProperties: {
                                ...element.generalProperties,
                                visible: element.specificProperties?.visible ?? true // Sicherstellen, dass visible vorhanden ist
                            }
                        }));
                    }
                } catch (error) {
                    this.showNotification("Fehler beim Laden des Formulars.", 'error');
                }
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
    }, // Komma hier hinzugefügt
        mounted() {
            (async () => {
                await this.checkAdminStatus();
                await this.loadFormData();
            })();
        }

}); // Sicherstellen, dass das App-Objekt hier korrekt abgeschlossen ist

// Vue-App erstellen und die Komponente mounten
createApp(App).mount('#app');