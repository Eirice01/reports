<template>
    <div id="management">
      <div class="flc-management">
            <div class="flc-main">
              <Tabs value="name1" @on-click="changeTab">
                <TabPane label="用户管理" name="name1">
                  <user v-if="isShowUser"></user>
                </TabPane>
                <TabPane label="角色管理" name="name2">
                  <part v-if="isShowPart"></part>
                </TabPane>
                <TabPane label="资源管理" name="name3">
                  <sources v-if="isShowSource"></sources>
                </TabPane>
              </Tabs>
            </div>
      </div>
    </div>
</template>
<script>
  import user from './UserManagement'
  import part from './PartManagement'
  import sources from './SourceManagement'
    export default {
        name: "management",
      data(){
        return {
         isShowUser:true,
          isShowPart:false,
          isShowSource:false
        }
      },
      components:{
        user,
        part,
        sources
      },
      created(){

      },
      mounted(){
      },
      beforeDestroy(){

      },
      methods:{
        changeTab(name){
          if(name=='name1'){
              this.isShowUser=true;
              this.isShowPart=false,
              this.isShowSource=false
          } else if(name=='name2'){
              this.isShowUser=false;
              this.isShowPart=true,
              this.isShowSource=false
          }
          if(name=='name3'){
              this.isShowUser=false;
               this.isShowPart=false,
              this.isShowSource=true
          }
        }
      }
    }
</script>

<style scoped lang="less">
#management{
  width: 100%;
  height: 100%;
  >.flc-management{
    width: 100%;
    height: 100%;
    padding:30px;
    box-sizing: border-box;

    >.flc-main{
      width: 100%;
      height: 100%;
    }
  }
}
</style>
<style>
 .flc-management .flc-main .ivu-tabs{
   height: 100%;
  }
 .flc-management .flc-main .ivu-tabs .ivu-tabs-content{
   height: 100%;
 }
</style>
