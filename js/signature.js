// Nutze die globale Variable "SignaturePad" von der CDN-Bibliothek

export function initializeSignaturePad(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error('Canvas element not found:', canvasId);
        return;
    }

    // Initialisiere SignaturePad von der globalen CDN-Bibliothek
    const signaturePad = new SignaturePad(canvas, {
        penColor: 'black',
    });

    window.signaturePads = window.signaturePads || {};
    window.signaturePads[canvasId] = signaturePad;
}

export function clearSignature(canvasId) {
    if (window.signaturePads && window.signaturePads[canvasId]) {
        window.signaturePads[canvasId].clear();
    } else {
        console.error('SignaturePad instance not found for:', canvasId);
    }
}

export function getSignatureData(canvasId) {
    if (window.signaturePads && window.signaturePads[canvasId] && !window.signaturePads[canvasId].isEmpty()) {
        return window.signaturePads[canvasId].toDataURL(); // Unterschrift als Base64 zurückgeben
    } else {
        console.error('No signature data available or signature pad is empty.');
        return null;
    }
}

export function openSignaturePopup(elementId) {
    // Prüfen, ob bereits ein Popup existiert und ggf. schließen
    closeSignaturePopup();

    // Popup erstellen und anzeigen
    const popupContainer = document.createElement('div');
    popupContainer.classList.add('signature-popup-overlay');
    popupContainer.innerHTML = `
        <div class="signature-popup-content">
            <button class="button close-signature-popup-button" onclick="window.signatureUtils.closeSignaturePopup()">&times;</button>
            <canvas id="popup-signature-pad-${elementId}" class="popup-signature-pad"></canvas>
            <div class="signature-popup-buttons">
                <button class="button save-signature-button" onclick="window.signatureUtils.saveSignature('${elementId}')">Speichern</button>
                <button class="button delete-signature-button" onclick="window.signatureUtils.clearSignature('popup-signature-pad-${elementId}')">Löschen</button>
            </div>
        </div>
    `;
    document.body.appendChild(popupContainer);

    // Signature Pad initialisieren
    initializeSignaturePad(`popup-signature-pad-${elementId}`);
}

export function saveSignature(elementId) {
    const signatureData = getSignatureData(`popup-signature-pad-${elementId}`);
    if (signatureData) {
        const resultContainer = document.getElementById(`signature-result-${elementId}`);
        if (resultContainer) {
            resultContainer.innerHTML = `
                <img src="${signatureData}" alt="Unterschrift" class="saved-signature">
                <button type="button" class="button clear-signature-button" onclick="window.signatureUtils.clearSignatureResult('${elementId}')">Unterschrift löschen</button>
            `;
        }
        closeSignaturePopup();
    }
}

export function clearSignatureResult(elementId) {
    const resultContainer = document.getElementById(`signature-result-${elementId}`);
    if (resultContainer) {
        resultContainer.innerHTML = '';
    }
}

export function closeSignaturePopup() {
    const popupContainer = document.querySelector('.signature-popup-overlay');
    if (popupContainer) {
        // Entferne das Popup nur, wenn es existiert
        popupContainer.parentNode.removeChild(popupContainer);
    } else {
        console.warn('Popup-Container nicht gefunden oder bereits entfernt.'); // Warnung statt Fehler
    }
}

// Globale Signatur-Werkzeuge registrieren
window.signatureUtils = {
    initializeSignaturePad,
    clearSignature,
    getSignatureData,
    openSignaturePopup,
    saveSignature,
    clearSignatureResult,
    closeSignaturePopup,
};
