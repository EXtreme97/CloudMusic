import {
  defineComponent,
  inject,
  ref,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onUnmounted,
  onRenderTriggered,
  onActivated,
  onDeactivated,
  onRenderTracked,
  onErrorCaptured,
  onBeforeMount,
  onBeforeUnmount,
} from "vue";
import { onBeforeRouteUpdate } from "vue-router";
import Logo from "../../assets/img/logo.svg";
export default defineComponent({
  name: "cpntsx",
  props: {
    message: {
      type: String,
    },
  },
  setup(props) {
    const text = ref("please input ...");
    const visible = ref(true);
    const rootRef = ref(null);

    setInterval(() => {
      // visible.value = !visible.value;
    }, 1000);

    const change = (event: any, value: any) => {
      text.value = "切换";
      console.log(event, value, slots);
    };

    const slots = {
      default: () => <>default slots</>,
      bar: () => <>bar slots</>,
    }; //定义插槽

    onBeforeMount(() => {
      console.log("before Mount");
    });
    onMounted(() => {
      console.log("before Mount", rootRef);
    });
    onBeforeUpdate(() => {});
    onUpdated(() => {});
    onBeforeUnmount(() => {});
    onUnmounted(() => {});
    onErrorCaptured(() => {});
    onRenderTriggered(() => {});
    onRenderTracked(() => {});
    onActivated(() => {});
    onDeactivated(() => {});

    const count = inject("count");
    return () => (
      <>
        {/* v-model的用法 */}
        <input v-model={text.value} type="text" />
        {/* v-bind、内联样式 */}
        <img style={{ width: "100px" }} src={Logo} alt={text.value} />
        {/* v-text */}
        <h2 ref={rootRef} v-text={text.value}></h2>
        {/* v-show和v-html */}
        <h2 v-show={visible.value} v-html={text.value}></h2>
        <h2>{props.message} from child component(tsx)</h2>
        {/* 事件监听 */}
        <a-button onClick={(event: any) => change(event, "click")}>
          change
        </a-button>
        <br />
        {/* 插槽 */}
        <h2>{slots.bar()}</h2>
        <h2>{slots.bar ? slots.bar() : slots.default()}</h2>
      </>
    );
  },
});
