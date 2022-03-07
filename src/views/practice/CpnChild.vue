<template>
  <h2>{{ message }} from child component(setup)</h2>
  <a-button type="primary" @click="handleClick">emit</a-button>
</template>

<script setup lang="ts">
const props = defineProps({
  message: String,
});
const emit = defineEmits(["emitTest"]);
const handleClick = () => {
  emit("emitTest", "emit test success");
};
</script>

<style lang="less" scoped></style>
