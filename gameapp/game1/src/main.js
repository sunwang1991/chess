import { createSSRApp } from 'vue'
import App from './App.vue'
import * as Pinia from 'pinia'
import plugins from './plugins' // plugins

export function createApp() {
  const app = createSSRApp(App)
  app.use(Pinia.createPinia())
  app.use(plugins)
  return {
    app,
    Pinia,
  }
}
