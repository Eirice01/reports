<template>
    <div id="trajectory-modal">
      <Trajectory-Head ref="trajectoryHead" :sliderTime="sliderTime" @changeDateData="changeDateData"></Trajectory-Head>
      <div class="list-info">
        <ul class="trajectory-nav">
          <li class="trajectory-list">
            <div class="list-text">
              <div class="total-title">总量 - OD量</div>
              <div class="title-val">{{trackData.totalODQuantity}}</div>
            </div>
            <div class="montant">

            </div>
            <div  class="list-text">
              <div class="demand-title">刚需 - OD量</div>
              <div class="title-val">{{trackData.needODQuantity}}</div>
            </div>
          </li>
          <li class="trajectory-list">
            <div  class="list-text">
              <div class="total-title">总量 - 高峰时间</div>
              <div class="title-val">{{trackData.totalRushHour}}</div>
            </div>
            <div class="montant">

            </div>
            <div  class="list-text">
              <div class="demand-title">刚需 - 高峰时间</div>
              <div class="title-val">{{trackData.needRushHour}}</div>
            </div>
          </li>
          <li class="trajectory-list">
            <div class="list-text">
              <div class="total-title">总量 - 平均OD距离</div>
              <div class="title-val">{{trackData.totalDistanceAvg}}</div>
            </div>
            <div class="montant">

            </div>
            <div class="list-text">
              <div class="demand-title">刚需 - 平均OD距离</div>
              <div class="title-val">{{trackData.needDistanceAvg}}</div>
            </div>
          </li>
          <li class="trajectory-list">
            <div>
              <div class="total-title">总量 - 平均OD时长</div>
              <div class="title-val">{{trackData.totalDurationAvg}}</div>
            </div>
            <div class="montant">

            </div>
            <div class="list-text">
              <div class="demand-title">刚需 - 平均OD时长</div>
              <div class="title-val">{{trackData.needDurationAvg}}</div>
            </div>
          </li>
        </ul>
      </div>
      <div id="left-section" style="z-index: 999">
        <!--人数变化-->
        <Number-Change ref="numberChange" :dateData="dateData" :sliderTime="sliderTime" :btnType="btnType"></Number-Change>
        <!--距离分布-->
        <From-Distribution ref="fromDistribution" :transferData="fromData" :dateData="dateData" :sliderTime="sliderTime" :btnType="btnType"></From-Distribution>
        <!--时长分布-->
        <From-Distribution ref="timeDistribution" :transferData="lengthData" :dateData="dateData" :sliderTime="sliderTime" :btnType="btnType"></From-Distribution>
      </div>
      <div id="right-section" style="z-index: 1">
        <div class="btn-box">
          <div class="btns">
            <ul>
              <li class="btn-list">
                <Button size="small" class="od-btn" :class="btnType=='' ? 'btn-active':''" @click="btnTypeClick('')">全部OD</Button>
              </li>
              <li  class="btn-list">
                <Button size="small" class="od-btn" :class="btnType=='1' ? 'btn-active':''" @click="btnTypeClick('1')">跨市OD</Button>
              </li>
              <li  class="btn-list">
                <Button size="small" class="od-btn" :class="btnType=='0' ? 'btn-active':''" @click="btnTypeClick('0')">非跨市OD</Button>
              </li>
            <!--  <li  class="btn-list">
                <Button size="small" class="od-btn" :class="btnType=='2' ? 'btn-active':''" @click="jumpTrajectorySecond('2')">跳转轨迹2</Button>
              </li>
              <li  class="btn-list">
                <Button size="small" class="od-btn" :class="btnType=='3' ? 'btn-active':''" @click="jumpTrajectoryThree('3')">跳转轨迹3</Button>
              </li>-->
            </ul>
          </div>
        </div>
        <div class="right-slider" style="z-index: 999">
          <vue-slider
            v-if="loadSlider"
            v-model="rightSliderVal"
            direction="ttb"
            :width="15"
            :min="minNum"
            :max="maxNum"
            :min-range="minRange"
            :max-range="maxRange"
            :marks="marks2"
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
      <div class="time-shaft" style="z-index: 1">
        <div class="time-box">
          <!--时间轴-->
          <Time-Shaft ref="timeShaft" @transferTime="transferTime"></Time-Shaft>
        </div>
      </div>
      <trajectory-map-tool
        ref="TrajectoryMapTool"
        :isRealtime="isRealtime"
        :dateData="dateData"
        :sliderTime="sliderTime"
        :btnType="btnType"
        :rightSliderVal="rightSliderVal"
        :roadIds="roadIds"
        :inOrOut="inOrOut"
        @jumpTrajectorySecond="jumpTrajectorySecond"
        @jumpTrajectoryThree="jumpTrajectoryThree"
      >
        <!--@changeRangeMin ="changeRangeMin"-->
      </trajectory-map-tool>
    </div>
