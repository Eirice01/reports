<template>
    <div id="header-section">
        <div class="left-list">
          <span class="address-title" v-if="areaNames!=''&&areaName===undefined">陕西省西安市{{areaNames}}</span>
          <span class="address-title" v-if="areaNames=='' &&areaName===undefined">陕西省西安市所有景区</span>
          <span class="address-title" v-if="areaName==''&& areaNames==undefined">陕西省西安市</span>
          <span class="address-title" v-if="areaName!=''&& areaNames==undefined">陕西省西安市 {{areaName}}</span>
          <span class="time-title date-title">{{titleTime}} 数据</span>
        </div>
        <div class="right-list clearFix">
          <div class="real-time list-padding" v-show="showMinute">
            <ButtonGroup size="small">
              <Button class="selectedArea" @click.native="trueTime(true)" :class="!flagClick ? 'default':'visited'">实时</Button>
              <Button class="selectedArea" @click.native="falseTime(false)" :class="flagClick ? 'default':'visited'">非实时</Button>
            </ButtonGroup>
          </div>
          <div class="real-time clearFix" v-show="showMinute && isPopDtate ? false : true">
            <div class="time-list time-btn">
              <Button  size="small" @click="chooseTimeType('minute')"  :class="timeSelectType=='minute' ? 'btn-active':''" v-show="showMinute">分</Button>
              <Button  size="small" @click="chooseTimeType('day')" :class="timeSelectType=='day' ? 'btn-active':''">日</Button>
              <Button  size="small" @click="chooseTimeType('month')" :class="timeSelectType=='month' ? 'btn-active':''">月</Button>
            </div>
            <div class="time-list">
              <DatePicker v-if="timeSelectType=='minute'" placement="bottom-end" transfer='true' :type="minuteType" @on-change="changeDateForm" @on-ok="changeDate('minute')" :confirm="true" placeholder="请选择时间" v-model="timeVal"  :transfer="true" :editable="false" format="yyyy-MM-dd HH:mm" :time-picker-options="{steps:[1,5,10]}" style="width: 200px"></DatePicker>
              <DatePicker v-if="timeSelectType=='day'" placement="bottom-end" transfer='true' :type="dayType" @on-change="changeDateForm" @on-ok="changeDate('day')" :confirm="true" placeholder="请选择时间" v-model="timeVal" :transfer="true" :editable="false" style="width: 200px"></DatePicker>
              <DatePicker v-if="timeSelectType=='month'" placement="bottom-end" transfer='true' type="month" @on-change="changeDateForm" @on-ok="changeDate('month')" :confirm="true" placeholder="请选择时间" v-model="timeVal" :transfer="true" :editable="false" :multiple="monthMultiple" style="width: 200px"></DatePicker>
            </div>
          </div>
        </div>
    </div>
</template>

