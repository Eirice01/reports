<template>
    <div id="tour-modal">
      <Header v-if="realTitleTime.length!=0" :showMinute="showMinute" :realTitleTime="realTitleTime" @changeDateData="changeDateData" @showDistributeData="showDistributeData"
              @getTypeStatus=getTypeStatus ref="headers" @getOutRealtype="getOutRealtype" @getChangeTimeOutReal="getChangeTimeOutReal" @getChoseDayOrMourh="getChoseDayOrMourh"
              @handleChangeTep="handleChangeTep"@gethandleMinute="gethandleMinute"
              @getPopStatus="getPopStatus"@getSourcetype="getSourcetype"@getOutStatus="getOutStatus"
              @changeTourtype="changeTourtype"@typeOfRealtime="typeOfRealtime"
              @getTourChose="getTourChose":areaNames="areaNames"@initAreaName="initAreaName"
      >
      </Header>
      <div id="left-section" style="z-index: 999">
        <!--人口统计-->
        <Population-Num :showFlowNum="showFlowNum" :dateData="dateData"  :scenicCode="scenicCode" ref="populationnum" :isType="isType" ></Population-Num>
        <!--人口构成-->
        <div class="tour-list2">
          <PopulationForm :dateData="dateData" ref="populationform" :scenicCode="scenicCode" :isType="isType" :areaNames="areaNames" @realTime="realTime"></PopulationForm>
        </div>
        <div class="tour-list3">
          <!--人数变化-->
          <NumChange  v-if="!showDistribute" :isType="isType" :dateData="dateData" ref="numchange" :scenicCode="scenicCode" :isclick="isclick"></NumChange>
          <!--时长分布-->
          <DurationDistribute v-if="showDistribute" ref="durationdistribute" :scenicCode="scenicCode" :dateData="dateData":showDistribute="showDistribute"></DurationDistribute>
        </div>
      </div>
      <div id="right-section" style="z-index: 2">
        <Row type="flex" style="height:100%">
          <div id="hFold">
            <div class="hBox" :class="isHFold ?  'icon-rotate':'hBox' ">
              <i class="iconfont icon-iconfonthaofang26-copy-copy-copy"  @click="hFold"></i>
            </div>
          </div>
          <Table :columns="columns1" size="small" :data="data1" :class="isHFold ? 'displaynone' : '' " v-if="!isAre"></Table>
          <Table :columns="columns2" size="small" :data="data2" :class="isHFold ? 'displaynone' : '' " v-if="isAre"></Table>
          <div class="page-box">
            <Page :current="current" :total="total" :page-size="pageSize" size="small" @on-change="changePage" v-if="!isAre"></Page>
            <Page :current="arecurrent" :total="aretotal" :page-size="arepageSize" size="small" @on-change="changePageare" v-if="isAre"></Page>
          </div>
        </Row>
      </div>
      <tour-map-tool ref="TourMapTool" :isType="isType" :dateData="dateData" @getSenicCode="getSenicCode"></tour-map-tool>
    </div>
</template>

