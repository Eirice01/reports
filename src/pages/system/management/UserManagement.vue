<template>
    <div id="user">
      <div id="use-title">
        <li class="use-pick">
          <span class="use-main">账号：</span>
          <Input v-model="account"  placeholder="请输入账号"/>
        </li>
        <li class="use-pick">
          <span class="use-main">姓名：</span>
          <Input v-model="usernames"  placeholder="请输入姓名"/>
        </li>
        <!--<li class="use-pick" >-->
          <!--<span class="use-main">角色：</span>-->
          <!--<Select v-model="parttop" style="z-index: 99">-->
            <!--<Option v-for="(item,index) in topparts" :key="index" :value="item.partcode">{{item.partName}}</Option>-->
          <!--</Select>-->
        <!--</li>-->
        <Button @click.native="senSecherInfo">查询</Button>
        <Button @click.native="senSecherMroeInfo" style="margin-left: 10px">批量分配</Button>
      </div>
      <div id="use-content">
        <div class="use-table">
          <Table :columns="columns1" size="small" :data="data1" @on-row-click="secherUser" @on-selection-change="selectChange">
            <template slot-scope="{row,index}" slot="handel">
              <span class="use-bts"  ><Icon type="ios-document" title="分配角色" @click="userEdit(row)"/></span>
              <!--<span class="use-bts"><Icon type="md-trash" title="删除" @click="deleteInfo(row)"/></span>-->
            </template>
          </Table>
        </div>
        <Row type="flex" justify="end" align="middle" style="margin-top: 10px">
          <Page :total="total" show-total  size="small" :page-size="pageSize"
                :current="current"  @on-change="changePageare"></Page>
        </Row>
      </div>
      <div id="use-limt">
        <div class="limt-table">
          <Table :columns="columns2" size="small" ref="selection" :data="data2">
            <template slot-scope="{row,index}" slot="handels">
              <span class="use-bts"><Icon type="ios-share-alt" title="撤回" @click="backEdit(row)"/></span>
            </template>
          </Table>
        </div>
      </div>
      <Modal v-model="isUserModel" title="分配角色" width="500">
        <Select v-model="users" style="z-index: 99" @on-change="getPartId">
          <Option v-for="(item,index) in topparts" :key="index" :value="item.roleId">{{item.roleName}}</Option>
        </Select>
        <div slot="close" @click="closeModel"><Icon type="ios-close"></Icon></div>
        <div slot="footer" style="margin-right: 25px;">
          <Button type="text" @click="closeModel">取消</Button>
          <Button type="primary" @click="partSubmit">确定</Button>
        </div>
      </Modal>
      <Modal v-model="isMoreModel" title="批量分配角色" width="500">
        <div  class="moreTable">
          <Table :columns="columns5" size="small" :data="data5"  @on-selection-change="moreSelectChange">
          </Table>
        </div>
        <Row type="flex" justify="end" align="middle" style="margin-top: 10px">
          <Page :total="moreTotal" show-total  size="small" :page-size="morepageSize"
                :current="moreCurrent"  @on-change="moreChangePageare"></Page>
        </Row>
        <div slot="close" @click="moreCloseModel"><Icon type="ios-close"></Icon></div>
        <div slot="footer" style="margin-right: 25px;">
          <Button type="text" @click="moreCloseModel">取消</Button>
          <Button type="primary" @click="morePartSubmit">确定</Button>
        </div>
      </Modal>
    </div>
