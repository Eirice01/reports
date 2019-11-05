<template>
  <div id="change-num">
    <div class="echart-title">
      <Icon type="md-funnel" class="icon-title"></Icon>
      <span>人数变化</span>
    </div>
    <div id="num-chart">

    </div>
  </div>
</template>

<script>
  import {URL} from '../../../api/urlsConfig'
    export default {
      name: "number-change",
      data(){
        return{
          relationActiveLineData :{
            x:[],
            all:[],
            in:[],
          },
          numChart:null,
        }
      },
      props:[
        "dateData",
        "sliderTime",
        "btnType"
      ],
      watch:{
        sliderTime(){
          this.queryNumChange();
        },
        btnType(){
          this.queryNumChange();
        }
      },
      methods:{
        /*获取人数变化数据*/
        queryNumChange(){
          this.$http.request({
            method:"get",
            params:{
              isRealtime:false,//true实时，false非实时，全部传false、
              date:this.dateData,//日期  格式2019-10-10
              startTime:this.sliderTime[0],//开始时间 00:00
              endTime:this.sliderTime[1],//结束时间 10:00
              intercity:this.btnType //是否跨市 ""全部  0非跨市  1跨市
            },
            url:URL.popNumChange,
            success:(data) => {
              this.relationActiveLineData.x=data.data.xlist;
              this.relationActiveLineData.all=data.data.ylist;
              this.relationActiveLineData.in=data.data.ylistNeed;
              this.initRelationActiveLine();
            },
            error : (data) => {
            }
          });
        },
        /*人数变化折线图初始化*/
        initRelationActiveLine(){
          let option = {
            title:{
              text:"人数变化",
              show:false,
              textStyle:{
                color:"#21f0f3",
                fontSize:14,
                fontWeight:'normal',
              },
              textAlign:'left'
            },
            tooltip : {
              trigger: "axis"
            },
            legend: {
              data:["总量","刚需"],
              right:'10%',
              textStyle:{
                color:"#fff"
              }
            },
            grid:{
              bottom:20,
              right:"10%",
              left:60,

            },
            calculable : true,
            color:['#1771F7','#00F0F4','#7ED321','#CE47CC','#17B9C6'],
            xAxis : [
              {
                type : "category",
                boundaryGap : false,
                data : this.relationActiveLineData.x,
                axisLabel:{
                  color:"#21f0f3",
                },
                axisLine:{
                  lineStyle:{
                    color:"#21f0f3",
                  }
                }
              }
            ],
            yAxis : [
              {
                type : "value",
                name :"人数/人",
                axisLabel:{
                  margin: 5,
                  color:"#21f0f3",
                },
                axisLine:{
                  lineStyle:{
                    color:"#21f0f3",
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
                name:"总量",
                type:"line",
                data:this.relationActiveLineData.all,
                areaStyle:{
                  normal:{
                    color:new this.$echarts.graphic.LinearGradient(0,0,0,1,[{
                      offset:0,
                      color:'rgba(80,141,255,0.39)'
                    },{
                      offset:.34,
                      color:'rgba(56,155,255,0.25)'
                    },{
                      offset:1,
                      color:'rgba(38,197,254,0.00)'
                    }
                    ])
                  }
                },
              },
              {
                name:"刚需",
                type:"line",
                data:this.relationActiveLineData.in,
                areaStyle:{
                  normal:{
                    color:new this.$echarts.graphic.LinearGradient(0,0,0,1,[{
                      offset:0,
                      color:'rgba(2,231,241,0.8)'
                    },{
                      offset:.34,
                      color:'rgba(2,231,241,0.5)'
                    },{
                      offset:1,
                      color:'rgba(38,197,254,0.00)'
                    }
                    ])
                  }
                }
              }
            ]
          };
          this.numChart.setOption(option);
          window.addEventListener("resize", ()=>{
            if(this.numChart){
              this.numChart.resize()
            }
          });
        },
      },
      created(){

      },
      mounted(){
        this.numChart = this.$echarts.init(document.querySelector("#num-chart"));
        this.queryNumChange();
      },
      beforeDestroy(){
        this.numChart.clear();
        this.numChart =null;
      }
    }
</script>

<style scoped>
  #change-num{
    height: 34%;
    width: 400px;
    position: relative;
    /*margin-top: 10px;*/
  }
  .echart-title{
    position: absolute;
    top: 0px;
    left: 0px;
    z-index: 999;
    /*color: #21f0f3;*/
    font-size: 14px;
  }
  .echart-title i{
    color: #21f0f3;
   /* background-image: -webkit-linear-gradient(left,#046880,#05A3BC,red);
    -webkit-background-clip: text;
    --webkit-text-fill-color:transparent;*/
  }
  .echart-title span{
    color: #21f0f3;
  }
  #change-num .icon-title{
    transform:rotate(90deg);
  }
  #change-num >>> .ivu-card-body{
    height: 100%;
  }
  #change-num >>>#num-chart{
    width: 100%;
    height: calc(100% - 32px);
  }
</style>
