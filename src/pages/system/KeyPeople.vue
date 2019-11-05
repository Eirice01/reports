<template>
    <div id="key-people-box">
      <div class="key-people-title">
        重点人
      </div>
      <Row :gutter="16">
        <Col span="10">
          <Form ref="keyValidates" :model="keyValidate" :rules="keyRule" :label-width="80">
            <FormItem label="重点人：" prop="name">
              <Input v-model="keyValidate.name" placeholder="请输入重点人名字" style="width: 300px;"></Input>
            </FormItem>
            <div class="clearFix" style="padding:5px 10px">
              <span class="key-name-title">输入重点人</span>
              <div class="btns">
                <Button type="primary" icon="ios-cloud-upload-outline" @click="exportTemplate">导出模板</Button>
                <Upload
                  type="select"
                  :action="upload"
                  :before-upload="chickFile"
                  id="upload"
                  :show-upload-list="false"
                  :on-success="handleSuccess">
                  <div>
                    <Button type="primary" icon="ios-cloud-upload-outline">导入</Button>
                  </div>
                </Upload>
                <Button @click="resetData">清空</Button>
              </div>
            </div>
            <FormItem label="" class="item-text">
              <Row>
                <Col span="24">
                <FormItem >
                  <Input v-model="keyValidate.keyPerson" @on-blur="testPast" type="textarea" :autosize="{minRows:12,maxRows:12}" placeholder="[重点人] 格式: 电话号码,多个号码请使用英文逗号分隔" ></Input>
                  <span style="color: #ef0000;font-size: 10px" v-if="isErro">{{erroInfo}}</span>
                </FormItem>
                </Col>
              </Row>
            </FormItem>
          </Form>
          <div class="btn-box" style="margin-top: 8px">
            <div class="btn-list">
              <Button type="primary" @click.native="keyOk">提交</Button>
            </div>
          </div>
        </Col>
        <Col span="14">
          <div class="btn-box-right">
            <div class="btn-list">
              <Button type="primary" @click="exportData">导出</Button>
              <Button type="primary" @click="controlDataMuti">批量布控</Button>
              <Button type="primary" @click="delRow">删除</Button>
            </div>
          </div>
          <Table  stripe :columns="columns1" :data="data1" size="small" @on-selection-change="selectPerson">
           <!-- <template slot-scope="{row,index}" slot="action">
              <span class="scenic-bts" @click="editData(row)">
                <Tooltip content="修改">
                   <Icon type="ios-document"/>
                </Tooltip>
              </span>
              <span class="scenic-bts" @click="exportData(row.id)">
                <Tooltip content="导出">
                   <Icon type="ios-exit"/>
                </Tooltip>
              </span>
              <span class="scenic-bts" @click="delRow(row.id)">
                <Tooltip content="删除">
                   <Icon type="ios-trash"/>
                </Tooltip>
              </span>
            </template>-->
            <template slot-scope="{row,index}" slot="control">
              <span>
                  <i-Switch v-model="row.flag==1 ? false:true" size="small" @on-change="controlData(row)"></i-Switch>
              </span>
            </template>
          </Table>
          <div class="page-box">
            <Page :current="this.pageParams.current" :pageSize="this.pageParams.pageSize" :total="this.pageParams.total" @on-change="changePage"></Page>
          </div>
        </Col>
      </Row>
    </div>
</template>

