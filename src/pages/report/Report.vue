<template>
  <div id="report-modal">
    <div class="report-title">
      报告列表
    </div>
    <div class="reportheader">
      <li class="rep-list">
        <div class="rep-chose">
          <span class="reptitle">报告名称:</span>
          <Form ref="formValidate" :model="formValidate" :rules="ruleValidate">
            <FormItem>
              <Input v-model="formValidate.name" placeholder="请输入报告名称"></Input>
            </FormItem>
          </Form>
        </div>
      </li>
      <li class="rep-list">
        <div class="rep-chose">
          <span class="reptitle">查询时间:</span>
          <DatePicker type="datetimerange" format="yyyy-MM-dd HH:mm" :clearable="false" confirm split-panels  :editable="false" v-model="times"
                      placeholder="请选择要查看的时间范围" style="width: 100%" @on-ok="gettimes">
          </DatePicker>
        </div>
      </li>
      <li class="rep-list" style="margin-left: 15px">
        <div class="rep-chose">
          <Button @click.native="searchReport">查询</Button>
          <Button @click.native="resizeSearch" style="margin-left: 10px">重置</Button>
        </div>
      </li>
    </div>
    <div class="rephandle">
      <Button type="primary" size="small" @click="deleteReports">批量删除</Button>
<!--
      <Button type="warning" size="small" @click="createNewReport">新增报告</Button>
-->
    </div>
    <div id="repTableBody">
      <div class="rep-tableContent">
        <Table  stripe :columns="columns3" :data="data7" size="small" @on-selection-change="selectReport">
          <template slot-scope="{row,index}" slot="handel">
            <span class="rep-bts" @click="previewReport(row)">
               <Tooltip content="查看报告">
                  <Icon type="ios-eye"/>
               </Tooltip>
             </span>
            <span class="rep-bts" @click="previewReportCondition(row)">
               <Tooltip content="查看条件">
                  <Icon type="ios-eye-outline"/>
               </Tooltip>
             </span>
            <span class="rep-bts"  @click="deleteReport(row)">
              <Tooltip content="删除">
                 <Icon type="ios-trash"/>
               </Tooltip>
            </span>
          </template>
        </Table>
      </div>
      <div class="fes-page" style="margin-top: 10px">
        <Row type="flex" justify="end" align="middle">
          <Page :total="pageParams.total" show-total :page-size="pageParams.pageSize"
                :current="pageParams.current"  @on-change="changePage" size="small"></Page>
        </Row>
      </div>
      <Modal
        v-model="myConditionModal"
        title="构成条件"
        width="700"
        @on-cancel="CancelMyModal"
       >
        <div class="condition-content">
          <li class="cls-info" v-for="(item,index) in currentConditions" :key="index">
            <span class="info-title">{{item.title}}</span>
            <p class="info-list" v-for="(items,indexs) in item.list" :key="indexs">
              <span class="info-list-title">条件说明：{{items.content}}</span>
              <span class="info-list">
              所选条件：  {{items.imgTitle}}
              </span>
            </p>
          </li>
        </div>
        <div slot="footer" style="margin-right: 25px;">
          <!--<Button  size="small" class="btn-primary" @click="resetCheck()">重置</Button>-->
          <!--<Button type="primary"  size="small" @click="myChooseSubmit">确定</Button>-->
        </div>
      </Modal>
    </div>
    <PreviewReport ref="previewReport"></PreviewReport>
    <report-condition ref="reportcondition" @getReportData="getReportData"></report-condition>
  </div>

</template>

