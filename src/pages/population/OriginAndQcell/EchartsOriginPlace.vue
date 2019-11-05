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
        <div class="righttitle">
          人口构成-来源地（非西安）
        </div>
        <div id="fechMap" ref="fechmap"></div>
      </div>
      <div class="fechLeft">
        <div id="fechtable">
          <div class="fechtablebody">
              <Table  stripe :columns="Currentcolumns" :data="CurrentData" size="small"></Table>
          </div>
          <div class="fcs-page" style="margin-top: 30px" v-show="ispage">
            <Row type="flex" justify="end" align="middle" >
              <Page :total="pageParams.totalCount" show-total size="small" :page-size="pageParams.pageSize"
                    :current="pageParams.current"  @on-change="changePage"></Page>
            </Row>
          </div>
          <div class="fcs-page  op" style="margin-top: 30px" v-show="!ispage">
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
  import cityMap from './js/citymap'
  import {URL} from '../../../../api/urlsConfig'
  export default {
    name: "echartsoriginplace",
    data(){
      return {
        date:'',
        sendCode:'',
        areaName:'',
        areaNames:'',
        ispro:true,
        ispage:true,
        isTypes:'',
        mapprodata:[],
        mapcitydata:[],
        currentpros:'',
        titleTime:'',
        Currentcolumns:[],
        CurrentData:[],
        citypages:{
          totalCountS:11,
          pageSizeS : 20,
          currentS : 1
        },
        pageParams : {
          totalCount: 30,
          pageSize : 17,
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
                h('span',(params.index+1)+this.citypages.pageSize*(this.citypages.currentS-1))
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
        isreal:'',
        isreData:'',
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
      //时间
      if(this.$route.query.sendData!=undefined&&this.$route.query.isTypes==true){
        this.titleTime=this.$route.query.sendData;
      }else {
        this.date=this.$route.query.date.replace(/-/g,'');
        // this.titleTime=this.date.substring(0,4)+'年'+this.date.substring(4,6)+'月'+this.date.substring(6)+'日';
        this.titleTime=this.date.substring(6)==''?this.date.substring(0,4)+'-'+this.date.substring(4,6)+'-':this.date.substring(0,4)+'-'+this.date.substring(4,6)+'-'+this.date.substring(6);
      }
      this.sendCode=this.$route.query.code;
      this.isTypes=this.$route.query.istype;
      this.isreal=this.$route.query.isTypes;
      this.isreData=this.$route.query.sendData;
      //列表数据初始化
      let parm={};
      let url="";
      if(this.isTypes=="pops"||this.isTypes==undefined){
        //人口页面时参数配置
        url=URL.notDeployPlace
        parm={
          date:this.date,
          code:this.sendCode,
          flag:0
        }
      }else if(this.isTypes=="tours"){
        //旅游页面时参数配置
        url=URL.tournotDeployPlace;
        if(this.isreal){
          parm={
            date:this.isreData,
            code:this.sendCode,
            flag:0,
            isRealtime:false,
          }
        }else {
          parm={
            date:this.$route.query.date,
            code:this.sendCode,
            flag:0,
            isRealtime:false,
          }
        }

      }
      //根据路由条件
      this.getNotDeploypro(parm,url);
      this.Currentcolumns=this.columns8;
      // tournotDeployPlacePager
      //根据路由条件切换参数
      let newParm={};
      let urls='';
      if(this.isTypes=="pops"||this.isTypes==undefined){
        //人口页面时参数配置
        urls=URL.notDeployPlacePager;
        newParm={
          code:this.sendCode,
          flag:0,
          date:this.date,
          pageSize:this.pageParams.pageSize,
          currPage:1
        }
      }else if(this.isTypes=="tours"){
        //旅游页面时参数配置
        urls=URL.tournotDeployPlacePager;
        if(this.isreal){
          newParm={
            code:this.sendCode,
            flag:0,
            date:this.isreData,
            pageSize:this.pageParams.pageSize,
            currPage:1,
            isRealtime:false
          }
        }else {
          newParm={
            code:this.sendCode,
            flag:0,
            date:this.$route.query.date,
            pageSize:this.pageParams.pageSize,
            currPage:1,
            isRealtime:false
          }
        }

      }
    this.getProData(newParm,urls);

    },
    methods:{
     //获取地图上省份数据date 时间 //人口模块
      //Flag  0来源地 1归属地
      //Code 地图上选中的行政区，开发区
     getNotDeploypro(parm,url){
       this.$http.request({
         method:'get',
         params:parm,
         url:url,
         success:(data) => {
           this.mapprodata=data.data;
           this.MapCharts()
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
      getNotDeployCity(parms,url){
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
  //返回
      backIndexInfo(){
        if(this.$route.query.istype=='pops'||this.$route.query.istype==undefined){
          this.$router.push({
            name: 'population',
            query:{
              istype:"pops",
              oldtypes:this.$route.query.oldtype,
              date:this.$route.query.oldtime,
              areaCode:this.$route.query.code,
              areaName:this.$route.query.areaName,
              // date:this.$route.query.date
            }
          });
          /*this.$emit("getAreaCode",this.areaCode,this.areaName);*/
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
      //处理分页
      changePage(current){
        this.pageParams.current = current;
        //根据路由条件切换参数
        let newParm={};
        let urls='';
        if(this.isTypes=="pops"||this.isTypes==undefined){
          //人口页面时参数配置
          urls=URL.notDeployPlacePager;
          newParm={
            flag:0,
            code:this.sendCode,
            date:this.date,
            pageSize:this.pageParams.pageSize,
            currPage:this.pageParams.current
          }
        }else if(this.isTypes=="tours"){
          //旅游页面时参数配置
          urls=URL.tournotDeployPlacePager;
          if(this.isreal){
            newParm={
              code:this.sendCode,
              flag:0,
              date:this.isreData,
              pageSize:this.pageParams.pageSize,
              currPage:this.pageParams.current,
              isRealtime:false
            }
          }else {
            newParm={
              code:this.sendCode,
              flag:0,
              date:this.$route.query.date,
              pageSize:this.pageParams.pageSize,
              currPage:this.pageParams.current,
              isRealtime:false
            }
          }

        }
        this.getProData(newParm,urls)
      },
      //市级数据分页
      changeCityPage(current){
        this.citypages.currentS = current;
        //根据路由切换参数
        let pro={};
        let url='';
        if(this.isTypes=="pops"||this.isTypes==undefined){
          //人口页面时参数配置
          url=URL.queryNotDeployCityPager;
          pro={
            flag:0,
            code:this.sendCode,
            cityName:this.currentpros,
            date:this.date,
            pageSize:this.citypages.pageSizeS,
            currPage:this.citypages.currentS
          }
        }else if(this.isTypes=="tours"){
          //旅游页面时参数配置
          url=URL.tourqueryNotDeployCityPager;
          if(this.isreal){
            pro={
              flag:0,
              code:this.sendCode,
              cityName:this.currentpros,
              date:this.isreData,
              pageSize:this.citypages.pageSizeS,
              currPage:this.citypages.currentS,
              isRealtime:false
            }
          }else {
            pro={
              flag:0,
              code:this.sendCode,
              cityName:this.currentpros,
              date:this.$route.query.date,
              pageSize:this.citypages.pageSizeS,
              currPage:this.citypages.currentS,
              isRealtime:false
            }
          }
        }
        this.getCityDta(pro,url)
      },
      //获取省份分页数据
      getProData(parms,urls){
        this.ispage=true;
        this.$http.request({
          method:'get',
          params:parms,
          url:urls,
          success:(data) => {
            let res =data.data;
            this.CurrentData=res.list;
            this.pageParams.totalCountS=parseInt(res.totalCount);
            this.pageParams.pageSize=parseInt(res.pageSize);
          },
          error : (data) => {
            this.$Message.warning('请求数据失败！');
          }
        });
      },
      //市级地图对应图标数据
      getCityDta(pro,url){
        this.ispage=false;
        this.$http.request({
          method:'get',
          params:pro,
          url:url,
          success:(data) => {
            let res =data.data;
            this.CurrentData=res.list;
            this.citypages.totalCountS=parseInt(res.totalCount);
            this.citypages.pageSize=parseInt(res.pageSize);
          },
          error : (data) => {
            this.$Message.warning('请求数据失败！');
          }
        });
      },
      //处理省表格接口参数
      handleGetProDataParams(){
       let paramsURL={
         newParm:{},
         urls:""
       }
        /*var newParm={};
        var urls='';*/
        if(this.isTypes=="pops"||this.isTypes==undefined){
          //人口页面时参数配置
          paramsURL.urls=URL.notDeployPlacePager;
          paramsURL.newParm={
            flag:0,
            code:this.sendCode,
            date:this.date,
            pageSize:this.pageParams.pageSize,
            currPage:1
          }
        }else if(this.isTypes=="tours"){
          //旅游页面时参数配置
          paramsURL.urls=URL.tournotDeployPlacePager;
          if(this.isreal){
            paramsURL.newParm={
              code:this.sendCode,
              flag:0,
              date:this.isreData,
              pageSize:this.pageParams.pageSize,
              currPage:1,
              isRealtime:false
            }
          }else {
            paramsURL.newParm={
              code:this.sendCode,
              flag:0,
              date:this.$route.query.date,
              pageSize:this.pageParams.pageSize,
              currPage:this.pageParams.current,
              isRealtime:false
            }
          }
        }
        return paramsURL;
      },
      //
      MapCharts(){
        let _this=this;
        let chart=_this.$echarts.init(this.$refs.fechmap);
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
        var tepCity=["北京","天津","上海","重庆","香港特别行政区","澳门特别行政区","台湾省"];
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
        chart.on('click', function (params) {
           for(let i=0;i<tepCity.length;i++){
             if(tepCity[i]==params.data.name){
               return ;
             }
           }
          _this.currentpros=params.data.name;
          //根据路由切换省级表格参数配置
          var proParamsURL =_this.handleGetProDataParams();
          //根据路由切换地市表格数据参数
          let pro={};
          let urlm='';
          if(_this.isTypes=="pops"||_this.isTypes==undefined){
            //人口页面时参数配置
            urlm=URL.queryNotDeployCityPager;
            pro={
              flag:0,
              cityName:params.data.name,
              code:_this.sendCode,
              date:_this.date,
              pageSize:_this.pageParams.pageSize,
              currPage:1
            }
          }else if(_this.isTypes=="tours"){

            //旅游页面时参数配置
            urlm=URL.tourqueryNotDeployCityPager;
            if(_this.isreal){
              pro={
                flag:0,
                cityName:params.data.name,
                code:_this.sendCode,
                date:_this.isreData,
                pageSize:_this.pageParams.pageSize,
                currPage:1,
                isRealtime:false
              }
            }else {
              pro={
                flag:0,
                cityName:params.data.name,
                code:_this.sendCode,
                date:_this.$route.query.date,
                pageSize:_this.pageParams.pageSize,
                currPage:1,
                isRealtime:false
              }
            }
          }
          //根据路由切换参数市级地图
          var parmCty={};
          var urlCty='';
          if(_this.isTypes=="pops"||_this.isTypes==undefined){
            //人口页面时参数配置
            urlCty=URL.queryNotDeployCity;
            parmCty={
              date:_this.date,
              flag:0,
              cityName:params.data.name,
              code:_this.sendCode
            }
          }else if(_this.isTypes=="tours"){
            //旅游页面时参数配置
            urlCty=URL.tourqueryNotDeployCity;
            if(_this.isreal){
              parmCty={
                date:_this.isreData,
                flag:0,
                cityName:params.data.name,
                code:_this.sendCode,
                isRealtime:false
              }
            }else {
              parmCty={
                date:_this.$route.query.date,
                flag:0,
                cityName:params.data.name,
                code:_this.sendCode,
                isRealtime:false
              }
            }
          }
          if(params.data.mark!=1){
            _this.getCityDta(pro,urlm)
            _this.getNotDeployCity(parmCty,urlCty)
          }

          _this.Currentcolumns=_this.columns9
          if( params.name in provinces ){
            //如果点击的是34个省、市、自治区，绘制选中地区的二级地图
            setTimeout(()=>{
            $.getJSON('/static/map/province/'+ provinces[params.name] +'.json', function(data){
              // var d = [];
              // console.log(_this.mapcitydata)
              // console.log(data.features)
              // for (var i=0;i<data.features.length;i++){
              //   for( var j=0;j<_this.mapcitydata.length;j++){
              //     if(_.includes(_this.mapcitydata[j].name,data.features[i].properties.name)){
              //       d.push({
              //         name:data.features[i].properties.name,
              //         value:_this.mapcitydata[j].value
              //       })
              //     }
              //   }
              // }
              //
              //   _this.$echarts.registerMap( params.name, data);
              //   renderMap(params.name,d)
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
            // let params={
            //     date:'20190430',
            //     code:'',
            //     flag:0
            //   }

            /*//如果是【直辖市/特别行政区】只有二级下钻

            if(  special.indexOf( params.seriesName ) >=0  ){

              renderMap('全国地图',mapdata);
            }else {
              // _this.queryNotDeployCity(params)
              renderMap('全国地图',mapdata);
              _this.Currentcolumns=_this.columns8
              //根据路由条件切换参数
              _this.getProData(newParm,urls);
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
            _this.Currentcolumns=_this.columns8
            _this.getProData(proParamsURL.newParm,proParamsURL.urls);
          }
        });
        //双击省地图返回中国地图图
        chart.on('dblclick',(params)=>{
          //根据路由切换省级表格参数配置
          let proParamsURL=this.handleGetProDataParams();
          //如果是【直辖市/特别行政区】只有二级下钻
          if(special.indexOf( params.seriesName ) >=0 ){
            renderMap('全国地图',mapdata);
          }else {
            renderMap('全国地图',mapdata);
            this.Currentcolumns=this.columns8
            //根据路由条件切换参数
            this.getProData(proParamsURL.newParm,proParamsURL.urls);
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
              roam: false,     //允许缩放
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

</style>
