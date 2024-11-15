<template>
  <div class="default-preview">
    <p class="default-label">Baustein: {{ item.label || 'Unbenannter Baustein' }}</p>
    <p class="default-id">ID: {{ item.id }}</p>
    <p class="default-message">Vorschau nicht verfügbar</p>
  </div>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      required: true
    }
  }
};
</script>

<style scoped>
.default-preview {
  border: 1px dashed #ccc;
  padding: 10px;
  background-color: #f9f9f9;
  text-align: center;
  color: #666;
}

.default-label {
  font-weight: bold;
  margin-bottom: 5px;
}

.default-id {
  font-size: 12px;
  color: #999;
}

.default-message {
  font-style: italic;
  margin-top: 10px;
}
</style>
