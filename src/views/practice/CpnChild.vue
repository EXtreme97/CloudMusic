<template>
  <h2>{{ message }} from child component(setup)</h2>
  <a-button type="primary" @click="handleClick">emit</a-button>
  <Cpn></Cpn>
</template>

<script setup lang="ts">
import Cpn from "./Cpn.vue";
const props = defineProps({
  message: String,
});
const emit = defineEmits(["emitTest"]);
const handleClick = () => {
  emit("emitTest", "emit test success");
};
</script>

<style lang="less" scoped></style>
