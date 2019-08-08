<template>
    <div id="scenicArea">
      <div class="scenic-title">
        景区列表
      </div>
      <ul class="scenic-header">
        <li class="scenic-list">
          <div class="scenic-chose">
            <span class="reptitle">景区名称:</span>
            <Select v-model="scenicVal">
              <Option value="">全部</Option>
              <Option  v-for="(item,index) in scenicList" :key="index" :value="item.areaId">{{item.areaName}}</Option>
            </Select>
          </div>
        </li>
        <li class="scenic-list">
          <div class="scenic-chose">
            <span class="reptitle">查询时间:</span>
            <DatePicker type="daterange"  :clearable="false" v-model="times"
                        placeholder="请选择要查看的时间" style="width: 100%">
            </DatePicker>
          </div>
        </li>
        <li  class="scenic-list">
          <div class="scenic-chose scenic-chose-left" >
            <Button type="primary" @click="queryScenicData">查询</Button>
          </div>
        </li>

      </ul>
      <div class="add-box clearFix">
        <div class="add-btn-box" >
          <Button type="primary" @click="addScenic">新增景区</Button>
        </div>
      </div>
      <div class="scenic-table">
        <Table  stripe :columns="columns1" :data="data1" size="small" >
          <template slot-scope="{row,index}" slot="action">
            <span class="scenic-bts" @click="editData(row)">
              <Tooltip content="修改" placement="top-start">
                 <Icon type="ios-document"/>
              </Tooltip>
            </span>
            <span class="scenic-bts" @click="checkData(row.areaId)">
              <Tooltip content="查看" placement="top-start">
                 <Icon type="md-eye"/>
              </Tooltip>
            </span>
            <span class="scenic-bts" @click="delRow(row)">
              <Tooltip content="删除" placement="top-start">
                 <Icon type="ios-trash"/>
              </Tooltip>
            </span>
          </template>
          <template slot-scope="{row,index}" slot="control">
            <span>
                <i-Switch v-model="row.flag==0 ? false:true" size="small" @on-change="changeControl(row)"></i-Switch>
            </span>
          </template>
        </Table>
        <div class="page-box">
          <Page :current="this.pageParams.current":pageSize="this.pageParams.pageSize"  :total="this.pageParams.total" show-total @on-change="changePage"></Page>
        </div>
      </div>
      <AddScenic ref="addScenic" @queryScenicData="queryScenicData"></AddScenic>
    </div>
</template>

