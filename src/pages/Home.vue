<template>
  <div id="home">
    <Row class="header">
      <Row>
        <Col span="5" style="text-align:left;padding-left:50px;line-height: 65px">
          <img src="../assets/img/logo.png" style="width:50px;height:50px;vertical-align: middle">
          <span class="sys-title">公共管理报告系统</span>
        </Col>
        <Col span="16">
        <div class="headerRouter">
          <Menu mode="horizontal" :theme="theme1" class="linearBgColor" :active-name="activeName" @on-select="selectItem" ref="side_menu">
            <!-- <MenuItem name="/">
              <router-link to="/">
                <span class="headerTitle">首页</span>
              </router-link>
            </MenuItem>-->
            <MenuItem name="/Population" v-if="hasPermission('key100')" >
              <router-link :to="{path:'/Population', query:{istype:'pops'}}">
                <span >
                  <img class="title-img" src="../assets/img/rk.png" alt="">
                </span>
                <span class="headerTitle">人口模块</span>
              </router-link>
            </MenuItem>
            <MenuItem name="/Tour" v-if="hasPermission('key200')">
              <router-link :to="{path:'/Tour',query:{istype:'tours'}}">
                <span>
                  <img class="title-img" src="../assets/img/ly.png" alt="">
                </span>
                <span class="headerTitle">旅游模块</span>
              </router-link>
            </MenuItem>
            <!--<MenuItem name="/Contrast">
              <router-link :to="{path:'/Contrast'}">
                <span>
                  <img class="title-img" src="../assets/img/fx.png" alt="">
                </span>
                <span class="headerTitle">分析对比</span>
              </router-link>
            </MenuItem>-->
            <Submenu name="分析对比" class="f-fs4" v-if="hasPermission('key300')">
              <template slot="title">
                <span>
                  <img class="title-img" src="../assets/img/fx.png" alt="">
                </span>
                <span class="headerTitle">分析对比</span>
              </template>
              <router-link :to="{path:'/Contrast',query:{type:'pop'}}" v-if="hasPermission('key300101')">
                <MenuItem name="/Contrast" class="f-fs4">人口对比</MenuItem>
              </router-link>
              <router-link :to="{path:'/Contrast',query:{type:'tour'}}" v-if="hasPermission('key300102')">
                <MenuItem name="/Contrast2" class="f-fs4">旅游对比</MenuItem>
              </router-link>
            </Submenu>
            <MenuItem name="/Report" v-if="hasPermission('key400')">
              <router-link :to="{path:'/Report', query:{isrep:true}}">
                <span>
                  <img class="title-img" src="../assets/img/bg.png" alt="">
                </span>
                <span class="headerTitle">报告管理</span>
              </router-link>
            </MenuItem>
            <Submenu name="系统管理" class="f-fs4" v-if="hasPermission('key500')">
              <template slot="title">
                <span>
                  <img class="title-img" src="../assets/img/fx.png" alt="">
                </span>
                <span class="headerTitle">系统管理</span>
              </template>
              <router-link :to="{path:'/ScenicArea'}" v-if="hasPermission('key500101')">
                <MenuItem name="/ScenicArea" class="f-fs4">景区管理</MenuItem>
              </router-link>
              <router-link :to="{path:'/KeyPeople'}" v-if="hasPermission('key500102')">
                <MenuItem name="/KeyPeople" class="f-fs4">重点人管理</MenuItem>
              </router-link>
             <router-link :to="{path:'/Management',query:{userId:this.userId}}" v-if="hasPermission('key500103')">
                <MenuItem name="/Management" class="f-fs4">权限管理</MenuItem>
              </router-link>
            </Submenu>
          </Menu>
        </div>
        </Col>
        <Col span="3">
            <div class="dataBaseIcon">
              <router-link :to="{path:'/ClipBoard', query:{iscli:true}}">
              <span title="剪切板">
                <Icon type="ios-film-outline" size="20" style="cursor:pointer"></Icon>
              </span>
              </router-link>
              <Tooltip>
                <Icon type="ios-person" size="20" style="cursor:pointer"></Icon>
                <div slot="content">
                  <p>当前登录人：{{username}}</p>
                  <p>所属部门：{{partName}}</p>
                  <p>登录人类别：{{dutyname}}</p>
                </div>
              </Tooltip>
              <a @click="logout">
                <Icon class="f-csp" type="md-log-out" size="20" title="退出"></Icon>
              </a>
            </div>
        </Col>
      </Row>
    </Row>
    <!-- 路由页面 -->
    <div class="main-content">
      <logout></logout>
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
  import {URL} from "../../api/urlsConfig"
  import logout from '../components/system/Logout'

  export default {
    name:"home",
    components : {logout},
    data(){
      return {
        theme1: 'light',
        activeName: sessionStorage.getItem('activeName') || '/Population',
        username:"",
        partName:'',
        dutyname:'',
        userId:'',
        keyList:[],


      }
    },
    //provide定义  子组件inject接收
    provide:function(){
      return {
        initDate:this.initDate,
        titletimes:this.titleinitDate,
        formatDate:this.formatDate,
        timeFormatter:this.timeFormatter,
        changeFormatDate:this.changeFormatDate
      }
    },
    created(){

    },
    mounted (){
      this.queryUserName();
    },
    watch:{
      $route(to,from){
        let pathName = "/" + to.path.split("/")[1];
        //this.selectItem(pathName);
      }
    },
    methods : {
      //权限判定、
      hasPermission:function(resKey) {
        return this.keyList.indexOf(resKey) > -1;
      },
      //退出系统
      logout(){
        this.$store.commit("setLogoutState", true);
      },
      //获取用户角色信息
      queryUserName(){
        this.$http.request({
          method: 'get',
          url:URL.getLoginUserName,
          success: (data) => {
            if(data.code == 200) {
              let res = data.data;
              this.username =res.dutyname;
              this.partName=res.dname;
              this.dutyname=res.fullname;
              this.keyList=res.keyList;
              this.userId=res.id
              //动态加载选中样式，此处需结合REF来手动更新，在路由动态渲染的时候activeName会失效需要手动更新
              this.$nextTick(()=>{
                this.$refs.side_menu.updateActiveName()
              })
            }
          },
          error: (data) => {
            this.$Message.warning('获取失败！');
          }
        });
      },


      //时间转换
      initDate(time){
        let date=new Date(time);
        let Y= date.getFullYear();
        let M= (date.getMonth()+1<10 ?'0'+(date.getMonth()+1):date.getMonth()+1);
        let D= date.getDate();
        // let H= date.getHours()+':';
        // let m= date.getMinutes()+':';
        // let s= date.getSeconds();
        return Y+M+D;
      },
      //标题时间转换
      titleinitDate(time){
        let date=new Date(time);
        let Y= date.getFullYear()+'年';
        let M= (date.getMonth()+1<10 ?'0'+(date.getMonth()+1):date.getMonth()+1)+'月';
        let D= date.getDate()+'日';
        // let H= date.getHours()+':';
        // let m= date.getMinutes()+':';
        // let s= date.getSeconds();
        return Y+M+D;
      },

      //选择导航
      selectItem(name){
        sessionStorage.setItem('activeName',name);
        this.activeName =name;
      },

      formatDate(date){
        var y = date.getFullYear(),
          m = date.getMonth()+1,
          d = date.getDate(),
          h = date.getHours(),
          mm = date.getMinutes(),
          s = date.getSeconds();
        // +':'+this.timeFormatter(s)
        if(this.$route.name=="population"){
          return y+'-'+this.timeFormatter(m)+'-'+this.timeFormatter(d);
        }else if(this.$route.name=="tour"){
             mm=parseInt(mm/5)*5
           return y+'-'+this.timeFormatter(m)+'-'+this.timeFormatter(d)+' '+this.timeFormatter(h)+':'+this.timeFormatter(mm);


        }else{
          return y+'-'+this.timeFormatter(m)+'-'+this.timeFormatter(d)+' '+this.timeFormatter(h)+':'+this.timeFormatter(mm);
        }

      },
      changeFormatDate(date,num){
        var y = date.getFullYear(),
          m = date.getMonth()+1,
          d = date.getDate(),
          h = date.getHours(),
          mm = date.getMinutes(),
          s = date.getSeconds();
        if(num=='minute'){
        // :'+this.timeFormatter(s)
          return y+'-'+this.timeFormatter(m)+'-'+this.timeFormatter(d)+' '+this.timeFormatter(h)+':'+this.timeFormatter(mm);
        }else if(num=='day'){
          return y+'-'+this.timeFormatter(m)+'-'+this.timeFormatter(d);
        }else if(num=='month'){
          return y+'-'+this.timeFormatter(m);
        }

      },
      timeFormatter(m){
        return m < 10? '0'+m:m;
      }
    }
  }
