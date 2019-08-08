<template>
  <Card  id="duration">
    <div class="modal-title">
      <span>时长分布</span>
    </div>
    <div id="duration-chart">

    </div>
  </Card>
</template>

<script>
  import {URL} from '../../../api/urlsConfig'
    export default {
      name: "duration-distribute",
      data(){
          return{
            /*每个时段活跃度情况*/
            relationActiveBarData : {},
            mychart:null,
            areNames:'',
          }

      },
      props:
        [
          'dateData',
          'scenicCode',
          'showDistribute'
        ],
      watch:{
        dateData(){
          let parm={
            code:this.scenicCode,
            date:this.dateData,
            isRealtime:false
          }
          this.queryDurationDistribute(parm)
        },
      },
      methods:{
        //非实时下初始化日，月下调用
        DayOrMouthInit(type,time){
             let parms= {
               code: this.scenicCode,
               date: time,
               isRealtime: false
             }
            this.queryDurationDistribute(parms)
          },

        /*获取时长数据*/
        queryDurationDistribute(parms){
          let _this=this;
          if(parms!=''){
            this.$http.request({
              method:"get",
              params:parms,
              url:URL.durationNum,
              success:(data) => {
                _this.relationActiveBarData.y =data.data.ylist;
                _this.relationActiveBarData.x=data.data.xlist;
                _this.areNames=data.data.areaName
                console.log(_this.areNames)
                  _this.initDurationDistributeBar();
              },
              error : (data) => {
              }
            });
          }

        },
        /*时长柱状图初始化*/
        initDurationDistributeBar(){
          let myChart =this.mychart;
          let option = {
            tooltip : {
              trigger: "axis"
            },
            grid:{
              bottom:"10%",
              right:"10%"
            },
            legend: {
              data:[this.areNames],
              align:'left'
            },
            calculable : true,
            xAxis : [
              {
                type : "category",
                data : this.relationActiveBarData.x,
                z:10
              }
            ],
            dataZoom:[
              {
                type:'inside',
                show:true
              }
            ],
            yAxis : [
              {
                type : "value",
                name : "人数"
              }
            ],
            series : [
              {
                type:"bar",
                name:this.areNames,
                barGap:'-100%',
                barCategoryGap:'40%',
                color : ['#709AC5','#A6D0EC'],
                data:this.relationActiveBarData.y,
                label:{
                  normal:{
                    show:true,
                    position:'top',
                  }
                }
              }
            ]
          };
          myChart.setOption(option);
          window.addEventListener("resize", function () {
            myChart.resize()
          });
        },
      },
      created(){
      },
      mounted(){
        if(!this.showDistribute){
          let par={
            code:this.scenicCode,
            date:''
          }
          this.queryDurationDistribute(par)
          // this.initDurationDistributeBar();
        }
        this.mychart=this.$echarts.init(document.querySelector("#duration-chart"));
      }
    }
</script>

<style scoped>
  #duration{
    height: 100%;
    width: 400px;
    margin-top: 10px;
  }
  #duration >>> .ivu-card-body{
    height: 100%;
  }
  #duration >>>#duration-chart{
    width: 100%;
    height: calc(100% - 32px);
  }
</style>
