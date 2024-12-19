// Das ist die App.js:

import formElements from './form-elements.js';

export default {
    template: `
    <div class="app-container">
        <header>
            <h1>Formular Erstellung</h1>
            <div class="header-buttons">
                <button class="undo-button"><i class="fas fa-undo"></i> Rückgängig</button>
                <button class="redo-button"><i class="fas fa-redo"></i> Wiederholen</button>
                <button class="save-button"><i class="fas fa-save"></i> Speichern</button>
                <button class="preview-button"><i class="fas fa-eye"></i> Vorschau</button>
                <button class="back-button"><i class="fas fa-arrow-left"></i> Zurück</button>
            </div>
        </header>
        <main>
            <section id="form-builder">
                <div id="form-elements">
                    <h2>Bausteine</h2>
                    <ul>
                        <li v-for="element in elements" :key="element.id" @dragstart="startDrag(element, $event)" draggable="true">
                            <i :class="element.icon"></i> {{ element.label }}
                            <button @click="showDescription(element)">?</button>
                        </li>
                    </ul>
                </div>
                <div id="form-preview" @drop="drop($event)" @dragover.prevent="onDragOver($event)">
                    <h2>Vorschau</h2>
                    <div v-for="(item, index) in formElements" :key="item.id" class="form-element"
                         @click="selectElement(item)" 
                         @dragstart="startReorderDrag(index, $event)" 
                         draggable="true" 
                         @dragover.prevent="onDragOver($event, index)" 
                         @drop="reorderDrop($event, index)">

                        <div v-if="index === placeholderIndex" class="drop-indicator"></div>
                        
                        <label>{{ item.label }}</label>
                        <component v-if="item.type !== 'section'" :is="item.type"></component>
                        <div v-if="item.type === 'section'" class="section-container">
                            <h3>{{ item.label }}</h3>
                            <div class="section-content" @drop="dropInSection(index, $event)" @dragover.prevent>
                                <div v-for="(sectionItem, sectionIndex) in item.children" :key="sectionItem.id" class="form-element">
                                    <label>{{ sectionItem.label }}</label>
                                    <component :is="sectionItem.type"></component>
                                    <button @click="removeSectionElement(index, sectionIndex)">Löschen</button>
                                </div>
                            </div>
                        </div>
                        <button @click="removeElement(index)">Löschen</button>
                    </div>

                    <div v-if="formElements.length === placeholderIndex" class="drop-indicator"></div>
                </div>
                <aside id="properties">
                    <h2>Eigenschaften</h2>
                    <div v-if="selectedElement">
                        <div class="properties-section">
                            <h3>Allgemeine Eigenschaften</h3>
                            <div class="property">
                                <label for="label">Beschriftung:</label>
                                <input type="text" v-model="selectedElement.generalProperties.label" id="label" />
                            </div>
                        </div>
                        <div v-if="selectedElement.specificProperties" class="properties-section">
                            <h3>Spezifische Eigenschaften</h3>
                            <div v-for="(value, key) in selectedElement.specificProperties" :key="key" class="property">
                                <label :for="key">{{ key }}:</label>
                                <input type="text" v-model="selectedElement.specificProperties[key]" :id="key" />
                            </div>
                        </div>
                        <div class="properties-buttons">
                            <button @click="duplicateElement" class="duplicate-button">
                                <i class="fas fa-copy"></i> Duplizieren
                            </button>
                            <button @click="removeElement(selectedElement.id)" class="delete-button">
                                <i class="fas fa-trash"></i> Löschen
                            </button>
                        </div>
                    </div>
                    <p v-else>Kein Element ausgewählt</p>
                </aside>
            </section>
        </main>
    </div>
    `,
    data() {
        return {
            elements: formElements,
            formElements: [],
            selectedElement: null,
            draggedElement: null,
            draggedIndex: null,
            placeholderIndex: null
        };
    },
    methods: {
        saveForm() { console.log("Formular speichern", this.formElements); },
        previewForm() { console.log("Formularvorschau", this.formElements); },
        goBackToFormManagement() { console.log("Zurück zur Formularverwaltung"); },
        selectElement(element) { this.selectedElement = element; },
        removeElement(index) { if (index >= 0) { this.formElements.splice(index, 1); this.selectedElement = null; } },
        removeSectionElement(sectionIndex, elementIndex) {
            if (this.formElements[sectionIndex] && this.formElements[sectionIndex].children) {
                this.formElements[sectionIndex].children.splice(elementIndex, 1);
            }
        },
        startDrag(element, event) { this.draggedElement = { ...element }; this.draggedIndex = -1; event.dataTransfer.setData('text/plain', element.id); },
        startReorderDrag(index, event) { this.draggedIndex = index; this.draggedElement = { ...this.formElements[index] }; event.dataTransfer.setData('text/plain', this.formElements[index].id); },
        drop(event) { if (this.draggedElement && this.placeholderIndex !== null) { const newElement = { ...this.draggedElement, id: Date.now() }; this.formElements.splice(this.placeholderIndex, 0, newElement); this.resetDragState(); } },
        reorderDrop(event, index) { if (this.draggedIndex !== null) { const element = this.formElements.splice(this.draggedIndex, 1)[0]; this.formElements.splice(this.placeholderIndex, 0, element); this.resetDragState(); } },
        onDragOver(event, index = null) { event.preventDefault(); this.placeholderIndex = index !== null ? index : this.formElements.length; },
        resetDragState() { this.draggedElement = null; this.draggedIndex = null; this.placeholderIndex = null; },
        showDescription(element) { alert(element.description); },
        duplicateElement() { if (this.selectedElement) { const duplicate = JSON.parse(JSON.stringify(this.selectedElement)); duplicate.id = Date.now(); const index = this.formElements.indexOf(this.selectedElement); this.formElements.splice(index + 1, 0, duplicate); } }
    }
};