<script>
    export default {
      name: "header-modal",
      data(){
        return{
          date:'',
          titleTime:'',
          flagClick : true,
          timeVal:"",
          isPopDtate:true,
          timeSelectType:this.showMinute ? "minute" :"day",
          minuteType:"datetime",
          dayType:"date",
          monthType:"month",
          monthMultiple:false,
          oldtime:'',
          options1: {
            shortcuts: [
              {
                text: '时间点',
                value () {

                },
                onClick: () => {
                  if(this.timeSelectType=='minute'){
                    this.minuteType="datetime";
                  }else if(this.timeSelectType=='day'){
                    this.dayType = "date";
                  }else if(this.timeSelectType=='month'){
                    this.monthMultiple = false;
                  }

                }
              },
              {
                text: '时间段',
                value () {

                },
                onClick: () => {
                  if(this.timeSelectType=='minute'){
                    this.minuteType="datetimerange";
                  }else if(this.timeSelectType=='day'){
                    this.dayType = "daterange"
                  }else if(this.timeSelectType=='month'){
                    this.monthMultiple = true;
                  }
                }
              }
            ]
          },
          showDistribute:false,
        }
      },
      inject:[
        "initDate",
        "titletimes",
        "formatDate",
        "changeFormatDate"
      ],
      props:[
        "showMinute",
        "mark",
        'areaName',
        'areaNames',
        'realTitleTime'
      ],
      methods:{
        //实时数据
        trueTime(type){
          this.$emit('initAreaName');
          this.$emit('getTypeStatus',type)
          this.$emit('getPopStatus',type);
          this.$emit('getSourcetype',type);
          this.$emit('typeOfRealtime',type)
          this.isPopDtate=type;
          this.flagClick = true;
          this.timeVal=new Date(this.timeVal)
          this.timeVal =this.changeFormatDate(this.timeVal,'this.timeSelectType');
          this.$emit("getTourChose",this.isPopDtate,this.timeSelectType,this.timeVal)
          this.$emit('handleChangeTep',type)
          if(type){
            this.timeSelectType='minute';
            this.titleTime = this.realTitleTime;

          }

        },
        //非实时数据
        falseTime(type){
          this.isPopDtate=type;
          this.$emit('initAreaName');
          this.$emit('getTypeStatus',type)
          this.$emit('getPopStatus',type);
          this.$emit('getSourcetype',type);
          this.flagClick = false;
          if(this.timeSelectType=='minute'){
            this.timeVal = this.formatDate(new Date(new Date().getTime()-24*60*60*1000));
            this.timeVal=new Date(this.timeVal)
            this.timeVal =this.changeFormatDate(this.timeVal,'minute');
            this.$emit("getOutRealtype",type,this.timeSelectType,this.timeVal);
            this.$emit('changeTourtype', this.isPopDtate,this.timeVal);
            this.$emit("getTourChose",this.isPopDtate,this.timeSelectType,this.timeVal)
          }
          if(type){
            this.$emit("changeDateData",this.timeVal);
            this.$emit("getTourChose",this.isPopDtate,type,this.timeVal)
          }
          this.titleTime = this.timeVal;
        },
        //选择时间类型
        chooseTimeType(selected){
          let time=new Date(this.timeVal);
          let time2 =this.changeFormatDate(time,selected);
          this.titleTime=time2;
          this.$emit("getTourChose",this.isPopDtate,selected,time2)
          this.$emit('getOutStatus',selected,time2);
          this.$emit('getBackInfo',selected,time2);
          this.$emit('changeTypeDay',selected,time2)
          this.$emit("changeDateData",time2);
          if(selected!='minute'){
            this.$emit("getChoseDayOrMourh",selected,time2);
          }else {
           this.$emit('gethandleMinute',selected,time2);
          }
          this.timeSelectType = selected;
          if(this.$route.name=='tour'){
            if(selected!="minute"){
              this.showDistribute =true;
            }else{
              this.showDistribute =false;
            }
            this.$emit('showDistributeData',this.showDistribute);
          }

        },
        //改变时间格式
        changeDateForm(val){
          this.timeVal = val;
          this.oldtime=val;

        },
        //改变时间
        changeDate(type){

          //分被选中后选择时间后调用
          if(this.timeSelectType=='minute'){
            this.$emit("getChangeTimeOutReal",this.isPopDtate,this.timeVal);
          }
          //人口页面时间回调
          //日，月选择后时间被选择后调用
          if(typeof(this.timeVal)=="string" ){
            this.titleTime=this.timeVal;
          }else{
            this.timeVal =this.changeFormatDate(this.timeVal,type);
            this.titleTime=this.timeVal;
          }
          this.$emit("changeDateData",this.timeVal);
          this.$emit('changeTypeDay',type,this.timeVal)
          this.$emit("getTourChose",this.isPopDtate,type,this.timeVal)
        },
      },
      created(){

      },
      mounted(){
        this.date=this.initDate(new Date().getTime());
        if(this.$route.query.date!=''&&this.$route.query.date!=undefined){
          this.titleTime =this.$route.query.date;
          if(this.$route.query.istype=='pops'){
            this.timeSelectType=this.$route.query.oldtypes;
            this.timeVal = this.$route.query.date;
            this.$emit('changeTypeDay',this.timeSelectType,this.timeVal)
          }
          if(this.$route.query.istype=='tours'){
            this.isPopDtate=this.$route.query.oldstatus
            if(this.$route.query.oldstatus==false){
              this.timeSelectType=this.$route.query.oldtypes;
              this.flagClick = false;
              this.timeVal = this.$route.query.date;
              if(!this.isPopDtate){
                this.chooseTimeType(this.timeSelectType)
                this.$emit("changeDateData",this.$route.query.date);
              }
            }else {

              let time=new Date(this.$route.query.date);
              this.timeVal  =this.changeFormatDate(time,this.$route.query.oldtypes);
              this.timeSelectType=this.$route.query.oldtypes;
              this.trueTime(true)
              this.flagClick = true;

              this.$emit("changeDateData",this.timeVal);
            }
            this.$emit('getTypeStatus',this.isPopDtate);
          }
        }else{
          this.timeVal = this.formatDate(new Date(new Date().getTime()-24*60*60*1000));
          //初始化下状态回调
          this.$emit('getTypeStatus',this.isPopDtate);
          this.$emit('getPopStatus',this.isPopDtate);
          this.$emit('getSourcetype',this.isPopDtate);
          this.$emit('getOutStatus',this.timeSelectType,this.timeVal);
          this.$emit('getBackInfo',this.timeSelectType,this.timeVal);
          let time=new Date(this.timeVal);
          let time2 =this.changeFormatDate(time,this.timeSelectType);
          this.$emit('changeTypeDay',this.timeSelectType,time2)
          if(this.$route.query.istype=="pops"){
            this.titleTime=this.timeVal
          }else {
            this.$nextTick(()=>{
              this.titleTime =this.realTitleTime;
            })

          }

        }


      },

    }
</script>

<style scoped>
  #header-section{
    width: 100%;
    height: 44px;
    position: relative;
    background: #E1E7EC;
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
  .address-title{
    padding-left: 20px;
    font-size: 16px;
    color: #6e7072;
    font-weight: bold;
  }
  .time-title{
    padding-left: 15px;
    font-size: 14px;
    /*color: #adaeae;*/

  }
  #header-section >>>.ivu-picker-panel-shortcut:hover {
    background: #C4CBD1;
  }
  .picker-active{
    background: #C4CBD1;
  }
  .selectedArea{
    background:#06213B;
    width: 50px;
    text-align: center;
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
  }
  .time-list{
    float: left;
    margin: 0px 10px;
  }
  .time-btn{
    padding: 3px 0px;
  }
  .list-padding{
    padding: 3px 0px;
  }
  .btn-active {
    color: #fff;
    background-color: #2d8cf0;
    border-color: #2d8cf0;
  }
</style>
