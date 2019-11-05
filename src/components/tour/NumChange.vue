<template>
  <Card  id="change-num">
    <div class="modal-title">
      <span>人数变化</span>
    </div>
    <div id="num-chart">

    </div>
  </Card>
</template>

<script>
  import {URL} from '../../../api/urlsConfig'
    export default {
      name: "num-change",
      data(){
        return{
          relationActiveLineData : {
            x:[],
            all:[],
            in:[],
            out :[]
          },
          numTimer:null,
          mark:true,
        }
      },
      props:[
        "isType",
        "dateData",
        'scenicCode',
        'isclick'
      ],
      watch:{
        dateData(){

        },
      },
      beforeDestroy(){
        //清空定时器
        clearInterval(this.numTimer);
        this.numTimer=null;
      },
      created(){


      },
      mounted(){
        if(this.$route.query.date!=undefined&&this.$route.query.date!=''){
          this.backQueryNumChange();
        }else {
          if(!this.isclick){
            this.queryNumChange()
          }
        }
      },
      methods:{
        //根据实时非实时切换定时5分钟刷新
        getisRealtime(type){
          if(this.$route.query.istype=='tours'){
            if(type){
              this.numTimer=setInterval(this.queryNumChange,5*60*1000)
            }else{
              clearInterval(this.numTimer)
            }
          }

        },
       //切换实时非实时后选择分时调用
        getOutRealTime(status,type,time){

          let parms={
            date:time,
            isRealtime:status,
            code:this.scenicCode
          }
          this.outRelaTimesData(parms)
        },
        //切换非实时分钟选择ok点击后请求
        changeOutRealTime(status,time){
          let parms={
            date:time,
            isRealtime:status,
            code:this.scenicCode
          }
          if(time!=''){
            this.outRelaTimesData(parms)
          }

        },
        //返回时候调用
        backQueryNumChange(){
          this.$http.request({
            method:"get",
            params:{
              date:this.dateData,
              isRealtime:false,
              code:this.scenicCode
            },
            url:URL.realtimeNum,
            success:(data) => {
              this.relationActiveLineData.x=data.data.xlist;
              this.relationActiveLineData.all=data.data.totalList;
              this.relationActiveLineData.in=data.data.enterList;
              this.relationActiveLineData.out=data.data.leaveList;
              this.initRelationActiveLine();
            },
            error : (data) => {
            }
          });
        },
        /*获取人数变化数据*/
        queryNumChange(){
          this.$http.request({
            method:"get",
            params:{
              date:'',
              isRealtime:this.isType,
              code:this.scenicCode
            },
            url:URL.realtimeNum,
            success:(data) => {
              this.relationActiveLineData.x=data.data.xlist;
              this.relationActiveLineData.all=data.data.totalList;
              this.relationActiveLineData.in=data.data.enterList;
              this.relationActiveLineData.out=data.data.leaveList;
              this.initRelationActiveLine();
            },
            error : (data) => {
            }
          });
        },
        //切换到非实时分下调用不能使用参数传递调用上述人数获取方法会导致定时器无法运行
        outRelaTimesData(parms){
          this.$http.request({
            method:"get",
            params:parms,
            url:URL.realtimeNum,
            success:(data) => {
              this.relationActiveLineData.x=data.data.xlist;
              this.relationActiveLineData.all=data.data.totalList;
              this.relationActiveLineData.in=data.data.enterList;
              this.relationActiveLineData.out=data.data.leaveList;
              this.initRelationActiveLine();
            },
            error : (data) => {
            }
          });
        },
        //点击非实时分钟是切换回调
        handleMinute(type,time){
          if(type=='minute'){
            //禁止使用初始化方法加载
            let parms={
              date:time,
              isRealtime:false,
              code:this.scenicCode
            }
            this.handleMinuteTimesData(parms)
          }
        },
        //
        handleMinuteTimesData(parms){
          this.$http.request({
            method:"get",
            params:parms,
            url:URL.realtimeNum,
            success:(data) => {
              this.relationActiveLineData.x=data.data.xlist;
              this.relationActiveLineData.all=data.data.totalList;
              this.relationActiveLineData.in=data.data.enterList;
              this.relationActiveLineData.out=data.data.leaveList;
              this.initRelationActiveLine();
            },
            error : (data) => {
            }
          });
        },
        //地图区域点击调用
        areinuteTimesData(){
          let parm={};
            if(this.isType){
              parm={
                date:'',
                code:this.scenicCode,
                isRealtime:this.isType
              }
            }else {
              parm={
                date:this.dateData,
                code:this.scenicCode,
                isRealtime:this.isType
              }
            }
          this.$http.request({
            method:"get",
            params:parm,
            url:URL.realtimeNum,
            success:(data) => {
              this.relationActiveLineData.x=data.data.xlist;
              this.relationActiveLineData.all=data.data.totalList;
              this.relationActiveLineData.in=data.data.enterList;
              this.relationActiveLineData.out=data.data.leaveList;
              this.initRelationActiveLine();
            },
            error : (data) => {
            }
          });
        },
        /*人数变化折线图初始化*/
        initRelationActiveLine(){
          let myChart = this.$echarts.init(document.querySelector("#num-chart"));
          let option = {
            tooltip : {
              trigger: "axis"
            },
            legend: {
              data:["总人数","流入人口","流出人口"]
            },
            grid:{
              bottom:"10%",
              right:"10%",
              left:55
            },
            calculable : true,
            color:['#2C82BE','#F5BE66','#7ED321','#CE47CC','#17B9C6'],
            xAxis : [
              {
                type : "category",
                boundaryGap : false,
                data : this.relationActiveLineData.x
              }
            ],
            yAxis : [
              {
                type : "value",
                name :"人数/万人",
                axisLabel:{
                  margin: 5
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
                name:"总人数",
                type:"line",
                data:this.relationActiveLineData.all,
                markPoint : {
                  data : [
                    {type : "max", name: "最大值"},
                    {type : "min", name: "最小值"}
                  ]
                },
               /* markLine : {
                  data : [
                    {type : "average", name: "平均值"}
                  ]
                }*/
              },
              {
                name:"流入人口",
                type:"line",
                data:this.relationActiveLineData.in,
                markPoint : {
                  data : [
                    {type : "max", name: "最大值"},
                    {type : "min", name: "最小值"}
                  ]
                },
                /*markLine : {
                  data : [
                    {type : "average", name: "平均值"}
                  ]
                }*/
              },
              {
                name:"流出人口",
                type:"line",
                data:this.relationActiveLineData.out,
                markPoint : {
                  data : [
                    {type : "max", name: "最大值"},
                    {type : "min", name: "最小值"}
                  ]
                },
                /*markLine : {
                  data : [
                    {type : "average", name: "平均值"}
                  ]
                }*/
              }
            ]
          };
          myChart.setOption(option);
          window.addEventListener("resize", function () {
            myChart.resize()
          });
        },
      },

    }
</script>

<style scoped>
  #change-num{
    height: 100%;
    width: 400px;
    margin-top: 10px;
  }
  #change-num >>> .ivu-card-body{
    height: 100%;
  }
  #change-num >>>#num-chart{
    width: 100%;
    height: calc(100% - 32px);
  }
</style>