<script>
  import {URL} from '../../../api/urlsConfig'
    export default {
      name: "key-people",
      data(){
        const taskdatePass=(rule,value,callback)=>{
            if(value.length==0){
              callback(new Error("重点人姓名不能为空"))
            }else if(value.length>20){
              callback(new Error("重点人姓名长度不能超过20个字"))
            }else if(value.indexOf(" ")>-1){
              callback(new Error("重点人姓名不能含有空格"))
            }
            else {
              callback()
            }
        }
        return{
          keyValidate:{
            name:"",
            keyPerson:"",
            id:"",
            creatUser:"",
            creatTime:"",
          },
          keyRule:{
            name: [
              {validator:taskdatePass, trigger: 'blur'}
            ],
          },
          upload: URL.upLoad,
          pageParams : {
            total : 35,
            pageSize : 10,
            current : 1
          },
          columns1:[
            {
              type: 'selection',
              width: 50,
              align: 'center'
            },
            {
              title: '序号',
              type: 'index1',
              width: 70,
              align: 'center',
              render:(h,params) => {
                return h('div',[
                  h('span',(params.index+1)+this.pageParams.pageSize*(this.pageParams.current-1))
                ])
              }
            },
            {
              title: '重点人名称',
              key: 'name',
              width: 110,
              render:(h,params) => {
                return h('p',[
                  h('Tooltip',{
                    props:{
                      placement:'top',
                      transfer:true
                    },
                    style:{
                      display: 'inline-block',
                      width:'100px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      //marginTop:'5px'
                    }
                  },[
                    params.row.name,
                    h('p',{
                        slot:'content',
                        style:{
                          whiteSpace:'normal',
                          wordWrap:'bread-word',
                          wordBreak:'break-all',
                        }
                      },
                      params.row.name,)
                  ])
                ])
              },
              align: 'center',
            },
            // {
            //   title: '号码',
            //   key: 'hm',
            //   width: 169,
            //   render:(h,params) => {
            //     return h('p',[
            //       h('Tooltip',{
            //         props:{
            //           placement:'top',
            //           transfer:true
            //         },
            //         style:{
            //           display: 'inline-block',
            //           width:'190px',
            //           whiteSpace: 'nowrap',
            //           overflow: 'hidden',
            //           textOverflow: 'ellipsis',
            //           //marginTop:'5px'
            //         }
            //       },[
            //         params.row.hm,
            //         h('p',{
            //             slot:'content',
            //             style:{
            //               whiteSpace:'normal',
            //               wordWrap:'bread-word',
            //               wordBreak:'break-all',
            //               maxHeight:'50px',
            //               overflowY:'auto'
            //             }
            //           },
            //           params.row.hm,)
            //       ])
            //     ])
            //   },
            //   align: 'center'
            // },
            {
              title: '创建人',
              key: 'creatUser',
              align: 'center'
            },
            {
              title: '创建时间',
              key: 'creatTimes',
              align: 'center',
              width:'160'
            },
            /*{
              title: '修改人',
              key: 'updateUser',
              align: 'center'
            },
            {
              title: '修改时间',
              key: 'updateTime',
              align: 'center',
            },*/
            {
              title: '是否布控',
              key: 'flag',
              align: 'center',
              slot:"control"
            },
            {
              title: '操作',
              slot: 'action',
              align: 'center',
              render: (h, params) => {
                return h('div', [
                  h('Button', {
                    props: {
                      type: 'primary',
                      size: 'small',
                      disabled:params.row.flag=='0'?true:false
                    },
                    style: {
                      marginRight: '5px'
                    },
                    on: {
                      click: (e) => {
                        e.stopPropagation();
                        this.editData(params.row)
                      }
                    }
                  }, '编辑'),
                  h('Button', {
                    props: {
                      type: 'primary',
                      size: 'small',
                    },
                    style: {
                      marginRight: '5px'
                    },
                    on: {
                      click: (e) => {
                        e.stopPropagation();
                        this.exportData(params.row.id)
                      }
                    }
                  }, '导出'),
                  h('Button', {
                    props: {
                      type: 'primary',
                      size: 'small',
                      disabled:params.row.flag=='0'?true:false
                    },
                    style: {
                      marginRight: '5px'
                    },
                    on: {
                      click: (e) => {
                        e.stopPropagation();
                        this.delRow(params.row.id)
                      }
                    }
                  }, '删除')
                ]);
              }
            }
          ],
          data1:[],
          selectItem:"",
          isEdit:false,
          erroInfo:'',
          isErro:false,
        }
      },
      methods:{


        chickFile(file){
          let flag = file.name.endsWith(".xlsx")||file.name.endsWith(".xls");
          if(flag){
            return true;
          }else{
            this.$Message.warning('导入excel文件！')
            return false;
          }
        },

        //导入模板下载
        exportTemplate(){
          window.location.href = URL.templatedownload + "?fileName=telephone_template.xlsx";
        },
        //文本框重点店号码校验
        testPast(){
         let tep=[];
         let Reg=/^1[3|4|5|6|7|8|9][0-9]{9}$/
         tep=this.keyValidate.keyPerson.split(',')
         let tep1=tep.sort()
         if(this.keyValidate.keyPerson.length==0){
           this.isErro=true;
           this.erroInfo="重点人号码不能为空"
         }else{
           for(let i=0;i<tep.length;i++){
             if(tep1[i]==tep1[i+1]){
               this.isErro=true;
               this.erroInfo="手机号码不能含重复号码"
               return;
             }else if(Reg.test(tep[i])==false){
               this.isErro=true;
               this.erroInfo="请输入正确的手机号码"
               return;
             }
             else {
               this.isErro=false;
               this.erroInfo=""
             }
           }

         }

        },
        //添加重点人
        keyOk(){
          let _this=this;
          _this.$refs["keyValidates"].validate((valid)=>{
            if(valid!==false&&_this.isErro==false){
              let params={
                name:_this.keyValidate.name,
                numberVoList:_this.keyValidate.keyPerson.split(','),
                id:_this.keyValidate.id,
                flag:1,
                // creatUser:_this.keyValidate.creatUser,
                // creatTime:_this.keyValidate.creatTime,
              }
              this.$http.request({
                method:'post',
                data:params,
                url:this.isEdit?URL.updateEmphasisPeople:URL.insertEmphasisPeople,
                success:(data) => {
                  if(data.code==200){
                    if(_this.keyValidate.id){
                      this.$Message.success("修改成功！");
                    }else {
                      this.$Message.success("添加成功！");
                    }
                    this.isEdit = false;
                    //调接口
                    _this.queryKeyPeopleData()
                    _this.$refs["keyValidates"].resetFields();
                    _this.keyValidate.keyPerson='';
                  }else {
                    if(_this.keyValidate.id){
                      this.isEdit = true;
                    }else {
                      this.isEdit = false;
                    }
                  }
                },
                error : (data) => {
                  if(_this.keyValidate.id){
                    this.isEdit = true;
                  }else {
                    this.isEdit = false;
                  }
                  this.$Message.warning('请求数据失败！');
                }
              });

            }
          })
        },
        //上传文件成功的回调函数
        handleSuccess(res, file) {
          var msg = res.msg;
          if (msg == 'MaxSize') {
            this.$Message.warning('导入数据条数超过最大值！')
            return;
          }
          this.keyValidate.keyPerson = res;
        },
        //清空
        resetData(){
          this.$refs["keyValidates"].resetFields();
          this.keyValidate.keyPerson='';
          this.isErro=false;
        },
        //获取重点人列表数据
        queryKeyPeopleData(){
          let params={
            currPage:this.pageParams.current,
            pageSize:this.pageParams.pageSize,
          }
          this.$http.request({
            method:'get',
            params:params,
            url:URL.queryEmphasisPeopleList,
            success:(data) => {
              if(data.code==200){
                let res =data.data;
                this.data1 = res.list;
                //console.log(this.data1)
                this.pageParams.current = res.currPage;
                this.pageParams.pageSize = res.pageSize;
                this.pageParams.total = res.totalCount;
              }
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });
        },
        //分页
        changePage(index){
          this.pageParams.current = index;
          this.queryKeyPeopleData()
        },
        //修改数据
        editData(row){
          this.keyValidate.name =row.name;
          this.keyValidate.keyPerson =row.hm;
          this.keyValidate.id =row.id;
          this.isEdit = true;
        },
        //导出数据
        exportData(id){
          if(typeof(id)!='object'){
            this.selectItem=id;
          }
          if(this.selectItem.length==0){
            this.$Message.warning("请至少选择一条数据");
            return
          }else{
            window.location.href=URL.export+"?ids="+this.selectItem;
          }
        },
        //删除
        delRow(id){
          //当删除页吗为最后一页时手动更新页吗 -1
          let totalPage=Math.ceil((this.pageParams.total-1)/this.pageParams.pageSize)  //总页码数
          this.pageParams.current=this.pageParams.current>totalPage?totalPage:this.pageParams.current;
          this.pageParams.current=this.pageParams.current<1?1:this.pageParams.current;
          let _this=this;
          this.$Modal.confirm({
            title:'确认删除',
            content:'是否确认删除当前选中的重点人',
            onOk: ()=>{
              _this.deleteImportant(id)
            },
            onCancel:()=>{
              this.$Message.info('取消删除成功')
            }
          })
        },
        //删除重点人
        deleteImportant(id){
          if(typeof(id)!='object'){
            this.selectItem=id;
          }
          if(this.selectItem.length==0){
            this.$Message.warning("请至少选择一条数据");
            return
          }else{
            let params={
              ids:this.selectItem,
            }
            this.$http.request({
              method:'get',
              params:params,
              url:URL.deleteEmphasisPeople,
              success:(data) => {
                if(data.code==200){
                  this.$Message.success("删除成功！");
                  this.queryKeyPeopleData();
                  this.selectItem="";
                }
              },
              error : (data) => {
                this.$Message.warning('请求数据失败！');
              }
            });
          }
        },
        //布控
        controlData(row){
          if(row.id!=undefined){
            this.selectItem=row.id;
          }
          if(this.selectItem.length==0){
            this.$Message.warning("请至少选择一条数据");
            return
          }else{
            let params={
              ids:this.selectItem,
              current:this.pageParams.current,
              pageSize:this.pageParams.pageSize,
            }
            if(row==undefined){
              params.flag ="1"
            }else{
              params.flag = row['flag==1 ? false:true'] ? "0":"1"
            }

            this.$http.request({
              method:'get',
              params:params,
              url:URL.updateStatuPeople,
              success:(data) => {
                if(data.code==200){
                  this.$Message.success("修改成功！");
                  this.selectItem="";
                  this.queryKeyPeopleData();
                }
              },
              error : (data) => {
                this.$Message.warning('请求数据失败！');
              }
            });
          }

        },
        //批量布控
        controlDataMuti(){
          if(this.selectItem.length>0){
            let params={
              ids:this.selectItem,
              current:this.pageParams.current,
              pageSize:this.pageParams.pageSize,
              flag:0,
            }
            this.$http.request({
              method:'get',
              params:params,
              url:URL.updateStatuPeople,
              success:(data) => {
                if(data.code==200){
                  this.$Message.success("修改成功！");
                  this.selectItem="";
                  this.queryKeyPeopleData();
                }
              },
              error : (data) => {
                this.$Message.warning('请求数据失败！');
              }
            });
          }else {
            this.$Message.warning('请至少选择一个重点人进行布控！');
          }


        },

        //点击复选框选择数据
        selectPerson(selection,row) {   //点击复选框选择数据
          const me = this;
          var sel = [];
          selection.forEach(function (v) {
            sel.push(v.id)
          });
          me.selectItem = sel.toString();
        }
      },
      created(){
        this.queryKeyPeopleData()
      },
      mounted(){

      }
    }
</script>

<style scoped>
  #key-people-box {
    height: 100%;
    width: 100%;
    padding: 30px;
    box-sizing: border-box;
  }
  .key-people-title{
    color:#86a0bd;
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 30px;
  }
  .btn-box{
    text-align: right;
  }
  .item-text>>>.ivu-form-item-content{
    margin-left: 5px!important;
  }
  .btns{
    float: right;
  }
  .key-name-title{
    display: inline-block;
    line-height: 32px;
    height: 32px;
  }
  #upload{
    display: inline-block;
  }
  .scenic-bts i{
    font-size: 20px;
    cursor: pointer;
    color: #6e90b3;
  }
  .btn-box-right{
    padding: 5px 10px;
    text-align: right;
  }
  #key-people-box .ivu-btn{
    height: 30px;
    padding:0px 20px;
    background: #6b8caf;
    color: #f5f7f9;
  }
</style>
