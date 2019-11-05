<template>
  <Card  id="change-pop">
    <div class="modal-title">
      <span>人口变化</span>
    </div>
    <div id="pop-chart">

    </div>
  </Card>
</template>

<script>
  import {URL} from '../../../api/urlsConfig'
    export default {
      name: "changePop",
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
          if(!this.isclick){//实时
            this.queryNumChange();
          }
        }
        /*this.queryNumChange();*/
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
            url:URL.popNum,
            success:(data) => {
              this.relationActiveLineData.x=data.data.xlist;
              this.relationActiveLineData.all=data.data.permanentList;
              this.relationActiveLineData.in=data.data.flowList ;
              this.relationActiveLineData.out=data.data.stayList;
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
            url:URL.popNum,
            success:(data) => {
              this.relationActiveLineData.x=data.data.xlist;
              this.relationActiveLineData.all=data.data.permanentList;
              this.relationActiveLineData.in=data.data.flowList ;
              this.relationActiveLineData.out=data.data.stayList;
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
            url:URL.popNum,
            success:(data) => {
              this.relationActiveLineData.x=data.data.xlist;
              this.relationActiveLineData.all=data.data.permanentList;
              this.relationActiveLineData.in=data.data.flowList ;
              this.relationActiveLineData.out=data.data.stayList;
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
            url:URL.popNum,
            success:(data) => {
              this.relationActiveLineData.x=data.data.xlist;
              this.relationActiveLineData.all=data.data.permanentList;
              this.relationActiveLineData.in=data.data.flowList ;
              this.relationActiveLineData.out=data.data.stayList;
              this.initRelationActiveLine();
            },
            error : (data) => {
            }
          });
        },
        /*获取人口变化数据*/
        queryNumChange(){
          this.$http.request({
            method:"get",
            params:{
              date:'',
              isRealtime:this.isType,
              code:this.scenicCode
            },
            url:URL.popNum,
            success:(data) => {
              this.relationActiveLineData.x=data.data.xlist;
              this.relationActiveLineData.all=data.data.permanentList;
              this.relationActiveLineData.in=data.data.flowList ;
              this.relationActiveLineData.out=data.data.stayList;
              this.initRelationActiveLine();
            },
            error : (data) => {
            }
          });
        },
        /*人口变化折线图初始化*/
        initRelationActiveLine(){
          let myChart = this.$echarts.init(document.querySelector("#pop-chart"));
          let option = {
            tooltip : {
              trigger: "axis"
            },
            legend: {
              data:["常驻人口","路过人口","游客人口"]
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
                name:"常驻人口",
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
                name:"路过人口",
                type:"line",
                data:this.relationActiveLineData.in,
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
                name:"游客人口",
                type:"line",
                data:this.relationActiveLineData.out,
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
  #change-pop{
    height: 100%;
    width: 400px;
    margin-top: 10px;
  }
  #change-pop >>> .ivu-card-body{
    height: 100%;
  }
  #change-pop >>>#pop-chart{
    width: 100%;
    height: calc(100% - 32px);
  }
</style>
