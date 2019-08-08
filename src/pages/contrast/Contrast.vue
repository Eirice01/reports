<template>
  <div id="contrast-modal">
    <Row type="flex" class="full-height">
      <div class="left-content">
        <div class="compare-title">
          <span class="title-left">{{smallTitle}}比对条件选择</span>
          <span class="title-right">

          </span>
        </div>
        <div class="check-part">
          <Menu :theme="theme2" ref="menu" style="width: 100%;" accordion :open-names="openName">
            <Submenu name="1" class="menu1">
              <template slot="title">
                <span class="menu-title">推荐选择</span>
              </template>
              <li style="width: 100%;">
                <div class="check-box">
                  <RadioGroup v-model="recommendId" vertical @on-change="changeRecommend">
                    <Radio v-for="item in recommendData" :label="item.id"  :key="item.id">
                      <span>{{item.description}}</span>
                    </Radio>
                  </RadioGroup>
                </div>
              </li>
            </Submenu>
            <Submenu name="2">
              <template slot="title">
                <span class="menu-title">一般检索</span>
              </template>
              <li class="menu-list">
                <Time ref="time0"></Time>
                <AreaSelect ref="area0"></AreaSelect>
                <PopulationType ref="popType0"></PopulationType>
                <PopulationSource ref="popSource0"></PopulationSource>
                <div class="list-box" style="text-align: right">
                  <Button type="primary" size="small" @click="checkSubmit('0')">确定</Button>
                  <Button  size="small" class="btn-primary" @click="resetCheck('0')">重置</Button>
                </div>
              </li>
            </Submenu>
            <Submenu name="3">
              <template slot="title">
                <span class="menu-title">高级检索</span>
              </template>
              <li class="menu-list">
                <Tabs name="tab" size="small" value="time">
                  <TabPane label="对比时间" name="time" tab="tab">
                    <div class="tab-first">
                      <Time ref="time1" :showTimeMulti="showTimeMulti"></Time>
                    </div>
                    <AreaSelect ref="area1"></AreaSelect>
                    <PopulationType ref="popType1"></PopulationType>
                    <PopulationSource ref="popSource1"></PopulationSource>
                    <div class="list-box" style="text-align: right">
                      <Button type="primary" size="small" @click="checkSubmit('1')">确定</Button>
                      <Button  size="small" class="btn-primary" @click="resetCheck('1')">重置</Button>
                    </div>
                  </TabPane>
                  <TabPane label="对比区域" name="area" tab="tab">
                    <div class="tab-first">
                      <AreaSelect ref="area2" :showSelectAll="showSelectAll" ></AreaSelect>
                    </div>
                    <Time ref="time2"></Time>
                    <PopulationType ref="popType2"></PopulationType>
                    <PopulationSource ref="popSource2"></PopulationSource>
                    <div class="list-box" style="text-align: right">
                      <Button type="primary" size="small" @click="checkSubmit('2')">确定</Button>
                      <Button  size="small" class="btn-primary" @click="resetCheck('2')">重置</Button>
                    </div>
                  </TabPane>
                  <TabPane label="对比人口类别" name="type" tab="tab">
                    <div class="tab-first">
                      <PopulationType ref="popType3" :typeMulti="typeMulti"></PopulationType>
                    </div>
                    <Time ref="time3"></Time>
                    <AreaSelect ref="area3"></AreaSelect>
                    <PopulationSource ref="popSource3"></PopulationSource>
                    <div class="list-box" style="text-align: right">
                      <Button type="primary" size="small" @click="checkSubmit('3')">确定</Button>
                      <Button  size="small" class="btn-primary" @click="resetCheck('3')">重置</Button>
                    </div>
                  </TabPane>
                  <TabPane label="对比来源类型" name="source" tab="tab">
                    <div class="tab-first">
                      <PopulationSource ref="popSource4" :sourceMulti="sourceMulti"></PopulationSource>
                    </div>
                    <Time ref="time4"></Time>
                    <AreaSelect ref="area4"></AreaSelect>
                    <PopulationType ref="popType4"></PopulationType>
                    <div class="list-box" style="text-align: right">
                      <Button type="primary" size="small" @click="checkSubmit('4')">确定</Button>
                      <Button  size="small" class="btn-primary" @click="resetCheck('4')">重置</Button>
                    </div>
                  </TabPane>
                </Tabs>
              </li>
            </Submenu>
          </Menu>
        </div>
      </div>
      <div class="right-content">
        <Card  class="card-list">
          <div class="chart-title clearFix">
            <span class="title-info">人口统计</span>
            <span class="title-btn">
              <Button type="primary" v-if="showChart" @click="saveImag('num-chart')">添加</Button>
               <Button type="primary"  v-if="!showChart" @click="saveImag('map-static-chart')">添加</Button>
              <Button type="primary"   v-if="showChart"  @click="exportMyChose('num-chart')">导出</Button>
               <Button type="primary"   v-if="!showChart"  @click="exportMyChose('map-static-chart')">导出</Button>
            </span>
          </div>
          <div id="num-chart"  v-show="showChart">

          </div>
          <div id="map-static-chart" v-show="!showChart">
          </div>
          <div class="remark">
            <p>
              <span>备注：</span>
              <span v-show="!showRecommend">
                <span>时间：</span><span v-html="remark.date"></span>
                <span>区域：</span><span v-html="remark.cityName"></span>
                <span v-show="$route.query.type=='pop'"><span>划分标准：</span><span v-html="remark.dayOrNight"></span></span>
                <span>人口类别：</span><span v-html="remark.peopleType"></span>
                <span>人口来源：</span><span v-html="remark.originOrBelong"></span><span v-html="remark.originOrBelongCode"></span>
              </span>
              <span v-show="showRecommend">
                <span v-text="recommendRemark"></span>
              </span>
            </p>
          </div>
        </Card>
        <Card  class="card-list" v-show="$route.query.type=='pop'">
          <div class="chart-title clearFix">
            <span class="title-info">行为特征</span>
            <span class="title-btn">
                <Button type="primary"  @click="saveHotImg">添加</Button>
                <Button type="primary" @click="exportHotMap">导出</Button>
            </span>
          </div>
          <div class="canvas-box">
            <div id="map1" style="width: 50%;height: 400px"></div>
            <div style="width: 1%;height: 400px"></div>
            <div id="map2" style="width: 50%;height: 400px"></div>
          </div>
          <div class="canvas-box2">
            <div class="canvas-list clearFix" >
              <div class="small-canvas" :id="'image'+key" v-for="(value,key,index) in heatMapData"  @click="loadHeatMap(key)">
                {{key}}
              </div>
            </div>
          </div>
          <div class="">
            <div class="canvas-list clearFix" >
              <div class="small-canvas1"  v-for="(value,key,index) in heatMapData">
                {{key}}
              </div>
            </div>
          </div>
          <div class="remark" id="test1" style="padding-top: 10px;">
            <p>备注：
              <span v-show="!showRecommend">
                <span>时间：</span><span v-html="remark.date"></span>
                <span>区域：</span><span v-html="remark.cityName"></span>
                <span v-show="$route.query.type=='pop'"><span>划分标准：</span><span v-html="remark.dayOrNight"></span></span>
                <span>人口类别：</span><span v-html="remark.peopleType"></span>
                <span>人口来源：</span><span v-html="remark.originOrBelong"></span><span v-html="remark.originOrBelongCode"></span>
              </span>
              <span v-show="showRecommend">
                 <span v-text="recommendRemark"></span>
              </span>
            </p>
          </div>
        </Card>
        <Card  class="card-list" v-if="showPeopleForm">
          <div class="chart-title clearFix">
            <span class="title-info">人口构成</span>
            <span class="title-btn">
                <Button type="primary" v-if="!loadMap" @click="saveImag('constitute-chart-province')">添加</Button>
                <Button type="primary" v-if='loadMap && loadChinaMap' @click="saveImag('chinaMap')">添加</Button>
                <Button type="primary" v-if='loadMap &&loadWorldMap' @click="saveImag('fechMap')">添加</Button>
                <Button type="primary" v-if=!loadMap @click="exportMyChose('constitute-chart-province')">导出</Button>
                <Button type="primary" v-if='loadMap && loadChinaMap' @click="exportMyMapData">导出数据</Button>
                <Button type="primary" v-if='loadMap &&loadWorldMap' @click="exportMyMapData">导出数据</Button>
            </span>
            </div>
            <div>
              <div v-if="loadMap">
                <Echarts-ChinaMap v-if="loadChinaMap" ref="chinaMap" :ChinaMapData="ChinaMapData"></Echarts-ChinaMap>
                <Echarts-WordMap  v-if="loadWorldMap" ref="worldMap" :worldMapData="worldMapData" @getWorldStatus="getWorldStatus" :loadMap="loadMap"></Echarts-WordMap>
              </div>
              <div v-if="!loadMap">
                <div id="constitute-chart-province">

                </div>
                <div style="text-align: right">
                  <span class="title-btn">
                      <Button type="primary"  @click="saveImag('constitute-chart-city')">添加</Button>
                      <Button type="primary" v-if=!loadMap @click="exportMyChose('constitute-chart-city')">导出</Button>
                  </span>
                  <Select v-model="provinceId" style="width:200px" @on-change="changeProvince">
                    <Option v-for="item in provinceList" :value="item.cityCode" :key="item.cityCode" >{{ item.cityName }}</Option>
                  </Select>
                </div>
                <div id="constitute-chart-city">
                </div>
                <div class="remark" id="test2">
                  <p>备注：
                    <span v-show="!showRecommend">
                      <span>时间：</span><span v-html="remark.date"></span>
                      <span>区域：</span><span v-html="remark.cityName"></span>
                      <span v-show="$route.query.type=='pop'"><span>划分标准：</span><span v-html="remark.dayOrNight"></span></span>
                      <span>人口类别：</span><span v-html="remark.peopleType"></span>
                      <span>人口来源：</span><span v-html="remark.originOrBelong"></span><span v-html="remark.originOrBelongCode"></span>
                    </span>
                    <span v-show="showRecommend">
                      <span v-text="recommendRemark"></span>
                    </span>
                  </p>
                </div>
              </div>
            </div>

          </Card>
        <Card  class="card-list" v-if="$route.query.type=='tour'" v-show="showDurationDistribute">
          <div class="chart-title clearFix">
            <span class="title-info">时长分布</span>
            <span class="title-btn">
                <Button type="primary" @click="saveImag('duration-chart')">添加</Button>
                <Button type="primary" @click="exportMyChose('duration-chart')">导出</Button>
            </span>
          </div>
          <div id="duration-chart">

          </div>
          <div class="remark" id="test3">
            <p>备注：
              <span v-show="!showRecommend">
                <span>时间：</span><span v-html="remark.date"></span>
                <span>区域：</span><span v-html="remark.cityName"></span>
                <span v-show="$route.query.type=='pop'"><span>划分标准：</span><span v-html="remark.dayOrNight"></span></span>
                <span>人口类别：</span><span v-html="remark.peopleType"></span>
                <span>人口来源：</span><span v-html="remark.originOrBelong"></span><span v-html="remark.originOrBelongCode"></span>
              </span>
              <span v-show="showRecommend">
                <span v-text="recommendRemark"></span>
              </span>
            </p>
          </div>
        </Card>
      </div>

    </Row>
    <Modal
      v-model="showHeatMapModal"
      title="选择位置"
      width="400"
      @on-ok="chooseOk"
      @on-cancel="chooseCancel"
    >
      <div style="text-align: center">
        <RadioGroup v-model="mapLoc">
          <Radio label="map1">左侧</Radio>
          <Radio label="map2">右侧</Radio>
        </RadioGroup>
      </div>
    </Modal>
    <!--导出弹窗-->
    <Modal
       v-model="isShowMyChartsType"
       title="选择导出类型"
       width="400"
       @on-ok="chooseTypeOk"
       @on-cancel="chooseDelete"
    >
      <div style="text-align: center">
        <RadioGroup v-model="types">
          <Radio label="imgs">图片</Radio>
          <Radio label="datas">数据</Radio>
        </RadioGroup>
      </div>
    </Modal>
    <!--热力图导出弹窗-->
    <Modal
      v-model="isShowHotMap"
      title="选择导出类型"
      width="400"
      @on-ok="chooseHotType"
      @on-cancel="cancelHotType"
    >
      <div style="text-align: center">
        <RadioGroup v-model="hotType">
          <Radio label="imgs1">左侧图片导出</Radio>
          <Radio label="imgs2">右侧图片导出</Radio>
          <Radio label="datas1">左侧数据</Radio>
          <Radio label="datas2">右侧数据</Radio>
        </RadioGroup>
      </div>
    </Modal>
    <!--热力图添加剪贴板弹窗-->
    <Modal
      v-model="isUpdateMyHotMap"
      title="选择添加类型"
      width="400"
      @on-ok="myHotChoose"
      @on-cancel="cancelHotChoose"
    >
      <div style="text-align: center">
        <RadioGroup v-model="myChoose">
          <Radio label="img1">左侧图片添加</Radio>
          <Radio label="img2">右侧图片添加</Radio>
        </RadioGroup>
      </div>
    </Modal>
  </div>
