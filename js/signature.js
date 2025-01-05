// signature.js
export function initializeSignaturePad(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error('Canvas element not found:', canvasId);
        return;
    }

    function resizeCanvas() {
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        canvas.getContext('2d').scale(ratio, ratio);
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

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
        return window.signaturePads[canvasId].toDataURL();
    } else {
        console.error('No signature data available or signature pad is empty.');
        return null;
    }
}

// Füge Event-Handler für den Button hinzu
document.addEventListener('DOMContentLoaded', function () {
    const buttons = document.querySelectorAll('.signature-popup-button');
    buttons.forEach(button => {
        button.addEventListener('click', function () {
            const elementId = this.id.replace('popup-button-', '');
            openSignaturePopup(elementId);
        });
    });
});

export function openSignaturePopup(elementId) {
    closeSignaturePopup();

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

    initializeSignaturePad(`popup-signature-pad-${elementId}`);
}

export function saveSignature(elementId) {
    const signatureData = getSignatureData(`popup-signature-pad-${elementId}`);
    if (signatureData) {
        const resultContainer = document.getElementById(`signature-result-${elementId}`);
        if (resultContainer) {
            resultContainer.innerHTML = `
                <img src="${signatureData}" alt="Unterschrift" class="saved-signature">
                <button type="button" class="button clear-signature-button" onclick="window.signatureUtils.clearSignatureResult('${elementId}')">
                    Unterschrift löschen
                </button>
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
        popupContainer.parentNode.removeChild(popupContainer);
    }
    window.signaturePads = {};
}