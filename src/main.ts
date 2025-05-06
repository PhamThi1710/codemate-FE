/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from "@/plugins";
import '@mdi/font/css/materialdesignicons.css';
// Components
import App from "./App.vue";

// Composables
import { createApp } from "vue";

//import settings.scss from styles
import "@/global.css";
import ApiService, { startExpirationTimer } from "./common/api.service";
import { createPinia } from "pinia";
import vue3GoogleLogin from "vue3-google-login";
import piniaPluginPersistedstate, {createPersistedState} from "pinia-plugin-persistedstate";
import VueApexCharts from "vue3-apexcharts"; // Import ApexCharts
ApiService.init();
startExpirationTimer();
const app = createApp(App);
app.use(VueApexCharts); // Use ApexCharts plugin

app.component('apexchart', VueApexCharts)
app.use(vue3GoogleLogin, {
  clientId: import.meta.env.VITE_APP_CLIENT_ID,
});

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
pinia.use(createPersistedState())
registerPlugins(app);

app.mount("#app");
