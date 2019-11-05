<template>
  <Card  id="behaviour-trait">
    <div class="modal-title">
      <span>常驻人口行为特征</span>
    </div>
   <div class="behaviour-list">
     <div class="list-box">
       <div class="address clearFix">
         <div class="addresslist">
           <i class="iconfont icon-taiyang"></i>
         </div>
         <div class="addresslist">
           <div class="list-day">白天常驻地</div>
           <div><Button type="primary" size="small"  @click="JumpDay">查看详情</Button></div>
         </div>
       </div>
       <div class="address clearFix">
         <div class="addresslist">
           <i class="iconfont icon-tianqitubiao_qing-yewan"></i>
         </div>
         <div class="addresslist">
           <div class="list-day">夜间常驻地</div>
           <div><Button type="warning" size="small" @click="JumpNight">查看详情</Button></div>
         </div>
       </div>
     </div>
   </div>
  </Card>
</template>

<script>
    export default {
      name: "behaviour",
      data(){
        return{
          taskId:"",
          sourcePie :[],
          targetPie :[],
          oldTimes:'',
          oldTypes:'',
        }
      },
      props:[
        'dateData',
        'areaCode',
        'areaName',
        'isCity'
      ],
      methods:{
        //获取已选时间状态
        getOldStutase(type,time){
          this.oldTypes=type;
          this.oldTimes=time;
        },
        //跳转白天常驻
        JumpDay(){
          this.$router.push({
            name: 'dayPermanent',
            query:{
              flag:0,
              date:this.dateData,
              code:this.areaCode,
              oldtype:this.oldTypes,
              oldtime:this.oldTimes,
              areaName:this.areaName,
              isCity:this.isCity
            }

          });
        },
        //跳转夜间常驻
        JumpNight(){
          this.$router.push({
            name: 'nightPermanent',
            query:{
              flag:1,
              date:this.dateData,
              code:this.areaCode,
              oldtype:this.oldTypes,
              oldtime:this.oldTimes,
              areaName:this.areaName,
              isCity:this.isCity
            }
          });
        },
      },

    }
</script>

<style scoped>
  #behaviour-trait{
    width: 400px;
    margin-top: 10px;
    height: 100%;
  }
  #behaviour-trait >>> .ivu-card-body{
    height: 100%;
  }
  #behaviour-trait >>>.behaviour-list{
    height: calc(100% - 32px);
  }
  .behaviour-list{
    position: relative;
  }
  .list-box{
    display: flex;
    width: 100%;
    height: 100px;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
  }
  .address{
    flex-grow: 1;
  }
  .addresslist{
    height: 100px;
    float: left;
  }
  .address .addresslist:first-child{
    width: 100px;
    line-height:100px;
    text-align: center;
  }
  .address .addresslist:nth-child(2){
    text-align: center;
  }
  .address .addresslist:first-child i{
    font-size: 50px;
    color: #5c6f84;
  }
  .list-day{
    margin-top: 25px;
    margin-bottom: 5px;
  }
  .address .addresslist:nth-child(3) button{
    float: right;
    margin-top: 10px;
  }
  .address .addresslist i.icon-taiyang{
    font-size: 60px;
    color: #f90;
  }
</style>
