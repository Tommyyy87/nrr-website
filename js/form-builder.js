import { createApp } from 'https://cdn.jsdelivr.net/npm/vue@3/dist/vue.esm-browser.js';
import formElements from './form-elements.js';

const App = {
    template: `
    <div class="form-builder-container" @keyup.delete="deleteSelectedElement($event)" tabindex="0">
        <!-- Benachrichtigungsbereich, wird basierend auf styles.css angezeigt -->
        <div id="notification" :class="['notification', notificationType, { show: notificationVisible }]">
            {{ notificationMessage }}
        </div>

        <!-- Modal-Popup für die Namenseingabe, erscheint nur beim Speichern, wenn kein Name vorhanden -->
        <div v-if="showNameModal" class="modal-overlay">
            <div class="modal">
                <h2>Formularname eingeben</h2>
                <input v-model="formNameInput" placeholder="Formularname" />
                <button @click="saveFormName">Speichern</button>
                <button @click="cancelFormCreation">Abbrechen</button>
            </div>
        </div>

        <header class="form-builder-header">
            <div class="header-title">
                <h1>{{ formName || 'Neues Formular' }}</h1>
                <button @click="editFormName" class="edit-button header-action-button">
                    <i class="fas fa-pen"></i> Bearbeiten
                </button>
            </div>
            <div class="header-buttons">
                <button class="undo-button"><i class="fas fa-undo"></i> Rückgängig</button>
                <button class="redo-button"><i class="fas fa-redo"></i> Wiederholen</button>
                <button class="save-button" @click="saveForm"><i class="fas fa-save"></i> Speichern</button>
                <button class="preview-button"><i class="fas fa-eye"></i> Vorschau</button>
                <button class="back-button" @click="confirmBack"><i class="fas fa-arrow-left"></i> Zurück</button>
            </div>
        </header>

        <main>
            <section id="form-builder" class="form-builder-main">
                <div id="form-elements" class="form-elements">
                    <h2>Bausteine</h2>
                    <ul>
                        <li v-for="element in elements" :key="element.id" 
                            @dragstart="startDrag(element, $event)" 
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
                <div id="form-preview" class="form-preview" @drop="drop($event)" @dragover.prevent="onDragOver($event)">
                    <h2>Vorschau</h2>
                    <div v-for="(item, index) in formElements" :key="item.id" class="form-element"
                         @click="selectElement(item)" 
                         @dragstart="startReorderDrag(index, $event)" 
                         draggable="true" 
                         @dragover.prevent="onDragOver($event, index)" 
                         @drop="reorderDrop($event, index)">
                        <label>{{ item.label }}</label>
                        <component v-if="item.type !== 'section'" :is="item.type"></component>
                        <button @click="removeElement(index)" class="delete-button">Löschen</button>
                    </div>
                </div>
                <aside id="properties" class="form-properties">
                    <div v-if="selectedElement">
                        <div class="properties-header">
                            <i :class="selectedElement.icon"></i> {{ selectedElement.label }}
                        </div>
                        
                        <p class="description">{{ selectedElement.description }}</p>

                        <div class="properties-buttons">
                            <button @click="duplicateElement" class="duplicate-button">
                                <i class="fas fa-copy"></i> Duplizieren
                            </button>
                            <button @click="removeElement(selectedElement.id)" class="delete-button">
                                <i class="fas fa-trash"></i> Löschen
                            </button>
                        </div>

                        <div class="property" v-if="selectedElement.generalProperties">
                            <label for="label">Beschriftung:</label>
                            <input type="text" v-model="selectedElement.generalProperties.label" id="label" />
                        </div>
                        
                        <div v-for="(value, key) in selectedElement.specificProperties" :key="key" class="property">
                            <label :for="key">{{ key }}:</label>
                            <template v-if="typeof value === 'boolean'">
                                <input type="checkbox" v-model="selectedElement.specificProperties[key]" :id="key" />
                            </template>
                            <template v-else-if="typeof value === 'string'">
                                <input type="text" v-model="selectedElement.specificProperties[key]" :id="key" />
                            </template>
                            <template v-else>
                                <select v-model="selectedElement.specificProperties[key]" :id="key">
                                    <option value="option1">Option 1</option>
                                    <option value="option2">Option 2</option>
                                </select>
                            </template>
                        </div>
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
            selectedElement: null,
            draggedElement: null,
            draggedIndex: null,
            placeholderIndex: null,
            user: null,
            isFormSaved: true,
            notificationMessage: '',
            notificationType: '',
            notificationVisible: false,
            activeTooltipId: null // Neue Daten-Eigenschaft für das aktive Tooltip
        };
    },
    methods: {
        toggleTooltip(id) {
            console.log("Tooltip toggled for element ID:", id);
            this.activeTooltipId = this.activeTooltipId === id ? null : id;
        },
        saveFormName() {
            console.log("Speichern des Formularnamens:", this.formNameInput);
            this.formName = this.formNameInput;
            this.showNameModal = false;
        },
        cancelFormCreation() {
            console.log("Formularerstellung abgebrochen");
            this.showNameModal = false;
        },
        editFormName() {
            console.log("Formularname bearbeiten: Aktueller Name:", this.formName);
            this.formNameInput = this.formName;
            this.showNameModal = true;
        },
        showNotification(message, type = 'success') {
            console.log("Benachrichtigung anzeigen:", message, "vom Typ:", type);
            this.notificationMessage = message;
            this.notificationType = type;
            this.notificationVisible = true;
            setTimeout(() => {
                console.log("Benachrichtigung ausblenden");
                this.notificationVisible = false;
            }, 3000);
        },
        async saveForm() {
            if (!this.formName || this.formName === 'Neues Formular') {
                console.log("Formularname fehlt, öffne Modalfenster zur Namenseingabe");
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

                console.log("Speichere Formular: ", formData);

                if (this.formId) {
                    await db.collection('forms').doc(this.formId).update(formData);
                } else {
                    const docRef = await db.collection('forms').add(formData);
                    this.formId = docRef.id;
                }

                console.log("Formular erfolgreich gespeichert, ID:", this.formId);
                this.showNotification("Formular erfolgreich gespeichert.", "success");
                this.isFormSaved = true;
            } catch (error) {
                console.error("Fehler beim Speichern des Formulars:", error);
                this.showNotification("Fehler beim Speichern des Formulars. Bitte versuchen Sie es erneut.", 'error');
            }
        },
        confirmBack() {
            if (!this.isFormSaved) {
                if (confirm("Sie haben ungespeicherte Änderungen. Möchten Sie wirklich zurückkehren und Änderungen verwerfen?")) {
                    this.goBackToFormManagement();
                }
            } else {
                this.goBackToFormManagement();
            }
        },
        goBackToFormManagement() {
            console.log("Zurück zur Formularverwaltung");
            window.location.href = "formmanagement.html";
        },
        selectElement(element) {
            console.log("Element ausgewählt:", element);
            this.selectedElement = element;
        },
        removeElement(index) {
            console.log("Element entfernen, Index:", index);
            if (index >= 0 && index < this.formElements.length) {
                this.formElements.splice(index, 1);
                this.isFormSaved = false;
            }
            this.selectedElement = null;
        },
        startDrag(element, event) {
            console.log("Drag gestartet für Element:", element);
            this.draggedElement = { ...element };
            this.draggedIndex = -1;
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', element.id);
        },
        resetDragState() {
            console.log("Drag-Zustand zurücksetzen");
            this.draggedElement = null;
            this.draggedIndex = null;
            this.placeholderIndex = null;
        },
        duplicateElement() {
            if (this.selectedElement) {
                console.log("Element duplizieren:", this.selectedElement);
                const duplicate = JSON.parse(JSON.stringify(this.selectedElement));
                duplicate.id = Date.now();
                const index = this.formElements.indexOf(this.selectedElement);
                this.formElements.splice(index + 1, 0, duplicate);
                this.isFormSaved = false;
            }
        },
        addElementToPreview(element) {
            console.log("Element zur Vorschau hinzufügen:", element);
            const newElement = { ...element, id: Date.now() };
            this.formElements.push(newElement);
            this.isFormSaved = false;
        },
        deleteSelectedElement(event) {
            console.log("Ausgewähltes Element löschen");
            const activeElement = document.activeElement;
            const isInputActive = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'SELECT' || activeElement.tagName === 'TEXTAREA');
            if (!isInputActive && this.selectedElement) {
                const index = this.formElements.indexOf(this.selectedElement);
                if (index > -1) {
                    this.formElements.splice(index, 1);
                    this.isFormSaved = false;
                    this.selectedElement = null;
                }
            }
        },
        async loadFormData() {
            const urlParams = new URLSearchParams(window.location.search);
            this.formId = urlParams.get('formId');

            if (this.formId) {
                try {
                    console.log("Lade Formulardaten für ID:", this.formId);
                    const doc = await db.collection('forms').doc(this.formId).get();
                    if (doc.exists) {
                        const formData = doc.data();
                        console.log("Formulardaten geladen:", formData);
                        this.formName = formData.name;
                        this.formElements = formData.elements || [];
                    }
                } catch (error) {
                    console.error("Fehler beim Laden des Formulars:", error);
                    this.showNotification("Fehler beim Laden des Formulars. Bitte versuchen Sie es erneut.", 'error');
                }
            }
        },
        async checkAdminStatus() {
            try {
                const user = await auth.currentUser;
                if (user) {
                    console.log("Benutzer angemeldet, prüfe Admin-Status");
                    const userDoc = await db.collection('users').doc(user.uid).get();
                    const userData = userDoc.data();
                    if (!userData.isAdmin && !userData.isMainAdmin) {
                        this.showNotification("Sie haben keine Berechtigung, diese Seite zu sehen.", 'error');
                        window.location.href = "home.html";
                    } else {
                        console.log("Admin-Berechtigung bestätigt");
                        this.user = user;
                    }
                } else {
                    auth.onAuthStateChanged(async (user) => {
                        if (user) {
                            console.log("Benutzerstatus geändert, prüfe Admin-Status");
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
                console.error("Fehler bei der Admin-Status-Prüfung:", error);
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
