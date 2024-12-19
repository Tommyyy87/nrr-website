// submit-elements.js (Finale Version mit Kommentaren zu den Änderungen)

// Diese Datei enthält Hilfsfunktionen für das Konvertieren des Formulars in PDF,
// das Zusammenführen von PDFs, den Upload in eine Cloud und die Fortschrittsanzeige.

// Anpassungen:
// - Funktion getUploadedFilesSubmit in getUploadedFiles umbenannt
// - validateSpecificProperty, updateSpecificProperty entfernt, da nicht im Code vorhanden

export async function convertFormToPDF(formElements) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    formElements.forEach(element => {
        if (element.generalProperties && element.generalProperties.visible) {
            doc.text(element.generalProperties.label || '', 10, 10);
        }
    });
    return doc;
}

export async function convertFilesToPDF(files) {
    // Platzhalter: Hier könnte eine echte Konvertierung stattfinden.
    // Derzeit werden die Dateien nur weitergereicht.
    return files;
}

export async function mergePDFs(pdfs) {
    // Platzhalter: Gibt momentan nur das erste PDF zurück.
    return pdfs[0];
}

export async function uploadToGoogleDrive(pdf, properties) {
    console.log('Upload zu Google Drive mit folgenden Eigenschaften:', properties);
    // Hier könnte der echte Upload-Code integriert werden.
}

export function updateProgressBar(progressBar, percentage) {
    if (progressBar) {
        progressBar.style.width = `${percentage}%`;
    }
}

export function showNotification(message, type) {
    console.log(`${type}: ${message}`);
}

// Umbenennung von getUploadedFilesSubmit zu getUploadedFiles
export function getUploadedFiles(formElements) {
    return formElements
        .filter(element => element.type === 'file-upload')
        .map(uploadElement => uploadElement.specificProperties.uploadedFiles || [])
        .flat();
}

export async function handleSubmitButton(formElements, progressBarId) {
    const progressBar = document.getElementById(progressBarId);
    if (progressBar) progressBar.style.display = 'block';

    try {
        const pdfData = await convertFormToPDF(formElements);
        updateProgressBar(progressBar, 25);

        const uploadedFiles = getUploadedFiles(formElements);
        const pdfFiles = await convertFilesToPDF(uploadedFiles);
        updateProgressBar(progressBar, 50);

        const finalPDF = await mergePDFs([pdfData, ...pdfFiles]);
        updateProgressBar(progressBar, 75);

        const submitElement = formElements.find(el => el.type === 'submit-button');
        if (submitElement) {
            await uploadToGoogleDrive(finalPDF, submitElement.specificProperties);
        }

        updateProgressBar(progressBar, 100);
        showNotification('Formular erfolgreich hochgeladen!', 'success');
    } catch (error) {
        console.error('Fehler beim Hochladen:', error);
        showNotification('Es gab ein Problem beim Hochladen des Formulars.', 'error');
    } finally {
        if (progressBar) progressBar.style.display = 'none';
    }
}
