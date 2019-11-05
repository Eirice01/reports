<template>
    <div id="traffic-modal">
      <Trajectory-Head  @changeDateData="changeDateData" @changeTimeData="changeTimeData"  @changeRealtime="changeRealtime"></Trajectory-Head>
      <div id="left-section" style="z-index: 1">
        <span class="traffic-title">路段活动人流量分布图</span>
        <div class="list-title">
          <div class="num-list">
            <div class="num-icon"></div>
            <span class="num-text">730人以上</span>
          </div>
          <div class="num-list">
            <div class="num-icon"></div>
            <span class="num-text">400至730</span>
          </div>
          <div class="num-list">
            <div class="num-icon"></div>
            <span class="num-text">400人以下</span>
          </div>
        </div>
      </div>
      <div id="right-section" style="z-index: 1">
        <div class="right-slider">
          <!--v-if="loadSlider"-->
          <vue-slider
            v-model="rightSliderVal"
            direction="btt"
            :width="15"
            :min="minNum"
            :max="maxNum"
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
            :labelStyle="{
              color:'#fff'
            }"
            :tooltip-formatter="v =>`${v}%`"
            style="display: inline-block; margin: 30px 0; height: 300px;">
          </vue-slider>
        </div>
      </div>
      <!--<div class="time-shaft" style="z-index: 1">
        <div class="time-box">
          &lt;!&ndash;时间轴&ndash;&gt;
          <Time-Shaft @transferTime="transferTime"></Time-Shaft>
        </div>
      </div>-->
      <traffic-map-tool
        ref="TrafficMapTool"
        :dateData="dateData"
        :isRealtime="isRealtime"
        :rightSliderVal ="rightSliderVal"
        :maxData ="maxData"
        @queryRightSliderNum="queryRightSliderNum">
      </traffic-map-tool>
    </div>
</template>

<script>
  import {URL} from "../../../api/urlsConfig"
  import TrajectoryHead from "../../components/trajectory/TrajectoryHead"
  import TimeShaft from "../../components/trajectory/TimeShaft"
  import TrafficMapTool from "../../components/trajectory/TrafficMapTool"
    export default {
      name: "traffic",
      data(){
        return{
          sliderTime:[0,10],
          minNum:0,
          maxNum:100,
          maxData:0,
          minData:0,
          rightSliderVal:[0,100],
          /*loadSlider:false,*/
          marks1: {
            '0': {
              label: '0',
              style: {

              },
              labelStyle: {
                color:'#21f0f3'
              }
            },
            '100': {
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
          dateData:this.formatDate(new Date(new Date().getTime())),
          isRealtime:true,
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

        },
      },
      components:{
        TrajectoryHead,
        TimeShaft,
        TrafficMapTool
      },
      methods:{
        /*底部时间轴传过来的时间值*/
       /* transferTime(val){
          this.sliderTime =val;

        },*/
       /*侧边栏滑动滑块*/
        changeSlider(){
          this.queryPercentTraffic();
          let params ={
            minPercent:this.rightSliderVal[0],
            maxPercent:this.rightSliderVal[1],
            isRealtime:this.isRealtime,
            maxNum:this.maxData,
            time: this.isRealtime ? 0 : new Date(this.dateData).getTime()/1000
          }
          //console.log(this.rightSliderVal);
        },
        //获取日期数据(刷新相应图表 调用在watch中写的)
        changeDateData(date){
          this.dateData = date;
        },
        //获取时间数据
        changeTimeData(time){
          this.querySliderMax();
        },
        /*获取右边滑块最大值*/
        querySliderMax(){
          let params={
            time:this.isRealtime ? 0 : new Date(this.dateData).getTime()/1000,
          };
          this.$http.request({
            method:'get',
            params:params,
            url:URL.queryMaxCount,
            success:(data) => {
              if(data.code==200){
                let res =data.data;
                this.maxData =res;
                this.marks1['100'].label = this.maxData;
                this.marks2['100']={
                  label: this.maxData,
                  labelStyle: {
                    color:'#21f0f3'
                  }
                }
                this.marks2 ={...this.marks1,...this.marks2};
                if(res==0){
                  let params ={
                    isRealtime:this.isRealtime,
                    time:0,
                    num:res,
                  }
                  this.$refs['TrafficMapTool'].loadLine(params);
                }else{
                  this.queryPercentTraffic();
                }

              }
            },
            error : (data) => {
            }
          });
        },
        //获取右侧滑块对应人数
        queryPercentTraffic(){
          let params={
            isRealtime:this.isRealtime,//true实时，false非实时，全部传false、
            minPercent:this.rightSliderVal[0],
            maxPercent:this.rightSliderVal[1],
            maxNum:this.maxData,
            time:this.isRealtime? 0 : new Date(this.dateData).getTime()/1000,
          };
          this.$http.request({
            method:'get',
            params:params,
            url:URL.queryPercentTraffic,
            success:(data) => {
              if(data.code==200){
                let res =data.data;
                this.marks2 ={};
                Object.keys(res).forEach((item,index)=>{
                  if(!isNaN(item)){
                    this.marks2[item]={
                      label: res[item],
                      labelStyle: {
                        color:'#21f0f3'
                      }
                    }
                    if(item=='0'){
                      this.minData = res[item];
                    }
                  }
                })
                this.marks2 ={...this.marks1,...this.marks2};
                this.$refs['TrafficMapTool'].showPeoCount(res);
                //console.log(this.marks2)
              }
            },
            error : (data) => {
            }
          });
        },
        //判断实时非实时
        changeRealtime(flag){
          this.isRealtime =flag;
          this.rightSliderVal=[0,100];
          this.querySliderMax();
        },
        //获取右侧滑块对应人数
        queryRightSliderNum(data){
          if(data =='暂无数据'){

          }else{
            let res =data;
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
          }

        }
      },
      created(){

      },
      mounted(){
         this.querySliderMax();
      }
    }
</script>

<style scoped>
#traffic-modal{
  width: 100%;
  height: 100%;
  background: #0A0E29;
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
#left-section{
  width: 420px;
  height:calc(100% - 304px);
  position: absolute;
  left: 0px;
  padding: 10px 0px 0px 20px;
}
.list-title{
  width: 140px;
  height: 120px;
  background-color: rgba(58,102,132,0.5);
  margin-left: 10px;
}
.traffic-title{
  font-size: 16px;
  color: #fff;
  display: inline-block;
  padding: 5px 10px;
}
.num-list{
  width: 100%;
  height: 40px;
  line-height: 40px;
  color: #fff;
}
.num-icon{
  display: inline-block;
  vertical-align: middle;
  width: 10px;
  height:20px;
  border-radius: 5px;

  margin: auto 10px;
}
.num-list:nth-child(1) .num-icon{
  background: red;
}
.num-list:nth-child(2) .num-icon{
  background: yellow;
}
.num-list:nth-child(3) .num-icon{
  background: green;
}
.num-text{
  display: inline-block;
  vertical-align: middle;

}
#right-section{
  width: 220px;
  height:calc(100% - 304px);
  position: absolute;
  right: 0px;
  padding: 40px 20px 0px 0px;
  top: 20%;
}
.right-slider{
  display: flex;
  justify-content: center;
}
</style>
