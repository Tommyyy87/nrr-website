import { createApp } from 'https://cdn.jsdelivr.net/npm/vue@3/dist/vue.esm-browser.js';
import formElements from './form-elements.js';

const App = {
    template: `
    <div class="form-builder-container" @keyup.delete="deleteSelectedElement($event)" tabindex="0">
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


                <div id="form-preview" class="form-preview" @drop="drop($event)" @dragover.prevent="onDragOver">
                    <h2>Vorschau</h2>
                    <div v-for="(item, index) in formElements" :key="item.id" 
                         class="form-element live-preview"
                         @click="selectElement(item)"
                         @dragstart="startReorderDrag(index, $event)"
                         draggable="true"
                         @dragover.prevent="onDragOver($event, index)"
                         @drop="reorderDrop($event, index)"
                         :style="{
                            border: selectedElement?.id === item.id ? '2px solid #007bff' : '1px dashed #ccc',
                            padding: '10px',
                            marginBottom: '10px'
                        }">

                        <!-- Render the live preview of each element based on its type -->
                        <div v-if="item.type === 'text'" 
                             :style="{
                                fontSize: getFontSize(item.specificProperties.textSize),
                                fontWeight: item.specificProperties.format === 'bold' ? 'bold' : 'normal',
                                fontStyle: item.specificProperties.format === 'italic' ? 'italic' : 'normal',
                                color: item.specificProperties.textColor
                             }">
                            {{ renderTextWithPlaceholders(item.specificProperties.content) }}
                        </div>

                        <img v-if="item.type === 'img'" :src="item.specificProperties.uploadImage" 
                            :alt="item.label || 'Bild'"
                            :style="{
                                width: item.specificProperties.width || '100%',
                                height: item.specificProperties.height || 'auto'
                            }" 
                            :class="{
                                'align-left': item.specificProperties.alignment === 'left',
                                'align-center': item.specificProperties.alignment === 'center',
                                'align-right': item.specificProperties.alignment === 'right'
                            }" />

                        <label v-if="item.type === 'label'">{{ item.label }}</label>

                        <button @click="removeElement(index)" class="delete-button">Löschen</button>
                    </div>
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
                            <button @click="removeElement(selectedElement.id)" class="delete-button">
                                <i class="fas fa-trash"></i> Löschen
                            </button>
                        </div>

<!-- Allgemeine Baustein-ID anzeigen -->
                        <div class="property">
                            <label>Baustein ID:</label>
                            <span>{{ selectedElement.id }}</span>
                        </div>


<!-- AB HIER SPEZIFISCHE EIGENSCHAFTEN!! -->

                        <!-- Spezifische Eigenschaften für den Datensatz-Baustein -->
                        <div v-if="selectedElement && selectedElement.type === 'dataset-select'">
                            <div class="property">
                                <label>Datensatzfeld:</label>
                                <select v-model="selectedElement.specificProperties.datasetField">
                                    <option value="firstName">Vorname</option>
                                    <option value="lastName">Nachname</option>
                                    <option value="email">E-Mail</option>
                                </select>
                            </div>

                            <div class="property">
                                <label>Ausrichtung:</label>
                                <select v-model="selectedElement.specificProperties.alignment">
                                    <option value="left">Links</option>
                                    <option value="center">Mitte</option>
                                    <option value="right">Rechts</option>
                                </select>
                            </div>

                            <div class="property">
                                <label>Textgröße:</label>
                                <select v-model="selectedElement.specificProperties.fontSize">
                                    <option value="small">Klein</option>
                                    <option value="medium">Mittel</option>
                                    <option value="large">Groß</option>
                                </select>
                            </div>

                            <div class="property">
                                <label>Schriftart:</label>
                                <select v-model="selectedElement.specificProperties.fontFamily">
                                    <option value="Arial">Arial</option>
                                    <option value="Verdana">Verdana</option>
                                    <option value="Times New Roman">Times New Roman</option>
                                </select>
                            </div>

                            <div class="property">
                                <label>Optionaler Titel:</label>
                                <input type="text" v-model="selectedElement.specificProperties.title" placeholder="Titel eingeben"/>
                            </div>
                        </div>

                        <!-- Bild-Baustein spezifische Eigenschaften -->
                        <div v-if="selectedElement && selectedElement.type === 'img'">
                            <div class="property">
                                <label>Bild-Upload (max. 2MB):</label>
                                <input type="file" @change="handleFileUpload" accept=".jpg, .png, .svg" />
                                <img v-if="selectedElement.specificProperties.uploadImage" 
                                     :src="selectedElement.specificProperties.uploadImage" 
                                     class="uploaded-image-preview" />
                                <div v-if="uploadedImageDimensions">
                                    Größe: {{ uploadedImageDimensions.width }} x {{ uploadedImageDimensions.height }} px
                                </div>
                                <button @click="clearUploadedImage" class="delete-uploaded-image">Bild löschen</button>
                            </div>

                            <!-- Bildtitel und Bildunterschrift -->
                            <div class="property">
                                <label for="title">Bildtitel (optional):</label>
                                <input type="text" v-model="selectedElement.specificProperties.title" id="title" />
                            </div>
                            <div class="property">
                                <label for="caption">Bildunterschrift (optional):</label>
                                <input type="text" v-model="selectedElement.specificProperties.caption" id="caption" />
                            </div>

                            <!-- Ausrichtung -->
                            <div class="property">
                                <label>Ausrichtung:</label>
                                <input type="radio" v-model="selectedElement.specificProperties.alignment" value="left" /> Linksbündig
                                <input type="radio" v-model="selectedElement.specificProperties.alignment" value="center" /> Mittig
                                <input type="radio" v-model="selectedElement.specificProperties.alignment" value="right" /> Rechtsbündig
                            </div>

                            <div class="property-group">
                                <label>Bildgröße:</label>
                                
                                <!-- Breite Slider mit Textfeld -->
                                <div>
                                    <label>Breite (0-999%)</label>
                                    <input type="range" v-model.number="selectedElement.specificProperties.width" min="0" max="999" />
                                    <input type="number" v-model.number="selectedElement.specificProperties.width" min="0" max="999" /> %
                                </div>

                                <!-- Toggle für Proportionen -->
                                <div class="property proportion-checkbox">
                                    <label class="proportion-label">Proportionen beibehalten</label>
                                    <label class="toggle-switch">
                                        <input type="checkbox" v-model="selectedElement.specificProperties.proportionLocked" />
                                        <span class="slider"></span>
                                    </label>
                                </div>

                                <!-- Höhe Slider, nur anzeigen, wenn Proportionen ausgeschaltet sind -->
                                <div v-if="!selectedElement.specificProperties.proportionLocked">
                                    <label>Höhe (0-999%)</label>
                                    <input type="range" v-model.number="selectedElement.specificProperties.height" min="0" max="999" />
                                    <input type="number" v-model.number="selectedElement.specificProperties.height" min="0" max="999" /> %
                                </div>
                            </div>
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
            formElements: [], // Speichert die Formularelemente mit spezifischen Eigenschaften
            selectedElement: null,
            draggedElement: null,
            draggedIndex: null,
            placeholderIndex: null,
            user: null,
            isFormSaved: true,
            notificationMessage: '',
            notificationType: '',
            notificationVisible: false,
            activeTooltipId: null,
            proportionLocked: true,
            uploadedImageDimensions: null,
        };
    },

    methods: {
        toggleTooltip(id) {
            this.activeTooltipId = this.activeTooltipId === id ? null : id;
        },
        saveFormName() {
            this.formName = this.formNameInput;
            this.showNameModal = false;
        },
        cancelFormCreation() {
            this.showNameModal = false;
        },
        editFormName() {
            this.formNameInput = this.formName;
            this.showNameModal = true;
        },
        showNotification(message, type = 'success') {
            this.notificationMessage = message;
            this.notificationType = type;
            this.notificationVisible = true;
            setTimeout(() => {
                this.notificationVisible = false;
            }, 3000);
        },

        getFontSize(size) {
            return size === 'small' ? '12px' : size === 'large' ? '24px' : '16px';
        },

        handleFileUpload(event) {
            const file = event.target.files[0];
            if (file && ['image/jpeg', 'image/png', 'image/svg+xml'].includes(file.type)) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.selectedElement.specificProperties.uploadImage = e.target.result;
                    this.setUploadedDimensions(file);
                };
                reader.readAsDataURL(file);
            } else {
                this.showNotification("Ungültiges Dateiformat. Nur JPG, PNG und SVG sind erlaubt.", 'error');
            }
        },
        clearUploadedImage() {
            this.selectedElement.specificProperties.uploadImage = '';
            this.uploadedImageDimensions = null;
        },
        setUploadedDimensions(file) {
            const img = new Image();
            img.onload = () => {
                this.uploadedImageDimensions = { width: img.width, height: img.height };
            };
            img.src = URL.createObjectURL(file);
        },
        addImageElement() {
            this.formElements.push({
                type: "image",
                label: "Bild",
                specificProperties: {
                    uploadImage: '',
                    maxFileSize: 2,
                    title: '',
                    caption: '',
                    preview: true,
                    allowUrl: false,
                    visible: true,
                    width: '100%', // Standardbreite
                    height: 'auto',
                    proportionLocked: true, // Schalter für Proportionen standardmäßig auf "An"
                    alignment: "left",
                }
            });
        },
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
            window.location.href = "formmanagement.html";
        },
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

        renderTextWithPlaceholders(content) {
            if (!content) return '';
            return content.replace(/{{(.*?)}}/g, (match, p1) => {
                return this.user?.[p1.trim()] || '---';
            });
        },

        removeElement(index) {
            if (index >= 0 && index < this.formElements.length) {
                this.formElements.splice(index, 1);
                this.isFormSaved = false;
            }
            this.selectedElement = null;
        },
        getPropertyLabel(key) {
            const labels = {
                uploadImage: 'Bild hochladen',
                maxFileSize: 'Maximale Dateigröße',
                width: 'Breite',
                height: 'Höhe',
                alignment: 'Ausrichtung',
                title: 'Bildtitel',
                caption: 'Bildunterschrift',
                preview: 'Bildvorschau',
                allowUrl: 'URL erlauben',
                visible: 'Sichtbar'
            };
            return labels[key] || key;
        },
        startDrag(element, event) {
            this.draggedElement = { ...element };
            this.draggedIndex = -1;
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', element.id);
        },
        onDragOver(event) {
            event.preventDefault();
        },
        mounted() {
            this.user = {
                firstName: 'Max',
                lastName: 'Mustermann',
                email: 'max@example.com'
            };
            this.checkAdminStatus();
            this.loadFormData();
            this.$el.focus();
        },

        drop(event) {
            event.preventDefault();
            if (this.draggedElement) {
                this.addElementToPreview(this.draggedElement);
                this.resetDragState();
            }
        },
        resetDragState() {
            this.draggedElement = null;
            this.draggedIndex = null;
            this.placeholderIndex = null;
        },
        duplicateElement() {
            if (this.selectedElement) {
                const duplicate = JSON.parse(JSON.stringify(this.selectedElement)); // Tiefe Kopie erstellen
                duplicate.id = Date.now(); // Eindeutige ID für das Duplikat setzen
                const index = this.formElements.indexOf(this.selectedElement);
                this.formElements.splice(index + 1, 0, duplicate); // Duplikat nach dem Original einfügen
                this.isFormSaved = false;
                this.selectedElement = duplicate; // Optional: das Duplikat als ausgewähltes Element setzen
            }
        },

        // Funktion zur Vorschau der Elemente, spezifische Eigenschaften werden ebenfalls initialisiert
        addElementToPreview(element) {
            const newElement = {
                ...element,
                id: Date.now(),
                specificProperties: {
                    ...element.specificProperties,
                    title: element.specificProperties?.title || "", // Optionaler Titel
                    datasetField: element.specificProperties?.datasetField || "firstName",
                    alignment: element.specificProperties?.alignment || "left",
                    fontSize: element.specificProperties?.fontSize || "medium",
                    fontFamily: element.specificProperties?.fontFamily || "Arial"
                }
            };
            this.formElements.push(newElement);
            this.isFormSaved = false;
        },

        deleteSelectedElement(event) {
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
