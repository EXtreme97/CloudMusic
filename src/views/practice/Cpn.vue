<template>
  <h2>{{ props.message }} from child component(option api)</h2>
</template>

<script lang="ts">
export default {
  props: {
    message: {
      type: String,
    },
  },
  setup(props: any) {
    console.log(props);

    return {
      props,
    };
  },
};
</script>

<style lang="less" scoped></style>
