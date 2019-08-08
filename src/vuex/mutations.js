
import {
  SET_BASE_DATA,
} from './mutation-type.js'

export default {
  [SET_BASE_DATA](state,data){
    if (!!data) {
      state.dataSourceList = data
    }
  },
  showAddScenicModal(state,data){
    state.addScenicModal = data;
  },
  setLogoutState(state, data) {
    state.isLogout = data
  },
  showPreviewReportModal(state,data){
    state.previewReportModal = data;
  },
  showReportConditionModal(state,data){
    state.reportCondition=data;
  },
}
