import axiosUtil from '../utils/axios'
import {URL} from "../../api/urlsConfig"

import {
  SET_BASE_DATA,
} from './mutation-type.js'


export default {
   getDatasourceList({commit,state},newData){
     commit("SET_BASE_DATA",newData)
  }
}
