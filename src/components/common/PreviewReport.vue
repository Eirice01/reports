<template>
    <div id="preview-Report">
      <Modal
        v-model="getPreviewReportState"
        :title="title"
        width="1400"
        id="preview-report-modal"
        >
        <div class="preview-report-context">
          <!--<iframe src="../../../static/pdf/report.pdf" frameborder="0" width="100%" height="600"></iframe>-->
          <div class="container" style="margin-bottom: 100px;">
            <div class="title" align="center">西安市人口情况及社会发展报告</div>
            <p class="indent">一个城市的各项经济活动，都是由城市中无数的个人来完成的。人的行为可
              以折射出城市的构成、发展及变化情况。西安市公安局利用多种专有数据资源，
              与西安交通大学、西北工业大学、西光所大数据工程中心的有关技术专家合作，
              从人的轨迹信息、通讯信息、社交网络等维度，对西安市人口情况及社会发展进
              行了初步的统计分析，主要结论如下：
            </p>
            <p class="indent">1 西安市日均活动人口数约1200万，月均活动人口数约2500万。</p>
            <p class="indent">2 西安市常驻人口中，有400万（约占27%）来自外省，主要包括周边（如甘肃、山西、河南、四川）、新疆（20万）、广东、江苏等。</p>
            <p class="indent">3 西安市本地人才输出约39万人，其主要流向地包括北京（2.7万）、东部沿海、周边各省等。</p>
            <p class="indent">4 雁塔区的实际活动人口数居各区县之首，约183.6万人。各区县实际活动人口数与其户籍人口数相比，可分为三类：<br/>
            <p class="indent backspace">	实际活动人口数大于户籍人口数：雁塔、未央（240%）、莲湖；</p>
            <p class="indent backspace">	实际活动人口数与户籍人口数持平：长安、新城、灞桥；</p>
            <p class="indent backspace">	实际活动人口数低于户籍人口数：蓝田（30%）、周至等其它区县。</p>

            <p class="indent">5 全市消费能力较高的人口，其分布主要集中在高新和曲江；而消费能力较低的人口，其主要分布在三桥、纺织城等老牌工业基地。</p>
            <h4>报告目录</h4>
            <p class="report-catalog">一、全市整体情况……………………………………………………………	1  </p>
            <p class="report-catalog indent">1、人口数量构成及变化情况……………………………………………………………	1</p>
            <p class="report-catalog indent">2、对外来人口吸引力情况……………………………………………………………	2</p>
            <p class="report-catalog indent">3、人才输出情况……………………………………………………………	3</p>
            <p class="report-catalog indent">4、旅游吸引力情况……………………………………………………………4</p>
            <p class="report-catalog"> 二、各区县及开发区人口发展情况比对……………………………………………………………5</p>
            <p class="report-catalog indent">1、各区县及开发区人口情况……………………………………………………………	5</p>
            <p class="report-catalog indent">2、各区县人口消费能力评估……………………………………………………………	7</p>
            <div class="page">
              <p  class="indent">
                随着通讯技术的发展，人们的日常工作和生活都逐渐地离不开通讯手段。这使得通讯数据能在一定程度上较为准确地反映人们的日常工作和生活。
                鉴于此，本报告基于西安市全量通讯记录，对西安市的人口结构、人员流动、旅游、各区县对比、消费能力等进行了分析。
              </p>
              <p  class="indent">
                与其它官方统计渠道不同，通讯数据具有实时性、准确性、全面性的特点。基于通信数据做出的统计，直接基于全部个人数据进行汇总，而不需要
                通过官方机构逐级上报加总，从而可以避免数据采集与分析过程中的纰漏。
              </p>
              <h4>一、全市整体情况</h4>
              <h4>1、人口数量构成及变化情况</h4>
              <p class="indent">
                本报告主要基于手机号码的通讯及位置数据进行汇总和分析。由于存在一人多号、儿童没有手机号码的特殊情况，因此需要评估一人多号及儿童所占的比例。
                根据测算，在考虑上述情况之后，西安市平均每人持有手机号码个数为1.235个。
              </p>
              <p class="indent">
                下图展示了2017年春节期间西安市的活动人口数，分为常驻人口、短期停驻人口及流动人口三类。从统计分析可知，平均每天西安市活动的人口总数大约为1200余万，
                这其中大约有1000万左右的人是长期在西安工作和生活的，还有约200万人是因探亲、公务、旅游等原因前来西安短期驻留。
              </p>
              <p class="indent">
                人口流动在节假日变化明显，尤其在春节期间，常驻人口一度下降至750万。而流动人口却在春节后增长至每天120万。从流动人口与常驻人口的比例可以明显表现出西安市作为交通枢纽的作用。
              </p>
              <div class="img-box">
                <!--<img src="../../resources/images/module/preview/image001.png" alt=""/>-->
                <div class="charts" id="springData" v-show="!showImg"></div>
                <img class="img-self" src="" alt="" v-show="showImg">
              </div>
              <p class="charts-bottom">图1，西安市2017年春节期间单日人口统计图</p>
            </div>
            <div class="page">
              <p class="indent">
                除了按天统计西安市活动人口数，本报告也按照月份为统计周期，统计分析了2016年6月至2017年1月西安市的人口数。具体而言，在单月内，定义在西安市常驻半个月以上为常驻人口，2日以上不到半个月为短期停驻人口，仅在一天内出现为流动人口。得到统计图表如下：
              </p>
              <div class="img-box">
                <div class="charts" id="monthData" v-show="!showImg"></div>
                <img class="img-self" src="" alt="" v-show="showImg">
              </div>
              <p class="charts-bottom">图2，西安市月度人口统计图</p>
              <p class="indent">
                分析可知，尽管西安市的日均活动人口为1200万，但是每个月在西安市活动过的人口数量远远大于1200万，平均而言约2500万。这一数字充分反映了西安市作为历史文化名城和区域中心城市的吸引力和活力。吸引这些人口常来西安，甚至定居西安，将有可能极大地推动西安市的发展。
              </p>
              <h4>
                2、对外来人口吸引力情况
              </h4>
              <p class="indent">
                为了分析西安市常驻人口的结构，本报告对西安市2016年9月至12月数据进行汇总，统计出这段时间内，因各种原因常驻西安人口约1479.25万人。
              </p>
              <p class="indent">
                基于来源地分析方法 ，本报告对常驻西安人口进行了来源地分析（见图3）。
              </p>
              <p class="indent">
                从图3可以看到，西安市常驻人口中，陕西本省的人口居多，高达1079万人，占总常驻人口的73%；其他非陕西省来源的人口共计约400万人，
                占总常驻人口的27%。这些省份的人口分布情况，以陕西周边（如甘肃、山西、河南、四川）、新疆、广东、江苏居多。体现了西安作为丝绸之路起点，连接东西部经济的重要桥梁作用。
              </p>
              <p class="indent">
                此外，考虑到西安高校云集，学生众多。经过测算，在西安市上学的外地学生约为40万人，其余应在西安从事各类社会工作。
              </p>
            </div>
            <div class="page">
              <div>
                <div class="charts" id="peopleSource" style="height: 500px;"  v-show="!showImg"></div>
                <img class="img-self" src="" alt="" style="height: 500px;" v-show="showImg">
              </div>
              <p class="charts-bottom">图3，西安市常驻人口来源地分布图</p>
              <p class="indent">
                为了将流动人口纳入考虑，本报告进一步计算了2016年第4季度和2017年第1季度各省市归属地人员的占比，并计算了占比的差值。
                经数据分析发现了一个可喜的现象：自2017年第1季度开始，广东、上海、江苏、北京等发达地区来西安的人员占比有较大幅度的增加，
                如图4所示。这可能意味着西安的经济结构正面临着转型。
              </p>

            </div>
            <div class="page">
              <div>
                <div class="charts" id="peopleCale" style="height: 500px;" v-show="!showImg"></div>
                <img class="img-self" src="" alt="" style="height: 500px;" v-show="showImg">
              </div>
              <p class="charts-bottom">图4 西安各省市归属地人员比例变化图</p>
            </div>
            <div class="page">
              <h4>
                3、人才输出情况
              </h4>
              <p class="indent">
                本报告根据过年期间从各省市返回西安的人口数据，推算西安人才输出情况。由于农民工及自由职业者等因工作时间及去向都不固定难以准确预估，
                输出人才中有固定职业和工作时间的数量大约为38.6万人，除去在陕西省内其他地市工作的人员后，这些高端人才去向如图4：
              </p>
              <div>
                <div class="charts" id="peopleExport" style="height: 500px;" v-show="!showImg"></div>
                <img class="img-self" src="" alt="" style="height: 500px;" v-show="showImg">
              </div>
              <p class="charts-bottom">图4，西安市人口输出地分布图</p>
              <p class="indent">
                与西安市常驻人口结构不同，西安市人才输出的主要目的地，包括了北京、东部沿海城市、周边城市。
              </p>
              <h4>
                4、旅游吸引力情况
              </h4>
              <p class="indent">
                本报告通过春节及国庆期间数据测算，排除西安市居民短途游客后，利用通讯记录及地理位置数据，计算得出两个假期专程来西安市旅游的人数分别为：
                国庆79万人，春节25万人。基于地理位置数据的聚合，得到游客来西安旅游目的地的热力图如图5、图6：
              </p>
            </div>
            <div class="page">
              <div>
                <div class="charts" id="visitorMap" v-show="!showImg">

                </div>
                <img class="img-self" src="" alt=""  v-show="showImg">
              </div>
              <p class="charts-bottom">图5，西安市游客地理位置热力图（全市）</p>
              <div class="charts"  id="visitorMap2" v-show="!showImg">

              </div>
              <img class="img-self" src="" alt=""  v-show="showImg">
              <p class="charts-bottom">图6，西安市游客地理位置热力图（市内）</p>
              <p>经过精确统计，各主要景区吸引游客数量人次如下表所示：</p>
            </div>
            <div class="page">
              <div>
                <div class="charts" id="scenicPeople1" style="width: 50%; float: left;"></div>
                <div class="charts" id="scenicPeople2" style="width: 50%; float: left;"></div>
              </div>
              <p class="charts-bottom">图7，西安市景点游客人数</p>
              <p class="indent">
                可以看出，西安市的主要景区为大雁塔芙蓉园、钟鼓楼回民街、兵马俑始皇陵、华清池骊山这四大景区。除此之外，秦岭野生动物园在旺季（如国庆节）能吸引一定数量的外地游客。
              </p>
              <h4>
                二、各区县及开发区人口发展情况比对
              </h4>
              <h4>
                1、各区县及开发区人口情况
              </h4>
              <p class="indent">
                本报告选取十二月正常工作日时间，全市常驻人口分布热力图：
              </p>
              <div class="charts"  id="visitorMap3">tu8</div>
              <p class="charts-bottom">图8，全市常驻人口分布热力图（全市）</p>
            </div>
            <div class="page">
              <div>tu9</div>
              <p class="charts-bottom">图9，全市常驻人口分布热力图（市区）</p>
              <p class="indent">
                对各区县人口具体数量进行统计后，与登记户籍人口做了对比，并计算了相对人口比例。相对人口比例等于实际人口数除以户籍人口数。结果如下：
              </p>
              <div>
                <div class="charts" id="areaPeopleList"></div>
              </div>
              <p class="charts-bottom">表1，各区县常驻人口与户籍人口对比</p>
              <p class="indent">
                上表反映了各区县实际人口分布与户籍登记人口分布的差别，表现出各区不同的经济状况导致对周边人口的吸引能力。
                如未央区实际人口数量是户籍人口数量的2.4倍，表现出较强的人口吸引能力，这与近年来北郊的快速发展形成明显的印证。
                为了更清晰地展示结果，本报告将各区县分为三类，常驻人口数小于户籍人口数的包括碑林、临潼等7个区县；持平的包括长安、
                新城、灞桥等3个区县；高于的包括雁塔、未央、莲湖等三个区。
              </p>
            </div>
            <div class="page">
              <div>
                <div class="charts" id="peopleComparison">

                </div>
              </div>
              <p class="charts-bottom">图10，各区县常驻人口与户籍人口对比图</p>
              <h4>
                2、各区县人口消费能力评估
              </h4>
              <p class="indent">
                为了准确评估每个人的消费能力指数，根据通话数量、活动规律、出行频度、社交网络及居住区域等指标，为每个人计算个人消费能力指数。
                再根据各区县常驻人口分布，计算了各区县消费能力指数、消费差异指数等特征，如下图所示：
              </p>
            </div>
            <div class="page">
              <div>
                <div class="charts" id="expenseAbility"></div>
                <div class="charts" id="expenseDifference"></div>
              </div>
              <p class="charts-bottom">图11，各区县消费能力指数对比</p>
              <p class="indent">
                可以发现，消费能力指数最高的为雁塔区，最低的为高陵县。各个区县的消费能力差异指数也相差较大。 阎良、周至等区县差异相对较小，而雁塔、高陵等区县则差异较大。
              </p>
            </div>
            <div class="page">
              <p class="indent">
                为了更好地分析各个区县的消费能力，本报告绘制了全市、各个开发区及各个区县的消费能力分布图，如下图所示：
              </p>
              <div>
                <div class="charts" style="width: 50%; height: 430px;float: left;">
                  <div class="charts" id="allCity" style="height: 400px;float: left;"></div>
                  <p class="charts-bottom" style="width: 100%;float: left;text-align: center;" >(1) 全市</p>
                </div>
                <div class="charts" id="develop" style="width: 50%; height: 430px;float: left;">
                  <div class="charts" id="develop1" style="width: 100%; height: 200px"></div>
                  <div class="charts" id="develop2" style="width: 100%; height: 200px"></div>
                  <p class="charts-bottom" style="width: 100%;float: left;text-align: center;">(2) 开发区</p>
                </div>

                <div class="charts" id="administeration1" style="width: 50%; height: 430px;float: left;">
                  <div class="charts" id="develop3" style="width: 100%; height: 200px"></div>
                  <div class="charts" id="develop4" style="width: 100%; height: 200px"></div>
                </div>
                <div class="charts" id="administeration2" style="width: 50%; height: 430px;float: left;">
                  <div class="charts" id="develop5" style="width: 100%; height: 200px"></div>
                  <div class="charts" id="develop6" style="width: 100%; height: 200px"></div>
                </div>
                <p class="charts-bottom" style="width: 100%;float: left;">(3) 行政区</p>
              </div>
              <p class="charts-bottom">图12，消费能力指数区间分布图</p>
            </div>
            <div class="page">
              <p class="indent">
                从图中可以看出，全市、各开发区、各行政区县的常驻人口消费能力呈明显的高斯分布。大部分人处于中等消费能力水平。各个区县的分布又各有特色。
                如鄠邑、蓝田、临潼、阎良、周至等集中于中等消费能力；高陵、灞桥等集中于中等偏下；雁塔则集中于中等偏上。
              </p>
              <p class="indent">
                取全市消费能力指数最高及最低的5%，他们在全市的分布如下图所示。消费能力较高的人口，其分布主要集中在高新和曲江；
                而消费能力较低的人口，其主要分布在三桥、纺织城等老牌工业基地。
              </p>
              <div>
                <div class="charts" id="expenseDistribution"></div>
              </div>
              <p class="charts-bottom">图13 消费能力分布热力图</p>
              <p class="indent">
                本报告是利用公安大数据进行社情分析与研判的初步尝试，对人口结构、人员流动、旅游、消费能力等进行了分析。由于时间及能力所限，
                不少细节仍待商榷和进一步研判。未来还可根据实际需要，进行多方位、多角度的深入研究与跟踪分析，为西安市的公安管理及公共管理
                提供基于大数据的实时、动态的强有力支撑。
              </p>

            </div>
          </div>
          <Echarts-WordMap  ref="worldMap" :worldMapData="worldMapData"></Echarts-WordMap>
        </div>
        <div slot="footer">
          <Button type="primary" @click="exportWord">导出</Button>
        </div>
      </Modal>
    </div>
