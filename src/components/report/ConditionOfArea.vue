<template>
  <div id="area-select" style="margin-bottom: 15px">
    <div class="check-list-title">
      <span class="check-list-title-left"><span class="item-warn">*</span>{{sendFlag==="0"?"区域":"景区"}}：</span>
      <span class="check-list-title-right"></span>
    </div>
    <div class="check-list-content" v-if="sendFlag == '0'">
      <Timeline>
        <TimelineItem>
          <Tabs name="tab-child" :value="selectName" size="small" @on-click="selectAreaTab">
            <TabPane label="西安市" name="xian" tab="tab-child" >
            </TabPane>
          </Tabs>
        </TimelineItem>
        <TimelineItem>
          <Tabs name="tab-child" :value="selectName" size="small" @on-click="selectAreaTab">
            <TabPane label="开发区" name="kaifa" tab="tab-child">
              <div style="text-align:right;margin-bottom: 10px">
                <Checkbox v-model="allSelect" @on-change="selectAll(allSelect,labels)">全选</Checkbox>
                <!--<Button  size="small" @click="resetLabel('allSelect',labels)" class="btn-primary">重置</Button>-->
              </div>
              <label  v-for="item in labels" class="checkBoxStyle" :class="item.checked==true ? 'label-active':''" @click="selectLabel(item,labels,'allSelect')">{{item.cityName}}</label>
            </TabPane>
            <TabPane label="区县" name="quxian" tab="tab-child">
              <div style="text-align: right;margin-bottom: 10px">
                <Checkbox v-model="allSelectCountry" @on-change="selectAll(allSelectCountry,areas)">全选</Checkbox>
                <!--<Button  size="small" @click="resetLabel('allSelectCountry',areas)" class="btn-primary">重置</Button>-->
              </div>
              <label  v-for="item in areas" class="checkBoxStyle" :class="item.checked==true ? 'label-active':''" @click="selectLabel(item,areas,'allSelectCountry')">{{item.cityName}}</label>
            </TabPane>
          </Tabs>
        </TimelineItem>
      </Timeline>
      <div class="day" style="margin-top: 15px">
        <span class="day-title">划分标准：</span>
        <RadioGroup v-model="day">
          <Radio label="白天"></Radio>
          <Radio label="夜间"></Radio>
        </RadioGroup>
      </div>
    </div>
    <div class="check-list-content" v-else="sendFlag == '1'">
      <div class="view-box">
        <label  v-for="item in viewAreas" class="checkBoxStyle" :class="item.checked==true ? 'label-active':''" @click="selectLabel(item,viewAreas,'allSelectView')">{{item.cityName}}</label>
      </div>
    </div>
  </div>
</template>

