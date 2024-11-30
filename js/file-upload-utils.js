// file-upload-utils.js - Angepasster Code

export function handleFileUpload(event, elementId) {
    const formElements = window.formElements || [];

    if (!Array.isArray(formElements)) {
        console.error(`Fehler: 'formElements' ist nicht definiert oder kein Array.`, formElements);
        return;
    }

    // Stelle sicher, dass die ID als String verglichen wird
    const element = formElements.find(el => String(el.id) === String(elementId));
    if (!element || !element.specificProperties) {
        console.error(`Fehler: Kein Element mit ID ${elementId} gefunden oder spezifische Eigenschaften fehlen.`);
        return;
    }

    // Initialisiere uploadedFiles, falls nicht vorhanden
    if (!Array.isArray(element.specificProperties.uploadedFiles)) {
        element.specificProperties.uploadedFiles = [];
    }

    const files = event.target.files;

    // Stelle sicher, dass alle erlaubten Dateitypen in Kleinbuchstaben konvertiert sind
    const allowedFileTypes = (element.specificProperties.allowedFileTypes || ['pdf', 'jpg', 'png']).map(type => type.toLowerCase());
    const maxFileSizeMB = parseInt(element.specificProperties.maxFileSize) || 4;

    for (let file of files) {
        const fileExtension = file.name.split('.').pop().toLowerCase();
        const fileSizeMB = file.size / (1024 * 1024);

        // Überprüfe Dateityp
        if (!allowedFileTypes.includes(fileExtension)) {
            console.warn(`Dateityp nicht erlaubt: ${file.name}`);
            continue;
        }

        // Überprüfe Dateigröße
        if (fileSizeMB > maxFileSizeMB) {
            console.warn(`Datei zu groß: ${file.name}`);
            continue;
        }

        // Datei zur Liste hinzufügen
        element.specificProperties.uploadedFiles.push({
            name: file.name,
            size: fileSizeMB.toFixed(2) + ' MB',
            type: file.type,
            lastModified: file.lastModified,
        });
    }

    event.target.value = ''; // Zurücksetzen des Input-Feldes

    // Aktualisiere die Liste der hochgeladenen Dateien, wenn die Funktion existiert
    if (typeof updateFileList === 'function') {
        updateFileList(elementId, formElements);
    } else {
        console.error('updateFileList ist keine gültige Funktion.');
    }
}

export function removeUploadedFile(elementId, index) {
    const formElements = window.formElements || [];

    if (!formElements || !Array.isArray(formElements)) {
        console.error(`Fehler: 'formElements' ist nicht definiert oder kein Array.`, formElements);
        return;
    }

    const element = formElements.find(el => String(el.id) === String(elementId));
    if (!element || !element.specificProperties.uploadedFiles) {
        console.error(`Fehler: Kein Element mit ID ${elementId} oder keine hochgeladenen Dateien gefunden.`);
        return;
    }

    // Prüfen, ob der Index gültig ist
    if (index >= 0 && index < element.specificProperties.uploadedFiles.length) {
        element.specificProperties.uploadedFiles.splice(index, 1); // Datei entfernen

        if (typeof updateFileList === 'function') {
            updateFileList(elementId, formElements); // Aktualisiere die Anzeige der hochgeladenen Dateien
        } else {
            console.error('updateFileList ist keine gültige Funktion.');
        }
    } else {
        console.error(`Fehler: Ungültiger Index ${index} zum Entfernen einer Datei.`);
    }
}

export function updateFileList(elementId, formElements) {
    // Sicherstellen, dass formElements definiert ist, ansonsten eine Warnung ausgeben und beenden
    if (!formElements || !Array.isArray(formElements)) {
        console.error(`Fehler: 'formElements' ist nicht definiert oder kein Array.`, formElements);
        return;
    }

    const element = formElements.find(el => String(el.id) === String(elementId));
    if (!element || !element.specificProperties.uploadedFiles) {
        console.error(`Fehler: Kein Element mit ID ${elementId} oder keine hochgeladenen Dateien gefunden.`);
        return;
    }

    const fileListContainer = document.getElementById(`file-list-${elementId}`);
    if (!fileListContainer) {
        console.warn(`Fehler: Kein Container mit ID file-list-${elementId} gefunden.`);
        return;
    }

    fileListContainer.innerHTML = ''; // Bestehende Einträge löschen

    element.specificProperties.uploadedFiles.forEach((file, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${file.name} (${file.size})`;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Löschen';
        deleteButton.onclick = () => {
            removeUploadedFile(elementId, index); // Datei entfernen
        };

        listItem.appendChild(deleteButton);
        fileListContainer.appendChild(listItem);
    });
}

export function validateUploadedFiles(element) {
    if (!element || !element.specificProperties) {
        console.error(`Fehler: Element oder spezifische Eigenschaften fehlen für die Validierung.`);
        return false;
    }

    const uploadedFiles = element.specificProperties.uploadedFiles || [];
    return uploadedFiles.length > 0; // Gibt `true` zurück, wenn Dateien vorhanden sind
}

export function getUploadedFiles(elementId, formElements) {
    // Sicherstellen, dass formElements definiert ist, ansonsten eine Warnung ausgeben und beenden
    if (!formElements || !Array.isArray(formElements)) {
        console.error(`Fehler: 'formElements' ist nicht definiert oder kein Array.`, formElements);
        return [];
    }

    const element = formElements.find(el => String(el.id) === String(elementId));
    if (!element) {
        console.error(`Fehler: Kein Element mit ID ${elementId} gefunden.`);
        return [];
    }
    return element?.specificProperties?.uploadedFiles || [];
}