</template>

<script>
  import{URL} from "../../../api/urlsConfig";
 /* import EchartsWordMap from './echartsMap/EchartsWordMap'*/
  export default {
      name: "preview-report",
      data(){
         return{
           title:"浐灞生态区人口活动分析报告",
           recommendId:"p2",
           showImg:false,
           worldMapData:{
             mapData:[],
             params:{

             }
           },
         }
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
    /*components:{
      EchartsWordMap
    },*/
      methods:{
        exportWord(){
          let cv =document.getElementsByTagName("canvas");
          let img = document.getElementsByClassName("img-self");
          for(let i=0; i<cv.length; i++){
            img[i].setAttribute("src",cv[i].toDataURL("image"+i+"/png"));
          }
           this.showImg = true;
           this.$nextTick(()=>{
             $(".preview-report-context").wordExport('生成word文档');
             this.showImg = false;
           })
        },
        /*折线图初始化*/
        initRelationActiveLine(dom,text,legendData,name,xList,yList,flag){
          //console.log(dom,text,legendData,name,xList,yList,flag)
          let _this = this;
          delete yList.xlist;
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
              return serie;
            })()
          };
          myChart.setOption(option,true);
          window.addEventListener("resize", function () {
            myChart.resize()
          });
        },
        /*获取-推荐选择-人口统计数据*/
        queryNumChange(){
          this.$http.request({
            method:"get",
            params:{},
            url:URL.recommendStatistics,
            success:(data) => {
              let legend =[];
              switch(this.recommendId){
                case"p1":
                  legend =["总人口"]
                  break;
                case"p2":
                  legend =["流动人口","常驻人口","暂住人口","总人口"]
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
              let x = data.data.xlist;
              this.initRelationActiveLine("#springData","人口统计折线图",legend,"人数/人",x,data.data,false);
              this.initRelationActiveLine("#monthData","人口统计折线图2",legend,"人数/人",x ,data.data,false);
              this.initRelationActiveLine("#peopleSource","人口统计折线图3",legend,"人数/人",x ,data.data,false);
              this.initRelationActiveLine("#peopleCale","人口统计折线图3",legend,"人数/人",x ,data.data,false);
              this.initRelationActiveLine("#peopleExport","人口统计折线图3",legend,"人数/人",x ,data.data,false);
              this.initRelationActiveLine("#visitorMap","人口统计折线图3",legend,"人数/人",x ,data.data,false);
              $("#visitorMap2").html("");
              initMap('visitorMap2', true, false, true, false, URL.isDebug);
            },
            error : (data) => {
            }
          });
        },
        queryWorldMap(){
          let parms =this.$refs.worldMap.handleCountryDataParams();
          this.$refs.worldMap.getcountryData(parms);
          // this.$nextTick(()=>{
          //   this.$refs.worldMap.getWordData();
          // })

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
  .img-self{
    width: 1000px;
    height: 400px;
  }
  .img-box{
    width: 100%;
    height: 400px;
  }
  .img-box img{
    width: 100%;
  }
  .charts{
    width:100%;
    height: 400px;
    margin: auto;
  }
  #springData,#monthData{
    width: 1000px;
  }
  .charts-bottom{
    text-align: center;
  }
  .report-catalog{
    font-weight: 900;
  }
  .indent{
    text-indent: 2em;
  }
  .backspace{
    padding-left: 30px;
  }
  h2{
    font-size: 24px;
  }
  h4{
    font-size: 16px;
    font-weight: 900;
  }

</style>
