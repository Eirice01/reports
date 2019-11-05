<template>
    <div id="echartsoforigin">
      <div class="fech-title">
        <span class="address-title" v-if="areaNames==undefined? true: false">陕西省西安市{{areaName}}</span>
        <span class="address-title" v-if="areaName==undefined? true: false">陕西省西安市{{areaNames}}</span>
        <span class="time-title">{{titleTime}} 数据</span>
      </div>
      <div id="leftBack">
        <li @click="backIndexInfo">返回</li>
      </div>
      <div id="fechContent">
        <div class="fechRight">
          <div class="righttitle" style="display: inline-block">
            人口构成-归属地（非西安）
          </div>
          <span class="bacword" v-show="isbts" @click="backword">
              返回世界地图
          </span>
          <div id="fechMap" ref="fechword" v-show="isword"></div>
          <div id="chinaMap" ref="fechinas" v-show="isChina"></div>
        </div>
        <div class="fechLeft">
          <div id="fechtable" :class="iscutry ? 'half-h':'all-h'">
            <div class="fechtablebody">
              <Table stripe :columns="columnslxs" :data="dataword" size="small" v-show="iscutry"></Table>
              <Table stripe :columns="columns8" :data="datapro" size="small" v-show="isopro"></Table>
              <Table stripe :columns="columns9" :data="datacity" size="small" v-show="iscity"></Table>
            </div>
            <!--世界-->
            <div class="fcs-page" style="margin-top: 30px" v-show="iscutry">
              <Row type="flex" justify="end" align="middle" >
                <Page :total="pagecutrys.totalCount" show-total size="small"  :page-size="pagecutrys.pageSize"
                      :current="pagecutrys.current"  @on-change="changePageWord"></Page>
              </Row>
            </div>
            <!--省份-->
            <div class="fcs-page" style="margin-top: 30px" v-show="isopro">
              <Row type="flex" justify="end" align="middle" >
                <Page :total="pagepros.totalCount" show-total size="small"  :page-size="pagepros.pageSize"
                      :current="pagepros.current"  @on-change="changePagePro"></Page>
              </Row>
            </div>
            <!--地市-->
            <div class="fcs-page" style="margin-top: 30px" v-show="iscity">
              <Row type="flex" justify="end" align="middle" >
                <Page :total="pagecitys.totalCount" show-total size="small"  :page-size="pagecitys.pageSize"
                      :current="pagecitys.current"  @on-change="changePageCity"></Page>
              </Row>
            </div>
          </div>
          <div class="static-chart" v-show="iscutry">
            <StatisticsChart ref="statisticsChart"></StatisticsChart>
          </div>
        </div>
      </div>
    </div>
</template>