<script>
  import {URL} from '../../../api/urlsConfig'
  import AddScenic from '../../components/system/AddScenic'
    export default {
      name: "scenic-area",
      data(){
        return{
          scenicVal:'',
          scenicList:[],
          times:'',
          pageParams : {
            total : 35,
            pageSize : 10,
            current : 1
          },
          columns1:[
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
              title: '景区名称',
              key: 'areaName',
              align: 'center',
              width: 200,
            },
            {
              title: '整体边界',
              key: 'nodes',
              width: 300,
              render:(h,params) => {
                return h('p',[
                  h('Tooltip',{
                    props:{
                      placement:'top',
                      transfer:true
                    },
                    style:{
                      display: 'inline-block',
                      width:'260px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      marginTop:'5px'
                    }
                  },[
                    params.row.nodes,
                    h('p',{
                        slot:'content',
                        style:{
                          whiteSpace:'normal',
                          wordWrap:'bread-word',
                          wordBreak:'break-all'
                        }
                      },
                      params.row.nodes,)
                  ])
                ])
              },
              align: 'center'
            },
            {
              title: '区域边界',
              key: 'subNodes',
              width: 300,
              render:(h,params) => {
                return h('p',[
                  h('Tooltip',{
                    props:{
                      placement:'top',
                      transfer:true
                    },
                    style:{
                      display: 'inline-block',
                      width:'260px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      marginTop:'5px'
                    }
                  },[
                    params.row.subNodes,
                    h('p',{
                        slot:'content',
                        style:{
                          whiteSpace:'normal',
                          wordWrap:'bread-word',
                          wordBreak:'break-all'
                        }
                      },
                      params.row.subNodes)
                  ])
                ])
              },
              align: 'center'
            },
            {
              title: '创建人',
              key: 'createBy',
              width: 200,
              align: 'center'
            },
            {
              title: '创建时间',
              key: 'createDate',
              align: 'center',
              render:function(h,params){
                return h('div',[
                  h('span',new Date(params.row.createDate*1000).toLocaleString())
                ])
              },
              width: 200,
            },
            {
              title: '是否布控',
              key: 'flag',
              align: 'center',
              width: 100,
              slot:"control"
            },
            {
              title: '操作',
              slot: 'action',
              align: 'center',
            }
          ],
          data1:[],
          switch1:false
        }
      },
      components:{
        AddScenic
      },
      inject:["initDate"],
      methods:{
        //获取景区名称列表
        queryScenicListData(){
          this.$http.request({
            method:'get',
            params:{},
            url:URL.querySelectList,
            success:(data) => {
              if(data.code==200){
                let res =data.data;
                this.scenicList = res;
              }
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });
        },
        //新增景区
        addScenic(){
          this.$store.commit("showAddScenicModal", true);
          this.$nextTick(()=>{
            this.$refs["addScenic"].changeTabs();
          })
          this.$refs["addScenic"].title="新增景区";
          this.$refs["addScenic"].areaId = "";
        },
        //获取景区列表数据
        queryScenicData(){
          let params={
            areaId:this.scenicVal,
            endTime:this.getTimeStamp(this.times[1]),
            startTime:this.getTimeStamp(this.times[0]),
            currPage:this.pageParams.current,
            pageSize:this.pageParams.pageSize,
          }
          this.$http.request({
            method:'get',
            params:params,
            url:URL.queryScenicData,
            success:(data) => {
              if(data.code==200){
                let res =data.data;
                this.data1 = res.list;
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
        //时间转换
        getTimeStamp(time){
          if(time){
            let date=new Date(time);
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            return date.getTime()/1000;
          }
          return "";
        },
        //分页
        changePage(index){
          this.pageParams.current = index;
          this.queryScenicData()
        },
        //修改数据
        editData(row){
          if (row.flag == '1') {
            this.$Message.warning("布控中景区不能修改!");
          } else {
            this.$store.commit("showAddScenicModal", true);
            this.$refs["addScenic"].checkScenicData(row.areaId, false, "修改景区");
            this.$nextTick(() => {
              this.$refs["addScenic"].changeTabs();
            })
          }
        },
        //查看数据
        checkData(id){
          this.$store.commit("showAddScenicModal",true);
          this.$refs["addScenic"].checkScenicData(id,true,"查看景区");
          this.$nextTick(()=>{
            this.$refs["addScenic"].changeTabs();
          })
        },
        //删除
        delRow(row){
          if (row.flag == '1') {
            this.$Message.warning("布控中景区不能删除!");
            return
          }
          let params={
            areaId:row.areaId,
          }
          this.$http.request({
            method:'get',
            params:params,
            url:URL.delScenicData,
            success:(data) => {
              if(data.code==200){
                this.$Message.success("删除成功！");
                this.queryScenicData();
              }else{
                this.$Message.error(data.msg);
              }
            },
            error : (data) => {
              this.$Message.error('请求数据失败！');
            }
          });
        },
        //布控
        changeControl(row){
          let params={
            areaId:row.areaId,
            flag:row['flag==0 ? false:true'] ? "1":"0"
          }
          this.$http.request({
            method:'get',
            params:params,
            url:URL.updateStatus,
            success:(data) => {
              if(data.code==200){
                this.$Message.success("修改成功！")
                this.queryScenicData();
              }else{
                this.$Message.error(data.msg);
              }
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });
        }

      },
      created(){
        this.queryScenicListData();
        this.queryScenicData();
      },
      mounted(){

      },
    }
</script>

<style scoped lang="less">
  #scenicArea{
    height: 100%;
    width: 100%;
    padding:30px;
    box-sizing: border-box;
    >.scenic-title{
      color:#86a0bd;
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 30px;
    }
    >.scenic-header{
      width: 100%;
      height: 89px;
      background: #e4e7ea;
      display: flex;
      >.scenic-list{
        display: inline-block;
        width: 18%;
        /*width: 300px;*/
        height: 100%;
        >.scenic-chose{
          width: 100%;
          display: flex;
          margin:0px 25px;
          align-items: center;
          height: 100%;
          >.reptitle{
            width:35%;
            text-align: center;
            display: inline-block;
            font-size: 14px;
            color: #6a6b6b;
            vertical-align: middle;
          }
        }
        >.scenic-chose-left{
          padding-left: 15px;
        }
      }
    }
    .add-box{
      padding: 5px 10px;
      >.add-btn-box{
        float: right;
      }
    }
    .scenic-table{
      .scenic-bts i{
        font-size: 20px;
        cursor: pointer;
        color: #6e90b3;
      }
      .page-box{
        text-align: right;
      }
    }
  }
</style>
