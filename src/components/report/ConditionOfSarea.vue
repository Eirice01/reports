<template>
    <div id="condition-sarea">
      <li class="sarea-content">
        <span class="sarea-title"><span class="item-warn">*</span>特殊区域：</span>
        <div class="sarea-list" style="height: 100px">
          <!--<RadioGroup v-model="sareaId"  @on-change="changeSareaId">-->
            <!--<Radio v-for="item in sareaData" :label="item.value"  :key="item.value">-->
              <!--<span>{{item.label}}</span>-->
            <!--</Radio>-->
          <!--</RadioGroup>-->
          <Button  size="small"  class="btn-active" disabled>新疆</Button>
          <Button  size="small"  class="btn-active" disabled>西藏</Button>
        </div>
      </li>
    </div>
</template>

<script>
    export default {
        name: "condition-ofsarea",
        data(){
          return{
            sareaId:["650000","540000"],
           sareaData:[
             {
               label:"新疆",
               value:"650000"
             },
             {
               label:"西藏",
               value:"540000"
             }
           ]
          }
       },
      created(){

      },

      mounted(){

      },

      methods:{
      }
    }
</script>

<style scoped lang="less">
#condition-sarea{
  width: 100%;
  margin-top: 15px;
}
.sarea-content{
  width: 100%;
  display: flex;
  >.sarea-title{
    display: inline-block;
  }
}
</style>
