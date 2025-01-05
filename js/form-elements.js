// form-elements.js

const formElements = [
    // {
    //     id: 1,
    //     label: 'Bild',
    //     type: 'img',
    //     icon: 'fas fa-image',
    //     description: 'Ermöglicht das Hinzufügen von Bildern, wie z.B. Firmenlogos.',
    //     generalProperties: {
    //         id: 'bild_1',
    //         label: 'Bild hinzufügen',
    //         duplicate: true,
    //         delete: true,
    //     },
    //     specificProperties: {
    //         uploadImage: '', // Bilddatei im Base64-Format speichern
    //         maxFileSize: 2, // maximale Dateigröße in MB
    //         width: '100%', // Standardbreite in Prozent
    //         height: 'auto', // Standardhöhe
    //         alignment: 'left', // Ausrichtung des Bildes (left, center, right)
    //         title: '', // Bildtitel
    //         caption: '', // Bildunterschrift
    //         preview: true, // Bildvorschau aktivieren
    //         allowUrl: false, // URL-Eingabe deaktivieren, da Bild hochgeladen wird
    //         // visible: true // Sichtbarkeit des Bildes im finalen Formular

    //     },
    // },
    // {
    //     id: 2,
    //     label: 'Dokument anzeigen',
    //     type: 'document-view',
    //     icon: 'fas fa-file',
    //     description: 'Ermöglicht das Einbinden von Dokumenten wie PDF, Word oder Excel.',
    //     generalProperties: {
    //         id: 'dokument_1',
    //         label: 'Dokument anzeigen',
    //         duplicate: true,
    //         delete: true,
    //     },
    //     specificProperties: {
    //         src: 'https://example.com/dokument.pdf',
    //         fileType: 'PDF',
    //         allowDownload: true,
    //     },
    // },
    // {
    //     id: 3,
    //     label: 'Hyperlink',
    //     type: 'a',
    //     icon: 'fas fa-link',
    //     description: 'Verlinkt auf externe Webseiten oder Dokumente.',
    //     generalProperties: {
    //         id: 'link_1',
    //         label: 'Hyperlink',
    //         duplicate: true,
    //         delete: true,
    //     },
    //     specificProperties: {
    //         href: 'https://example.com',
    //         linkText: 'Beispiel Link',
    //         openInNewTab: true,
    //     },
    // },
    {
        id: 4,
        label: 'Text',
        type: 'input',
        icon: 'fas fa-font',
        description: 'Zeigt festen Text an, der nicht bearbeitet werden kann.',
        generalProperties: {
            id: 'text_1',
            duplicate: true,
            delete: true,
            visible: true,
            isRequired: false // Standard: Pflichtfeld ist deaktiviert
        },
        specificProperties: {
            label: 'Textfeld',
            content: 'Dies ist ein Beispieltext',
            format: 'normal', // Optionen: normal, bold, italic
            textSize: 'medium', // Optionen: small, medium, large
            textColor: '#000000', // Farbe des Textes
            alignment: 'left', // Optionen: left, center, right, justify
            fontFamily: 'Arial', // Beispiele: Arial, Verdana, Times New Roman
            backgroundColor: '#ffffff', // Hintergrundfarbe
            border: {
                style: 'none', // Optionen: none, solid, dashed, dotted
                width: '1px', // Dicke des Rahmens
                color: '#000000', // Farbe des Rahmens
            },
            lineHeight: 'normal', // Zeilenabstand: normal, 1.5, 2
            // padding: '10px', // Innenabstand
            textDecoration: 'none', // Optionen: none, underline, line-through
            variables: ['Vorname', 'Nachname', 'Benutzerrolle'], // Dynamische Variablen
        },
        render(element, userData = {}) {
            const specific = element.specificProperties || {};
            const border = specific.border || {};

            // Variablen im Text ersetzen, wenn userData vorhanden ist
            const contentWithVariables = (specific.content || '').replace(/\(\((.+?)\)\)/g, (match, varName) => {
                return userData[varName.trim()] || `{{${varName.trim()}}}`;
            });

            // Fallbacks für fehlende Werte und generiertes HTML
            return `
                <p style="
                    color: ${specific.textColor || '#000000'};
                    font-weight: ${specific.format === 'bold' ? 'bold' : 'normal'};
                    font-style: ${specific.format === 'italic' ? 'italic' : 'normal'};
                    font-size: ${specific.textSize === 'small' ? '12px' :
                    specific.textSize === 'medium' ? '16px' : '20px'};
                    text-align: ${specific.alignment || 'left'};
                    font-family: ${specific.fontFamily || 'Arial'};
                    background-color: ${specific.backgroundColor || '#ffffff'};
                    line-height: ${specific.lineHeight || 'normal'};
                    text-decoration: ${specific.textDecoration || 'none'};
                    border: ${border.style !== 'none' ? `
                        ${border.width || '1px'} 
                        ${border.style || 'solid'} 
                        ${border.color || '#000000'}` : 'none'};
                ">
                    ${contentWithVariables}
                </p>`;
        }
    },
    {
        id: 5,
        label: 'Trennlinie',
        type: 'hr',
        icon: 'fas fa-minus',
        description: 'Fügt eine Trennlinie ein, um Inhalte optisch abzugrenzen.',
        generalProperties: {
            id: 'trennlinie_1',
            duplicate: true,
            delete: true,
            visible: true,
            isRequired: false // Standard: Pflichtfeld ist deaktiviert

        },
        specificProperties: {
            lineStyle: 'solid',   // Optionen: solid, dashed
            lineColor: '#000000', // Standardfarbe
            lineWidth: '1px',     // Standarddicke
        },
        render(element) {
            return `
                <hr style="
                    border: none;
                    border-style: ${element.specificProperties.lineStyle};
                    border-color: ${element.specificProperties.lineColor};
                    border-width: ${element.specificProperties.lineWidth};
                ">`;
        },
    },
    // {
    //     id: 6,
    //     label: 'Bewertungsskala',
    //     type: 'rating-scale',
    //     icon: 'fas fa-star',
    //     description: 'Bietet eine Skala zur Bewertung, ideal für Feedback oder Umfragen.',
    //     generalProperties: {
    //         id: 'bewertung_1',
    //         label: 'Bewertung',
    //         duplicate: true,
    //         delete: true,
    //     },
    //     specificProperties: {
    //         starCount: 5,
    //         defaultRating: 3,
    //     },
    // },
    // {
    //     id: 7,
    //     label: 'Datensatzauswahl',
    //     type: 'dataset-select',
    //     icon: 'fas fa-table',
    //     description: 'Ermöglicht die Auswahl eines Datensatzfeldes, welches aus dem Datensatz geladen wird. Der Benutzer kann außerdem die Ausrichtung, Textgröße, Schriftart und einen optionalen Titel festlegen.',
    //     generalProperties: {
    //         id: 'datensatzauswahl_1',
    //         label: 'Datensatzauswahl',
    //         duplicate: true,
    //         delete: true,
    //     },
    //     specificProperties: {
    //         dataSource: 'Excel-Datei', // Quelle oder Datenbank für die Datensätze
    //         searchFunction: true, // Option für eine Suchfunktion innerhalb des Datensatzes
    //         filterOptions: [], // Optionen zum Filtern der angezeigten Daten
    //         datasetField: 'firstName', // Standardmäßig ausgewähltes Datensatzfeld (z.B. Vorname)
    //         alignment: 'left', // Ausrichtung (z.B. 'left', 'center', 'right')
    //         fontSize: 'medium', // Textgröße (z.B. 'small', 'medium', 'large')
    //         fontFamily: 'Arial', // Schriftart (z.B. 'Arial', 'Verdana', 'Times New Roman')
    //         title: '', // Optionaler Titel, der über dem ausgewählten Datensatzfeld angezeigt werden kann
    //     },
    // },
    // {
    //     id: 8,
    //     label: 'Einfachauswahl',
    //     type: 'radio',
    //     icon: 'fas fa-check-circle',
    //     description: 'Lässt den Nutzer eine Option aus einer vorgegebenen Liste auswählen.',
    //     generalProperties: {
    //         id: 'einfachauswahl_1',
    //         label: 'Einfachauswahl',
    //         duplicate: true,
    //         delete: true,
    //     },
    //     specificProperties: {
    //         options: ['Option 1', 'Option 2', 'Option 3'],
    //         defaultOption: 'Option 1',
    //     },
    // },
    // {
    //     id: 9,
    //     label: 'Kontrollkästchen',
    //     type: 'checkbox',
    //     icon: 'fas fa-check-square',
    //     description: 'Fügt ein Kontrollkästchen hinzu, mit dem der Nutzer eine Auswahl bestätigen kann.',
    //     generalProperties: {
    //         id: 'kontrollkaestchen_1',
    //         label: 'Kontrollkästchen',
    //         duplicate: true,
    //         delete: true,
    //     },
    //     specificProperties: {
    //         defaultState: false,
    //     },
    // },
    {
        id: 10,
        label: 'Checkbox Gruppe',
        type: 'checkbox-group',
        icon: 'fas fa-check-square',
        description: 'Fügt eine Gruppe von Checkboxen hinzu, aus denen der Benutzer mehrere Optionen auswählen kann.',
        generalProperties: {
            id: 'checkbox_1',
            label: 'Checkbox Gruppe',
            duplicate: true,
            delete: true,
            visible: true,
            isRequired: false
        },
        specificProperties: {
            groupLabel: 'Bitte wählen Sie die zutreffenden Optionen:',
            options: ['Option 1', 'Option 2', 'Option 3'],
            defaultSelected: [],
            layout: 'vertical',
            optionLabels: ['Option 1', 'Option 2', 'Option 3'],
            optionValues: ['1', '2', '3'],
            textColor: '#000000',
            backgroundColor: '#ffffff',
            spacing: 'medium',
            checkboxStyle: 'modern',
            customCSS: '',
            minSelected: 0,
            maxSelected: null,
        },
        render(element, userData = {}) {
            const specific = element.specificProperties || {};
            const layoutClass = specific.layout === 'horizontal' ? 'flex-wrap' : 'flex-col';
            const spacingClass = `gap-${specific.spacing === 'small' ? '2' : specific.spacing === 'medium' ? '4' : '6'}`;
    
            const labelHtml = specific.groupLabel ?
                `<label class="form-label checkbox-group-label" style="color: ${specific.textColor}">
                    ${specific.groupLabel}
                    ${element.generalProperties.isRequired ? '<span class="required">*</span>' : ''}
                </label>` : '';
    
            const options = specific.options.map((option, index) => {
                const label = specific.optionLabels[index] || option;
                const value = specific.optionValues[index] || option;
                const isChecked = (specific.defaultSelected || []).includes(option);
    
                return `
                    <label class="checkbox-option">
                        <div class="checkbox-wrapper">
                            <input 
                                type="checkbox"
                                name="checkbox_${element.id}[]"
                                value="${value}"
                                ${isChecked ? 'checked' : ''}
                                data-min-selected="${specific.minSelected}"
                                data-max-selected="${specific.maxSelected || ''}"
                            />
                            <span class="custom-checkbox"></span>
                            <span class="checkbox-label" style="color: ${specific.textColor}">
                                ${label}
                            </span>
                        </div>
                    </label>
                `;
            }).join('');
    
            return `
                <div class="checkbox-group-container">
                    ${labelHtml}
                    <div class="checkbox-group ${layoutClass} ${spacingClass}" 
                         style="background-color: ${specific.backgroundColor}">
                        ${options}
                    </div>
                    ${specific.minSelected > 0 ? 
                        `<small class="hint-text">Bitte wählen Sie mindestens ${specific.minSelected} Option${specific.minSelected > 1 ? 'en' : ''} aus.</small>` : 
                        ''}
                    ${specific.maxSelected ? 
                        `<small class="hint-text">Sie können maximal ${specific.maxSelected} Option${specific.maxSelected > 1 ? 'en' : ''} auswählen.</small>` : 
                        ''}
                </div>
            `;
        }
    },
    // {
    //     id: 11,
    //     label: 'Code-Scanner',
    //     type: 'code-scanner',
    //     icon: 'fas fa-barcode',
    //     description: 'Ermöglicht das Scannen von Barcodes oder QR-Codes mit der Kamera des Geräts.',
    //     generalProperties: {
    //         id: 'code_scanner_1',
    //         label: 'Code-Scanner',
    //         duplicate: true,
    //         delete: true,
    //     },
    //     specificProperties: {
    //         scannerType: 'QR-Code', // Optionen: QR-Code, Barcode
    //         autoScan: true,
    //     },
    // },
    // {
    {
        id: 12,
        label: 'Datums- und Zeitauswahl',
        type: 'datetime-picker',
        icon: 'fas fa-calendar-alt',
        description: 'Ermöglicht dem Nutzer, ein Datum und/oder eine Uhrzeit auszuwählen.',
        generalProperties: {
            id: 'datum_zeit_1',
            label: 'Datums- und Zeitauswahl',
            duplicate: true,
            delete: true,
            visible: true,
            isRequired: false // Standard: Pflichtfeld ist deaktiviert
        },
        specificProperties: {
            label: 'Datum und Zeit',        // Beschriftung
            placeholder: 'Wählen Sie Datum und/oder Zeit', // Hinweistext
            format: 'datetime',            // Optionen: 'date', 'time', 'datetime'
            timeZone: 'local',             // Zeitzone (z.B. 'local' oder 'UTC')
            firstDayOfWeek: 'monday',      // Erster Wochentag ('monday' oder 'sunday')
            textColor: '#000000',          // Textfarbe
        },
        render(element, userData = {}) {
            const specific = element.specificProperties || {};
            const dateTimeType = specific.format || 'datetime';
            const placeholder = specific.placeholder || 'Wählen Sie Datum und/oder Zeit';
            const inputId = `datetime-picker-${element.id}`;

            const html = `
                    <div class="responsive-picker-container">
                        <label for="${inputId}" class="form-label">
                            ${specific.label || 'Datum/Zeit auswählen'}
                        </label>
                        <input
                            id="${inputId}"
                            class="responsive-picker-input"
                            type="text"
                            placeholder="${placeholder}"
                            style="color: ${specific.textColor};">
                    </div>
                `;

            // Nach Rendern flatpickr initialisieren
            setTimeout(() => {
                const input = document.getElementById(inputId);
                if (input) {
                    const config = {
                        enableTime: dateTimeType !== 'date',
                        noCalendar: dateTimeType === 'time',
                        dateFormat: dateTimeType === 'date' ? 'Y-m-d' : dateTimeType === 'time' ? 'H:i' : 'Y-m-d H:i',
                        time_24hr: true,
                    };

                    flatpickr(input, config);
                }
            }, 0);

            return html;
        }
    },

    {
        id: 13,
        label: 'Dokument anhängen oder Foto aufnehmen',
        type: 'file-upload', // Bleibt 'file-upload' für Typkompatibilität
        icon: 'fas fa-paperclip',
        description: 'Lässt den Nutzer ein Dokument hochladen oder ein Foto aufnehmen und an das Formular anhängen.',
        generalProperties: {
            id: 'dokument_anhaengen_1',
            label: 'Dokument anhängen oder Foto aufnehmen',
            duplicate: true,
            delete: true,
            visible: true,
            isRequired: false,
        },
        specificProperties: {
            allowedFileTypes: ['PDF', 'JPG', 'PNG'], // Erlaubte Dateitypen
            maxFileSize: 5, // Maximalgröße in MB
            multipleFiles: true, // Ermöglicht mehrere Dateien
            uploadedFiles: [], // Initialisierung für hochgeladene Dateien
        },
        render(element, userData = {}) {
            const specific = element.specificProperties || {};
            const allowedFileTypes = specific.allowedFileTypes.join(', ');
            const maxFileSize = specific.maxFileSize || 5;
            const inputId = `file-upload-${element.id}`;
            const cameraId = `camera-upload-${element.id}`;

            const html = `
                <div class="file-upload-container">
                    <label for="${inputId}" class="form-label">
                        ${element.generalProperties.label || 'Datei hochladen oder Foto aufnehmen'}
                    </label>
                    <div class="upload-options">
                        <button type="button" class="file-upload-button" onclick="document.getElementById('${inputId}').click()">
                            Datei hochladen
                        </button>
                        <button type="button" class="file-upload-button" onclick="document.getElementById('${cameraId}').click()">
                            Foto aufnehmen
                        </button>
                    </div>
                    
                    <input 
                        id="${inputId}" 
                        type="file" 
                        accept="${specific.allowedFileTypes.map(type => '.' + type.toLowerCase()).join(', ')}"
                        style="display: none;"
                        ${specific.multipleFiles ? 'multiple' : ''}
                        onchange="import('./js/file-upload-utils.js').then(module => module.handleFileUpload(event, '${element.id}'))"
                    />
    
                    <input 
                        id="${cameraId}" 
                        type="file" 
                        accept="image/*" 
                        capture="environment"
                        style="display: none;"
                        onchange="import('./js/file-upload-utils.js').then(module => module.handleFileUpload(event, '${element.id}'))"
                    />
    
                    <div id="file-list-${element.id}" class="uploaded-file-list">
                        ${specific.uploadedFiles.length > 0
                    ? specific.uploadedFiles
                        .map(
                            (file, index) => `
                                        <div class="uploaded-file-item">
                                            <span>${file.name} (${file.size})</span>
                                            <button type="button" class="delete-file-button" onclick="import('./js/file-upload-utils.js').then(module => module.removeUploadedFile('${element.id}', ${index}))">
                                                Löschen
                                            </button>
                                        </div>
                                    `
                        )
                        .join('')
                    : '<span class="no-files-text">Keine Dateien hochgeladen</span>'
                }
                    </div>
    
                    <small class="file-info-text">
                        Erlaubte Dateitypen: ${allowedFileTypes} | Max. Dateigröße: ${maxFileSize} MB
                    </small>
                </div>
            `;

            return html;
        },
    },

    // form-elements.js

    {
        id: 14, // Neue ID für den "Senden"-Baustein
        label: 'Senden',
        type: 'submit-button',
        icon: 'fas fa-paper-plane',
        description: 'Formular absenden und alle Eingaben verarbeiten.',
        generalProperties: {
            id: 'senden_1',
            label: 'Formular absenden',
            duplicate: false, // Senden-Button soll nicht dupliziert werden können
            delete: true,
            visible: true,
        },
        specificProperties: {
            targetCloud: 'GoogleDrive', // Standardmäßig Google Drive, später erweiterbar
            folderNamingConvention: '', // Optionaler Name für den Zielordner, z.B. dynamisch basierend auf Bausteinwerten
            fileNamingConvention: '', // Dynamischer Dateiname, z.B. basierend auf Datumswerten
            notifyUser: false, // Option, ob eine Benachrichtigung verschickt werden soll
            apiCredentials: { // Platzhalter für die Cloud-API-Zugangsdaten
                clientId: '',
                clientSecret: '',
                redirectUri: '',
            },
        },
        render(element) {
            // HTML Rendering des "Senden"-Buttons mit Eigenschaften
            return `
            <button type="button" class="submit-button" id="${element.generalProperties.id}">
                <i class="${element.icon}"></i> ${element.generalProperties.label}
            </button>
            <div class="progress-bar" id="progress-${element.generalProperties.id}" style="display: none;"></div>
        `;
        }
    },


    // {
    //     id: 14,
    //     label: 'E-Mail Eingabefeld',
    //     type: 'email',
    //     icon: 'fas fa-envelope',
    //     description: 'Ermöglicht dem Nutzer, eine E-Mail-Adresse einzugeben. Die Eingabe wird auf Gültigkeit geprüft.',
    //     generalProperties: {
    //         id: 'email_1',
    //         label: 'E-Mail Eingabe',
    //         duplicate: true,
    //         delete: true,
    //     },
    //     specificProperties: {
    //         placeholder: 'E-Mail eingeben',
    //         validation: true,
    //     },
    // },
    // {
    //     id: 15,
    //     label: 'Foto aufnehmen',
    //     type: 'photo',
    //     icon: 'fas fa-camera',
    //     description: 'Der Nutzer kann ein Foto aufnehmen oder aus der Galerie auswählen.',
    //     generalProperties: {
    //         id: 'foto_1',
    //         label: 'Foto aufnehmen',
    //         duplicate: true,
    //         delete: true,
    //     },
    //     specificProperties: {
    //         imageSize: 'medium', // Optionen: klein, mittel, groß
    //         annotationTools: true,
    //     },
    // },
    // {
    //     id: 16,
    //     label: 'Positionsbestimmung',
    //     type: 'location',
    //     icon: 'fas fa-map-marker-alt',
    //     description: 'Ermöglicht dem Nutzer, seine aktuelle Position zu erfassen.',
    //     generalProperties: {
    //         id: 'position_1',
    //         label: 'Positionsbestimmung',
    //         duplicate: true,
    //         delete: true,
    //     },
    //     specificProperties: {
    //         accuracy: 'high', // Optionen: hoch, mittel, niedrig
    //         captureTimestamp: true,
    //     },
    // },
    // {
    //     id: 17,
    //     label: 'Skizze',
    //     type: 'drawing',
    //     icon: 'fas fa-pencil-alt',
    //     description: 'Ermöglicht es dem Nutzer, eine Skizze direkt auf dem Gerät zu erstellen.',
    //     generalProperties: {
    //         id: 'skizze_1',
    //         label: 'Skizze',
    //         duplicate: true,
    //         delete: true,
    //     },
    //     specificProperties: {
    //         backgroundImage: false,
    //         penColor: '#000000',
    //         penSize: 'medium',
    //     },
    // },
    // {
    {
        id: 18,
        label: 'Freitext-Eingabe',
        type: 'textarea',
        icon: 'fas fa-keyboard',
        description: 'Ermöglicht die Eingabe von längeren Texten, ideal für Kommentare, Beschreibungen oder Notizen.',
        generalProperties: {
            id: 'freitext_1',
            label: 'Freitext-Eingabe',
            duplicate: true,
            delete: true,
            visible: true,
            isRequired: false
        },
        specificProperties: {
            placeholder: 'Text hier eingeben...',
            defaultValue: '',
            minLength: 0,
            maxLength: 1000,
            rows: 4,
            textColor: '#000000',
            backgroundColor: '#ffffff',
            borderColor: '#cccccc',
            fontSize: 'medium',
            fontFamily: 'Arial',
            resize: 'vertical',
            spellcheck: true,
            readonly: false,
            currentLength: 0
        },
        render(element, userData = {}) {
            const specific = element.specificProperties || {};
            const textareaId = `textarea-${element.id}`;
            const counterId = `counter-${element.id}`;

            return `
                    <div class="textarea-container">
                       <label for="${textareaId}" class="form-label" style="font-weight: bold;">
                            ${element.generalProperties.label}
                            ${element.generalProperties.isRequired ? '<span class="required">*</span>' : ''}
                        </label>
                        <textarea
                            id="${textareaId}"
                            class="form-textarea"
                            data-font-size="${specific.fontSize}"
                            data-resize="${specific.resize}"
                            data-counter-id="${counterId}"
                            placeholder="${specific.placeholder}"
                            minlength="${specific.minLength}"
                            maxlength="${specific.maxLength}"
                            rows="${specific.rows}"
                            spellcheck="${specific.spellcheck}"
                            oninput="updateCharacterCount(this)"
                            ${specific.readonly ? 'readonly' : ''}
                            ${element.generalProperties.isRequired ? 'required' : ''}
                            style="
                                color: ${specific.textColor};
                                background-color: ${specific.backgroundColor};
                                border-color: ${specific.borderColor};
                                font-family: ${specific.fontFamily};
                            "
                        >${specific.defaultValue}</textarea>
                        <div class="character-count">
                            <small>
                                <span id="${counterId}">${specific.defaultValue.length}</span>
                                ${specific.maxLength > 0 ? ` / ${specific.maxLength}` : ''} Zeichen
                            </small>
                        </div>
                    </div>
                `;
        }
    },
    // {
    //     id: 19,
    //     label: 'Tonaufnahme',
    //     type: 'audio',
    //     icon: 'fas fa-microphone',
    //     description: 'Ermöglicht es dem Nutzer, eine Sprachnotiz aufzunehmen.',
    //     generalProperties: {
    //         id: 'tonaufnahme_1',
    //         label: 'Tonaufnahme',
    //         duplicate: true,
    //         delete: true,
    //     },
    //     specificProperties: {
    //         maxRecordingTime: 60, // in Sekunden
    //         quality: 'hoch', // Optionen: niedrig, mittel, hoch
    //     },
    // },
    {
        id: 20,
        label: 'Unterschrift',
        type: 'signature',
        icon: 'fas fa-pen',
        description: 'Ermöglicht dem Nutzer, eine Unterschrift direkt auf dem Gerät zu leisten.',
        generalProperties: {
            id: 'unterschrift_1',
            label: 'Unterschrift',
            duplicate: true,
            delete: true,
            visible: true,
            isRequired: false
        },
        specificProperties: {
            penColor: '#000000',
            fieldSize: 'medium',
            backgroundColor: '#ffffff',
            penWidth: 2,
            minWidth: 200,
            maxWidth: 800,
            minHeight: 100,
            maxHeight: 400
        },
        render(element) {
            const inputId = `signature-pad-${element.id}`;
            const popupButtonId = `popup-button-${element.id}`;
            const fieldSizeClass = element.specificProperties.fieldSize || 'medium';

            return `
                <div class="signature-container ${fieldSizeClass}">
                    <label for="${inputId}" class="form-label">
                        ${element.generalProperties.label || 'Unterschrift'}
                        ${element.generalProperties.isRequired ? '<span class="required">*</span>' : ''}
                    </label>
                    <button 
                        id="${popupButtonId}" 
                        type="button" 
                        class="button signature-popup-button"
                        onclick="window.signatureUtils.openSignaturePopup('${element.id}')">
                        Unterschreiben
                    </button>
                    <div id="signature-result-${element.id}" class="signature-result-container">
                        ${element.signatureData ?
                    `<img src="${element.signatureData}" 
                                 alt="Unterschrift" 
                                 class="saved-signature">
                             <button type="button" 
                                     class="button clear-signature-button"
                                     onclick="window.signatureUtils.clearSignatureResult('${element.id}')">
                                 Unterschrift löschen
                             </button>`
                    : ''
                }
                    </div>
                </div>
            `;
        }
    },




    // Erweiterung in form-elements.js
    // Neuer Baustein für Zahleneingabe

    {
        id: 21,
        label: 'Zahleneingabefeld',
        type: 'number-input',
        icon: 'fas fa-hashtag',
        description: 'Ermöglicht die Eingabe von Zahlen mit definierbarem Wertebereich und Schrittweite.',
        generalProperties: {
            id: 'zahleneingabe_1',
            label: 'Zahleneingabe',
            duplicate: true,
            delete: true,
            visible: true,
            isRequired: false
        },
        specificProperties: {
            minValue: 0,
            maxValue: 100,
            stepSize: 1,
            defaultValue: '',
            unit: '',
            allowDecimals: false,
            decimalPlaces: 2,
            alignment: 'left',
            backgroundColor: '#ffffff',
            textColor: '#000000',
            variableName: ''
        },
        render(element, userData = {}) {
            const specific = element.specificProperties || {};
            const inputId = `number-input-${element.id}`;

            // Step-Berechnung basierend auf allowDecimals
            const step = specific.allowDecimals === true ?
                (specific.stepSize || Math.pow(0.1, specific.decimalPlaces)) :
                1;

            // Standardwert-Formatierung
            let defaultValue = specific.defaultValue;
            if (specific.allowDecimals === true && defaultValue !== '') {
                defaultValue = parseFloat(defaultValue).toFixed(specific.decimalPlaces);
            } else if (!specific.allowDecimals && defaultValue !== '') {
                defaultValue = Math.round(parseFloat(defaultValue));
            }

            return `
                <div class="number-input-container">
                    <label for="${inputId}" class="form-label">
                        ${element.generalProperties.label}
                        ${element.generalProperties.isRequired ? '<span class="required">*</span>' : ''}
                    </label>
                    <div class="input-with-unit">
                        <input
                            id="${inputId}"
                            type="number"
                            class="number-input ${element.generalProperties.isRequired ? 'required' : ''}"
                            min="${specific.minValue}"
                            max="${specific.maxValue}"
                            step="${step}"
                            value="${defaultValue}"
                            style="
                                text-align: ${specific.alignment};
                                background-color: ${specific.backgroundColor};
                                color: ${specific.textColor};
                            "
                            data-variable-name="${specific.variableName}"
                            data-allow-decimals="${specific.allowDecimals}"
                            onkeydown="return window.app.validateNumberKeyPress(event, ${specific.allowDecimals})"
                            oninput="window.app.handleNumberInputChange(this, '${element.id}')"
                            onpaste="return window.app.validateNumberPaste(event, ${specific.allowDecimals})"
                            ${element.generalProperties.isRequired ? 'required' : ''}
                        />
                        ${specific.unit ? `<span class="unit-label">${specific.unit}</span>` : ''}
                    </div>
                    <div class="input-controls">
                        <button type="button" 
                                class="number-control-button" 
                                onclick="window.app.handleNumberInput('${element.id}', 'decrement')"
                                title="Wert verringern">-</button>
                        <button type="button" 
                                class="number-control-button" 
                                onclick="window.app.handleNumberInput('${element.id}', 'increment')"
                                title="Wert erhöhen">+</button>
                    </div>
                </div>
            `;
        }
    },
    // {
    //     id: 22,
    //     label: 'Zeitstempel',
    //     type: 'timestamp',
    //     icon: 'fas fa-clock',
    //     description: 'Erfasst den aktuellen Zeitpunkt, z.B. für Protokolle.',
    //     generalProperties: {
    //         id: 'zeitstempel_1',
    //         label: 'Zeitstempel',
    //         duplicate: true,
    //         delete: true,
    //     },
    //     specificProperties: {
    //         autoCapture: true,
    //     },
    // },
    // {
    //     id: 23,
    //     label: 'Textergebnis',
    //     type: 'text-result',
    //     icon: 'fas fa-font',
    //     description: 'Zeigt berechneten Text an, der nicht bearbeitet werden kann.',
    //     generalProperties: {
    //         id: 'textergebnis_1',
    //         label: 'Textergebnis',
    //         duplicate: true,
    //         delete: true,
    //     },
    //     specificProperties: {
    //         dataSource: 'Berechnungsformel',
    //     },
    // },
    // {
    //     id: 24,
    //     label: 'Zahlenergebnis',
    //     type: 'number-result',
    //     icon: 'fas fa-calculator',
    //     description: 'Zeigt eine berechnete Zahl an, die nicht bearbeitet werden kann.',
    //     generalProperties: {
    //         id: 'zahlenergebnis_1',
    //         label: 'Zahlenergebnis',
    //         duplicate: true,
    //         delete: true,
    //     },
    //     specificProperties: {
    //         calculationFormula: 'x + y',
    //     },
    // },
    // {
    //     id: 25,
    //     label: 'Zeitpunktergebnis',
    //     type: 'datetime-result',
    //     icon: 'fas fa-clock',
    //     description: 'Zeigt einen berechneten Zeitpunkt an, der nicht bearbeitet werden kann.',
    //     generalProperties: {
    //         id: 'zeitpunktergebnis_1',
    //         label: 'Zeitpunktergebnis',
    //         duplicate: true,
    //         delete: true,
    //     },
    //     specificProperties: {
    //         dataSource: 'Berechnungsformel',
    //     },
    // },
    // {
    //     id: 26,
    //     label: 'Zeitraumergebnis',
    //     type: 'duration-result',
    //     icon: 'fas fa-hourglass-half',
    //     description: 'Zeigt einen berechneten Zeitraum an, der nicht bearbeitet werden kann.',
    //     generalProperties: {
    //         id: 'zeitraumergebnis_1',
    //         label: 'Zeitraumergebnis',
    //         duplicate: true,
    //         delete: true,
    //     },
    //     specificProperties: {
    //         calculationFormula: 'Endzeit - Startzeit',
    //     },
    // },
    // {
    //     id: 27,
    //     label: 'E-Mail versenden',
    //     type: 'email-send',
    //     icon: 'fas fa-paper-plane',
    //     description: 'Ermöglicht das Versenden einer E-Mail beim Absenden des Formulars.',
    //     generalProperties: {
    //         id: 'email_send_1',
    //         label: 'E-Mail versenden',
    //         duplicate: true,
    //         delete: true,
    //     },
    //     specificProperties: {
    //         recipientAddresses: ['example@example.com'],
    //         subject: 'Betreff der E-Mail',
    //         message: 'Nachrichtentext',
    //     },
    // },
    // {
    //     id: 28,
    //     label: 'Abschnitt',
    //     type: 'section',
    //     icon: 'fas fa-folder-open',
    //     description: 'Hilft, das Formular in logische Abschnitte zu unterteilen.',
    //     generalProperties: {
    //         id: 'abschnitt_1',
    //         label: 'Abschnitt',
    //         duplicate: true,
    //         delete: true,
    //     },
    //     specificProperties: {
    //         sectionStyle: 'default', // Optionen: default, custom
    //         allowNestedElements: true,
    //     },
    // },
    // {
    //     id: 29,
    //     label: 'Gruppe',
    //     type: 'group',
    //     icon: 'fas fa-object-group',
    //     description: 'Gruppiert mehrere Bausteine, um sie gemeinsam zu verwalten.',
    //     generalProperties: {
    //         id: 'gruppe_1',
    //         label: 'Gruppe',
    //         duplicate: true,
    //         delete: true,
    //     },
    //     specificProperties: {
    //         activationRules: 'always', // Optionen: always, conditional
    //         groupDisplay: 'expanded', // Optionen: expanded, collapsed
    //     },
    // },
    // {
    //     id: 30,
    //     label: 'Wiederholungsgruppe',
    //     type: 'repeat-group',
    //     icon: 'fas fa-redo',
    //     description: 'Ermöglicht das Wiederholen eines bestimmten Formularteils, um mehrere Einträge zu erfassen.',
    //     generalProperties: {
    //         id: 'wiederholungsgruppe_1',
    //         label: 'Wiederholungsgruppe',
    //         duplicate: true,
    //         delete: true,
    //     },
    //     specificProperties: {
    //         maxRepetitions: 5,
    //         allowNewEntries: true,
    //     },
    // },
    {
        id: 31,
        label: 'Radio Buttons',
        type: 'radio-group',
        icon: 'fas fa-dot-circle',
        description: 'Fügt eine Gruppe von Radio-Buttons hinzu, aus denen der Benutzer eine Option auswählen kann.',
        generalProperties: {
            id: 'radio_1',
            label: 'Radio Button Gruppe',
            duplicate: true,
            delete: true,
            visible: true,
            isRequired: false
        },
        specificProperties: {
            // NEU: Beschriftung für die Radio-Button Gruppe
            groupLabel: 'Bitte wählen Sie eine Option:', // Standard-Beschriftung
            options: ['Option 1', 'Option 2', 'Option 3'],
            defaultSelected: 'Option 1',
            layout: 'vertical',
            optionLabels: ['Option 1', 'Option 2', 'Option 3'],
            optionValues: ['1', '2', '3'],
            textColor: '#000000',
            backgroundColor: '#ffffff',
            spacing: 'medium',
            customCSS: '',
        },
        render(element, userData = {}) {
            const specific = element.specificProperties || {};
            const layoutClass = specific.layout === 'horizontal' ? 'flex-row' : 'flex-col';
            const spacingClass = `gap-${specific.spacing === 'small' ? '2' : specific.spacing === 'medium' ? '4' : '6'}`;

            // NEU: Label-HTML hinzugefügt
            const labelHtml = specific.groupLabel ?
                `<label class="form-label" style="color: ${specific.textColor}; margin-bottom: 0.5rem;">
                    ${specific.groupLabel}
                </label>` : '';

            const options = specific.options.map((option, index) => {
                const label = specific.optionLabels[index] || option;
                const value = specific.optionValues[index] || option;
                const isChecked = specific.defaultSelected === option;

                return `
                    <label class="radio-option">
                        <input 
                            type="radio"
                            name="radio_${element.id}"
                            value="${value}"
                            ${isChecked ? 'checked' : ''}
                        />
                        <span style="color: ${specific.textColor}">
                            ${label}
                        </span>
                    </label>
                `;
            }).join('');

            return `
                <div class="radio-group-container">
                    ${labelHtml}
                    <div class="radio-group ${layoutClass} ${spacingClass}"
                         style="background-color: ${specific.backgroundColor}; 
                                padding: ${specific.spacing === 'small' ? '0.5rem' :
                    specific.spacing === 'medium' ? '1rem' : '1.5rem'}">
                        ${options}
                    </div>
                </div>
            `;
        }
    },

    {
        id: 32,
        label: 'Dropdown Menü',
        type: 'dropdown',
        icon: 'fas fa-caret-square-down',
        description: 'Fügt ein Auswahlmenü hinzu, aus dem der Benutzer eine Option auswählen kann.',
        generalProperties: {
            id: 'dropdown_1',
            duplicate: true,
            delete: true,
            visible: true,
            isRequired: false
        },
        specificProperties: {
            label: '',
            options: [],
            optionLabels: [],
            optionValues: [],
            defaultValue: '',
            textColor: '#000000',
            backgroundColor: '#ffffff',
            fontSize: 'medium'
        },
        // Factory-Funktion für neue Instanzen
        createInstance() {
            return {
                ...this,
                id: Date.now(),
                specificProperties: {
                    ...this.specificProperties,
                    options: ['Option 1', 'Option 2', 'Option 3'],
                    optionLabels: ['Option 1', 'Option 2', 'Option 3'],
                    optionValues: ['1', '2', '3'],
                }
            };
        },
        render(element, userData = {}) {
            const specific = element.specificProperties || {};
            const selectId = `dropdown-${element.id}`;

            const baseStyles = `
                color: ${specific.textColor};
                background-color: ${specific.backgroundColor};
                border: 1px solid #cccccc;
                border-radius: 4px;
                padding: 8px 12px;
                font-size: ${specific.fontSize === 'small' ? '0.875rem' :
                    specific.fontSize === 'large' ? '1.25rem' : '1rem'};
                width: 100%;
                cursor: pointer;
                transition: border-color 0.3s ease, box-shadow 0.3s ease;
            `;

            return `
                <div class="dropdown-container">
                    <label for="${selectId}" class="form-label" style="font-weight: bold;">
                        ${specific.label || 'Dropdown Menü'}
                        ${element.generalProperties.isRequired ? '<span class="required">*</span>' : ''}
                    </label>
                    <select 
                        id="${selectId}"
                        class="form-dropdown"
                        ${element.generalProperties.isRequired ? 'required' : ''}
                        style="${baseStyles}"
                    >
                        ${specific.options.map((option, index) => `
                            <option 
                                value="${specific.optionValues[index]}"
                                ${specific.defaultValue === specific.optionValues[index] ? 'selected' : ''}
                            >
                                ${specific.optionLabels[index]}
                            </option>
                        `).join('')}
                    </select>
                </div>
            `;
        }
    },
];

export default formElements;