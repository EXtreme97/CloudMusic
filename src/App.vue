<template>
  <a-layout>
    <a-layout-header>Header</a-layout-header>
    <a-layout>
      <a-layout-sider theme="light">Sider</a-layout-sider>
      <a-layout-content><router-view></router-view></a-layout-content>
    </a-layout>
  </a-layout>
</template>
<script setup lang="ts"></script>
<style lang="less" scoped>
#app {
  .ant-layout {
    height: 100%;
  }
}
</style>