</template>

<script>
  import * as urlApi from "../../../api/urlsConfig"
  // import {URL} from '../../../api/urlsConfig'
  import html2canvas from 'html2canvas'
  import Time from '../../components/contrast/Time'
  import AreaSelect from '../../components/contrast/Area'
  import PopulationType from '../../components/contrast/PopulationType'
  import PopulationSource from '../../components/contrast/PopulationSource'
  import EchartsChinaMap from '../../components/common/echartsMap/EchartsChinaMap'
  import EchartsWordMap from '../../components/common/echartsMap/EchartsWordMap'
  // import {URL} from "../../../api/urlsConfig";
  export default {
    name: "contrast",
    data(){
      return{
        worldStatus:false,
        isShowMyChartsType:false,
        isUpdateMyHotMap:false,
        sendIds:'',
        isAdvance:false,
        hotMapParms:'',
        sendDataIds:'',
        sendHotDate:[],
        type:this.$route.query.type,
        smallTitle:this.$route.query.type== "pop" ?  "人口统计":"旅游统计",
        relationActiveLineData : {
          x:[],
          all:[],
          in:[],
          out :[]
        },
        recommendId:'',
        recommendData:[],
        htmlUrl:'',
        theme2: 'light',
        openName:["1"],
        showSelectAll:true,
        showTimeMulti:true,
        typeMulti:true,//人口类型多选
        sourceMulti:true,//人口来源多选
        modal:"",
        otherMap:null,
        provinceList: [],
        provinceId: '',
        paramsData:{},
        tourParams:{},
        num:'',
        showHeatMapModal:false,
        mapLoc:'map1',
        types:'imgs',
        myChoose:'img1',
        isShowHotMap:false,
        hotType:'imgs1',
        chooseImage:0,
        heatMapData:{},
        ChinaMapData:{
          mapData:[],
          params:{

          }
        },
        worldMapData:{
          mapData:[],
          params:{

          }
        },
        loadMap:false,
        loadChinaMap:false,
        loadWorldMap:false,
        isFirstClick:true,
        relationActiveBarData : {},
        showChart:true,
        remark:{
          date:'',
          cityOrDev:'',
          cityCode:'',
          dayOrNight:'',
          peopleType:'',
          originOrBelong:'',
          originOrBelongCode:'',
        },
        areaData:[],
        showRecommend:true,
        recommendRemark:"",
        showDurationDistribute:true,//显示时长分布
        showPeopleForm:true,//显示人口构成
        showImg:false,
      }
    },
    watch:{
      '$route':function(){
        this.type = this.$route.query.type;
        this.smallTitle = this.type == "pop" ?  "人口统计":"旅游统计";
        this.openName = ['1'];
        this.queryRecommendData();
        //console.log(this.type);
        this.$nextTick(()=>{
          $("#map1").html("");
          $("#map2").html("");
          initMap('map1',true,false,true,false,urlApi.URL.isDebug);
          this.otherMap =  initOtherMap('map2',true,false,true,false,urlApi.URL.isDebug);
        })
      },
      openName(){
        this.$refs.menu.$children.forEach(item => {
          item.opened = false;
        });
        this.$nextTick(()=>{
          this.$refs.menu.updateOpened();
        })
      }
    },
    components:{
      Time,
      AreaSelect,
      PopulationType,
      PopulationSource,
      EchartsChinaMap,
      EchartsWordMap
    },
    methods:{

      //热力图添加
      saveHotImg(){
        this.isUpdateMyHotMap=true;
      },
      //热力图添加确认
      myHotChoose(){
        let ids=''
        if(this.myChoose=='img1'){
          ids='map1'
        }
        if(this.myChoose=='img2'){
          ids='map2'
        }
        var canvas = $("#"+ids+" canvas")[0];
        this.htmlUrl =  canvas.toDataURL('image/png');
        this.sendUrl()
      },
      //热力图添加调用


      //热力图添加取消
      cancelHotChoose(){

      },
      //地图数据导出
      exportMyMapData(){
        var data=[];
        var parms={};
        if(this.loadChinaMap){
          let mapData = this.$refs.chinaMap.getMapDataAndSend();
          let data1 = [];
          mapData.forEach(v => data1.push([v]));
          parms={
            country:false,
            list:data1
          }
        }
        if(this.loadWorldMap){
           data=this.$refs.worldMap.getWordMapDataAndSend();
           parms={
             country:true,
             list:data
          }
        }
      this.sendEchartsMapData(parms)
      },
      //地图数据导出调用
      sendEchartsMapData(params){
        this.$http.request({
          method:'post',
          data:params,
          url:urlApi.URL.echartsMapExportExcel,
          success:(data) => {
            //
            // let link=document.createElement("a");
            // link.download="text.xlsx";
            // // link.style.display="none";
            // var blob=new Blob(data);
            // let url=window.URL.createObjectURL(blob);
            // link.href=url;
            // link.setAttribute('download',kk);
            // document.body.appendChild(link);
            // link.click()
            this.$Message.success("导出成功！")
          },
          error : (data) => {
            this.$Message.warning('请求数据失败！');
          }
        });
      },
      //热力图导出
      exportHotMap(){
      this.isShowHotMap=true;
      },
      //热力图导出确认
      chooseHotType(){
        let id='';
        let fileName=''
        let loc='';
        var parms={};
        if(this.hotType=='imgs1'){
          id="map1";
          fileName='行为特征侧左图'
          let url='';
          var canvas = $("#"+id+" canvas")[0];
          url =  canvas.toDataURL('image/png');
          this.downloadImg(fileName,url)
        }
        if(this.hotType=='imgs2'){
          id="map2";
          fileName='行为特征右侧图'
          let url='';
          var canvas = $("#"+id+" can" +
            "vas")[0];
          url =  canvas.toDataURL('image/png');
          this.downloadImg(fileName,url)
        }
        if(this.hotType=="datas1"){
           loc="map1"
          for(let i=0;i<this.sendHotDate.length;i++){
             if(this.sendHotDate[i].type==loc){
               if(!this.isAdvance){
                 if(this.hotMapParms.date!=undefined){
                   parms={
                     date:this.hotMapParms.date,
                     cityOrDev:this.hotMapParms.cityOrDev,
                     cityCode:this.hotMapParms.cityCode,
                     dayOrNight:this.hotMapParms.dayOrNight,
                     peopleType:this.hotMapParms.peopleType,
                     originOrBelong:this.hotMapParms.originOrBelong,
                     originOrBelongCode:this.hotMapParms.originOrBelongCode,
                     pid:"",
                     key:this.chooseImage
                   }
                 }else {
                     parms={
                       id:this.hotMapParms.id,
                       key:this.chooseImage
                     }
                 }
               }else {
                 parms={
                   date:this.hotMapParms.date,
                   cityOrDev:this.hotMapParms.cityOrDev,
                   contrastType:this.hotMapParms.contrastType,
                   cityCode:this.hotMapParms.cityCode,
                   dayOrNight:this.hotMapParms.dayOrNight,
                   peopleType:this.hotMapParms.peopleType,
                   originOrBelong:this.hotMapParms.originOrBelong,
                   originOrBelongCode:this.hotMapParms.originOrBelongCode,
                   pid:"",
                   key:this.chooseImage
                 }
               }
             }
          }
        }
        if(this.hotType=="datas2"){
          loc="map2"
          for(let i=0;i<this.sendHotDate.length;i++){
            if(this.sendHotDate[i].type==loc){
              if(!this.isAdvance){
                if(this.hotMapParms.date!=undefined){
                  parms={
                    date:this.hotMapParms.date,
                    cityOrDev:this.hotMapParms.cityOrDev,
                    cityCode:this.hotMapParms.cityCode,
                    dayOrNight:this.hotMapParms.dayOrNight,
                    peopleType:this.hotMapParms.peopleType,
                    originOrBelong:this.hotMapParms.originOrBelong,
                    originOrBelongCode:this.hotMapParms.originOrBelongCode,
                    pid:"",
                    key:this.chooseImage
                  }
                }else {
                    parms={
                      id:this.hotMapParms.id,
                      key:this.chooseImage
                    }

                }
              }else {
                parms={
                  date:this.hotMapParms.date,
                  contrastType:this.hotMapParms.contrastType,
                  cityOrDev:this.hotMapParms.cityOrDev,
                  cityCode:this.hotMapParms.cityCode,
                  dayOrNight:this.hotMapParms.dayOrNight,
                  peopleType:this.hotMapParms.peopleType,
                  originOrBelong:this.hotMapParms.originOrBelong,
                  originOrBelongCode:this.hotMapParms.originOrBelongCode,
                  pid:"",
                  key:this.chooseImage
                }
              }
            }
          }
        }
        if(this.chooseImage==''||this.chooseImage==undefined){
          this.$Message.warning('请先选择相对应的热力图数据！');
        }
        if(!this.isAdvance){
          this.sendHotMapData(parms)
        }else {
          this.advanceHotMapData(parms)
        }
      },
      //一般检索，推荐热力图数据导出调用
      sendHotMapData(params){
        this.$http.request({
          method:'get',
          params:params,
          url:urlApi.URL.heatMapExportExcel,
          success:(data) => {
            this.$Message.success("导出成功！")
          },
          error : (data) => {
            this.$Message.warning('请求数据失败！');
          }
        });
      },

     //高级检索下热力图数据导出调用
      advanceHotMapData(params){
        this.$http.request({
          method:'get',
          params:params,
          url:urlApi.URL.advHeatMapExportExcel,
          success:(data) => {
            this.$Message.success("导出成功！")
          },
          error : (data) => {
            this.$Message.warning('请求数据失败！');
          }
        });
      },
      //热力图导出取消
      cancelHotType(){
        this.isShowHotMap=false;
      },

     //base64转blob
       base64ToBlob(code) {
         let parts = code.split(';base64,');
         let contentType = parts[0].split(':')[1]; //处理拿到的数据
         let raw =window.atob(parts[1]);
         let rawLength = raw.length;
         let uInt8Arry = new Uint8Array(rawLength);
         for (let i=0;i<rawLength;i++) {
          uInt8Arry[i]= raw.charCodeAt(i);
        }
        return new Blob([uInt8Arry],{type:contentType});
      },

      //预下载处理
      downloadImg(fileName,code){
        let aLink =document.createElement('a');
        let blob= this.base64ToBlob(code);
        let evt = document.createEvent("HTMLEvents");
        evt.initEvent("click",false,true);               //initEvent 不加这两个参数在FF会报错，事件类型，是否冒泡，是否组织浏览器默认行为
        aLink.download=fileName;
        aLink.href=URL.createObjectURL(blob);
        aLink.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window})); //兼容火狐
      },

      //普通导出弹窗确认
      chooseTypeOk(){
       if(this.types=='imgs'){
         this.exportImgByEcharts(this.sendIds);
       }
       if(this.types=='datas'){
         this.exportMyEchartsData(this.sendDataIds)
       }
      },
      //普通导出弹窗取消
      chooseDelete(){
        this.sendIds='';
        this.isShowMyChartsType=false;
      },
      //图表导出
      exportMyChose(id){
        this.isShowMyChartsType=true;
        this.sendIds=id;
        this.sendDataIds=id;
      },
      //地图导出
      exportMyWord(){
        this.isShowMyChartsType=true;
        let info=this.$refs.worldMap.getMapInfo()
        if(info=='fechMap'){
          this.sendIds='fechMap'
        }
        if(info=='chinaMap'){
          this.sendIds='chinaMap'
        }

      },
      //echarts图表数据导出
      exportMyEchartsData(id){
        var myChart=this.$echarts.getInstanceByDom(document.getElementById(id));
        let sheetName=myChart.getOption().title[0].text;
        let lengend= (myChart.getOption().legend[0].data).join(",");
        let xlist = (myChart.getOption().xAxis[0].data).join(",");
        let ylist =(myChart.getOption().series[0].data).join(",");
        let params={
          sheetName:sheetName,
          lengend:lengend,
          xlist:xlist,
          ylist:ylist
        }
        window.location.href = urlApi.URL.echartsExportExcel + "?sheetName=" + sheetName + "&lengend=" + lengend +"&xlist=" + xlist +"&ylist=" + ylist;
      },
      //echarts图表导出成图片
      exportImgByEcharts(id){
        var myChart=this.$echarts.getInstanceByDom(document.getElementById(id));
        var Url=myChart.getConnectedDataURL({
          pixelRatio:5,   //导出图片分辨率比例  默认是1
          backgroundColor:"#fff",   //导出图表的背景颜色
          excludeComponents:[         //保存图表为图片是忽略的组件  默认忽略工具栏
            'toolbox'
          ],
          type:'png'    //导出图片的类型  支持陪你过 jpeg
        });
        var $a=document.createElement('a');
        var type='png';
        if(myChart.getOption().title!=undefined){
          $a.download=myChart.getOption().title[0].text+'.'+type;     //导出图片的文件名称
        }
        $a.target='_blank';
        $a.href=Url;
        //浏览器兼容
        //Chrome and firefox
        if(typeof MouseEvent=='function'){
          var evt=new MouseEvent('click',{
            view:window,
            bubbles:true,
            cancelable:false
          })
          $a.dispatchEvent(evt);
        }else {
          //IE
          var html='';
          '<body style="margin: 0">'
          '![]('+Url+')'
          '</body>'
          var tab=window.open();
          tab.document.write(html);
        }
        this.sendIds='';
        this.isShowMyChartsType=false;
      },
      /*获取推荐选择数据*/
      queryRecommendData(){
        switch (this.type){
          case "pop":
            this.modal = '0'
            break;
          case "tour":
            this.modal = '1'
            break;
        }
        this.$http.request({
          method:"get",
          params:{model:this.modal},//model  0人口     1旅游
          url:urlApi.URL.queryGeneralData,
          success:(data) => {
            if(data.code==200){
              this.recommendData=data.data;
              this.recommendId = data.data[0].id;
              this.recommendRemark =data.data[0].description;
              this.isAdvance=false;
              //重置
              for(let i=0; i<5;i++){
                this.resetCheck(i)
              }
              if(this.$route.query.type=='pop'){
                this.showChart =true;
                this.queryNumChange();//人口统计
                this.queryRecommendComposition();//人口构成省
                this.getHotMap(urlApi.URL.recommendBehavior,{"id":this.recommendId});
              }else if(this.$route.query.type=='tour'){
                  let params={
                    id:this.recommendId
                  }
                  this.getRecommendedResult(params)
                //this.queryDurationDistribute();
              }
            }
          },
          error : (data) => {
          }
        });
      },
      /*改变推荐条件*/
      changeRecommend (id){
        this.loadMap = false;
        this.isAdvance=false;
        this.recommendId = id;
        this.showRecommend = true;
        this.recommendRemark = this.recommendData.filter((item)=>{return item.id==id})[0].description;
        if(this.$route.query.type=='pop'){
          if(id=='p4'||id=='p5'){
            this.showPeopleForm =false;
          }else {
            this.showPeopleForm =true;
          }
          this.queryNumChange();
          this.queryRecommendComposition();
          this.getHotMap(urlApi.URL.recommendBehavior,{"id":this.recommendId});
        }else if(this.$route.query.type=='tour'){
          this.showPeopleForm =true;
          if(id=='t4'||id=='t5'){
            this.showPeopleForm =false;
          }else {
            this.showPeopleForm =true;
          }

          this.showDurationDistribute =true;//显示时长分布
          let params={id:this.recommendId}
          this.getRecommendedResult(params);
        }
        //重置
        for(let i=0; i<5;i++){
          this.resetCheck(i)
        }
      },
      /*获取-推荐选择-人口统计数据*/
      queryNumChange(){
        this.$http.request({
          method:"get",
          params:{id:this.recommendId},
          url:urlApi.URL.recommendStatistics,
          success:(data) => {
            let legend =[];
            switch(this.recommendId){
              case"p1":
                legend =["总人口"]
                break;
              case"p2":
                legend =["流动人口","常住人口","暂住人口","总人口"]
                break;
              case"p3":
                legend =["总人口"]
                break;
              case"p4":
                legend =["总人口"]
                break;
              case"p5":
                legend =["总人口"]
                break;
            }
            this.initRelationActiveLine("#num-chart","人口统计折线图",legend,"人数/人",data.data.xlist,data.data,false);
          },
          error : (data) => {
          }
        });
      },
      /*获取-推荐选择-人口构成省数据*/
      queryRecommendComposition(){
        this.loadMap = false;
        this.$http.request({
          method:"get",
          params:{id:this.recommendId},
          url:urlApi.URL.recommendComposition,
          success:(data) => {
            let lengend =[];
            Object.keys(data.data).forEach((item)=>{
              if(item!='xlist'){
                lengend.push(item)
              }
            })
            this.initRelationActiveLine("#constitute-chart-province","人口构成省折线图",lengend,"人数/人",data.data.xlist,data.data,true);
            this.getProSelectData()//获取省下拉数据
          },
          error : (data) => {
          }
        });
      },
      //获取省份下拉数据
      getProSelectData(params,num){
        this.$http.request({
          method:'get',
          params:{
            pid:0,
            flag:0
          },
          url:urlApi.URL.querySourceData,
          success:(data) => {
            if(data.code==200){
              let res = data.data;
              this.provinceList=res;
              this.provinceId = res[0].cityCode;
              if(this.$route.query.type=='pop'){
                if(params==undefined){//推荐选择
                  this.queryRecommendCompCity();
                }else if(num=="0"){//一般检索
                  this.queryGenRetrievalCompCity(params,num);
                }else if(params.contrastType=='0'&&num=="1"){//高级检索对比时间
                  this.queryAdvRetrievalCompCity(params,num);
                }else if(params.contrastType=='1'&&num=="2"){//高级检索对比区域
                  this.queryAdvRetrievalCompCity(params,num);
                }else if(params.contrastType=='2'&&num=="3"){//高级检索对比人口类别
                  this.queryAdvRetrievalCompCity(params,num);
                }else if(params.contrastType=='3'&&num=="4"){//高级检索来源类型
                  this.queryAdvRetrievalCompCity(params,num);
                }
              } else if (this.$route.query.type == 'tour') {
                if (params == undefined) {//推荐选择
                  let params = {
                    id: this.recommendId,
                    pid: this.provinceId
                  }
                  this.queryTourCity(params);
                  this.tourParams ={};
                }else{//一般检索，高级检索 type不同
                  params.pid = this.provinceId;
                  this.tourParams =params;
                  this.queryTourCity(params);
                }
              }


            }
          },
          error : (data) => {
            this.$Message.warning('请求数据失败！');
          }
        });
      },
      //改变省
      changeProvince(id){
        this.provinceId =id;
        if(this.$route.query.type=="pop"){
          if(this.paramsData.date==undefined){//推荐选择
            this.queryRecommendCompCity()
          }else if(this.num=="0"){//一般检索
            this.queryGenRetrievalCompCity(this.paramsData,this.num)
          }else{//高级检索
            this.queryAdvRetrievalCompCity(this.paramsData,this.num)
          }
        } else if (this.$route.query.type == "tour") {
          if (this.tourParams.date == undefined) {//推荐选择
            let params = {
              id: this.recommendId,
              pid: this.provinceId
            }
            this.queryTourCity(params)
          }else{//一般检索，高级检索
            this.tourParams.pid =id;
            this.queryTourCity(this.tourParams)
          }
        }
      },
      //获取-推荐选择-人口构成市数据
      queryRecommendCompCity(){
        this.$http.request({
          method:"get",
          params:{id:this.recommendId,pid:this.provinceId},
          url:urlApi.URL.recommendCompCity,
          success:(data) => {
            let lengend =[];
            Object.keys(data.data).forEach((item)=>{
              if(item!='xlist'){
                lengend.push(item)
              }
            })
            this.initRelationActiveLine("#constitute-chart-city","人口构成市折线图",lengend,"人数/人",data.data.xlist,data.data,true);
          },
          error : (data) => {
          }
        });
      },
      //获取人口---分析比对---一般检索-----人口统计数据
      queryGenRetrievalStatistics(params,num){
        this.$http.request({
          method:"get",
          params:params,
          url:urlApi.URL.genRetrievalStatistics,
          success:(data) => {
            this.initRelationActiveLine("#num-chart","人口统计折线图",[this.$refs['popType'+num].selectItem[0].name],"人数/人",data.data.xlist,data.data,false);
          },
          error : (data) => {
          }
        });
      },
      //获取人口---分析比对---一般检索-----人口构成------省级
      queryGenRetrievalComposition(params,num){
        this.$http.request({
          method:"get",
          params:params,
          url:urlApi.URL.genRetrievalComposition,
          success:(data) => {
            let res =data.data;
            let legendData  =[];
            let xListDatas =[];
            Object.keys(res).forEach((item)=>{
              if(item=='xlist'){
                xListDatas.push(res[item]);
              }else{
                legendData.push(item);
              }
            });
            //this.initRelationActiveLine("#constitute-chart-province","人口构成省折线图",[this.$refs['popType'+num].selectItem[0].name],"人数/人",data.data.xlist,data.data,true);
            this.initRelationActiveLine("#constitute-chart-province","人口构成省折线图",legendData,"人数/人",xListDatas[0],res,true);
            this.getProSelectData(params,num)//获取省下拉数据
            this.paramsData =params;
            this.num =num;
          },
          error : (data) => {
          }
        });
      },
      //获取人口---分析比对---一般检索-----人口构成------市级
      queryGenRetrievalCompCity(params,num){
        params.pid = this.provinceId;
        this.$http.request({
          method:"get",
          params:params,
          url:urlApi.URL.genRetrievalCompCity,
          success:(data) => {
            if(num=="0"){
              let res =data.data;
              let legendData  =[];
              let xListDatas =[];
              Object.keys(res).forEach((item)=>{
                if(item=='xlist'){
                  xListDatas.push(res[item]);
                }else{
                  legendData.push(item);
                }
              });
              this.initRelationActiveLine("#constitute-chart-city","人口构成市折线图",legendData,"人数/人",xListDatas[0],res,true);
            }else{
              this.initRelationActiveLine("#constitute-chart-city","人口构成市折线图",[this.$refs['popType'+num].selectItem[0].name],"人数/人",data.data.xlist,data.data,true);
            }

          },
          error : (data) => {
          }
        });
      },
      //获取人口---分析比对---高级检索-----人口统计
      queryAdvRetrievalStatistics(params,num){
        this.$http.request({
          method:"get",
          params:params,
          url:urlApi.URL.advRetrievalStatistics,
          success:(data) => {
            let res =data.data;
            let legendData =[];
            let xListDatas =[];
            let yListDatas =[];
            Object.keys(res).forEach((item)=>{
              legendData.push(item);
              Object.keys(res[item]).forEach((v,i)=>{
                if(v=='xlist'){
                  xListDatas.push(res[item][v]);
                }else if(v=='ylist'){
                  yListDatas.push(res[item][v]);
                }
              })
            });
            if(params.contrastType=="0"){
              this.initRelationActiveLineTime("#num-chart","人口统计折线图",legendData,"人数/人",xListDatas,yListDatas);
            }else{
              this.initRelationActiveLineOther("#num-chart","人口统计折线图",legendData,"人数/人",[xListDatas[0]],yListDatas)
            }

          },
          error : (data) => {

          }
        });
      },
      //获取人口---分析比对---高级检索-----人口构成------省级
      queryAdvRetrievalComposition(params,num){
        this.$http.request({
          method:"get",
          params:params,
          url:urlApi.URL.advRetrievalComposition,
          success:(data) => {
            let res =data.data;
            let legendData  =[];
            let xListDatas =[];
            let yListDatas ={};
            if(num==1){
              Object.keys(res).forEach((item)=>{
                Object.assign(yListDatas,res[item])
                delete yListDatas.xlist
                Object.keys(res[item]).forEach((v,i)=>{
                  if(v=='xlist'){
                    xListDatas.push(res[item][v]);
                  }else{
                    legendData.push(v);
                  }
                })
              });
            }else{
              Object.keys(res).forEach((item)=>{
                Object.keys(res[item]).forEach((v,i)=>{
                  if(v=='xlist'){
                    xListDatas.push(res[item][v]);
                  }else{
                    legendData.push(item+v);
                    yListDatas[item+v]=res[item][v]
                  }
                })
              });
            }

            if(params.contrastType=="0"){//对比时间
              this.initRelationActiveLine("#constitute-chart-province","人口构成省折线图",legendData,"人数/人",xListDatas[0],yListDatas,true);
            }else if(params.contrastType=="1"){//对比区域
              this.initRelationActiveLine("#constitute-chart-province","人口构成省折线图",legendData,"人数/人",xListDatas[0],yListDatas,true);
            }else if(params.contrastType=="2"){//对比类别
              this.initRelationActiveLine("#constitute-chart-province","人口构成省折线图",legendData,"人数/人",xListDatas[0],yListDatas,true);
            }else if(params.contrastType=="3"){//对比来源类型
              this.initRelationActiveLine("#constitute-chart-province","人口构成省折线图",legendData,"人数/人",xListDatas[0],yListDatas,true);
            }
            this.getProSelectData(params,num)//获取省下拉数据
            this.paramsData =params;
            this.num =num;

          },
          error : (data) => {

          }
        });
      },
      //获取人口---分析比对---高级检索-----人口构成------市级
      queryAdvRetrievalCompCity(params,num){
        params.pid = this.provinceId;
        this.$http.request({
          method:"get",
          params:params,
          url:urlApi.URL.advRetrievalCompCity,
          success:(data) => {
            let res =data.data;
            let legendData  =[];
            let xListDatas =[];
            let yListDatas ={};
            if(num==1){
              Object.keys(res).forEach((item)=>{
                Object.assign(yListDatas,res[item])
                delete yListDatas.xlist
                Object.keys(res[item]).forEach((v,i)=>{
                  if(v=='xlist'){
                    xListDatas.push(res[item][v]);
                  }else{
                    legendData.push(v);
                  }
                })
              });
            }else{
              Object.keys(res).forEach((item)=>{
                Object.keys(res[item]).forEach((v,i)=>{
                  if(v=='xlist'){
                    xListDatas.push(res[item][v]);
                  }else{
                    legendData.push(item+v);
                    yListDatas[item+v]=res[item][v]
                  }
                })
              });
            }

            if(params.contrastType=="0"){
              this.initRelationActiveLine("#constitute-chart-city","人口构成市折线图",legendData,"人数/人",xListDatas[0],yListDatas,true);
            }else if(params.contrastType=="1"){//对比区域
              this.initRelationActiveLine("#constitute-chart-city","人口构成市折线图",legendData,"人数/人",xListDatas[0],yListDatas,true);
            }else if(params.contrastType=="2"){//对比人口类别
              this.initRelationActiveLine("#constitute-chart-city","人口构成省市折线图",legendData,"人数/人",xListDatas[0],yListDatas,true);
            }else if(params.contrastType=="3"){//对比来源类型
              this.initRelationActiveLine("#constitute-chart-city","人口构成省来源市折线图",legendData,"人数/人",xListDatas[0],yListDatas,true);
            }

          },
          error : (data) => {

          }
        });
      },
      /*折线图初始化*/
      initRelationActiveLine(dom,text,legendData,name,xList,yList,flag){
        //console.log(dom,text,legendData,name,xList,yList,flag)
        let _this = this;
        if(_this.$route.query.type=='pop'){
          delete yList.xlist;
        }

        let myChart = this.$echarts.init(document.querySelector(dom));
        let option = {
          title : {
            text: text,
            x:'center',
            textStyle:{
              color:'#333',
              fontSize:16
            },
            top:20,
          },
          grid:{
            top:100,
          },
          tooltip : {
            trigger: "axis"
          },
          legend: {
            type:'scroll',
            data:legendData,
            top:50,
          },
          calculable : true,
          // color:['#ff703a','#63bc66','#fdab1d','#CE47CC','#17B9C6'],
          xAxis : [
            {
              type : "category",
              boundaryGap : false,
              data : xList
            }
          ],
          dataZoom:[
            {
              type:'inside',
              show:flag,
              realtime:true,
            }
          ],
          yAxis : [
            {
              type : "value",
              name :name
            }
          ],
          toolbox:{
            show:true,
            feature:{
              magicType:{show:true,type:['line','bar','stack','tiled']}
            },
            // saveAsImage:{}
          },
          series:(function(){
            var serie = [];
            if(_this.$route.query.type=='pop'){
              Object.keys(yList).forEach((item,index)=>{
                let itemData={
                  name:legendData[index],
                  type:"line",
                  data:yList[item],
                  markPoint : {
                    symbol:'pin',
                    symbolSize:5,
                    data : [
                      {type : "max", name: "最大值"},
                      {type : "min", name: "最小值"}
                    ]
                  },
                  markLine : {
                    data : [
                      {type : "average", name: "平均值"}
                    ]
                  }
                }
                serie.push(itemData)
              })
            }else if(_this.$route.query.type=='tour'){
              yList.forEach((item,index)=>{
                let itemTourData={
                  name:legendData[index],
                  type:"line",
                  data:item[Object.keys(item)[0]],
                  markPoint : {
                    symbol:'pin',
                    symbolSize:5,
                    data : [
                      {type : "max", name: "最大值"},
                      {type : "min", name: "最小值"}
                    ]
                  },
                  markLine : {
                    data : [
                      {type : "average", name: "平均值"}
                    ]
                  }
                }
                serie.push(itemTourData)
              })
            }
            return serie;
          })()
        };
        myChart.setOption(option,true);
        window.addEventListener("resize", function () {
          myChart.resize()
        });
      },
      /*人口统计对比时间折线图*/
      initRelationActiveLineTime(dom,text,legendData,name,xLists,yLists){
        let myChart = this.$echarts.init(document.querySelector(dom));
        let option = {
          title : {
            text: text,
            x:'center',
            textStyle:{
              color:'#333',
              fontSize:16
            },
            top:20,
          },
          grid:{
              top:100,
            },
          tooltip : {
            trigger: "axis",
          },
          legend: {
            type:'scroll',
            data:legendData,
            top:50,
          },
          axisPointer:{
            link:{xAxisIndex:'all'}
          },
          calculable : true,
          /*color:['#ff703a','#63bc66','#fdab1d','#CE47CC','#17B9C6'],*/
          xAxis:(function(){
            var xAxisData = [];
            xLists.forEach((item,index)=>{
              let x = {
                type : "category",
                /*boundaryGap : false,*/
                axisLine:{onZero:true},
                axisTick:{
                  alignWithLabel:true,
                },
                data : item
              }
              xAxisData.push(x);
            })
            return xAxisData;
          })(),
          dataZoom:[
            {
              type:'inside',
              show:true,
              realtime:true,
              xAxisIndex:[0,1]
            }
          ],
          yAxis : [
            {
              type : "value",
              name :name
            },
          ],
          series:(function(){
            var serie = [];
            yLists.forEach((item,index)=>{
              var itemData={
                name:legendData[index],
                type:"line",
                smooth:true,
                data:item,
              }
              if(index>=(legendData.length/2)){
                itemData.xAxisIndex =1;
              }
              serie.push(itemData);
            })
            return serie;
          })()
        };
        myChart.setOption(option,true);
        window.addEventListener("resize", function () {
          myChart.resize()
        });
      },
      /*人口统计对比其他折线图*/
      initRelationActiveLineOther(dom,text,legendData,name,xLists,yLists){
        //console.log(dom,text,legendData,name,xLists,yLists);
        let myChart = this.$echarts.init(document.querySelector(dom));
        let option = {
          title : {
            text: text,
            x:'center',
            textStyle:{
              color:'#333',
              fontSize:16
            },
            top:20,
          },
          grid:{
            top:100,
          },
          tooltip : {
            trigger: "axis"
          },
          legend: {
            type:'scroll',
            data:legendData,
            top:50,
          },
          axisPointer:{
            link:{xAxisIndex:'all'}
          },
          calculable : true,
          color:['#ff703a','#63bc66','#fdab1d','#CE47CC','#17B9C6'],
          xAxis:(function(){
            var xAxisData = [];
            xLists.forEach((item,index)=>{
              let x = {
                type : "category",
                boundaryGap : false,
                axisLine:{onZero:true},
                data : item
              }
              xAxisData.push(x);
            })
            return xAxisData;
          })(),
          dataZoom:[
            {
              type:'inside',
              show:true,
              realtime:true,
            }
          ],
          yAxis : [
            {
              type : "value",
              name :name
            },
          ],
          series:(function(){
            var serie = [];
            yLists.forEach((item,index)=>{
              var itemData={
                name:legendData[index],
                type:"line",
                data:item,
                /* markPoint : {
                   data : [
                     {type : "max", name: "最大值"},
                     {type : "min", name: "最小值"}
                   ]
                 },
                 markLine : {
                   data : [
                     {type : "average", name: "平均值"}
                   ]
                 }*/
              }
              serie.push(itemData);
            })
            return serie;
          })()
        };
        myChart.setOption(option,true);
        window.addEventListener("resize", function () {
          myChart.resize()
        });
      },
      //获取景区---分析比对---一般检索确定接口
      generalSearch(params){
        this.isAdvance=false;
        this.$http.request({
          method:"post",
          data:params,
          url:urlApi.URL.generalSearch,
          success:(data) => {
            //人口统计图
            if(data.statistic.area==undefined){
              this.showChart =true;
              this.initRelationActiveLine("#num-chart","人口统计图",data.statistic.legend,"人数/人",data.statistic.xAxis,data.statistic.yAxis,false);
            }else{
              this.showChart =false;
              //调生成地图
              this.areaData = data.statistic.area;
              if(!this.showChart){
                this.$nextTick(()=> {
                  $("#map-static-chart").html("");
                  initMap('map-static-chart', true, false, true, false, urlApi.URL.isDebug);
                  this.showArea(this.areaData);
                })
              }
            }

            //人口构成图
            if(params.peopleFrom=='0'){// peopleFrom0空值
              this.showPeopleForm =true;
               if(params.isPoint=="0"){//isPoint 0时间段  1时间点
                 this.loadMap =false;
                 let legend=[];
                 if(data.blong.legend!=undefined){
                   legend=data.blong.legend
                 }else{
                   data.blong.yAxis.forEach((item,index)=>{
                     legend.push(Object.keys(item)[0]);
                   })
                 }
                 this.$nextTick(()=>{
                   this.initRelationActiveLine("#constitute-chart-province","人口构成省折线图",legend,"人数/人",data.blong.xAxis,data.blong.yAxis,true);
                 })
                 this.getProSelectData(params)//获取省下拉数据
               }else{
                 this.loadMap =true;
                 if(params.isBelong=="0"){//来源地"0"加载中国地图组件
                   this.loadChinaMap = true;
                   this.loadWorldMap = false;
                   this.ChinaMapData.params = params;
                 }else if(params.isBelong=="1"){ //来源地"1"加载世界地图组件
                   this.loadWorldMap = true;
                   this.loadChinaMap = false;
                   this.worldMapData.params = params;
                   //重置
                   if(this.worldStatus){
                     if(this.$refs.worldMap.changType!=undefined){
                       this.$refs.worldMap.changType();
                     }
                   }
                 }
               }

            }else{
              this.showPeopleForm =false;
            }
            //时长分布图
            if(params.timeType!='0'){
              this.showDurationDistribute =true;
              let legendData=[];
              if(data.duration.legend!=undefined){
                legendData=data.duration.legend;
              }else{
                data.duration.yAxis.forEach((item,index)=>{
                  legendData.push(Object.keys(item)[0]);
                })
              }
              this.initDurationDistributeBar("#duration-chart","时长分布图",legendData,"人数",data.duration.xAxis,data.duration.yAxis)
            }else{
              this.showDurationDistribute =false;
            }

          },
          error : (data) => {

          }
        });
      },
      //获取景区---分析比对---高级检索确定接口
      advanceSearch(params){
        //高级检索标识
        this.$http.request({
          method:"post",
          data:params,
          url:urlApi.URL.advanceSearch,
          success:(data) => {
            //人口统计图
            if(data.statistic!=undefined){
              if(data.statistic.area!=undefined){
                this.showChart =false;
                //调生成地图
                this.areaData = data.statistic.area;
                if(!this.showChart){
                  this.$nextTick(()=> {
                    $("#map-static-chart").html("");
                    initMap('map-static-chart', true, false, true, false, urlApi.URL.isDebug);
                    this.showArea(this.areaData);
                  })
                }
              }else{
                this.showChart =true;
                if(params.type ==0){
                  let res =data.statistic;
                  let legendData =[];
                  let xListDatas =[];
                  let yListDatas =[];
                  Object.keys(res).forEach((item,index)=>{
                    Object.keys(res[item]).forEach((v,i)=>{
                      if(v=='xAxis'){
                        xListDatas.push(res[item][v]);
                      }else if(v=='yAxis'){
                        res[item][v].forEach((x,n)=>{
                          yListDatas.push(x[Object.keys(x)]);
                        })

                      }
                    })
                  });
                  legendData=res.legend;
                  this.initRelationActiveLineTime("#num-chart","人口统计图",legendData,"人数/人",xListDatas,yListDatas)
                }else{
                  this.initRelationActiveLine("#num-chart","人口统计图",data.statistic.legend,"人数/人",data.statistic.xAxis,data.statistic.yAxis,false);
                }

              }

            }

            //人口构成图
            if(params.peopleFrom=='0'){
              this.showPeopleForm =true;
              let legend=[];
              if(data.blong.legend!=undefined){
                legend=data.blong.legend
              }else{
                data.blong.yAxis.forEach((item,index)=>{
                  legend.push(Object.keys(item)[0]);
                })
              }

              this.initRelationActiveLine("#constitute-chart-province","人口构成省折线图",legend,"人数/人",data.blong.xAxis,data.blong.yAxis,true);
              this.getProSelectData(params)//获取省下拉数据
            }else{
              this.showPeopleForm =false;
            }

            //时长分布图
            if(params.timeType!='0'){
              this.showDurationDistribute = true;
              let legendData=[];
              if(data.duration.legend!=undefined){
                legendData=data.duration.legend;
              }else{
                data.duration.yAxis.forEach((item,index)=>{
                  legendData.push(Object.keys(item)[0]);
                })
              }
              this.initDurationDistributeBar("#duration-chart","时长分布图",legendData,"人数",data.duration.xAxis,data.duration.yAxis)
            }else{
              this.showDurationDistribute =false;
            }


          },
          error : (data) => {

          }
        });
      },
      sendUrl(){
        var me = this;
        let remarkPar = me.showRecommend ? me.recommendRemark :
          ("时间："+me.remark.date + " 区域："+me.remark.cityName + " 划分标准："+me.remark.dayOrNight
            + " 人口类别："+me.remark.peopleType + " 人口来源："+me.remark.originOrBelong + me.remark.originOrBelongCode);
        this.$http.request({
          method: 'post',
          data: {
            data:this.htmlUrl,
            remark:remarkPar
          },
          url: urlApi.URL.populationSaveImag,
          timeout: 120 * 1000 * 1000,
          success: (data) => {
            alert("截图保存图片成功");
          },error: (data) => {
            alert("截图保存图片失败");
          }
        })
      },
      saveImag(id){
        if(this.loadMap){
          if(this.loadWorldMap){
            if(this.$refs.worldMap.isbts){
              id='chinaMap'
            }else {
              id='fechMap'
            }
          }
          if(this.loadChinaMap){
            id='chinaMap'
          }
        }
        var baseDiv = document.getElementById(id);
        html2canvas(baseDiv,{backgroundColor: "white"}).then((canvas) => {
          let url = canvas.toDataURL("image/png");
          this.htmlUrl = url;
          this.sendUrl();
        })
      },
      //确定提交
      checkSubmit(num){
        if(this.$refs['time'+num].timeVal==""){
          this.$Message.warning("请选择时间！");
          return;
        }else if(this.$refs['area'+num].areaData.length==0){
          this.$Message.warning("请选择区域！");
          return;
        }else if(this.$refs['popType'+num].selectItem.length==0){
          this.$Message.warning("请选择人口类别！");
          return;
        }
        /*else if(this.$refs['popSource'+num].sourceValue.length==0&&this.$refs['popSource'+num].belongValue.length==0&&this.$route.query.type=='pop'){
          this.$Message.warning("请选择人口来源！");
          return;
        }*/
        if(this.$refs['popSource'+num].sourceValue.length>1){
          this.$refs['popSource'+num].sourceValue=this.$refs['popSource'+num].sourceValue.filter((item,index)=>{
            return  item.substring(2)!="0000";
          })
        }
        if(this.$refs['popSource'+num].belongValue.length>1){
          this.$refs['popSource'+num].belongValue=this.$refs['popSource'+num].belongValue.filter((item,index)=>{
            return  item.substring(2)!="0000";
          })
        }
        this.recommendId ='';
        this.showRecommend = false;
        this.remark.date = typeof(this.$refs['time'+num].timeVal)=='string' ? this.$refs['time'+num].timeVal : this.$refs['time'+num].timeVal.join(",");
        this.remark.cityName = this.$refs['area'+num].selectAreaName.join(",");
        this.remark.dayOrNight = this.$refs['area'+num].day;
        this.remark.peopleType = this.$refs['popType'+num].selectItem[0].name;
        this.remark.originOrBelong = this.$refs['popSource'+num].showSource=='0' ? "来源地:":"归属地:";
        this.remark.originOrBelongCode = this.$refs['popSource'+num].placeName;
        //console.log(this.$refs['popSource'+num].sourceValue,this.$refs['popSource'+num].belongValue);
        switch(num){
          //一般检索
          case '0':
            this.isAdvance=false;
            if(this.$route.query.type=='pop'){
              let params={
                date:typeof(this.$refs['time'+num].timeVal)=='string' ? this.$refs['time'+num].timeVal.replace(/-/g,'') : this.$refs['time'+num].timeVal.join(",").replace(/-/g,''),
                cityOrDev:this.$refs['area'+num].selectName=="kaifa" ? '1':'0',
                cityCode:this.$refs['area'+num].areaData.join(","),
                dayOrNight:this.$refs['area'+num].day=="白天" ? "0":"1",
                peopleType:this.$refs['popType'+num].selectItem[0].code,
                originOrBelong:this.$refs['popSource'+num].showSource,
                originOrBelongCode:this.$refs['popSource'+num].showSource=='1' ? this.$refs['popSource'+num].belongValue.join(',') :this.$refs['popSource'+num].sourceValue.join(','),
                pid:"",
              }
              if(params.date.split(",").length==1&&params.originOrBelongCode==""){
                this.showPeopleForm =true;
                this.loadMap =true;
                if(params.date.split(",").length>1){
                  params.date=params.date.split(",")[1];
                }
                if(params.originOrBelong=="0"){//来源地加载中国地图组件
                  this.loadChinaMap = true;
                  this.loadWorldMap = false;
                  this.ChinaMapData.params = params;
                  // notDeployPlacePager

                }else if(params.originOrBelong=="1"){//归属地加载世界地图组件
                  this.loadWorldMap = true;
                  this.loadChinaMap = false;
                  this.worldMapData.params = params;
                  //重置
                  if(this.worldStatus){
                    if(this.$refs.worldMap.changType!=undefined){
                      this.$refs.worldMap.changType();
                    }

                  }
                }
              }else if(params.date.split(",").length>1&&params.originOrBelongCode==""){
                this.showPeopleForm =true;
                this.loadMap =false;
                this.queryGenRetrievalComposition(params,num);
              }else if(params.date.split(",").length==1&&params.originOrBelongCode!=""){
                this.showPeopleForm =false;
                this.loadMap =false;
              }else if(params.originOrBelongCode!=""){
                this.showPeopleForm =false;
              }
              this.queryGenRetrievalStatistics(params,num);
              this.getHotMap(urlApi.URL.genRetrievalBehavior,params);
            }else if(this.$route.query.type=='tour'){
              let params={
                date:typeof(this.$refs['time'+num].timeVal)=='string' ? this.$refs['time'+num].timeVal : this.$refs['time'+num].timeVal.join(","),
                areaCode:this.$refs['area'+num].areaData=="all" ? this.$refs['area'+num].allViewId : this.$refs['area'+num].areaData,
                // peopleState:this.$refs['popType'+num].selectItem[0].code,
                isBelong:this.$refs['popSource'+num].showSource,
                obList:this.$refs['popSource'+num].showSource=='1' ? this.$refs['popSource'+num].belongValue :this.$refs['popSource'+num].sourceValue,
                timeType:"0",//时间类型 0:分钟，1:日，2:月
                isPoint:this.$refs['time'+num].shortPoint ? '1':'0',//1时间点，0时间段；
                peopleFrom:(this.$refs['popSource'+num].belongValue==''&&this.$refs['popSource'+num].showSource=='1')||(this.$refs['popSource'+num].sourceValue==''&&this.$refs['popSource'+num].showSource=='0') ? "0":"1" ,//人口来源模块 没值0有值1
                type:"5",
              }
              let peopleIds =[]
              this.$refs['popType'+num].selectItem.forEach((item)=>{
                if ("4" != item.code) {
                  if ("4" != item.code) {
                    peopleIds.push(item.code)
                  }
                }
              })
              params.peopleState = peopleIds;
              switch(this.$refs['time'+num].timeSelectType){
                case"minute":
                  params.timeType = '0';
                break;
                case"day":
                  params.timeType = '1';
                break;
                case"month":
                  params.timeType = '2';
                break;
              }
              this.generalSearch(params)

            }

            break;
          //高级检索-对比时间
          case '1':
            this.loadMap =false;
            this.isAdvance=true;
            if(this.$route.query.type=='pop'){
              let params1={
                contrastType:"0",//对比类型 0对比时间 / 1对比区域 / 2对比人口类型 / 3对比来源类型
                //date:typeof(this.$refs['time'+num].timeVal)=='string' ? `${this.$refs['time'+num].timeVal.replace(/-/g,'')};${this.$refs['time'+num].timeVal2.replace(/-/g,'')}` : `${this.$refs['time'+num].timeVal.join(",").replace(/-/g,'')};${this.$refs['time'+num].timeVal2.join(",").replace(/-/g,'')}`,
                cityOrDev:this.$refs['area'+num].selectName=="kaifa" ? '1':'0',
                cityCode:this.$refs['area'+num].areaData.join(","),
                dayOrNight:this.$refs['area'+num].day=="白天" ? "0":"1",
                peopleType:this.$refs['popType'+num].selectItem[0].code,
                originOrBelong:this.$refs['popSource'+num].showSource,
                originOrBelongCode:this.$refs['popSource'+num].showSource=='1' ?this.$refs['popSource'+num].belongValue.join(',') :this.$refs['popSource'+num].sourceValue.join(','),
                pid:"",
              }
              if(typeof(this.$refs['time'+num].timeVal)=='string'){
                params1.date=`${this.$refs['time'+num].timeVal.replace(/-/g,'')};${this.$refs['time'+num].timeVal2.replace(/-/g,'')}`
              }else{
                //console.log(this.$refs['time'+num].timeVal2)
                if(this.$refs['time'+num].timeVal2.length!=0){
                  params1.date=`${this.$refs['time'+num].timeVal.join(",").replace(/-/g,'')};${this.$refs['time'+num].timeVal2.join(",").replace(/-/g,'')}`
                }else{
                  params1.date=`${this.$refs['time'+num].timeVal.join(",").replace(/-/g,'')};`
                }

              }
              if(params1.originOrBelongCode==""){
                this.showPeopleForm =true;
                this.loadMap =false;
                this.queryAdvRetrievalComposition(params1,num);
              }else{
                this.showPeopleForm =false;
              }
              this.queryAdvRetrievalStatistics(params1,num);
              this.getHotMap(urlApi.URL.advRetrievalBehavior,params1);
              //console.log(params1);
            }else if(this.$route.query.type=='tour'){
              let params1={
                type:"0",//对比类型 0对比时间 / 1对比区域 / 2对比人口类型 / 3对比来源类型
                date:typeof(this.$refs['time'+num].timeVal)=='string' ? `${this.$refs['time'+num].timeVal};${this.$refs['time'+num].timeVal2}` : `${this.$refs['time'+num].timeVal.join(",")};${this.$refs['time'+num].timeVal2.join(",")}`,
                areaCode:this.$refs['area'+num].areaData=="all" ? this.$refs['area'+num].allViewId : this.$refs['area'+num].areaData,
                // peopleState:this.$refs['popType'+num].selectItem[0].code,
                isBelong:this.$refs['popSource'+num].showSource,
                obList:this.$refs['popSource'+num].showSource=='1' ?this.$refs['popSource'+num].belongValue :this.$refs['popSource'+num].sourceValue,
                timeType:"0",//时间类型 0:分钟，1:日，2:月
                isPoint:this.$refs['time'+num].shortPoint ? '1':'0',//1时间点，0时间段；
                peopleFrom:(this.$refs['popSource'+num].belongValue==''&&this.$refs['popSource'+num].sourceValue=='') ? "0":"1"//人口来源模块 没值0有值1
              }
              let peopleIds =[];
              this.$refs['popType'+num].selectItem.forEach((item)=>{
                if ("4" != item.code) {
                  peopleIds.push(item.code)
                }
              })
              params1.peopleState = peopleIds;
              switch(this.$refs['time'+num].timeSelectType){
                case"minute":
                  params1.timeType = '0';
                  break;
                case"day":
                  params1.timeType = '1';
                  break;
                case"month":
                  params1.timeType = '2';
                  break;
              }
              this.advanceSearch(params1)
            }


            break;
          //高级检索-对比区域
          case '2':
            this.loadMap =false;
            this.isAdvance=true;
            if(this.$route.query.type=='pop'){
              let params2={
                contrastType:"1",//对比类型 0对比时间 / 1对比区域 / 2对比人口类型 / 3对比来源类型
                date:typeof(this.$refs['time'+num].timeVal)=='string' ? this.$refs['time'+num].timeVal.replace(/-/g,'') : this.$refs['time'+num].timeVal.join(",").replace(/-/g,''),
                cityOrDev:this.$refs['area'+num].selectName=="kaifa" ? '1':'0',
                cityCode:this.$refs['area'+num].areaData.join(";"),
                dayOrNight:this.$refs['area'+num].day=="白天" ? "0":"1",
                peopleType:this.$refs['popType'+num].selectItem[0].code,
                originOrBelong:this.$refs['popSource'+num].showSource,
                originOrBelongCode:this.$refs['popSource'+num].showSource=='1' ?this.$refs['popSource'+num].belongValue.join(',') :this.$refs['popSource'+num].sourceValue.join(','),
                pid:"",
              }
              if(params2.originOrBelongCode==""){
                this.showPeopleForm =true;
                this.loadMap =false;
                this.queryAdvRetrievalComposition(params2,num);
              }else{
                this.showPeopleForm =false;
              }
              this.queryAdvRetrievalStatistics(params2,num);
              // this.queryAdvRetrievalComposition(params2,num);
              this.getHotMap(urlApi.URL.advRetrievalBehavior,params2);
              //console.log(params2)
            }else if(this.$route.query.type=='tour'){
              let params2={
                type:"1",//对比类型 0对比时间 / 1对比区域 / 2对比人口类型 / 3对比来源类型
                date:typeof(this.$refs['time'+num].timeVal)=='string' ? this.$refs['time'+num].timeVal : this.$refs['time'+num].timeVal.join(","),
                areaCode:this.$refs['area'+num].areaData,
                // peopleState:this.$refs['popType'+num].selectItem[0].code,
                isBelong:this.$refs['popSource'+num].showSource,
                obList:this.$refs['popSource'+num].showSource=='1' ?this.$refs['popSource'+num].belongValue :this.$refs['popSource'+num].sourceValue,
                timeType:"0",//时间类型 0:分钟，1:日，2:月
                isPoint:this.$refs['time'+num].shortPoint ? '1':'0',//1时间点，0时间段；
                peopleFrom:(this.$refs['popSource'+num].belongValue==''&&this.$refs['popSource'+num].sourceValue=='') ? "0":"1"//人口来源模块 没值0有值1
              }
              let peopleIds =[]
              this.$refs['popType'+num].selectItem.forEach((item)=>{
                peopleIds.push(item.code)
              })
              params2.peopleState = peopleIds;
              switch(this.$refs['time'+num].timeSelectType){
                case"minute":
                  params2.timeType = '0';
                  break;
                case"day":
                  params2.timeType = '1'
                  break;
                case"month":
                  params2.timeType = '2'
                  break;
              }
              this.advanceSearch(params2)
            }

            break;
          //高级检索-对比人口类别
          case '3':
            this.loadMap =false;
            this.isAdvance=true;
            if(this.$route.query.type=='pop'){
              let params3={
                contrastType:"2",//对比类型 0对比时间 / 1对比区域 / 2对比人口类型 / 3对比来源类型
                date:typeof(this.$refs['time'+num].timeVal)=='string' ? this.$refs['time'+num].timeVal.replace(/-/g,'') : this.$refs['time'+num].timeVal.join(",").replace(/-/g,''),
                cityOrDev:this.$refs['area'+num].selectName=="kaifa" ? '1':'0',
                cityCode:this.$refs['area'+num].areaData.join(","),
                dayOrNight:this.$refs['area'+num].day=="白天" ? "0":"1",
                originOrBelong:this.$refs['popSource'+num].showSource,
                originOrBelongCode:this.$refs['popSource'+num].showSource=='1' ?this.$refs['popSource'+num].belongValue.join(',') :this.$refs['popSource'+num].sourceValue.join(','),
                pid:"",
              }
              let peopleIds =[];
              this.$refs['popType'+num].selectItem.forEach((item)=>{
                peopleIds.push(item.code)
              })
              params3.peopleType=peopleIds.join(';')
              //console.log(params3)
              if(params3.originOrBelongCode==""){
                this.showPeopleForm =true;
                this.loadMap =false;
                this.queryAdvRetrievalComposition(params3,num);
              }else{
                this.showPeopleForm =false;
              }
              this.queryAdvRetrievalStatistics(params3,num);
              //this.queryAdvRetrievalComposition(params3,num);
              this.getHotMap(urlApi.URL.advRetrievalBehavior,params3);
            }else if(this.$route.query.type=='tour'){
              let params3={
                type:"2",//对比类型 0对比时间 / 1对比区域 / 2对比人口类型 / 3对比来源类型
                date:typeof(this.$refs['time'+num].timeVal)=='string' ? this.$refs['time'+num].timeVal : this.$refs['time'+num].timeVal.join(","),
                areaCode:this.$refs['area'+num].areaData=="all" ? this.$refs['area'+num].allViewId : this.$refs['area'+num].areaData,
                // peopleState:this.$refs['popType'+num].selectItem[0].code,
                isBelong:this.$refs['popSource'+num].showSource,
                obList:this.$refs['popSource'+num].showSource=='1' ?this.$refs['popSource'+num].belongValue :this.$refs['popSource'+num].sourceValue,
                timeType:"0",//时间类型 0:分钟，1:日，2:月
                isPoint:this.$refs['time'+num].shortPoint ? '1':'0',//1时间点，0时间段；
                peopleFrom:(this.$refs['popSource'+num].belongValue==''&&this.$refs['popSource'+num].sourceValue=='') ? "0":"1"//人口来源模块 没值0有值1
              }
              let peopleIds =[]
              this.$refs['popType'+num].selectItem.forEach((item)=>{
                if ("4" != item.code) {
                  peopleIds.push(item.code)
                }
              })
              params3.peopleState = peopleIds;
              switch(this.$refs['time'+num].timeSelectType){
                case"minute":
                  params3.timeType = '0';
                  break;
                case"day":
                  params3.timeType = '1'
                  break;
                case"month":
                  params3.timeType = '2'
                  break;
              }
              this.advanceSearch(params3)
            }

            break;
          //高级检索-对比来源类型
          case '4':
            this.loadMap =false;
            this.isAdvance=true;
            if(this.$route.query.type=='pop'){
              let params4={
                contrastType:"3",//对比类型 0对比时间 / 1对比区域 / 2对比人口类型 / 3对比来源类型
                date:typeof(this.$refs['time'+num].timeVal)=='string' ? this.$refs['time'+num].timeVal.replace(/-/g,'') : this.$refs['time'+num].timeVal.join(",").replace(/-/g,''),
                cityOrDev:this.$refs['area'+num].selectName=="kaifa" ? '1':'0',
                cityCode:this.$refs['area'+num].areaData.join(","),
                dayOrNight:this.$refs['area'+num].day=="白天" ? "0":"1",
                peopleType:this.$refs['popType'+num].selectItem[0].code,
                originOrBelong:this.$refs['popSource'+num].showSource,
                originOrBelongCode:this.$refs['popSource'+num].showSource=='1' ?this.$refs['popSource'+num].belongValue.join(';') :this.$refs['popSource'+num].sourceValue.join(';'),
                pid:"",
              }
              //console.log(params4);
              if(params4.originOrBelongCode==""){
                this.showPeopleForm =true;
                this.loadMap =false;
                this.queryAdvRetrievalComposition(params4,num);
              }else{
                this.showPeopleForm =false;
              }
              this.queryAdvRetrievalStatistics(params4,num);
              //this.queryAdvRetrievalComposition(params4,num);
              this.getHotMap(urlApi.URL.advRetrievalBehavior,params4);
            }else if(this.$route.query.type=='tour'){
              let params4={
                type:"3",//对比类型 0对比时间 / 1对比区域 / 2对比人口类型 / 3对比来源类型
                date:typeof(this.$refs['time'+num].timeVal)=='string' ? this.$refs['time'+num].timeVal : this.$refs['time'+num].timeVal.join(","),
                areaCode:this.$refs['area'+num].areaData=="all" ? this.$refs['area'+num].allViewId : this.$refs['area'+num].areaData,
                // peopleState:this.$refs['popType'+num].selectItem[0].code,
                isBelong:this.$refs['popSource'+num].showSource,
                obList:this.$refs['popSource'+num].showSource=='1' ?this.$refs['popSource'+num].belongValue :this.$refs['popSource'+num].sourceValue,
                timeType:"0",//时间类型 0:分钟，1:日，2:月
                isPoint:this.$refs['time'+num].shortPoint ? '1':'0',//1时间点，0时间段；
                peopleFrom:(this.$refs['popSource'+num].belongValue==''&&this.$refs['popSource'+num].sourceValue=='') ? "0":"1"//人口来源模块 没值0有值1
              }
              let peopleIds =[];
              this.$refs['popType'+num].selectItem.forEach((item)=>{
                if ("4" != item.code) {
                  peopleIds.push(item.code)
                }
              })
              params4.peopleState = peopleIds;
              switch(this.$refs['time'+num].timeSelectType){
                case"minute":
                  params4.timeType = '0';
                  break;
                case"day":
                  params4.timeType = '1';
                  break;
                case"month":
                  params4.timeType = '2';
                  break;
              }
              this.advanceSearch(params4)
            }

            break;

        }


      },

      getWorldStatus(isbts){
        this.worldStatus=isbts;
      },
      //重置
      resetCheck(num){
        this.$refs['time'+num].timeVal = "";
        this.$refs['time'+num]. timeVal2 = "";
        if(this.$route.query.type=='pop'){
          this.$refs['time'+num].timeSelectType="day";
        }else if(this.$route.query.type=='tour'){
          this.$refs['time'+num].timeSelectType="minute";
        }
        this.$refs['area'+num].areaData =[];
        this.$refs['area'+num].resetLabel('allSelect',this.$refs['area'+num].labels);
        this.$refs['area'+num].resetLabel('allSelectCountry',this.$refs['area'+num].areas);
        this.$refs['area'+num].resetLabel('allSelectView',this.$refs['area'+num].viewAreas);
        this.$refs['popType'+num].resetPeopleLabel();
        this.$refs['popSource'+num].sourceValue = [];
        this.$refs['popSource'+num].belongValue = [];
        this.$refs['popSource'+num].showSource="0";
      },
      /*时长柱状图初始化*/
      initDurationDistributeBar(dom,text,legendData,name,xLists,yLists){
        //console.log(dom,text,legendData,name,xLists,yLists);
        let myChart = this.$echarts.init(document.querySelector(dom));
        let option = {
          title: {
            text: text,
            x: 'center',
            textStyle: {
              color: '#333',
              fontSize: 16
            },
            top: 10,
          },
          tooltip: {
            trigger: "axis",
            /*formatter:'{b}<br/>{a}:{c}'*/
            formatter:function(params){
              var res =`${params[0].name}<br/>`;
              params.forEach((item,index)=>{
                res+=`${item.marker}${item.seriesName}:${item.value}%<br/>`
              })
              return res;
            }
          },
          grid: {
            top:100,
          },
          legend: {
            type: 'scroll',
            data: legendData,
            top:30,
          },
          calculable: true,
          xAxis: [
            {
              type: "category",
              data: xLists,
              z: 10
            }
          ],
          dataZoom: [
            {
              type: 'inside'
            }
          ],
          yAxis: [
            {
              type: "value",
              axisLabel:{
                show:true,
                interval:'auto',
                formatter:'{value}%'
              }
            }
          ],
          series :(function(){
            let serie=[];
            yLists.forEach((item,index)=>{
              let itemData={
                type:"bar",
                name:legendData[index],
                barGap:'0',
                barCategoryGap:'5%',
                /*color : ['#709AC5','#A6D0EC'],*/
                data:item[Object.keys(item)[0]],
                label:{
                  normal:{
                    show:true,
                    position:'top',
                    formatter:'{c}%'
                  }
                }

              }
              serie.push(itemData);
          })
            return serie;
          })()
        };
        myChart.setOption(option,true);
        window.addEventListener("resize", function () {
          myChart.resize()
        });
      },
      /*获取旅游推荐选择对应图表数据*/
      getRecommendedResult(params){
        this.$http.request({
          method:"get",
          params:params,
          url:urlApi.URL.getRecommendedResult,
          success:(data) => {
            //人口统计图
            if(data.statistic.area==undefined){
              this.showChart =true;
              this.initRelationActiveLine("#num-chart","人口统计图",data.statistic.legend,"人数/人",data.statistic.xAxis,data.statistic.yAxis,false);
            }else{
              this.showChart =false;
              //调生成地图
              this.areaData = data.statistic.area;
              if(!this.showChart){
                this.$nextTick(()=> {
                  $("#map-static-chart").html("");
                  initMap('map-static-chart', true, false, true, false, urlApi.URL.isDebug);
                  this.showArea(this.areaData);
                })
              }
            }

            //人口构成图
            this.loadMap =false;
            let legend=[];
            if(data.blong.legend!=undefined){
              legend=data.blong.legend
            }else{
              data.blong.yAxis.forEach((item,index)=>{
                legend.push(Object.keys(item)[0]);
              })
            }
            if(!this.loadMap){
              this.$nextTick(()=>{
                this.initRelationActiveLine("#constitute-chart-province","人口构成省折线图",legend,"人数/人",data.blong.xAxis,data.blong.yAxis,true);
                this.getProSelectData()//获取省下拉数据
              })
            }
            //时长分布图
            this.showDurationDistribute =true;
            let legendData=[];
            if(data.duration.legend!=undefined){
              legendData=data.duration.legend;
            }else{
              data.duration.yAxis.forEach((item,index)=>{
                legendData.push(Object.keys(item)[0]);
              })
            }
            if(this.showDurationDistribute){
              this.$nextTick(()=>{
                this.initDurationDistributeBar("#duration-chart","时长分布图",legendData,"人数",data.duration.xAxis,data.duration.yAxis)
              })
            }
          },
          error : (data) => {
          }
        });
      },
      //获取旅游-人口构成市数据
      queryTourCity(params) {
        this.$http.request({
          method: "post",
          data: params,
          url: urlApi.URL.getCity,
          success: (data) => {
            let legend = [];
            if(data.legend!=undefined){
              legend=data.legend
            }else{
              data.yAxis.forEach((item,index)=>{
                legend.push(Object.keys(item)[0]);
              })
            }
            this.initRelationActiveLine("#constitute-chart-city","人口构成市折线图",legend,"人数/人",data.xAxis,data.yAxis,true);
          },
          error : (data) => {
          }
        });
      },
      getHotMap(url,parms){
        //存贮热力图参数
        this.hotMapParms=parms;
        this.heatMapData ={};
        if(heatmapLayer){
          com.jiusuo.map.tMap.removeHeatmapLayer(heatmapLayer);
          heatmapLayer = null;
        }
        if(otherLayer){
          this.otherMap.removeHeatmapLayer(otherLayer);
          otherLayer = null;
        }
        $(".canvas-list img").remove();
        $(".canvas-list div").html('')
        this.$http.request({
          method:'get',
          params:parms,
          url:url,
          success:(data) => {
            this.heatMapData = data.data;
          },
          error : (data) => {
            this.$Message.warning('请求数据失败！');
          }
        });
      },
      canvasToImg(mapId){
        var canvas = $("#"+mapId+" canvas")[0];
        var img = new Image();
        img.src = canvas.toDataURL();
        img.width = 191;
        img.height = 150;
        document.getElementById("image"+this.chooseImage).innerHTML = "";
        document.getElementById("image"+this.chooseImage).appendChild(img);
      },
      //显示热力图弹窗
      loadHeatMap(index){
        this.chooseImage = index;
        console.log(index)
        if(this.heatMapData[index].length!=0){
          this.showHeatMapModal = true;
        }else{
          this.$Message.info("暂无数据!");
        }
      },
      chooseOk(){
        if(this.sendHotDate.length>2){
          this.sendHotDate=[];
        }
        this.showHeatMapModal = false;
        if(this.isFirstClick){
          this.isFirstClick = false;
          showHeatMap(this.heatMapData[this.chooseImage],this.mapLoc=='map1'?undefined:this.otherMap);

          setTimeout(()=>{
            this.canvasToImg(this.mapLoc);
            this.isFirstClick = true;
          },500);
        }
        this.sendHotDate.push({
          id:this.chooseImage,
          type:this.mapLoc
        })
      },
      chooseCancel(){
        this.showHeatMapModal = false;
      },
      showArea(data){
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
              var id = data[i].id;
              if(item.length>1){
                id = data[i].id+"_"+x;
              }
              var geojson = {"type": "Polygon", "coordinates": ccc, "id": id};
              var rgba = rgbas[0];
              var rgba1 = rgbas1[0];
              var stroke = new com.jiusuo.map.style.TStroke({color: rgba, width: 2});
              var fill = new com.jiusuo.map.style.TFill({color: rgba1});
              var text = new com.jiusuo.map.style.TText({
                text: data[i].name + "\n" + data[i].value,
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
    },
    created(){

    },
    mounted(){
      this.type = this.$route.query.type;
      this.queryRecommendData();
      if(this.type ="pop"){
        initMap('map1',true,false,true,false,urlApi.URL.isDebug);
        this.otherMap =  initOtherMap('map2',true,false,true,false,urlApi.URL.isDebug);
      }
    }
  }

</script>

<style scoped>
  #contrast-modal{
    width: 100%;
    height: 100%;
  }
  .left-content{
    width: 420px;
    height: 100%;
    padding-left: 15px;
    padding-right: 15px;
    background: #E4E8EB;
  }
  .right-content{
    width: calc(100% - 420px);
    height: 100%;
    padding-top: 30px;
    overflow: auto;
  }
  .compare-title{
    width: 100%;
    height:40px;
    line-height: 40px;
    border-bottom: 1px solid #CCCDCE;
  }
  .title-left{
    font-weight: bold;
  }
  #num-chart,#constitute-chart-province,#constitute-chart-city,#duration-chart,#map-static-chart{
    width: 100%;
    height: 500px;
  }
  .card-list{
    margin: 0px 30px 30px 30px!important;
  }
  .chart-title{
    border-bottom: 1px solid #CCCDCE;
  }
  .title-info{
    padding: 6px 25px;
    display: inline-block;
    border-bottom: 4px solid #829cb9;
  }
  .title-btn{
    display: inline-block;
    float: right;
  }
  .remark{
    width: 100%;
    height: 50px;
  }
  .check-part{
    width: 100%;
    height: calc(100% - 114px);
    overflow-y: auto;
    overflow-x: hidden;
    padding-top: 10px;
  }
  .menu1{
    background: #e4e8eb;
    height: 100%;
  }
  .check-part>>>.ivu-menu-vertical.ivu-menu-light:after{
    background: #e4e8eb;
  }
  .check-part .menu-title{
    color: #647b93;
  }
  .check-box{
    width: 100%;
    margin: 15px 0px;
    background: #ECEEF1;
    padding: 15px;

  }
  .check-btn-box button{
    width: 100%;
  }
  .check-part >>>.ivu-menu-vertical .ivu-menu-item,.check-part >>> .ivu-menu-vertical .ivu-menu-submenu-title{
    padding: 10px 24px;
  }
  .check-part >>> .ivu-menu-submenu-title{
    background: #ccd3d9;
  }
  .check-part >>>.ivu-menu-opened .ivu-menu-submenu-title{
    background: #94a9c1;
  }
  .check-part >>>.ivu-menu-opened .ivu-menu-submenu-title span.menu-title{
    color: #fff;
  }
  .menu-list{
    width: 100%;
    padding: 0px 15px;
    background: #e4e8eb;
  }

  #contrast-modal >>>.check-list-title{
    width: 100%;
    height:40px;
    line-height: 40px;
    border-bottom: 1px solid #CCCDCE;
  }
  #contrast-modal >>>.check-list-content{
    padding: 0px 0px 0px 10px;
  }
  #contrast-modal >>>.item-warn{
    color: red;
  }

  #contrast-modal>>>.ivu-tag-default{
    border: 1px solid #4A90E2;
  }
  #contrast-modal>>>.ivu-tag-default span{
    color: #4A90E2;
  }
  #contrast-modal>>>.ivu-tag-checked{
    border: 1px solid #e8eaec;
    background: #f7f7f7;
  }
  #contrast-modal>>>.ivu-tag-checked span{
    color: #515a6e;
  }
  #contrast-modal>>>.list-box{
    padding: 5px 0px;
  }
  #contrast-modal>>>.btn-active {
    color: #fff;
    background-color: #2d8cf0;
    border-color: #2d8cf0;
  }


  .tab-first{
    width: 100%;
    background: #ECEEF1;
    border: 1px solid #BCC6D2;
    box-sizing: border-box;
    padding: 0px 5px 5px 0px;
  }
  #contrast-modal >>>.tab-first .check-list-title{
    border-bottom: none;
  }

  #contrast-modal>>>.checkBoxStyle {
    display: inline-block;
    height: 22px;
    line-height: 22px;
    border-radius: 3px;
    border: 1px solid #C0C4CC;
    margin: 2px 15px 2px 0;
    padding: 0 8px;
    font-size: 12px;
    vertical-align: middle;
    cursor: pointer;
    overflow: hidden;
    background: #f7f7f7;
  }
  #contrast-modal>>>.label-active {
    color: #208cfa;
    background: #d5e0e9;
    border-color: #208cfa;
  }
  #contrast-modal>>> .btn-primary{
    background: #6a87a1;
    border-color: #6a87a1;
    color: #fff;
  }
  .canver{
    width: 100%;
    height: 200px;
    border: 1px solid #ccc;
    box-sizing: border-box;
  }
  .test-box{
    width: 100%;
    height: 400px;
    border: 1px solid #ccc;
  }
  .canvas-box{
    width: 100%;
    /*height: 300px;*/
    display: flex;
    flex-wrap: nowrap;
    overflow-x: scroll;
  }
  .canvas-box2{
    width: 100%;
    height: 150px;
    overflow-x: auto;
    overflow-y: hidden;
  }
  .canvas-list{
    width: auto;
    height: 100%;
    display: flex;
  }
  .small-canvas{
    width: 191px;
    height: 150px;
    border: 1px solid #ccc;
    text-align: center;
    line-height: 150px;
    font-size: 20px;
    color: #ccc;
    cursor: pointer;
    /*display: inline-block;*/
    /*flex-grow: 1;*/
    /*transition: all linear .3s;*/

  }
  .small-canvas image{
    width: 100% !important;
  }
  .small-canvas1{
    width: 191px;
    height: 15px;
    text-align: center;
  }
  .btn-box{
    width: 100%;
    height: auto;
    text-align: right;
    padding: 10px 30px;
  }

</style>
