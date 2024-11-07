// Elemente und Dropzone abrufen
const formWorkspace = document.getElementById('form-workspace');
const formElements = document.querySelectorAll('.element');

// Variablen für das Drag-and-Drop
let draggedElementType = null;

// Event, wenn das Ziehen beginnt
formElements.forEach(element => {
    element.addEventListener('dragstart', (e) => {
        draggedElementType = e.target.getAttribute('data-type'); // Typ des Elements speichern
    });
});

// Event, um das Ablegen zu erlauben (Standardverhalten verhindert es normalerweise)
formWorkspace.addEventListener('dragover', (e) => {
    e.preventDefault(); // Standardverhalten verhindern, damit das Ablegen möglich ist
});

// Event, wenn das Element im Arbeitsbereich abgelegt wird
formWorkspace.addEventListener('drop', (e) => {
    e.preventDefault(); // Standardverhalten verhindern

    // Erstelle ein neues Element basierend auf dem Typ
    let newElement = null;
    switch (draggedElementType) {
        case 'text':
            newElement = createTextField();
            break;
        case 'textarea':
            newElement = createTextArea();
            break;
        case 'checkbox':
            newElement = createCheckbox();
            break;
        case 'dropdown':
            newElement = createDropdown();
            break;
        case 'date':
            newElement = createDateField();
            break;
        case 'signature':
            newElement = createSignatureField();
            break;
        case 'file-upload':
            newElement = createFileUploadField();
            break;
        case 'radiobutton':
            newElement = createRadioButton();
            break;
        case 'multiple-dropdown':
            newElement = createMultipleDropdown();
            break;
        case 'section-divider':
            newElement = createSectionDivider();
            break;
        case 'slider':
            newElement = createSlider();
            break;
        case 'color-picker':
            newElement = createColorPicker();
            break;
        case 'email':
            newElement = createEmailField();
            break;
        case 'phone':
            newElement = createPhoneField();
            break;
        case 'textarea-large':
            newElement = createLargeTextArea();
            break;
        case 'checkbox-terms':
            newElement = createTermsCheckbox();
            break;
        case 'submit-button':
            newElement = createSubmitButton();
            break;
        case 'custom-button':
            newElement = createCustomButton();
            break;
        case 'captcha':
            newElement = createCaptchaField();
            break;
        case 'google-maps':
            newElement = createGoogleMapsField();
            break;
        case 'drag-drop-upload':
            newElement = createDragDropFileUpload();
            break;
        case 'progressive-form':
            newElement = createProgressiveForm();
            break;
        case 'conditional-form':
            newElement = createConditionalForm();
            break;
        case 'payment-field':
            newElement = createPaymentField();
            break;
        default:
            break;
    }

    // Das neu erstellte Element in den Arbeitsbereich hinzufügen
    if (newElement) {
        formWorkspace.appendChild(newElement);
    }
});

// Funktionen zum Erstellen der einzelnen Formularelemente
function createTextField() {
    const wrapper = document.createElement('div');
    wrapper.classList.add('form-element');
    wrapper.innerHTML = `
        <label>Textfeld:</label>
        <input type="text" placeholder="Geben Sie hier Text ein">
    `;
    return wrapper;
}

function createTextArea() {
    const wrapper = document.createElement('div');
    wrapper.classList.add('form-element');
    wrapper.innerHTML = `
        <label>Mehrzeiliger Text:</label>
        <textarea placeholder="Geben Sie hier Ihren Text ein"></textarea>
    `;
    return wrapper;
}

function createCheckbox() {
    const wrapper = document.createElement('div');
    wrapper.classList.add('form-element');
    wrapper.innerHTML = `
        <label><input type="checkbox"> Checkbox</label>
    `;
    return wrapper;
}

function createDropdown() {
    const wrapper = document.createElement('div');
    wrapper.classList.add('form-element');
    wrapper.innerHTML = `
        <label>Dropdown-Menü:</label>
        <select>
            <option>Option 1</option>
            <option>Option 2</option>
        </select>
    `;
    return wrapper;
}

function createDateField() {
    const wrapper = document.createElement('div');
    wrapper.classList.add('form-element');
    wrapper.innerHTML = `
        <label>Datumsauswahl:</label>
        <input type="date">
    `;
    return wrapper;
}

function createSignatureField() {
    const wrapper = document.createElement('div');
    wrapper.classList.add('form-element');
    wrapper.innerHTML = `
        <label>Unterschrift:</label>
        <div style="border: 1px solid #ccc; width: 100%; height: 100px;">[Unterschrift]</div>
    `;
    return wrapper;
}

function createFileUploadField() {
    const wrapper = document.createElement('div');
    wrapper.classList.add('form-element');
    wrapper.innerHTML = `
        <label>Datei hochladen:</label>
        <input type="file">
    `;
    return wrapper;
}

