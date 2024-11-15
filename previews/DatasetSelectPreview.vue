<template>
  <div class="dataset-select-preview">
    <label class="dataset-label">{{ item.label || 'Datensatzauswahl' }}</label>
    <select v-model="selectedOption" class="dataset-select">
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      selectedOption: this.item.specificProperties.initialValue || '', // Standardwert
    };
  },
  computed: {
    options() {
      // Optionen entweder aus specificProperties laden oder einen Standard-Datensatz verwenden
      return this.item.specificProperties.options || [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' }
      ];
    }
  },
  watch: {
    // Beobachtet Änderungen am initialValue und aktualisiert die Auswahl entsprechend
    "item.specificProperties.initialValue": function (newVal) {
      this.selectedOption = newVal || '';
    }
  }
};
</script>

<style scoped>
.dataset-select-preview {
  display: flex;
  flex-direction: column;
}

.dataset-label {
  font-weight: bold;
  margin-bottom: 5px;
}

.dataset-select {
  padding: 5px;
  font-size: 14px;
}
</style>
