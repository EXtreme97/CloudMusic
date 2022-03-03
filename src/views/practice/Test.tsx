import { defineComponent, ref } from "vue";
import "../../assets/less/Home.less";
import { createFromIconfontCN } from "@ant-design/icons-vue";

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

        <ul>{moviesList}</ul>
      </div>
    );
  },
});