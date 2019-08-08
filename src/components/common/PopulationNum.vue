<template>
  <Card  id="population-num">
    <div class="modal-title">
      <span>人口统计</span>
    </div>
    <div class="total-box">
      <div class="total-num">
        <span class="icon-list">
          <i class="iconfont icon-ren"></i>
        </span>
        <span>
          总人数：
        </span>
        <span>
          <span class="num-val">{{popNum.headcounts}}</span>人
        </span>
      </div>
      <div class="num-list-text" v-show="showFlowNum">
        <span class="num-icon num-icon-import"><i class="iconfont icon-zhongdianren"></i></span>
        <span class="num-icon-val">
            <div class="num-middle">
              <div>
                <span>布控重点人</span>
              </div>
              <div>
                <span><span class="num-list-val">{{keypoples}}</span>人</span>
              </div>
            </div>
          </span>
      </div>
    </div>
    <div class="num-details">
      <div class="num-list">
        <div class="num-list-text">
          <span class="num-icon">
            <div>
              <i class="iconfont icon-zhongxinchengquchangzhurenkouguimo"></i>
            </div>
          </span>
          <span class="num-icon-val">
            <div class="num-middle">
              <div >
                <span>常驻人口</span>
              </div>
              <div>
                <span><span class="num-list-val">{{popNum.permanentPeoples}}</span>人</span>
              </div>
            </div>
          </span>
        </div>
        <div class="num-list-text">
          <span class="num-icon"><i class="iconfont icon-zanzhurenyuan"></i></span>
          <span class="num-icon-val">
            <div class="num-middle">
              <div>
              <span v-text="showFlowNum ? '路过人口':'暂住人口'"></span>
            </div>
              <div>
              <span><span class="num-list-val">{{popNum.stayPeoples}}</span>人</span>
            </div>
            </div>
          </span>
        </div>
        <div class="num-list-text">
          <span class="num-icon"><i class="iconfont icon-zongzhi-ren-liudongrenkou"></i></span>
          <span class="num-icon-val">
            <div class="num-middle">
              <div>
                <span  v-text="showFlowNum ? '游客人口':'流动人口'"></span>
              </div>
              <div>
                <span><span class="num-list-val">{{popNum.flowPeoples}}</span>人</span>
              </div>
            </div>
          </span>
        </div>
      </div>
      <div class="num-list" v-show="showFlowNum">
        <div class="flow-list"><span><i class="iconfont icon-APIjieru"></i></span><span>流入人口：</span><span><span class="num-list-val">{{enterNum.enterNums}}</span>人</span></div>
        <div class="flow-list"><span><i class="iconfont icon-APIshuchu1"></i></span><span>流出人口：</span><span><span class="num-list-val">{{enterNum.leaveNums}}</span>人</span></div>
      </div>
      </div>
  </Card>
</template>

