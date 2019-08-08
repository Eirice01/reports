<template>
  <Card  id="population-constitute">
    <div class="modal-title">
      <span>人口构成</span>
    </div>
    <Row>
      <Col span="12">
        <div id="source-chart"></div>
        <div class="check-tool" @click="JumpOrigin">
          <span><i class="iconfont icon-biaodan"></i></span>
          <span class="info-list" >信息列表</span>
          <!--<Button type="primary" size="small"  @click="JumpOrigin">查询详情</Button>-->
        </div>
      </Col>
      <Col span="12">
        <div id="target-chart"></div>
        <div class="check-tool" @click="JumpQcore">
          <span><i class="iconfont icon-biaodan"></i></span>
          <span class="info-list" >信息列表</span>
         <!-- <Button type="primary" size="small" @click="JumpQcore">查询详情</Button>-->
        </div>
      </Col>
    </Row>

  </Card>
</template>

<script>
  import {URL} from '../../../api/urlsConfig'
    export default {
      name: "population-form",
      data(){
        return{
          timer4:null,
          istype:'',
          taskId:"",
          sourcePie :[],
          targetPie :[],
          sendData:'',
          timer7:null,
          oldTimes:'',
          oldTypes:'',
          oldstatus:'',
          oldtourtype:'',
          oldtourtime:'',
        }
      },
      props:[
        'dateData',
        'areaCode',
        'scenicCode',
        'isType',
        "areaName",
        "areaNames"
      ],
      inject:[
        "formatDate",
        "changeFormatDate"
      ],
      watch:{
        dateData(){
          let parms={};
          if(this.istype=="pops"||this.istype==undefined){
            //人口页面时参数配置
            let data=''
            if(typeof(this.dateData)=='string'){
              data=this.dateData.replace(/-/g,'')
            }
            parms={
              date:typeof(this.dateData)=='string' ? this.dateData.replace(/-/g,'') : data,
              code:this.areaCode
            }
            this.querySourceData(parms);

          }else if(this.istype=="tours"&&this.isType==false){
            //旅游页面参数配置
            parms={
              date:this.dateData,
              code:this.scenicCode,
              isRealtime: false
            }
            this.queryTourSourceData(parms)
          }

        }
      },
      beforeDestroy(){
        //清空定时器
        clearInterval(this.timer4);
        clearInterval(this.timer7);
      },
      methods:{
        //定时器触发获取5分钟最新时间
         getNew5Time(){
           this.$http.request({
             method:'get',
             params:'',
             url:URL.queryTourisLately5MinTime,
             success:(data) => {
               if(data.code==200){
                this.sendData=data.data;
                this.$emit("realTime",this.sendData)
               }
             },
             error : (data) => {
             }
           });


         },
        //人口获取日月切换及时间选择
        getChoseOldType(type,time){
           this.oldTypes=type;
           this.oldTimes=time;
        },
        //旅游获取状态时间
        getChoseTour(status,type,time){
            this.oldstatus=status;
            this.oldtourtype=type
            this.oldtourtime=time;
        },
        //跳转来源地详情
        JumpOrigin(){
          if(this.istype=="pops"||this.istype==undefined){
            this.$router.push({
              name: 'originPlace',
              query:{
                result:true,
                date:this.dateData,
                code:this.areaCode,
                istype:this.istype,
                isTypes:this.isType,
                sendData:this.sendData,
                oldtype:this.oldTypes,
                oldtime:this.oldTimes,
                areaName:this.areaName
              }
            });
          }else if(this.istype=="tours"){
            this.$router.push({
              name: 'originPlace',
              query:{
                result:true,
                date:this.dateData,
                code:this.scenicCode,
                istype:this.istype,
                isTypes:this.isType,
                sendData:this.sendData,
                oldstatus:this.oldstatus,
                oldtype:this.oldtourtype,
                oldtime:this.oldtourtime,
                areaNames:this.areaNames
              }
            });
          }

        },
        //跳转归属地详情
        JumpQcore(){
          if(this.istype=="pops"||this.istype==undefined){
            this.$router.push({
              name: 'qcellCore',
              query:{
                result:true,
                date:this.dateData,
                code:this.areaCode,
                istype:this.istype,
                isTypes:this.isType,
                sendData:this.sendData,
                oldtype:this.oldTypes,
                oldtime:this.oldTimes,
                areaName:this.areaName
              }
            });
          }else if(this.istype=="tours"){
            this.$router.push({
              name: 'qcellCore',
              query:{
                result:true,
                date:this.dateData,
                code:this.scenicCode,
                istype:this.istype,
                isTypes:this.isType,
                sendData:this.sendData,
                oldstatus:this.oldstatus,
                oldtype:this.oldtourtype,
                oldtime:this.oldtourtime,
                areaNames:this.areaNames
              }
            });
          }
        },
        getTourSourceType(type){
          if(type){
            this.timer4=setInterval(this.RelaquerySourceData,5*60*1000);
            this.timer7=setInterval(this.getNew5Time,5*60*1000)
          }else{
            clearInterval(this.timer4);
            clearInterval(this.timer7);
          }
        },
       //定时器下回调来源地/归属地
        RelaquerySourceData(){
          this.$http.request({
            method:'get',
            params:{
              date:'',
              isRealtime:true,
              code:this.scenicCode
            },
            url:URL.queryTourPeopleConstitute,
            success:(data) => {
              if(data.code==200){
                this.sourcePie =data.data.origin;
                this.targetPie =  data.data.belong;
                this.initSourcePie('#source-chart','来源地',this.sourcePie);
                this.initSourcePie('#target-chart','归属地',this.targetPie);
              }
            },
            error : (data) => {
            }
          });
        },

        //来源地归属地返回调用
        backRelaquerySourceData(){
          this.$http.request({
            method:'get',
            params:{
              date:this.dateData,
              isRealtime:false,
              code:this.scenicCode
            },
            url:URL.queryTourPeopleConstitute,
            success:(data) => {
              if(data.code==200){
                this.sourcePie =data.data.origin;
                this.targetPie =  data.data.belong;
                this.initSourcePie('#source-chart','来源地',this.sourcePie);
                this.initSourcePie('#target-chart','归属地',this.targetPie);
              }
            },
            error : (data) => {
            }
          });
        },
        getArcodes(){
        //来源标识
          this.istype=this.$route.query.istype;
          let parms={};
          if(this.istype=="pops"||this.istype==undefined){
            //人口页面时参数配置
            parms={
              date:typeof(this.dateData)=='string' ? this.dateData.replace(/-/g,'') : this.dateData.join(",").replace(/-/g,''),
              code:this.areaCode
            }
            this.querySourceData(parms);
          }else if(this.istype=="tours"){
            //旅游页面时参数配置
            if(this.isType){
              parms={
                date:'',
                code:this.scenicCode,
                isRealtime:true
              }
            }else {

              parms={
                date:this.dateData,
                code:this.scenicCode,
                isRealtime:false
              }
            }
            this.queryTourSourceData(parms)
          }

        },

        //旅游页面下分实时下分，日，月切换调用
        sourceChangeType(types,times){
          let time=new Date(times)
          let times1 = this.changeFormatDate(time,types)
          let parm={
            date:times1,
            code:this.scenicCode,
            isRealtime: false
          }
          this.queryTourSourceData(parm);
        },
        //旅游页面调用 //获取来源地/归属地数据
        queryTourSourceData(par){
          this.$http.request({
            method:'get',
            params:par,
            url:URL.queryTourPeopleConstitute,
            success:(data) => {
              if(data.code==200){
                this.sourcePie = data.data.origin;
                this.targetPie = data.data.belong;
                this.initSourcePie('#source-chart','来源地',this.sourcePie);
                this.initSourcePie('#target-chart','归属地',this.targetPie);
              }
            },
            error : (data) => {
            }
          });
        },
        //获取来源地/归属地数据
        querySourceData(parms){
          this.$http.request({
            method:'get',
            params:parms,
            url:URL.queryPeopleConstitute,
            success:(data) => {
              if(data.code==200){
                this.sourcePie = data.data.origin;
                this.targetPie = data.data.belong;
                this.initSourcePie('#source-chart','来源地',this.sourcePie);
                this.initSourcePie('#target-chart','归属地',this.targetPie);
              }
            },
            error : (data) => {
            }
          });
        },
        /*来源地/归属地占比统计图*/
        initSourcePie(id,text,data){
          let _this=this;
          let myChart = _this.$echarts.init(document.querySelector(id));
          let option = {
            title : {
              text: text,
              x:'center',
              y:'center',
              textStyle:{
                color:'#515a6e',
                fontSize:14
              },
            },
            tooltip : {
              trigger: 'item',
              position:'right',
              formatter: function(params){
                return `${params.name}:${(params.value/10000).toFixed(2)}万人(${params.percent}%)`
              }
            },
            calculable : true,
            color: id=='#source-chart' ? ['#0788e0','#a0d0f0','#f5a623','#f9d8a0','#17B9C6']:['#f5a623','#f9d8a0','#0788e0','#a0d0f0','#17B9C6'],
            series : [
              {
                type:'pie',
                radius : ['38%','55%'],
                center: ['50%', '50%'],
                data:data,
                labelLine:{
                  normal:{
                    show:true,
                    length:5,
                    length2:5
                  }
                },
                label:{
                  normal:{
                    position:'outside',
                    formatter:'{b|{b}}\n{d|{d}%}',
                    rich:{
                      b:{
                        color:'#515a6e'
                      },
                      d:{
                        fontSize:'12'
                      }
                    }
                  }
                }
              }
            ]
          };
          myChart.setOption(option);
          window.addEventListener("resize", function () {
            myChart.resize();
          });
          myChart.on('click',function (params) {
            if(text=='来源地'&&params.data.name=="非西安") {
              if(_this.istype=="pops"||_this.istype==undefined){
                _this.$router.push({
                  name: 'echartsoriginplace',
                  query:{
                    result:true,
                    date:_this.dateData,
                    code:_this.areaCode,
                    istype:_this.istype,
                    isTypes:_this.isType,
                    sendData:_this.sendData,
                    oldtype:_this.oldTypes,
                    oldtime:_this.oldTimes,
                    areaName:_this.areaName
                  }
                });
              }else if(_this.istype=="tours"){
                _this.$router.push({
                  name: 'echartsoriginplace',
                  query:{
                    result:true,
                    date:_this.dateData,
                    code:_this.scenicCode,
                    istype:_this.istype,
                    isTypes:_this.isType,
                    sendData:_this.sendData,
                    oldstatus:_this.oldstatus,
                    oldtype:_this.oldtourtype,
                    oldtime:_this.oldtourtime,
                    areaNames:_this.areaNames
                  }
                });
              }
            }
            if(text=='归属地'&&params.data.name=="非西安"){
              if(_this.istype=="pops"||_this.istype==undefined){
                _this.$router.push({
                  name: 'echartsqcellplace',
                  query:{
                    result:true,
                    date:_this.dateData,
                    code:_this.areaCode,
                    istype:_this.istype,
                    isTypes:_this.isType,
                    sendData:_this.sendData,
                    oldtype:_this.oldTypes,
                    oldtime:_this.oldTimes,
                    areaName:_this.areaName

                  }
                });
              }else if(_this.istype=="tours"){
                _this.$router.push({
                  name: 'echartsqcellplace',
                  query:{
                    result:true,
                    date:_this.dateData,
                    code:_this.scenicCode,
                    istype:_this.istype,
                    isTypes:_this.isType,
                    sendData:_this.sendData,
                    oldstatus:_this.oldstatus,
                    oldtype:_this.oldtourtype,
                    oldtime:_this.oldtourtime,
                    areaNames:_this.areaNames
                  }
                });
              }
            }
          })
        },
      },
      created(){

      },
      mounted(){
      //来源标识
        this.istype=this.$route.query.istype;
        if(this.$route.query.date!=undefined&&this.$route.query.date!=''){
          if(this.istype=="tours"){
            this.backRelaquerySourceData();
            this.getNew5Time()
          }else if(this.istype=='pops'){
            parms={
              date:typeof(this.dateData)=='string' ? this.dateData.replace(/-/g,'') : this.dateData.join(",").replace(/-/g,''),
              code:this.areaCode

            }
            this.querySourceData(parms)
          }
        }else {
          var parms={};
          let url="";
          if(this.istype=="pops"||this.istype==undefined){
            parms={
              date:typeof(this.dateData)=='string' ? this.dateData.replace(/-/g,'') : this.dateData.join(",").replace(/-/g,''),
              code:this.areaCode

            }
            this.querySourceData(parms)
          }else if(this.istype=="tours"){
            //旅游页面时参数配置
            // url=URL.queryTourPeopleConstitute;
            parms={
              date:'',
              code:this.scenicCode,
              isRealtime:true
            }
            //调用5分钟节点时间
            this.getNew5Time()
            this.queryTourSourceData(parms);
          }
        }
       if(this.$route.query.date==''){
          if(this.istype=="tours"){
            //旅游页面时参数配置
            // url=URL.queryTourPeopleConstitute;
           var parms={
              date:'',
              code:this.scenicCode,
              isRealtime:true
            }
            //调用5分钟节点时间
            this.getNew5Time()
            this.queryTourSourceData(parms);
          }
          }

      }
    }
</script>

<style scoped>
  #population-constitute{
    width: 400px;
    margin-top: 10px;
    height:100%;
  }
  #population-constitute >>> .ivu-card-body{
    height: 100%;
  }
  #population-constitute >>>.ivu-row{
    height: calc(100% - 32px);
  }
  #population-constitute >>>.ivu-row .ivu-col{
    height: 100%;
  }
  #source-chart,#target-chart{
    width: 100%;
    height: calc(100% - 24px);
  }
 .check-tool{
   text-align: center;
   cursor: pointer;
   color: #6d8eb0;
 }
</style>
