<template>
  <div id="sources">
    <div id="sources-title">
      <li class="sources-pick">
        <span class="sources-main">资源ID：</span>
        <Input v-model="account"  placeholder="输入资源ID"/>
      </li>
      <li class="sources-pick">
        <span class="sources-main">资源名称：</span>
        <Input v-model="usernames"  placeholder="输入资源名称"/>
      </li>
      <Button  @click="sendSourceInfo">查询</Button>
    </div>
    <div id="sources-content">
      <div class="sources-table">
        <Table :columns="columns1" size="small" :data="data1">
          <template slot-scope="{row,index}" slot="control">
            <span>
                <i-Switch v-model="row.status==1 ? true:false" @on-change="changeControl($event,row)" size="small"></i-Switch>
            </span>
          </template>
        </Table>
      </div>
    </div>
  </div>
</template>
<script>
  import {URL} from '../../../../api/urlsConfig'
  export default {
    name: "sources",
    data(){
      return {
        account:'',
        usernames:'',
        topparts:[],
        parttop:'',
        data1:[],
        userId:'',
        users:'',
        isUserModel:false,
        columns1: [
          {
            title: '序号',
            type: 'index',
            width: 60,
            align: 'center',

          },
          {
            title: '资源ID',
            key: 'resourceId',
            align: 'center',

          },
          {
            title: '资源名称',
            key: 'resourceName',
            align: 'center',

          },
          {
            title: '创建时间',
            key: 'createTime',
            align: 'center',

          },
          {
            title: '状态',
            key: 'status',
            align: 'center',
            'slot':'control'
          }
        ],
      }
    },
    components:{
    },
    created(){

    },
    mounted(){
      if(this.$route.query.userId!=undefined){
        this.userId=this.$route.query.userId;
      }
      let parms={

        resourceId:this.account,
        resourceName:this.usernames
      }
      this.getuserData(parms)
    },
    beforeDestroy(){

    },
    methods:{

      //查询
      sendSourceInfo(){
        let parms={

          resourceId:this.account,
          resourceName:this.usernames
        }
        this.getuserData(parms)
      },
      //修改状态
      changeControl(e,row){
        let status='';
        if(e==false){
          status=0;
        }else {
          status=1;
        }
        this.$http.request({
          method:'get',
          params:{
            resourceId:row.resourceId,
            status:status
          },
          url:URL.updateSysResource,
          success:(data) => {
            if(data.code==200){
              this.$Message.warning('修改成功！');
              let parms={
                resourceId:this.account,
                resourcename:this.usernames
              }
              this.getuserData(parms)
            }
          },
          error : (data) => {
            this.$Message.warning('请求数据失败！');
          }
        });
      },
      //获取用户表格数据
      getuserData(parms){
        this.$http.request({
          method:'get',
          params:parms,
          url:URL.querySysResource,
          success:(data) => {
            if(data.code==200){
              let res =data.data;
              this.data1 = res
            }
          },
          error : (data) => {
            this.$Message.warning('请求数据失败！');
          }
        });
      },
    }
  }
</script>

<style scoped lang="less">
  #sources{
    width: 100%;
    height: 100%;
    >#sources-title{
      width: 100%;
      height: 80px;
      display: flex;
      align-items: center;
      padding:0px 30px;
      background: #e4e7ea;
      /*justify-content: space-between;*/
      .sources-pick{
        width: 20%;
        height: 100%;
        align-items: center;
        display: flex;
        margin-right: 30px;
        >.sources-main{
          min-width:20%;
          display: inline-block;
          vertical-align: middle;

        }
      }
    }
  }
  #sources-content{
    width: 100%;
    height:calc(100% - 80px);
    /*height: 100%;*/
    /*background: #00F7DE;*/
  }
  .sources-table{
    width: 100%;
    height:calc(100% - 100px);
    overflow: auto;
  }
  .sources-bts i{
    color: #6e90b3;
    font-size: 20px;
  }
</style>
<style>
  #sources-title .ivu-btn{
    height: 30px;
    padding:0px 15px;
    background: #6b8caf;
    color: #f5f7f9;
  }
  .sources-table .ivu-table-body{
    height: calc(100% - 30px);
    overflow-y: auto;
    overflow-x: hidden;
  }

  .sources-table .ivu-table-wrapper{
    width: calc(100% - 0px);
    height: 100%;
  }
  .sources-table .ivu-table{
    width: 100%;
    height: 100%;
  }
  .sources-table .ivu-table-body{
    height: calc(100% - 30px);
    overflow-y: auto;
    overflow-x: hidden;
  }
</style>
