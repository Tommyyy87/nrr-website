// js/form-view.js

document.addEventListener("DOMContentLoaded", function () {
    const app = new Vue({
        el: '#app',
        data: {
            formName: 'Lade Formular...',
            formElements: [],
            userData: {},  // Speichert Benutzerdaten wie Vorname, Nachname
            notification: {
                message: '',
                type: '',
                visible: false,
            },
        },
        methods: {
            async loadForm() {
                auth.onAuthStateChanged(async (user) => {
                    if (user) {
                        try {
                            const urlParams = new URLSearchParams(window.location.search);
                            const formId = urlParams.get('formId');

                            if (!formId) throw new Error("Keine Formular-ID gefunden.");

                            console.log("Lade Formular für ID:", formId);

                            const formDoc = await db.collection('forms').doc(formId).get();

                            if (formDoc.exists) {
                                const formData = formDoc.data();
                                this.formName = formData.name;
                                this.formElements = formData.elements || [];

                                // Lade Benutzerdaten aus der Datenbank
                                await this.loadUserData(user.uid);
                            } else {
                                this.showNotification("Formular nicht gefunden.", "error");
                            }
                        } catch (error) {
                            console.error("Fehler beim Laden des Formulars:", error);
                            this.showNotification("Fehler beim Laden des Formulars. Bitte versuchen Sie es erneut.", "error");
                        }
                    } else {
                        window.location.href = "index.html";
                    }
                });
            },
            async loadUserData(userId) {
                try {
                    const userDoc = await db.collection('users').doc(userId).get();
                    if (userDoc.exists) {
                        this.userData = userDoc.data();
                    } else {
                        console.warn("Benutzerdaten nicht gefunden.");
                    }
                } catch (error) {
                    console.error("Fehler beim Laden der Benutzerdaten:", error);
                }
            },
            getRenderedValue(element) {
                // Funktion zur Rückgabe des gerenderten Werts basierend auf den ausgewählten Eigenschaften
                const field = element.specificProperties.datasetField;
                const title = element.specificProperties.title || '';
                const alignment = element.specificProperties.alignment || 'left';
                const fontSize = element.specificProperties.fontSize || 'medium';
                const fontFamily = element.specificProperties.fontFamily || 'Arial';
                const value = this.userData[field] || "Daten nicht verfügbar";

                return {
                    text: `${title} ${value}`,
                    style: {
                        textAlign: alignment,
                        fontSize: fontSize === 'small' ? '12px' : fontSize === 'medium' ? '16px' : '20px',
                        fontFamily: fontFamily,
                        fontWeight: 'bold'
                    }
                };
            },
            showNotification(message, type) {
                this.notification.message = message;
                this.notification.type = type;
                this.notification.visible = true;

                setTimeout(() => {
                    this.notification.visible = false;
                }, 3000);
            },
        },
        mounted() {
            this.loadForm();
        },
    });
});
