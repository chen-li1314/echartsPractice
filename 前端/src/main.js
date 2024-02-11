import { createApp } from 'vue'
import App from './App.vue'
import '@/assets/css/global.scss'
import {router} from '@/router' 
import * as echarts from 'echarts'
import { newTheme } from './assets/theme/new'
import { whiteTheme } from './assets/theme/white'
import '@/assets/font/iconfont.css'
import { createPinia } from 'pinia'

window.echarts=echarts
echarts.registerTheme('newTheme',newTheme)
echarts.registerTheme('whiteTheme',whiteTheme)
const pinia = createPinia()
const app = createApp(App)
app.use(pinia)
app.use(router)
app.mount('#app')