<template>
    <div id="preview-Report">
      <Modal
        v-model="getPreviewReportState"
        :title="title"
        width="1400"
        id="preview-report-modal"
        @on-cancel="previewCancel"
        >
        <Row>
          <Col span="18">
            <div class="preview-report-context">
            <div class="report-title">{{title}}</div>
            <p class="indent">
              {{describe}}
            </p>
            <div class="report-modal" v-for="(item,index) in modalData" :key="index">
              <h2 class="title2" :id="'report-title'+index" v-html="item.title!=undefined ? item.title:''"></h2>
              <div class="report-modal2" v-for="(item2,index2) in item.children" :key="index2">
                <h3 class="title3" :id="'report-title'+index+index2" v-html="item2.title!=undefined ? item2.title:''"></h3>
                <div class="report-modal3" v-for="(item3,index3) in item2.children" :key="index3">
                  <h3 class="title4" :id="'report-title'+index+index2+index3" v-html="item3.title!=undefined ? item3.title:''"></h3>
                  <div class="report-item" :id="'report-item'+index4" v-for="(item4,index4) in item3.children" :key="index4">
                    <p class="indent" v-html="item4.content!=undefined ? item4.content:''"></p>
                    <div class="img-box">
                      <div class="charts" :id="'report'+index+index2+index3+index4" v-show="!showImg" >
                      </div>
                      <img class="img-self" src="" alt="" v-show="showImg">
                    </div>
                    <p class="charts-bottom" v-html="item4.imgTitle!=undefined ? item4.imgTitle:''" ></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </Col>
          <Col span="6">
            <div class="export-box">
               <Button type="primary" long @click="exportWord">导出</Button>
            </div>
            <div class="menu-box">
              <Anchor :affix="false" show-ink container=".preview-report-context" v-if="loadAnchor">
                <AnchorLink :href="'#report-title'+index" :title="item.title"  v-for="(item,index) in modalData" :key="index">
                  <AnchorLink :href="'#report-title'+index+index2" :title="item2.title" v-for="(item2,index2) in item.children" :key="index2">
                    <AnchorLink :href="'#report-title'+index+index2+index3" :title="item3.title" v-for="(item3,index3) in item2.children" :key="index3"/>
                  </AnchorLink>
                </AnchorLink>
              </Anchor>
            </div>
          </Col>
        </Row>
        <div slot="footer">

        </div>
      </Modal>
    </div>
</template>

