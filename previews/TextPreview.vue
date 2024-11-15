<template>
  <div :style="textStyle">
    {{ renderTextWithPlaceholders(item.specificProperties.content) }}
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
    textStyle() {
      return {
        fontSize: this.getFontSize(this.item.specificProperties.textSize),
        fontWeight: this.item.specificProperties.format === 'bold' ? 'bold' : 'normal',
        fontStyle: this.item.specificProperties.format === 'italic' ? 'italic' : 'normal',
        color: this.item.specificProperties.textColor || 'black'
      };
    }
  },
  methods: {
    getFontSize(size) {
      // Passt die Schriftgröße an die Größe an, die in den spezifischen Eigenschaften des Elements festgelegt ist.
      return size === 'small' ? '12px' : size === 'large' ? '24px' : '16px';
    },
    renderTextWithPlaceholders(content) {
      // Ersetzt Platzhalter im Text mit Benutzerinformationen, falls vorhanden.
      if (!content) return '';
      return content.replace(/{{(.*?)}}/g, (match, p1) => {
        // Hier wird auf "this.$root.user" zugegriffen, wenn der Benutzer in der Haupt-App-Komponente gespeichert ist.
        return this.$root.user?.[p1.trim()] || '---';
      });
    }
  }
};
</script>

<style scoped>
/* Falls zusätzliche Stile für den Text-Baustein benötigt werden */
</style>
