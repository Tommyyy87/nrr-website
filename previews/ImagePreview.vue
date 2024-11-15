<template>
  <div class="image-preview">
    <img
      :src="item.specificProperties.uploadImage"
      :alt="item.specificProperties.title || 'Bild'"
      :style="imageStyle"
      :class="alignmentClass"
    />
    <div v-if="item.specificProperties.title" class="image-title">{{ item.specificProperties.title }}</div>
    <div v-if="item.specificProperties.caption" class="image-caption">{{ item.specificProperties.caption }}</div>
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
  computed: {
    imageStyle() {
      return {
        width: this.item.specificProperties.width || '100%',
        height: this.item.specificProperties.proportionLocked
          ? 'auto'
          : (this.item.specificProperties.height || 'auto')
      };
    },
    alignmentClass() {
      const alignment = this.item.specificProperties.alignment;
      return {
        'align-left': alignment === 'left',
        'align-center': alignment === 'center',
        'align-right': alignment === 'right'
      };
    }
  }
};
</script>

<style scoped>
.image-preview {
  text-align: center;
}

.image-title {
  font-weight: bold;
  margin-top: 5px;
}

.image-caption {
  font-style: italic;
  margin-top: 2px;
  color: #666;
}

/* Alignment-Klassen für Bildpositionierung */
.align-left {
  display: block;
  margin-right: auto;
  margin-left: 0;
}

.align-center {
  display: block;
  margin-left: auto;
  margin-right: auto;
}

.align-right {
  display: block;
  margin-left: auto;
  margin-right: 0;
}
</style>