<script>
  import {URL} from '../../../api/urlsConfig';
  import PreviewReport from '../../components/report/PreviewReport'
  import ReportCondition from '../../components/report/ReportConditions'
  export default {
    name: "report",
    data(){
      return {
        repBoard:'',
        times:'',
        deleteList:[],
        myConditionModal:false,
        reportList:[],
        showReportList:[],
        currentConditions:[],
        sendTime:"",
        startTime:'',
        endTime:'',
        selectReportId:[],
        formValidate:{
          name:''
        },
        ruleValidate:{
          name:[
            {
              required:true,message:'报告名称不能为空',trigger:'change'
            }
          ]
        },
        pageParams : {
          pageSize :10,
          current : 1,
          total:10
        },
        columns3:[
          {
            type:'selection',
            width:60,
            align: 'center',
          },
          {
            title: '序号',
            // type: 'index',
            width: 80,
            align: 'center',
            render:(h,params) => {
              return h('div',[
                h('span',(params.index+1)+this.pageParams.pageSize*(this.pageParams.current-1))
              ])
            }
          },
          {
            title: '报告名称',
            key: 'rname',
            width: 400,
            render:(h,params) => {
              return h('p',[
                h('Tooltip',{
                  props:{
                    placement:'top',
                    transfer:true
                  },
                  style:{
                    display: 'inline-block',
                    width:'390px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    //marginTop:'5px'
                  }
                },[
                  params.row.rname,
                  h('p',{
                      slot:'content',
                      style:{
                        whiteSpace:'normal',
                        wordWrap:'bread-word',
                        wordBreak:'break-all',
                      }
                    },
                    params.row.rname,)
                ])
              ])
            },
            align: 'center',
          },
          {
            title: '创建人',
            key: 'userName',
            width: 300,
            align: 'center'
          },
          {
            title: '创建时间',
            key: 'createTime',
            align: 'center',
            width: 400,
          },
          {
            title: '操作',
            key: '操作',
            align: 'center',
            'slot':'handel'
          }
        ],
        data7:[],
        boradList:[
          {
            "value":"全部",
            "label":"全部",
            "boradid":"001"
          },
          {
            "value":"模板1",
            "label":"模板1",
            "boradid":"002"

          },
          {
            "value":"模板2",
            "label":"模板2",
            "boradid":"003"
          }
        ]
      }
    },
    inject:[
      "initDate",
    ],
    components:{
      PreviewReport,
      ReportCondition
    },
    created(){

    },
    mounted(){
      let params={
        currPage:this.pageParams.current,
        pageSize:this.pageParams.pageSize,
        rname:'',
        startTime:'',
        endTime:'',
      }
        this.getReportData(params)
    },
    methods:{

      //重置查询
      resizeSearch(){
        this.formValidate.name='';
        this.times='';
        this.startTime='';
        this.endTime='';
        //成功后回调
        let params={
          currPage:this.pageParams.current,
          pageSize:this.pageParams.pageSize,
          rname:'',
          startTime:'',
          endTime:'',
        }
        this.getReportData(params)
      },
      //单选/全选、
      selectReport(value){
        if(value.length!=0){
          for (let i=0;i<value.length;i++){
            this.selectReportId.push(value[i].rid)
          }
        }
      },
      //单击行显示当前报告的组成条件
      showMyCondition(value,index){

        // console.log(value)
      },
      //行点击展示勾选条件回调
      //CancelMyModal
      CancelMyModal(){
        this.myConditionModal=false;
      },
      //创建新报告（报告条件筛选页面显示）
      createNewReport(){
        this.$store.commit("showReportConditionModal",true);
      },
      //获取报告大表数据
      getReportData(params){
        this.$http.request({
          method:'get',
          params:params,
          url:URL.queryreportData,
          success:(data) => {
            if(data.code==200){
              let res =data.data;
              this.pageParams.total=res.totalCount;
              this.pageParams.pageSize=res.pageSize;
              this.data7=res.list
            }
          },
          error : (data) => {
            this.$Message.warning('请求数据失败！');
          }
        });
      },
      //处理分页
      changePage(current){
        this.pageParams.current = current;
        let parms={
          currPage:this.pageParams.current,
          pageSize:this.pageParams.pageSize,
          rname:'',
          startTime:'',
          endTime:'',
        }
        this.getReportData(parms)
      },


      gettimes(){
        let times=this.times;
        this.startTime = times[0] === undefined ||times[0]==='' ? null : new Date(times[0]).getTime()/1000;
        this.endTime = times[1] === undefined ||times[1]===''? null : new Date(times[1]).getTime()/1000;
        this.pageParams.startTime=this.startTime;
        this.pageParams.endTime=this.endTime;

      },
      //报告查询
      searchReport(){
        let _this=this;
        let params={
          currPage:this.pageParams.current,
          pageSize:this.pageParams.pageSize,
          rname:this.formValidate.name,
          startTime:this.startTime,
          endTime:this.endTime,
        }
        this.getReportData(params)
      },
       //单个删除报告
      deleteReport(row){
        event.stopPropagation()
        let sendid='';
        this.deleteList.push(row.rid)
        sendid= this.deleteList.join(",")
        //当删除页吗为最后一页时手动更新页吗 -1
        let totalPage=Math.ceil((this.pageParams.total-1)/this.pageParams.pageSize)  //总页码数
        this.pageParams.current=this.pageParams.current>totalPage?totalPage:this.pageParams.current;
        this.pageParams.current=this.pageParams.current<1?1:this.pageParams.current;
        let params={
          rids:sendid
        }
        this.$Modal.confirm({
          title:'确认删除',
          content:'是否确认删除当前选中的报告',
          onOk: ()=>{
            this.deleteReportList(params)
          },
          onCancel:()=>{
            this.$Message.info('取消删除成功')
          }
        })
      },

      //批量删除
      deleteReports(){
      let sendId=this.selectReportId.join(",")
      let params={
        rids:sendId
      }
      this.deleteReportList(params)
      },
      //单个/批量删除回调
      deleteReportList(params){
        this.$http.request({
          method:'get',
          params:params,
          url:URL.deleteReport,
          success:(data) => {
            if(data.code==200){
              this.$Message.success('删除成功！');
              this.deleteList=[];
              //删除成功后回调
              let params={
                currPage:this.pageParams.current,
                pageSize:this.pageParams.pageSize,
                rname:'',
                startTime:'',
                endTime:'',
              }
              this.getReportData(params)
            }
          },
          error : (data) => {
            this.$Message.warning('请求数据失败！');
          }
        });
      },
      //查看报告条件
      previewReportCondition(row){
        this.reportConditionList(row.rid)
      },

      //全量报告条件查询
      reportConditionList(id) {
        let _this=this;
        this.$http.request({
          method: 'get',
          params: {},
          url: URL.reportconditionslist,
          success: (data) => {
            if (data.code == 200) {
              _this.reportList = data.data
              this.queryShowConditions(id)
            }
          },
          error: (data) => {
            this.$Message.warning('请求数据失败！');
          }
        });
      },

      //报告条件展示数据

      queryShowConditions(id){
        let _this=this;
        _this.currentConditions=[];
        let conditions=[];
        let title="";
        this.$http.request({
          method: 'get',
          params: {rid:id},
          url: URL.queryShowConditions,
          success: (data) => {
            if (data.code == 200) {
              _this.showReportList = data.data
              //报告条件数据组装展示
              if(_this.reportList.length!=0){
                // for(let i=0;i<_this.showReportList.length;i++){
                //   for(let j=0;j<_this.reportList.length;j++){
                //     if(_this.showReportList[i].id==_this.reportList[j].id){
                //       for (let k=0;k<_this.showReportList[i].list.length;k++){
                //         for (let n=0;n<_this.reportList[j].list.length;n++){
                //           if(_this.showReportList[i].list[k].id==_this.reportList[j].list[n].id){
                //             _this.showReportList[i].list[k].titles=_this.reportList[j].list[n].content
                //           }
                //         }
                //       }
                //     }
                //   }
                // }
                _this.currentConditions=_this.showReportList;
                _this.myConditionModal=true;
              }
            }
          },
          error: (data) => {
            this.$Message.warning('请求数据失败！');
          }
        });
      },
      //查看报告
      previewReport(row){
        // console.log(row);
        event.stopPropagation()
        this.$store.commit("showPreviewReportModal",true);
        this.$refs.previewReport.queryPreviewReportData(row);
        //this.$refs.previewReport.queryNumChange();
        //this.$refs.previewReport.queryWorldMap();
      }
    }
  }
