import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Styles
import './styles/variables.css'
import './styles/base.css'
import './styles/components.css'
import './styles/responsive.css'

const app = createApp(App)
app.use(router)
app.mount('#app')
