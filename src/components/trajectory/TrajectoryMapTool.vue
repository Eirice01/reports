<template>
  <!--地图工具栏-->
  <div id="singlePointInfo" >
    <div id="pointContent">
      <p style="font-size: 16px;color: #f4a563">OD量:{{sumNum}}</p>
      <p style="font-size: 16px;color: #f4a563">刚需量：{{needNum}}</p>
    </div>
  </div>
</template>

<script>
  import {URL} from "../../../api/urlsConfig"
  export default {
    name: "trajectory-map-tool",
    data(){
      return{
        sumNum:"",
        needNum:""
      }
    },
    props:[
      "dateData",
      "sliderTime",
      "btnType",
      "rightSliderVal",
      "roadIds",
      "inOrOut",
      "isRealtime",
      "showType",
      "ODType"
    ],
    watch:{
      btnType(){
        let params ={};
        if(this.$route.name=='trajectorySecond'){
         /* params={
            isRealtime:false,//true实时，false非实时，全部传false、
            date:this.$route.query.dateData,//日期  格式2019-10-10
            startTime:this.$route.query.sliderTime[0],//开始时间 00:00
            endTime:this.$route.query.sliderTime[1],//结束时间 10:00
            startNumber:this.$route.query.rightSliderVal[0],
            endNumber:this.$route.query.rightSliderVal[1],
            intercity:this.$route.query.btnType ,//是否跨市 ""全部  0非跨市  1跨市
            roadIds	:this.$route.query.roadIds	,//两个用,隔开
            inOrOut:"",//		只看流出 out/只看流入 in/全部 ""
          };*/

        }else{
           /*params={
            isRealtime:this.isRealtime,//true实时，false非实时，全部传false、
            date:this.dateData,//日期  格式2019-10-10
            startTime:this.sliderTime[0],//开始时间 00:00
            endTime:this.sliderTime[1],//结束时间 10:00
            startNumber:this.rightSliderVal[0],
            endNumber:this.rightSliderVal[1],
            intercity:this.btnType ,//是否跨市 ""全部  0非跨市  1跨市
            roadIds	:this.roadIds	,//两个用,隔开
            inOrOut:this.inOrOut,//		只看流出 out/只看流入 in/全部 ""
          };*/
        }
        /*this.searchOD(params);*/
      },
      sliderTime(){
        /*let params ={};
        if(this.$route.name=='trajectorySecond'){
          /!*initMap('trajectory-second', true, false, true, true,URL.isDebug);
          this.loadArea();
          this.mapPointerMove(com.jiusuo.map.tMap.getOMap());*!/
          params={
            isRealtime:false,//true实时，false非实时，全部传false、
            date:this.$route.query.dateData,//日期  格式2019-10-10
            startTime:this.$route.query.sliderTime[0],//开始时间 00:00
            endTime:this.$route.query.sliderTime[1],//结束时间 10:00
            startNumber:this.$route.query.rightSliderVal[0],
            endNumber:this.$route.query.rightSliderVal[1],
            intercity:this.$route.query.btnType ,//是否跨市 ""全部  0非跨市  1跨市
            roadIds	:this.$route.query.roadIds	,//两个用,隔开
            inOrOut:"",//		只看流出 out/只看流入 in/全部 ""
          };
        }else{
          params={
            isRealtime:this.isRealtime,//true实时，false非实时，全部传false、
            date:this.dateData,//日期  格式2019-10-10
            startTime:this.sliderTime[0],//开始时间 00:00
            endTime:this.sliderTime[1],//结束时间 10:00
            startNumber:this.rightSliderVal[0],
            endNumber:this.rightSliderVal[1],
            intercity:this.btnType ,//是否跨市 ""全部  0非跨市  1跨市
            roadIds	:this.roadIds	,//两个用,隔开
            inOrOut:this.inOrOut,//		只看流出 out/只看流入 in/全部 ""
          };
        }
        this.searchOD(params);*/
      },
    },
    mounted(){
      let params ={}
      if(this.$route.name=='trajectorySecond'){
        initMap('trajectory-second', true, false, true, true,URL.isDebug);
        this.loadArea();
        this.mapEvent();
      }else if(this.$route.name=="trajectoryThree"){
        initMap('trajectory-three', true, false, true, true,URL.isDebug);
        this.loadArea();
        this.mapPointerMove(com.jiusuo.map.tMap.getOMap());

      }else{
        initMap('trajectory-modal', true, false, true, true,URL.isDebug);
        this.loadArea();
        this.mapEvent();
      }
      changeLayer(1);

    },
    methods: {
      loadArea() {
        this.$http.request({
          method: 'get',
          url: URL.area,
          success: (data) => {
            this.showArea(data);
          },
          error: (data) => {
            this.$Message.warning('获取失败！');
          }
        });
      },
      showArea(data) {
        var stroke = new com.jiusuo.map.style.TStroke({color: 'rgba(0, 32, 64,0.5)', width: 2});
        var fill = new com.jiusuo.map.style.TFill({color: 'rgba(0, 32, 64,0.2)'});
        var style = new com.jiusuo.map.style.TStyle({fill: fill, stroke: stroke});

        for (var i = 0; i < data.length; i++) {
          com.jiusuo.map.tMap.addTGeometry(data[i], style);
        }
        let fId = this.$route.query.roadIds;
        this.changeColor(fId);
        let sId = this.$route.query.secondRoadIds;
        this.changeColor(sId);
      },
      changeColor(fId){
        if(fId){
          if(fId.split(",").length>1){
            var arr = fId.split(",");
            var stroke = new com.jiusuo.map.style.TStroke({color: 'rgba(30,144,255,0.8)', width: 2});
            var fill = new com.jiusuo.map.style.TFill({color: 'rgba(30,144,255,0.5)'});
            var style = new com.jiusuo.map.style.TStyle({fill: fill, stroke: stroke});
            arr.forEach((v,k)=> {
              var f = getFeatureById(v);
              f.setStyle(style);
            })
          }else{
            var f = getFeatureById(fId);
            var stroke = new com.jiusuo.map.style.TStroke({color: 'rgba(30,144,255,0.8)', width: 2});
            var fill = new com.jiusuo.map.style.TFill({color: 'rgba(30,144,255,0.5)'});
            var style = new com.jiusuo.map.style.TStyle({fill: fill, stroke: stroke});
            f.setStyle(style);
          }
        }
      },
      mapEvent(){
        var homeThis = this;
        var map = com.jiusuo.map.tMap.getOMap();
        var stroke = new com.jiusuo.map.style.TStroke({color: 'rgba(30,144,255,0.8)', width: 2});
        var fill = new com.jiusuo.map.style.TFill({color: 'rgba(30,144,255,0.5)'});
        var style = new com.jiusuo.map.style.TStyle({fill: fill, stroke: stroke});
        var arr = [];
        map.on('click', function (evt) {
          if (evt.dragging) {
            return;
          }
          var pixel = map.getEventPixel(evt.originalEvent);
          var feature = map.forEachFeatureAtPixel(pixel, function (feature) {
            return feature;
          });
          if(homeThis.$route.name=="trajectoryTree"){
            return;
          }
          if (feature && feature.getGeometry().getType() == "Polygon") {
            selectAreaByFeature(null);
            if (window.event.ctrlKey){
              arr.push(feature.getId());
              feature.setStyle(style);
              removeFeaturesByType("LineString");
            }
            window.document.onkeyup = function (ev) {
              if(!ev.ctrlKey){
                let ids = arr.join(",");
                if(homeThis.$route.name=="trajectory"){
                  homeThis.$emit("jumpTrajectorySecond", ids);
                }else if(homeThis.$route.name=="trajectorySecond"){
                  homeThis.$emit("jumpTrajectoryThree", ids);
                }
              }
            }
          }
        })
        homeThis.mapPointerMove(map);
      },
      mapPointerMove(map){
        let homeThis = this;
        map.on('pointermove',function (evt) {
          if(evt.dragging){
            return;
          }
          var pixel = map.getEventPixel(evt.originalEvent);
          var feature = map.forEachFeatureAtPixel(pixel,function (feature) {
            return feature;
          });
          if(feature && feature.getProperties().info){
            var element;
            var coordinate = evt.coordinate;
            var item = feature.getProperties().info;
            element = document.getElementById('singlePointInfo');
            element.style.display = 'block';
            homeThis.sumNum = item.sumNum;
            homeThis.needNum = item.needNum;
            var overlay = new ol.Overlay({
              element: element,
              positioning: 'bottom-center'
            });
            map.addOverlay(overlay);
            overlay.setPosition(coordinate);
          }
          else {
            document.getElementById('singlePointInfo').style.display = 'none';
          }
        })
      },
      //todo:加载OD曲线接口
      searchOD(params){
        removeUndefinedFeatures();
        this.$http.request({
          method:'get',
          params:params,
          url:URL.oDData,
          success:(data) => {
            //todo:显示曲线数据
            data.data.totalList.forEach(function (v,k) {
              showODMapData(v)
            })
            /*this.$emit("changeRangeMin",data)*/
          },
          error : (data) => {
          }
        });
      },
      searchOD2(data){
        removeUndefinedFeatures();
        //todo:显示曲线数据
        data.data.totalList.forEach(function (v,k) {
          showODMapData(v)
        })
      }

    }
  }
</script>

<style scoped>
  #singlePointInfo {
    display: none;
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
</style>
