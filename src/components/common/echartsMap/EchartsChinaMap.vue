<template>
  <div id="echartsChinaMap">
   <div class="fechMapContent">
      <div class="mapLeft">
        <div id="chinaMap" ref="fechmap"></div>
      </div>
      <div class="mapright">
        <div id="fechtable">
          <div class="fechtablebody">
            <Table  stripe :columns="Currentcolumns" :data="CurrentData" size="small"></Table>
          </div>
          <div class="fcs-page" style="margin-top: 15px" v-show="ispage">
            <Row type="flex" justify="end" align="middle">
              <Page :total="pageParams.totalCount" show-total size="small" :page-size="pageParams.pageSize"
                    :current="pageParams.current"  @on-change="changePage"></Page>
            </Row>
          </div>
          <div class="fcs-page  op" style="margin-top: 15px" v-show="!ispage">
            <Row type="flex" justify="end" align="middle" >
              <Page :total="citypages.totalCountS" show-total size="small" :page-size="citypages.pageSizeS"
                    :current="citypages.currentS"  @on-change="changeCityPage"></Page>
            </Row>
          </div>
        </div>
      </div>
   </div>
  </div>
</template>

<script>
  import {URL} from '../../../../api/urlsConfig'
  export default {
    name: "echartschinamap",
    data() {
      return {
        date:'',
        ispro:true,
        ispage:true,
        mapprodata:[],
        mapcitydata:[],
        currentpros:'',
        titleTime:'',
        Currentcolumns:[],
        CurrentData:[],
        citypages:{
          totalCountS:0,
          pageSizeS : 18,
          currentS : 1
        },
        pageParams : {
          totalCount: 0,
          pageSize : 18,
          current : 1
        },
        columns8:[
          {
            // type: 'index',
            title: "序号",
            width: 90,
            align: 'center',
            render:(h,params) => {
              return h('div',[
                h('span',(params.index+1)+this.pageParams.pageSize*(this.pageParams.current-1))
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
                h('span',(params.index+1)+this.citypages.pageSizeS*(this.citypages.currentS-1))
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
            "width":124,
            "align":"center"
          },
        ],
        mapEcharts:null,
      }
    },
    inject:[
      "initDate",
      "titletimes"
    ],
    components: {},
    props:[
      "ChinaMapData"
    ],
    watch:{
      ChinaMapData:{
        handler:function(){
          this.getNotDeploypro();
          this.Currentcolumns=this.columns8;
        },
        deep:true
      }
    },
    created() {

    },
    mounted(){
      this.mapEcharts = this.$echarts.init(document.querySelector("#chinaMap"));
      this.getNotDeploypro();
      this.Currentcolumns=this.columns8;
    },
    methods:{
      //获取地图数据传送并导出
      getMapDataAndSend(){
        var myChart=this.$echarts.getInstanceByDom(document.getElementById("chinaMap"));
        console.log( myChart.getOption().series[0].data)
        return   myChart.getOption().series[0].data


      },
      //处理中国地图参数
      handleNotDeployproParams(){
        let params ={};
        if(this.$route.query.type =='pop'){
          params ={
            date:"",
            code:'',
            flag:"",
            genReParam:`${this.ChinaMapData.params.date},${this.ChinaMapData.params.cityOrDev},${this.ChinaMapData.params.cityCode},${this.ChinaMapData.params.dayOrNight},${this.ChinaMapData.params.peopleType},${this.ChinaMapData.params.originOrBelong},${this.ChinaMapData.params.originOrBelongCode},${this.ChinaMapData.params.pid}`
          }
        }else if(this.$route.query.type =='tour'){
          params ={
            date:this.ChinaMapData.params.date,
            areaCode:this.ChinaMapData.params.areaCode,
            isBelong:this.ChinaMapData.params.isBelong,
            obList:this.ChinaMapData.params.obList,
            timeType:this.ChinaMapData.params.timeType,//时间类型 0:分钟，1:日，2:月
            isPoint:this.ChinaMapData.params.isPoint,//1时间点，0时间段；
            peopleFrom:this.ChinaMapData.params.peopleFrom,//人口来源模块 没值0有值1
            type:this.ChinaMapData.params.type,
            pid:"CN",
            peopleState:this.ChinaMapData.params.peopleState
          };
        }
        return params;
      },
      //处理省份列表参数
      handleProListParams(){
        let params={};
        if(this.$route.query.type =='pop'){
          params={
            code:'',
            flag:'',
            date:'',
            pageSize:this.pageParams.pageSize,
            currPage:this.pageParams.current,
            genReParam:`${this.ChinaMapData.params.date},${this.ChinaMapData.params.cityOrDev},${this.ChinaMapData.params.cityCode},${this.ChinaMapData.params.dayOrNight},${this.ChinaMapData.params.peopleType},${this.ChinaMapData.params.originOrBelong},${this.ChinaMapData.params.originOrBelongCode},${this.ChinaMapData.params.pid}`
          }
        }else if(this.$route.query.type =='tour'){
          params ={
            date:this.ChinaMapData.params.date,
            areaCode:this.ChinaMapData.params.areaCode,
            isBelong:this.ChinaMapData.params.isBelong,
            obList:this.ChinaMapData.params.obList,
            timeType:this.ChinaMapData.params.timeType,//时间类型 0:分钟，1:日，2:月
            isPoint:this.ChinaMapData.params.isPoint,//1时间点，0时间段；
            peopleFrom:this.ChinaMapData.params.peopleFrom,//人口来源模块 没值0有值1
            type:this.ChinaMapData.params.type,
            pageSize:this.pageParams.pageSize,
            currPage:this.pageParams.current,
            pid:"CN",
            peopleState:this.ChinaMapData.params.peopleState
          };
        }
        return params;
      },
      //处理市地图参数
      handleNotDeployCityParams(data){
        let params ={};
        if(this.$route.query.type =='pop'){
          params={
            date:'',
            flag:'',
            cityName:data.data.name,
            code:'',
            genReParam:`${this.ChinaMapData.params.date},${this.ChinaMapData.params.cityOrDev},${this.ChinaMapData.params.cityCode},${this.ChinaMapData.params.dayOrNight},${this.ChinaMapData.params.peopleType},${this.ChinaMapData.params.originOrBelong},${this.ChinaMapData.params.originOrBelongCode},${this.ChinaMapData.params.pid}`
          }
        }else if(this.$route.query.type =='tour'){
          params ={
            date:this.ChinaMapData.params.date,
            areaCode:this.ChinaMapData.params.areaCode,
            isBelong:this.ChinaMapData.params.isBelong,
            obList:this.ChinaMapData.params.obList,
            timeType:this.ChinaMapData.params.timeType,//时间类型 0:分钟，1:日，2:月
            isPoint:this.ChinaMapData.params.isPoint,//1时间点，0时间段；
            peopleFrom:this.ChinaMapData.params.peopleFrom,//人口来源模块 没值0有值1
            type:this.ChinaMapData.params.type,
            cityName:data.data.name,
            peopleState:this.ChinaMapData.params.peopleState
          };
        }
        return params;

      },
      //处理市级列表参数
      handleCityListParams(currPage){
        let params ={};
        if(this.$route.query.type =='pop'){
          params={
            flag:'',
            code:'',
            cityName:this.currentpros,
            date:'',
            pageSize:this.citypages.pageSizeS,
            currPage:currPage,
            genReParam:`${this.ChinaMapData.params.date},${this.ChinaMapData.params.cityOrDev},${this.ChinaMapData.params.cityCode},${this.ChinaMapData.params.dayOrNight},${this.ChinaMapData.params.peopleType},${this.ChinaMapData.params.originOrBelong},${this.ChinaMapData.params.originOrBelongCode},${this.ChinaMapData.params.pid}`
          }
        }else if(this.$route.query.type =='tour'){
          params ={
            date:this.ChinaMapData.params.date,
            areaCode:this.ChinaMapData.params.areaCode,
            isBelong:this.ChinaMapData.params.isBelong,
            obList:this.ChinaMapData.params.obList,
            timeType:this.ChinaMapData.params.timeType,//时间类型 0:分钟，1:日，2:月
            isPoint:this.ChinaMapData.params.isPoint,//1时间点，0时间段；
            peopleFrom:this.ChinaMapData.params.peopleFrom,//人口来源模块 没值0有值1
            type:this.ChinaMapData.params.type,
            pageSize:this.citypages.pageSizeS,
            currPage:currPage,
            cityName:this.currentpros,
            peopleState:this.ChinaMapData.params.peopleState
          };
        }
        return params;
      },
      //获取地图上省份数据date 时间
      //Flag  0来源地 1归属地
      //Code 地图上选中的行政区，开发区
      getNotDeploypro(){
        let params =this.handleNotDeployproParams();
        let url ="";
        if(this.$route.query.type=="pop"){
          url=URL.notDeployPlace;
          this.$http.request({
            method:'get',
            params:params,
            url:url,
            success:(data) => {
              this.mapprodata=data.data;
              this.MapCharts();
              let paramsList =this.handleProListParams()
              this.getProData(paramsList);
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });
        }else if(this.$route.query.type=="tour"){
          url =URL.notDeployPlace2;
          this.$http.request({
            method:'post',
            data:params,
            url:url,
            success:(data) => {
              this.mapprodata=data.province;
              this.MapCharts()
              let paramsList =this.handleProListParams()
              this.getProData(paramsList);
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });
        }else if(this.$route.query.isrep=='true'){
          url=URL.notDeployPlace;
          this.$http.request({
            method:'get',
            params:params,
            url:url,
            success:(data) => {
              this.mapprodata=data.data;
              this.MapCharts()
              let paramsList =this.handleProListParams()
              this.getProData(paramsList);
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
      getNotDeployCity(parms){
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
          url=URL.queryNotDeployCity2;
          this.$http.request({
            method:'post',
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
      //处理省级分页
      changePage(current){
        this.pageParams.current = current;
        let paramsList =this.handleProListParams()
        this.getProData(paramsList)
      },
      //市级数据分页
      changeCityPage(current){
        this.citypages.currentS = current;
        let newParms = this.handleCityListParams(this.citypages.currentS);
        this.getCityDta(newParms)
      },
      //获取省份分页数据
      getProData(parms){
        this.ispage=true;
        let url ="";
        if(this.$route.query.type=="pop"){
          url=URL.notDeployPlacePager;
          this.$http.request({
            method:'get',
            params:parms,
            url:url,
            success:(data) => {
              let res =data.data;
              this.CurrentData=res.list;
              this.pageParams.totalCount=parseInt(res.totalCount);
              this.pageParams.pageSize=parseInt(res.pageSize);
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });
        }else if(this.$route.query.type=="tour") {
          url = URL.notDeployPlacePager2;
          this.$http.request({
            method:'post',
            data:parms,
            url:url,
            success:(data) => {
              let res =data.page;
              this.CurrentData=res.list;
              this.pageParams.totalCount=parseInt(res.totalCount);
              this.pageParams.pageSize=parseInt(res.pageSize);
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });
        }else if(this.$route.query.isrep=='true'){
          url=URL.notDeployPlacePager;
          this.$http.request({
            method:'get',
            params:parms,
            url:url,
            success:(data) => {
              let res =data.data;
              this.CurrentData=res.list;
              this.pageParams.totalCount=parseInt(res.totalCount);
              this.pageParams.pageSize=parseInt(res.pageSize);
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });
        }

      },
      //市级地图对应列表数据
      getCityDta(pro){
        this.ispage=false;
        let url ="";
        if(this.$route.query.type=="pop"){
          url=URL.queryNotDeployCityPager;
          this.$http.request({
            method:'get',
            params:pro,
            url:url,
            success:(data) => {
              let res =data.data;
              this.CurrentData=res.list;
              this.citypages.totalCountS=parseInt(res.totalCount);
              this.citypages.pageSizeS=parseInt(res.pageSize);
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });
        }else if(this.$route.query.type=="tour"){
          url =URL.queryNotDeployCityPager2;
          this.$http.request({
            method:'post',
            data:pro,
            url:url,
            success:(data) => {
              let res =data.page;
              this.CurrentData=res.list;
              this.citypages.totalCountS=parseInt(res.totalCount);
              this.citypages.pageSizeS=parseInt(res.pageSize);
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
              this.CurrentData=res.list;
              this.citypages.totalCountS=parseInt(res.totalCount);
              this.citypages.pageSizeS=parseInt(res.pageSize);
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
        let chart=this.mapEcharts;
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
          "北京": "beijing",
          "天津": "tianjin",
          "上海": "shanghai",
          "重庆": "chongqing",
          //2个特别行政区
          "香港特别行政区": "xianggang",
          "澳门特别行政区": "aomen"
        };

        //直辖市和特别行政区-只有二级地图，没有三级地图
        var special = ["北京","天津","上海","重庆","香港","澳门"];
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
          renderMap('全国地图',d);
        });
        //地图点击事件
        chart.off('click');
        chart.on('click', function (params) {
          if(params.data!=undefined){
            _this.currentpros=params.data.name;
            if(params.data.mark!=1){
              let parms = _this.handleCityListParams(1);
              _this.citypages.currentS =1;
              _this.getCityDta(parms);
              let news =_this.handleNotDeployCityParams(params);
              _this.getNotDeployCity(news)
              _this.Currentcolumns=_this.columns9
            }
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
              _this.Currentcolumns=_this.columns8

              _this.pageParams.current =1;
              let parms =_this.handleProListParams();
              _this.getProData(parms);
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
            // _this.queryNotDeployCity(params)
            renderMap('全国地图',mapdata);
            _this.Currentcolumns=_this.columns8;
            _this.pageParams.current =1;
            let parms =_this.handleProListParams(); //参数哪一个
            _this.getProData(parms);
          }
        });
        //双击省地图返回中国地图
        chart.on('dblclick',(params)=>{
          //如果是【直辖市/特别行政区】只有二级下钻
          if(params.seriesName in provinces){
            if(  special.indexOf( params.seriesName ) >=0  ){
              renderMap('全国地图',mapdata);
            }else {
              renderMap('全国地图',mapdata);
              this.Currentcolumns=this.columns8;
              this.pageParams.current =1;
              let parms =this.handleProListParams();
              this.getProData(parms);
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
            max:1000,
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
              if(params.data!=undefined&&params.data.value!=undefined){
                return params.data.name+'<br/>'+ params.data.value+'人'
              }else {
                return '暂无数据'
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
          chart.clear();
          chart.setOption(option);
        }
      },
    }

  }
</script>

<style scoped  lang="less">
#echartsChinaMap{
  width: 100%;
  height: 100%;
  >.fechMapContent{
    width: 100%;
    height:100%;
    padding:10px;
    box-sizing:border-box;
    display: flex;
    >.mapLeft{
      width:calc(100% - 417px);
      height:900px;
    }
    >.mapright{
      width: 417px;
      height:825px;
      >#fechtable{
        width: 100%;
        height: 100%;
        background: #fcf9f2;
        >.fechtablebody{
          height: calc(100% - 42px);
          overflow: auto;
        }
      }
    }
  }
}

</style>