<script>
  import {URL} from '../../../api/urlsConfig'
  export default {
    name: "condition-of-constitute",
    data() {
      return{
        labels:[],
        areas:[],
        selectName:"12",
        day:"白天",
        areaVal:"",
        showSelectAll:true,
        areaData:["xian"],
        allSelect:false,
        allSelectCountry:false,
        allSelectView:false,
        areaTitle:"",
        viewAreas:[],
        selectAreaName:["西安市"],
        allViewId:[],
      }
    },
    props:[
      'sendFlag',
    ],
    watch:{
      // sendFlag(){
      //     this.areaTitle=this.sendFlag
      // },

    },
    methods:{
      //获取开发区， 区县数据
      queryAreaData(num){
        this.$http.request({
          method:'get',
          params:{flag : num},//参数：flag 0区县 1开发区
          url:URL.queryAreaData,
          success:(data) => {
            if(!!data.data){
              let res  = data.data;
              res.forEach((item)=>{
                item.checked = false;
              })
              if(num=="1"){
                this.labels = res;
              }else if(num=="0"){
                this.areas = res;
              }

            }
          },
          error : (data) => {
          }
        });
      },
      //获取景区数据
      queryViewData(){
        this.$http.request({
          method:'get',
          params:{flag : 1},
          url:URL.getScenicAreaList,
          success:(data) => {
            if(!!data.data){
              let res  = data.data;
              let allViewId =[];
              res.forEach((item)=>{
                item.checked = false;
                this.allViewId.push(item.cityCode);
              })
              this.viewAreas = res;
              let allView ={
                cityCode: "all",
                cityName: "所有景区",
                checked:false,
              }
              if(!this.showSelectAll){
                this.viewAreas.unshift(allView);
              }
            }
          },
          error : (data) => {
          }
        });
      },
      //点击区域Tab
      selectAreaTab(name){
        this.selectName = name;
        if(name=="xian"){
          this.areaVal =name;
          this.labels.forEach((item)=>{
            item.checked = false;
          })
          this.areas.forEach((item)=>{
            item.checked = false;
          })
          this.areaData=[name];
          this.selectAreaName=["西安市"];
        }else if(name=='kaifa'){
          if(this.labels.length==0){
            this.queryAreaData("1")
          }
          if(this.areaData.join(',')=="xian"){
            this.areaData=[];
          }

        }else if(name=='quxian'){
          if(this.areas.length==0){
            this.queryAreaData("0")
          }
          if(this.areaData.join(',')=="xian"){
            this.areaData=[];
          }
        }


      },
      //选择标签
      selectLabel(item,data,type){
        let all =[];
        this.selectAreaName =[];
        if(this.showSelectAll){
          item.checked = !item.checked;
          data.forEach((item)=>{
            if(item.checked){
              all.push(item.cityCode);
              this.selectAreaName.push(item.cityName);
            }
          });
          this.areaData =all;
        }else{
          if(this.areaData[0]==item.cityCode){
            this.areaData =[];
            this.selectAreaName=[];
          }else{
            data.forEach((list)=>{
              if(this.areaData[0]==list.cityCode){
                list.checked = false;
              }
            })
            this.areaData=[item.cityCode];
            this.selectAreaName =[item.cityName];
          }
          item.checked =!item.checked;
        }
        switch(type){
          case 'allSelect':
            if(all.length==data.length){
              this.allSelect = true;
            }else{
              this.allSelect = false;
            }
            this.areas.forEach((item)=>{
              item.checked = false;
            })
            break ;
          case 'allSelectCountry':
            if(all.length==data.length){
              this.allSelectCountry = true;
            }else{
              this.allSelectCountry = false;
            }
            this.labels.forEach((item)=>{
              item.checked = false;
            })
            break ;
          case 'allSelectView':
            if(all.length==data.length){
              this.allSelectView = true;
            }else{
              this.allSelectView = false;
            }
            break ;
        }
      },
      //重置
      resetLabels(type,data){
        switch(type){
          case 'allSelect':
            this.allSelect = false;
            break;
          case 'allSelectCountry':
            this.allSelectCountry = false;
            break;
          case 'allSelectView':
            this.allSelectView = false;
            break;
        }
        this.selectAll(false,data);
      },
      //全选
      selectAll(flag,data){
        this.areaData=[];
        this.selectAreaName =[];
        data.forEach((item)=>{
          if(flag){
            item.checked =true;
            this.areaData.push(item.cityCode);
            this.selectAreaName.push(item.cityName);
          }else{
            item.checked =false;
          }
        })
      },
    },
    created(){
      this.queryViewData()
    },
    mounted(){

      }
  }
</script>

<style scoped >
  #area-select{
    width: 100%;
  }
  #area-select >>>.ivu-tabs-bar{
    margin-bottom: 6px;
  }
  #area-select>>>.ivu-timeline-item-head{
    top: 10px;
  }
  #area-select>>>.ivu-timeline-item-tail{
    border-left: 1px solid #979797;
    top: 10px;
  }
  #area-select>>>.ivu-timeline-item{
    padding: 0px;
  }
  #area-select>>>.ivu-timeline-item-content{
    padding: 1px 1px 0px 24px;
  }
  .day-title{
    font-size: 12px;
  }
  .view-box{
    padding-top: 5px;
  }

</style>
