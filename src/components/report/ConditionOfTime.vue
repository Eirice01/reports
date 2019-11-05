<template>
  <div id="time-select" style="margin-bottom: 15px">
    <div class="check-list-title" style="display: flex;align-items: center">
      <span class="check-list-title-left"><span class="item-warn">*</span>时间：</span>
      <span class="check-list-title-right" style="display: flex;align-items: center">
        <div style="width: 50%" v-if="sendid=='prksl_content_003'?false:true">
          <Form ref="formValidate" :model="formValidate"  style="margin-bottom: 0px">
            <FormItem >
               <Input v-model="formValidate.time" disabled  @on-change="checkInfo"></Input>
            </FormItem>
         </Form>
        </div>
        <div v-if="sendid=='prksl_content_003'?true:false" style="width: 50%" >
               <Input v-model="formValidate.time"  disabled></Input>
        </div>
     <div class="timeCheck" style="width: 50%">
       <RadioGroup style="margin-left: 20px" v-model="timeId"  @on-change="changeTime" v-if="sendid=='prksl_content_003'?false:true">
          <!--<Radio label="分"> </Radio>-->
          <Radio label="1">日</Radio>
       </RadioGroup>
       <RadioGroup style="margin-left: 20px" v-model="timeId"  @on-change="changeTime"v-if="sendid=='prksl_content_003'?true:false">
          <!--<Radio label="分"> </Radio>-->
          <!--<Radio label="1">日</Radio>-->
          <Radio label="2">月</Radio>
       </RadioGroup>
     </div>
         <span style="width: 100%;display: inline-block;font-size: 10px;color: rgba(202,42,18,0.89)" v-if="timeId==1&&isRge==true?true:false">天数只能输入（1-30）之间正整数</span>
          <span style="width: 100%;display: inline-block;font-size: 10px;color: rgba(202,42,18,0.89)" v-if="timeId==2&&isRge==true?true:false">月份只能输入（1-12）之间正整数</span>
      </span>
    </div>
    <!--<div class="check-list-content" style="display:flex;justify-content: space-around;align-items: center" v-show="true">-->
      <!---->
    <!--</div>-->
    <!--<div class="check-list-content" v-show="false">-->
      <!--<Row class="time-list">-->
        <!--<Col span="7" class="list-padding">-->
        <!--<Button  size="small" v-if="this.$route.query.type=='tour'" @click="chooseTimeType('minute')" :class="timeSelectType=='minute' ? 'btn-active':''">分</Button>-->
        <!--<Button  size="small" @click="chooseTimeType('day')" :class="timeSelectType=='day' ? 'btn-active':''">日</Button>-->
        <!--<Button  size="small" @click="chooseTimeType('month')" :class="timeSelectType=='month' ? 'btn-active':''">月</Button>-->
        <!--</Col>-->
        <!--<Col span="15">-->
        <!--<DatePicker v-if="timeSelectType=='minute'" :type="minuteType" placeholder="请选择时间" @on-change="changeDateForm" v-model="timeVal" :options="options1" :transfer="true" :time-picker-options="{steps:[1,5,1]}" style="width: 200px"></DatePicker>-->
        <!--<DatePicker v-if="timeSelectType=='day'" :type="dayType" placeholder="请选择时间" @on-change="changeDateForm" v-model="timeVal" :transfer="true" :options="options1" style="width: 200px"></DatePicker>-->
        <!--<DatePicker v-if="timeSelectType=='month'" type="month" placeholder="请选择时间" @on-change="changeDateForm" v-model="timeVal" :transfer="true" :options="options1" :multiple="monthMultiple" style="width: 200px"></DatePicker>-->
        <!--</Col>-->
        <!--<Col span="2" class="list-padding">-->
        <!--<Button type="primary" size="small" class="btn-primary" @click="addTime" v-show="showTimeMulti">+</Button>-->
        <!--</Col>-->
      <!--</Row>-->
      <!--<Row class="time-list">-->
        <!--<Col span="15" offset="7">-->
        <!--<div v-if="showAddTime">-->
          <!--<DatePicker v-if="timeSelectType=='minute'" :type="minuteType" placeholder="请选择时间"@on-change="changeDateForm2" v-model="timeVal2" :options="options1" :transfer="true" :time-picker-options="{steps:[1,5,1]}" style="width: 200px"></DatePicker>-->
          <!--<DatePicker v-if="timeSelectType=='day'" :type="dayType" placeholder="请选择时间" @on-change="changeDateForm2" v-model="timeVal2" :transfer="true" :options="options1" style="width: 200px"></DatePicker>-->
          <!--<DatePicker v-if="timeSelectType=='month'" type="month" placeholder="请选择时间" @on-change="changeDateForm2" v-model="timeVal2" :transfer="true" :options="options1" :multiple="monthMultiple" style="width: 200px"></DatePicker>-->
        <!--</div>-->
        <!--</Col>-->
      <!--</Row>-->
    <!--</div>-->
  </div>
</template>

