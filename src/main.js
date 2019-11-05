// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import VueI18n from 'vue-i18n'
import permission,{router} from './router/index'
// import {router} from './router'
import axiosUtil from './utils/axios'
import Echarts from 'echarts'
import iView from 'iview'
import 'iview/dist/styles/iview.css'
import './theme/common.less'
import './assets/iconfont/iconfont.css'
import '../static/map/china'
import '../static/map/world'
import cascaderMulti from "cascader-multi"
import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/default.css'
// vuex
import store from './vuex/store'
import * as _ from "lodash"

Vue.config.productionTip = false;

Vue.use(VueI18n);
Vue.use(Echarts);
Vue.use(iView);
Vue.use(cascaderMulti);

// axiosUtil.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
const aa = [];
const area_Code = [];
const area_Name = [];
Vue.prototype.$echarts = Echarts;
Vue.prototype.$http = axiosUtil;
Vue.prototype.$perms = permission;
Vue.prototype.$aa = aa;
Vue.prototype.$area_Code = area_Code;
Vue.prototype.$area_Name = area_Name;

aa.push("0");
const i18n = new VueI18n({
	locale: 'en-US',    // 语言标识
	//this.$i18n.locale // 通过切换locale的值来实现语言切换
	messages: {
		'zh-CN': require('./assets/lang/zh'),   // 中文语言包
		'en-US': require('./assets/lang/en')    // 英文语言包
	}
});
Vue.component('VueSlider', VueSlider)
/* eslint-disable no-new */
new Vue({
	el: '#app',
	i18n,
	router,
  store,
  aa,
  area_Code,
  area_Name,
	render: h => h(App)
});

