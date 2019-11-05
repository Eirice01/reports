<template>
  <div id="originplace">
    <div class="Titelinfo">
      <span class="address-title" v-if="areaNames==undefined? true: false">陕西省西安市{{areaName}}</span>
      <span class="address-title" v-if="areaName==undefined? true: false">陕西省西安市{{areaNames}}</span>
      <span class="time-title">{{titleTime}} 数据</span>
    </div>
    <div id="leftBack">
      <li @click="backIndexInfo">返回</li>
    </div>
    <div id="fesContent">
       <div class="fesContentTitle">
         <li class="fes-title">
           人口构成-来源地（详细信息）
         </li>
         <!--<li class="fes-balance">-->
           <!--<span>进行分析比对</span>-->
         <!--</li>-->

       </div>
      <li class="fes-searche">
        <div class="searchemian">
          <div class="searchePop">
            <Select v-model="sendvalue" filterable multiple @on-change="sendProCode">
              <Option v-for="(item,index) in data1" :value="item.cityCode":key="index" >{{item.cityName}}</Option>
            </Select>
          </div>
          <span class="fes-butn" @click="senCityDta"><Icon type="ios-search" /></span>
        </div>
      </li>
      <div class="fes-tableInfo">
       <div class="fes-tablebody">
         <Table  stripe :columns="columns3" :data="data2" size="small" >
         </Table>
       </div>
       <div class="fes-page" style="margin-top: 10px">
         <Row type="flex" justify="end" align="middle" >
           <Page :total="pageParams.totalCount" show-total  size="small" :page-size="pageParams.pageSize"
                 :current="pageParams.current"  @on-change="changePage"></Page>
         </Row>
       </div>
      </div>
    </div>
  </div>
</template>

