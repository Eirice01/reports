<template>
  <div id="echarChina">
    <div id="echartsFech">
      <div class="echartsFechRight">
        <span  class="bacword" v-show="isbts" @click="backword">
              返回世界地图
         </span>
        <div id="fechMap" ref="fechword" v-show="isword"></div>
        <div id="chinaMap" ref="fechinas" v-show="isChina"></div>
      </div>
      <div class="echartsFechLeft">
        <div class="fechtable">
          <div class="fechtablebody">
            <Table stripe :columns="columnslxs" :data="dataword" size="small" v-show="iscutry"></Table>
            <Table stripe :columns="columns8" :data="datapro" size="small" v-show="isopro"></Table>
            <Table stripe :columns="columns9" :data="datacity" size="small" v-show="iscity"></Table>
          </div>
          <!--世界-->
          <div class="fcs-page" style="margin-top: 20px" v-show="iscutry">
            <Row type="flex" justify="end" align="middle" >
              <Page :total="pagecutrys.totalCount" show-total size="small"  :page-size="pagecutrys.pageSize"
                    :current="pagecutrys.current"  @on-change="changePageWord"></Page>
            </Row>
          </div>
          <!--省份-->
          <div class="fcs-page" style="margin-top: 20px" v-show="isopro">
            <Row type="flex" justify="end" align="middle" >
              <Page :total="pagepros.totalCount" show-total size="small"  :page-size="pagepros.pageSize"
                    :current="pagepros.current"  @on-change="changePagePro"></Page>
            </Row>
          </div>
          <!--地市-->
          <div class="fcs-page" style="margin-top: 20px" v-show="iscity">
            <Row type="flex" justify="end" align="middle" >
              <Page :total="pagecitys.totalCount" show-total size="small"  :page-size="pagecitys.pageSize"
                    :current="pagecitys.current"  @on-change="changePageCity"></Page>
            </Row>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import {URL} from '../../../../api/urlsConfig'
  import {country} from '../../../../static/map/Country'
  export default {
    name: "echartsqcellplace",
    data(){
      return {
        iscutry:true,
        isopro:false,
        iscity:false,
        titleTime:'',
        date:'',
        dataword:[],
        mapprodata:[],
        mapcitydata:[],
        datapro:[],
        datacity:[],
        wordNums:[],
        isword:true,
        isChina:true,
        isbts:false,
        sendResult:'',
        pagecutrys : {
          totalCount: 30,
          pageSize : 17,
          current : 1
        },
        pagepros:{
          totalCount: 30,
          pageSize : 17,
          current : 1
        },
        pagecitys:{
          totalCount: 30,
          pageSize : 17,
          current : 1
        },
        columnslxs:[
          {
            // type: 'index',
            title: "序号",
            width: 90,
            align: 'center',
            render:(h,params) => {
              return h('div',[
                h('span',(params.index+1)+this.pagecutrys.pageSize*(this.pagecutrys.current-1))
              ])
            }
          },
          {
            "title":"国家",
            "key":"countryName",
            "width":100,
            "align":"center"
          },
          {
            "title":"人数",
            "key":"peopleNums",
            "width":100,
            "sortable":true,
            "align":"center"
          },
          {
            "title":"占比",
            "key":"ratio",
            "width":125,
            "align":"center"
          },
        ],
        columns8:[
          {
            // type: 'index',
            title: "序号",
            width: 90,
            align: 'center',
            render:(h,params) => {
              return h('div',[
                h('span',(params.index+1)+this.pagepros.pageSize*(this.pagepros.current-1))
              ])
            }
          },
          {
            "title":"省份",
            "key":"name",
            "width":100,
            "align":"center"

          },
          {
            "title":"人数",
            "key":"value",
            "width":100,
            "sortable":true,
            "align":"center"
          },
          {
            "title":"占比",
            "key":"ratio",
            "width":124,
            "align":"center"
          },
        ],
        columns9:[
          {
            // type: 'index',
            title: "序号",
            width: 90,
            align: 'center',
            render:(h,params) => {
              return h('div',[
                h('span',(params.index+1)+this.pagecitys.pageSize*(this.pagecitys.current-1))
              ])
            }
          },
          {
            "title":"地市",
            "key":"name",
            "width":100,
            "align":"center"

          },
          {
            "title":"人数",
            "key":"value",
            "width":100,
            // "sortable":true,
            "align":"center"
          },
          {
            "title":"占比",
            "key":"ratio",
            "width":124,
            "align":"center"
          },
        ],
        worldEcharts:null,
        chinaEcharts:null,
        mapParams:{},
      }
    },
    inject:[
      "initDate",
      "titletimes"
    ],
    props:[
      "worldMapData",
      'loadMap'
    ],
    watch:{

      worldMapData:{
        handler:function(){
          let parms =this.handleCountryDataParams();
          this.getcountryData(parms);
          this.getWordData()
        },
        deep:true
      }
    },
    created(){

    },
    beforeDestroy(){
      this.worldEcharts.dispose()
    },
    mounted(){
      this.worldEcharts = this.$echarts.init(document.getElementById("fechMap"));
      this.chinaEcharts = this.$echarts.init(document.getElementById("chinaMap"));
      // if(this.$route.query.type!=undefined){
        let parms =this.handleCountryDataParams();
        this.getcountryData(parms);
        this.getWordData()
      // }

    },
    update(){
      // this.MapCharts()
    },
    methods:{

      //获取地图数据传送并导出
      getWordMapDataAndSend(){
        if(this.isword){
          return  this.wordNums
        }
        if(this.isChina){
          var myChart=this.$echarts.getInstanceByDom(document.getElementById("chinaMap"));
          // console.log( myChart.getOption().series[0].data)
          return   myChart.getOption().series[0].data
        }

      },

      //获取当前地图信息
      getMapInfo(){
        if(this.isword){
          return 'fechMap'
        }
        if(this.isChina){
          return 'chinaMap'
        }
      },
      //处理世界地图接口参数
      handleWordDataParams(){
        let params ={};
        if(this.$route.query.type=='pop'){
          params ={
            code:'',
            date:"",
            genReParam:`${this.worldMapData.params.date},${this.worldMapData.params.cityOrDev},${this.worldMapData.params.cityCode},${this.worldMapData.params.dayOrNight},${this.worldMapData.params.peopleType},${this.worldMapData.params.originOrBelong},${this.worldMapData.params.originOrBelongCode},${this.worldMapData.params.pid}`
          }
        }else if(this.$route.query.type=='tour'){
          params ={
            date:this.worldMapData.params.date,
            areaCode:this.worldMapData.params.areaCode,
            isBelong:this.worldMapData.params.isBelong,
            obList:this.worldMapData.params.obList,
            timeType:this.worldMapData.params.timeType,//时间类型 0:分钟，1:日，2:月
            isPoint:this.worldMapData.params.isPoint,//1时间点，0时间段；
            peopleFrom:this.worldMapData.params.peopleFrom,//人口来源模块 没值0有值1
            type:this.worldMapData.params.type,
            peopleState:this.worldMapData.params.peopleState
          };
        };
        return params;
      },
      //处理世界国家列表参数
      handleCountryDataParams(){
        let params ={};
        if(this.$route.query.type=='pop'){
          params ={
            date:'',
            code:'',
            flag:'',
            currPage:this.pagecutrys.current,
            pageSize:this.pagecutrys.pageSize,
            genReParam:`${this.worldMapData.params.date},${this.worldMapData.params.cityOrDev},${this.worldMapData.params.cityCode},${this.worldMapData.params.dayOrNight},${this.worldMapData.params.peopleType},${this.worldMapData.params.originOrBelong},${this.worldMapData.params.originOrBelongCode},${this.worldMapData.params.pid}`
          };
        }else if(this.$route.query.type=='tour'){
          params ={
            date:this.worldMapData.params.date,
            areaCode:this.worldMapData.params.areaCode,
            isBelong:this.worldMapData.params.isBelong,
            obList:this.worldMapData.params.obList,
            timeType:this.worldMapData.params.timeType,//时间类型 0:分钟，1:日，2:月
            isPoint:this.worldMapData.params.isPoint,//1时间点，0时间段；
            peopleFrom:this.worldMapData.params.peopleFrom,//人口来源模块 没值0有值1
            type:this.worldMapData.params.type,
            currPage:this.pagecutrys.current,
            pageSize:this.pagecutrys.pageSize,
            peopleState:this.worldMapData.params.peopleState
          };

         /* let peopleIds =[]
          this.$refs['popType'+num].selectItem.forEach((item)=>{
            if ("4" != item.code) {
              if ("4" != item.code) {
                peopleIds.push(item.code)
              }
            }
          })
          params.peopleState = peopleIds;*/
        };
        return params;
      },
      //处理中国地图接口参数
      handleWordNotDeployproParams(){
        let params ={};
        if(this.$route.query.type=='pop'){
          params ={
            date:'',
            code:'',
            flag:'',
            genReParam:`${this.worldMapData.params.date},${this.worldMapData.params.cityOrDev},${this.worldMapData.params.cityCode},${this.worldMapData.params.dayOrNight},${this.worldMapData.params.peopleType},${this.worldMapData.params.originOrBelong},${this.worldMapData.params.originOrBelongCode},${this.worldMapData.params.pid}`
          };
        }else if(this.$route.query.type=='tour'){
          params ={
            date:this.worldMapData.params.date,
            areaCode:this.worldMapData.params.areaCode,
            isBelong:this.worldMapData.params.isBelong,
            obList:this.worldMapData.params.obList,
            timeType:this.worldMapData.params.timeType,//时间类型 0:分钟，1:日，2:月
            isPoint:this.worldMapData.params.isPoint,//1时间点，0时间段；
            peopleFrom:this.worldMapData.params.peopleFrom,//人口来源模块 没值0有值1
            type:this.worldMapData.params.type,
            pid:"CN",
            peopleState:this.worldMapData.params.peopleState
          };
        };
        return params;
      },
      //处理省份列表接口参数
      handleProDataParams(data){
        let params ={};
        if(this.$route.query.type=='pop'){
          params ={
            date:'',
            code:'',
            flag:'',
            cityName: data==undefined ? '': data.name, //parmspro 无此字段 分页也无
            currPage:this.pagepros.current,
            pageSize:this.pagepros.pageSize,
            genReParam:`${this.worldMapData.params.date},${this.worldMapData.params.cityOrDev},${this.worldMapData.params.cityCode},${this.worldMapData.params.dayOrNight},${this.worldMapData.params.peopleType},${this.worldMapData.params.originOrBelong},${this.worldMapData.params.originOrBelongCode},${this.worldMapData.params.pid}`
          };
        }else if(this.$route.query.type=='tour'){
          params ={
            date:this.worldMapData.params.date,
            areaCode:this.worldMapData.params.areaCode,
            isBelong:this.worldMapData.params.isBelong,
            obList:this.worldMapData.params.obList,
            timeType:this.worldMapData.params.timeType,//时间类型 0:分钟，1:日，2:月
            isPoint:this.worldMapData.params.isPoint,//1时间点，0时间段；
            peopleFrom:this.worldMapData.params.peopleFrom,//人口来源模块 没值0有值1
            type:this.worldMapData.params.type,
            currPage:this.pagepros.current,
            pageSize:this.pagepros.pageSize,
            // cityName: data==undefined ? '': data.name, //parmspro 无此字段 分页也无
            pid:"CN",
            peopleState:this.worldMapData.params.peopleState
          };
        };
        return params;

      },
      //处理市级地图参数
      handleCityDataParams(data){
        let params ={};
        if(this.$route.query.type=='pop'){
          params ={
            date:'',
            flag:'',
            cityName:data.data.name,
            code:'',
            genReParam:`${this.worldMapData.params.date},${this.worldMapData.params.cityOrDev},${this.worldMapData.params.cityCode},${this.worldMapData.params.dayOrNight},${this.worldMapData.params.peopleType},${this.worldMapData.params.originOrBelong},${this.worldMapData.params.originOrBelongCode},${this.worldMapData.params.pid}`
          };
        }else if(this.$route.query.type=='tour'){
          params ={
            date:this.worldMapData.params.date,
            areaCode:this.worldMapData.params.areaCode,
            isBelong:this.worldMapData.params.isBelong,
            obList:this.worldMapData.params.obList,
            timeType:this.worldMapData.params.timeType,//时间类型 0:分钟，1:日，2:月
            isPoint:this.worldMapData.params.isPoint,//1时间点，0时间段；
            peopleFrom:this.worldMapData.params.peopleFrom,//人口来源模块 没值0有值1
            type:this.worldMapData.params.type,
            cityName:data.data.name,
            peopleState:this.worldMapData.params.peopleState
          };
        };
        return params;
      },
      //处理市级表格参数
      handleCityTableParams(data){
        let params ={};
        if(this.$route.query.type=='pop'){
          params ={
            code:'',
            flag:'',
            currPage:this.pagecitys.current,
            pageSize:this.pagecutrys.pageSize,
            date:'',
            cityName:data.data.name,
            genReParam:`${this.worldMapData.params.date},${this.worldMapData.params.cityOrDev},${this.worldMapData.params.cityCode},${this.worldMapData.params.dayOrNight},${this.worldMapData.params.peopleType},${this.worldMapData.params.originOrBelong},${this.worldMapData.params.originOrBelongCode},${this.worldMapData.params.pid}`
          };
        }else if(this.$route.query.type=='tour'){
          params ={
            date:this.worldMapData.params.date,
            areaCode:this.worldMapData.params.areaCode,
            isBelong:this.worldMapData.params.isBelong,
            obList:this.worldMapData.params.obList,
            timeType:this.worldMapData.params.timeType,//时间类型 0:分钟，1:日，2:月
            isPoint:this.worldMapData.params.isPoint,//1时间点，0时间段；
            peopleFrom:this.worldMapData.params.peopleFrom,//人口来源模块 没值0有值1
            type:this.worldMapData.params.type,
            currPage:this.pagecitys.current,
            pageSize:this.pagecitys.pageSize,
            cityName:data.data.name,
            peopleState:this.worldMapData.params.peopleState
          };
        };
        return params;

      },
      //获取地图上身份数据date 时间
      //Flag  0来源地 1归属地
      //Code 地图上选中的行政区，开发区
      getWordNotDeploypro(){
        let params =this.handleWordNotDeployproParams();
        let url ="";
        if(this.$route.query.type=="pop"){
          url=URL.notDeployPlace;
          this.$http.request({
            method:'get',
            params:params,
            url:url,
            success:(data) => {
              this.mapprodata=data.data;
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });
        }else if(this.$route.query.type=="tour"){
          url =URL.notDeployPlace2;
          this.$http.request({
            method:'post',
            // method:'get',
            data:params,
            url:url,
            success:(data) => {
              this.mapprodata=data.province;
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });
        }else if(this.$route.query.isrep=="true"){
          url=URL.notDeployPlace;
          this.$http.request({
            method:'get',
            params:params,
            url:url,
            success:(data) => {
              this.mapprodata=data.data;
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });
        }
      },

      //date 时间
      //Flag 0来源地 1 归属地
      //Cityname echerts地图上点击的省级name
      //Code 地图上选中的行政区，开发区
      //获取市的地图
      getWordNotDeployCity(parms){
        let  _this=this;
        let url ="";
        if(this.$route.query.type=="pop"){
          url=URL.queryNotDeployCity;
          this.$http.request({
            method:'get',
            params:parms,
            url:url,
            success:(data) => {
              _this.mapcitydata=data.data;
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });
        }else if(this.$route.query.type=="tour"){
          url =URL.queryNotDeployCity2;
          this.$http.request({
            method:'post',
            // method:'get',
            data:parms,
            url:url,
            success:(data) => {
              _this.mapcitydata=data.city;
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });
        }

      },
      //返回世界地图
      backword(){
        this.isChina=false;
        this.isword=true;
        this.iscutry=true;
        this.isopro=false;
        this.iscity=false;
        this.isbts=false;
        let parms =this.handleCountryDataParams();
        this.getcountryData(parms);
        this.getWordData();
      },
      changType(){
        this.isChina=false;
        this.isword=true;
        this.iscutry=true;
        this.isopro=false;
        this.iscity=false;
        this.isbts=false
      },
      //返回
      backIndexInfo(){
        if(this.$route.query.istype=='pops'||this.$route.query.istype==undefined){
          this.$router.push({
            name: 'population',
            query:{
              istype:"pops",
              date:this.worldMapData.params.date
            }
          });
        }else if(this.$route.query.istype=='tours'){
          this.$router.push({
            name: 'tour',
            query:{
              istype:"tours",
              date:this.worldMapData.params.date
            }
          });
        }

      },
      //分页国家级
      changePageWord(current){
        this.pagecutrys.current = current;
        let parms =this.handleCountryDataParams();
        this.getcountryData(parms);
      },
      //分页省级
      changePagePro(current){
        this.pagepros.current=current;
        let parms =this.handleProDataParams()
        this.getProData(parms)
      },
      //分页市级
      changePageCity(current){
        this.pagecitys.current=current;
        let parms =this.handleCityTableParams(this.mapParams);
        this.getCityDta(parms)
      },
      //获取省份列表数据
      getProData(parms){
        let url ="";
        if(this.$route.query.type=="pop"){
          url=URL.notDeployPlacePager;
          this.$http.request({
            method:'get',
            params:parms,
            url:url,
            success:(data) => {
              let res =data.data;
              this.datapro=res.list;
              this.pagepros.totalCount=parseInt(res.totalCount);
              this.pagepros.pageSize=parseInt(res.pageSize);
              // this.currentpro=res;
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });
        }else if(this.$route.query.type=="tour"){
          url =URL.notDeployPlacePager2;
          this.$http.request({
            method:'post',
            // method:'get',
            data:parms,
            url:url,
            success:(data) => {
              let res =data.page;
              this.datapro=res.list;
              this.pagepros.totalCount=parseInt(res.totalCount);
              this.pagepros.pageSize=parseInt(res.pageSize);
              // this.currentpro=res;
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });
        }else if(this.$route.query.isrep=="true"){
          url=URL.notDeployPlacePager;
          this.$http.request({
            method:'get',
            params:parms,
            url:url,
            success:(data) => {
              let res =data.data;
              this.datapro=res.list;
              this.pagepros.totalCount=parseInt(res.totalCount);
              this.pagepros.pageSize=parseInt(res.pageSize);
              // this.currentpro=res;
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });
        }
      },
      //市级地图对应表格数据
      getCityDta(pro){
        let url ="";
        if(this.$route.query.type=="pop"){
          url=URL.queryNotDeployCityPager;
          this.$http.request({
            method:'get',
            params:pro,
            url:url,
            success:(data) => {
              let res =data.data;
              this.datacity=res.list;
              this.pagecitys.totalCount=parseInt(res.totalCount);
              this.pagecitys.pageSize=parseInt(res.pageSize);
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });
        }else if(this.$route.query.type=="tour"){
          url =URL.queryNotDeployCityPager2;
          this.$http.request({
            method:'post',
            // method:'get',
            data:pro,
            url:url,
            success:(data) => {
              let res =data.page;
              this.datacity=res.list;
              this.pagecitys.totalCount=parseInt(res.totalCount);
              this.pagecitys.pageSize=parseInt(res.pageSize);
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });
        }else if(this.$route.query.isrep=="true"){
          url=URL.queryNotDeployCityPager;
          this.$http.request({
            method:'get',
            params:pro,
            url:url,
            success:(data) => {
              let res =data.data;
              this.datacity=res.list;
              this.pagecitys.totalCount=parseInt(res.totalCount);
              this.pagecitys.pageSize=parseInt(res.pageSize);
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });
        }
      },
      //获取世界列表数据
      getcountryData(parms){
        let url ="";
        if(this.$route.query.type=="pop"){
          url=URL.queryConstituteList;
          this.$http.request({
            method:'get',
            params:parms,
            url:url,
            success:(data) => {
              let res =data.data;
              this.dataword=res.list;
              this.pagecutrys.totalCount=parseInt(res.totalCount);
              this.pagecutrys.pageSize=parseInt(res.pageSize);
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });
        }else if(this.$route.query.type=="tour"){
          url =URL.queryConstituteList2;
          this.$http.request({
            method:'post',
            // method:'get',
            data:parms,
            url:url,
            success:(data) => {
              let res =data.page;
              this.dataword=res.list;
              this.pagecutrys.totalCount=parseInt(res.totalCount);
              this.pagecutrys.pageSize=parseInt(res.pageSize);
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });
        }else if(this.$route.query.isrep=='true'){
          url=URL.queryConstituteList;
          this.$http.request({
            method:'get',
            params:parms,
            url:url,
            success:(data) => {
              let res =data.data;
              this.dataword=res.list;
              this.pagecutrys.totalCount=parseInt(res.totalCount);
              this.pagecutrys.pageSize=parseInt(res.pageSize);
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });
        }

      },
      //获取世界地图上的数据
      getWordData(){
        let params =this.handleWordDataParams();
        let url ="";
        if(this.$route.query.type=="pop"){
          url=URL.queryNotDeployCountry;
          this.$http.request({
            method:'get',
            params:params,
            url:url,
            success:(data) => {
              let res =data.data;
              this.wordNums=res;
              this.MapCharts()
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });

        }else if(this.$route.query.type=="tour"){
          url =URL.queryNotDeployCountry2;
          this.$http.request({
            method:'post',
            data:params,
            url:url,
            success:(data) => {
              let res =data.country;
              this.wordNums=res;
              this.worldEcharts.clear()
              this.MapCharts()
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });
        }else if(this.$route.query.isrep=="true"){
          url=URL.queryNotDeployCountry;
          this.$http.request({
            method:'get',
            params:params,
            url:url,
            success:(data) => {
              let res =data.data;
              this.wordNums=res;
              this.MapCharts()
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });
        }

      },
      //
      MapCharts(){
        let _this=this;
        let chart= _this.worldEcharts;
        var geoCoordMap =country;
        var BJData = _this.wordNums;
        var res = [];
        var convertData = function(data) {
          for (var i = 0; i < data.length; i++) {
            var dataItem = data[i];
            var fromCoord = geoCoordMap[dataItem[0].name];
            var toCoord = geoCoordMap[dataItem[1].name];

            if (fromCoord && toCoord) {
              res.push([{
                coord: fromCoord,
                value: dataItem[0].value
              },
                {
                  coord: toCoord
                }
              ]);
            }
          }
          return res;

        };
        var series = [];
        [
          ["西安", BJData]
        ].forEach(function(item, i) {
          series.push({
              type: "lines",
              zlevel: 2,
              effect: {
                show: true,
                period: 4, //箭头指向速度，值越小速度越快
                trailLength: 0.02, //特效尾迹长度[0,1]值越大，尾迹越长重
                symbol: "arrow", //箭头图标
                symbolSize: 5 //图标大小
              },
              lineStyle: {
                normal: {
                  width: 1, //尾迹线条宽度
                  opacity: 0, //尾迹线条透明度
                  curveness: 0.3 //尾迹线条曲直度
                }
              },

              data: convertData(item[1])

            }, {
              type: "effectScatter",
              coordinateSystem: "geo",
              zlevel: 2,
              rippleEffect: {
                //涟漪特效
                period: 4, //动画时间，值越小速度越快
                brushType: "stroke", //波纹绘制方式 stroke, fill
                scale: 4 //波纹圆环最大限制，值越大波纹越大
              },
              label: {
                normal: {
                  show: true,
                  position: "right", //显示位置
                  offset: [5, 0], //偏移设置
                  formatter: "{b}" //圆环显示文字
                },
                emphasis: {
                  show: true
                }
              },
              symbol: "circle",
              symbolSize: function(val) {
                return 2 + val[2] / 600000; //圆环大小
              },
              itemStyle: {
                normal: {
                  show: false,
                }
              },
              data: item[1].map(function(dataItem) {
                return {
                  name: dataItem[0].name,
                  value: geoCoordMap[dataItem[0].name].concat([dataItem[0].value])
                };
              })

            },
            //被攻击点
            {
              type: "scatter",
              coordinateSystem: "geo",
              zlevel: 2,
              rippleEffect: {
                period: 4,
                brushType: "stroke",
                scale: 4
              },
              label: {
                normal: {
                  show: true,
                  position: "right",
                  color: "#00ffff",
                  formatter: "{b}",
                  textStyle: {
                    color: "#0bc7f3"
                  }
                },
                emphasis: {
                  show: true
                }
              },
              symbol: "pin",
              symbolSize: 10,
              itemStyle: {
                normal: {
                  show: true,
                  color: "#9966cc"
                }
              },
              data: [{
                name: item[0],
                value: geoCoordMap[item[0]].concat([100])
              }]
            }
          );
        });

        var option = {
          backgroundColor: '#fcf9f2',
          tooltip: {
            trigger: "item",
            backgroundColor: "#1540a1",
            borderColor: "#FFFFCC",
            showDelay: 0,
            hideDelay: 0,
            enterable: true,
            transitionDuration: 0,
            extraCssText: "z-index:100",
            formatter: function(params, ticket, callback) {
              //根据业务自己拓展要显示的内容
              if(params.data.value!=0){
                return '在西安人数：'+ params.data.value
              }else {
                return '暂无数据'
              }
              // var res = "";
              // var name = params.name;
              // var value = params.value[params.seriesIndex + 1];
              // res =
              //   "<span style='color:#fff;'>" +
              //   name +
              //   "</span><br/>在华人数：" +
              //   value;
              // return res;
            }
          },
          grid:{
            height:500
          },
          visualMap: {
            //图例值控制
            min: 0,
            max: 10000,
            show: false,
            calculable: true,
            color: ["#0bc7f3"],
            textStyle: {
              color: "#fff"
            },

          },
          geo: {
            map: "world",
            label: {
              emphasis: {
                show: true
              }
            },
            roam: true, //是否允许缩放
            layoutCenter: ["50%", "50%"], //地图位置
            layoutSize: "180%",
            itemStyle: {
              normal: {
                color: "#cee7b4", //地图背景色
                borderColor: "dodgerblue" //省市边界线
              },
              emphasis: {
                color: "rgba(37, 43, 61, .5)" //悬浮背景
              }
            }
          },
          toolbox:{
            show:true,
             feature:{
            //   magicType:{show:true,type:['line','bar','stack','tiled']}
            saveAsImage:{}
            },

          },
          series: series
        };
        //渲染地图
        chart.clear();
        chart.setOption(option);
        chart.off('click');
        chart.on('click', function (params) {
          _this.chinaEcharts.clear();
          let newsParms= _this.handleProDataParams(params);
          if(params.name=='China'){
            _this.isChina=true;
            _this.isbts=true;
            _this.$emit('getWorldStatus',_this.isbts)
            _this.iscutry=false;
            _this.isopro=true;
            // _this.getCityDta(newsParms);
            _this.getWordNotDeploypro()
            _this.getProData(newsParms);
            setTimeout(()=>{
              if(_this.mapprodata.length!=0){
                _this.ChinaMap();
              }
            },500)

            _this.isword=false;

          }
        })
        window.onresize=chart.resize;
      },
      //切换中国下钻地图
      ChinaMap(){
        let _this=this;
        let chart=this.chinaEcharts;
        window.onresize=chart.resize;
        //34个省、市、自治区的名字拼音映射数组
        var provinces = {
          //23个省
          // "台湾省": "taiwan",
          "河北省": "hebei",
          "山西省": "shanxi",
          "辽宁省": "liaoning",
          "吉林省": "jilin",
          "黑龙江省": "heilongjiang",
          "江苏省": "jiangsu",
          "浙江省": "zhejiang",
          "安徽省": "anhui",
          "福建省": "fujian",
          "江西省": "jiangxi",
          "山东省": "shandong",
          "河南省": "henan",
          "湖北省": "hubei",
          "湖南省": "hunan",
          "广东省": "guangdong",
          "海南省": "hainan",
          "四川省": "sichuan",
          "贵州省": "guizhou",
          "云南省": "yunnan",
          "陕西省": "shanxi1",
          "甘肃省": "gansu",
          "青海省": "qinghai",
          //5个自治区
          "新疆维吾尔自治区": "xinjiang",
          "广西壮族自治区": "guangxi",
          "内蒙古自治区": "neimenggu",
          "宁夏回族自治区": "ningxia",
          "西藏自治区": "xizang",
          //4个直辖市
          // "北京": "beijing",
          // "天津": "tianjin",
          // "上海": "shanghai",
          // "重庆": "chongqing",
          //2个特别行政区
          // "香港特别行政区": "xianggang",
          // "澳门特别行政区": "aomen"
        };

        //直辖市和特别行政区-只有二级地图，没有三级地图
        // var special = ["北京","天津","上海","重庆","香港","澳门"];
        var special=[];
        var mapdata = [];
        //绘制全国地图
        $.getJSON('/static/map/china.json', function(data){
          var d = [];
          for( var i=0;i<data.features.length;i++ ){
            for( var j=0;j<_this.mapprodata.length;j++){
              if(_.includes(_this.mapprodata[j].name,data.features[i].properties.name)){
                d.push({
                  name:data.features[i].properties.name,
                  value:_this.mapprodata[j].value
                })
              }
            }
          }
          mapdata = d;
          //注册地图
          _this.$echarts.registerMap('全国地图', data);
          //绘制地图
          renderMap('全国地图',mapdata);
        });
        //地图点击事件
        chart.clear();
        chart.off('click');
        chart.on('click', function (params) {
          _this.iscity=false;
          _this.isopro=false;
          _this.iscity=true;
          _this.mapParams =params;
          if(params.data!=undefined){
            //市级地图数据参数
            var news =_this.handleCityDataParams(params);
            //市级表格参数
            var parms =_this.handleCityTableParams(params);
          }
         /* //省级参数
          let parmspro =_this.handleProDataParams();*/
          if(params.data!=undefined&&params.data.mark!=1){
            _this.getWordNotDeployCity(news);
            _this.getCityDta(parms);
          }
          if( params.name in provinces ){
            //如果点击的是34个省、市、自治区，绘制选中地区的二级地图
            setTimeout(()=>{
              $.getJSON('/static/map/province/'+ provinces[params.name] +'.json', function(data){
                var d = [];
                let tep=[];
                for (var i=0;i<data.features.length;i++){
                  for( var j=0;j<_this.mapcitydata.length;j++){
                    if(_.includes(data.features[i].properties.name,_this.mapcitydata[j].name.slice(0,2))){
                      d.push({
                        name:data.features[i].properties.name,
                        value:_this.mapcitydata[j].value,
                        mark:"1"
                      })
                    }else {
                      tep.push(
                        {
                          name:data.features[i].properties.name,
                          value:"0",
                          mark:"1"
                        }
                      )
                    }
                  }

                }
                if(tep.length!=0){
                  //tep去重  tep用来记录存储为匹配到的市级地名
                  const ast=tep.reduce((item,next)=>{
                    tep[next.name]? '':tep[next.name]=true && item.push(next);
                    return item
                  },[])
                  tep=ast
                  for(let i=0;i<d.length;i++){
                    for (let j=0;j<tep.length;j++){
                      if(d[i].name==tep[j].name){
                        tep.splice(j,1)
                      }
                    }
                  }
                  //两个地市数据合并
                  d=d.concat(tep)
                }
                _this.$echarts.registerMap( params.name, data);
                renderMap(params.name,d)
              });
            },500)
          }else if( params.seriesName in provinces ){
            return;
            /*//如果是【直辖市/特别行政区】只有二级下钻
            if(  special.indexOf( params.seriesName ) >=0  ){
              renderMap('全国地图',mapdata);
            }else {
              renderMap('全国地图',mapdata);
              _this.iscity=false;
              _this.isopro=true;
              _this.iscity=false;
              _this.getProData(parmspro);
            }*/
            // else{
            //   //显示县级地图
            //   $.getJSON('/static/map/city/'+ cityMap[params.name] +'.json', function(data){
            //     _this.$echarts.registerMap( params.name, data);
            //     var d = [];
            //     for( var i=0;i<data.features.length;i++ ){
            //       d.push({
            //         name:data.features[i].properties.name
            //       })
            //     }
            //     renderMap(params.name,d);
            //   });
            // }
          }else{
            renderMap('全国地图',mapdata);
            _this.iscity=false;
            _this.isopro=true;
            _this.iscity=false;
            _this.getProData();
          }
        });
        //双击省地图返回中国地图图
        chart.on('dblclick',(params)=>{
          if( params.seriesName in provinces){
            //省级参数
            let parmspro =this.handleProDataParams();
            //如果是【直辖市/特别行政区】只有二级下钻
            if(special.indexOf( params.seriesName ) >=0  ){
              renderMap('全国地图',mapdata);
            }else {
              renderMap('全国地图',mapdata);
              this.iscity=false;
              this.isopro=true;
              this.iscity=false;
              this.getProData(parmspro);
            }
          }

        })
        //初始化绘制全国地图配置
        var option = {
          backgroundColor: '#fcf9f2',
          title : {
            text: '中国地图',
            subtext: '三级下钻',
            link: 'https://blog.csdn.net/example440982',
            left: 'center',
            textStyle:{
              color: '#0b0b0b',
              fontSize:30,
              fontWeight:'normal',
              fontFamily:"Microsoft YaHei"
            },
            subtextStyle:{
              color: '#5c6f84',
              fontSize:14,
              fontWeight:'normal',
              fontFamily:"Microsoft YaHei"
            }
          },
          dataRange:{               // 阈值控件
            show:true,              //
            min:0,
            max:100000,
            text:['height','Low'],       //文本默认数值文本
            realtime:true,
            calculable: true,            //true为线性渐变
            color:['orangered','yellow','lightskyblue'],
            textStyle:{
              color:'#bcd6f6'
            }
          },
          tooltip: {
            trigger: 'item',
            formatter:function (params) {
              if(params.data!=undefined&&params.data.value!=0){
                return params.data.name+'<br/>'+ params.data.value+'人'
              }else {
                return '暂无数据'
              }
              // return params.data.name+'<br/>'+ params.data.value+'万人'
            }
          },
          toolbox:{
            show:true,
            feature:{
              //   magicType:{show:true,type:['line','bar','stack','tiled']}
              saveAsImage:{}
            },

          },
          //工具条
          // toolbox: {
          //   show: true,
          //   orient: 'vertical',
          //   left: 'right',
          //   top: 'center',
          //   feature: {
          //     dataView: {readOnly: false},
          //     restore: {},
          //     saveAsImage: {}
          //   },
          //   iconStyle:{
          //     normal:{
          //       color:'#fff'
          //     }
          //   }
          // },
          animationDuration:1000,
          animationEasing:'cubicOut',
          animationDurationUpdate:1000

        };
        function renderMap(map,data){
          option.title.subtext = map;
          option.series = [
            {
              name: map,
              type: 'map',
              mapType: map,
              roam: false,
              nameMap:{
                'china':'中国'
              },
              label: {
                normal:{
                  show:true,
                  textStyle:{
                    color:'#5c6f84',
                    fontSize:14
                  }
                },
                emphasis: {
                  show: true,
                  textStyle:{
                    color:'#5c6f84',
                    fontSize:14
                  }
                }
              },
              itemStyle: {
                normal: {
                  areaColor: '#cee7b4',
                  borderColor: 'dodgerblue'
                },
                emphasis: {
                  areaColor: 'darkorange'
                }
              },
              data:data
            }
          ];
          //渲染地图
          chart.setOption(option);
        }
      },
    }
  }
</script>
<style scoped lang="less">
  #echarChina{
    height: 100%;
  }
  #echartsFech{
    overflow: hidden;
  }
  #echartsFech > .echartsFechRight{
    height:900px;
    width: calc(100% - 417px);
  }
  #echartsFech .echartsFechLeft{
    width: 417px;
    height: 850px;
  }
  #echartsFech .fechtablebody{
    height: calc(100% - 47px);
  }
  #fechMap,#chinaMap{
    width: 100%;
    height:825px;
  }

</style>
