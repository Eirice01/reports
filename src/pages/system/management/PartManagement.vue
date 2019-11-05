<template>
    <div id="partmanagement">
      <div id="partContent">
       <div id="parf-left">
         <div class="part-name">
           <span class="cls-name">角色</span>
           <Form ref="formValidate" :model="formValidate" :rules="ruleValidates">
             <FormItem prop="name">
                <Input v-model="formValidate.name"  placeholder="输入角色名称"/>
             </FormItem>
           </Form>
         </div>
         <!--<span class="erroinfo" v-show="isErros">角色名称不能为空</span>-->
         <div class="partSources">
             <li class="cls-part" v-for="(item,index) in partSourcs" :key="index">
               <span class="part-title">{{item.title}}:</span>
                 <a class="part-tag" v-for="(item1,index) in item.children" :key="index" @click="checkTag($event,item1.id,item.id)">{{item1.title}}</a>
             </li>
         </div>
         <div class="cls-source">
            <li class="part-btn">
              <span class="cls-titles">默认角色</span>
              <i-switch size="small" v-model="isSwitch" @on-change="chosemypart"></i-switch>
            </li>
           <li class="part-btns">
             <Button @click.native="resizeData">取消</Button>
             <Button type="primary" @click.native="updataParts('1')">确定</Button>

           </li>
         </div>
       </div>
        <div id="parf-right">
          <div class="part-table">
            <Table :columns="columns1" size="small" :data="data1">
              <template slot-scope="{row,index}" slot="handel">
                <span class="use-bts">
                  <Tooltip content="编辑">
                  <Icon type="ios-document"  @click="userEdit(row)"/>
                  </Tooltip>
                </span>
                <span class="use-bts" @click="checkPart(row)">
              <Tooltip content="查看" placement="top-start">
                 <Icon type="md-eye"/>
              </Tooltip>
            </span>
                <span class="use-bts" @click="deletePart(row)">
                <Tooltip content="删除">
                   <Icon type="ios-trash"/>
                </Tooltip>
              </span>
              </template>
              <template slot-scope="{row,index}" slot="control">
            <span>
                <i-Switch v-model="row.isdefault==0 ? false:true"  @on-change="changeControl($event,row)" size="small"></i-Switch>
            </span>
              </template>
            </Table>
          </div>
          <Row type="flex" justify="end" align="middle" style="margin-top: 10px">
            <Page :total="total" show-total  size="small" :page-size="pageSize"
                  :current="current"  @on-change="changePageare"></Page>
          </Row>
        </div>
        <!--角色编辑-->
        <Modal v-model="ispartModel" :title="isCurrent" width="800">
          <div class="handlepart">
            <Form ref="updateRoleForm" :model="updateParam" :rules="ruleValidate">
              <FormItem label="角色名称：" prop="roleName">
                <Input v-model.trim="updateParam.roleName" style="width: 200px;" :disabled="!isTypeOfCheck"/>
              </FormItem>
              <!--<div class="lcs-titme">选择资源：</div>-->
              <!--<span class="erroinfo" v-show="isErro" style="color: #D81109">请至少选择一个资源</span>-->

              <FormItem label="选择资源：" prop="resourceIds">
                <Input v-model="updateParam.resourceIds" style="display: none"/>
                <ResourceGroup ref="resourceGroup" :data="resources" @on-change="onResourceGroupChange" :isTypeOfCheck="isTypeOfCheck"></ResourceGroup>
              </FormItem>

            </Form>

          </div>
          <div slot="close" @click="closeModel"><Icon type="ios-close"></Icon></div>
          <div slot="footer" style="margin-right: 25px;">
            <!--<Button type="text" @click="closeModal">取消</Button>-->
            <Button type="primary" @click="partSubmit('2')" v-if="isTypeOfCheck">确定</Button>
          </div>
        </Modal>
      </div>
    </div>
