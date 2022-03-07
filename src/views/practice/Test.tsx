import { defineComponent, provide, readonly, ref } from "vue";
import "../../assets/less/Home.less";

import CpnChild from "./CpnChild.vue";
import Cpn from "./Cpn.vue";
import CpnTsx from "./CpnTsx";

export default defineComponent({
  name: "home-component",
  props: {
    movies: {
      type: Array,
      default: ["一一", "牯岭街少年杀人事件", "霸王别姬"],
    },
  },
  setup(props) {
    const moviesList = props.movies.map((movie) => <li>{movie}</li>);
    const count = ref(0);
    const emitTest = (value: any) => {
      console.log(value);
    };
    provide("count", count);
    return () => (
      <div class={"home"}>
        <a-button
          type="primary"
          onClick={() => {
            count.value++;
          }}
        >
          count is:{count.value}
        </a-button>
        <Cpn message="hello"></Cpn>
        <CpnChild message="hello"></CpnChild>
        <CpnTsx message="hello"></CpnTsx>
        <ul>{moviesList}</ul>
      </div>
    );
  },
});
