<template>
    <div id="trajectory-second">
      <Trajectory-Head ref="trajectory2Head" :sliderTime="sliderTime"></Trajectory-Head>
      <div id="left-section" style="z-index: 999">
        <div>
          <Button type="primary" size="small" @click="backIndex">返回</Button>
        </div>
      </div>
      <div id="right-section" style="z-index: 1">
        <div class="btn-box">
          <div class="btns">
            <ul>
              <li class="btn-list">
                <Button size="small" class="od-btn" :class="btnType=='' ? 'btn-active':''" @click="ODClick('')">全部OD</Button>
              </li>
              <li  class="btn-list">
                <Button size="small" class="od-btn" :class="btnType=='1' ? 'btn-active':''" @click="ODClick('1')">跨市OD</Button>
              </li>
              <li  class="btn-list">
                <Button size="small" class="od-btn" :class="btnType=='0' ? 'btn-active':''" @click="ODClick('0')">非跨市OD</Button>
              </li>
            </ul>
          </div>
          <div class="btns">
            <ul>
              <li class="btn-list">
                <Button size="small" class="od-btn" :class="showType=='' ? 'btn-active':''" @click="showTypeClick('')">显示全部</Button>
              </li>
              <li  class="btn-list">
                <Button size="small" class="od-btn" :class="showType=='out' ? 'btn-active':''" @click="showTypeClick('out')">只看流出</Button>
              </li>
              <li  class="btn-list">
                <Button size="small" class="od-btn" :class="showType=='in' ? 'btn-active':''" @click="showTypeClick('in')">只看流入</Button>
              </li>
              <!--<li  class="btn-list">
                <Button size="small" class="od-btn" :class="showType=='in' ? 'btn-active':''" @click="three（'in')">三</Button>
              </li>-->
            </ul>
          </div>
        </div>
        <div class="right-slider">
          <vue-slider
            v-if="loadSlider"
            v-model="rightSliderVal"
            direction="ttb"
            :width="15"
            :min="minNum"
            :max="maxNum"
            :marks="marks2"
            :min-range="minRange"
            :max-range="maxRange"
            :tooltip="'always'"
            @drag-end="changeSlider"
            :railStyle="{
              background:'rgba(0,105,135,0.6)',
            }"
            :processStyle="{
              background:'#00fcff',
            }"
            :dotStyle="{
              width:'15px',
              height:'15px'
            }"
            :tooltipStyle="{
              background:'transparent',
              color:'#21f0f3'
            }"
            style="display: inline-block; margin: 30px 0; height: 300px;">
          </vue-slider>
        </div>
      </div>
      <div class="time-shaft" style="z-index: 999">
        <div class="time-box">
          <!--时间轴-->
          <Time-Shaft ref="timeShaft2"  @transferTime="transferTime"></Time-Shaft>
        </div>
      </div>
      <trajectory-map-tool ref="TrajectoryMapTool" @jumpTrajectoryThree="jumpTrajectoryThree" :showType="showType" :ODType="btnType"></trajectory-map-tool>
    </div>
</template>

