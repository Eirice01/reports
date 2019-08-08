<template>
  <div id="report-modal">
    <div class="report-title">
      报告列表
    </div>
    <div class="reportheader">
      <li class="rep-list">
        <div class="rep-chose">
          <span class="reptitle">报告模板:</span>
          <Select v-model="repBoard" @on-change="getTypes">
            <Option :value="item.value" v-for="(item,index) in boradList" :key="index" @click.native="getboard(item.boradid)">{{item.label}}</Option>
          </Select>
        </div>
      </li>
      <li class="rep-list">
        <div class="rep-chose">
          <span class="reptitle">开始时间:</span>
          <DatePicker type="daterange"  :clearable="false" confirm split-panels  v-model="times"
                      placeholder="请选择要查看的时间范围" style="width: 100%" @on-ok="gettimes">
          </DatePicker>
        </div>
      </li>
      <li class="rep-list">

      </li>
    </div>
    <div class="rephandle">
      <Button type="primary" size="small">批量删除</Button>
      <Button type="warning" size="small">一键已读</Button>
      <Button type="warning" size="small" @click="createNewReport">新增报告</Button>
    </div>
    <div id="repTableBody">
      <div class="rep-tableContent">
        <Table  stripe :columns="columns3" :data="data7" size="small">
          <template slot-scope="{row,index}" slot="handel">
            <!--<Button type="primary" size="small" @click="showHotMap(row,index)">查看热力图</Button>-->
            <!--<span class="rep-bts"><Icon type="ios-document"/></span>-->
            <span class="rep-bts" @click="previewReport(row)">
               <Tooltip content="查看">
                  <Icon type="ios-eye"/>
               </Tooltip>
             </span>
            <!--<span class="rep-bts" style="margin-left: 50px"><Icon type="ios-trash"/></span>-->
          </template>
        </Table>
      </div>
      <div class="fes-page" style="margin-top: 10px">
        <Row type="flex" justify="end" align="middle">
          <Page :total="pageParams.total" show-total :page-size="pageParams.pageSize"
                :current="pageParams.current" show-elevator @on-change="changePage"></Page>
        </Row>
      </div>
    </div>
    <PreviewReport ref="previewReport"></PreviewReport>
    <report-condition ref="reportcondition"></report-condition>
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
        pageParams : {
          total : 35,
          pageSize : 15,
          current : 1
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
            width: 200,
            align: 'center',
            render:(h,params) => {
              let status=params.row.status;
              if(status==0){
                return h('div',[
                  h('span',(params.index+1)+this.pageParams.pageSize*(this.pageParams.current-1)),
                  h('span',
                    {
                      style:{
                        display:'inline-block',
                        color:'#bbbdc1',
                        fontSize:'10px',
                        padding:'2px 15px',
                        border:'1px solid #c0c4cc',
                        borderRadius:'9px',
                        textAlign:'center',
                        marginLeft:'40px',
                        backgroundColor:'#f0f2f5'
                      }
                    },'未读')

                ])
              }
              if(status==1){
                return h('div',[
                  h('span',(params.index+1)+this.pageParams.pageSize*(this.pageParams.current-1)),
                  h('span',
                    {
                      style:{
                        display:'inline-block',
                        color:'#e7a065',
                        fontSize:'10px',
                        padding:'2px 15px',
                        border:'1px solid #e69b5c',
                        borderRadius:'9px',
                        textAlign:'center',
                        marginLeft:'40px',
                        backgroundColor:'#fde5d1'
                      }
                    },'已读')

                ])
              }

            } ,
          },
          {
            title: '报告名称',
            key: 'name',
            align: 'center',
            width: 200,
          },
          {
            title: '创建人',
            key: 'person',
            width: 200,
            align: 'center'
          },
          {
            title: '创建时间',
            key: 'time',
            align: 'center',
            width: 300,
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
    components:{
      PreviewReport,
      ReportCondition
    },
    created(){

    },
    mounted(){
      /*let rep=this.$route.query.isrep;
      if(rep){*/
        this.getReportData()
     /* }*/
    },
    methods:{

      //创建新报告（报告条件筛选页面显示）
      createNewReport(){
        this.$store.commit("showReportConditionModal",true);
      },
      //获取报告大表数据
      getReportData(){
        // let params={
        //   current:this.pageParams.current,
        //   total:this.pageParams.total,
        //   pageSize:this.pageParams.pageSize,
        // }
        this.$http.request({
          method:'get',
          params:'',
          url:URL.queryreportData,
          success:(data) => {
            if(data.code==200){
              let res =data.data;
              this.data7=res
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
        //"0"为非自动刷新
        // this.queryTaskList("0");
      },
      //获取选择的模板类型
      getTypes(){
        console.log(this.repBoard)
      },
      //获取模板id
      getboard(id){
        console.log(id)
      },
      gettimes(){
        let times=this.times
        let startTime = times[0] === undefined ||times[0]==='' ? null : new Date(times[0]).getTime();
        let endTime = times[1] === undefined ||times[1]===''? null : new Date(times[1]).getTime();
      },
      previewReport(row){
        // console.log(row);
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
        overflow: auto;
      }

    }
    .rep-bts .ivu-icon{
      color: #6e90b3;
      font-size: 18px;
      cursor: pointer;
    }
  }

</style>