<script>
  import{URL} from "../../../api/urlsConfig";
  import {country} from '../../../static/map/Country'
  export default {
      name: "preview-report",
      data(){
         return{
           title:"分析报告",
           describe:"",
           showImg:false,
           modalData:[],
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
           loadAnchor:false,
         }
      },
      components:{

      },
      computed: {
        //弹窗显示状态改变
        getPreviewReportState: {
          get: function () {
            return this.$store.state.previewReportModal;
          },
          set: function () {
            this.$store.commit("showPreviewReportModal");
          }
        },
      },
      methods:{
        //请求报告接口
        queryPreviewReportData(row){
          let params ={
            id:row.id,
          };
          this.$http.request({
            method:'get',
            params:params,
            url:URL.queryPreviewReportData,
            success:(data) => {
              if(data.code==200){
                let res =data.data;
                this.title = res.name;
                this.describe = res.sunmmary;
                this.modalData = res.report;
                this.modalData.forEach((item,index)=>{
                  item.children.forEach((item1,index1)=>{
                    item1.children.forEach((item2,index2)=>{
                      item2.children.forEach((item3,index3)=>{
                        switch (item3.dataType){
                          case "1"://折线图
                            this.$nextTick(()=>{
                              this.initRelationActiveLine(`#report${index}${index1}${index2}${index3}`,"人口统计图",item3.picture.legend,"人数/人",item3.picture.xAxis,item3.picture.yAxis,false);
                            })
                            break;
                          case "2"://新龙地图
                            this.$nextTick(()=>{
                              $(`#report${index}${index1}${index2}${index3}`).html("");
                              initMap(`report${index}${index1}${index2}${index3}`,true, false, true, false,URL.isDebug);
                              showHeatMap(item3.picture.data);
                            })
                            break;
                          case "3"://柱状图
                            let legendData=[];
                            if(item3.picture.legend!=undefined){
                              legendData=item3.picture.legend;
                            }else{
                              item3.picture.yAxis.forEach((v,i)=>{
                                legendData.push(Object.keys(v)[0]);
                              })
                            }
                            this.$nextTick(()=>{
                              this.initDurationDistributeBar(`#report${index}${index1}${index2}${index3}`,"时长分布图",legendData,"人数",item3.picture.xAxis,item3.picture.yAxis)
                            })
                            break;
                          case "4"://世界地图
                            this.$nextTick(()=>{
                              let worldMapData =item3.picture.data;
                              this.initWorldMap(`#report${index}${index1}${index2}${index3}`,worldMapData);
                            })
                            break;
                          case "5"://中国地图
                            this.$nextTick(()=>{
                              let ChinaMapData =item3.picture.data;
                              this.disposeMapData(`#report${index}${index1}${index2}${index3}`,ChinaMapData);
                            })
                            break;
                          case "6"://饼图
                            this.$nextTick(()=>{
                              this.initSourcePie(`#report${index}${index1}${index2}${index3}`,item3.picture.text,item3.picture.data);
                            })
                            break;
                          default:

                        }
                      })
                    })
                  })
                });
                this.loadAnchor=true;
              }
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });
        },
        /*折线图初始化*/
        initRelationActiveLine(dom,text,legendData,name,xList,yList,flag){
          //console.log(dom,text,legendData,name,xList,yList,flag)
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
              }
            },
            series:(function(){
              var serie = [];
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
              return serie;
            })()
          };
          myChart.setOption(option,true);
          window.addEventListener("resize", function () {
            myChart.resize()
          });
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
        /*来源地/归属地占比统计图*/
        initSourcePie(id,text,data){
          let myChart = this.$echarts.init(document.querySelector(id));
          let option = {
            title : {
              text: text,
              x:'center',
              y:'center',
              textStyle:{
                color:'#515a6e',
                fontSize:14
              },
            },
            tooltip : {
              trigger: 'item',
              position:'right',
              formatter: function(params){
                return `${params.name}:${(params.value/10000).toFixed(2)}万人(${params.percent}%)`
              }
            },
            calculable : true,
            color: id=='#source-chart' ? ['#0788e0','#a0d0f0','#f5a623','#f9d8a0','#17B9C6']:['#f5a623','#f9d8a0','#0788e0','#a0d0f0','#17B9C6'],
            series : [
              {
                type:'pie',
                radius : ['38%','55%'],
                center: ['50%', '50%'],
                data:data,
                labelLine:{
                  normal:{
                    show:true,
                    length:5,
                    length2:5
                  }
                },
                label:{
                  normal:{
                    position:'outside',
                    formatter:'{b|{b}}\n{d|{d}%}',
                    rich:{
                      b:{
                        color:'#515a6e'
                      },
                      d:{
                        fontSize:'12'
                      }
                    }
                  }
                }
              }
            ]
          };
          myChart.setOption(option);
          window.addEventListener("resize", function () {
            myChart.resize();
          });
        },
        /*处理地图数据， 按新数据绘制地图*/
        disposeMapData(dom,res){
          $.getJSON('../../../static/map/china.json',(data)=>{
            this.$echarts.registerMap('china',data);
            this.initChinaMap(dom,res)
          });
        },
        /*初始化中国地图*/
        initChinaMap(dom,data){
          let myChart = this.$echarts.init(document.querySelector(dom));
          let option = {
            title : {
              text: '中国地图',
              left: 'center',
              textStyle:{
                color: '#0b0b0b',
                fontSize:16,
                fontWeight:'normal',
                fontFamily:"Microsoft YaHei"
              },
            },
            dataRange:{                     // 阈值控件
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
            series:[
            {
              name: "中国地图",
              type: 'map',
              mapType: 'china',
              roam: true,
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
          ],
          };
          myChart.setOption(option);
          window.addEventListener("resize", function () {
            myChart.resize();
          });
        },
        /*初始化世界地图*/
        initWorldMap(dom,resData){
          let myChart = this.$echarts.init(document.querySelector(dom));
          let geoCoordMap =country;
          let res = [];
          let convertData = function(data) {
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
          let series = [];
          [
            ["西安", resData]
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
            series: series
          };
          myChart.setOption(option);
          window.addEventListener("resize", function () {
            myChart.resize();
          });
        },
        /*导出word*/
        exportWord(){
          this.modalData.forEach((item,index)=>{
            item.children.forEach((item1,index1)=>{
              item1.children.forEach((item2,index2)=>{
                item2.children.forEach((item3,index3)=>{
                 let base = $(`#report${index}${index1}${index2}${index3}`).find('canvas')[0].toDataURL("image"+index+index1+index2+index3+"/png");
                  item3.picture=base;
                })
              })
            })
          });
          let params ={
            data:this.modalData
          }
          //console.log(this.modalData);
          this.$http.request({
            method: "post",
            data: params,
            url:URL.exportWord,
            success: (data) => {
             this.$Message.success("导出成功！")
            },
            error : (data) => {

            }
          });
        },
        /*预览取消*/
        previewCancel(){
          this.loadAnchor =false;
        }
      },
      created(){

      },
      mounted(){

      }
    }
</script>
<style scoped>
  #preview-Report{
    width: 100%;
    height: 100%;
  }
  .report-title{
    font-size: 20px;
    font-weight: bold;
    color: #627C97;
    text-align: center;
    margin-bottom: 10px;
  }
  .title2{
    background: #edeeee;
    font-size: 16px;
    font-weight: bold;
    padding: 10px 5px;
    border-left: 10px solid #4A90E2;
    margin-bottom: 10px;
  }
  .title3{
    background: #edeeee;
    font-size: 14px;
    font-weight: bold;
    padding: 10px 5px;
    border-left: 5px solid #4A90E2;
    margin: 0px 0px 10px 10px;
  }
  .title4{
    background: #edeeee;
    font-size: 14px;
    font-weight: bold;
    padding: 10px 5px;
    border-left: 5px solid #4A90E2;
    margin: 0px 0px 10px 20px;
  }
  .preview-report-context{
    width: 100%;
    height: 700px;
    padding-right: 10px;
    overflow-y: auto;
    overflow-x: hidden;
  }
  .img-self{
    width: 1000px;
    height: 400px;
  }
  .img-box{
    width: 100%;
    /*height: 400px;*/
  }
  .img-box img{
    width: 100%;
  }
  .charts{
    width:100%;
    height: 400px;
    margin: auto;
  }
  .charts-bottom{
    text-align: center;
    margin-bottom: 5px;
  }
  .indent{
    text-indent: 2em;
    margin: 0px 10px;
  }
  .export-box{
    margin:0px 0px 10px 10px;
  }
  .menu-box{
     margin:0px 0px 0px 10px;
   }


</style>
