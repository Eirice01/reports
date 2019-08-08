<template>
    <div id="population-statistics">
      <Header ref="header" @changeDateData="changeDateData"  @getBackInfo="getBackInfo"@changeTypeDay="changeTypeDay" :areaName="areaName"></Header>
      <div id="left-section" style="z-index: 999">
        <!--人口统计-->
        <Population-Num ref="PopulationNum" :dateData="dateData" :areaCode="areaCode" ></Population-Num>
        <!--人口构成-->
        <div class="pop-list2">
          <PopulationForm ref="PopulationForm" :dateData="dateData" :areaCode="areaCode" :areaName="areaName"></PopulationForm>
        </div>
        <!--行为特征-->
        <div class="pop-list3">
          <Behaviour :dateData="dateData" :areaCode="areaCode" :areaName="areaName" ref="behaviour"></Behaviour>
        </div>
      </div>
      <div id="right-section" style="z-index: 2">
        <Row type="flex" style="height:100%">
          <div id="hFold">
            <div class="hBox" :class="isHFold ? 'icon-rotate':'hBox' ">
              <i class="iconfont icon-iconfonthaofang26-copy-copy-copy"  @click="hFold"></i>
            </div>
          </div>
          <Table stripe :columns="columns1" size="small" :data="data1" :class="isHFold ? 'displaynone' : '' "></Table>
          <div class="page-box">
            <Page :current="current" :total="total" :page-size="pageSize" size="small" @on-change="changePage"></Page>
          </div>
        </Row>

      </div>
      <population-map-tool ref="PopulationMapTool" :dateData="dateData" @getAreaCode="getAreaCode" @queryPopTableData="queryPopTableData"></population-map-tool>
    </div>
</template>

<script>
    import {URL} from "../../../api/urlsConfig"
    import Header from "../../components/common/Header"
    import PopulationNum from "../../components/common/PopulationNum"
    import PopulationForm from "../../components/common/PopulationForm"
    import Behaviour from "../../components/population/Behaviour"
    import PopulationMapTool from "../../components/population/PopulationMapTool"
    export default {
      name: "population",
      data(){
        return{
          columns1: [
            {
              title: '序号',
              type: 'index',
              width: 60,
              align: 'center'
            },
            {
              title: '区域',
              key: 'cityName',
              align: 'center'
            },
            {
              title: '人数（人）',
              key: 'peopleNums',
              width: 120,
              align: 'center'
            },
            {
              title: '占比（%）',
              key: 'ratio',
              align: 'center'
            }
          ],
          data1: [],
          current:1,
          total:0,
          //水平折叠
          isHFold:false,
          pageSize:20,
          dateData:this.formatDate(new Date(new Date().getTime()-24*60*60*1000)),
          areaCode:"",
          areaName:"",
          timeType:null

        }
      },
      inject:[
        "formatDate",
        'changeFormatDate'
      ],
      components:{
        Header,
        PopulationNum,
        PopulationForm,
        Behaviour,
        PopulationMapTool
      },
      created(){

      },
      mounted(){
        if(this.$route.query.date!=undefined){
          this.dateData = this.$route.query.date;
        }
        this.queryPopTableData()
      },
      watch:{
        dateData(){
           if(typeof(this.dateData)!='string'){
             this.dateData=this.changeFormatDate(this.dateData,this.timeType);
           }
          this.queryPopTableData()
        }
      },
      methods:{
        //日,月 切换 调用
        getBackInfo(type,time){
          this.timeType=type;
          if(typeof(time)!='string'){
            this.dateData=this.changeFormatDate(time,type);
          }else {
            this.dateData=time;
          }
        },


        //人口页面日，月切换表格数据调用
        changeTypeDay(type,time){
          this.$refs.PopulationForm.getChoseOldType(type,time)
          this.$refs.behaviour.getOldStutase(type,time)
        },
        //获取表格数据
        queryPopTableData(flag){
          if(flag){
            this.areaName='';
          }

          let params={
            currPage:this.current,
            pageSize:this.pageSize,
            isCity:this.$refs.PopulationMapTool.isCity,
            date:typeof(this.dateData)=='string' ? this.dateData.replace(/-/g,'') : this.dateData.join(",").replace(/-/g,''),
            flag:0,
            code:this.areaCode
          }
          this.$http.request({
            method:'get',
            params:params,
            url:URL.queryPopTableData,
            success:(data) => {
              if(!!data.data){
                if(this.areaName!=''){
                  this.data1=_.filter(data.data.list, (node)=> {
                    if(node.cityName==this.areaName){
                      return [node]
                    }
                  })
                }else {
                  this.areaName='';
                  this.data1 = data.data.list;
                }
               this.current= data.data.currPage;
               this.total= data.data.totalCount;
               this.pageSize= data.data.pageSize;

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
          this.queryPopTableData()
        },
        //获取时间数据(刷新相应图表 调用在watch中写的)
        changeDateData(date){
          this.dateData = date;

        },
        //获取code
        getAreaCode(code,name){
          this.areaCode =code;
          this.areaName = name;
          this.$nextTick(()=>{
            this.$refs.PopulationNum.queryPopulationNum();
            this.$refs.PopulationForm.getArcodes();
            this.queryPopTableData();
          })

        }
      },

    }

</script>

<style scoped>
  #population-statistics{
    width: 100%;
    height: 100%;
    position: relative;
  }
  #population-statistics>>>.modal-title{
    padding: 0px 0px 10px;
    border-bottom: 1px solid #ccc;
  }
  #population-statistics>>>.title-right{
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
  #population-statistics>>> .ivu-card-body{
    padding-top: 10px;
  }
  #population-statistics>>>.ivu-card{
    background: #f8f8f8;
  }
  .pop-list2,.pop-list3{
    width: 100%;
    height: calc(50% - 115px);
  }
  /*#middlemap{*/
   /*width: calc(100% - 850px);*/
    /*height: 100%;*/
    /*background: #00F7DE;*/
  /*}*/

</style>

