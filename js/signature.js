// signature.js

export function initializeSignaturePad(canvasId, clearButtonId, specificProperties) {
    const canvas = document.getElementById(canvasId);
    const clearButton = document.getElementById(clearButtonId);

    if (!canvas) {
        console.error(`Canvas mit der ID ${canvasId} wurde nicht gefunden.`);
        return;
    }

    const ctx = canvas.getContext('2d');
    let drawing = false;

    // Maus-Events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseleave', stopDrawing); // Beendet Zeichnen, wenn die Maus den Canvas verlässt

    // Touch-Events für mobile Geräte
    canvas.addEventListener('touchstart', startDrawing, { passive: true });
    canvas.addEventListener('touchend', stopDrawing, { passive: true });
    canvas.addEventListener('touchmove', draw, { passive: true });

    clearButton.addEventListener('click', clearCanvas);

    function startDrawing(event) {
        drawing = true;
        ctx.beginPath();
        const { offsetX, offsetY } = getOffset(event);
        ctx.moveTo(offsetX, offsetY);
    }

    function stopDrawing() {
        drawing = false;
    }

    function draw(event) {
        if (!drawing) return;

        const { offsetX, offsetY } = getOffset(event);
        ctx.lineWidth = parseInt(specificProperties.penSize) || 2;
        ctx.strokeStyle = specificProperties.penColor || '#000000';
        ctx.lineCap = 'round';
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();
    }

    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function getOffset(event) {
        if (event.touches && event.touches.length > 0) {
            const rect = canvas.getBoundingClientRect();
            return {
                offsetX: event.touches[0].clientX - rect.left,
                offsetY: event.touches[0].clientY - rect.top,
            };
        }
        return {
            offsetX: event.offsetX,
            offsetY: event.offsetY,
        };
    }
}