function createRadioButton() {
    const wrapper = document.createElement('div');
    wrapper.classList.add('form-element');
    wrapper.innerHTML = `
        <label>Radiobutton:</label>
        <input type="radio" name="option"> Option 1
        <input type="radio" name="option"> Option 2
    `;
    return wrapper;
}

function createMultipleDropdown() {
    const wrapper = document.createElement('div');
    wrapper.classList.add('form-element');
    wrapper.innerHTML = `
        <label>Mehrfachauswahl Dropdown:</label>
        <select multiple>
            <option>Option 1</option>
            <option>Option 2</option>
            <option>Option 3</option>
        </select>
    `;
    return wrapper;
}

function createSectionDivider() {
    const wrapper = document.createElement('div');
    wrapper.classList.add('form-element');
    wrapper.innerHTML = `<hr>`;
    return wrapper;
}

function createSlider() {
    const wrapper = document.createElement('div');
    wrapper.classList.add('form-element');
    wrapper.innerHTML = `
        <label>Schieberegler:</label>
        <input type="range" min="0" max="100">
    `;
    return wrapper;
}

function createColorPicker() {
    const wrapper = document.createElement('div');
    wrapper.classList.add('form-element');
    wrapper.innerHTML = `
        <label>Farbauswahl:</label>
        <input type="color">
    `;
    return wrapper;
}

function createEmailField() {
    const wrapper = document.createElement('div');
    wrapper.classList.add('form-element');
    wrapper.innerHTML = `
        <label>Email:</label>
        <input type="email" placeholder="name@example.com">
    `;
    return wrapper;
}

function createPhoneField() {
    const wrapper = document.createElement('div');
    wrapper.classList.add('form-element');
    wrapper.innerHTML = `
        <label>Telefonnummer:</label>
        <input type="tel" placeholder="Telefonnummer eingeben">
    `;
    return wrapper;
}

function createLargeTextArea() {
    const wrapper = document.createElement('div');
    wrapper.classList.add('form-element');
    wrapper.innerHTML = `
        <label>Mehrzeiliger Text (groß):</label>
        <textarea placeholder="Geben Sie hier Ihren Text ein"></textarea>
    `;
    return wrapper;
}

function createTermsCheckbox() {
    const wrapper = document.createElement('div');
    wrapper.classList.add('form-element');
    wrapper.innerHTML = `
        <label><input type="checkbox"> AGB akzeptieren</label>
    `;
    return wrapper;
}

function createSubmitButton() {
    const wrapper = document.createElement('div');
    wrapper.classList.add('form-element');
    wrapper.innerHTML = `
        <button type="submit">Senden</button>
    `;
    return wrapper;
}

function createCustomButton() {
    const wrapper = document.createElement('div');
    wrapper.classList.add('form-element');
    wrapper.innerHTML = `
        <button type="button">Benutzerdefinierter Button</button>
    `;
    return wrapper;
}

function createCaptchaField() {
    const wrapper = document.createElement('div');
    wrapper.classList.add('form-element');
    wrapper.innerHTML = `<div class="g-recaptcha" data-sitekey="your-site-key"></div>`;
    return wrapper;
}

function createGoogleMapsField() {
    const wrapper = document.createElement('div');
    wrapper.classList.add('form-element');
    wrapper.innerHTML = `
        <label>Standort auswählen:</label>
        <div id="map" style="width: 100%; height: 300px;">Google Maps</div>
    `;
    return wrapper;
}

function createDragDropFileUpload() {
    const wrapper = document.createElement('div');
    wrapper.classList.add('form-element');
    wrapper.innerHTML = `
        <label>Drag-and-Drop Datei-Upload:</label>
        <input type="file">
    `;
    return wrapper;
}

function createProgressiveForm() {
    const wrapper = document.createElement('div');
    wrapper.classList.add('form-element');
    wrapper.innerHTML = `
        <label>Progressives Formular:</label>
        <input type="text" placeholder="Feld 1">
        <input type="text" placeholder="Feld 2" style="display: none;">
    `;
    return wrapper;
}

function createConditionalForm() {
    const wrapper = document.createElement('div');
    wrapper.classList.add('form-element');
    wrapper.innerHTML = `
        <label>Bedingungslogik:</label>
        <input type="text" placeholder="Bedingung 1">
        <input type="text" placeholder="Bedingung 2" style="display: none;">
    `;
    return wrapper;
}

function createPaymentField() {
    const wrapper = document.createElement('div');
    wrapper.classList.add('form-element');
    wrapper.innerHTML = `
        <label>Zahlungsfeld:</label>
        <input type="text" placeholder="Kreditkartennummer">
        <input type="text" placeholder="Gültig bis">
    `;
    return wrapper;
}
