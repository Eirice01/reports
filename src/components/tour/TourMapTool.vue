<template>
  <!--地图工具栏-->
  <div class="mapTools">
    <ul class="clearFix">
      <div class="fl" style="background:#5b6d80;margin-left: 100px">
        <li>
          <span style="border-right: 2px solid #5b6d80;float: left;height:28px;margin: 6px 10px;"></span>
        </li>
        <li id="tour-modal_ctm_tool_pop_zoomin" class="iconItem">
          <Tooltip content="放大" placement="bottom"><i class="iconfont icon-fangda"></i></Tooltip>
        </li>
        <li id="tour-modal_ctm_tool_pop_zoomout" class="iconItem">
          <Tooltip content="缩小" placement="bottom"><i class="iconfont icon-suoxiao"></i></Tooltip>
        </li>
        <li id="tour-modal_ctm_tool_pop_measurel" class="iconItem">
          <Tooltip content=" 测量距离" placement="bottom"><i class="iconfont icon-celiang1"></i></Tooltip>
        </li>
        <li id="tour-modal_ctm_tool_pop_measurea" class="iconItem">
          <Tooltip content="  测量面积 " placement="bottom"><i class="iconfont icon-mianjiceliang"></i></Tooltip>
        </li>
        <li id="tour-modal_ctm_tool_list" class="iconItem">
          <Tooltip content="图层切换" placement="bottom"><i class="iconfont icon-qiehuan"></i></Tooltip>
        </li>
        <li id="tour-modal_clear" class="iconItem" @click="clearTravelMap">
          <Tooltip content="清除覆盖物" placement="bottom"><i class="iconfont icon-ft-eraser"></i></Tooltip>
        </li>
        <li>
          <span style="border-right: 2px solid #5b6d80;float: right;height:28px;margin: 6px 10px;"></span>
        </li>
      </div>
      <Select  v-model="selectAreaId"  style="margin-left: 20px;height: 38px;width: 150px"
              @on-change="selectArea">
        <Option value="all" @click.native="selectAreaName('all')">全部</Option>
        <Option v-for="(item,index) in areaList" :value="item.areaId" :key="index" @click.native="selectAreaName(item.areaName)">{{ item.areaName }}</Option>
      </Select>
      <ButtonGroup size="large" style="margin-left: 30px;height: 38px" v-show="directFlag">
        <Button class="selectedArea" @click.native="directionFlow('InCenter')"
                :class="!flagClick ? 'default':'visited'">流入
        </Button>
        <Button class="selectedArea" @click.native="directionFlow('OutCenter')"
                :class="flagClick ? 'default':'visited'">流出
        </Button>
      </ButtonGroup>
    </ul>
  </div>
</template>

