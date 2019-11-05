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
          <div class="export-loading" v-if="exportShow">
            <Spin fix>
              <Icon type="ios-loading" size="100" class="demo-soin-icon-load"></Icon>
              <div>报告导出中......</div>
            </Spin>
          </div>
          <Col span="18">
            <div class="preview-report-context">
            <div class="report-title">{{title}}</div>
            <p class="indent">
              {{describe}}
            </p>
            <div class="loading" v-if="spinShow">
              <Spin fix>
                <Icon type="ios-loading" size="100" class="demo-soin-icon-load"></Icon>
                <div>数据加载中......</div>
              </Spin>
            </div>
            <div class="report-modal" v-if="!spinShow" v-for="(item,index) in modalData" :key="index">
              <h2 class="title2" :id="'report-title'+index" v-html="item.title!=undefined ? item.title:''" v-show="item.title!=''"></h2>
              <p class="indent" v-html="item.content!=undefined ? item.content:''" style="margin-bottom: 10px"></p>
              <div class="report-modal2" v-for="(item2,index2) in item.children" :key="index2">
                <h3 class="title3" :id="'report-title'+index+index2" v-html="item2.title!=undefined ? item2.title:''" v-show="item2.title!=''"></h3>
                <!--<div class="report-modal3" v-for="(item3,index3) in item2.children" :key="index3">-->
                  <!--<h3 class="title4" :id="'report-title'+index+index2+index3" v-html="item3.title!=undefined ? item3.title:''"></h3>-->
                  <div class="report-item" :id="'report-item'+index4" v-for="(item4,index4) in item2.children" :key="index4">
                    <p class="indent" v-html="item4.content!=undefined ? item4.content:''"></p>
                    <div class="img-box">
                      <div class="charts" :id="'report'+index+index2+index4" v-show="!showImg" >
                      </div>
                      <img class="img-self" src="" alt="" v-show="showImg">
                    </div>
                    <!--<p class="charts-bottom">{{item4.pictureObj.imgTitle}}</p>-->
                    <p :id="'title-report'+index+index2+index4" class="charts-bottom" v-html="item4.pictureObj==undefined ? '':item4.pictureObj.imgTitle" ></p>
                  </div>
                <!--</div>-->
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
                    <!--<AnchorLink :href="'#report-title'+index+index2+index3" :title="item3.title" v-for="(item3,index3) in item2.children" :key="index3"/>-->
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
           titleInfo:'',
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
           hotMapDom:[],
           hotMapId:[],
           spinShow:true,
           exportShow:false,
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
            rid:row.rid,
          };
          this.$http.request({
            method:'get',
            params:params,
            url:URL.queryPreviewReportData,
            success:(data) => {
              // if(data.code==200){
                let res =data;
                this.spinShow=false;
                this.title = res.name;
                // this.titleInfo=res.content;
                this.describe = res.summary;
                this.modalData = res.report;
                this.modalData.forEach((item,index)=>{
                  item.children.forEach((item1,index1)=>{
                    item1.children.forEach((item2,index2)=>{
                      // item2.children.forEach((item3,index3)=>{
                        this.hotMapDom=[];
                        this.hotMapId=[];
                        switch(item2.title){
                          case "0_0"://0_0人口折线图 1_0旅游折线图
                            this.$nextTick(()=>{
                              let picRes =item2.pictureObj.res;
                              let legendData =[];
                              let xListDatas =[];
                              let yListDatas =[];
                              Object.keys(picRes).forEach((item)=>{
                                legendData.push(item);
                                Object.keys(picRes[item]).forEach((v,i)=>{
                                  if(v=='xlist'){
                                    xListDatas.push(picRes[item][v]);
                                  }else if(v=='ylist'){
                                    yListDatas.push(picRes[item][v]);
                                  }
                                })
                              });
                              this.initRelationActiveLine(`#report${index}${index1}${index2}`,"人口统计图",legendData,"人数/万人",xListDatas[0],yListDatas,true,"0_0");
                            });
                            break
                          case "1_0"://0_0人口折线图 1_0旅游折线图
                            this.$nextTick(()=>{
                                this.initRelationActiveLine(`#report${index}${index1}${index2}`,"人口统计图",item2.pictureObj.res.legend,"人数/人",item2.pictureObj.res.xAxis,item2.pictureObj.res.yAxis,true,"1_0");
                            });
                            break;
                          case "0_1"://饼图
                          case "1_1":
                            this.$nextTick(()=>{
                              this.initSourcePie(`#report${index}${index1}${index2}`,item2.pictureObj.text,item2.pictureObj.res);
                            })
                            break;
                          case "0_2":
                          case "1_2"://世界地图
                            this.$nextTick(()=>{
                              let worldMapData =item2.pictureObj.res;
                              let worldMap =document.getElementById(`report${index}${index1}${index2}`);
                              worldMap.style.height="600px";
                              this.initWorldMap(`#report${index}${index1}${index2}`,worldMapData);
                            })
                            break;
                          case "0_3"://省地图
                          case "1_3":
                            this.$nextTick(()=>{
                              let ChinaMapData =item2.pictureObj.res;
                              let chinaMap =document.getElementById(`report${index}${index1}${index2}`);
                              chinaMap.style.height="600px";
                              this.disposeMapData(`#report${index}${index1}${index2}`,ChinaMapData);
                            })
                            break;
                          case "0_4"://热力图
                            this.$nextTick(()=>{
                                this.hotMapDom.push(`report${index}${index1}${index2}`);
                                this.hotMapId.push(item2.id);
                            })
                            break;
                          case "0_5"://选择月对应的柱状图
                            this.$nextTick(()=>{
                              let picRes =item2.pictureObj.res;
                              let legendData =[];
                              let xListDatas =[];
                              let yListDatas =[];
                              Object.keys(picRes).forEach((item)=>{
                                legendData.push(item);
                                Object.keys(picRes[item]).forEach((v,i)=>{
                                  if(v=='xlist'){
                                    xListDatas.push(picRes[item][v]);
                                  }else if(v=='ylist'){
                                    yListDatas.push(picRes[item][v]);
                                  }
                                })
                              });
                              this.initRelationActiveLine(`#report${index}${index1}${index2}`,"人口统计图",legendData,"人数/万人",xListDatas[0],yListDatas,true,"0_5",'bar');
                            });
                            break;
                          case "1_4"://时长分布(柱状图)
                            let legendData=[];
                            if(item2.pictureObj.res.legend!=undefined){
                              legendData=item2.pictureObj.res.legend;
                            }else{
                              item2.pictureObj.res.yAxis.forEach((v,i)=>{
                                legendData.push(Object.keys(v)[0]);
                              })
                            }
                            this.$nextTick(()=>{
                              this.initDurationDistributeBar(`#report${index}${index1}${index2}`,"时长分布图",legendData,"人数",item2.pictureObj.res.xAxis,item2.pictureObj.res.yAxis)
                            })
                            break;
                          case "1_5"://区域地图

                            break;
                          default:
                        }
                      // })
                    })
                  })
                });
              this.loadAnchor=true;
              this.queryReportSeeHeatMap(row)
              // }
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });
        },
        /*请求热力图数据*/
        queryReportSeeHeatMap(row,rid,dom){
          let params={
            rid:row.rid, //表格行id
          };
          this.$http.request({
            method:'get',
            params:params,
            url:URL.reportSeeHeatMap,
            success:(data) => {
              this.hotMapId.forEach((item,index)=>{
                $(`#${this.hotMapDom[index]}`).html("");
                initMap(this.hotMapDom[index],true, false, true, false,URL.isDebug);
                showHeatMap(data[item].res);
                $(`#title-${this.hotMapDom[index]}`).html(data[item].imgTitle);
              })
            },
            error : (data) => {
            }
          });
        },
        /*折线图初始化*/
        initRelationActiveLine(dom,text,legendData,name,xList,yList,flag,type,imgType,flag1){
          //console.log(dom,text,legendData,name,xList,yList,flag)
          let tep="";
          if(name.includes("万人")){
            tep='万人'
           }else {
            tep='人'
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
              top:120,
            },
            tooltip : {
              trigger: "axis",
              formatter(params){
                const xname = [];
                const itemArr = [];
                params.forEach((item,index)=>{
                  if(xname.length == 0){
                    xname.push(item.name);
                  }
                  itemArr.push(item.marker + " " + (params.length > 1 ? (item.seriesName + "：") : "") + item.data + tep);
                })
                return xname + "<br/>" + itemArr.join("<br/>");
              }
            },
            legend: {
              // type:'scroll',
              data:legendData,
              top:50,
            },
            calculable : true,
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
                magicType:{show:true,type:['line','bar']}
              }
            },
            series:(function(){
              var serie = [];
              yList.forEach((item,index)=>{
                let itemTourData={
                  name:legendData[index],
                  type: imgType==undefined ?"line" :imgType,
                  //data:item[Object.keys(item)[0]],
                  data:type =="0_0" ? item :item[Object.keys(item)[0]],
                  itemStyle:{normal: {label: {show:true}}},
                  markPoint : {
                    symbol:'pin',
                    symbolSize:5,
                    // data : [
                    //   {type : "max", name: "最大值",symbolOffset:[5,-10]},
                    //   {type : "min", name: "最小值",symbolOffset:[5,-10]}
                    // ]
                  },
                  // markLine : {
                  //   data : [
                  //     {type : "average", name: "平均值"}
                  //   ]
                  // }
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
        /*时间折线图初始化*/
        initRelationActiveLineTime(dom,text,legendData,name,xLists,yLists){
          let myChart = this.$echarts.init(document.querySelector(dom));
          console.log(myChart);
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
              show:false,
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
            animation:false,
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
                    formatter:function (params) {
                      return `${params.name}\n(占比：${params.percent}%)\n（${(params.value/10000).toFixed(2)}万人）`
                    },
                      // '{b|{b}}\n{d|{d}%}\n{c|{c}人}',
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
              max:100000,
              text:['高','低'],       //文本默认数值文本
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
                  formatter:"{b}\n{c}",
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
            series.push(
              /*{
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

              },*/
              {
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
                    formatter: function(params){
                      return `${params.data.name}\n${params.data.value[2]}`
                    },
                    //formatter: "{b}\n{d}" //圆环显示文字
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
                    formatter: function(params){
                      return `${params.data.name}\n${params.data.value[2]}`
                    },
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
                  borderColor: "dodgerblue", //省市边界线
                },
                emphasis: {
                  color: "rgba(37, 43, 61, .5)" //悬浮背景
                }
              }
            },
            animation:false,
            series: series
          };
          myChart.setOption(option);
          window.addEventListener("resize", function () {
            myChart.resize();
          });
        },
        /*导出word*/
        exportWord(){
          let _this = this;
          this.exportShow=true;
          this.modalData.forEach((item,index)=>{
            item.children.forEach((item1,index1)=>{
              item1.children.forEach((item2,index2)=>{
                // item2.children.forEach((item3,index3)=>{
                 let base;
                 if(item2.title=="0_4"){
                   item2.pictureObj={};
                   base = $(`#report${index}${index1}${index2}`).find('canvas')[0].toDataURL("image"+index+index1+index2+"/png");
                   item2.pictureObj.imgTitle=$(`#title-report${index}${index1}${index2}`).text();
                 }
                 else{
                   let myChart = _this.$echarts.init(document.getElementById(`report${index}${index1}${index2}`));
                   base = myChart.getDataURL({
                     backgroundColor:"#fff"
                   });
                   item2.pictureObj={};
                   item2.pictureObj.imgTitle=$(`#title-report${index}${index1}${index2}`).text();
                 }
                  item2.picture=base;
                // })
              })
            })
          });
          let exportWord ={
             name:this.title,
             report:this.modalData,
             summary: this.describe,
          }
          this.$http.request({
            method: "post",
            data: exportWord,
            url:URL.exportWord,
            success: (data) => {
              this.exportShow=false;
              this.export(data,exportWord.name)
              this.$Message.success("导出成功！")
            },
            error : (data) => {

            }
          });
        },
        export(path,name){
          window.location.href = URL.exportWordReport+"?path="+path+"&name="+name;
        },
        /*预览取消*/
        previewCancel(){
          this.loadAnchor =false;
          this.modalData=[];
          this.title="分析报告";
          this.describe="";
          this.spinShow=true;
          window.location.hash='#/Report';
        },

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
    height: 740px;
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
    overflow: auto;
    height: 700px;
   }
  .menu-box >>>.ivu-anchor-wrapper{
    height: 700px!important;
  }
  .loading{
    position: relative;
    height: 500px;
  }
  .export-loading{
    position: relative;
    top: 10px;
    width: 100%;
    background: rgba(127, 173, 186, 0.27);
    opacity: .5;
    height:850px;
  }
  .demo-soin-icon-load{
    -webkit-animation: ani-demo-spin 1s linear infinite;
    -o-animation: ani-demo-spin 1s linear infinite;
    animation: ani-demo-spin 1s linear infinite;
  }
  @keyframes ani-demo-spin {
    from{ transform: rotate(0deg);}
    50%{ transform: rotate(180deg);}
    to{ transform: rotate(360deg);}
  }

</style>
