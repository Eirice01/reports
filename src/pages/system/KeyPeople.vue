<template>
    <div id="key-people-box">
      <div class="key-people-title">
        重点人
      </div>
      <Row :gutter="16">
        <Col span="10">
          <Form ref="keyValidate" :model="keyValidate" :rules="keyRule" :label-width="80">
            <FormItem label="重点人：" prop="name">
              <Input v-model="keyValidate.name" placeholder="请输入重点人名字" style="width: 300px;"></Input>
            </FormItem>
            <div class="clearFix" style="padding:5px 10px">
              <span class="key-name-title">输入重点人</span>
              <div class="btns">
                <Upload
                  type="select"
                  :action="upload"
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
                <FormItem prop="keyPerson">
                  <Input v-model="keyValidate.keyPerson" type="textarea" :autosize="{minRows:12,maxRows:12}" placeholder="[重点人] 格式: 电话号码,多个号码请使用英文逗号分隔" ></Input>
                </FormItem>
                </Col>
              </Row>
            </FormItem>
          </Form>
          <div class="btn-box">
            <div class="btn-list">
              <Button type="primary" @click="keyOk">提交</Button>
            </div>
          </div>
        </Col>
        <Col span="14">
          <div class="btn-box-right">
            <div class="btn-list">
              <Button type="primary" @click="exportData">导出</Button>
              <Button type="primary" @click="controlDataMuti">布控</Button>
              <Button type="primary" @click="delRow">删除</Button>
            </div>
          </div>
          <Table  stripe :columns="columns1" :data="data1" size="small" @on-selection-change="selectPerson">
            <template slot-scope="{row,index}" slot="action">
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
            </template>
            <template slot-scope="{row,index}" slot="control">
              <span>
                  <i-Switch v-model="row.flag==0 ? false:true" size="small" @on-change="controlData(row)"></i-Switch>
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
          var pattern =/^(\\d{7,11}\\s*){1}(\\,(\\d{7,11}\\s*))*$/;
          let numList = value.split("\,")
            for(let i=0;i<numList.length;i++){
              if(!pattern.test(numList[i])){
                // callback("请输入有效的重点人,多个号码间使用英文逗号分隔！")

              }else{
                callback()
              }
            }
        }
        return{
          keyValidate:{
            name:"",
            keyPerson:"",
            id:"",
          },
          keyRule:{
            name: [
              { required: true, message: '重点人名字不能为空', trigger: 'blur' }
            ],
            keyPerson:[
             /* {required:true,trigger:'blur',validator:taskdatePass},*/
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
              width: 60,
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
              align: 'center',
            },
            {
              title: '号码',
              key: 'hm',
              width: 180,
              render:(h,params) => {
                return h('p',[
                  h('Tooltip',{
                    props:{
                      placement:'top',
                      transfer:true
                    },
                    style:{
                      display: 'inline-block',
                      width:'190px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      //marginTop:'5px'
                    }
                  },[
                    params.row.hm,
                    h('p',{
                        slot:'content',
                        style:{
                          whiteSpace:'normal',
                          wordWrap:'bread-word',
                          wordBreak:'break-all'
                        }
                      },
                      params.row.hm,)
                  ])
                ])
              },
              align: 'center'
            },
            {
              title: '创建人',
              key: 'creatUser',

              align: 'center'
            },
            {
              title: '创建时间',
              key: 'creatTimes',
              align: 'center',

            },
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
            }
          ],
          data1:[],
          selectItem:"",
          isEdit:false
        }
      },
      methods:{
        //添加重点人
        keyOk(){
          this.$refs["keyValidate"].validate((valid)=>{
            if(valid){
              let params={
                name:this.keyValidate.name,
                numberVoList:this.keyValidate.keyPerson.split(','),
                id:this.keyValidate.id,
              }
              // console.log(params)
              this.$http.request({
                method:'post',
                data:params,
                url:this.isEdit?URL.updateEmphasisPeople:URL.insertEmphasisPeople,
                success:(data) => {
                  if(data.code==200){
                    this.$Message.success("添加成功！")
                    //调接口
                    this.queryKeyPeopleData()
                    this.$refs["keyValidate"].resetFields();
                  }
                },
                error : (data) => {
                  this.$Message.warning('请求数据失败！');
                }
              });

            }
          })
          this.isEdit = false;
        },
        //上传文件成功的回调函数
        handleSuccess(res, file) {
          var msg = res.msg;
          if (msg == 'MaxSize') {
            this.$Message.warning('导入数据条数超过最大值！')
            return;
          }
          /*let data = res;
          let mLac = '';
          res.forEach((v, k) => {
            let x;
            v.forEach((n, m) => {
              if (m < 3) {
                if (n !== '') {
                  x = n + '\n';
                } else if (n == '') {
                  x = '';
                }
              }
              mLac += x;
            })
          })
          this.keyValidate.keyPerson = mLac;*/
          this.keyValidate.keyPerson = res;
        },
        //清空
        resetData(){
          this.$refs["keyValidate"].resetFields();
        },
        //获取重点人列表数据
        queryKeyPeopleData(){
          let params={
            current:this.pageParams.current,
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
          this.queryScenicData()
        },
        //修改数据
        editData(row){
          this.keyValidate.name =row.name;
          this.keyValidate.keyPerson =row.hm;
          this.keyValidate.id =row.id;
          this.isEdit = true;
         /* let params={
            name:row.name,
            numberVoList:row.hm,
            id:row.id
          }
          this.$http.request({
            method:'get',
            params:params,
            url:URL.updateEmphasisPeople,
            success:(data) => {
              if(data.code==200){
                this.$Message.success("修改成功！");
                this.queryKeyPeopleData();
              }
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });*/
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
              params.flag = row['flag==0 ? false:true'] ? "1":"0"
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
          let params={
            ids:this.selectItem,
            current:this.pageParams.current,
            pageSize:this.pageParams.pageSize,
            flag:"1",
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
</style>
