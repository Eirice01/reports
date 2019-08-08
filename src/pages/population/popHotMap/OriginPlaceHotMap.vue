<template>
  <div id="originhotmap">
    <div class="dataTitel">
      <h1>陕西省西安市</h1>
      <span>{{titleTime}}数据</span>
    </div>
    <div id="leftBack">
      <li @click="backIndexInfo">返回</li>
    </div>
    <div id="dayContent">
      <div class="mapContents">
        <div style="width: 100%;display: flex;align-items: center;padding:0px 15px;justify-content: space-between">
        <div class="maptitle" style="width: 170px;margin-left: 53px">
          人口构成/来源地/热力图
        </div>
        <div class="fes-change" style="margin-right: 20px">
          <Button type="primary" size="small" @click="changeBtns('day')" :class="isChoseBtn1?'default':'active'">白天常驻地</Button>
          <Button  size="small" @click="changeBtns('night')" :class="isChoseBtn2?'default':'active'">夜间常驻地</Button>
        </div>
        </div>
        <div class="mapMain">
          <div class="mapData" id="orginHotMap"ref="mapData"></div>
        </div>
      </div>
      <!--<div class="dayTabel">-->
        <!--<div class="fcs-table">-->
          <!--<Table stripe :columns="columns8" :data="data7" size="small"></Table>-->
        <!--</div>-->
        <!--<div class="fcs-page" style="margin-top: 10px">-->
          <!--<Row type="flex" justify="end" align="middle" >-->
            <!--<Page :total="pageParams.total" show-total size="small" :page-size="pageParams.pageSize"-->
                  <!--:current="pageParams.current"  @on-change="changePage"></Page>-->
          <!--</Row>-->
        <!--</div>-->
      <!--</div>-->
    </div>
  </div>
</template>

