export function handleFileUpload(event, elementId, formElements) {
    const element = formElements.find(el => el.id === parseInt(elementId));
    if (!element || !element.specificProperties.uploadedFiles) return;

    const files = event.target.files;
    const allowedFileTypes = element.specificProperties.allowedFileTypes || ['PDF', 'JPG', 'PNG'];
    const maxFileSizeMB = parseInt(element.specificProperties.maxFileSize) || 4;

    for (let file of files) {
        const fileExtension = file.name.split('.').pop().toLowerCase();
        const fileSizeMB = file.size / (1024 * 1024);

        if (!allowedFileTypes.includes(fileExtension)) {
            console.warn(`Dateityp nicht erlaubt: ${file.name}`);
            continue;
        }

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
            fileObject: file,
        });
    }

    event.target.value = ''; // Zurücksetzen des Input-Feldes
    updateFileList(elementId, formElements); // Liste aktualisieren
}

export function removeUploadedFile(elementId, index, formElements) {
    const element = formElements.find(el => el.id === parseInt(elementId));
    if (element && element.specificProperties.uploadedFiles) {
        element.specificProperties.uploadedFiles.splice(index, 1); // Datei entfernen
        updateFileList(elementId, formElements); // Aktualisiere die Anzeige
    }
}

export function updateFileList(elementId, formElements) {
    const element = formElements.find(el => el.id === parseInt(elementId));
    if (!element || !element.specificProperties.uploadedFiles) return;

    const fileListContainer = document.getElementById(`file-list-${elementId}`);
    if (!fileListContainer) return;

    fileListContainer.innerHTML = ''; // Bestehende Einträge löschen

    element.specificProperties.uploadedFiles.forEach((file, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${file.name} (${file.size})`;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Löschen';
        deleteButton.onclick = () => {
            removeUploadedFile(elementId, index, formElements); // Verwende die neue Funktion
        };

        listItem.appendChild(deleteButton);
        fileListContainer.appendChild(listItem);
    });
}

export function validateUploadedFiles(element) {
    const uploadedFiles = element.specificProperties.uploadedFiles || [];
    return uploadedFiles.length > 0; // Gibt `true` zurück, wenn Dateien vorhanden sind
}

export function getUploadedFiles(elementId, formElements) {
    const element = formElements.find(el => el.id === parseInt(elementId));
    return element?.specificProperties?.uploadedFiles || [];
}

