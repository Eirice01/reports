<template>
  <div id="trafficMap-tool">
    <!--地图工具栏-->
    <div id="singlePointInfo" >
      <div id="pointContent">
        <!--<p>{{areaName}}</p>-->
        <p>当前道路人数：</p>
        <div><span style="font-size: 30px;color: #f4a563">{{count}}</span><span>人</span></div>
      </div>
    </div>
    <div id="map-echart-box">
      <p class="map-echart-text">
        <span>当前道路人数：</span>
        <span style="font-size: 30px;color: #f4a563">{{popCount}}</span>人</p>
      <div id="map-echart">

      </div>
    </div>
  </div>

</template>

<script>
  import {URL} from "../../../api/urlsConfig"
  export default {
    name: "traffic-map-tool",
    data(){
      return{
        areaName:"",
        count:"",
        popCount:0,
        areaId:'',
        showEchart:false,
        numChart:null,
        relationActiveLineData :{
          x:[],
          y:[]
        },
      }
    },
    props:[
      'dateData',
      'isRealtime',
      'rightSliderVal',
      'maxData'
    ],
    watch:{
    },
    mounted(){
      initMap('traffic-modal', true, false, true, true,URL.isDebug);
      changeLayer(1);
      this.mapEvent();
    },
    methods: {
      //todo:加载地图线路人数 long time, String minPercent, String maxPercent, String maxNum ,boolean isRealtime
      showPeoCount(data){
        if(this.$route.name=='traffic'){
          this.$emit("queryRightSliderNum",data)
        }
        removeAllFeatures();
        this.showLine(data.roadList);
      },
      resetRoadData(){
        var vectorLayer = com.jiusuo.map.tMap.getVectorLayer('baseVector');
        var features =  vectorLayer.getSource().getFeatures();
        for(var i=0;i<features.length;i++){
          if(features[i].getGeometry().getType()=="LineString") {
            var stroke = new com.jiusuo.map.style.TStroke({color: 'rgba(0, 252, 255,0.5)', width: 2});
            var fill = new com.jiusuo.map.style.TFill({color: 'rgba(0, 252, 255,0.2)'});
            var style = new com.jiusuo.map.style.TStyle({fill: fill, stroke: stroke});
            features[i].setStyle(style);
            let properties = {"info":undefined};
            features[i].setProperties(properties);
          }
        }
      },
      loadLine(params) {
        this.$http.request({
          method: 'get',
          params:params,
          url: URL.lineCount,
          success: (data) => {
            this.showLine(data.data.roadList);
          },
          error: (data) => {
            this.$Message.warning('获取失败！');
          }
        });
      },
      showLine(data) {
        for (var i = 0; i < data.length; i++) {
          var item = data[i];
          var stroke = new com.jiusuo.map.style.TStroke({color: item.color, width: 2});
          var fill = new com.jiusuo.map.style.TFill({color:item.color});
          var style = new com.jiusuo.map.style.TStyle({fill: fill, stroke: stroke});
          let info = item.properties==undefined?undefined:item.properties.info;
          let properties = [["info", info]];
          com.jiusuo.map.tMap.addTGeometry(item.geojson, style,properties);
        }
      },
      mapEvent(){
        var homeThis = this;
        var map = com.jiusuo.map.tMap.getOMap();
        var element = document.getElementById('singlePointInfo');
        map.on('pointermove',function (evt) {
          if(evt.dragging){
            return;
          }
          var pixel = map.getEventPixel(evt.originalEvent);
          var feature = map.forEachFeatureAtPixel(pixel,function (feature) {
            return feature;
          });
          var overlay = new ol.Overlay({
            element: element,
            positioning: 'bottom-center'
          });
          if(feature && feature.getProperties().info){
            var coordinate = evt.coordinate;
            var item = feature.getProperties().info;
            element.style.display = 'block';
            homeThis.areaName = item.id;
            homeThis.count = item.count;
            map.addOverlay(overlay);
            overlay.setPosition(coordinate);
          }
          else if(feature && feature.getProperties().info==undefined){
            overlay.setPosition(undefined);
          }
        })
        map.on('click',function (evt) {
          if(evt.dragging){
            return;
          }
          var pixel = map.getEventPixel(evt.originalEvent);
          var feature = map.forEachFeatureAtPixel(pixel,function (feature) {
            return feature;
          });
          if(feature && feature.getProperties().info){
            this.showEchart = true;
            let coordinate = evt.coordinate;
            let item = feature.getProperties().info;
            homeThis.areaName = item.areaId;
            homeThis.popCount = item.count;
            homeThis.areaId = item.id;
            let element = document.getElementById('map-echart-box');
            element.style.display = 'block';
            homeThis.queryTrafficTrends();
            let overlay = new ol.Overlay({
              element: element,
              positioning: 'bottom-center'
            });
            map.addOverlay(overlay);
            overlay.setPosition(coordinate);
          }else{
            document.getElementById('map-echart-box').style.display = 'none';
            // homeThis.numChart.clear();
            homeThis.numChart = null;
          }
        })
      },
      /*获取点击交通路线折线图数据*/
      queryTrafficTrends(){
        let params ={
          startTime:(new Date(`${this.dateData.split(' ')[0]} 00:00`).getTime())/1000,
          endTime:new Date(this.dateData).getTime()/1000,
          id:this.areaId,
          isRealtime:this.isRealtime
        };
        this.$http.request({
          method:"get",
          params:params,
          url:URL.queryTrafficTrends,
          success:(data) => {
            this.relationActiveLineData.x=data.data.xlist;
            this.relationActiveLineData.y=data.data.ylist;
            this.initRelationActiveLine();
          },
          error : (data) => {
          }
        });
      },
      /*人数变化折线图初始化*/
      initRelationActiveLine(){
        this.numChart =this.$echarts.init(document.querySelector("#map-echart"));
        let option = {
          title:{
            text:"人数变化",
            show:false,
            textStyle:{
              color:"#fff",
              fontSize:14,
              fontWeight:'normal',
            },
            textAlign:'left'
          },
          tooltip : {
            trigger: "axis"
          },
          /*legend: {
            data:["总量","刚需"],
            right:'10%',
            textStyle:{
              color:"#fff"
            }
          },*/
          grid:{
            bottom:40,
            right:"8%",
            left:45,

          },
          calculable : true,
          color:['#00ffb4','#00F0F4','#7ED321','#CE47CC','#17B9C6'],
          xAxis : [
            {
              type : "category",
              boundaryGap : false,
              data : this.relationActiveLineData.x,
              axisLabel:{
                color:"#fff",
              },
              axisLine:{
                lineStyle:{
                  color:"#fff",
                }
              }
            }
          ],
          yAxis : [
            {
              type : "value",
              name :"人数",
              axisLabel:{
                margin: 5,
                color:"#fff",
              },
              axisLine:{
                lineStyle:{
                  color:"#fff",
                }
              },
              splitLine:{
                lineStyle:{
                  type:'dotted',
                  color:"#2D3854"
                }
              }
            }
          ],
          dataZoom:[
            {
              type:'inside',
              show:true,
            }
          ],
          series : [
            {
              name:"",
              type:"line",
              data:this.relationActiveLineData.y,
              areaStyle:{
                normal:{
                  color:new this.$echarts.graphic.LinearGradient(0,0,0,1,[{
                    offset:0,
                    color:'rgba(94,236,0,0.39)'
                  },{
                    offset:.34,
                    color:'rgba(94,236,0,0.25)'
                  },{
                    offset:1,
                    color:'rgba(94,236,0,0.00)'
                  }
                  ])
                }
              },
            },
          ]
        };
        this.numChart.setOption(option);
        window.addEventListener("resize", ()=>{
          if(this.numChart){
            this.numChart.resize()
          }
        });
      },
    }
  }
</script>

<style scoped>
  #singlePointInfo {
    display: block;
    width: 120px;
    background-color: rgba(58,102,132,0.5);
    color: #fff;
    text-align: center;
    border-radius: 6px;
    position: absolute;
    z-index: 1;
    top: -70px;
    left: 5px;
    padding: 5px 0 5px 12px;
  }
  #singlePointInfo::after {
    content: '';
    position: absolute;
    border: 5px solid transparent;
    border-right-color: #666784;
  }
  #pointContent {
    width: 100%;
    height: 100%;
    overflow: auto;
  }
  #map-echart-box{
    display: none;
    width: 500px;
    height: 240px;
    background-color: rgba(58,102,132,0.5);
    border-radius: 6px;
    position: absolute;
    z-index: 999;
    top: -240px;
    left: -500px;
    padding: 5px 0 5px 12px;
  }
  #map-echart{
    width: 500px;
    height: 200px;
  }
  .map-echart-text{
    color: #fff;
    width: 100%;
    height: 30px;
    line-height: 30px;
  }
</style>
