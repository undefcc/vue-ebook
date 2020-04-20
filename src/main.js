import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
// import VConsole from 'vconsole'
import i18n from './lang'
// import './mock'
import './utils/create-api'
import './assets/styles/icon.css'
import './assets/fonts/daysOne.css'
import './assets/styles/global.scss'
import './utils/boost'

/* eslint-disable no-new */
// new VConsole()

Vue.config.productionTip = false

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')
