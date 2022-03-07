<template>
  <h2>{{ props.message }} from child component(option api)</h2>
  <h2>{{ count }}</h2>
</template>

<script lang="ts">
import { inject } from "vue";
export default {
  props: {
    message: {
      type: String,
    },
  },
  setup(props: any) {
    console.log(props);
    const count = inject("count");

    return {
      props,
      count,
    };
  },
};
</script>

<style lang="less" scoped></style>