<script>
  import {URL} from "../../../api/urlsConfig"
  export default {
    name: "condition-of-time",
    data(){
      const timeRule=(rule,value,callback)=>{
        var prttern2=/^(?:1[0-2]|[1-9])$/      //月份正则
        var prttern1=/^(?:[1-9]|([1-2][0-9])?|3[0])$/   //1-30天数正则
        if(value.length==0){
          callback(new  Error('时间不能为空'))
        } else if(this.timeId=="1"){
           if(!prttern1.test(value)){
             callback(new  Error('天数只能是1-30之间的正整数只能为正整数'));
           }else {
             callback();
           }
        }else if(this.timeId=="2"){
          if(!prttern2.test(value)){
            callback(new  Error('月份只能是1-12之间的正整数只能为正整数'));
          }else {
            callback();
          }
        }
        else {
          callback();
        }
      }
      return{
        timeVal:"",
        timeVal2:"",
        timeLsit:[],
        timeId:this.sendid=='prksl_content_003'?"2":"1",
        times:"",
        isRge:false,
        sendData:"",
        formValidate:{
          time:''
        },
        ruleValidate:{
          time:[
            {validator:timeRule,trigger:'blur'}
          ]
        },
        timeSelectType:this.sendFlag=='1'? "minute":"day",
        showAddTime:false,
        minuteType:"datetime",
        dayType:"date",
        monthType:"month",
        monthMultiple:false,
        shortPoint:true,
        options1: {
          shortcuts: [
            {
              text: '时间点',
              value () {

              },
              onClick: () => {
                this.shortPoint =true;
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
                this.shortPoint =false;
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
      }
    },
    props:['showTimeMulti','sendFlag','sendid'],
    watch:{
      sendFlag(){
        this.timeSelectType = this.sendFlag=='1'? "minute":"day";
      },
      sendid(){
       //  this.formValidate.time=this.sendid=='prksl_content_001'?"7":""
       //  this.formValidate.time=this.sendid=='prksl_content_002'?"7":""
       //  this.formValidate.time= this.sendid=='prksl_content_003'?"1":""
       // this.timeId=this.sendid=='prksl_content_003'?"2":"1"
      }
    },
    methods:{


       //手动改变时间选择

       handleChangeTime(type){
         switch (type) {
           case "prksl_content_001":
             this.formValidate.time='7'
             this.timeId='1'
             break;
           case "prksl_content_002":
             this.formValidate.time='7'
             this.timeId='1'
             break;
           case "prksl_content_003":
             this.formValidate.time='1'
             this.timeId='2'
             break;
           case "pqxrk_content_004":
             this.formValidate.time='7'
             this.timeId='1'
             break;
           case "pkfqr_content_005":
             this.formValidate.time='7'
             this.timeId='1'
             break;
           case "prkgs_content_006":
             this.formValidate.time='1'
             this.timeId='1'
             break;
           case "prkgs_content_007":
             this.formValidate.time='1'
             this.timeId='1'
             break;
           case "prkgs_content_008":
             this.formValidate.time='1'
             this.timeId='1'
             break;
           case "prkly_content_009":
             this.formValidate.time='1'
             this.timeId='1'
             break;
           case "prkly_content_010":
             this.formValidate.time='1'
             this.timeId='1'
             break;
           case "ptsqy_content_011":
             this.formValidate.time='7'
             this.timeId='1'
             break;
           case "ptsqy_content_012":
             this.formValidate.time='7'
             this.timeId='1'
             break;
           case "pczfb_content_013":
             this.formValidate.time='1'
             this.timeId='1'
             break;
           case "pczfb_content_014":
             this.formValidate.time='1'
             this.timeId='1'
             break;
           case "tyksl_content_001":
             this.formValidate.time='7'
             this.timeId='1'
             break;
           case "tgsd_content_003":
             this.formValidate.time='1'
             this.timeId='1'
             break;
           case "tgsd_content_004":
             this.formValidate.time='1'
             this.timeId='1'
             break;
           case "tgsd_content_005":
             this.formValidate.time='1'
             this.timeId='1'
             break;
           case "tlyd_content_006":
             this.formValidate.time='1'
             this.timeId='1'
             break;
           case "tlyd_content_007":
             this.formValidate.time='1'
             this.timeId='1'
             break;
           case "tscfb_content_008":
             this.formValidate.time='1'
             this.timeId='1'
             break;

         }
       },
       //校验时间
       checkInfo(){
        if(this.timeId==1&&this.formValidate.time!=''){
          var prttern1=/^(?:[1-9]|([1-2][0-9])?|3[0])$/   //1-30天数正则
          if(!prttern1.test(this.formValidate.time)){
            this.isRge=true;
          }else {
            this.isRge=false
          }
        }
         if(this.timeId==2&&this.formValidate.time!=''){
           var prttern2=/^(?:1[0-2]|[1-9])$/      //月份正则
           if(!prttern2.test(this.formValidate.time)){
             this.isRge=true;
           }else {
             this.isRge=false
           }
         }
      },
      //获取选择时间类型
        changeTime(){
          this.formValidate.time='';
          this.isRge=false;
        console.log(this.timeId)
       },
      //选择时间类型
      chooseTimeType(selected){
        this.timeSelectType = selected;
        this.shortPoint =true;
        this.timeVal ='';
        switch(selected){
          case"minute":
            this.minuteType="datetime";
            break;
          case"day":
            this.dayType = "date";
            break;
          case"month":
            this.monthMultiple = false;
            break;
        }

      },
      //添加时间
      addTime(){
        this.showAddTime =!this.showAddTime;
      },
      //改变时间格式
      changeDateForm(val){
        this.timeVal = val;
      },
      changeDateForm2(val){
        this.timeVal2 = val;
      },
    },
    created(){

    },
    mounted(){

    }
  }
</script>

<style scoped>
  #time-select{
    width: 100%;
  }
  .time-list{
    padding: 5px 0px;
  }
  .list-padding{
    padding: 3px 0px;
  }
  .btn-active {
    color: #fff;
    background-color: #2d8cf0;
    border-color: #2d8cf0;
  }
 .check-list-title-right .ivu-form-item{
   margin-bottom: 0px;
 }
</style>