</template>

<script>
  import {URL} from "../../../api/urlsConfig"
  import TrajectoryHead from "../../components/trajectory/TrajectoryHead"
  import NumberChange from "../../components/trajectory/NumberChange"
  import FromDistribution from "../../components/trajectory/FromDistribution"
  import TimeShaft from "../../components/trajectory/TimeShaft"
  import TrajectoryMapTool from "../../components/trajectory/TrajectoryMapTool"
    export default {
      name: "trajectory",
      data(){
        return{
          trackData:{
            needDistanceAvg: "",//刚需-平均OD距离
            needDurationAvg: "",//刚需-平均OD时长
            needODQuantity: 0,//刚需-OD量
            needRushHour: "",//刚需-高峰时间
            totalDistanceAvg: "",//总量-平均OD距离
            totalDurationAvg: "",//总量-平均OD时长
            totalODQuantity: 0,//总量-OD量
            totalRushHour: ""//总量-高峰时间
          },
          minNum:1,
          maxNum:100,
          maxData:0,
          minData:0,
          rightSliderVal:[1,100],
          interval:100,
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
          dateData:this.formatDate(new Date(new Date().getTime()-24*60*60*1000)),
          fromData:{
            title:"距离分布",
            dom:"distribution-chart",
            url:URL.distanceChange,
          },
          lengthData:{
            title:"时长分布",
            dom:"length-chart",
            url:URL.durationChange
          },
          roadIds:"",
          inOrOut:"",
          isRealtime:false,
          loadSlider:false,
        }
      },
      inject:[
        "formatDate",
        'changeFormatDate'
      ],
      watch:{
        dateData(){

        },
        sliderTime(){
          this.queryTotalDemandListData();
          this.querySliderPopMax();
        },
      },
      components:{
        TrajectoryHead,
        NumberChange,
        FromDistribution,
        TimeShaft,
        TrajectoryMapTool
      },
      methods:{
        /*获取总量刚需量列表数据*/
        queryTotalDemandListData(){
          let params={
            isRealtime:false,//true实时，false非实时，全部传false、
            date:this.dateData,//日期  格式2019-10-10
            startTime:this.sliderTime[0],//开始时间 00:00
            endTime:this.sliderTime[1],//结束时间 10:00
            intercity:this.btnType //是否跨市 ""全部  0非跨市  1跨市
          };
          // console.log(params)
          this.$http.request({
            method:'get',
            params:params,
            url:URL.queryTrafficDataAvg,
            success:(data) => {
              if(data.code==200){
                this.trackData =data.data;
              }
            },
            error : (data) => {
            }
          });
        },
        changeSlider(){
          this.queryPercentTraffic();
        },
        /*跳转轨迹2页面*/
        jumpTrajectorySecond(id){
          this.$router.push({
            path:"TrajectorySecond",
            query:{
              dateData:this.dateData,
              sliderTime:this.sliderTime,
              rightSliderVal:this.rightSliderVal,
              roadIds:id,
              btnType:this.btnType,
              maxData:this.maxData,
              marks2:this.marks2,
              maxNum:this.maxNum,
              minData:this.minData
            }
          })
        },
        /*跳转轨迹3页面*/
        jumpTrajectoryThree(id){
          this.$router.push({
            path:"TrajectoryThree",
            query:{
              dateData:this.dateData,
              sliderTime:this.sliderTime,
              rightSliderVal:this.rightSliderVal,
              roadIds:id,
              btnType:this.btnType,
              maxNum:this.maxNum
            }
          })
        },
        /*底部时间轴传过来的时间值*/
        transferTime(val){
          if(val[0]==val[1]){
            this.$Message.warning("最大最小值重复，请重新选择！")
            return;
          }
          this.sliderTime =val;

        },
        /*点击右边按钮*/
        btnTypeClick(type){
          this.btnType = type;
          this.queryTotalDemandListData();
          this.querySliderPopMax();
        },
        /*获取右边滑块条数最大值*/
        querySliderPopMax(){
          let params={
            isRealtime:false,//true实时，false非实时，全部传false、
            date:this.dateData,//日期  格式2019-10-10
            startTime:this.sliderTime[0],//开始时间 00:00
            endTime:this.sliderTime[1],//结束时间 10:00
            intercity:this.btnType //是否跨市 ""全部  0非跨市  1跨市
          };
          this.$http.request({
            method:'get',
            params:params,
            url:URL.rightCount,
            success:(data) => {
              if(data.code==200){
                this.loadSlider = true;
                this.marks1[this.maxNum]={};
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
                    /*top:'70%',
                    left:'-180%'*/
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
            date:this.dateData,//日期  格式2019-10-10
            startTime:this.sliderTime[0],//开始时间 00:00
            endTime:this.sliderTime[1],//结束时间 10:00
            intercity:this.btnType //是否跨市 ""全部  0非跨市  1跨市
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
        //获取时间数据(刷新相应图表 调用在watch中写的)
        changeDateData(date){
          this.dateData = date;
        },
        //获取右侧滑块对应人数
        queryPercentTraffic(){
          let params={
            isRealtime:false,//true实时，false非实时，全部传false、
            date:this.dateData,//日期  格式2019-10-10
            startTime:this.sliderTime[0],//开始时间 00:00
            endTime:this.sliderTime[1],//结束时间 10:00
            startNumber:this.rightSliderVal[0],
            endNumber:this.rightSliderVal[1],
            intercity:this.btnType ,//是否跨市 ""全部  0非跨市  1跨市
            roadIds	:""	,//两个用,隔开
            inOrOut:"",//		只看流出 out/只看流入 in/全部 ""
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
        /*//获取右侧滑块0%对应人数
        changeRangeMin(data){
          let res =data.data;
          Object.keys(res).forEach((item,index)=>{
            console.log(item,123)
            if(!isNaN(item)){

              if(item==0){
                this.marks1[item]={
                  label: res[item],
                  labelStyle: {
                    color:'#21f0f3'
                  }
                }
              }
            }
          })
          this.marks2 ={...this.marks1,...this.marks2};
          this.minData = this.marks2["1"].label;
        }*/

      },
      created(){

      },
      mounted(){
        this.querySliderPopMax()
        this.queryTotalDemandListData();
        //this.querySliderMax();
        if(this.$route.query.dateData!=undefined){
          this.$refs.trajectoryHead.titleTime =this.$route.query.dateData;
          this.$refs.trajectoryHead.timeVal =this.$route.query.dateData;
          this.dateData = this.$route.query.dateData;
          this.sliderTime =this.$route.query.sliderTime;
          let timeShaftVal =[]
          this.$route.query.sliderTime.forEach((v,i)=>{
            if(v.indexOf('30')>=0){
              timeShaftVal[i] = Number(v.split(':')[0]+'.5')
            }else{
              timeShaftVal[i] =Number(v.split(':')[0])
            }
          })
          this.$refs.timeShaft.timeValue =timeShaftVal;
        }

      }
    }
</script>

<style scoped>
  #trajectory-modal{
    width: 100%;
    height: 100%;
    background: #0A0E29;
  }
  .list-info{
    margin: 20px 0px 0px 0px;
  }
  .trajectory-nav{
    display: flex;
    width: 90%;
    margin: auto;
    justify-content: space-between;
  }
  .trajectory-list{
    display: flex;
  }
  .montant{
    width: 2px;
    height: 40px;
    background: #3E8694;
    margin: auto 20px;
  }
  #left-section{
    width: 420px;
    height:calc(100% - 304px);
    position: absolute;
    left: 0px;
    padding: 40px 0px 0px 20px;
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
  .total-title{
    color: #1C70F4;
    font-size: 16px;
    padding: 5px 10px;
  }
  .demand-title{
    color: #00E3E4;
    font-size: 16px;
    padding: 5px 10px;
  }
  .title-val{
    color: #fff;
    font-size: 20px;
    padding: 5px 10px;
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
  .custom-tooltip{
    transform:translateY(5px);
  }
  .custom-tooltip.focus{
    font-weight: bold;
  }

</style>
