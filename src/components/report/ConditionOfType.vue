<template>
  <div id="people-type" style="margin-bottom: 15px">
    <div class="check-list-title">
      <span class="check-list-title-left"><span class="item-warn">*</span>{{typeTitle}}：</span>
      <span class="check-list-title-right"></span>
    </div>
    <div class="check-list-content">
      <div class="list-box">
        <label  v-for="item in peopleType" class="checkBoxStyle" :key="item.code" :class="item.checked==true ? 'label-active':''" @click="selectPeopleLabel(item)">{{item.name}}</label>
      </div>
    </div>
  </div>
</template>

<script>
  import {URL} from '../../../api/urlsConfig'
  export default {
    name: "condition-of-type",
    data(){
      return{
        peopleType:[

        ],
        peopleTypeData:[],
        selectItem:[],
        selectIds:[],
        typeTitle:this.sendFlag == "0" ? '人口类别':'景区人口类别',
      }
    },
    props:[
      "typeMulti",
      "sendFlag"
    ],
    watch:{
      sendFlag:function () {
        this.typeTitle = this.sendFlag == "0" ?  '人口类别':'景区人口类别';
        this.queryPeopleType();
      }
    },
    methods:{
      //获取人口类别数据
      queryPeopleType(){
        let url =""
        switch (this.sendFlag){
          case "0":
            url= URL.queryPeopleType;
            break;
          case "1":
            url= URL.getScenicTypeList;
            break;
        }
        this.$http.request({
          method:'get',
          params:{},
          url:url,
          success:(data) => {
            if(!!data.data){
              let res  =data.data;
              res.forEach((item)=>{
                item.checked = false;
              })
              this.peopleType = res;
            }

          },
          error : (data) => {
          }
        });
      },
      //选择人口类别标签
      selectPeopleLabel(item){
        if(this.typeMulti){//多选
          item.checked =!item.checked;
          this.selectItem =this.selectItem.filter(data=>{return data.name!=item.name});
          if(item.checked){
            this.selectItem.push(item);
          }
        }else{//单选
          if(this.selectItem.length==0){
            this.selectItem.push(item);
          }else if(this.selectItem.length==1){
            if(this.selectItem[0].name==item.name){
              this.selectItem = []
            }else{
              this.selectItem[0].checked =false;
              this.selectItem =[item];
            }
          }
          item.checked =!item.checked;
        }

      },
      //重置
      resetPeopleLabel(){
        this.peopleType.forEach((item)=>{
          item.checked =false;
        })
        this.selectItem = [];
      }
    },
    created(){
      this.queryPeopleType()
    },
    mounted(){

    }
  }
</script>

<style scoped>
  #people-type{
    width: 100%;
  }
</style>