<script>
  import {URL} from "../../../api/urlsConfig"
  import Header from "../../components/common/Header"
  import PopulationNum from "../../components/common/PopulationNum"
  import PopulationForm from "../../components/common/PopulationForm"
  import NumChange from "../../components/tour/NumChange"
  import DurationDistribute from "../../components/tour/DurationDistribute"
  import TourMapTool from "../../components/tour/TourMapTool"
    export default {
      name: "tour",
      data(){
        return{
          isAre:false,
          showMinute:true,
          showFlowNum:true,
          isType:true,
          columns1: [
            {
              title: '序号',
              type: 'index1',
              width: 60,
              align: 'center',
              render:(h,params) => {
                return h('div',[
                  h('span',(params.index+1)+this.pageSize*(this.current-1))
                ])
              }

            },
            {
              title: '区域',
              key: 'areaName',
              align: 'center'
            },
            {
              title: '人数',
              key: 'areaNum',
              align: 'center'
            },
            {
              title: '占比',
              key: 'ratio',
              align: 'center'
            }
          ],
          columns2:[
            {
              title: '序号',
              type: 'index',
              width: 60,
              align: 'center',
              render:(h,params) => {
                return h('div',[
                  h('span',(params.index+1)+this.arepageSize*(this.arecurrent-1))
                ])
              }

            },
            {
              title: '重点人',
              key: 'hm',
              align: 'center',
              width:80,
              render:(h,params)=>{
                return h('div',[
                  h('Tooltip',{
                      props:{placement:'top'}
                    },
                    [
                      h('span',{
                        style:{
                          display:'inline-block',
                          width:params.column._width*0.9+'px',
                          overflow:'hidden',
                          textOverflow:'ellipsis',
                          whiteSpace:'nowrap'
                        }
                      },params.row.hm),
                      h('span',{
                        slot:'content',
                        style:{whiteSpace:'normal',wordBreak:'break-all'}
                      },params.row.hm)
                    ])

                ])
              }

            },
            {
              title: '时间',
              key: 'dataTime',
              align: 'center',
              width:60,
              render:(h,params)=>{
                return h('div',[
                  h('Tooltip',{
                      props:{placement:'top'}
                    },
                    [
                      h('span',{
                        style:{
                          display:'inline-block',
                          width:params.column._width*0.9+'px',
                          overflow:'hidden',
                          textOverflow:'ellipsis',
                          whiteSpace:'nowrap'
                        }
                      },params.row.dataTime),
                      h('span',{
                        slot:'content',
                        style:{whiteSpace:'normal',wordBreak:'break-all'}
                      },params.row.dataTime)
                    ])

                ])
              }
            },
            {
              title: '活动区域',
              key: 'areaCodeName',
              align: 'center',
              width:100,
              render:(h,params)=>{
                return h('div',[
                  h('Tooltip',{
                    props:{placement:'top'}
                  },
                  [
                    h('span',{
                      style:{
                        display:'inline-block',
                        width:params.column._width*0.9+'px',
                        overflow:'hidden',
                        textOverflow:'ellipsis',
                        whiteSpace:'nowrap'
                      }
                    },params.row.areaCodeName),
                    h('span',{
                      slot:'content',
                      style:{whiteSpace:'normal',wordBreak:'break-all'}
                    },params.row.areaCodeName)
                  ])

                ])
              }
            },
            {
              title: '类别',
              key: 'peopleStatusName',
              align: 'center'
            }
          ],
          data1: [],
          current:1,
          total:0,
          pageSize:20,
          data2:[],
          arecurrent:1,
          aretotal:0,
          arepageSize:20,
          //水平折叠
          isHFold:false,
          dateData:this.formatDate(new Date()),
          showDistribute:false,
          areaCode:"",
          scenicCode:'',
          areaNames:"",
          tourDate:"",
          timers:null,
          aretimer:null,
          aretime:false,
          isclick:false,
          marks:'',
          isChoseType:'',
          realTitleTime:''
        }
      },
      inject:[
        "formatDate",
        "changeFormatDate"
      ],
      components:{
        Header,
        PopulationNum,
        PopulationForm,
        NumChange,
        DurationDistribute,
        TourMapTool
      },
      watch:{
        dateData(){
         if(!this.isType){
           this.tourTableData()
         }
        },
      },
      beforeDestroy(){
        //清空定时器
        clearInterval(this.timers);
        clearInterval(this.aretimer);
        clearInterval(this.$refs.numchange.numTimer);
        this.timers=null;
        this.aretimer=null;
        // this.$refs.numchange.numTimer =null;
      },
      methods:{

        //区域地图数据分页
        changePageare(){

        },

        //获取已选择的非实时状态，日月份，时间
        getTourChose(status,type,time){
            this.$refs.populationform.getChoseTour(status,type,time)
        },

        //手动切换两个显示组件
          handleChangeTep(type){
          this.showDistribute=!type
          // this.dateData=time;
         },
        //获取实时或非实时状态
        getTypeStatus(type){
         this.isAre=false
          this.getisRealtimesNum(type)
          this.isType=type
          if(type){
            this.timers=setInterval(this.realTableData,5*60*1000)

          }else {
            clearInterval(this.timers);
            clearInterval(this.aretimer);
          }

        },

        //旅游人口统计模块状态切换
        getPopStatus(type){
          this.$refs.populationnum.popOutRealtype(type)
        },
        //旅游页面下饼状图状态回调
        getSourcetype(type){
          this.$refs.populationform.getTourSourceType(type)
        },
        //非实时下点击分钟回调
        gethandleMinute(type,time){
          this.isclick=true;
           setTimeout(()=>{  this.$refs.numchange.handleMinute(type,time)},50)

        },
        //获取人数变化模块状态
        getisRealtimesNum(type){
            setTimeout(()=>{
              let resNum=document.getElementById("num-chart");
              let resdur=document.getElementById("duration-chart")
              if(resNum!=null){
              this.$refs.numchange.getisRealtime(type)
              }

            },30)

        },
        //获取切入非实时状态下是分状态显示时间使用一次延时因为vi-if加载DOM需要时间不加会因为方法调用错误 ref目标没有
        getOutRealtype(status,type,time){
          setTimeout(()=>{
            this.$refs.numchange.getOutRealTime(status,type,time)
          },30)
        },
        //非实时下分钟选择后回调
        getChangeTimeOutReal(status,time){

            this.$refs.numchange.changeOutRealTime(status,time)
        },
        //非实时下日，月切换回调
        getChoseDayOrMourh(types,times){
          setTimeout(()=>{
            this.$refs.durationdistribute.DayOrMouthInit(types,times)
          },30)
        },

        //非实时下分，日,月 切换 调用
        getOutStatus(type,time){
          this.isAre=false;
            if(typeof(time)!='string'){
              this.dateData=this.changeFormatDate(time,type);
            }else {
              this.dateData=time;
            }
        },
        //切换到非实时下初始化（分调用）
        changeTourtype(type,time){
          this.dateData=time;
          //右侧景区表格调用
          this.tourTableData();
          //重点人调用
          this.$refs.populationnum.outTimeKeyPople(type,time);
          //流入流出人口
          this.$refs.populationnum.enterOrOutNum(type,time);
          //总人口统计
          this.$refs.populationnum.tourPopulationNum(type,time)

          //饼状图调用
          let par={
            date:time,
            code:this.scenicCode,
            isRealtime: type
          }
          this.$refs.populationform.queryTourSourceData(par)
        },
        //切换到实时状态调用
        typeOfRealtime(type){
          this.isType=type;
          let time='';
          //首页左侧全量景区表格
          this.realTableData()
          //饼状图调用
          this.$refs.populationform.RelaquerySourceData()
          //重点人调用
          this.$refs.populationnum.outTimeKeyPople(type,time);
          //人口统计调用
          this.$refs.populationnum.tourPopulationNum(type,time)
          //流入流出人口
          this.$refs.populationnum.enterOrOutNum(type,time);
          //折线图调用
          let parms={
            date:time,
            isRealtime:type,
            code:this.scenicCode
          }
          setTimeout(()=>{this.$refs.numchange.outRelaTimesData(parms)},40)

        },
        //切换到非实时状态下初始化分调用
        initTableMint(time){
          let params={
            code:this.scenicCode,
            date:time,
            current:this.current,
            pageSize:this.pageSize,
            isRealtime: false
          }
          this.$http.request({
            method:'get',
            params:params,
            url:URL.queryTourTableData,
            success:(data) => {
              if(!!data.data){
                let res=data.data;
                this.data1 = res.list;
                this.current= res.currPage;
                this.total= res.totalCount;
                this.pageSize= res.pageSize;
              }

            },
            error : (data) => {
            }
          });
        },
        //非实时下表格切换分，日，月选择
        tourTableData(){
          let params={
            code:this.scenicCode,
            date:this.dateData,
            current:this.current,
            pageSize:this.pageSize,
            isRealtime: false
          }
          this.$http.request({
            method:'get',
            params:params,
            url:URL.queryTourTableData,
            success:(data) => {
              if(!!data.data){
                let res=data.data;
                this.data1 = res.list;
                this.current= res.currPage;
                this.total= res.totalCount;
                this.pageSize= res.pageSize;
              }

            },
            error : (data) => {
            }
          });
        },

        //实时下定时器调用5分钟刷新表格数据
        realTableData(){
          let params={
            code:this.scenicCode,
            date:'',
            current:this.current,
            pageSize:this.pageSize,
            isRealtime:true
          }
          this.$http.request({
            method:'get',
            params:params,
            url:URL.queryTourTableData,
            success:(data) => {
              if(!!data.data){
                let res=data.data;
                this.data1 = res.list;
                this.arecurrent= res.current;
                this.aretotal= res.total;
                this.arepageSize= res.pageSize;
              }

            },
            error : (data) => {
            }
          });
        },
        //获取实时表格数据
        queryTourTableData(){
          let params={
            code:'',
            date:'',
            current:this.current,
            pageSize:this.pageSize,
            isRealtime: true
          }
          this.$http.request({
            method:'get',
            params:params,
            url:URL.queryTourTableData,
            success:(data) => {
              if(!!data.data){
                let res=data.data;
                this.data1 = res.list;
                this.arecurrent= res.current;
                this.aretotal= res.total;
                this.arepageSize= res.pageSize;
              }

            },
            error : (data) => {
            }
          });
        },

        //地图点击调用重点人列表数据
        tourKeyPoplePager(){
          let params={};
          if(this.isType){
            params={
              code:this.scenicCode,
              date:'',
              current:this.current,
              pageSize:this.pageSize,
              isRealtime:this.isType
            }
          }else {
            params={
              code:this.scenicCode,
              date:this.dateData,
              current:this.current,
              pageSize:this.pageSize,
              isRealtime:this.isType
            }
          }
          this.$http.request({
            method:'get',
            params:params,
            url:URL.queryTourTableData,
            success:(data) => {
              if(!!data.data){
                let res=data.data;
                this.data1 = res.list;
                this.current= res.currPage;
                this.total= res.totalCount;
                this.pageSize= res.pageSize;
              }

            },
            error : (data) => {
            }
          });
        },

        //定时器下景区区域表格数据刷新
        areRealPagerData(){
          let flag='';
          if(this.scenicCode=='大雁塔'||this.scenicCode==''){
            flag=0
          }else {
            flag=1;
          }
          this.marks=flag
          let params={
            code:this.scenicCode,
            date:'',
            current:this.current,
            pageSize:this.pageSize,
            isRealtime: true,
            flag:flag ,
          }
          this.$http.request({
            method:'get',
            params:params,
            url:URL.queryMapKeyPeoplePager,
            success:(data) => {
              if(!!data.data){
                let res=data.data;
                this.data2 = res.list;
                this.arecurrent= res.current;
                this.aretotal= res.total;
                this.arepageSize= res.pageSize;
              }

            },
            error : (data) => {
            }
          });
        },
        //区域重点人表格初始化数据
        querykeyPoplePager(){
          let params={
            code:this.scenicCode,
            date:this.isType?'':this.dateData,
            current:this.current,
            pageSize:this.pageSize,
            isRealtime: this.isType,
            flag:1
          }
          this.$http.request({
            method:'get',
            params:params,
            url:URL.queryMapKeyPeoplePager,
            success:(data) => {
              if(!!data.data){
                let res=data.data;
                this.data2 = res.list;
                this.arecurrent= res.current;
                this.aretotal= res.total;
                this.arepageSize= res.pageSize;
              }

            },
            error : (data) => {
            }
          });
        },
        //水平折叠面板
        hFold(){
          let rightWid = document.getElementById("right-section");
          if(!this.isHFold){
            rightWid.style.width = '35px';
            this.isHFold = true;
          } else {
            rightWid.style.width = '435px';
            this.isHFold = false;
          }
        },
        //分页
        changePage(index){
          this.current =index;
          this.queryTourTableData()
        },
        //获取时间数据
        changeDateData(date){
          this.dateData = date;
        },
        //判断显示时长分布
        showDistributeData(flag){
          this.showDistribute =flag;
          // if(flag){
          //   let par={
          //     code:this.scenicCode,
          //     date:this.dateData,
          //     isRealtime:false
          //   }
            // this.$refs.durationdistribute.queryDurationDistribute(par)
          // }
        },
        //重置区域名称
        initAreaName(){
          this.areaNames='';
        },
        //获取景区code
        getSenicCode(code,name){
          this.scenicCode =code;
          this.areaNames = name;
          if(this.aretimer){
            clearInterval(this.aretimer);
          }
          if(code!=''){
            this.isAre=true;
            this.querykeyPoplePager()
            if(this.isType){
              // if(this.marks!=''){
              //   clearInterval(this.aretimer);
              // }
              this.aretimer=setInterval(this.areRealPagerData,5*60*1000)
            }else {
                clearInterval(this.aretimer);

            }
            this.aretime=true;
          }else {
            this.isAre=false;
            this.aretime=false;
          }
          this.$nextTick(()=>{
            if(this.dateData!=''){
              let resNum=document.getElementById("change-num")
              let resDur=document.getElementById("duration")
              this.$refs.populationnum.queryTourEnterNum();
              this.$refs.populationnum.queryPopulationNum();
              this.$refs.populationnum.keyPople()
              if(resNum){
                this.$refs.numchange.areinuteTimesData()
              }
              this.$refs.populationform.getArcodes();
              if(!this.isType){
                let parms={
                  code:this.scenicCode,
                  date:this.dateData,
                  isRealtime:false
                }
                if(resDur){
                  this.$refs.durationdistribute.queryDurationDistribute(parms)
                }
              }

              if(!this.isAre){
                this.tourKeyPoplePager()
              }
            }

          })
        },
        //人口构成组件给传过来的实时时间
        realTime(data){
          this.realTitleTime =data;
        }

      },
      created(){
        if(this.$route.query.date!=undefined){
          this.dateData = this.$route.query.date;
          if(this.$route.query.oldstatus==''){
            this.isType
          }else {
            this.isType=this.$route.query.oldstatus;
          }

        }
        this.queryTourTableData()
      },
      mounted(){

      }

    }