</template>
<script>
  import {URL} from '../../../../api/urlsConfig'
  export default {
        name: "user",
      data(){
        return {
          account:'',
          isMoreModel:false,
          usernames:'',
          moreUser:'',
          topparts:[],
          moreParts:[],
          userId:'',
          parttop:'',
          pageSize:10,
          current:1,
          total:40,
          data1:[],
          data2:[],
          sendId:[],
          checkId:[],
          users:'',
          isUserModel:false,
          sendUserID:'',
          partID:'',
          moreID:'',
          moreTotal:20,
          morepageSize:8,
          moreCurrent:1,
          data5:[],
          partsCheck:[],
          columns5:[
            {
              type:'selection',
              align:'center',
              width:30
            },
            {
              title: '序号',
              type: 'index1',
              width: 100,
              align: 'center',
              render:(h,params) => {
                return h('div',[
                  h('span',(params.index+1)+this.morepageSize*(this.moreCurrent-1))
                ])
              }

            },
            {
              title: '角色名称',
              key: 'roleName',
              align: 'center',

            },
          ],
          columns1: [
            {
              type:'selection',
              align:'center',
              width:30
            },
            {
              title: '序号',
              type: 'index1',
              width: 60,
              align: 'center',
              render:(h,params) => {
                return h('div',[
                  h('span',(params.index+1)+this.pageSize*(this.current-1))
                ])
              }

            },
            {
              title: '账号',
              key: 'username',
              align: 'center',

            },
            {
              title: '姓名',
              key: 'fullname',
              align: 'center',

            },
            {
              title: '部门',
              key: 'departNames',
              align: 'center',

            },
            {
              title: '创建时间',
              key: 'createTime',
              align: 'center',

            },
            {
              title: '操作',
              key: 'handle',
              align: 'center',
              'slot':'handel'
            }
          ],
          columns2:[
            {
              title: '序号',
              type: 'index',
              width: 60,
              align: 'center',
            },
            {
              title: '角色名称',
              key: 'roleName',
              align: 'center',

            },

            {
              title: '创建时间',
              key: 'createTime',
              align: 'center',

            },
            {
              title: '操作',
              key: 'handle',
              align: 'center',
              'slot':'handels'
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
            currPage:1,
            pageSize:this.pageSize
          }
          this.getuserData(parms)
      },
      beforeDestroy(){

      },
      methods:{
        //批量分配角色id过滤
        moreSelectChange(selections){
          let _this=this;
          let res=[];
          if(selections.length>0){
            for(let i=0;i<selections.length;i++){
              res.push(selections[i].roleId)
            }
          }
          _this.partsCheck=res;
        },
        //表格选中id过滤
        selectChange(selections){
          let _this=this;
          let res=[];
           if(selections.length>0){
            for(let i=0;i<selections.length;i++){
              res.push(selections[i].id)
            }
          }
          _this.checkId=res;
        },

         //表格删除
        deleteInfo(row){

        },

       //弹窗左上角关闭
        closeModel(){
         this.isUserModel=false,
         this.users='';
        },
       //批量分配角色确认
        morePartSubmit(){
          if(this.partsCheck.length==0){
            this.$Message.warning('角色选择不能为空！');
          }
          if(this.checkId.length!=0&&this.partsCheck.length!=0){
            let parms={
              userId:this.checkId.join(","),
              roleIds:this.partsCheck.join(",")
            };
            this.moreSendPartsInfo(parms)
          }
        },
        //批量分配取消，关闭
        moreCloseModel(){
          this.isMoreModel=false
        },
        //批量分配调用
        moreSendPartsInfo(parms){
          this.$http.request({
            method:'get',
            params:parms,
            url:URL.insertUserRoles,
            success:(data) => {
              if(data.code==200){
                let res =data.data;
                this.data2 = res.data;
                this.isMoreModel=false

              }
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });
        },
       //弹窗确定提交事件
        partSubmit(){
          let parms={};
          if(this.users!=''){
               parms={
                userId:this.sendId,
                roleIds:this.users
              }
            }else {
            this.$Message.info('角色选择不能为空')
          }
            this.okParts(parms)
          },
       //单行点击获取用户角色信息
        secherUser(value,index){
         let id=value.id
          this.sendUserID=value.id;
          let parms={
            userId:id
          }
          this.getPartInfo(parms)
        },

        //弹窗点击确定后获取角色分配数据
         okParts(parms){
           this.$http.request({
             method:'get',
             params:parms,
             url:URL.insertUserRoles,
             success:(data) => {
               if(data.code==200){
                 let res =data.data;
                 this.data2 = res;
                 this.isUserModel=false,
                   this.users='';
               }
             },
             error : (data) => {
               this.$Message.warning('请求数据失败！');
             }
           });
         },

        //获取底部角色表单数据
        getPartInfo(parms){
          this.$http.request({
            method:'get',
            params:parms,
            url:URL.queryUserRoles,
            success:(data) => {
              if(data.code==200){
                let res =data.data;
                this.data2 = res;
              }
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });
        },
       //获取批量分配角色id
        getMoreId(value){
          this.moreID=value;
        },
        //获取非配角色id
        getPartId(value){
         this.partID=value;
        },
        //撤销
        backEdit(row){
          this.$http.request({
            method:'get',
            params:{
              roleIds:row.roleId,
              userId:this.sendUserID
            },
            url:URL. deleteUserRoles,
            success:(data) => {
              if(data.code==200){
                let res =data.data;
                this.data2 = res;
              }
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });
        },
      //批量查询
        senSecherMroeInfo(){
          if(this.checkId.length==0){
            this.$Message.warning('请至少选择一个用户进行分配！');
            return;
          }
          this.isMoreModel=true;
          let parms={
            roleName:'',
            currPage:this.moreCurrent,
            pageSize:this.morepageSize
          }
          this.getMorePartsInfo(parms)
        },
        //批量分配时获取所有系统角色
        getMorePartsInfo(parms){
          this.$http.request({
            method:'get',
            params:parms,
            url:URL.querySysRoles,
            success:(data) => {
              if(data.code==200){
                let res =data.data;
                this.data5 = res.data;
                this.moreTotal=res.total;
              }
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });
        },
       //点击查询选按钮查询用户表单数据
        senSecherInfo(){
          this.current = 1;
         let parms={
           userName:this.account,
           fullName:this.usernames,
           currPage:1,
           pageSize:this.pageSize
         }
         this.getuserData(parms);
        },
        //批量分配角色分页
        moreChangePageare(current){
          this.moreCurrent=current;
          let parms={
            roleName:'',
            currPage:this.moreCurrent,
            pageSize:this.morepageSize
          }
          this.getMorePartsInfo(parms)
        },
       //分页处理
        changePageare(current){
         this.current=current;
           let parms={
             userName:this.account,
             fullName:this.usernames,
             currPage:this.current,
             pageSize:this.pageSize
           }
         this.getuserData(parms)

        },
      //获取分配角色下拉列表
        getPartsTop(parms){
          this.$http.request({
            method:'get',
            params:parms,
            url:URL.queryUnusedRoles,
            success:(data) => {
              if(data.code==200){
                let res =data.data;
                this.topparts = res;
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
            url:URL.querySysUsers,
            success:(data) => {
              if(data.statusCode==200){
                let res =data.data;
                this.data1 = res.content;
                this.total=res.totalElements;
                // this.pageSize=res.size
              }
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });
        },
        //用户编辑
        userEdit(row){
          this.isUserModel=true;
          this.sendId=row.id;
          let parms={
            userId:this.sendId
          }
          this.getPartsTop(parms);
        },
      }
      }
</script>

<style scoped lang="less">
#user{
  width: 100%;
  height: 100%;
  >#use-title{
    width: 100%;
    height: 80px;
    display: flex;
    align-items: center;
    padding:0px 30px;
    background: #e4e7ea;
    /*justify-content: space-between;*/
    .use-pick{
      width: 20%;
      height: 100%;
      align-items: center;
      display: flex;
      margin-right: 30px;
     >.use-main{
       min-width:10%;
       display: inline-block;
       vertical-align: middle;

     }
    }
  }
}
#use-content{
  width: 100%;
  height:calc(100% - 400px);
  /*height: 100%;*/
  /*background: #00F7DE;*/
}
.use-table{
  width: 100%;
  height:calc(100% - 100px);
  overflow: auto;
}
.use-bts i{
  color: #6e90b3;
  font-size: 20px;
}
</style>
<style>
  #use-title .ivu-btn{
    height: 30px;
    padding:0px 20px;
    background: #6b8caf;
    color: #f5f7f9;
  }

</style>
