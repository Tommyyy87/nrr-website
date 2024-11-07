// import { ref } from '';
// import Draggable from 'vue-draggable-next';

export default {
    components: { Draggable },
    setup() {
        // Initialisiere die Hauptvariablen und logge sie, um sicherzustellen, dass alles geladen wurde
        const formName = ref('');
        console.log("Initialisiertes formName:", formName);

        const elements = ref([
            { label: 'Bild', type: 'image', icon: 'fas fa-image' },
            { label: 'Dokument anzeigen', type: 'document-view', icon: 'fas fa-file' },
            { label: 'Hyperlink', type: 'hyperlink', icon: 'fas fa-link' },
            { label: 'Text', type: 'text', icon: 'fas fa-font' },
            { label: 'Trennlinie', type: 'divider', icon: 'fas fa-minus' },
            { label: 'Bewertungsskala', type: 'rating-scale', icon: 'fas fa-star' },
            { label: 'Datensatzauswahl', type: 'data-selection', icon: 'fas fa-database' },
            { label: 'Einfachauswahl', type: 'single-selection', icon: 'fas fa-list' },
            { label: 'Kontrollkästchen', type: 'checkbox', icon: 'fas fa-check-square' },
            { label: 'Mehrfachauswahl', type: 'multi-selection', icon: 'fas fa-list-ul' },
            { label: 'Code-Scanner', type: 'code-scanner', icon: 'fas fa-barcode' },
            { label: 'Datum- und Zeitauswahl', type: 'datetime-picker', icon: 'fas fa-calendar-alt' },
            { label: 'Dokument anhängen', type: 'document-upload', icon: 'fas fa-file-upload' },
            { label: 'E-Mail Eingabefeld', type: 'email-field', icon: 'fas fa-envelope' },
            { label: 'Foto aufnehmen', type: 'photo-upload', icon: 'fas fa-camera' },
            { label: 'Positionsbestimmung', type: 'location-picker', icon: 'fas fa-map-marker-alt' },
            { label: 'Skizze', type: 'sketch', icon: 'fas fa-pencil-alt' },
            { label: 'Texteingabefeld', type: 'textarea', icon: 'fas fa-align-left' },
            { label: 'Tonaufnahme', type: 'audio-record', icon: 'fas fa-microphone' },
            { label: 'Unterschrift', type: 'signature', icon: 'fas fa-signature' },
            { label: 'Zahleneingabefeld', type: 'number-field', icon: 'fas fa-hashtag' },
            { label: 'Zeitstempel', type: 'timestamp', icon: 'fas fa-clock' },
            { label: 'Textergebnis', type: 'text-result', icon: 'fas fa-file-alt' },
            { label: 'Zahlenergebnis', type: 'number-result', icon: 'fas fa-calculator' },
            { label: 'Zeitpunktergebnis', type: 'datetime-result', icon: 'fas fa-calendar-check' },
            { label: 'Zeitraumergebnis', type: 'time-period-result', icon: 'fas fa-hourglass-half' },
            { label: 'E-Mail versenden', type: 'email-send', icon: 'fas fa-envelope-open' },
            { label: 'Abschnitt', type: 'section', icon: 'fas fa-th-large' },
            { label: 'Gruppe', type: 'group', icon: 'fas fa-object-group' },
            { label: 'Wiederholungsgruppe', type: 'repeat-group', icon: 'fas fa-redo' }
        ]);
        console.log("Initialisierte Elemente:", elements);

        const formElements = ref([]);
        const selectedElement = ref(null);
        const draggedElement = ref(null);
        const undoStack = ref([]);
        const redoStack = ref([]);

        const cloneElement = (element) => {
            console.log("Element wird geklont:", element);
            return JSON.parse(JSON.stringify(element));
        };

        const onAdd = (event) => {
            console.log("onAdd Event:", event);
            if (draggedElement.value) {
                addElementToForm(draggedElement.value.type, event.newIndex);
                console.log("Element hinzugefügt:", draggedElement.value);
                draggedElement.value = null;
            }
        };

        const addElementToForm = (type, index) => {
            console.log("addElementToForm aufgerufen für Typ:", type, "bei Index:", index);
            const newElement = {
                label: getLabelForType(type),
                type: type,
                properties: getDefaultProperties(type)
            };
            console.log("Neues Element:", newElement);
            if (index !== undefined) {
                formElements.value.splice(index, 0, newElement);
            } else {
                formElements.value.push(newElement);
            }
            console.log("Formularelemente nach Hinzufügen:", formElements.value);
            undoStack.value.push({ action: 'add', element: newElement });
        };

        const getLabelForType = (type) => {
            const element = elements.value.find(el => el.type === type);
            console.log("getLabelForType gefunden:", element);
            return element ? element.label : 'Unbekanntes Element';
        };

        const getDefaultProperties = (type) => {
            console.log("getDefaultProperties aufgerufen für Typ:", type);
            switch (type) {
                case 'image':
                    return { src: '', alt: 'Bildbeschreibung' };
                case 'document-view':
                    return { src: '', description: 'Dokumentbeschreibung' };
                case 'hyperlink':
                    return { url: '', text: 'Link-Text' };
                case 'text':
                    return { content: 'Standardtext' };
                case 'rating-scale':
                    return { scale: 5 };
                case 'data-selection':
                    return { dataset: '' };
                case 'datetime-picker':
                    return { date: '', time: '' };
                case 'email-field':
                    return { email: '' };
                case 'number-field':
                    return { number: 0 };
                case 'textarea':
                    return { placeholder: 'Hier Text eingeben' };
                default:
                    return {};
            }
        };

        const removeElement = (index) => {
            const removedElement = formElements.value.splice(index, 1)[0];
            console.log("Element entfernt:", removedElement);
            undoStack.value.push({ action: 'remove', element: removedElement, index });
        };

        const moveElement = (event) => {
            console.log("moveElement Event:", event);
            undoStack.value.push({ action: 'move', elements: [...formElements.value] });
        };

        const undo = () => {
            const lastAction = undoStack.value.pop();
            console.log("Letzte Aktion im Stack:", lastAction);
            if (lastAction) {
                redoStack.value.push(lastAction);
                if (lastAction.action === 'add') {
                    formElements.value.pop();
                } else if (lastAction.action === 'remove') {
                    formElements.value.splice(lastAction.index, 0, lastAction.element);
                } else if (lastAction.action === 'move') {
                    formElements.value = lastAction.elements;
                }
            }
        };

        const redo = () => {
            const lastUndo = redoStack.value.pop();
            console.log("Letztes Undo im Stack:", lastUndo);
            if (lastUndo) {
                undoStack.value.push(lastUndo);
                if (lastUndo.action === 'add') {
                    formElements.value.push(lastUndo.element);
                } else if (lastUndo.action === 'remove') {
                    formElements.value.splice(lastUndo.index, 1);
                } else if (lastUndo.action === 'move') {
                    formElements.value = lastUndo.elements;
                }
            }
        };

        const selectElement = (element) => {
            console.log("Element ausgewählt:", element);
            selectedElement.value = element;
        };

        const updateElement = () => {
            console.log("updateElement aufgerufen");
        };

        return {
            formName,
            elements,
            formElements,
            selectedElement,
            draggedElement,
            cloneElement,
            onAdd,
            addElementToForm,
            getLabelForType,
            getDefaultProperties,
            removeElement,
            moveElement,
            undo,
            redo,
            selectElement,
            updateElement
        };
    }
};