<script>
  import {URL} from '../../../../api/urlsConfig'
  import {country} from '../../../../static/map/Country'
  import StatisticsChart from "../../../components/population/StatisticsChart"
    export default {
      name: "echartsqcellplace",
      data(){
        return {
          iscutry:true,
          isopro:false,
          iscity:false,
          titleTime:'',
          areaName:'',
          areaNames:'',
          date:'',
          dataword:[],
          mapprodata:[],
          mapcitydata:[],
          datapro:[],
          datacity:[],
          wordNums:[],
          isword:true,
          isChina:true,
          sendCode:'',
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
              // "width":125,
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
              // "width":124,
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
              "sortable":true,
              "align":"center"
            },
            {
              "title":"占比",
              "key":"ratio",
              // "width":124,
              "align":"center"
            },
          ],
          worldEcharts:null,
          chinaEcharts:null,
          isWorldreal:'',
          isWorldreData:'',
        }
      },
      components:{
        StatisticsChart
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
        this.worldEcharts = this.$echarts.init(document.getElementById("fechMap"));
        this.chinaEcharts = this.$echarts.init(document.getElementById("chinaMap"));
        if(this.$route.query.sendData!=undefined&&this.$route.query.isTypes==true){
          this.titleTime=this.$route.query.sendData;
        }else {
          this.date=this.$route.query.date.replace(/-/g,'');
          // this.titleTime=this.date.substring(0,4)+'年'+this.date.substring(4,6)+'月'+this.date.substring(6)+'日';
          this.titleTime=this.date.substring(6)==''?this.date.substring(0,4)+'-'+this.date.substring(4,6)+'-':this.date.substring(0,4)+'-'+this.date.substring(4,6)+'-'+this.date.substring(6);
        }
        this.sendResult=this.$route.query.istype;
        this.sendCode=this.$route.query.code;
        this.isWorldreal=this.$route.query.isTypes;
        this.isWorldreData=this.$route.query.sendData;
        let parcy={};
        let urlcy="";
        if(this.sendResult=="pops"||this.sendResult==undefined){
          //人口页面参数
          urlcy=URL.queryConstituteList;
          parcy={
            date:this.date,
            code:this.sendCode,
            flag:1,
            currPage:this.pagecutrys.current
          }
        }else if(this.sendResult=="tours"){
          //旅游页面时参数配置
          urlcy=URL.tourqueryConstituteList;
          if(this.isWorldreal){
            parcy={
              date:this.isWorldreData,
              code:this.sendCode,
              flag:1,
              currPage:this.pagecutrys.current,
              isRealtime:false,
            }
          }else {
            parcy={
              date:this.$route.query.date,
              code:this.sendCode,
              flag:1,
              currPage:this.pagecutrys.current,
              isRealtime:false,
            }
          }
        }
        this.getcountryData(parcy,urlcy);

        //列表数据初始化pro
        // let papro={};
        // let urlpro="";
        // if(this.sendResult=="pops"||this.sendResult==undefined){
        //   //人口页面时参数配置
        //   urlpro=URL.notDeployPlace
        //   papro={
        //     date:this.date,
        //     code:this.sendCode,
        //     flag:1
        //   }
        // }else if(this.sendResult=="tours"){
        //   //旅游页面时参数配置
        //   urlpro=URL.tournotDeployPlace;
        //   papro={
        //     date:this.$route.query.date,
        //     code:this.sendCode,
        //     flag:1
        //   }
        // }
        // this.getWordNotDeploypro(papro,urlpro)
        //根据路由切换参数世界地图数据配置
        let pro={};
        let urlm='';
        let urls=''
        if(this.sendResult=="pops"||this.sendResult==undefined){
          //人口页面时参数配置
          urlm=URL.queryNotDeployCountry;
          urls=URL.queryPopChartData;
          pro={
            code:this.sendCode,
            date:this.date
          }
        }else if(this.sendResult=="tours"){
          //旅游页面时参数配置
          urlm=URL.tourqueryNotDeployCountry;
          urls=URL.queryTourChartData;
          if(this.isWorldreal){
            pro={
              code:this.sendCode,
              date:this.isWorldreData,
              isRealtime:false
            }
          }else {
            pro={
              code:this.sendCode,
              date:this.$route.query.date,
              isRealtime:false
            }
          }
        }
        this.getWordData(pro,urlm);
        this.$refs["statisticsChart"].queryChartData(pro,urls);
      },
      update(){
        // this.MapCharts()
      },
      methods:{

        //获取地图上省份数据date 时间
        //Flag  0来源地 1归属地
        //Code 地图上选中的行政区，开发区
        getWordNotDeploypro(par,url){
          this.$http.request({
            method:'get',
            params:par,
            url:url,
            success:(data) => {
              this.mapprodata=data.data;

            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });
        },

        //date 时间
        //Flag 0来源地 1 归属地
        //Cityname echerts地图上点击的省级name
        //Code 地图上选中的行政区，开发区
        getWordNotDeployCity(parms,url){
          let  _this=this
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
        },
        //返回世界地图
        backword(){
          this.isChina=false;
          this.isword=true;
          this.iscutry=true;
          this.isopro=false;
          this.iscity=false;
          this.isbts=false;
          //根据路由切换参数世界地图数据配置
          let pro={};
          let urlm='';
          if(this.sendResult=="pops"||this.sendResult==undefined){
            //人口页面时参数配置
            urlm=URL.queryNotDeployCountry;
            pro={
              code:this.sendCode,
              date:this.date
            }
          }else if(this.sendResult=="tours"){
            //旅游页面时参数配置
            urlm=URL.tourqueryNotDeployCountry;
            if(this.isWorldreal){
              pro={
                code:this.sendCode,
                date: this.isWorldreData,
                isRealtime:false
              }
            }else {
              pro={
                code:this.sendCode,
                date:this.$route.query.date,
                isRealtime:false
              }
            }
          }
          this.getWordData(pro,urlm);
        },
        //返回
        backIndexInfo(){
          this.worldEcharts.dispose();
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
                // date:this.$route.query.date
              }
            });
          }

        },
        //处理分页国家级
        //分页
        changePageWord(current){
          this.pagecutrys.current = current;
          let parcy={};
          let urlcy="";
          if(this.sendResult=="pops"||this.sendResult==undefined){
            //人口页面参数
            urlcy=URL.queryConstituteList;
            parcy={
              date:this.date,
              code:this.sendCode,
              flag:1,
              currPage:this.pagecutrys.current

            }
          }else if(this.sendResult=="tours"){
            //旅游页面时参数配置
            urlcy=URL.tourqueryConstituteList;
            if(this.isWorldreal){
              parcy={
                date:this.isWorldreData,
                code:this.sendCode,
                flag:1,
                currPage:this.pagecutrys.current,
                isRealtime:false
              }
            }else {
              parcy={
                date:this.$route.query.date,
                code:this.sendCode,
                flag:1,
                currPage:this.pagecutrys.current,
                isRealtime:false
              }
            }
          }
          this.getcountryData(parcy,urlcy);
        },
        //分页省级
        changePagePro(current){
        this.pagepros.current=current;
          //省级参数
          //根据路由切换省级表格参数配置
          let wnewParm={};
          let wurls='';
          if(this.sendResult=="pops"||this.sendResult==undefined){
            //人口页面时参w数配置
            wurls=URL.notDeployPlacePager;
            wnewParm={
              date:this.date,
              code:this.sendCode,
              flag:1,
              currPage:this.pagepros.current
            }
          }else if(this.sendResult=="tours"){
            //旅游页面时参数配置
            wurls=URL.tournotDeployPlacePager;
            if(this.isWorldreal){
              wnewParm={
                date:this.isWorldreData,
                code:this.sendCode,
                flag:1,
                currPage:this.pagepros.current,
                isRealtime:false
              }
            }else {
              wnewParm={
                date:this.$route.query.date,
                code:this.sendCode,
                flag:1,
                currPage:this.pagepros.current,
                isRealtime:false
              }
            }
          }
          this.getProData(wnewParm,wurls)
        },
        //分页市级
        changePageCity(current){
         this.pagecitys.current=current
          //根据路由切换地市表格数据参数
          let wpro={};
          let wurlm='';
          if(this.sendResult=="pops"||this.sendResult==undefined){
            //人口页面时参数配置
            wurlm=URL.queryNotDeployCityPager;
            wpro={
              date:this.date,
              code:this.sendCode,
              flag:1,
              currPage:this.pagecitys.current
            }
          }else if(this.sendResult=="tours"){
            //旅游页面时参数配置
            wurlm=URL.tourqueryNotDeployCityPager;
            if(this.isWorldreal){
              wpro={
                code:this.sendCode,
                flag:1,
                date:this.isWorldreData,
                currPage:this.pagecitys.current,
                isRealtime:false
              }
            }else {
              wpro={
                code:this.sendCode,
                flag:1,
                date:this.$route.query.date,
                currPage:this.pagecitys.current,
                isRealtime:false
              }
            }
          }
          this.getCityDta(wpro,wurlm);
        },
        //获取省份表格数据
        getProData(parms,url){
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
        },
        //市级地图对应表格数据
        getCityDta(pro,url){
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
        },
        //获取世界表格数据
        getcountryData(parms,url){
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
        },
        //获取世界地图上的数据
        getWordData(par,url){
          let _this=this;
          this.$http.request({
            method:'get',
            params:par,
            url:url,
            success:(data) => {
              let res =data.data;
              _this.wordNums=res;
              _this.MapCharts()
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });
        },
        //处理省级列表参数
        handleProDataParams(){
          //根据路由切换省级表格参数配置
          let paramsURL={
            wnewParm:{},
            wurls:''
          }
          if(this.sendResult=="pops"||this.sendResult==undefined){
            //人口页面时参w数配置
            paramsURL.wurls=URL.notDeployPlacePager;
            paramsURL.wnewParm={
              date:this.date,
              code:this.sendCode,
              flag:1,
              currPage:this.pagepros.current,
              pageSize:this.pagepros.pageSize,
            }
          }else if(this.sendResult=="tours"){
            //旅游页面时参数配置
            paramsURL.wurls=URL.tournotDeployPlacePager;
            if(this.isWorldreal){
              paramsURL.wnewParm={
                date:this.isWorldreData,
                pageSize:this.pagepros.pageSize,
                code:this.sendCode,
                flag:1,
                currPage:this.pagepros.current,
                isRealtime:false
              }
            }else {
              paramsURL.wnewParm={
                date:this.$route.query.date,
                pageSize:this.pagepros.pageSize,
                code:this.sendCode,
                flag:1,
                currPage:this.pagepros.current,
                isRealtime:false
              }
            }
          }
          return paramsURL;
        },
        //
        MapCharts(){
          let _this=this;
          let chart=_this.worldEcharts;
          var geoCoordMap =country
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
                if(params.name=="中国"){
                  // console.log(params.value[2])
                  return '在西安人数：'+ params.value[2]
                }
                //根据业务自己拓展要显示的内容
                else if(params.value!=0){
                  return '在西安人数：'+ params.value
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
            series: series
          };
          chart.clear();
          //渲染地图
          chart.setOption(option);
          chart.off('click');
          chart.on('click', function (params) {
            //省级参数
            //根据路由切换省级表格参数配置
            let paramsURL = _this.handleProDataParams();
           /* let wnewParm={};
            let wurls='';
            if(_this.sendResult=="pops"||_this.sendResult==undefined){
              //人口页面时参w数配置
              wurls=URL.notDeployPlacePager;
              wnewParm={
                date:_this.date,
                code:_this.sendCode,
                flag:1,
                currPage:_this.pagepros.current
              }
            }else if(_this.sendResult=="tours"){
              //旅游页面时参数配置
              wurls=URL.tournotDeployPlacePager;
              if(_this.isWorldreal){
                wnewParm={
                  date:_this.isWorldreData,
                  code:_this.sendCode,
                  flag:1,
                  currPage:_this.pagepros.current,
                  isRealtime:false
                }
              }else {
                wnewParm={
                  date:_this.$route.query.date,
                  code:_this.sendCode,
                  flag:1,
                  currPage:_this.pagepros.current,
                  isRealtime:false
                }
              }
            }*/
            //列表数据初始化pro
            let papro={};
            let urlpro="";
            if(_this.sendResult=="pops"||_this.sendResult==undefined){
              //人口页面时参数配置
              urlpro=URL.notDeployPlace
              papro={
                date:_this.date,
                code:_this.sendCode,
                flag:1
              }
            }else if(_this.sendResult=="tours"){
              //旅游页面时参数配置
              urlpro=URL.tournotDeployPlace;
              if(_this.isWorldreal){
                papro={
                  date:_this.isWorldreData,
                  code:_this.sendCode,
                  flag:1,
                  isRealtime:false,
                }
              }else {
                papro={
                  date:_this.$route.query.date,
                  code:_this.sendCode,
                  flag:1,
                  isRealtime:false,
                }
              }
            }
          if(params.name=='China'){
            _this.isChina=true;
            _this.isbts=true;
            _this.iscutry=false;
            _this.isopro=true;
            _this.getProData(paramsURL.wnewParm,paramsURL.wurls);
            _this.getWordNotDeploypro(papro,urlpro)
           setTimeout(()=>{
             _this.ChinaMap();
           },200)
            _this.isword=false;

          }
          })
          window.onresize=chart.resize;
        },
        //切换中国下钻地图
        ChinaMap(){
          let _this=this;
          let chart=_this.chinaEcharts;
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
           var special=[]
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

          chart.clear();
          chart.off('click');
          //地图点击事件
          chart.on('click', function (params) {
            _this.iscity=false;
            _this.isopro=false;
            _this.iscity=true;
            //省级参数
            //根据路由切换省级表格参数配置
            let paramsURL =_this.handleProDataParams();
            var wnewParm={};
            var wurls='';
            if(_this.sendResult=="pops"||_this.sendResult==undefined){
              //人口页面时参w数配置
              wurls=URL.notDeployPlacePager;
              wnewParm={
                pageSize:_this.pagepros.pageSize,
                date:_this.date,
                code:_this.sendCode,
                flag:1,
                currPage:_this.pagepros.current
              }
            }else if(_this.sendResult=="tours"){
              //旅游页面时参数配置
              wurls=URL.tournotDeployPlacePager;
              if(_this.isWorldreal){
                wnewParm={
                  date:_this.isWorldreData,
                  pageSize:_this.pagepros.pageSize,
                  code:_this.sendCode,
                  flag:1,
                  currPage:_this.pagepros.current,
                  isRealtime:false
                }
              }else {
                wnewParm={
                  date:_this.$route.query.date,
                  pageSize:_this.pagepros.pageSize,
                  code:_this.sendCode,
                  flag:1,
                  currPage:_this.pagepros.current,
                  isRealtime:false
                }
              }
            }
            //根据路由切换地市表格数据参数
            let wpro={};
            let wurlm='';
            if(_this.sendResult=="pops"||_this.sendResult==undefined){
              //人口页面时参数配置
              wurlm=URL.queryNotDeployCityPager;
              wpro={
                code:_this.sendCode,
                flag:1,
                currPage:_this.pagecitys.current,
                date:_this.date,
                cityName:params.data.name,
                pageSize:_this.pagecitys.pageSize,
              }
            }else if(_this.sendResult=="tours"){
              //旅游页面时参数配置
              wurlm=URL.tourqueryNotDeployCityPager;
              if(_this.isWorldreal){
                wpro={
                  code:_this.sendCode,
                  flag:1,
                  currPage:_this.pagecitys.current,
                  date:_this.isWorldreData,
                  cityName:params.data.name,
                  pageSize:_this.pagecitys.pageSize,
                  isRealtime:false
                }
              }else {
                wpro={
                  code:_this.sendCode,
                  flag:1,
                  currPage:_this.pagecitys.current,
                  date:_this.$route.query.date,
                  cityName:params.data.name,
                  pageSize:_this.pagecitys.pageSize,
                  isRealtime:false
                }
              }
            }
            //根据路由切换参数市级地图
            var wparmCty={};
            var wurlCty='';
            if(_this.sendResult=="pops"||_this.sendResult==undefined){
              //人口页面时参数配置
              wurlCty=URL.queryNotDeployCity;
              wparmCty={
                date:_this.date,
                flag:1,
                cityName:params.data.name,
                code:_this.sendCode
              }
            }else if(_this.sendResult=="tours"){
              //旅游页面时参数配置
              wurlCty=URL.tourqueryNotDeployCity;
              if(_this.isWorldreal){
                wparmCty={
                  date:_this.isWorldreData,
                  flag:1,
                  cityName:params.data.name,
                  code:_this.sendCode,
                  isRealtime:false
                }
              }else {
                wparmCty={
                  date:_this.$route.query.date,
                  flag:1,
                  cityName:params.data.name,
                  code:_this.sendCode,
                  isRealtime:false
                }
              }

            }
            if(params.data.mark!=1){
              _this.getWordNotDeployCity(wparmCty,wurlCty)
              _this.getCityDta(wpro,wurlm)
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
                _this.getProData(wnewParm,wurls);
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
              _this.getProData(paramsURL.wnewParm,paramsURL.wurls);
            }
          });
          //双击省地图返回中国地图图
          chart.on('dblclick',(params)=>{
            //处理省级列表参数
            let paramsURL =this.handleProDataParams();
            if( params.seriesName in provinces){
              //如果是【直辖市/特别行政区】只有二级下钻
              if(special.indexOf( params.seriesName ) >=0){
                renderMap('全国地图',mapdata);
              }else {
                renderMap('全国地图',mapdata);
                this.iscity=false;
                this.isopro=true;
                this.iscity=false;
                this.getProData(paramsURL.wnewParm,paramsURL.wurls);
              }
            }

          })
          //初始化绘制全国地图配置
          var option = {
            backgroundColor: '#fcf9f2',
            title : {
              text: '中国地图',
              subtext: '三级下钻',
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
                if(params.data.value!=0){
                  return params.data.name+'<br/>'+ params.data.value+'人'
                }else {
                  return '暂无数据'
                }
                // return params.data.name+'<br/>'+ params.data.value+'万人'
              }
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
        }
      }
    }
</script>

<style scoped>
  #fechMap{
    width: 100%;
    height:calc(100% - 125px);
  }
 .bacword{
   display: inline-block;
   width: 100px;
   height: 25px;
   border: 1px solid #cecfd0;
   color: #5d758f;
   line-height: 25px;
   text-align: center;
   border-radius: 5px;
   margin-left:326px;
   cursor: pointer;
 }
  #fechContent > .fechLeft > #fechtable{
   /*height:100%;*/
  }
  #echartsoforigin #fechContent > .fechLeft > .half-h{
    height:70%;
  }
  #echartsoforigin #fechContent > .fechLeft > .all-h{
    height:100%;
  }
  #fechContent > .fechLeft > #fechtable > .fechtablebody{
    height:calc(100% - 60px);
  }
  .static-chart{
    width: 100%;
    height:30%;
  }
</style>

