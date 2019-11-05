<template>
    <div id="statistics-chart">

    </div>
</template>
<script>
  import{URL} from "../../../api/urlsConfig";
    export default {
      name: "statisticsChart",
      data(){
        return{
          barChart:null,
          areaName:""
        }
      },
      methods:{
        /*柱状图初始化*/
        initBarChart(x,y){
          let total =0;
          y.forEach((i)=>{
            total+=Number(i)
          })
          let option = {
            title : {
              text: `西安市${this.areaName}人口统计`,
              x:'center',
              textStyle:{
                color:'#333',
                fontSize:16
              },
              top:20,
            },
            grid:{
              top:40,
              left:"20%",
              bottom:20
            },
            tooltip : {
              trigger: "axis",
              /*formatter:tep*/
            },
            /*legend: {
              type:'scroll',
              data:legendData,
              top:50,
            },*/
            calculable : true,
            xAxis : [
              {
                type : "value",
                /*name :name*/
              }

            ],
            dataZoom:[
              {
                type:'inside',
                /*show:flag,*/
                realtime:true,
              }
            ],
            yAxis : [
              {
                type : "category",
                /*boundaryGap : false,*/
                data : x,
              }
            ],
            toolbox:{
              show:true,
              right:20,
              // saveAsImage:{}
            },
            series:{
              /*name:legendData[index],*/
              type:"bar",
              data:y,
              label:{
                normal:{
                  show:true,
                  position:['50%','-50%'],
                  textBorderColor:'#fff',
                  textBorderWidth:2,
                 /* position:'top',*/
                  formatter:function(params){
                    // return `${params.data}(${Math.round(((params.data*100/total).toFixed(4)))}%)`
                    return `${params.data}(${(parseFloat((params.data)/total)).toFixed(4)*100}%)`
                  },
                }
              },
              barWidth:"30%",
              itemStyle:{
                color:'#2C82BE'
              },
              /*itemStyle:{normal: {label: {show:true}}},
              markPoint : {
                symbol:'pin',
                symbolSize:5,
              },*/
            },
          };
          this.barChart.setOption(option,true);
          window.addEventListener("resize", function () {
            this.barChart.resize()
          });
        },
        /*获取数据*/
        queryChartData(data,urls){
          this.areaName = data.areaName!=undefined ? data.areaName:"";
          /*let params ={
            flag:data.flag,
            date:data.date,
            code:data.code,
            genReParam:data.genReParam
          };*/
          if(this.$route.query.type=='tour'){
            this.$http.request({
              method:'post',
              data:data,
              url:urls,
              success:(data) => {
                if(data.code==200){
                  let res =data.data;
                  let x = res.xList;
                  let y = res.yList;
                  this.initBarChart(x,y);
                }
              },
              error : (data) => {
                this.$Message.warning('请求数据失败！');
              }
            });
          }else{
            this.$http.request({
              method:'get',
              params:data,
              url:urls,
              success:(data) => {
                if(data.code==200){
                  let res =data.data;
                  let x = res.xlist;
                  let y = res.ylist;
                  this.initBarChart(x,y);
                }
              },
              error : (data) => {
                this.$Message.warning('请求数据失败！');
              }
            });
          }


        },
      },
      created(){

      },
      mounted(){
        this.barChart= this.$echarts.init(document.getElementById("statistics-chart"));
      },
      beforeDestroy(){
        this.barChart.clear();
        this.barChart =null;
      }
    }
</script>

<style scoped>
  #statistics-chart{
    width: 100%;
    height: 100%;
  }
</style>
