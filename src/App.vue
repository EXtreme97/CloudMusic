<template>
  <a-layout>
    <a-layout-header>
      <h1 class="logo"><a href="#"></a></h1>
      <div class="search">
        <a-button danger shape="circle">
          <template #icon>
            <LeftOutlined style="color: #fff" />
          </template>
        </a-button>
        <a-button danger shape="circle">
          <template #icon>
            <RightOutlined style="color: #fff" />
          </template>
        </a-button>
        <a-input>
          <template #prefix>
            <SearchOutlined type="user" />
          </template>
        </a-input>
        <a-button danger shape="circle">
          <template #icon>
            <AudioOutlined style="color: #fff" />
          </template>
        </a-button>
      </div>
      <div class="tools">
        <a-avatar size="small">
          <template #icon><UserOutlined /></template>
        </a-avatar>
        <a-button type="text" danger shape="circle" size="large">
          <template #icon>
            <IconFont type="icon-clothes" style="color: #fff" />
          </template>
        </a-button>
        <a-button type="text" danger shape="circle" size="large">
          <template #icon>
            <SettingOutlined style="color: #fff" />
          </template>
        </a-button>
        <a-button type="text" danger shape="circle" size="large">
          <template #icon>
            <MailOutlined style="color: #fff" />
          </template>
        </a-button>
        <a-button type="text" danger shape="circle" size="large">
          <template #icon>
            <IconFont type="icon-chuangkouhua-01" style="color: #fff" />
          </template>
        </a-button>
        <a-button type="text" danger shape="circle" size="large">
          <template #icon>
            <MinusOutlined style="color: #fff" />
          </template>
        </a-button>
        <a-button type="text" danger shape="circle" size="large">
          <template #icon>
            <IconFont type="icon-chuangkouhua-02" style="color: #fff" />
          </template>
        </a-button>
        <a-button type="text" danger shape="circle" size="large">
          <template #icon>
            <CloseOutlined style="color: #fff" />
          </template>
        </a-button>
      </div>
    </a-layout-header>
    <a-layout>
      <a-layout-sider theme="light">Sider</a-layout-sider>
      <a-layout-content><router-view></router-view></a-layout-content>
    </a-layout>
    <a-layout-footer></a-layout-footer>
  </a-layout>
</template>
<script setup lang="ts">
import {
  RightOutlined,
  LeftOutlined,
  AudioOutlined,
  UserOutlined,
  SettingOutlined,
  MailOutlined,
  CloseOutlined,
  MinusOutlined,
  SearchOutlined,
  createFromIconfontCN,
} from "@ant-design/icons-vue";

const IconFont = createFromIconfontCN({
  scriptUrl: "//at.alicdn.com/t/font_3186649_76j8ysez5e2.js",
});
</script>
<style lang="less" scoped>
#app {
  .ant-layout {
    height: 100%;
    .ant-layout-header {
      display: flex;
      background-color: #ec4141;
      .logo {
        margin: 0;
        width: 180px;
        background: url("./assets/img/topbar.png") no-repeat 0 -5px;
        a {
          float: left;
          width: 157px;
          height: 100%;
          padding-right: 20px;
          text-indent: -9999px;
        }
      }
      .search {
        display: flex;
        align-items: center;
        .ant-input-affix-wrapper {
          border-radius: 22px;
        }

        .ant-btn {
          background-color: #d93b3b;
          margin: 0 3px;
        }
      }
      .tools {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        flex: 1;

        .ant-btn {
          margin: 0 3px;
        }
      }
    }
  }
}
</style>