</script>
<style scoped>
  #home {
    height:100%;
    background-color: #f0f3f6;
    overflow: hidden;
  }
  #home .header{
    height: 66px;
    line-height: 66px;
    background: linear-gradient(90deg,#5b6d80 0%, #5E7B9B 100%);
  }
  #home .sys-title{
    vertical-align: middle;
    font-size: 22px;
    cursor: pointer;
    color: #f3f7f8;
  }
  #home .title-img{
    width:30px;
    height:30px;
    vertical-align: middle;
  }
  #home .ivu-icon{
    font-size: 18px;
    color: #C4DBF0;
    margin: 0 10px;
  }
  #home >>>.ivu-menu-horizontal{
    height: 65px;
    line-height: 65px;
  }
  #home .ivu-menu-horizontal.ivu-menu-light:after{
    background:none;
  }
  #home .main-content{
    height: calc(100% - 65px);

  }
  #home .ivu-menu-light{
    background: none;
    /*background: #001E4B;*/
  }
  #home .headerTitle{
    color: #C4DBF0;
    font-size: 16px;
  }
  .ivu-menu-light.ivu-menu-horizontal .ivu-menu-item-active, .ivu-menu-light.ivu-menu-horizontal .ivu-menu-item:hover, .ivu-menu-light.ivu-menu-horizontal .ivu-menu-submenu-active, .ivu-menu-light.ivu-menu-horizontal .ivu-menu-submenu:hover {
    color: #C4DBF0;
    border-bottom: 5px solid #f4a563;
  }
  #home .dataBaseIcon{
    float: right;
    height: 65px;
    font-size: 24px;
    color: #fff;
    line-height: 65px;
    margin-right: 15px;
  }
  .headerRouter >>> .ivu-menu-horizontal .ivu-menu-item{
    padding: 0px;
    margin: 0px 10px;
  }
  .linearBgColor a{
    display: inline-block;
    padding: 0 20px;
  }
 /* #home >>>.ivu-menu-horizontal .ivu-menu-submenu .ivu-select-dropdown .ivu-menu-item:hover {
    background: #0A2956;
  }*/
  #home>>>.ivu-select-dropdown .ivu-menu-item span{
    font-size: 20px;
  }
  #home>>>.ivu-menu-horizontal .ivu-menu-submenu .ivu-select-dropdown .ivu-menu-item{
    color: #6597C1;
  }
 /* #home >>> .ivu-menu-horizontal .ivu-menu-submenu .ivu-select-dropdown .ivu-menu-item-selected{
    background: none !important;
  }*/
  #home >>>.ivu-menu-drop-list a{
    width: 100%;
  }
  #home >>> .ivu-menu-horizontal .ivu-menu-submenu .ivu-select-dropdown .ivu-menu-item{
    text-align: center;
  }
</style>
