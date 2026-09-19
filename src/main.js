import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'

async function bootstrap() {
  const app = createApp(App)

  const currency = new URL(window.location.href).searchParams.get('currency')

  if (currency !== 'VND') {
    const [{ createPinia }, { i18n }] = await Promise.all([
      import('pinia'),
      import('./i18n'),
    ])

    app.use(createPinia())
    app.use(i18n)
  }

  app.mount('#app')
}

bootstrap()
