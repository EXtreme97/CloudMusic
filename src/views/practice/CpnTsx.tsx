import { defineComponent } from "vue";
export default defineComponent({
  props: {
    message: {
      type: String,
    },
  },
  setup(props) {
    return () => <h2>{props.message} from child component(tsx)</h2>;
  },
});
