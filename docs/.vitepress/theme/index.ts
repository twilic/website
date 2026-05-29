import { h } from "vue";
import DefaultTheme from "vitepress/theme";
import HomeFeatures from "./HomeFeatures.vue";
import HeroCode from "./HeroCode.vue";
import "./custom.css";

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      "home-hero-image": () => h(HeroCode),
      "home-features-before": () => h(HomeFeatures),
    });
  },
};
