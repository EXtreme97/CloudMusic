import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import Antd from "ant-design-vue";
import "ant-design-vue/dist/antd.css";
import * as Icons from "@ant-design/icons-vue";

const app = createApp(App);
app.use(router).use(store).use(Antd).mount("#app");

const icons: any = Icons;
for (const icon in icons) {
  app.component(icon, icons[icon]);
}
