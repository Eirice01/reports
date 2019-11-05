import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/pages/Home'
import Axios from '@/utils/axios'
import {URL} from "../../api/urlsConfig";
Vue.use(Router);

//路由权限设置由静态作为根目录查询，匹配权限路由
const static_routers=[
      // {
      //   path:'Population',
      //   name:'population',
      //   component: () => import("@/pages/population/Population"),
      // },
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
      // {
      //   path:'Tour',
      //   name: 'tour',
      //   component: () => import("@/pages/tour/Tour")
      // },
      /*{
        path:'Contrast',
        name: 'contrast',
        component: () => import("@/pages/contrast/Contrast"),
      },
      {
        path:'Report',
        name: 'report',
        component: () => import("@/pages/report/Report")
      },*/
      {
        path:'ClipBoard',
        name: 'clipboard',
        component: () => import("@/pages/clipboard/ClipBoard")
      },
      /*{
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
      },*/

];

const dynamic_routers = [
  {
    keys: ['key100'],
    path:'Population',
    name:'population',
    query:{istype:'pops'},
    component: () => import("@/pages/population/Population"),
  },
  {
    keys: ['key200'],
    path:'Tour',
    name: 'tour',
    query:{istype:'tours'},
    component: () => import("@/pages/tour/Tour")
  },
  {
    keys: ['key300'],
    path:'Contrast',
    name: 'contrast',
    query:{type:'pop'},
    component: () => import("@/pages/contrast/Contrast"),
  },
  {
    keys: ['key300101'],
    path:'Contrast',
    name: 'contrast1',
    query:{type:'pop'},
    component: () => import("@/pages/contrast/Contrast"),
  },
  {
    keys: ['key300102'],
    path:'Contrast',
    name: 'contrast2',
    query:{type:'tour'},
    component: () => import("@/pages/contrast/Contrast"),
  },
  {
    keys: ['key400'],
    path:'Report',
    name: 'report',
    query:{isrep:true},
    component: () => import("@/pages/report/Report")
  },
  {
    keys: ['key500101'],
    path:'ScenicArea',
    name: 'scenicArea',
    component: () => import("@/pages/system/ScenicArea")
  },
  {
    keys: ['key500102'],
    path:'KeyPeople',
    name: 'keyPeople',
    component: () => import("@/pages/system/KeyPeople")
  },
  {
    keys: ['key500103'],
    path:'Management',
    name:'management',
    component: () => import("@/pages/system/management/RightsManagement")
  },
  {
    keys: ['key600'],
    path:'Traffic',
    name:'traffic',
    component: () => import("@/pages/traffic/Traffic")
  },
  {
    keys: ['key700'],
    path:'Trajectory',
    name:'trajectory',
    component: () => import("@/pages/trajectory/Trajectory")
  },
  {
    keys: ['key700101'],
    path:'TrajectorySecond',
    name:'trajectorySecond',
    component: () => import("@/pages/trajectory/TrajectorySecond")
  },
  {
    keys: ['key700102'],
    path:'TrajectoryThree',
    name:'trajectoryThree',
    component: () => import("@/pages/trajectory/TrajectoryThree")
  }
];


let userInfo = {};
var keyList=[];
var pathList=[];
var userId='';
let router = new Router({
  routes: [
    {
      path:'/',
      component:Home,
      children:static_routers
    }
  ]

});
// router.beforeEach((to,form,next)=>{
  // next();
  Axios.request({
    method: 'get',
    url:URL.getLoginUserName,
    success: (data) => {
     /* if(data.code == 200) {
        let res = data.data;
        keyList=res.keyList;
        pathList=res.pathList;
        userId=res.id;
        if(keyList[0].includes('key100')&&to.path=='/'){
          next({path:'/Population',query:{istype:'pops'}})
        }else if(keyList[0].includes('key200')&&to.path=='/'){
          next({path:'/Tour',query:{istype:'tours'}})
        }else if(keyList[0].includes('key300')&&to.path=='/'){
          for(let i=0;i<keyList.length;i++){
           if(keyList[i]=="key300101"){
             next({path:'/Contrast',query:{type:'pop'}})
             break;
           }else if(keyList[i]=="key300102"){
             next({path:'/Contrast',query:{type:'tour'}})
             break;
           }
          }
        }else if(keyList[0].includes('key400')&&to.path=='/'){
          next({path:'/Report', query:{isrep:true}})
        }else if(keyList[0].includes('key500')&&to.path=='/'){
          for(let i=0;i<keyList.length;i++){
            if(keyList[i]=="key500101"){
              next({path:'/ScenicArea'})
              break;
            }else if(keyList[i]=="key500102"){
              next({path:'/KeyPeople'})
              break;
            }else if(keyList[i]=="key500103"){
              next({path:'/Management',query:{userId:userId}})
              break;
            }
          }
        }
      }*/
      if (data.data) {
        Object.assign(userInfo, data.data);
      }

      if (userInfo.keyList) {
        userInfo.keyList.forEach(key => keyList.push(key));
        // userInfo.keyList.filter(k=>k.includes('key200')).forEach(key => keyList.push(key));
      }

      let accessRouters = dynamic_routers.filter(route => !route.keys || route.keys.length == 0 || route.keys.find(key => keyList.includes(key)));
      let routers = [
        {
          path: '/',
          component: Home,
          children: accessRouters
        }
      ];
      router.addRoutes(routers);

      if (window.location.hash === '#/') {
        if (accessRouters[0]) {
          router.push(accessRouters[0])
        }
      }
    },
    error: (data) => {
      this.$Message.warning('获取失败！');
    }
  });

// })




export { router };

export default {
  permit: function (resKey) {
    return keyList.includes(resKey);
  },
  hasPermission(resKey) {
    return this.permit(resKey);
  },
}

