<template>
    <div id="statistics-table">
        <Table stripe :columns="columns1" size="small" :data="data1"></Table>
        <div class="page-box">
          <Page :current="current" :total="total" :page-size="pageSize" size="small" @on-change="changePage"></Page>
        </div>
    </div>
</template>
<script>
  import{URL} from "../../../api/urlsConfig";
    export default {
      name: "statisticsTable",
      data(){
        return{
          columns1: [
            {
              title: '序号',
              type: 'index',
              width: 60,
              align: 'center'
            },
            {
              title: '区域',
              key: 'cityName',
              align: 'center'
            },
            {
              title: '人数（人）',
              key: 'peopleNums',
              width: 120,
              align: 'center'
            },
            {
              title: '占比（%）',
              key: 'ratio',
              align: 'center'
            }
          ],
          data1: [],
          current:1,
          total:0,
          pageSize:20,
          isCity:"0",
          date:"",
          flag:'',
          code:"",
          popType:"0",
          areaName:""
        }
      },
      methods:{
        //获取表格数据
        queryStatisticsTableData(data){
          /*if(flag){
            this.areaName='';
          }*/
          this.currPage =data.currPage;
          this.isCity =data.isCity;
          this.date = data.date;
          this.flag =data.flag;
          this.code = data.code;
          this.popType =data.popType;
          this.areaName =data.areaName;
          let params={
            currPage:data.currPage,
            pageSize:this.pageSize,
            isCity:data.isCity,
            date:data.date,
            flag:data.flag,
            code:data.code,
            popType:data.popType
          }
          this.$http.request({
            method:'get',
            params:params,
            url:URL.queryPopTableData,
            success:(data) => {
              if(!!data.data){
                if(this.areaName!=''){
                  this.data1=_.filter(data.data.list, (node)=> {
                    if(node.cityName==this.areaName){
                      return [node]
                    }
                  })
                }else {
                  this.areaName='';
                  this.data1 = data.data.list;
                }
                /*this.data1 = data.data.list;*/
                this.current= data.data.currPage;
                this.total= data.data.totalCount;
                this.pageSize= data.data.pageSize;

              }
            },
            error : (data) => {
            }
          });
        },
        //分页
        changePage(index){
          this.current =index;
          let params={
            currPage:this.current,
            pageSize:this.pageSize,
            isCity:this.isCity,
            date:this.date,
            flag:this.flag,
            code:this.code,
            popType:this.popType
          }
          this.queryStatisticsTableData(params)
        },
      },
      created(){

      },
      mounted(){

      },
      beforeDestroy(){

      }
    }
</script>

<style scoped>
  #statistics-chart{
    width: 100%;
    height: 100%;
  }
</style>
