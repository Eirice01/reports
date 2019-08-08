<template>
    <div id="partmanagement">
      <div id="partContent">
       <div id="parf-left">
         <div class="part-name">
           <span class="cls-name">角色</span>
           <Input v-model="partnames"  placeholder="输入角色名称"/>
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
             <Button type="primary" @click.native="updataParts">确定</Button>
             <Button>取消</Button>
           </li>
         </div>
       </div>
        <div id="parf-right">
          <div class="part-table">
            <Table :columns="columns1" size="small" :data="data1">
              <template slot-scope="{row,index}" slot="handel">
                <span class="use-bts"><Icon type="ios-document" title="编辑" @click="userEdit(row)"/></span>
              </template>
              <template slot-scope="{row,index}" slot="control">
            <span>
                <i-Switch v-model="row.isdefault==0 ? false:true"  :disabled="true" @on-change="changeControl($event,row.isdefault)" size="small"></i-Switch>
            </span>
              </template>
            </Table>
          </div>
          <Row type="flex" justify="end" align="middle" style="margin-top: 10px">
            <Page :total="total" show-total  size="small" :page-size="pageSize"
                  :current="current"  @on-change="changePageare"></Page>
          </Row>
        </div>
        <Modal v-model="ispartModel" title="编辑角色" width="800">
          <div class="handlepart">
            <Form ref="updateRoleForm" :model="updateParam" :rules="ruleValidate">
              <FormItem label="角色名称：" prop="roleName">
                <Input v-model.trim="updateParam.roleName" style="width: 200px;"/>
              </FormItem>
              <!--<div class="lcs-titme">选择资源：</div>-->
              <!--<span class="erroinfo" v-show="isErro" style="color: #D81109">请至少选择一个资源</span>-->

              <FormItem label="选择资源：" prop="resourceIds">
                <Input v-model="updateParam.resourceIds" style="display: none"/>
                <ResourceGroup ref="resourceGroup" :data="resources" @on-change="onResourceGroupChange"></ResourceGroup>
              </FormItem>


               <!--<div  v-for="(item,index0) in part1"  style="margin-bottom: 20px">-->
                 <!--<div style="border-bottom: 1px dashed #e9e9e9;margin-top: 10px" >-->
                 <!--<Checkbox :value=item.checked @on-change="handleCheckAll($event,item.id)">{{item.title}}</Checkbox>-->
                 <!--</div>-->
                  <!--<Checkbox :value=item1.checked v-for="(item1,index9) in item.children" :key="index9" @on-change="handleCheckAll1($event,item1.id,item.id)">{{item1.title}}</Checkbox>-->
               <!--</div>-->
              <!--&lt;!&ndash;旅游&ndash;&gt;-->
              <!--<div  v-for="(item,index1) in part2" >-->
                <!--<div style="border-bottom: 1px dashed #e9e9e9;margin-top: 10px" >-->
                  <!--<Checkbox :value=item.checked @on-change="handleCheckAll2($event,item.id)">{{item.title}}</Checkbox>-->
                <!--</div>-->
                  <!--<Checkbox :value=item1.checked v-for="(item1,index2) in item.children" :key="index2" @on-change="handleCheckAll21($event,item1.id,item.id)">{{item1.title}}</Checkbox>-->
              <!--</div>-->
              <!--&lt;!&ndash;分析对比&ndash;&gt;-->
              <!--<div  v-for="(item,index2) in part3" >-->
                <!--<div style="border-bottom: 1px dashed #e9e9e9;margin-top: 10px" >-->
                  <!--<Checkbox :value=item.checked @on-change="handleCheckAll3($event,item.id)">{{item.title}}</Checkbox>-->
                <!--</div>-->
                  <!--<Checkbox :value=item1.checked v-for="(item1,index3) in item.children" :key="index3" @on-change="handleCheckAll31($event,item1.id,item.id)">{{item1.title}}</Checkbox>-->
              <!--</div>-->
              <!--&lt;!&ndash;报告管理 &ndash;&gt;-->
              <!--<div  v-for="(item4,index4) in part4" >-->
                <!--<div style="border-bottom: 1px dashed #e9e9e9;margin-top: 10px;margin-bottom: 10px" >-->
                  <!--<Checkbox :value=item4.checked @on-change="handleCheckAll4($event,item4.id)">{{item4.title}}</Checkbox>-->
                <!--</div>-->
                  <!--<Checkbox :value=item7.checked v-for="(item7,index7) in item4.children" :key="index7" @on-change="handleCheckAll41($event,item7.id,item4.id)">{{item7.title}}</Checkbox>-->
              <!--</div>-->
              <!--&lt;!&ndash;系统管理&ndash;&gt;-->
              <!--<div  v-for="(item5,index5) in part5" >-->
                <!--<div style="border-bottom: 1px dashed #e9e9e9;margin-top: 10px" >-->
                  <!--<Checkbox :value=item5.checked @on-change="handleCheckAll5($event,item5.id)">{{item5.title}}</Checkbox>-->
                <!--</div>-->
                  <!--<Checkbox :value=item6.checked v-for="(item6,index6) in item5.children" :key="index6" @on-change="handleCheckAll51($event,item6.id,item5.id)">{{item6.title}}</Checkbox>-->
              <!--</div>-->
              <!--</FormItem>-->
            </Form>

          </div>
          <div slot="close" @click="closeModel"><Icon type="ios-close"></Icon></div>
          <div slot="footer" style="margin-right: 25px;">
            <Button type="text" @click="closeModal">取消</Button>
            <Button type="primary" @click="partSubmit">确定</Button>
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
    components: {
      ResourceGroup
    },
      data(){
        return {
          resources: [],


          isErros:false,
          group:[],
          group1:[],
          group2:[],
          group3:[],
          group4:[],
          partnames:'',
          isSwitch:false,
          partSourcs:[],
          prosinSource:[],
          isErro:false,
          sendids:[],
          senRightSource:[],
          sendRightId:'',
          part1:[],
          part2:[],
          part3:[],
          part4:[],
          part5:[],
          part6:[],
          total:40,
          pageSize:15,
          ispartModel:false,
          isoldFlag:'',
          current:1,
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
              title: '默认角色',
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
          // console.log('onResourceGroupChange', this.updateParam.resourceIds)
        },

        //人口模块
        handleCheckAll (date,id) {
          this.senRightSource.push(id);
          // if(date==true){
          //   this.senRightSource.push(id);
          // }else {
          //   this.senRightSource=_.pull(this.senRigh  tSource,id)
          // }
        },
        //人口模块资源
        handleCheckAll1(date,id,parentid){
          this.senRightSource.push(id,parentid)
          // if(date==true){
          //   this.senRightSource.push(id,parentid)
          // }else {
          //   this.senRightSource=_.pull(this.senRightSource,id,parentid)
          // }
          console.log(this.senRightSource)
        },
        //旅游模块
        handleCheckAll2(date,id){
          this.senRightSource.push(id);
          // if(date==true){
          //   this.senRightSource.push(id);
          // }else {
          //   this.senRightSource=_.pull(this.senRightSource,id)
          // }

        },
        //旅游资源
        handleCheckAll21(date,id,parentid){
          this.senRightSource.push(id,parentid)
          // if(date==true){
          //   this.senRightSource.push(id,parentid)
          // }else {
          //   this.senRightSource=_.pull(this.senRightSource,id,parentid)
          // }
        },
        //分析模块
        handleCheckAll3(date,id){
          this.senRightSource.push(id);
          // if(date==true){
          //   this.senRightSource.push(id);
          // }else {
          //   this.senRightSource=_.pull(this.senRightSource,id)
          // }
        },
        //分析资源
        handleCheckAll31(date,id,parentid){
          this.senRightSource.push(id,parentid)
          // if(date==true){
          //   this.senRightSource.push(id,parentid)
          // }else {
          //   this.senRightSource=_.pull(this.senRightSource,id,parentid)
          // }
        },
        //报告管理
        handleCheckAll4(date,id){
          this.senRightSource.push(id);
          // if(date==true){
          //   this.senRightSource.push(id);
          // }else {
          //   this.senRightSource=_.pull(this.senRightSource,id)
          // }

        },
        //报告管理资源
        handleCheckAll41(date,id,parentid){
          this.senRightSource.push(id,parentid)
          // if(date==true){
          //   this.senRightSource.push(id,parentid)
          // }else {
          //   this.senRightSource=_.pull(this.senRightSource,id,parentid)
          // }
        },
        //系统
        handleCheckAll5(date,id){
          this.senRightSource.push(id);
          // if(date==true){
          //
          // }else {
          //   this.senRightSource=_.pull(this.senRightSource,id)
          // }
        },
        //系统资源
        handleCheckAll51(date,id,parentid){
          this.senRightSource.push(id,parentid)
          // if(date==true){
          //
          // }else {
          //   this.senRightSource=_.pull(this.senRightSource,id,parentid)
          // }
        },

        //partSubmit编辑确认提交
        partSubmit(){
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
          //closeModal
        closeModal(){
          this.ispartModel=false;

        },
        //左上角关闭
        closeModel(){
          this.ispartModel=false;


        },
         //编辑指定角色
        userEdit(row){
          let parms={
            roleId:row.roleId
          }
         this.updateParam.roleName= row.roleName
         this.sendRightId=row.roleId
         this.isoldFlag=row.isdefault;
         this.ispartModel=true
          this.getProsinSource(parms);
        },
       //
        changeControl(status,isold){
          if(status!=undefined){
            this.isRightSource=status;
          }else {
            if(isold==0){
              this.isRightSource=false
            }else {
              this.isRightSource=true
            }
          }
        },
     //
        changePageare(){

        },
      //kaiguan
        chosemypart(status){
           console.log(status)
          if(status){
            this.$Message.info('默认角色开启')
          }


          // console.log(status)
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

             this.prosinSource = res;
             if(this.prosinSource.length!=0){
               this.part1.push(this.prosinSource[0]);
               this.part2.push(this.prosinSource[1]);
               this.part3.push(this.prosinSource[2]);
               this.part4.push(this.prosinSource[3]);
               this.part5.push(this.prosinSource[4]);
             }

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
              }
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });
        },

        //新增角色点击确认
        updataParts(){
          if(this.partnames==''){
            this.isErros=true;
          }else {
            let flag='';
            if(this.isSwitch){
              flag=1;
            }else {
              flag=0;
            }
            this.sendids=_.uniq(this.sendids)
            let sendis=this.sendids.join(',')
            let parms={
              roleName:this.partnames,
              resourceIds:sendis,
              isdefault:flag
            }
            this.updataPart(parms)
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
       //初始化所有资源状态
       initSource(){
        this.partSourcs=[];
         this.partnames='';
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
    width: 50%;
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
