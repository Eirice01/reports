<template>
  <!--地图工具栏-->
  <div class="mapTools">
    <ul class="clearFix">
      <div class="fl" style="background:#5b6d80;margin-left: 200px">
        <li>
          <span style="border-right: 2px solid #5b6d80;float: left;height:28px;margin: 6px 10px;"></span>
        </li>
        <li id="population-statistics_ctm_tool_pop_zoomin" class="iconItem">
          <Tooltip content="放大" placement="bottom"><i class="iconfont icon-fangda"></i></Tooltip>
        </li>
        <li id="population-statistics_ctm_tool_pop_zoomout" class="iconItem">
          <Tooltip content="缩小" placement="bottom"><i class="iconfont icon-suoxiao"></i></Tooltip>
        </li>
        <li id="population-statistics_ctm_tool_pop_measurel" class="iconItem">
          <Tooltip content=" 测量距离" placement="bottom"><i class="iconfont icon-celiang1"></i></Tooltip>
        </li>
        <li id="population-statistics_ctm_tool_pop_measurea" class="iconItem">
          <Tooltip content="  测量面积 " placement="bottom"><i class="iconfont icon-mianjiceliang"></i></Tooltip>
        </li>
        <li id="population-statistics_ctm_tool_list" class="iconItem">
          <Tooltip content="图层切换" placement="bottom"><i class="iconfont icon-qiehuan"></i></Tooltip>
        </li>
        <li id="population-statistics_clear" class="iconItem" @click="clearTravelMap">
          <Tooltip content="清除覆盖物" placement="bottom"><i class="iconfont icon-ft-eraser"></i></Tooltip>
        </li>
        <li>
          <span style="border-right: 2px solid #5b6d80;float: right;height:28px;margin: 6px 10px;"></span>
        </li>
      </div>
      <ButtonGroup size="large" style="margin-left: 100px;height: 38px">
        <Button class="selectedArea" @click.native="showArea('0')" :class="flagClick=='0' ? 'visited':'default'">行政区</Button>
        <Button class="selectedArea"  @click.native="showArea('1')" :class="flagClick=='1' ? 'visited':'default'">开发区</Button>
        <Button class="selectedArea"  @click.native="showArea('2')" :class="flagClick=='2' ? 'visited':'default'">社区</Button>
      </ButtonGroup>
    </ul>
  </div>
</template>

<script>
  import {URL} from "../../../api/urlsConfig"
  export default {
    name: "population-map-tool",
    data(){
      return{
        featureAreaId:"",
        areaCode:"",
        areaName:"",
        isCity:'0',
        flagClick:'0'
      }
    },
    props:['dateData'],
    watch:{
      dateData(){
        this.showPopulationArea(this.isCity)
      }
    },
    mounted(){
      initMap('population-statistics', true, false, true, true,URL.isDebug);
      // initHeatLayer();
      setZoomLevel(10);
      this.mapTools();
      this.showPopulationArea(this.$aa[0]);
      this.selectAreaEvent();
    },
    methods: {
      mapTools() {
        com.jiusuo.map.tMap.addControl(new com.jiusuo.map.TLayerSwapeControl({tipLabel: '图层切换'}));   //图层切换
      },
      //实时数据
      trueTime(){
        this.flagClick = true;
      },
      //非实时数据
      falseTime(){
        this.flagClick = false;
      },
      clearTravelMap() {
        //移除测量长度/面积结果显示
        $(".t-tooltip-static").parent().remove();
        removeUndefinedFeatures();
      },
      showArea(type){
        this.$aa.pop();
        this.$aa.push(type);
        this.showPopulationArea(type);
        this.$emit('queryPopTableData',true);
      },
      //绘制区域
      showPopulationArea(type){
        this.flagClick = type;
       /* if(type=='0'){
          this.flagClick = true;
        }else if(type == '1'){
          this.flagClick = false;
        }*/
        this.isCity = type;
        this.$http.request({
          method:'get',
          params:{
            isCity:this.isCity,
            date:typeof(this.dateData)=='string' ? this.dateData.replace(/-/g,'') : this.dateData.join(",").replace(/-/g,''),
            pageSize:200,
            currPage:1,
            flag:0
          },
          url:URL.districtInfo,
          success:(data) => {
            if(!!data){
              addAreaBorder(data.data.list,type);
              if(this.$area_Code.length>0){
                let f =  getFeatureById(this.$area_Code[0]+"_"+this.$area_Name[0])?getFeatureById(this.$area_Code[0]+"_"+this.$area_Name[0]):getFeatureById(this.$area_Code[0]+"_"+this.$area_Name[0]+"_0")
                selectAreaByFeature(f);
              }
            }
          },
          error : (data) => {
          }
        });
      },
    //地图单击事件
   selectAreaEvent(){
    var homeThis = this;
    var map = com.jiusuo.map.tMap.getOMap();
    map.on("click",function(e){
      e.preventDefault();
      var features = map.forEachFeatureAtPixel(map.getEventPixel(event),
        function (feature) {
          return feature;
        });
      selectAreaByFeature(features);
      //TODO：加载左右两侧数据
      if(features){
        homeThis.areaCode = features.getId().split("_")[0];
        homeThis.areaName = features.getId().split("_")[1];
      }else{
        homeThis.areaCode = "";
        homeThis.areaName = "";
        homeThis.$area_Code.pop();
        homeThis.$area_Name.pop();
      }
      if(homeThis.areaCode && homeThis.areaName){
        homeThis.$area_Code.pop();
        homeThis.$area_Name.pop();
        homeThis.$area_Code.push(homeThis.areaCode);
        homeThis.$area_Name.push(homeThis.areaName);
      }
      homeThis.$emit("getAreaCode",homeThis.$area_Code[0],homeThis.$area_Name[0]);
    });
     homeThis.$emit("getAreaCode",homeThis.$area_Code[0],homeThis.$area_Name[0]);
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
  .selectedArea{
    background:#06213B;
    text-align: center;
  }
  .default{
    background-color: #F2F2F3;
    color: #5D758F;
    border-color: #F2F2F3;
  }
  .visited{
    background-color: #5D758F;
    color: #fff;
    border-color: #5D758F;
  }
</style>
<style>
  #population-statistics #switch_layer{
    left:0px;
  }
</style>