<script>
  import {URL} from "../../../api/urlsConfig"

  export default {
    name: "tour-map-tool",
    data() {
      return {
        directFlag: false,
        flagClick: true,
        areaCode: '',
        areaList: [],
        selectAreaId: "",
        timer:null,
      }
    },
    props:[
      "isType",
      "dateData"
    ],
    watch:{
      dateData(){
        this.resetMap();
        this.showTourArea();
      },
      isType(){
        this.resetMap();
        this.showTourArea();
      }
    },
    mounted() {
      initMap('tour-modal', true, false, true, true, URL.isDebug);
      this.mapTools();
      //加载所有旅游景点区域
      this.showTourArea();
      this.selectAreaEvent();
      this.loadAreaList();
    },
    methods: {
      //下拉过去选中的景区名称
      selectAreaName(name){
        if(name=="all"){
          this.areaName="";
          this.areaCode='';
        }else {
          this.areaName=name;
        }
        this.$emit('getSenicCode',this.areaCode,this.areaName)
      },
      mapTools() {
        com.jiusuo.map.tMap.addControl(new com.jiusuo.map.TLayerSwapeControl({tipLabel: '图层切换'}));   //图层切换
      },
      clearTravelMap() {
        //移除测量长度/面积结果显示
        $(".t-tooltip-static").parent().remove();
        removeUndefinedFeatures();
      },
      loadAreaList() {
        this.$http.request({
          method: 'get',
          params: {pid:this.areaCode},
          url: URL.selectArea,
          success: (data) => {
            if (!!data) {
              this.areaList = data.data;
            }
          },
          error: (data) => {
          }
        });
      },
      //绘制区域
      showTourArea() {
        this.$http.request({
          method: 'get',
          params: {
            date:this.isType ? "" : this.dateData,
            isRealtime:this.isType
          },
          url: URL.queryExecuteScenic,
          success: (data) => {
              this.addAreaBorder(data.data);
          },
          error: (data) => {
          }
        });
      },
      //绘制区域
      showSubArea(id) {
        if(!id){
          return;
        }
        this.$http.request({
          method: 'get',
          params: {
            date:this.isType ? "" : this.dateData,
            code:id,
            isRealtime:this.isType,
            flag:this.areaCode.indexOf("sub")==-1?'0':'1'
          },
          url: URL.queryChildAreaByScenicId,
          success: (data) => {
            this.addAreaBorder(data.data);
          },
          error: (data) => {
          }
        });
      },
   addAreaBorder(data){
    var rgbas=['rgba(255,0,0,0.8)','rgba(255,255,0,0.8)','rgba(0,128,64,0.8)'];
    var rgbas1=['rgba(255,0,0,0.3)','rgba(255,255,0,0.3)','rgba(0,128,64,0.3)'];
    var features=[];
    for(var i=0;i<data.length;i++){
      if(data[i].nodes){
        var item = data[i].nodes.split("_");
        for(var x = 0;x<item.length;x++) {
          var coords = item[x].split(";");
          var cc = [];
          var ccc = [];
          for (var j = 0; j < coords.length; j++) {
            var c = [];
            c.push(parseFloat(coords[j].split(",")[0]));
            c.push(parseFloat(coords[j].split(",")[1]));
            cc.push(c);
          }
          //todo:暂时做偏移处理
          cc = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints(cc);
          ccc.push(cc);
          var id = data[i].areaId+"_"+data[i].areaName;
          if(item.length>1){
            id = data[i].areaId+"_"+data[i].areaName+"_"+x;
          }
          var geojson = {"type": "Polygon", "coordinates": ccc, "id": id};
          var rgba = rgbas[0];
          var rgba1 = rgbas1[0];
          /*var areaNum= parseFloat(data[i].areaNum.split("万")[0])
          if (areaNum> 0.5 && areaNum < 1.5) {
            var rgba = rgbas[1];
            var rgba1 = rgbas1[1];
          } else if (areaNum< 0.5) {
            var rgba = rgbas[2];
            var rgba1 = rgbas1[2];
          }*/
          var stroke = new com.jiusuo.map.style.TStroke({color: rgba, width: 2});
          var fill = new com.jiusuo.map.style.TFill({color: rgba1});
          var text = new com.jiusuo.map.style.TText({
            text: data[i].areaName + "\n" + data[i].areaNum,
            font: '12px sans-serif',
            textBaseline: 'middle',
            stroke: new com.jiusuo.map.style.TStroke({
              color: 'white',
              width: 3
            }),
            fill: new com.jiusuo.map.style.TFill({color: 'black'})
          });
          var style = new com.jiusuo.map.style.TStyle({fill: fill, stroke: stroke, text: text});
          var feature = com.jiusuo.map.tMap.addTGeometry(geojson, style);
          features.push(feature);
        }
      }
    };
  },
      //地图单击事件
      selectAreaEvent() {
        var homeThis = this;
        var map = com.jiusuo.map.tMap.getOMap();
        map.on("click", function (e) {
          e.preventDefault();
          var features = map.forEachFeatureAtPixel(map.getEventPixel(event),
            function (feature) {
              return feature;
            });
          //TODO：加载左右两侧数据
          if (features && features.getId().length!=32) {
            homeThis.areaCode = features.getId().split("_")[0];
            homeThis.areaName = features.getId().split("_")[1];
          } else {
            homeThis.areaCode = "";
            homeThis.areaName = "";
          }
          if (features && features.getId() && features.getGeometry().getType() == 'Polygon' && features.getId().length!=32) {
            homeThis.resetMap();
            homeThis.loadAreaList();
            var featureId = features.getId().split("_")[0];
            homeThis.directFlag = true;
            //加载单个旅游景点区域
            homeThis.directionFlow("InCenter");
            homeThis.showSubArea(featureId);
            homeThis.showPoints(featureId);
            homeThis.$emit('getSenicCode',homeThis.areaCode,homeThis.areaName)
          } else if(!features||features.getGeometry().getType() != 'Point'){
            homeThis.resetMap();
            homeThis.selectAreaId = 'all';
            homeThis.loadAreaList();
            homeThis.showTourArea();
            homeThis.$emit('getSenicCode',homeThis.areaCode,homeThis.areaName)
          }else if(features && features.getGeometry().getType() == 'Point'){
            homeThis.pointDetail(features);
          }
        });
      },
      pointDetail(feature){
        this.$http.request({
          method: 'get',
          params: {
            uuid:feature.getId()
          },
          url: URL.queryKeyPeopleById,
          success: (data) => {
            if (!!data) {
              var res = data.data;
              feature.set('innerHTML','<p>号码:'+res.hm+'</p><p>大小区:'+res.lacci+'</p><p>人口类型:'+res.peopleStatusName+'</p><p>时间:'+res.dataTime+'</p>');
              popupById(feature.getId());
            }
          },
          error: (data) => {
          }
        });
      },
      //重置地图，清除所有地图元素
      resetMap() {
        if (radar)
          radar.remove();
        removeAllFeatures();
        this.directFlag = false;
        $(".ol-popup").remove();
      },
      directionFlow(type) {
        if (type == 'InCenter') {
          this.flagClick = true;
        } else if (type == 'OutCenter') {
          this.flagClick = false;
        }
        this.$http.request({
          method: 'get',
          params: {
            date:this.isType ? "" : this.dateData,
            code:this.areaCode,
            isRealtime:this.isType,
            enterOrLeave:type == 'InCenter'?'0':'1'
          },
          url: URL.peopleFlowDirection,
          success: (data) => {
            if (!!data) {
              data["Type"] = type;
              showFlowAnaly(data.data);
            }
          },
          error: (data) => {
          }
        });
      },
      showPoints(id) {
        if(!id){
          return;
        }
        this.$http.request({
          method: 'get',
          params: {
            date:this.isType ? "" : this.dateData,
            code:id,
            isRealtime:this.isType,
            flag:this.areaCode.indexOf("sub")==-1?'0':'1'
          },
          url: URL.queryMapKeyPeople,
          success: (data) => {
            if (!!data) {
              var dataArr = data.data;
              if (dataArr) {
                var stroke = new com.jiusuo.map.style.TStroke({color: 'rgba(0,0,0,1)', width: 1});
                var fill = new com.jiusuo.map.style.TFill({color: 'rgba(255,0,102,1)'});
                var image = new com.jiusuo.map.style.TCircle({
                  radius: 6,
                  snapToPixel: false,
                  stroke: stroke,
                  fill: fill,
                });
                var style = new com.jiusuo.map.style.TStyle({image: image});
                for (var i = 0; i < dataArr.length; i++) {
                  var lon = dataArr[i].lon;
                  var lat = dataArr[i].lat;
                  if (lon && lat && lon != 0 && lat != 0) {
                    var geojson = {"type": "Point", "coordinates": [lon, lat], "id": dataArr[i].id};
                    com.jiusuo.map.tMap.addTGeometry(geojson, style);
                  }
                }
              }
            }
          },
          error: (data) => {
          }
        });
      },
      //下拉框选择区域
      selectArea(id,name) {
        console.log(name)
        this.resetMap();
        if (id == 'all') {
          this.areaCode = '';
          this.showTourArea();
        } else if(id){
          this.areaCode = id;
          this.directFlag = true;
          this.directionFlow("InCenter");
          this.showSubArea(id);
          this.showPoints(id);
        }
      }
    }
  }
</script>

<style scoped>
  .mapTools {
    position: absolute;
    z-index: 3;
    width: 800px;
    left: 0;
    right: 0;
    margin: auto;
    height: 38px;
    line-height: 38px;
    color: #fff;
  }

  .mapTools ul li {
    float: left;
  }

  .iconItem {
    width: 40px;
    padding: 0 5px;

  }

  .mapTools .iconfont {
    font-size: 24px;

  }

  .mapTools .iconfont:hover {
    font-size: 30px;
    cursor: pointer;
  }

  .selectedArea {
    background: #06213B;
    text-align: center;
  }

  .default {
    background-color: #F2F2F3;
    color: #5D758F;
    border-color: #F2F2F3;
  }

  .visited {
    background-color: #5D758F;
    color: #fff;
    border-color: #5D758F;
  }
</style>
<style>
  #tour-modal .ol-popup {
    bottom: 15px;
  }
  #tour-modal #switch_layer{
    left:-100px;
  }
</style>
