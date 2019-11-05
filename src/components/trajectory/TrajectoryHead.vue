<template>
    <div id="trajectory-head">
      <div class="left-list">
        <span class="trajectory-title">西安市</span>
        <span class="trajectory-title">{{titleTime}}</span>
        <span class="trajectory-title" v-if="$route.name=='trajectory'">{{sliderTime[0]}}-{{sliderTime[1]}}</span>
      </div>
      <div class="right-list">
        <div class="real-time list-padding" v-if="$route.name=='traffic'">
          <ButtonGroup size="small">
            <Button class="selectedArea" @click.native="trueTime(true)" :class="!flagClick ? 'default':'visited'">实时</Button>
            <Button class="selectedArea" @click.native="falseTime(false)" :class="flagClick ? 'default':'visited'">非实时</Button>
          </ButtonGroup>
        </div>
        <span>
          <span v-if="$route.name=='traffic'">
            <!--<DatePicker v-if="$route.name=='traffic'" v-show="!flagClick" type="date" placeholder="请选择时间" style="width: 200px" @on-change="changeDateForm" v-model="timeVal" format="yyyy-MM-dd"></DatePicker>-->
            <!--<TimePicker v-if="$route.name=='traffic'" v-show="!flagClick" v-model="timeRangeVal"  format="HH:mm" @on-change="changeTimeForm" type="timerange" placement="bottom-end" placeholder="请选择时间" style="width: 200px;" :steps="[1,5]" @on-ok="changeTimeOk" confirm></TimePicker>-->
            <DatePicker v-show="!flagClick" placement="bottom-end" transfer='true' type="datetime" @on-change="changeDateForm" @on-ok="changeTimeOk" :confirm="true" placeholder="请选择时间" v-model="timeVal"  :transfer="true" :editable="false" format="yyyy-MM-dd HH:mm" :time-picker-options="{steps:[1,5,10]}" style="width: 200px"></DatePicker>
          </span>
          <DatePicker v-else  type="date" placeholder="请选择时间" style="width: 200px" @on-change="changeDateForm" v-model="timeVal" format="yyyy-MM-dd"></DatePicker>
          </span>

      </div>
    </div>
</template>

<script>
    export default {
      name: "trajectoryHead",
      data(){
        return{
          timeVal:"",
          titleTime:'',
          flagClick:true,
          timeRangeVal:['00:00','10:00'],
        }
      },
      props:["sliderTime"],
      inject:[
        "formatDate",
        "changeFormatDate"
      ],
      methods:{
        //改变日期格式
        changeDateForm(val){
          this.timeVal = val;
          this.titleTime = this.timeVal;
          this.$emit("changeDateData",this.timeVal);
          //console.log(this.timeVal, new Date(this.timeVal).getTime())
        },
        //改变时间格式
        /*changeTimeForm(val){
          this.timeRangeVal =val;
          //console.log(this.timeRangeVal)

        },*/
        //时间确定
        changeTimeOk(){
          console.log(this.timeRangeVal,this.timeVal);
          this.$emit("changeTimeData",this.timeVal);
        },
        //实时数据
        trueTime(type){
          this.flagClick = true;
          //this.timeVal = this.formatDate(new Date(new Date().getTime()-24*60*60*1000)).split(" ")[0];
          //this.timeRangeVal =['00:00',this.formatDate(new Date(new Date().getTime()-24*60*60*1000)).split(' ')[1]]
          this.timeVal = this.formatDate(new Date(new Date().getTime()-24*60*60*1000));
          this.titleTime = this.timeVal;
          this.$emit("changeDateData",this.timeVal);
          //this.$emit("changeTimeData",this.timeRangeVal);
          this.$emit('changeRealtime',this.flagClick);
        },
        //非实时数据
        falseTime(type){
          this.flagClick = false;
         /* this.timeVal = this.formatDate(new Date(new Date().getTime()-24*60*60*1000));
          this.timeVal=new Date(this.timeVal);
          this.timeVal =this.changeFormatDate(this.timeVal,'day');*/

          this.timeVal = this.formatDate(new Date(new Date().getTime()-24*60*60*1000));
          this.timeVal=new Date(this.timeVal)
          this.timeVal =this.changeFormatDate(this.timeVal,'minute');

          this.$emit("changeDateData",this.timeVal);
          //this.$emit("changeTimeData",this.timeRangeVal);
          this.$emit('changeRealtime',this.flagClick);
        },
      },
      created(){

      },
      mounted(){
        if(this.$route.name=='traffic'){
          this.timeVal = this.formatDate(new Date(new Date().getTime()-24*60*60*1000));
          //console.log(this.timeVal);
          //this.timeRangeVal =['00:00',this.formatDate(new Date(new Date().getTime()-24*60*60*1000)).split(' ')[1]]
        }else{
          this.timeVal = this.changeFormatDate(new Date(new Date().getTime()-24*60*60*1000),'day');
        }
        this.titleTime = this.timeVal;
      }
    }
</script>

<style scoped>
  #trajectory-head{
    width: 100%;
    height: 44px;
    position: relative;
    /*background: #E1E7EC;*/
  }
  .left-list{
    position: absolute;
    left: 0px;
    bottom: 0px;
  }
  .right-list{
    position: absolute;
    right: 0px;
    bottom: 0px;
    padding: 5px 20px 5px 0px;
  }
  .trajectory-title{
    padding-left: 10px;
    font-size: 16px;
    color: #fff;
   /* font-weight: bold;*/
    line-height: 44px;
  }
  .default{
    background-color: #F2F2F3;
    color: #5D758F;
    border-color: #F2F2F3;
  }
  .visited{
    background-color: #5D758F;
    color: #fff;
    border-color: #5D758F;
  }
  .real-time{
    float: left;
    margin-right: 15px;
  }
  .list-padding{
    padding: 3px 0px;
  }

</style>