<script>
  import {URL} from "../../../api/urlsConfig"
    export default {
      name: "population-number",
      data(){
         return{
           timer2:null,
           timer3:null,
           timer6:null,
          enterNum:{
            enterNums:'', //流入人口
            leaveNums:'', //流出人口
          },
          popNum:{
            flowPeoples:'',
            headcounts:'',
            permanentPeoples:'',
            stayPeoples:''
          },
           istype:'',
           keypoples:''
         }
      },
      props:[
        'showFlowNum',
        'dateData',
        "areaCode",
        "scenicCode",
        'isType'
      ],
      inject:[
        "formatDate",
        "changeFormatDate"
      ],
      watch:{
        dateData(){
         if(!this.isType){
           this.tourqueryPopulationNum();
           if(this.showFlowNum){
             this.tourqueryTourEnterNum();
             this.tourKeyPople(this.dateData)
           }
         }
        }
      },
      beforeDestroy(){
        //清空定时器
        clearInterval(this.timer2);
        clearInterval(this.timer3);
        clearInterval(this.timer6);
      },
      methods:{

        //重点人接口定时器调用
        keyPople(){
          let flag='';
          //根据获取的景区code识别是否是主景区flag=0/子景区flag=1
          // let flag0='min';
          // let flag1='sub';
          // if(this.scenicCode.search(flag0)!=-1){
          //   flag=0
          // }else if(this.scenicCode.search(flag1)!=-1){
          //   flag=1
          // }
          if(this.scenicCode=='大雁塔'||this.scenicCode==''){
            flag=0
          }else {
            flag=1;
          }
          let parm={}
          if(this.isType){
            parm={
              date:'',
              flag:flag,
              code:this.scenicCode,
              isRealtime:this.isType
            }
          }else {
            parm={
              date:this.dateData,
              flag:flag,
              code:this.scenicCode,
              isRealtime:this.isType
            }
          }

          this.$http.request({
            method:'get',
            params:parm,
            url:URL.queryMapKeyPeopleCount,
            success:(data) => {
              if(data.code==200){
                this.keypoples = data.data;
              }
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });
        },
        //重点人非实时点击初始化分钟下调用
        outTimeKeyPople(type,time){
          let flag='';
          //根据获取的景区code识别是否是主景区flag=0/子景区flag=1
          // let flag0='min';
          // let flag1='sub';
          // if(this.scenicCode.search(flag0)!=-1){
          //   flag=0
          // }else if(this.scenicCode.search(flag1)!=-1){
          //   flag=1
          // }
          if(this.scenicCode=='大雁塔'||this.scenicCode==''){
            flag=0
          }else {
            flag=1;
          }
          let parm={
              date:time,
              flag:flag,
              code:this.scenicCode,
              isRealtime:type
            }
          this.$http.request({
            method:'get',
            params:parm,
            url:URL.queryMapKeyPeopleCount,
            success:(data) => {
              if(data.code==200){
                this.keypoples = data.data;
              }
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });
        },
        //获取实时非实时状态
        popOutRealtype(type){
          if(type){
            this.timer2=setInterval(this.queryRealTime,5*60*1000);
            this.timer3=setInterval(this.queryRealTourEnterNum,5*60*1000);
            this.timer6=setInterval(this.keyPople,5*60*1000)
          }else{
            clearInterval(this.timer2);
            clearInterval(this.timer3);
            clearInterval(this.timer6);
          }
        },
        //实时状态下定时器5分钟刷新人口统计，定时器状态下不能使用（）加参数
        //定时器下人口统计数据调用
        queryRealTime(){
          this.$http.request({
            method:'get',
            params:{
              date:'',
              code:this.scenicCode,
              isRealtime:this.isType
            },
            url:URL.queryTourismDemographic,
            success:(data) => {
              if(data.code==200){
                this.popNum = data.data;
              }
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });

        },
       //定时器下流入流出人口调用
        queryRealTourEnterNum(){
          let params={
            date:'',
            code:this.scenicCode,
            isRealtime:this.isType
          }
          this.$http.request({
            method:'get',
            params:params,
            url:URL.queryTourEnterLeaveNum,
            success:(data) => {
              if(data.code==200){
                this.enterNum = data.data;
              }
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });
        },

        //非是实时下时间选择后或者地图点击后调用人口统计
        tourqueryPopulationNum(){
          let url="";
          let params={};
          if(this.istype=="tours"){
            //旅游页面左侧人口统计
            url=URL.queryTourismDemographic;
            params={
              date:this.dateData,
              code:this.scenicCode,
              isRealtime:this.isType
            }
          }else if(this.istype=="pops"||this.istype==undefined) {
            //人口页面左侧人口统计
            let data=''
            if(typeof(this.dateData)=='string'){
              data=this.dateData.replace(/-/g,'')
            }
            url=URL.queryDemographic;
            params={
              date:typeof(this.dateData)=='string' ? this.dateData.replace(/-/g,'') : data,
              code:this.areaCode
            }
          }
          this.$http.request({
            method:'get',
            params:params,
            url:url,
            success:(data) => {
              if(data.code==200){
                this.popNum = data.data;
              }
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });

        },
        //从模块点击返回后调用
        backQueryPopulationNum(){
          let url="";
          let params={};
          if(this.istype=="tours"){
            //旅游页面左侧人口统计
            url=URL.queryTourismDemographic;
            params={
              date:this.dateData,
              code:this.scenicCode,
              isRealtime:false
            }
          }else if(this.istype=="pops"||this.istype==undefined) {
            //人口页面左侧人口统计
            let data=''
            if(typeof(this.dateData)=='string'){
              data=this.dateData.replace(/-/g,'')
            }
            url=URL.queryDemographic;
            params={
              date:typeof(this.dateData)=='string' ? this.dateData.replace(/-/g,'') : data,
              code:this.areaCode
            }
          }
          this.$http.request({
            method:'get',
            params:params,
            url:url,
            success:(data) => {
              if(data.code==200){
                this.popNum = data.data;
              }
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });

        },
        //重点人返回调用
        backKeyPople(){
          let flag='';
          //根据获取的景区code识别是否是主景区flag=0/子景区flag=1
          // let flag0='min';
          // let flag1='sub';
          // if(this.scenicCode.search(flag0)!=-1){
          //   flag=0
          // }else if(this.scenicCode.search(flag1)!=-1){
          //   flag=1
          // }
          if(this.scenicCode=='大雁塔'||this.scenicCode==''){
            flag=0
          }else {
            flag=1;
          }
          let parm={
              date:this.dateData,
              flag:flag,
              code:this.scenicCode,
              isRealtime:false
            }

          this.$http.request({
            method:'get',
            params:parm,
            url:URL.queryMapKeyPeopleCount,
            success:(data) => {
              if(data.code==200){
                this.keypoples = data.data;
              }
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });
        },
       //流入流出返回调用
        backQueryRealTourEnterNum(){
          let params={
            date:this.dateData,
            code:this.scenicCode,
            isRealtime:false
          }
          this.$http.request({
            method:'get',
            params:params,
            url:URL.queryTourEnterLeaveNum,
            success:(data) => {
              if(data.code==200){
                this.enterNum = data.data;
              }
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });
        },
        //获取人口统计数据
        queryPopulationNum(){
          let url="";
          let params={};
          if(this.istype=="tours"){
            //旅游页面左侧人口统计
            url=URL.queryTourismDemographic;
            if(this.isType){
              params={
                date:'',
                code:this.scenicCode,
                isRealtime:this.isType
              }
            }else {
              params={
                date:this.dateData,
                code:this.scenicCode,
                isRealtime:this.isType
              }
            }

          }else if(this.istype=="pops"||this.istype==undefined) {
            //人口页面左侧人口统计
            let data=''
            if(typeof(this.dateData)=='string'){
              data=this.dateData.replace(/-/g,'')
            }
            url=URL.queryDemographic;
            params={
              date:typeof(this.dateData)=='string' ? this.dateData.replace(/-/g,'') : data,
              code:this.areaCode
            }
          }
          this.$http.request({
            method:'get',
            params:params,
            url:url,
            success:(data) => {
              if(data.code==200){
                this.popNum = data.data;
              }
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });
        },

        //人口统计非实时初始化分调用
        tourPopulationNum(type,time){
          this.$http.request({
            method:'get',
            params:{
              date:time,
              code:this.scenicCode,
              isRealtime:type
            },
            url:URL.queryTourismDemographic,
            success:(data) => {
              if(data.code==200){
                this.popNum = data.data;
              }
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });
        },

       //非实时下分，日，月时间选择后或地图点击后调用流入流出
        tourqueryTourEnterNum(){
          let params={
            date:this.dateData,
            code:this.scenicCode,
            isRealtime:this.isType
          }
          this.$http.request({
            method:'get',
            params:params,
            url:URL.queryTourEnterLeaveNum,
            success:(data) => {
              if(data.code==200){
                this.enterNum = data.data;
              }
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });

        },
      //流入流出人口统计
        queryTourEnterNum(){
          let params={};
            if(this.isType){
            params={
              date:'',
              code:this.scenicCode,
              isRealtime:this.isType
            }
          }else {
              params={
                date:this.dateData,
                code:this.scenicCode,
                isRealtime:this.isType
              }
            }

          this.$http.request({
            method:'get',
            params:params,
            url:URL.queryTourEnterLeaveNum,
            success:(data) => {
              if(data.code==200){
                this.enterNum = data.data;
              }
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });

        },
        //非实时日月分切换重点人调用
        tourKeyPople(time){
          let flag='';
          if(this.scenicCode=='大雁塔'||this.scenicCode==''){
            flag=0
          }else {
            flag=1;
          }
          this.$http.request({
            method:'get',
            params:{
              date:time,
              flag:flag,
              code:this.scenicCode,
              isRealtime:this.isType
            },
            url:URL.queryMapKeyPeopleCount,
            success:(data) => {
              if(data.code==200){
                this.keypoples = data.data;
              }
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });
        },
        //流入流出非实时切换
        enterOrOutNum(type,time){
          let params={
            date:time,
            code:this.scenicCode,
            isRealtime:type
          }
          this.$http.request({
            method:'get',
            params:params,
            url:URL.queryTourEnterLeaveNum,
            success:(data) => {
              if(data.code==200){
                this.enterNum = data.data;
              }
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });
        }
      },
      created(){


      },
      mounted(){
        this.istype=this.$route.query.istype;
        if(this.$route.query.date!=undefined&&this.$route.query.date!=''){
          this.backQueryPopulationNum()
          if(this.istype=="tours"){
            this.backKeyPople();
            this.backQueryRealTourEnterNum();
          }

        }else {
          this.queryPopulationNum()
          if(this.showFlowNum &&this.istype=="tours"){
            this.keyPople()
            this.queryTourEnterNum()
        }
      }

      }

  }
</script>

<style scoped>
  #population-num{
    width: 400px;
  }
  .total-box{
    display: flex;
    width: 100%;
  }
  .total-num{
    width: 100%;
    padding: 15px 0px 15px 10px;
  }
  .total-num span{
    display: inline-block;
  }
  .icon-list{
    margin-right: 10px;
    vertical-align: middle;
  }
  .icon-list i{
    color: #077CE7;
    font-size: 35px;
  }
  .num-icon{
    display: inline-block;
    height: 100%;
    line-height: 65px;
    margin-right: 5px;
    margin-left: 5px;
  }
  .num-icon-import{
    line-height: 82px;
  }
  .num-icon i{
    font-size: 30px;
  }
  .num-details .num-icon i{
    font-size: 21px;
    padding: 4px;
  }
  .num-icon-val{
    display: inline-block;
    position: relative;
    width: 100%;
  }
  .num-middle{
    width: 100%;
    height: 50px;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
  }
  .num-list{
    background:#EBECED ;
    display: flex;
  }
  .num-list:nth-child(2){
    margin-top: 8px;
  }
  .num-list-text{
    width: 50%;
    display: flex;
  }
  .flow-list{
     flex-grow: 1;
  }
  .flow-list .iconfont{
    margin-right: 5px;
    margin-left: 5px;
  }
  .icon-zhongxinchengquchangzhurenkouguimo{
    color: #fff;
    background: #af6aed;
    border-radius: 5px;
  }
  .icon-zanzhurenyuan{
    color: #fff;
    background: #f5a623;
    border-radius: 5px;
  }
  .icon-zongzhi-ren-liudongrenkou{
    color: #fff;
    background: #11ce6d;
    border-radius: 5px;
  }
  .icon-APIjieru{
    font-size: 20px;
    color: #1298de;
  }
  .icon-APIshuchu1{
    font-size: 20px;
    color: #e7609e;
  }
  .icon-zhongdianren{
    color: #e8422c;
  }
  .num-val{
    font-size: 26px;
    color: #818283;
  }
  .num-list-val{
   /* display: inline-block;*/
    font-size: 14px;
    color: #818283;
   /* overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 60px;*/
  }


</style>
