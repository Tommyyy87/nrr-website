import { createApp } from 'https://cdn.jsdelivr.net/npm/vue@3/dist/vue.esm-browser.js';
import formElements from './form-elements.js';

const App = {
    template: `
    <div class="form-builder-container" @keyup="handleKeyUp" tabindex="0">
        <!-- Benachrichtigungsbereich -->
        <div id="notification" :class="['notification', notificationType, { show: notificationVisible }]">
            {{ notificationMessage }}
        </div>

        <!-- Modal-Popup für die Namenseingabe -->
        <div v-if="showNameModal" class="modal-overlay">
            <div class="modal">
                <h2>Formularname eingeben</h2>
                <input v-model="formNameInput" placeholder="Formularname" />
                <button @click="saveFormName">Speichern</button>
                <button @click="cancelFormCreation">Abbrechen</button>
            </div>
        </div>

        <!-- Header mit Aktionsbuttons -->
        <header class="form-builder-header">
            <div class="header-title">
                <h1>{{ formName || 'Neues Formular' }}</h1>
                <button @click="editFormName" class="edit-button header-action-button">
                    <i class="fas fa-pen"></i> Bearbeiten
                </button>
            </div>
            <div class="header-buttons">
                <button class="undo-button" @click="undo" :disabled="historyIndex <= 0">
                    <i class="fas fa-undo"></i> Rückgängig
                </button>
                <button class="redo-button" @click="redo" :disabled="historyIndex >= history.length - 1">
                    <i class="fas fa-redo"></i> Wiederholen
                </button>
                <button class="save-button" @click="saveForm"><i class="fas fa-save"></i> Speichern</button>
                <button class="preview-button"><i class="fas fa-eye"></i> Vorschau</button>
                <button class="back-button" @click="confirmBack"><i class="fas fa-arrow-left"></i> Zurück</button>
            </div>
        </header>

        <main>
            <section id="form-builder" class="form-builder-main">
                <!-- Baustein-Liste -->
                <div id="form-elements" class="form-elements">
                    <h2>Bausteine</h2>
                    <ul>
                        <li v-for="element in elements" :key="element.id" 
                            @dragstart="startDrag(element, $event)" 
                            @dragend="resetDragState"
                            draggable="true" 
                            @dblclick="addElementToPreview(element)">
                            <i :class="element.icon"></i>
                            <span class="element-label">{{ element.label }}</span>
                            <span class="help-icon" @click="toggleTooltip(element.id)">
                                ?
                                <span class="tooltip" v-if="activeTooltipId === element.id">{{ element.description }}</span>
                            </span>
                        </li>
                    </ul>
                </div>

                <!-- Form Vorschau-Bereich -->
                <div id="form-preview" class="form-preview" 
                    @dragover.prevent="onDragOverPreview"
                    @dragleave="onDragLeavePreview"
                    @drop="onDropPreview">
                    <h2>Vorschau</h2>

                    <div v-for="(item, index) in formElements" :key="item.id"
                        @dragover.prevent="onDragOver($event, index)"
                        @dragleave="onDragLeave($event, index)"
                        @drop="onDrop($event, index)">
                        <!-- Dynamischer Drop-Indikator für die aktuelle Position -->
                        <div v-if="dragOverIndex === index" class="drop-indicator"></div>

                        <!-- Vorschau des Elements -->
                        <div class="form-element live-preview"
                            @click="selectElement(item)"
                            @dragstart="startReorderDrag(index, $event)"
                            @dragend="resetDragState"
                            draggable="true"
                            :style="{
                                border: selectedElement?.id === item.id ? '2px solid #007bff' : '2px solid #ccc',
                                padding: '15px',
                                marginBottom: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                position: 'relative'
                            }">

                            <!-- Pfeile zum Verschieben -->
                            <div class="move-buttons" style="position: absolute; right: 10px;">
                                <button @click.stop="moveElementUp(index)" :disabled="index === 0">▲</button>
                                <button @click.stop="moveElementDown(index)" :disabled="index === formElements.length - 1">▼</button>
                            </div>

                            <!-- Icon des Elements anzeigen -->
                            <i :class="item.icon" style="margin-right: 8px;"></i>

                            <!-- Inhalt des Elements rendern -->
                            <!-- Hier kannst du deinen bestehenden Code zur Darstellung der Elemente einfügen -->
                            <div v-if="item.type === 'text'">
                                <!-- Beispiel: Textbaustein -->
                                <p>{{ item.specificProperties.content }}</p>
                            </div>

                            <div v-if="item.type === 'img'">
                                <!-- Beispiel: Bildbaustein -->
                                <img :src="item.specificProperties.uploadImage" alt="Bild" />
                            </div>

                            <!-- Weitere Elementtypen hier hinzufügen -->
                        </div>
                    </div>

                    <!-- Platzhalter am Ende, falls der Drop am Schluss der Liste sein soll -->
                    <div v-if="dragOverIndex === formElements.length" class="drop-indicator"></div>
                </div>

                <!-- Eigenschaftenbereich -->
                <aside id="properties" class="form-properties">
                    <div v-if="selectedElement">
                        <div class="properties-header">
                            <i :class="selectedElement.icon"></i> {{ selectedElement.label }}
                        </div>
                        <p class="description">{{ selectedElement.description }}</p>

                        <!-- Duplizieren und Löschen -->
                        <div class="properties-buttons">
                            <button @click="duplicateElement" class="duplicate-button">
                                <i class="fas fa-copy"></i> Duplizieren
                            </button>
                            <button @click="deleteSelectedElementFromProperties" class="delete-button">
                                <i class="fas fa-trash"></i> Löschen
                            </button>
                        </div>

                        <!-- Allgemeine Baustein-ID anzeigen -->
                        <div class="property">
                            <label>Baustein ID:</label>
                            <span>{{ selectedElement.id }}</span>
                        </div>

                        <!-- Baustein spezifische Eigenschaften je nach Typ -->
                        <!-- Füge hier deine spezifischen Eigenschaften für die Elemente hinzu -->
                    </div>
                    <p v-else>Kein Element ausgewählt</p>
                </aside>
            </section>
        </main>
    </div>
    `,
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
            draggedIndex: null
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
        // Ausgewähltes Element setzen
        selectElement(element) {
            if (!element.specificProperties) {
                element.specificProperties = {
                    datasetField: 'firstName', // Standardwert für das Datensatzfeld
                    alignment: 'left',         // Standardausrichtung
                    fontSize: 'medium',        // Standard-Textgröße
                    fontFamily: 'Arial',       // Standardschriftart
                    title: ''                  // Standardtitel (leer)
                };
            }
            if (typeof element.specificProperties.proportionLocked === 'undefined') {
                element.specificProperties.proportionLocked = true;
            }
            this.selectedElement = element;
        },
        // Hinzufügen eines Elements zur Vorschau per Doppelklick
        addElementToPreview(element) {
            const newElement = {
                ...element,
                id: Date.now(),
                specificProperties: {
                    ...element.specificProperties,
                    title: element.specificProperties?.title || "",
                    datasetField: element.specificProperties?.datasetField || "firstName",
                    alignment: element.specificProperties?.alignment || "left",
                    fontSize: element.specificProperties?.fontSize || "medium",
                    fontFamily: element.specificProperties?.fontFamily || "Arial"
                }
            };
            // Element nach dem ausgewählten Element einfügen oder ans Ende setzen
            let index = this.formElements.length;
            if (this.selectedElement) {
                index = this.formElements.indexOf(this.selectedElement) + 1;
            }
            this.formElements.splice(index, 0, newElement);
            this.saveToHistory(); // Änderung speichern
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
                return;
            }
            if (this.selectedElement) {
                const index = this.formElements.indexOf(this.selectedElement);
                if (event.key === '+') {
                    // Element nach oben verschieben
                    if (index > 0) {
                        this.moveElementUp(index);
                        // Aktualisiere das ausgewählte Element
                        this.selectedElement = this.formElements[index - 1];
                    }
                } else if (event.key === '-') {
                    // Element nach unten verschieben
                    if (index < this.formElements.length - 1) {
                        this.moveElementDown(index);
                        // Aktualisiere das ausgewählte Element
                        this.selectedElement = this.formElements[index + 1];
                    }
                } else if (event.key === 'Delete') {
                    // Löschen-Taste, bereits anderweitig behandelt
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
        // Formular speichern
        async saveForm() {
            if (!this.formName || this.formName === 'Neues Formular') {
                this.showNameModal = true;
                return;
            }
            try {
                const formData = {
                    name: this.formName,
                    elements: this.formElements,
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
                        this.formElements = formData.elements || [];
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
    },
    async mounted() {
        await this.checkAdminStatus();
        await this.loadFormData();
        this.$el.focus();
    }
};

// Vue-App erstellen und die Komponente mounten
createApp(App).mount('#app');
