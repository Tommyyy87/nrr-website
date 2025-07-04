// form-elements.js

const formElements = [
    {
        id: 1,
        label: 'Bild',
        type: 'img',
        icon: 'fas fa-image',
        description: 'Ermöglicht das Hinzufügen von Bildern, wie z.B. Firmenlogos.',
        generalProperties: {
            id: 'bild_1',
            label: 'Bild hinzufügen',
            duplicate: true,
            delete: true,
        },
        specificProperties: {
            src: 'https://example.com/bild.jpg',
            altText: 'Beschreibung des Bildes',
            size: 'original', // Optionen: original, verkleinert
            alignment: 'center', // Optionen: left, right, center
        },
    },
    {
        id: 2,
        label: 'Dokument anzeigen',
        type: 'document-view',
        icon: 'fas fa-file',
        description: 'Ermöglicht das Einbinden von Dokumenten wie PDF, Word oder Excel.',
        generalProperties: {
            id: 'dokument_1',
            label: 'Dokument anzeigen',
            duplicate: true,
            delete: true,
        },
        specificProperties: {
            src: 'https://example.com/dokument.pdf',
            fileType: 'PDF',
            allowDownload: true,
        },
    },
    {
        id: 3,
        label: 'Hyperlink',
        type: 'a',
        icon: 'fas fa-link',
        description: 'Verlinkt auf externe Webseiten oder Dokumente.',
        generalProperties: {
            id: 'link_1',
            label: 'Hyperlink',
            duplicate: true,
            delete: true,
        },
        specificProperties: {
            href: 'https://example.com',
            linkText: 'Beispiel Link',
            openInNewTab: true,
        },
    },
    {
        id: 4,
        label: 'Text',
        type: 'input',
        icon: 'fas fa-font',
        description: 'Zeigt festen Text an, der nicht bearbeitet werden kann.',
        generalProperties: {
            id: 'text_1',
            label: 'Textfeld',
            duplicate: true,
            delete: true,
        },
        specificProperties: {
            content: 'Dies ist ein Beispieltext',
            format: 'normal', // Optionen: normal, bold, italic
            textSize: 'medium', // Optionen: small, medium, large
            textColor: '#000000',
        },
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
        },
        specificProperties: {
            lineStyle: 'solid', // Optionen: solid, dashed
            lineColor: '#cccccc',
            lineWidth: '1px',
        },
    },
    {
        id: 6,
        label: 'Bewertungsskala',
        type: 'rating-scale',
        icon: 'fas fa-star',
        description: 'Bietet eine Skala zur Bewertung, ideal für Feedback oder Umfragen.',
        generalProperties: {
            id: 'bewertung_1',
            label: 'Bewertung',
            duplicate: true,
            delete: true,
        },
        specificProperties: {
            starCount: 5,
            defaultRating: 3,
        },
    },
    {
        id: 7,
        label: 'Datensatzauswahl',
        type: 'dataset-select',
        icon: 'fas fa-table',
        description: 'Ermöglicht die Auswahl eines Datensatzes aus einer hinterlegten Tabelle.',
        generalProperties: {
            id: 'datensatzauswahl_1',
            label: 'Datensatzauswahl',
            duplicate: true,
            delete: true,
        },
        specificProperties: {
            dataSource: 'Excel-Datei',
            searchFunction: true,
            filterOptions: [],
        },
    },
    {
        id: 8,
        label: 'Einfachauswahl',
        type: 'radio',
        icon: 'fas fa-check-circle',
        description: 'Lässt den Nutzer eine Option aus einer vorgegebenen Liste auswählen.',
        generalProperties: {
            id: 'einfachauswahl_1',
            label: 'Einfachauswahl',
            duplicate: true,
            delete: true,
        },
        specificProperties: {
            options: ['Option 1', 'Option 2', 'Option 3'],
            defaultOption: 'Option 1',
        },
    },
    {
        id: 9,
        label: 'Kontrollkästchen',
        type: 'checkbox',
        icon: 'fas fa-check-square',
        description: 'Fügt ein Kontrollkästchen hinzu, mit dem der Nutzer eine Auswahl bestätigen kann.',
        generalProperties: {
            id: 'kontrollkaestchen_1',
            label: 'Kontrollkästchen',
            duplicate: true,
            delete: true,
        },
        specificProperties: {
            defaultState: false,
        },
    },
    {
        id: 10,
        label: 'Mehrfachauswahl',
        type: 'multi-select',
        icon: 'fas fa-tasks',
        description: 'Erlaubt dem Nutzer, mehrere Optionen aus einer Liste auszuwählen.',
        generalProperties: {
            id: 'mehrfachauswahl_1',
            label: 'Mehrfachauswahl',
            duplicate: true,
            delete: true,
        },
        specificProperties: {
            options: ['Option 1', 'Option 2', 'Option 3'],
            defaultSelection: ['Option 1'],
        },
    },
    {
        id: 11,
        label: 'Code-Scanner',
        type: 'code-scanner',
        icon: 'fas fa-barcode',
        description: 'Ermöglicht das Scannen von Barcodes oder QR-Codes mit der Kamera des Geräts.',
        generalProperties: {
            id: 'code_scanner_1',
            label: 'Code-Scanner',
            duplicate: true,
            delete: true,
        },
        specificProperties: {
            scannerType: 'QR-Code', // Optionen: QR-Code, Barcode
            autoScan: true,
        },
    },
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
        },
        specificProperties: {
            format: 'datetime', // Optionen: datum, uhrzeit, beides
            minDate: '',
            maxDate: '',
            defaultValue: '',
        },
    },
    {
        id: 13,
        label: 'Dokument anhängen',
        type: 'file-upload',
        icon: 'fas fa-paperclip',
        description: 'Lässt den Nutzer ein Dokument hochladen und an das Formular anhängen.',
        generalProperties: {
            id: 'dokument_anhaengen_1',
            label: 'Dokument anhängen',
            duplicate: true,
            delete: true,
        },
        specificProperties: {
            allowedFileTypes: ['PDF', 'Word', 'Excel'],
            maxFileSize: '4MB',
        },
    },
    {
        id: 14,
        label: 'E-Mail Eingabefeld',
        type: 'email',
        icon: 'fas fa-envelope',
        description: 'Ermöglicht dem Nutzer, eine E-Mail-Adresse einzugeben. Die Eingabe wird auf Gültigkeit geprüft.',
        generalProperties: {
            id: 'email_1',
            label: 'E-Mail Eingabe',
            duplicate: true,
            delete: true,
        },
        specificProperties: {
            placeholder: 'E-Mail eingeben',
            validation: true,
        },
    },
    {
        id: 15,
        label: 'Foto aufnehmen',
        type: 'photo',
        icon: 'fas fa-camera',
        description: 'Der Nutzer kann ein Foto aufnehmen oder aus der Galerie auswählen.',
        generalProperties: {
            id: 'foto_1',
            label: 'Foto aufnehmen',
            duplicate: true,
            delete: true,
        },
        specificProperties: {
            imageSize: 'medium', // Optionen: klein, mittel, groß
            annotationTools: true,
        },
    },
    {
        id: 16,
        label: 'Positionsbestimmung',
        type: 'location',
        icon: 'fas fa-map-marker-alt',
        description: 'Ermöglicht dem Nutzer, seine aktuelle Position zu erfassen.',
        generalProperties: {
            id: 'position_1',
            label: 'Positionsbestimmung',
            duplicate: true,
            delete: true,
        },
        specificProperties: {
            accuracy: 'high', // Optionen: hoch, mittel, niedrig
            captureTimestamp: true,
        },
    },
    {
        id: 17,
        label: 'Skizze',
        type: 'drawing',
        icon: 'fas fa-pencil-alt',
        description: 'Ermöglicht es dem Nutzer, eine Skizze direkt auf dem Gerät zu erstellen.',
        generalProperties: {
            id: 'skizze_1',
            label: 'Skizze',
            duplicate: true,
            delete: true,
        },
        specificProperties: {
            backgroundImage: false,
            penColor: '#000000',
            penSize: 'medium',
        },
    },
    {
        id: 18,
        label: 'Texteingabefeld',
        type: 'textarea',
        icon: 'fas fa-keyboard',
        description: 'Lässt den Nutzer Text eingeben, z.B. für Kommentare oder Notizen.',
        generalProperties: {
            id: 'textfeld_1',
            label: 'Texteingabefeld',
            duplicate: true,
            delete: true,
        },
        specificProperties: {
            placeholder: 'Text eingeben...',
            maxCharacters: 500,
        },
    },
    {
        id: 19,
        label: 'Tonaufnahme',
        type: 'audio',
        icon: 'fas fa-microphone',
        description: 'Ermöglicht es dem Nutzer, eine Sprachnotiz aufzunehmen.',
        generalProperties: {
            id: 'tonaufnahme_1',
            label: 'Tonaufnahme',
            duplicate: true,
            delete: true,
        },
        specificProperties: {
            maxRecordingTime: 60, // in Sekunden
            quality: 'hoch', // Optionen: niedrig, mittel, hoch
        },
    },
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
        },
        specificProperties: {
            penColor: '#000000',
            fieldSize: 'medium', // Optionen: klein, mittel, groß
        },
    },
    {
        id: 21,
        label: 'Zahleneingabefeld',
        type: 'number',
        icon: 'fas fa-hashtag',
        description: 'Lässt den Nutzer eine Zahl eingeben. Der Wertebereich kann festgelegt werden.',
        generalProperties: {
            id: 'zahleneingabe_1',
            label: 'Zahleneingabefeld',
            duplicate: true,
            delete: true,
        },
        specificProperties: {
            minValue: 0,
            maxValue: 100,
            stepSize: 1,
        },
    },
    {
        id: 22,
        label: 'Zeitstempel',
        type: 'timestamp',
        icon: 'fas fa-clock',
        description: 'Erfasst den aktuellen Zeitpunkt, z.B. für Protokolle.',
        generalProperties: {
            id: 'zeitstempel_1',
            label: 'Zeitstempel',
            duplicate: true,
            delete: true,
        },
        specificProperties: {
            autoCapture: true,
        },
    },
    {
        id: 23,
        label: 'Textergebnis',
        type: 'text-result',
        icon: 'fas fa-font',
        description: 'Zeigt berechneten Text an, der nicht bearbeitet werden kann.',
        generalProperties: {
            id: 'textergebnis_1',
            label: 'Textergebnis',
            duplicate: true,
            delete: true,
        },
        specificProperties: {
            dataSource: 'Berechnungsformel',
        },
    },
    {
        id: 24,
        label: 'Zahlenergebnis',
        type: 'number-result',
        icon: 'fas fa-calculator',
        description: 'Zeigt eine berechnete Zahl an, die nicht bearbeitet werden kann.',
        generalProperties: {
            id: 'zahlenergebnis_1',
            label: 'Zahlenergebnis',
            duplicate: true,
            delete: true,
        },
        specificProperties: {
            calculationFormula: 'x + y',
        },
    },
    {
        id: 25,
        label: 'Zeitpunktergebnis',
        type: 'datetime-result',
        icon: 'fas fa-clock',
        description: 'Zeigt einen berechneten Zeitpunkt an, der nicht bearbeitet werden kann.',
        generalProperties: {
            id: 'zeitpunktergebnis_1',
            label: 'Zeitpunktergebnis',
            duplicate: true,
            delete: true,
        },
        specificProperties: {
            dataSource: 'Berechnungsformel',
        },
    },
    {
        id: 26,
        label: 'Zeitraumergebnis',
        type: 'duration-result',
        icon: 'fas fa-hourglass-half',
        description: 'Zeigt einen berechneten Zeitraum an, der nicht bearbeitet werden kann.',
        generalProperties: {
            id: 'zeitraumergebnis_1',
            label: 'Zeitraumergebnis',
            duplicate: true,
            delete: true,
        },
        specificProperties: {
            calculationFormula: 'Endzeit - Startzeit',
        },
    },
    {
        id: 27,
        label: 'E-Mail versenden',
        type: 'email-send',
        icon: 'fas fa-paper-plane',
        description: 'Ermöglicht das Versenden einer E-Mail beim Absenden des Formulars.',
        generalProperties: {
            id: 'email_send_1',
            label: 'E-Mail versenden',
            duplicate: true,
            delete: true,
        },
        specificProperties: {
            recipientAddresses: ['example@example.com'],
            subject: 'Betreff der E-Mail',
            message: 'Nachrichtentext',
        },
    },
    {
        id: 28,
        label: 'Abschnitt',
        type: 'section',
        icon: 'fas fa-folder-open',
        description: 'Hilft, das Formular in logische Abschnitte zu unterteilen.',
        generalProperties: {
            id: 'abschnitt_1',
            label: 'Abschnitt',
            duplicate: true,
            delete: true,
        },
        specificProperties: {
            sectionStyle: 'default', // Optionen: default, custom
            allowNestedElements: true,
        },
    },
    {
        id: 29,
        label: 'Gruppe',
        type: 'group',
        icon: 'fas fa-object-group',
        description: 'Gruppiert mehrere Bausteine, um sie gemeinsam zu verwalten.',
        generalProperties: {
            id: 'gruppe_1',
            label: 'Gruppe',
            duplicate: true,
            delete: true,
        },
        specificProperties: {
            activationRules: 'always', // Optionen: always, conditional
            groupDisplay: 'expanded', // Optionen: expanded, collapsed
        },
    },
    {
        id: 30,
        label: 'Wiederholungsgruppe',
        type: 'repeat-group',
        icon: 'fas fa-redo',
        description: 'Ermöglicht das Wiederholen eines bestimmten Formularteils, um mehrere Einträge zu erfassen.',
        generalProperties: {
            id: 'wiederholungsgruppe_1',
            label: 'Wiederholungsgruppe',
            duplicate: true,
            delete: true,
        },
        specificProperties: {
            maxRepetitions: 5,
            allowNewEntries: true,
        },
    },
];

export default formElements;