import { createApp, createVNode } from "vue";
import App from "./App.vue";

import router from "./router";
import store from "./store";

import Antd from "ant-design-vue";
import "ant-design-vue/dist/antd.css";
import "normalize.css";
import "./assets/less/app.less";

const app = createApp(App);
app.use(router).use(store).use(Antd).mount("#app");
