<template>
    <div id="trajectory-three">
      <Trajectory-Head ref="trajectory3Head" :sliderTime="sliderTime"></Trajectory-Head>
      <div id="left-section"  style="z-index: 999">
        <div>
          <Button type="primary" size="small" @click="backIndex">返回</Button>
        </div>
      </div>
      <div class="time-shaft"  style="z-index: 999">
        <div class="time-box">
          <!--时间轴-->
          <Time-Shaft ref="timeShaft3" @transferTime="transferTime"></Time-Shaft>
        </div>
      </div>
      <trajectory-map-tool ref="TrajectoryMapTool"></trajectory-map-tool>
    </div>
</template>

<script>
  import {URL} from "../../../api/urlsConfig"
  import TrajectoryHead from "../../components/trajectory/TrajectoryHead"
  import TimeShaft from "../../components/trajectory/TimeShaft"
  import TrajectoryMapTool from "../../components/trajectory/TrajectoryMapTool"
    export default {
      name: "trajectoryThree",
      data(){
       return{
         val:[0,1000],
         marks2: {
           '0': {
             label: '0',
             style: {

             },
             labelStyle: {
               color:'#21f0f3'
             }
           },
           '10000': {
             label: '10000',
             style: {

             },
             labelStyle: {
               color:'#21f0f3'
             }
           },
         },
         sliderTime:['0:00','24:00'],
         secondRoadIds:"",
         maxNum:100,
       }
      },
      components:{
        TrajectoryHead,
        TimeShaft,
        TrajectoryMapTool
      },
      watch:{
        dateData(){

        },
        sliderTime(){
          //console.log(123)
        }
      },
      methods:{
        /*返回轨迹首页*/
        backIndex(){
          this.$router.push({
            path:"Trajectory",
            query:{
             /* dateData:this.$refs.trajectory3Head.titleTime,
              sliderTime:this.sliderTime,
              sliderVal:this.val*/
            }
          })
        },
        /*底部时间轴传过来的时间值*/
        transferTime(val){
          this.sliderTime =val;
          this.querySliderPopMax();
        },
        /*获取右边滑块条数最大值*/
        querySliderPopMax(){
          let params={
            isRealtime:false,//true实时，false非实时，全部传false、
            date:this.$refs.trajectory3Head.titleTime,//日期  格式2019-10-10
            startTime:this.sliderTime[0],//开始时间 00:00
            endTime:this.sliderTime[1],//结束时间 10:00
            intercity:'', //是否跨市 ""全部  0非跨市  1跨市
            roadIds:this.$route.query.roadIds,
            inOrOut:'',
            secondRoadIds:this.$route.query.secondRoadIds==undefined ? '':this.$route.query.secondRoadIds
          };
          this.$http.request({
            method:'get',
            params:params,
            url:URL.rightCount,
            success:(data) => {
              if(data.code==200){
                this.loadSlider = true;
                let res =data.data;
                this.maxNum =res;
                params.startNumber=1;
                params.endNumber=res;
                this.$refs['TrajectoryMapTool'].searchOD(params);
              }
            },
            error : (data) => {
            }
          });
        },
      },
      created(){

      },
      mounted(){
        if(this.$route.query.dateData!=undefined){
          this.$refs.trajectory3Head.titleTime =this.$route.query.dateData;
          this.$refs.trajectory3Head.timeVal =this.$route.query.dateData;
          this.sliderTime =this.$route.query.sliderTime;
          // this.btnType = this.$route.query.btnType;
          this.rightSliderVal = this.$route.query.rightSliderVal;
          if(this.$route.query.secondRoadIds!=undefined){
            this.secondRoadIds= this.$route.query.secondRoadIds
          }
          let timeShaft3Val =[];
          this.$route.query.sliderTime.forEach((v,i)=>{
            if(v.indexOf('30')>=0){
              timeShaft3Val[i] = Number(v.split(':')[0]+'.5')
            }else{
              timeShaft3Val[i] =Number(v.split(':')[0])
            }
          })
          this.$refs.timeShaft3.timeValue =timeShaft3Val;
          this.querySliderPopMax();
        }
      }
    }
</script>

<style scoped>
#trajectory-three{
  width: 100%;
  height: 100%;
  background: #0A0E29;
}
#left-section{
  width: 420px;
  height:calc(100% - 304px);
  position: absolute;
  left: 0px;
  padding: 10px 0px 0px 20px;
}

.time-shaft{
  width: 100%;
  height: 100px;
  padding: 0px 15px;
  /*border: 1px solid #ccc;*/
  position: absolute;
  bottom: 0px;
  left: 0px;
}
.time-box{
  width: 80%;
  height: 70px;
  position: absolute;
  bottom: 0px;
  left: 0px;
  right: 0px;
  top: 0px;
  margin: auto;
}
</style>