</template>
<script>
  import {URL} from '../../../../api/urlsConfig'
  import ResourceGroup from './resourceGroup'
  export default {
        name: "partmanagement",

      data(){
        const  nameRule=(rule,value,callback)=>{
         if(value.includes(" ")){
           callback(new Error("角色名称不能含有空格"))
         }else if(value.length==0){
           callback(new Error("角色名称不能为空"))
         }else if(value.length>20){
           callback(new Error("角色名称不能超过20个字节"))
         } else {
           callback()
         }

        }
        return {
          formValidate:{
            name:''
          },
          ruleValidates:{
            name:[
              {validator:nameRule,trigger:'blur'}
            ]
          },
          resources: [],
          isErros1:false,
          isErros2:false,
          isSwitch:false,
          partSourcs:[],
          prosinSource:[],
          isErro:false,
          sendids:[],
          senRightSource:[],
          sendRightId:'',
          total:40,
          pageSize:15,
          ispartModel:false,
          isCheckPart:false,
          isoldFlag:'',
          current:1,
          isTypeOfCheck:true,
          isCurrent:'角色编辑',
          data1:[],
          isRightSource:'',
          updateParam: {
            roleId: '',
            roleName: '',
            resourceIds: '',
          },
          columns1:[
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
              title: '角色',
              key: 'roleName',
              align: 'center',

            },
            {
              title: '创建时间',
              key: 'createTime',
              align: 'center',

            },
            {
              title: '是否默认',
              key: 'isdefault',
              align: 'center',
              'slot':'control'

            },
            {
              title: '操作',
              key: 'handle',
              align: 'center',
              'slot':'handel'
            }
          ],
          ruleValidate: {
            roleName: [
              {
                required: true,
                whitespace: true,
                transform: value => value ? value.trim() : '',
                max: 30,
                message: '角色名称不能为空且不能超过20个汉字',
                trigger: 'blur'
              }
            ],
          },
        }
      },
       components:{ResourceGroup},

      created(){

      },
      mounted(){
        if(this.$route.query.userId!=undefined){
          this.userId=this.$route.query.userId;
        }

          this.getPartSources();
        let newParms={
          pageSize:this.pageSize,
          currPage:this.current,
          roleName:'',

        }
          this.getPartTablesData(newParms)
      },
      beforeDestroy(){

      },
      methods:{

        onResourceGroupChange(checkedData) {
          this.updateParam.resourceIds = checkedData.join(',');
        },

        //角色查看
        checkPart(row){
          this.isTypeOfCheck=false;
          this.isCurrent="查看角色信息"
          let parms={
            roleId:row.roleId
          }
          console.log(row)
          this.updateParam.roleName= row.roleName
          this.sendRightId=row.roleId
          this.isoldFlag=row.isdefault;
          this.ispartModel=true

          this.$refs.resourceGroup.changeSwitch(row.isdefault)
          this.getProsinSource(parms);
        },
        //partSubmit编辑确认提交
        partSubmit(type){
          let ismyCheck=this.$refs.resourceGroup.backisdefout();
          let flag='';
          if(ismyCheck){
            flag=1
          }else {
            flag=0
          }
          let parms={
            roleId:this.sendRightId,
            roleName:this.updateParam.roleName,
            resourceIds:this.updateParam.resourceIds,
             isdefault:flag
          }
          this.querySysRoleName(type,parms)
        },
          //closeModal

        //编辑角色提交
        editPart(parms){
          this.$http.request({
            method:'get',
            params:parms,
            url:URL.updateSysRole,
            success:(data) => {
              if(data.code==200){
                this.$Message.warning('角色修改成功！');
                let newParms={
                  pageSize:this.pageSize,
                  currPage:this.current,
                  roleName:'',

                }
                this.getPartTablesData(newParms)
              }else {
                this.$Message.warning('角色修改失败！');
              }
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });
          this.ispartModel=false;
        },
        closeModal(){
          this.ispartModel=false;

        },
        //左上角关闭
        closeModel(){
          this.ispartModel=false;
        },
         //编辑指定角色
        userEdit(row){
          this.isTypeOfCheck=true;
          this.isCurrent="角色编辑";
          let parms={
            roleId:row.roleId
          }
          console.log(row)
         this.updateParam.roleName= row.roleName
         this.sendRightId=row.roleId
         this.isoldFlag=row.isdefault;
         this.ispartModel=true
          this.$refs.resourceGroup.changeSwitch(row.isdefault)
          this.getProsinSource(parms);
        },
       //
        changeControl(status,row){
          this.$Modal.confirm({
            title:'确认设置默认角色',
            content:'是否确认将当前选中的角色设为默认角色？',
            onOk: ()=>{
              this.$http.request({
                method:'get',
                params:{
                  roleId:row.roleId,
                  isdefault:row.isdefault==0 ? 1 : 0
                },
                url:URL.updateSysRole,
                success:(data) => {
                  if(data.code==200){
                      let parms={
                        pageSize:this.pageSize,
                        currPage:this.current,
                        roleName:'',
                      }
                      this.getPartTablesData(parms)
                      this.$Message.success('默认角色设置成功!');
                  }else {
                    this.$Message.warning(data.msg)
                  }
                },
                error : (data) => {
                  this.$Message.warning('默认角色设置失败！');
                }
              });
            },
            onCancel:()=>{
              this.$Message.info('取消成功！')
            }
          })

        },
      //角色管理分页
        changePageare(current){
          this.current =current;
          let params={
            pageSize:this.pageSize,
            currPage:this.current,
            roleName:'',
          }
          this.getPartTablesData(params)
        },
      //kaiguan
        chosemypart(status){
           console.log(status)
          if(status){
            this.$Message.info('默认角色开启')
          }


          // console.log(status)
        },
        //角色删除
        deletePart(row){
          //当删除页吗为最后一页时手动更新页吗 -1
          let totalPage=Math.ceil((this.total-1)/this.pageSize)  //总页码数
          this.current=this.current>totalPage?totalPage:this.current;
          this.current=this.current<1?1:this.current;
          // let _this=this;
          this.$Modal.confirm({
            title:'确认删除',
            content:'是否确认删除当前选中的角色信息',
            onOk: ()=>{
              this.$http.request({
                method:'get',
                params:{roleId:row.roleId},
                url:URL.deleteSysRole,
                success:(data) => {
                  if(data.code==200){
                    if(data.data.code==500){
                      this.$Message.warning(data.data.msg)
                    }else {
                      let parms={
                        pageSize:this.pageSize,
                        currPage:this.current,
                        roleName:'',
                      }

                      this.getPartTablesData(parms)
                      this.$Message.success('角色删除成功!');
                    }
                    }
                },
                error : (data) => {
                  this.$Message.warning('请求数据失败！');
                }
              });
            },
            onCancel:()=>{
              this.$Message.info('取消删除成功')
            }
          })
        },

       //资源选中
        checkTag(e,id,parentid){
         if(!e.target.classList.contains('checkTag')){
           e.target.classList.add('checkTag');
           this.sendids.push(id,parentid)
         }else {
           e.target.classList.remove('checkTag');
           this.sendids =_.pull(this.sendids,id,parentid);
         }
          this.sendids=_.uniq(this.sendids )
        },

     //获取所有资源信息数据
        getPartSources(){
       this.$http.request({
         method:'get',
         params:{},
         url:URL.queryRolePossess,
         success:(data) => {
           if(data.code==200){
             let res =data.data;
             this.partSourcs = res;
           }
         },
         error : (data) => {
           this.$Message.warning('请求数据失败！');
         }
       });
     },

     //表格点击编辑获取指定资源
     getProsinSource(parms){
       this.$http.request({
         method:'get',
         params:parms,
         url:URL.queryRoleResource,
         success:(data) => {
           if(data.code==200){
             let res =data.data;
             this.resources = res;
           }
         },
         error : (data) => {
           this.$Message.warning('请求数据失败！');
         }
       });
     },

        //获取右侧表格数据
        getPartTablesData(parms){
          this.$http.request({
            method:'get',
            params:parms,
            url:URL.querySysRoles,
            success:(data) => {
              if(data.code==200){
                let res =data.data;
                this.data1 = res.data;
                this.total=res.total
              }
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });
        },
         //校验检查
         checkMyChoose(){
          let _this=this;
          this.$refs.formValidate.validate((valid)=>{
            if(!valid){
              _this.isErros1=false;
              return
            }else {
              _this.isErros1=true;
            }
          });
          if(_this.sendids.length==0){
            this.$Message.warning('资源不能为空！');
            _this.isErros2=false;
            return
          }else {
            _this.isErros2=true;
          }_
        },

        //角色名称重复校验

        querySysRoleName(type,parms){
          let _this=this;
          this.$http.request({
              method:'get',
              params:{
                roleName:this.formValidate.name
              },
              url:URL.querySysRoleName,
              success:(data) => {
                if(data.code==200){
                  if(data.data===true){
                    this.$Message.warning('角色名称重复请重新填写！');
                    return
                  }else if(data.data===false) {
                    switch (type) {
                      case '1': this.updataPart(parms);
                      break;
                      case '2': this.editPart(parms);
                      break;
                    }
                  }
                }
              },
           })
        },
        //新增角色点击确认
        updataParts(type){
          this.checkMyChoose();
            if(this.isErros1&&this.isErros2){
              let flag='';
              if(this.isSwitch){
                flag=1;
              }else {
                flag=0;
              }
              this.sendids=_.uniq(this.sendids)
              let sendis=this.sendids.join(',')
              let parms={
                roleName:this.formValidate.name,
                resourceIds:sendis,
                isdefault:flag
              }
              this.querySysRoleName(type,parms);
            }else {
              this.$Message.warning('请检查角色名称或资源选择确保正确！');
            }

        },
        //新增角色接口
        updataPart(parms){
          this.$http.request({
            method:'get',
            params:parms,
            url:URL.insertSysRole,
            success:(data) => {
              if(data.code==200){
                let res =data.data;
                this.data1 = res.data;
                this.total=res.total
                this.initSource()
                let newParms={
                  pageSize:this.pageSize,
                  currPage:this.current,
                  roleName:'',
                }
                this.getPartTablesData(newParms)
              }
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });

       },
        //取消新增角色（重置）
        resizeData(){
          this.initSource()
        },
       //初始化所有资源状态
       initSource(){
        this.partSourcs=[];
         this.formValidate.name='';
         this.sendids=[];
        this.isSwitch=false;
        this.getPartSources()
       }
     }

    }
</script>

<style scoped lang="less">
#partmanagement{
  width: 100%;
  height: 100%;
}
#partContent{
  width: 100%;
  height: 100%;
  padding: 30px;

  display: flex;
  #parf-left{
    width:40%;
    height: 100%;

    margin-right:40px;
  }
  #parf-right{
    width:calc(60% - 40px);
    height: 100%;
    >.part-table{
      width: 100%;
      cursor: pointer;
      height:calc(100% - 150px);
      background: #9a6e3a;
    }
  }
}
.part-name{
  width:50%;
  height: 50px;
 display: flex;
  align-items: center;
  >.cls-name{
    display: inline-block;
    vertical-align: middle;
    color: #707171;
    width: 50px;
    text-align: center;
  }
}
.cls-part{
  width: 100%;
  padding:15px 0px;
}
.partSources{
  width:100%;
  margin-top: 15px;
  height:calc(100% - 250px);
  border:1px solid #979797;

}
.use-bts i{
  color: #6e90b3;
  font-size: 20px;
}
.part-title{
  color: #57585a;
  font-weight: 700;
  font-size: 14px;
  padding:10px;
  margin-right: 10px;
}
.part-sources{
  padding:10px;
  border:1px solid #666666;
}
.part-tag{
  margin:0px 5px;
  display: inline-block;
  padding:4px 15px;
  font-size: 14px;
  color: #9d9fa2;
  text-align: center;
  /*line-height: 28px;*/
  border:1px solid #979797;
  border-radius:5px;

}
.checkTag{
  margin:0px 5px;
  display: inline-block;
  padding:4px 15px;
  font-size: 14px;
  color: #f8f6f6;
  text-align: center;
  background:#e98a3a;
  /*line-height: 28px;*/
  border:1px solid #e98a3a;
  border-radius:5px;
}
.cls-source{
  width: 100%;
  margin-top:15px;
  height:15%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.erroinfo{
  color: #e44313;
  font-size: 8px;
}
.part-btn{
  width: 50%;
}
.part-btns{
  text-align: right;
  width: 50%;
}
.cls-titles{
  display: inline-block;
  color: #78797a;
  font-size: 14px;
  padding:10px;
  margin-right: 10px;
}
.handlepart{
  width: 100%;
}
</style>
<style lang="less">
  .part-name .ivu-input{
    width: 100%;
  }
  .part-name  .ivu-form-item-content {
    top: 10px;
  }
  .part-table .ivu-table-body{
    height: calc(100% - 30px);
    overflow-y: auto;
    overflow-x: hidden;
  }

  .part-table .ivu-table-wrapper{
    width: calc(100% - 0px);
    height: 100%;
  }
  .part-table .ivu-table{
    width: 100%;
    height: 100%;
  }
  .part-table .ivu-table-body{
    height: calc(100% - 30px);
    overflow-y: auto;
    overflow-x: hidden;
  }
</style>
