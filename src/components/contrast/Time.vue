<template>
    <div id="time-select">
      <div class="check-list-title">
        <span class="check-list-title-left"><span class="item-warn">*</span>时间：</span>
        <span class="check-list-title-right"></span>
      </div>
      <div class="check-list-content">
        <Row class="time-list">
          <Col span="7" class="list-padding">
            <Button  size="small" v-if="this.$route.query.type=='tour'" @click="chooseTimeType('minute')" :class="timeSelectType=='minute' ? 'btn-active':''">分</Button>
            <Button  size="small" @click="chooseTimeType('day')" :class="timeSelectType=='day' ? 'btn-active':''">日</Button>
            <Button  size="small" @click="chooseTimeType('month')" :class="timeSelectType=='month' ? 'btn-active':''">月</Button>
          </Col>
          <Col span="15">
            <DatePicker v-if="timeSelectType=='minute'" :type="minuteType" placeholder="请选择时间" @on-change="changeDateForm" v-model="timeVal" :options="options1" :transfer="true" :time-picker-options="{steps:[1,5,1]}" style="width: 200px"></DatePicker>
            <DatePicker v-if="timeSelectType=='day'" :type="dayType" placeholder="请选择时间" @on-change="changeDateForm" v-model="timeVal" :transfer="true" :options="options1" style="width: 200px"></DatePicker>
            <DatePicker v-if="timeSelectType=='month'" type="month" placeholder="请选择时间" @on-change="changeDateForm" v-model="timeVal" :transfer="true" :options="options1" :multiple="monthMultiple" style="width: 200px"></DatePicker>
          </Col>
          <Col span="2" class="list-padding">
            <Button type="primary" size="small" class="btn-primary" @click="addTime" v-show="showTimeMulti">+</Button>
          </Col>
        </Row>
        <Row class="time-list">
          <Col span="15" offset="7">
            <div v-if="showAddTime">
              <DatePicker v-if="timeSelectType=='minute'" :type="minuteType" placeholder="请选择时间"@on-change="changeDateForm2" v-model="timeVal2" :options="options1" :transfer="true" :time-picker-options="{steps:[1,5,1]}" style="width: 200px"></DatePicker>
              <DatePicker v-if="timeSelectType=='day'" :type="dayType" placeholder="请选择时间" @on-change="changeDateForm2" v-model="timeVal2" :transfer="true" :options="options1" style="width: 200px"></DatePicker>
              <DatePicker v-if="timeSelectType=='month'" type="month" placeholder="请选择时间" @on-change="changeDateForm2" v-model="timeVal2" :transfer="true" :options="options1" :multiple="monthMultiple" style="width: 200px"></DatePicker>
            </div>

          </Col>
        </Row>
      </div>
    </div>
</template>

<script>
  import {URL} from "../../../api/urlsConfig"
    export default {
      name: "timeSelect",
      data(){
        return{
          timeVal:"",
          timeVal2:"",
          timeSelectType:this.$route.query.type=='tour'? "minute":"day",
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
      props:['showTimeMulti'],
      watch:{
        $route(){
          this.timeSelectType = this.$route.query.type=='tour'? "minute":"day";
        }
      },
      methods:{
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
</style>
