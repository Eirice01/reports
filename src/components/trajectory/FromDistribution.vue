<template>
  <div id="change-num">
    <div class="echart-title">
      <Icon type="md-funnel" class="icon-title"></Icon>
      <span>{{transferData.title}}</span>
    </div>
    <div :id="transferData.dom" class="bar-chart">

    </div>
  </div>
</template>

<script>
  import {URL} from '../../../api/urlsConfig'
    export default {
      name: "form-distribution",
      data(){
        return{
          relationActiveLineData : {
            x:[],
            all:[],
            in:[],
          },
          distributionChart:null,
        }
      },
      props:[
        'transferData',
        'dateData',
        'sliderTime',
        'btnType'
      ],
      watch:{
        dateData(){

        },
        sliderTime(){
         this.queryFromDistribution()
        },
        btnType(){
          this.queryFromDistribution()
        }
      },
      methods:{
        /*获取距离分布数据*/
        queryFromDistribution(){
          //console.log(this.dateData,this.sliderTime,222);
          this.$http.request({
            method:"get",
            params:{
              isRealtime:false,//true实时，false非实时，全部传false、
              date:this.dateData,//日期  格式2019-10-10
              startTime:this.sliderTime[0],//开始时间 00:00
              endTime:this.sliderTime[1],//结束时间 10:00
              intercity:this.btnType //是否跨市 ""全部  0非跨市  1跨市
            },
            url:this.transferData.url,
            success:(data) => {
              this.relationActiveLineData.x=data.data.xlist;
              this.relationActiveLineData.all=data.data.ylist;//总量
              this.relationActiveLineData.in=data.data.ylistNeed;//刚需
              this.initRelationActiveBar();
            },
            error : (data) => {
            }
          });
        },
        /*距离分布柱状图初始化*/
        initRelationActiveBar(){
          let option = {
            title:{
              text:this.transferData.title,
              show:false,
              textStyle:{
                color:"#21f0f3",
                fontSize:14,
                fontWeight:'normal'
              },
              textAlign:'left'
            },
            tooltip : {
              trigger: "axis",
              axisPointer:{
                type:'shadow'
              }
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
              left:60
            },
            calculable : true,
            color:['#1771F7','#00F0F4','#7ED321','#CE47CC','#17B9C6'],
            xAxis : [
              {
                type : "category",
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
                type:"bar",
                data:this.relationActiveLineData.all,
              },
              {
                name:"刚需",
                type:"bar",
                data:this.relationActiveLineData.in,
              }
            ]
          };
          this.distributionChart.setOption(option);
          window.addEventListener("resize", ()=>{
            if(this.distributionChart){
              this.distributionChart.resize()
            }
          });

        },
      },
      created(){

      },
      mounted(){
        this.distributionChart = this.$echarts.init(document.querySelector("#"+this.transferData.dom));
        this.queryFromDistribution();
      },
      beforeDestroy(){
        this.distributionChart.clear();
        this.distributionChart = null;
      }
    }
</script>

<style scoped>
  #change-num{
    height: 34%;
    width: 400px;
    position: relative;
   /* margin-top: 10px;*/
  }
  .echart-title{
    position: absolute;
    top: 0px;
    left: 0px;
    z-index: 999;
    color: #21f0f3;
    font-size: 14px;
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
  #change-num >>>.bar-chart{
    width: 100%;
    height: calc(100% - 32px);
  }
</style>
