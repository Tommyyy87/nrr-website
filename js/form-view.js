// form-view.js
import formElements from './form-elements.js';
import {
    convertFormToPDF,
    getUploadedFiles,
    convertFilesToPDF,
    mergePDFs,
    uploadToGoogleDrive,
    updateProgressBar,
    showNotification,
    handleSubmitButton
} from './submit-elements.js';
import * as signatureUtils from './signature.js';
window.signatureUtils = signatureUtils;

document.addEventListener("DOMContentLoaded", function () {
    const app = new Vue({
        el: '#app',
        data: {
            formName: 'Lade Formular...',
            formElements: [],
            userData: {},
            notification: {
                message: '',
                type: '',
                visible: false,
            },
            activePopup: null,
        },
        methods: {
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

                                window.formElements = this.formElements;

                                await this.loadUserData(user.uid);
                                this.bindSignatureButtons();
                                this.initializeCharacterCounters();
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

            initializeCharacterCounters() {
                this.$nextTick(() => {
                    this.formElements.forEach(element => {
                        if (element.type === 'textarea') {
                            const textarea = document.getElementById(`textarea-${element.id}`);
                            if (textarea) {
                                this.updateCharacterCount(textarea);
                            }
                        }
                    });
                });
            },

            updateCharacterCount(textarea) {
                const counterId = textarea.getAttribute('data-counter-id');
                const counter = document.getElementById(counterId);
                const maxLength = parseInt(textarea.getAttribute('maxlength'));

                if (counter) {
                    const length = textarea.value.length;
                    counter.textContent = length;

                    if (maxLength > 0) {
                        if (length >= maxLength) {
                            counter.style.color = '#dc3545';
                        } else if (length >= maxLength * 0.9) {
                            counter.style.color = '#ffc107';
                        } else {
                            counter.style.color = '#666';
                        }
                    }
                }
            },

            handleNumberInput(elementId, action) {
                const input = document.querySelector(`#number-input-${elementId}`);
                if (!input) return;

                const element = this.formElements.find(el => el.id === parseInt(elementId));
                if (!element || !element.specificProperties) return;

                const allowDecimals = element.specificProperties.allowDecimals === true;
                const step = allowDecimals ?
                    (parseFloat(input.step) || 0.1) :
                    1;

                let currentValue = parseFloat(input.value) || 0;
                const min = parseFloat(input.min);
                const max = parseFloat(input.max);

                if (action === 'increment') {
                    currentValue = Math.min(max, currentValue + step);
                } else if (action === 'decrement') {
                    currentValue = Math.max(min, currentValue - step);
                }

                if (!allowDecimals) {
                    currentValue = Math.round(currentValue);
                }

                input.value = currentValue;
                element.userInput = currentValue;

                const event = new Event('change', { bubbles: true });
                input.dispatchEvent(event);
            },

            validateNumberInput(element) {
                if (!element || element.type !== 'number-input') return true;

                const input = document.getElementById(`number-input-${element.id}`);
                if (!input) return true;

                const value = parseFloat(input.value);
                const min = parseFloat(input.min);
                const max = parseFloat(input.max);

                if (element.generalProperties.isRequired && (!input.value || isNaN(value))) {
                    return false;
                }

                if (!isNaN(value)) {
                    if (!isNaN(min) && value < min) return false;
                    if (!isNaN(max) && value > max) return false;
                }

                if (element.specificProperties.allowDecimals === false && !Number.isInteger(value)) {
                    return false;
                }

                return true;
            },

            validateNumberKeyPress(event, allowDecimals) {
                // Erlaube: Backspace, Delete, ArrowKeys, Tab
                if (event.key === 'Backspace' ||
                    event.key === 'Delete' ||
                    event.key === 'Tab' ||
                    event.key === 'ArrowLeft' ||
                    event.key === 'ArrowRight' ||
                    event.key === 'ArrowUp' ||
                    event.key === 'ArrowDown') {
                    return true;
                }

                // Erlaube: Strg+A, Strg+C, Strg+V, Strg+X
                if (event.ctrlKey && ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase())) {
                    return true;
                }

                // Erlaube: Minus-Zeichen am Anfang für negative Zahlen
                if (event.key === '-' && event.target.selectionStart === 0 && !event.target.value.includes('-')) {
                    return true;
                }

                // Erlaube Dezimalpunkt nur wenn Dezimalzahlen erlaubt sind
                if ((event.key === '.' || event.key === ',') && allowDecimals && !event.target.value.includes('.')) {
                    return true;
                }

                // Erlaube nur Zahlen
                return !isNaN(Number(event.key));
            },

            validateNumberPaste(event, allowDecimals) {
                event.preventDefault();
                let pastedText = (event.clipboardData || window.clipboardData).getData('text');
                let regex = allowDecimals ? /[^0-9.-]/g : /[^0-9-]/g;
                pastedText = pastedText.replace(regex, '');

                if (allowDecimals) {
                    const parts = pastedText.split('.');
                    if (parts.length > 2) {
                        pastedText = parts[0] + '.' + parts.slice(1).join('');
                    }
                }

                if (pastedText.includes('-')) {
                    pastedText = pastedText.replace(/-/g, '');
                    if (pastedText.length > 0) {
                        pastedText = '-' + pastedText;
                    }
                }

                if (pastedText) {
                    const start = event.target.selectionStart;
                    const end = event.target.selectionEnd;
                    const value = event.target.value;
                    const newValue = value.substring(0, start) + pastedText + value.substring(end);
                    event.target.value = newValue;
                    event.target.setSelectionRange(start + pastedText.length, start + pastedText.length);
                    event.target.dispatchEvent(new Event('input'));
                }

                return false;
            },

            handleNumberInputChange(input, elementId) {
                const element = this.formElements.find(el => el.id === parseInt(elementId));
                if (!element || !element.specificProperties) return;

                const allowDecimals = element.specificProperties.allowDecimals === true;

                let value = input.value;
                value = value.replace(/[^\d.-]/g, '');

                if (value.includes('-')) {
                    value = value.replace(/-/g, '');
                    if (value.length > 0) {
                        value = '-' + value;
                    }
                }

                if (!allowDecimals) {
                    value = value.replace(/\./g, '');
                    if (value) {
                        value = Math.round(parseFloat(value));
                    }
                } else {
                    const parts = value.split('.');
                    if (parts.length > 1) {
                        const decimalPlaces = element.specificProperties.decimalPlaces || 2;
                        value = parts[0] + '.' + parts[1].substring(0, decimalPlaces);
                    }
                }

                input.value = value;
                element.userInput = value;
            },

            validateDropdown(element) {
                if (!element || element.type !== 'dropdown') return true;

                const select = document.getElementById(`dropdown-${element.id}`);
                if (!select) return true;

                if (element.generalProperties.isRequired) {
                    // Prüfen ob ein Wert ausgewählt wurde
                    if (!select.value) return false;

                    // Bei Mehrfachauswahl
                    if (element.specificProperties.multiple) {
                        const selectedOptions = Array.from(select.selectedOptions);
                        if (selectedOptions.length < element.specificProperties.minLength) return false;
                        if (element.specificProperties.maxSelections > 0 &&
                            selectedOptions.length > element.specificProperties.maxSelections) return false;
                    }
                }

                // Benutzerdefinierte Validierung ausführen, falls vorhanden
                if (element.specificProperties.customValidation) {
                    try {
                        const validationFn = new Function('value', element.specificProperties.customValidation);
                        return validationFn(select.value);
                    } catch (error) {
                        console.error('Fehler in der benutzerdefinierten Validierung:', error);
                        return false;
                    }
                }

                return true;
            },

            validateRequiredFields(formElements) {
                const errors = [];
                formElements.forEach(element => {
                    if (element.generalProperties.isRequired && element.generalProperties.visible) {
                        if (element.type === 'textarea') {
                            if (!this.validateTextarea(element)) {
                                errors.push(`Das Feld "${element.generalProperties.label}" muss ausgefüllt werden.`);
                                element.hasError = true;
                            } else {
                                element.hasError = false;
                            }
                        } else if (element.type === 'number-input') {
                            if (!this.validateNumberInput(element)) {
                                errors.push(`Das Feld "${element.generalProperties.label}" ist ungültig oder muss ausgefüllt werden.`);
                                element.hasError = true;
                            } else {
                                element.hasError = false;
                            }
                        } else if (element.type === 'checkbox-group') {
                            if (!this.validateCheckboxGroup(element)) {
                                const minSelected = element.specificProperties.minSelected || 1;
                                const maxSelected = element.specificProperties.maxSelected;
                                let errorMessage = `Bitte wählen Sie `;

                                if (maxSelected) {
                                    errorMessage += `zwischen ${minSelected} und ${maxSelected} Optionen`;
                                } else if (minSelected > 1) {
                                    errorMessage += `mindestens ${minSelected} Optionen`;
                                } else {
                                    errorMessage += `mindestens eine Option`;
                                }

                                errorMessage += ` in "${element.generalProperties.label}" aus.`;
                                errors.push(errorMessage);
                                element.hasError = true;
                            } else {
                                element.hasError = false;
                            }
                        } else if (element.type === 'dropdown') {
                            if (!this.validateDropdown(element)) {
                                errors.push(`Bitte treffen Sie eine Auswahl in "${element.generalProperties.label}".`);
                                element.hasError = true;
                            } else {
                                element.hasError = false;
                            }
                        } else {
                            // ... Rest der bestehenden Validierungslogik ...
                        }
                    }
                });
                return errors;
            },

            // Checkbox

            // Fügen Sie diese Methode zu den methods in der Vue-Anwendung hinzu
            validateCheckboxGroup(element) {
                if (!element || element.type !== 'checkbox-group') return true;

                // Finde alle Checkboxen für diese Gruppe
                const checkboxes = document.querySelectorAll(`input[name="checkbox_${element.id}[]"]`);
                const selectedCount = Array.from(checkboxes).filter(cb => cb.checked).length;

                // Wenn es ein Pflichtfeld ist, muss mindestens eine Option ausgewählt sein
                if (element.generalProperties.isRequired && selectedCount === 0) {
                    return false;
                }

                // Überprüfe minimale Auswahl
                const minSelected = element.specificProperties.minSelected || 0;
                if (minSelected > 0 && selectedCount < minSelected) {
                    return false;
                }

                // Überprüfe maximale Auswahl
                const maxSelected = element.specificProperties.maxSelected;
                if (maxSelected && selectedCount > maxSelected) {
                    return false;
                }

                return true;
            },

            validateTextarea(element) {
                if (!element || element.type !== 'textarea') return true;

                const textarea = document.getElementById(`textarea-${element.id}`);
                if (!textarea) return true;

                if (element.generalProperties.isRequired && (!textarea.value || textarea.value.trim() === '')) {
                    return false;
                }

                if (element.specificProperties.minLength > 0 &&
                    textarea.value.length < element.specificProperties.minLength) {
                    return false;
                }

                if (element.specificProperties.maxLength > 0 &&
                    textarea.value.length > element.specificProperties.maxLength) {
                    return false;
                }

                return true;
            },

            resetTextarea(element) {
                if (!element || element.type !== 'textarea') return;

                const textarea = document.getElementById(`textarea-${element.id}`);
                if (textarea) {
                    textarea.value = '';
                    this.updateCharacterCount(textarea);
                    element.specificProperties.defaultValue = '';
                    element.specificProperties.currentLength = 0;
                }
            },

            validateRequiredFields(formElements) {
                const errors = [];
                formElements.forEach(element => {
                    if (element.generalProperties.isRequired && element.generalProperties.visible) {
                        if (element.type === 'textarea') {
                            if (!this.validateTextarea(element)) {
                                errors.push(`Das Feld "${element.generalProperties.label}" muss ausgefüllt werden.`);
                                element.hasError = true;
                            } else {
                                element.hasError = false;
                            }
                        } else if (element.type === 'number-input') {
                            if (!this.validateNumberInput(element)) {
                                errors.push(`Das Feld "${element.generalProperties.label}" ist ungültig oder muss ausgefüllt werden.`);
                                element.hasError = true;
                            } else {
                                element.hasError = false;
                            }
                        } else {
                            const value = element.userInput || '';
                            if (!value.trim() && element.type !== 'file-upload') {
                                errors.push(`Das Feld "${element.generalProperties.label}" muss ausgefüllt werden.`);
                                element.hasError = true;
                            } else if (
                                element.type === 'file-upload' &&
                                (!element.specificProperties?.uploadedFiles || element.specificProperties.uploadedFiles.length === 0)
                            ) {
                                errors.push(`Mindestens eine Datei muss für "${element.generalProperties.label}" hochgeladen werden.`);
                                element.hasError = true;
                            } else {
                                element.hasError = false;
                            }
                        }
                    }
                });
                return errors;
            },

            async handleSubmit() {
                const errors = this.validateRequiredFields(this.formElements);
                if (errors.length > 0) {
                    this.notification.message = errors.join('\n');
                    this.notification.type = 'error';
                    this.notification.visible = true;
                    setTimeout(() => (this.notification.visible = false), 5000);
                    return false;
                }

                const sendButtonElement = this.formElements.find(el => el.type === 'submit-button' && el.generalProperties.id === 'senden_1');
                if (sendButtonElement) {
                    await handleSubmitButton(this.formElements, `progress-${sendButtonElement.generalProperties.id}`);
                }
                return true;
            },

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

            bindSignatureButtons() {
                this.formElements.forEach(element => {
                    if (element.type === 'signature') {
                        const buttonId = `popup-button-${element.id}`;
                        const buttonElement = document.getElementById(buttonId);
                        if (buttonElement) {
                            buttonElement.addEventListener('click', () => {
                                this.openSignaturePopup(element.id);
                            });
                        }
                    }
                });
            },

            openSignaturePopup(elementId) {
                window.signatureUtils.openSignaturePopup(elementId);
            },

            saveSignature(elementId) {
                window.signatureUtils.saveSignature(elementId);
            },

            clearSignatureResult(elementId) {
                window.signatureUtils.clearSignatureResult(elementId);
            },

            clearSignature(canvasId) {
                window.signatureUtils.clearSignature(canvasId);
            },

            closeSignaturePopup() {
                window.signatureUtils.closeSignaturePopup();
            },

            renderElement(element) {
                const definition = formElements.find(el => el.type === element.type);
                if (!definition) {
                    console.error(`Unbekannter Typ: ${element.type}`);
                    return `<div>Unbekannter Typ: ${element.type}</div>`;
                }

                if (typeof definition.render === 'function') {
                    try {
                        const renderedHtml = definition.render(element, this.userData || {});
                        return renderedHtml;
                    } catch (error) {
                        console.error(`Fehler beim Rendern von ${definition.label}:`, error);
                        return `<div>Fehler beim Rendern von ${definition.label}</div>`;
                    }
                }

                console.warn(`Kein Renderer definiert für: ${definition.label}`);
                return `<div>Kein Renderer für ${definition.label} definiert</div>`;
            },

            handleFileInput(event, elementId) {
                if (window.formElements && Array.isArray(window.formElements)) {
                    handleFileUpload(event, elementId, window.formElements);
                } else {
                    console.error("Fehler: formElements ist nicht definiert oder kein Array.", window.formElements);
                }
            },

            showNotification(message, type) {
                this.notification.message = message;
                this.notification.type = type;
                this.notification.visible = true;
                setTimeout(() => {
                    this.notification.visible = false;
                }, 3000);
            }
        },
        mounted() {
            this.loadForm();
            window.updateCharacterCount = (textarea) => {
                this.updateCharacterCount(textarea);
            };
        },
        created() {
            window.app = this;
        }

    });
});