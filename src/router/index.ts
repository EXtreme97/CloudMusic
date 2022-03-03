import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "home",
    component: () => import("../views/practice/Test"),
  },
  {
    path: "/index",
    name: "index",
    component: () => import("../views/browser/Browser.vue"),
  },
  {
    path: "/mobile",
    name: "mobile",
    component: () => import("../views/mobile/Mobile.vue"),
  },
];
const router = createRouter({
  history: createWebHashHistory(),
  routes,
});
export default router;
