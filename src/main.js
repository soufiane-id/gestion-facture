// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'core-js/es6/promise'
import 'core-js/es6/string'
import 'core-js/es7/array'
// import cssVars from 'css-vars-ponyfill'
import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue';
import Loading from 'vue-loading-overlay';
// Import stylesheet
import 'vue-loading-overlay/dist/vue-loading.css';
import App from './App'
import router from './router'
import vueXlsxTable from 'vue-xlsx-table'
import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.css'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { store } from './store/store'

import lodash from 'lodash'
Object.defineProperty(Vue.prototype, '$_', { value : lodash })

export const refreshOperationsEventBus = new Vue();

Vue.use(BootstrapVue, VueMaterial)
Vue.use(Loading)
//Vue.use(vueXlsxTable, {rABS: false}) //Browser FileReader API have two methods to read local file readAsBinaryString and readAsArrayBuffer, default rABS false

library.add(fas)
Vue.component('font-awesome-icon', FontAwesomeIcon)  // Voir s il n est pas judicieux de declarer ce componenent locallement !!!


/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: {
    App
  }
})