<script>
  import {URL} from '../../../../api/urlsConfig'
    export default {
        name: "originplacehotmap",
      data(){
        return {
          isChoseBtn1:true,
          isChoseBtn2:false,
          sendmark:'',
          pageParams : {
            total: 30,
            pageSize : 17,
            current : 1
          },
          titleTime:'',
          date:'',
          cityCode:'',
          data7:[],
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
              "key":"省份",
              "width":100,
              "align":"center"

            },
            {
              "title":"人数/万",
              "key":"人数",
              "width":100,
              "sortable":true,
              "align":"center"
            },
            {
              "title":"占比",
              "key":"占比",
              "width":115,
              "align":"center"
            },
          ],
        }
      },
      inject:[
        "initDate",
        "titletimes"
      ],
      created(){

      },
      mounted(){
        initMap('orginHotMap', true, false, true, false,URL.isDebug);
        this.cityCode=this.$route.query.Codeorabbrevuation
        this.date=this.initDate(new Date().getTime());
        this.titleTime=this.titletimes(new Date().getTime());
        this.sendmark=this.$route.query.mark
        if(this.sendmark){
          this.getOrtiHotData()
        }
        let parms={
          date:this.date,
          Codeorabbrevuation:this.cityCode,
          flag:0,
          dayOrNight:0
        }
        parms=JSON.stringify(parms)
        this.getHotMap(parms);
        this.getHotMap(parms);
      },
      methods:{
        //处理分页
        //分页
        changePage(current){
          this.pageParams.current = current;
          //"0"为非自动刷新
          // this.queryTaskList("0");
        },
      //返回
        backIndexInfo(){
          this.$router.push({
            name: 'originPlace',
            query:{
              result:true
            }

          });
        },
        //昼夜切换
        changeBtns(type){
          let parms={};
          if(type=="day"){
            parms={
              date:this.date,
              Codeorabbrevuation:this.cityCode,
              flag:0,
              dayOrNight:0
            }
            parms=JSON.stringify(parms)
            this.getHotMap(parms)
            this.isChoseBtn1=true;
            this.isChoseBtn2=false;
          }else if(type=="night"){
            parms={
              date:this.date,
              Codeorabbrevuation:this.cityCode,
              flag:0,
              dayOrNight:1
            }
            parms=JSON.stringify(parms)
            this.getHotMap(parms)
            this.isChoseBtn1=false;
            this.isChoseBtn2=true;
          }
        },
        getHotMap(parms){
          this.$http.request({
            method:'get',
            params:parms,
            url:URL.queryHeatMap,
            success:(data) => {
              showHeatMap(data.data);
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });
        },
        //获取图标数据
        getOrtiHotData(){
          this.$http.request({
            method:'get',
            params:'',
            url:URL.queryoriginPlaceHotData,
            success:(data) => {
              let res =data.data;
              this.data7=res
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });
        },
        //map
        myEarchts(){
          let mych=this.$echarts.init(this.$refs.mapData);
          window.onresize=mych.resize;
          mych.setOption({         //配置项
            backgroundColor:"#fcf9f2",  //基本背景颜色
            tooltip:{},              //浮动窗，鼠标移入显示内容
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
            toolbox:{
              show:true,
              orient:'horizontal', //布局方式，水平（vertical）,垂直（horizontal）
              x:'right',              //横向位置
              y:'top',              //纵向位置
              feature:{
                mark:{
                  show:true,          //辅助线
                },
                dataView:{
                  show:false,
                  readOnly:true,
                },
                restore:{
                  show:true
                },                //还原
                saveAsImage:{
                  show:true            //保存为图片
                }

              }
            },
            geo:{
              //重点配置区域
              map:'china',   //表示中国地图
              roam:false,
              label:{
                normal:{
                  show:true,    //是否显示对应地名
                  textStyle:{
                    color:'#bcd6f6'
                  }
                }
              },
              itemStyle:{
                normal:{
                  borderColor:'rgba(0,0,0,0.2)'
                },
                emphasis:{
                  areaColor:null,
                  shadowOffsetX:0,
                  shadowOffsetY:0,
                  shadowBlur:20,
                  borderWidth:0,
                  shadowColor:'rgba(0,0,0,0.5)'
                }
              }
            },
            series:[
              // {
              //   type:'scatter',
              //   // map:'china',
              //   coordinateSystem:'geo',
              //   symbolSize:30,
              //   symbol:'image:../../assets/img/u90.jpg',
              //   symbolRotate:35,
              //   showEffectOn:'render',
              //   effectType:'ripple',
              //   rippleEffect:{
              //     period:4,
              //     scale:2.4,
              //     brushType:'stroke'
              //   },
              //   data:[
              //     {
              //       'name':'北京',
              //       'value':599
              //     },
              //     {
              //       "name":"上海",
              //       'value':142
              //   }]
              // },
              {
                name:'启动次数', //浮动框的标题
                type:'map',
                // mapType:'china',
                coordinateSystem:'geo',
                roam:true,
                geoIndex:0,

                itemStyle:{
                  normal:{
                    label:{
                      // show:true,
                      formatter:'{b}\n{c}'
                    },
                    borderWidth:0.5,
                    borderColor:'#A1DFF2'
                  },
                  emphasis:{    //地图内强调的样式，悬浮式的样式显示
                    label:{
                      show:false
                    },
                    areaColor:'rgb(213,214,79)',
                    borderColor:'#1e90ff',
                    borderWidth:3
                  }
                },

                data:[
                  {
                    'name':'北京',
                    'value':599
                  },
                  {
                    "name":"上海",
                    'value':142
                  }
                ]
              },
            ]

          })
          mych.on('click',function (param) {
            console.log(param)
          })
        },
      }
    }
</script>

<style scoped>
#originhotmap{
  width: 100%;
  height: 100%;
}
.default{
  background: #1E9FFF;
  color: #f0f0f0;
}
.active{
  color: #515a6e;
  background-color: #fff;
}
</style>

