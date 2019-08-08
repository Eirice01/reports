import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/pages/Home'
import Axios from '@/utils/axios'
import {URL} from "../../api/urlsConfig";
Vue.use(Router);

//路由权限设置由静态作为根目录查询，匹配权限路由
const static_routers=[
      {
        path:'Population',
        name:'population',
        component: () => import("@/pages/population/Population"),
      },
      {
        path:'DayPermanent',
        name: 'dayPermanent',
        component: () => import("@/pages/population/behavior/DayPermanent")
      },
      {
        path:'NightPermanent',
        name: 'nightPermanent',
        component: () => import("@/pages/population/behavior/NightPermanent")
      },
      {
        path:'OriginPlace',
        name: 'originPlace',
        component: () => import("@/pages/population/popComposition/OriginPlace")
      },
      {
        path:'QcellCore',
        name: 'qcellCore',
        component: () => import("@/pages/population/popComposition/QcellCore")
      },
      {
        path:'OriginHotMap',
        name: 'originhotmap',
        component: () => import("@/pages/population/popHotMap/OriginPlaceHotMap")
      },
      {
        path:'QcellHotMap',
        name: 'qcellHotMap',
        component: () => import("@/pages/population/popHotMap/QcellCoreHotMap")
      },
      {
        path:'EchartsOriginPlace',
        name:'echartsoriginplace',
        component:()=> import("@/pages/population/OriginAndQcell/EchartsOriginPlace")
      },
      {
        path:'EchartsQcellPlace',
        name:'echartsqcellplace',
        component:()=> import("@/pages/population/OriginAndQcell/EchartsQcellPlace")
      },
      {
        path:'Tour',
        name: 'tour',
        component: () => import("@/pages/tour/Tour")
      },
      {
        path:'Contrast',
        name: 'contrast',
        component: () => import("@/pages/contrast/Contrast"),
      },
      {
        path:'Report',
        name: 'report',
        component: () => import("@/pages/report/Report")
      },
      {
        path:'ClipBoard',
        name: 'clipboard',
        component: () => import("@/pages/clipboard/ClipBoard")
      },
      {
        path:'ScenicArea',
        name: 'scenicArea',
        component: () => import("@/pages/system/ScenicArea")
      },
      {
        path:'KeyPeople',
        name: 'keyPeople',
        component: () => import("@/pages/system/KeyPeople")
      },
      {
        path:'Management',
        name:'management',
        component: () => import("@/pages/system/management/RightsManagement")
      },

]


var keyList=[];
var pathList=[];
let router = new Router({
  routes: [
    {
      path:'/',
      component:Home,
      children:static_routers
    }
  ]

});
router.beforeEach((to,form,next)=>{
  next();
  Axios.request({
    method: 'get',
    url:URL.getLoginUserName,
    success: (data) => {
      if(data.code == 200) {
        let res = data.data;
        keyList=res.keyList;
        pathList=res.pathList;
        if(pathList[0]=='Population'&&to.path=='/'){
          next({path:'/Population',query:{istype:'pops'}})
        }else if(pathList[0]=='Tour'&&to.path=='/'){
          next({path:'/Tour',query:{isType:'tours'}})
        }
      }
    },
    error: (data) => {
      this.$Message.warning('获取失败！');
    }
  });

})




export { router }

