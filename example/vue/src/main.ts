import { createApp, } from "vue"
import "./style.css"
import "reset-css"
import "primevue/resources/primevue.min.css"
import "primevue/resources/themes/md-light-deeppurple/theme.css"
import "primeicons/primeicons.css"
import PrimeVue from "primevue/config"
import App from "./App.vue"

createApp(App)
    .use(PrimeVue)
    .mount("#app")