</script>

<style scoped  lang="less">
  #report-modal{
    height: 100%;
    width: 100%;
    padding:30px;
    box-sizing: border-box;
    >.report-title{
      color:#86a0bd;
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 30px;
    }
    >.reportheader{
      width: 100%;
      height: 89px;
      background: #e4e7ea;
      display: flex;
      >.rep-list{
        display: inline-block;
        width: 18%;
        /*width: 300px;*/
        height: 100%;
        >.rep-chose{
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

      }
    }
    >.rephandle{
      width: 100%;
      height: 50px;
      line-height: 50px;

    }
    >#repTableBody{
      width: 100%;
      height:calc(100% - 190px);
      /*background: #1E9FFF;*/
      >.rep-tableContent{
        width: 100%;
        box-shadow: 0px 3px 5px #e0e7ee, -3px 0px 5px #e0e7ee, 0px -3px 5px #e0e7ee,  3px 0px 5px #e0e7ee;
        height:calc(100% - 44px);
        /*overflow: auto;*/
        >.ivu-table-wrapper{
          height: 100%;
          /deep/.ivu-table-body{
            height: calc(100% - 33px);
            overflow-x: hidden;
            overflow-y: auto;
          }
        }
      }
    }
    .rep-bts .ivu-icon{
      color: #6e90b3;
      font-size: 18px;
      cursor: pointer;
      margin-right: 15px;
    }
  }
  .condition-content{
    width: 100%;
    height:500px;
    overflow: auto;
    padding:10px 0px;
  }
  .cls-info{
    width: 100%;
    border-bottom:1px dashed   #0C0C0C;
    padding:15px 0px;
    >.info-title{
      display: inline-block;
      height: 30px;
      width: 100%;
      padding:0px 15px;
      background: #e4e7ea;
      line-height: 30px;
      color: #0C0C0C;
      font-size: 18px;
    }
   >.info-list{
     width: 100%;
     >span{
       display:block;
     }
   >.info-list-title{
     margin:15px 0px;
     padding:0px 5px;
     color: #211d08;
     font-size: 12px;
   }
   >.info-list{
     font-size: 10px;
     color: #96aeb4;
     padding:0px 5px;
   }
   }
  }
</style>
<style>
  #report-modal .rep-chose .ivu-form-item .ivu-form-item-content{
    margin-top: 25px;
  }

  #report-modal .rep-chose .ivu-btn{
    height: 30px;
    padding:0px 20px;
    background: #6b8caf;
    color: #f5f7f9;
  }

</style>
