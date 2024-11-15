<template>
  <div class="rating-scale-preview">
    <label class="rating-label">{{ item.label || 'Bewertungsskala' }}</label>
    <input
      type="range"
      :min="item.specificProperties.minValue || 1"
      :max="item.specificProperties.maxValue || 5"
      :step="item.specificProperties.step || 1"
      v-model="currentValue"
      class="rating-slider"
    />
    <span class="rating-value">{{ currentValue }}</span>
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
      currentValue: this.item.specificProperties.initialValue || (this.item.specificProperties.minValue || 1)
    };
  },
  watch: {
    // Wenn die spezifischen Eigenschaften des Elements aktualisiert werden, setze den aktuellen Wert neu
    "item.specificProperties.initialValue": function (newVal) {
      this.currentValue = newVal || this.item.specificProperties.minValue || 1;
    }
  }
};
</script>

<style scoped>
.rating-scale-preview {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rating-label {
  font-weight: bold;
  margin-right: 10px;
}

.rating-slider {
  flex: 1;
}

.rating-value {
  font-weight: bold;
  color: #007bff;
}
</style>