</script>

<style scoped>
  #tour-modal{
    width: 100%;
    height: 100%;
    position: relative;
  }
  #tour-modal>>> .ivu-card-body {
    padding-top: 10px;
  }
  #tour-modal>>>.modal-title{
    padding: 0px 0px 10px;
    border-bottom: 1px solid #ccc;
  }
  #tour-modal>>>.title-right{
    float: right;
    padding-right: 15px;
    cursor: pointer;
  }
  #left-section{
    width: 420px;
    height:calc(100% - 44px);
    position: absolute;
    left: 0px;
    padding: 30px 0px 30px 20px;
  }
  #right-section{
    width: 435px;
    height:calc(100% - 44px);
    position: absolute;
    right: 0px;
    padding: 30px 20px 30px 0px;
  }
  #right-section>>> .ivu-table-wrapper{
    width: calc(100% - 25px);
    height: 100%;
  }
   #right-section>>> .ivu-table{
    width: 100%;
    height: 100%;
  }
  #right-section>>> .ivu-table-body{
    height: calc(100% - 55px);
    overflow-y: auto;
    overflow-x: hidden;
  }
  #hFold{
    width:25px;
    height:100%;
    position:relative;
  }
  .displaynone{
    display:none;
  }
  .hBox{
    text-align:center;
    width:18px;
    line-height:80px;
    position:absolute;
    top:45%;
    cursor: pointer;
  }
  .icon-rotate{
    transform:rotateY(180deg);
  }
  .tour-list2,.tour-list3{
    width: 100%;
    height: calc(50% - 137px);
  }
</style>