<script>
  import {URL} from '../../../../api/urlsConfig'
  export default {
        name: "originplace",
      data(){
        return {
          sendvalue:'',
          areaName:'',
          areaNames:'',
          date:'',
          titleTime:'',
          sendCode:'',
          prolist:'',
          pageParams : {
            totalCount :0,
            pageSize : 20,
            current : 1
          },
          data2:[],
          sendResult:'',
          columns3:[
            {
              // type: 'index',
              title: "序号",
              width: 90,
              align: 'center',
              render:(h,params) => {
                  return h('div',[
                    h('span',(params.index+1)+this.pageParams.pageSize*(this.pageParams.current-1)),
                  ])
              } ,
            },
            {
              "title":"省份",
              "key":"privinceName",
              "align":'center',
            },
            {
              "title":"地市",
              "key":"cityName",
              "align":'center',
            },
            {
              "title":"人数/人",
              "key":"peopleNums",
              // "sortable":true,
              "align":'center',
            },
            {
              "title":"占比",
              "key":"ratio",
              "align":'center',
            },
          ],
          isShowcader:true,
          isreals:'',
          isreData:'',
          data1:[],
        }
      },
      inject:[
      "initDate",
      "titletimes"
     ],
      created(){

      },
      mounted(){
        if(this.$route.query.areaName!=''||this.$route.query.areaName!==undefined){
          this.areaName=this.$route.query.areaName;
        }else {
          this.areaName='';
        }
        if(this.$route.query.areaNames!=''||this.$route.query.areaNames!==undefined){
          this.areaNames=this.$route.query.areaNames;
        }else {
          this.areaNames='';
        }

        if(this.$route.query.sendData!=undefined&&this.$route.query.isTypes==true){
          this.titleTime=this.$route.query.sendData;
        }else {
          this.date=this.$route.query.date.replace(/-/g,'');
          // this.titleTime=this.date.substring(0,4)+'年'+this.date.substring(4,6)+'月'+this.date.substring(6)+'日';
          this.titleTime=this.date.substring(6)==''?this.date.substring(0,4)+'-'+this.date.substring(4,6)+'-':this.date.substring(0,4)+'-'+this.date.substring(4,6)+'-'+this.date.substring(6);
        }
        this.getProSelectData();
        this.sendResult=this.$route.query.istype;
        this.isreals=this.$route.query.isTypes;
        this.isreData=this.$route.query.sendData;
        let parms={};
        let url="";
        if(this.sendResult=='pops'||this.sendResult==undefined){
          //人口页面时参数配置
          url=URL.queryConstituteList
            parms={
              flag:0,
              date:this.date,
              code:this.$route.query.code,
              cityName:'',
              currPage:1,
            }
        }else if(this.sendResult=="tours"){
          //旅游页面时参数配置
          url=URL.querytourConstituteList
          if(this.isreals){
            parms={
              flag:0,
              date:this.isreData,
              code:this.$route.query.code,
              cityName:'',
              currPage:1,
              isRealtime:false,
            }
          }else {
            parms={
              flag:0,
              date:this.$route.query.date,
              code:this.$route.query.code,
              cityName:'',
              currPage:1,
              isRealtime:false,
            }
          }

        }
        this.getOriginData(parms,url)
      },
      methods:{
         //获取选择的省份
        sendProCode(option){
          this.prolist=option.join(",");
        },

        //获取省份下拉数据
        getProSelectData(){
          this.$http.request({
            method:'get',
            params:{
              pid:0,
              flag:0
            },
            url:URL.querySourceData,
            success:(data) => {
              if(data.code==200){
                let res = data.data;
                this.data1=res;
              }
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });
        },
        //发送查询的省市级信息
        senCityDta(){
          let parms={};
          let url="";
          if(this.sendResult=='pops'||this.sendResult==undefined){
            //人口页面时参数配置
            url=URL.queryConstituteList
              parms={
                flag:0,
                date:this.date,
                code:this.$route.query.code,
                proIdOrAbbreviation:this.prolist,
                cityName:'',
                currPage:1,
              }
          }else if(this.sendResult=="tours"){
            //旅游页面时参数配置
            url=URL.querytourConstituteList
            if(this.isreals){
              parms={
                flag:0,
                date:this.isreData,
                code:this.$route.query.code,
                cityName:'',
                currPage:1,
                proIdOrAbbreviation:this.prolist,
                isRealtime:false
              }
            }else {
              parms={
                flag:0,
                date:this.$route.query.date,
                code:this.$route.query.code,
                cityName:'',
                currPage:1,
                proIdOrAbbreviation:this.prolist,
                isRealtime:false
              }
            }

          }

          this.getOriginData(parms,url)
        },
        //处理分页
        changePage(current){
          this.pageParams.current = current;
          let parms={};
          let url="";
          if(this.sendResult=='pops'||this.sendResult==undefined){
            //人口页面时参数配置
            url=URL.queryConstituteList

              parms={
                flag:0,
                date:this.date,
                code:this.$route.query.code,
                cityName:'',
                currPage:this.pageParams.current,
                proIdOrAbbreviation:this.prolist,
              }
          }else if(this.sendResult=="tours"){
            //旅游页面时参数配置
            url=URL.querytourConstituteList
            if(this.isreals){
              parms={
                flag:0,
                date:this.isreData,
                code:this.$route.query.code,
                cityName:'',
                currPage:this.pageParams.current,
                proIdOrAbbreviation:this.prolist,
                isRealtime:false
              }
            }else {
              parms={
                flag:0,
                date:this.$route.query.date,
                code:this.$route.query.code,
                cityName:'',
                currPage:this.pageParams.current,
                proIdOrAbbreviation:this.prolist,
                isRealtime:false
              }
            }

          }

          this.getOriginData(parms,url)
        },
        //获取图标数据
        getOriginData(parms,url){
          //queryConstituteList统一接口为此接口
          this.$http.request({
            method:'get',
            params:parms,
            url:url,
            success:(data) => {
              if(data.code==200){
                let res =data.data;
                this.data2=res.list;
                this.pageParams.totalCount=parseInt(res.totalCount);
                this.pageParams.pageSize=parseInt(res.pageSize);
              }
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });
        },
        //返回
        backIndexInfo(){
          if(this.$route.query.istype=='pops'||this.$route.query.istype==undefined){
            this.$router.push({
              name: 'population',
              query:{
                istype:"pops",
                oldtypes:this.$route.query.oldtype,
                date:this.$route.query.oldtime,
                // date:this.$route.query.date
              }
            });
          }else if(this.$route.query.istype=='tours'){
            this.$router.push({
              name: 'tour',
              query:{
                istype:"tours",
                oldstatus:this.$route.query.oldstatus,
                oldtypes:this.$route.query.oldtype,
                date:this.$route.query.oldtime
              }
            });
          }
        },
      }
    }
</script>

<style scoped>

</style>
<style>

</style>
