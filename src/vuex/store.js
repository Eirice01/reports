import Vue from 'vue'
import Vuex from 'vuex'
import actions from './actions'
import getters from './getters'
import mutations from './mutations'

Vue.use(Vuex);

// 应用初始状态
const state = {
    addScenicModal:false,
    previewReportModal:false,
    isLogout:false,
    reportCondition:false


};
// 创建 store 实例
export default new Vuex.Store({
  actions,
  state,
  getters,
  mutations
})

/**
 *  使用方法:本vuex将 action 和 getter 分离至 actions.js 和 getter.js中
 *  this.$store.commit('changeLoginStatus',true)
 *  this.$store.dispatch('addSex',data)
 * */