<script>
  import {URL} from "../../../api/urlsConfig"
  import TrajectoryHead from "../../components/trajectory/TrajectoryHead"
  import TimeShaft from "../../components/trajectory/TimeShaft"
  import TrajectoryMapTool from "../../components/trajectory/TrajectoryMapTool"
    export default {
      name: "trajectorySecond",
      data(){
       return{
         loadSlider:false,
         minNum:1,
         maxNum:100,
         maxData:0,
         rightSliderVal:[1,10],
         minRange:200,
         maxRange:2000,
         marks1: {
           '1': {
             label: '0',
             style: {

             },
             labelStyle: {
               color:'#21f0f3'
             }
           },
         },
         marks2: {

         },
         sliderTime:['00:00','24:00'],
         btnType:'',
         showType:'',
       }
      },
      watch:{
        dateData(){

        },
        sliderTime(){

        }
      },
      components:{
        TrajectoryHead,
        TimeShaft,
        TrajectoryMapTool
      },
      methods:{
        /*返回轨迹首页*/
        backIndex(){
          this.$router.push({
            path:"Trajectory",
            query:{
             /* dateData:this.$refs.trajectory2Head.titleTime,
              sliderTime:this.sliderTime,
              sliderVal:this.rightSliderVal*/
            }
          })
        },
        changeSlider(){
          this.queryPercentTraffic();
        },
        /*OD类型选择*/
        ODClick(type){
          this.btnType =type;
          this.querySliderPopMax()
        },
        /*显示全部点击*/
        showTypeClick(type){
          this.showType =type;
          this.querySliderPopMax()
        },
        /*底部时间轴传过来的时间值*/
        transferTime(val){
          this.sliderTime =val;
          this.querySliderPopMax()
        },
        //获取右侧滑块对应人数
        queryPercentTraffic(){
          let params={
            isRealtime:false,//true实时，false非实时，全部传false、
            date:this.$refs.trajectory2Head.titleTime,//日期  格式2019-10-10
            startTime:this.sliderTime[0],//开始时间 00:00
            endTime:this.sliderTime[1],//结束时间 10:00
            startNumber:this.rightSliderVal[0],
            endNumber:this.rightSliderVal[1],
            intercity:this.btnType ,//是否跨市 ""全部  0非跨市  1跨市
            roadIds	:this.$route.query.roadIds,//两个用,隔开
            inOrOut:this.showType//		只看流出 out/只看流入 in/全部 ""
          };
          this.$http.request({
            method:'get',
            params:params,
            url:URL.oDData,
            success:(data) => {
              if(data.code==200){
                this.marks2 ={};
                let res =data.data;
                Object.keys(res).forEach((item,index)=>{
                  if(!isNaN(item)){
                    this.marks2[item]={
                      label: res[item],
                      labelStyle: {
                        color:'#21f0f3'
                      }
                    }
                  }
                })
                this.marks2 ={...this.marks1,...this.marks2};
                this.$refs['TrajectoryMapTool'].searchOD2(data);
              }
            },
            error : (data) => {
            }
          });
        },
        /*跳转轨迹3页面*/
        jumpTrajectoryThree(id){
          this.$router.push({
            path:"TrajectoryThree",
            query:{
              dom:"trajectoryThree",
              dateData:this.$refs.trajectory2Head.titleTime,
              sliderTime:this.sliderTime,
              rightSliderVal:this.rightSliderVal,
              roadIds:this.$route.query.roadIds,
              secondRoadIds:id,
              btnType:this.btnType
            }
          })
        },
        /*获取右边滑块条数最大值*/
        querySliderPopMax(){
          let params={
            isRealtime:false,//true实时，false非实时，全部传false、
            date:this.$refs.trajectory2Head.titleTime,//日期  格式2019-10-10
            startTime:this.sliderTime[0],//开始时间 00:00
            endTime:this.sliderTime[1],//结束时间 10:00
            intercity:this.btnType, //是否跨市 ""全部  0非跨市  1跨市
            roadIds:this.$route.query.roadIds,
            inOrOut:this.showType
          };
          this.$http.request({
            method:'get',
            params:params,
            url:URL.rightCount,
            success:(data) => {
              if(data.code==200){
                this.loadSlider = true;
                this.marks1[this.maxNum]=null;
                let res =data.data;
                this.maxNum =res;
                if(this.maxNum<=2000){
                  this.rightSliderVal=[1,this.maxNum];
                  this.maxRange = this.maxNum;
                  this.minRange =0;
                }else{
                  this.rightSliderVal=[1,2000];
                  this.maxRange = 2000;
                  this.minRange =200;
                }
                this.marks1[this.maxNum]={
                  label: this.maxNum,
                  labelStyle: {
                    color:'#21f0f3',
                    margin:'0 0 0 10px',
                    left: '-445%',
                    bottom: '45%'
                  }
                };
                this.querySliderMax();
              }
            },
            error : (data) => {
            }
          });
        },
        /*获取右边滑块人数最大值*/
        querySliderMax(){
          let params={
            isRealtime:false,//true实时，false非实时，全部传false、
            date:this.$refs.trajectory2Head.titleTime,//日期  格式2019-10-10
            startTime:this.sliderTime[0],//开始时间 00:00
            endTime:this.sliderTime[1],//结束时间 10:00
            intercity:this.btnType, //是否跨市 ""全部  0非跨市  1跨市
            roadIds:this.$route.query.roadIds,
            inOrOut:this.showType
          };
          this.$http.request({
            method:'get',
            params:params,
            url:URL.queryMaxPeopleCountByTime,
            success:(data) => {
              if(data.code==200){
                let res =data.data;
                this.maxData =res;
                this.marks2 ={};
                this.marks1['1']={
                  label: this.maxData,
                  labelStyle: {
                    color:'#21f0f3'
                  }
                };
                this.marks2 ={...this.marks1,...this.marks2};
                this.queryPercentTraffic()
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
          this.$refs.trajectory2Head.titleTime =this.$route.query.dateData;
          this.$refs.trajectory2Head.timeVal =this.$route.query.dateData;
          this.sliderTime =this.$route.query.sliderTime;
          // this.btnType = this.$route.query.btnType;
          // this.rightSliderVal = this.$route.query.rightSliderVal;
          // this.maxData = this.$route.query.maxData;
          /*this.maxNum =this.$route.query.maxNum;
          if(this.maxNum<=2000){
            this.rightSliderVal=[1,this.maxNum];
            this.maxRange = this.maxNum;
          }else{
            this.rightSliderVal=[1,2000];
            this.maxRange = 1999;
          }*/
          // this.marks2 = this.$route.query.marks2;
          /*this.marks1[this.maxNum]={
            label: this.maxData,
            labelStyle: {
              color:'#21f0f3'
            }
          };
          this.marks1['0'].label = this.$route.query.minData;
          this.marks2 ={...this.marks2,...this.marks1};*/

          let timeShaft2Val =[];
          this.$route.query.sliderTime.forEach((v,i)=>{
            if(v.indexOf('30')>=0){
              timeShaft2Val[i] = Number(v.split(':')[0]+'.5')
            }else{
              timeShaft2Val[i] =Number(v.split(':')[0])
            }
          })
          this.$refs.timeShaft2.timeValue =timeShaft2Val;
        }else{

        }
        this.querySliderPopMax()

      }
    }
</script>

<style scoped>
#trajectory-second{
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
#right-section{
  width: 220px;
  height:calc(100% - 304px);
  position: absolute;
  right: 0px;
  padding: 40px 20px 0px 0px;
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
.btns:first-child{
  margin-bottom: 30px;
}
.btn-list{
  margin: 10px 0px;
  display: flex;
  justify-content: center;
}
.right-slider{
  display: flex;
  justify-content: center;
}
.btn-list>>>.ivu-btn-default{
  color: #21f0f3;
  border-color: #21f0f3;
  background: transparent;
}
.btn-list .btn-active {
  color: #fff;
  background-color: #2d8cf0;
  border-color: #2d8cf0;
}
#trajectory-second >>>.vue-slider-ttb .vue-slider-mark-label{
  color: transparent;
}
</style>
