// form-builder.js (Finale Version mit Kommentaren zu den Änderungen)

// Importiere Vue und andere benötigte Module
import { createApp } from 'https://cdn.jsdelivr.net/npm/vue@3/dist/vue.esm-browser.js';
import formElements from './form-elements.js';
import { handleFileUpload, removeUploadedFile, getUploadedFiles, validateUploadedFiles } from './file-upload-utils.js';

// Aus submit-elements.js werden nun nur noch die existierenden Funktionen importiert
// validateSpecificProperty und updateSpecificProperty wurden entfernt, da sie nicht existieren
import {
    convertFormToPDF, convertFilesToPDF, mergePDFs,
    uploadToGoogleDrive, updateProgressBar, showNotification,
    getUploadedFiles as getUploadedFilesSubmit
} from './submit-elements.js';

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
                userData: {},
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
                isGeneralVisible: true,
                isSpecificVisible: true,
            };

        },
        methods: {
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
                this.saveToHistory();
            },
            showNotification(message, type = 'success') {
                this.notificationMessage = message;
                this.notificationType = type;
                this.notificationVisible = true;
                setTimeout(() => {
                    this.notificationVisible = false;
                }, 3000);
            },

            // Aktualisierte updateSpecificProperty Methode
            updateSpecificProperty(key, value) {
                if (this.selectedElement && this.selectedElement.specificProperties) {
                    // Spezielle Behandlung für number-input Eigenschaften
                    if (this.selectedElement.type === 'number-input' && key === 'allowDecimals') {
                        this.updateNumberInputSettings(key, value);
                        return;
                    }

                    // Normale Eigenschaftsaktualisierung
                    if (key.includes('.')) {
                        const [parent, child] = key.split('.');
                        this.selectedElement.specificProperties[parent][child] = value;
                    } else {
                        this.selectedElement.specificProperties[key] = value;
                    }

                    this.$forceUpdate();
                    this.saveToHistory();
                    this.isFormSaved = false;
                }
            },
            insertVariable(variableKey) {
                const currentText = this.selectedElement.specificProperties.content || '';
                this.selectedElement.specificProperties.content = `${currentText} ((${variableKey}))`;
            },

            // Handler für die Steuerungsbuttons des Zahleneingabefelds
            handleNumberInput(elementId, action) {
                const input = document.querySelector(`#number-input-${elementId}`);
                if (!input) return;

                const step = parseFloat(input.step) || 1;
                let currentValue = parseFloat(input.value) || 0;
                const min = parseFloat(input.min);
                const max = parseFloat(input.max);

                if (action === 'increment') {
                    currentValue = Math.min(max, currentValue + step);
                } else if (action === 'decrement') {
                    currentValue = Math.max(min, currentValue - step);
                }

                input.value = currentValue;
                const event = new Event('change', { bubbles: true });
                input.dispatchEvent(event);
            },

            toggleSection(section) {
                if (section === 'general') {
                    this.isGeneralVisible = !this.isGeneralVisible;
                } else if (section === 'specific') {
                    this.isSpecificVisible = !this.isSpecificVisible;
                }
            },

            addOption() {
                if (this.selectedElement && this.selectedElement.specificProperties) {
                    const newIndex = this.selectedElement.specificProperties.options.length + 1;
                    const newLabel = `Option ${newIndex}`;

                    // Automatische Generierung einer eindeutigen ID als Wert
                    const newValue = `opt_${this.selectedElement.id}_${Date.now()}_${newIndex}`;

                    this.selectedElement.specificProperties.options.push(newLabel);
                    this.selectedElement.specificProperties.optionLabels.push(newLabel);
                    this.selectedElement.specificProperties.optionValues.push(newValue);

                    this.updateSpecificProperty('options', this.selectedElement.specificProperties.options);
                    this.saveToHistory();
                }
            },

            updateRadioOption(index, newLabel) {
                if (this.selectedElement && this.selectedElement.specificProperties) {
                    this.selectedElement.specificProperties.options[index] = newLabel;
                    this.selectedElement.specificProperties.optionLabels[index] = newLabel;
                    // Wert bleibt unverändert, da er nur intern verwendet wird
                    this.updateSpecificProperty('options', this.selectedElement.specificProperties.options);
                    this.saveToHistory();
                }
            },

            removeOption(index) {
                if (this.selectedElement && this.selectedElement.specificProperties) {
                    this.selectedElement.specificProperties.options.splice(index, 1);
                    this.selectedElement.specificProperties.optionLabels.splice(index, 1);
                    this.selectedElement.specificProperties.optionValues.splice(index, 1);

                    // Wenn die gelöschte Option die Standardauswahl war, setzen wir eine neue
                    if (this.selectedElement.specificProperties.defaultSelected === this.selectedElement.specificProperties.options[index]) {
                        this.selectedElement.specificProperties.defaultSelected = this.selectedElement.specificProperties.options[0] || '';
                    }

                    this.updateSpecificProperty('options', this.selectedElement.specificProperties.options);
                    this.saveToHistory();
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
                    this.selectedElement.specificProperties.allowedFileTypes = allowedFileTypes.filter(
                        (type) => type !== fileType
                    );
                } else {
                    this.selectedElement.specificProperties.allowedFileTypes.push(fileType);
                }

                this.updateSpecificProperty('allowedFileTypes', this.selectedElement.specificProperties.allowedFileTypes);
            },

            selectElement(element) {
                if (!element.generalProperties) {
                    console.warn(`Allgemeine Eigenschaften fehlen für Element mit ID ${element.id}.`);
                }

                if (!element.specificProperties) {
                    console.warn(`Spezifische Eigenschaften fehlen für Element mit ID ${element.id}.`);
                }
                this.selectedElement = element;
                console.log("Allgemeine Sichtbarkeit:", this.selectedElement.generalProperties.visible);
                console.log("Spezifische Sichtbarkeit:", this.selectedElement.specificProperties.visible);
            },

            addElementToPreview(element) {
                const newElement = {
                    ...element,
                    id: Date.now(),
                    generalProperties: { ...element.generalProperties },
                    specificProperties: {
                        ...element.specificProperties,
                        uploadedFiles: element.specificProperties?.uploadedFiles || []
                    },
                    render: element.render,
                };
                this.formElements.push(newElement);
                this.saveToHistory();
                this.isFormSaved = false;
            },

            startDrag(element, event) {
                this.draggedElement = { ...element };
                event.dataTransfer.effectAllowed = 'copy';
                event.dataTransfer.setData('application/json', JSON.stringify({ type: 'new', id: element.id }));
            },
            startReorderDrag(index, event) {
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('application/json', JSON.stringify({ type: 'existing', index }));
                this.draggedIndex = index;
            },
            resetDragState() {
                this.draggedElement = null;
                this.dragOverIndex = null;
                this.draggedIndex = null;
            },
            onDragOver(event, index) {
                event.preventDefault();
                if (this.dragOverIndex !== index) {
                    this.dragOverIndex = index;
                }
            },
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

            onDrop(event, index) {
                event.preventDefault();
                const data = JSON.parse(event.dataTransfer.getData('application/json'));
                if (data.type === 'existing') {
                    const draggedIndex = data.index;
                    if (draggedIndex !== index) {
                        const [element] = this.formElements.splice(draggedIndex, 1);
                        if (draggedIndex < index) {
                            index--;
                        }
                        this.formElements.splice(index, 0, element);
                    }
                } else if (data.type === 'new') {
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
                this.saveToHistory();
            },
            onDragOverPreview(event) {
                event.preventDefault();
                if (this.dragOverIndex !== this.formElements.length) {
                    this.dragOverIndex = this.formElements.length;
                }
            },
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
            onDropPreview(event) {
                event.preventDefault();
                this.onDrop(event, this.formElements.length);
            },

            handleKeyUp(event) {
                const activeElement = document.activeElement;
                const isInputActive = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'SELECT' || activeElement.tagName === 'TEXTAREA');
                if (isInputActive) {
                    return;
                }
                if (this.selectedElement) {
                    const index = this.formElements.indexOf(this.selectedElement);
                    if (event.key === '-' || event.key === 'ArrowUp') {
                        if (index > 0) {
                            this.moveElementUp(index);
                            this.selectedElement = this.formElements[index - 1];
                        }
                    } else if (event.key === '+' || event.key === 'ArrowDown') {
                        if (index < this.formElements.length - 1) {
                            this.moveElementDown(index);
                            this.selectedElement = this.formElements[index + 1];
                        }
                    } else if (event.key === 'Delete') {
                        this.deleteSelectedElement();
                    }
                }
            },
            moveElementUp(index) {
                if (index > 0) {
                    const temp = this.formElements[index];
                    this.formElements.splice(index, 1);
                    this.formElements.splice(index - 1, 0, temp);
                    this.isFormSaved = false;
                    this.saveToHistory();
                }
            },
            moveElementDown(index) {
                if (index < this.formElements.length - 1) {
                    const temp = this.formElements[index];
                    this.formElements.splice(index, 1);
                    this.formElements.splice(index + 1, 0, temp);
                    this.isFormSaved = false;
                    this.saveToHistory();
                }
            },
            duplicateElement() {
                if (this.selectedElement) {
                    const duplicate = JSON.parse(JSON.stringify(this.selectedElement));
                    duplicate.id = Date.now();
                    const index = this.formElements.indexOf(this.selectedElement);
                    this.formElements.splice(index + 1, 0, duplicate);
                    this.isFormSaved = false;
                    this.selectedElement = duplicate;
                    this.saveToHistory();
                }
            },
            deleteSelectedElementFromProperties() {
                if (this.selectedElement) {
                    const index = this.formElements.indexOf(this.selectedElement);
                    if (index > -1) {
                        this.formElements.splice(index, 1);
                        this.isFormSaved = false;
                        this.saveToHistory();
                    }
                    this.selectedElement = null;
                }
            },
            deleteSelectedElement(event) {
                const activeElement = document.activeElement;
                const isInputActive = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'SELECT' || activeElement.tagName === 'TEXTAREA');
                if (!isInputActive && this.selectedElement) {
                    const index = this.formElements.indexOf(this.selectedElement);
                    if (index > -1) {
                        this.formElements.splice(index, 1);
                        this.isFormSaved = false;
                        this.saveToHistory();
                        this.selectedElement = null;
                    }
                }
            },
            saveToHistory() {
                if (this.historyIndex < this.history.length - 1) {
                    this.history = this.history.slice(0, this.historyIndex + 1);
                }
                this.history.push(JSON.parse(JSON.stringify(this.formElements)));
                this.historyIndex++;
            },
            undo() {
                if (this.historyIndex > 0) {
                    this.historyIndex--;
                    this.formElements = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
                }
            },
            redo() {
                if (this.historyIndex < this.history.length - 1) {
                    this.historyIndex++;
                    this.formElements = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
                }
            },

            async createNewForm() {
                try {
                    const docRef = await db.collection('forms').add({});
                    this.formId = docRef.id;
                    console.log(`Neue FormId erstellt: ${this.formId}`);
                    await this.saveForm();
                    console.log("Formular sofort nach Erstellung gespeichert.");
                } catch (error) {
                    console.error("Fehler beim Erstellen eines neuen Formulars:", error);
                    this.showNotification("Fehler beim Erstellen eines neuen Formulars.", 'error');
                }
            },

            async saveForm() {
                if (!this.formName || this.formName === 'Neues Formular') {
                    this.showNameModal = true;
                    return;
                }

                try {
                    const cleanElements = this.formElements.map((element) => {
                        const { render, ...rest } = element;
                        return JSON.parse(JSON.stringify(rest));
                    });

                    const formData = {
                        name: this.formName,
                        elements: cleanElements,
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
                    console.error("Fehler beim Speichern des Formulars:", error);
                    this.showNotification("Fehler beim Speichern des Formulars.", "error");
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
            async loadFormData() {
                const urlParams = new URLSearchParams(window.location.search);
                this.formId = urlParams.get('formId');
                if (this.formId) {
                    try {
                        const doc = await db.collection('forms').doc(this.formId).get();
                        if (doc.exists) {
                            const formData = doc.data();
                            this.formName = formData.name;
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
                    await this.createNewForm();
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

        computed: {
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
                    document.body.appendChild(tooltip);
                }

                icon.addEventListener('mouseover', (event) => {
                    const { top, left, width, height } = icon.getBoundingClientRect();
                    const tooltipWidth = tooltip.offsetWidth;
                    const tooltipHeight = tooltip.offsetHeight;

                    const scrollY = window.scrollY || document.documentElement.scrollTop;
                    const scrollX = window.scrollX || document.documentElement.scrollLeft;

                    tooltip.style.position = 'absolute';
                    tooltip.style.top = `${top + scrollY - tooltipHeight - 10}px`;
                    tooltip.style.left = `${left + scrollX + width / 2 - tooltipWidth / 2}px`;
                    tooltip.style.display = 'block';
                    tooltip.style.opacity = '1';
                    tooltip.style.zIndex = '9999';

                    const viewportWidth = window.innerWidth;
                    const viewportHeight = window.innerHeight;

                    if (top - tooltipHeight < 0) {
                        tooltip.style.top = `${top + scrollY + height + 10}px`;
                    }

                    if (left + tooltipWidth > viewportWidth) {
                        tooltip.style.left = `${viewportWidth - tooltipWidth - 10}px`;
                    }

                    if (left < 0) {
                        tooltip.style.left = `10px`;
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

    createApp(App).mount('#app');
})();
