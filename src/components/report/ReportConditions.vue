<template>
    <div id="report-conditions">
      <Modal
        v-model="getReportConditions"
        title="报告条件筛选"
        width="1200"
        id="preview-report-modal">
        <div id="conditions">
          <li class="cls-condition" v-for="(item,index) in conditionslist" :key="index">
            <span class="cls-check-info">
              <Checkbox @on-change="getCheckInfo($event,item.id)">{{item.title}}</Checkbox>
            </span>
           <div class="cls-content" v-for="(items,indexs) in item.list" :key="indexs">
             <span class="cls-imgtitle">{{items.content}}:</span>
             <Button type="primary" size="small" style="float: right" @click="showConditionModal(item.flag,items.id,items.origin,items.people,items.region)">条件选择</Button>
            <span class="cls-check-condition">
                      <span class="check-conditions" >已选条件:</span>
                      <span>{{items.conditions==undefined?"未选择任何条件":items.conditions}}</span>
             </span>
           </div>
          </li>
        </div>
        <div slot="close" @click="cancelMyCheck"><Icon type="ios-close"></Icon></div>
        <div slot="footer" style="margin-right: 25px;">
          <Button type="text" @click="cancelMyCheck">取消</Button>
          <Button type="primary" @click="submitMyCheck">确定</Button>
        </div>
        <Modal
          v-model="isConditionsModal"
          title="条件筛选"
          width="700"
          >
          <div id="conditions-list">
            <condition-of-time ref="conditionoftime" :sendFlag="sendFlag"></condition-of-time>
            <condition-of-area ref="conditionofarea" :sendFlag="sendFlag" v-if="isRegion==1?true:false"></condition-of-area>
            <condition-of-type ref="conditionoftype" :sendFlag="sendFlag" v-if="isPople==1?true:false"></condition-of-type>
            <condition-of-source  ref="conditionofsource" :sourceMulti="sourceMulti"  v-if="isOrigin==1?true:false"></condition-of-source>
          </div>
          <div slot="close" @click="cancelMyChooseSubmit"><Icon type="ios-close"></Icon></div>
          <div slot="footer" style="margin-right: 25px;">
            <Button  size="small" class="btn-primary" @click="resetCheck()">重置</Button>
            <Button type="primary"  size="small" @click="myChooseSubmit">确定</Button>
          </div>

        </Modal>
      </Modal>
    </div>
</template>

<script>
 import {URL} from "../../../api/urlsConfig";
 import ConditionOfArea from "./ConditionOfArea"
 import ConditionOfTime from "./ConditionOfTime"
 import ConditionOfType from "./ConditionOfType"
 import ConditionOfSource from "./ConditionOfSource"
 export default {
        name: "report-conditions",
      data() {
        return{
          isConditionsModal:false,
          conditionslist:[],
          checkids:[],
          backIds:"",
          sendid:"",
          sendFlag:"",     //人口 0，旅游 1标识
          sourceMulti:false,  // 级联多选标识 true
          backinfo:[],
          backCodes:[],
          isOrigin:"",
          isPople:"",
          isRegion:"",
          isSend:false,
        }
      },
      components:{
        ConditionOfArea,
        ConditionOfTime,
        ConditionOfType,
        ConditionOfSource
      },
      computed: {
        //弹窗显示状态改变
        getReportConditions: {
          get: function () {
            if(this.$store.state.reportCondition){
              this.getNewReportCondition()
            }
            return this.$store.state.reportCondition;
          },
          set: function () {
            this.$store.commit("showReportConditionModal");
          }
        },
      },
      created(){

      },

      mounted(){

      },

      methods:{

        //条件选择页面关闭
        cancelMyChooseSubmit(){
        this.isConditionsModal=false;
        this.resetCheck()
        },
        //条件勾选界面确认提交
        myChooseSubmit(){
          this.backinfo=[];
          if(this.$refs.conditionoftime.times==""){
              this.$Message.warning("请选择时间！");
              return;
          }
          if(this.isRegion!="0"){
            if(this.$refs.conditionofarea.areaData.length==0){
              this.$Message.warning("请选择区域！");
              return;
            }
          }
          if(this.isPople!="0"){
            if(this.$refs.conditionoftype.selectItem.length==0){
              this.$Message.warning("请选择人口类别！");
              return;
            }
          }
          //回填信息
          this.backinfo.push({
            id:this.sendid,
            time:this.$refs.conditionoftime.sendData.description,
            areas:this.isRegion=="1"?this.$refs.conditionofarea.selectAreaName.join(","):"暂无",
            dayOrNight:this.isRegion=="1"?this.$refs.conditionofarea.day:"暂无",
            poptype:this.isPople=="1"?this.$refs.conditionoftype.selectItem[0].name:"暂无",
            originOrBelong:this.isOrigin=="1"?this.$refs.conditionofsource.showSource=='0' ? "来源地":"归属地":"暂无",
            originOrBelongCode:this.isOrigin=="1"?this.$refs.conditionofsource.placeName:"暂无"
          })
          //选择后的code 0人口，1旅游
          if(this.sendFlag=="0"){
            this.backCodes.push({
              id:this.sendid,
              date:this.$refs.conditionoftime.sendData.id,
              cityOrDev:this.isRegion=="1"?this.$refs.conditionofarea.selectName=="kaifa" ? '1':'0':"",
              cityCode:this.isRegion=="1"?this.$refs.conditionofarea.areaData.join(","):"",
              dayOrNight:this.isRegion=="1"?this.$refs.conditionofarea.day=="白天" ? "0":"1":"",
              peopleType:this.isPople=="1"?this.$refs.conditionoftype.selectItem[0].code:"",
              originOrBelong:this.isOrigin=="1"?this.$refs.conditionofsource.showSource:"",
              originOrBelongCode:this.isOrigin=="1"?(this.$refs.conditionofsource.showSource=='1' ? this.$refs.conditionofsource.belongValue.join(',') :this.$refs.conditionofsource.sourceValue.join(',')):"",
            })
          }else if(this.sendFlag=="1"){
            this.backCodes.push({
              id:this.sendid,
              date:this.$refs.conditionoftime.sendData.id,
              areaCode:this.isRegion=="1"?(this.$refs.conditionofarea.areaData=="all" ? this.$refs.conditionofarea.allViewId : this.$refs.conditionofarea.areaData):"",
              isBelong:this.isOrigin=="1"?this.$refs.conditionofsource.showSource:"",
              obList:this.isOrigin=="1"?(this.$refs.conditionofsource.showSource=='1' ? this.$refs.conditionofsource.belongValue :this.$refs.conditionofsource.sourceValue):"",
              peopleFrom:this.isOrigin=="1"?((this.$refs.conditionofsource.belongValue==''&&this.$refs.conditionofsource.showSource=='1')||(this.$refs.conditionofsource.sourceValue==''&&this.$refs.conditionofsource.showSource=='0') ? "0":"1"):"" ,//人口来源模块 没值0有值1
              type:"5",
            })
          }
       // console.log(this.backCodes)
         let backInfo=[];
          backInfo.push({
            id:this.backinfo[0].id,
            info:"时间："+this.backinfo[0].time+"; "+"区域选择："+this.backinfo[0].areas+" "+this.backinfo[0].dayOrNight+"; "+"人口类别："+this.backinfo[0].poptype+"; "+"人口来源："+this.backinfo[0].originOrBelong+" "+this.backinfo[0].originOrBelongCode
          })
            this.refreshConditionModel(backInfo)
            this.backIds="";
            this.isConditionsModal=false;
            this.resetCheck()
        },

        //更新条件筛选后的筛选界面
        refreshConditionModel(data){
          let tepData=this.conditionslist;
          for(let i=0;i<tepData.length;i++){
            for (let j=0;j<tepData[i].list.length;j++){
              if(tepData[i].list[j].id==data[0].id){
                tepData[i].list[j].conditions=data[0].info;
              }
            }
          }
        },
        //获取选中条件id
        getCheckInfo(e,id){
          var tepData=this.conditionslist;
          if(e){
            for(var i=0;i<tepData.length;i++){
             if(tepData[i].id==id){
               tepData[i].check=true;
             }
            }
            this.checkids.push(id);
          }else {
            for(var i=0;i<tepData.length;i++){
              if(tepData[i].id==id){
                tepData[i].check=false;
              }
            }
            this.checkids=_.pull(this.checkids,id);
          }
        },

        //获取新增报告条件数据
        getNewReportCondition(){
          this.$http.request({
            method:'get',
            params:{},
            url:URL.reportconditionslist,
            success:(data) => {
            if(data.code==200){
               this.conditionslist=data.data
             }
            },
            error : (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });

        },
       //条件页面展示
        showConditionModal(flag,id,origin,people,region){
         //获取对应显示级别
          this.isOrigin=origin;   //1显示0不显示
          this.isRegion=region;
          this.isPople=people;
          //获取对应时间列表
          this.$refs.conditionoftime.getMyTimeOption(flag)
          this.isConditionsModal=true;
          this.sendid=id;
          this.sendFlag=flag;
        },

        //重置
        resetCheck(){
          this.$refs.conditionoftime.times="";
          if(this.isRegion=="1"){
            this.$refs.conditionofarea.areaData =[];
            this.$refs.conditionofarea.day="白天"
            this.$refs.conditionofarea.resetLabels('allSelect',this.$refs.conditionofarea.labels);
            this.$refs.conditionofarea.resetLabels('allSelectCountry',this.$refs.conditionofarea.areas);
            this.$refs.conditionofarea.resetLabels('allSelectView',this.$refs.conditionofarea.viewAreas);
          }
          if(this.isPople=="1"){
            this.$refs.conditionoftype.resetPeopleLabel();
          }
         if(this.isOrigin=="1"){
           this.$refs.conditionofsource.sourceValue = [];
           this.$refs.conditionofsource.belongValue = [];
           this.$refs.conditionofsource.showSource="0";
         }
        },

        //获取新增报告条件数据
        getNewReportCondition(){
        this.$http.request({
          method:'get',
          params:{},
          url:URL.reportconditionslist,
          success:(data) => {
          if(data.code==200){
             this.conditionslist=data.data
           }
          },
          error : (data) => {
            this.$Message.warning('请求数据失败！');
          }
        });
      },
       //获取新增报告条件数据
       getNewReportCondition(){
        this.$http.request({
          method:'get',
          params:{},
          url:URL.reportconditionslist,
          success:(data) => {
          if(data.code==200){
             this.conditionslist=data.data
           }
          },
          error : (data) => {
            this.$Message.warning('请求数据失败！');
          }
        });
       },
        //提交前的校验
        checkOfSubmit(){
          if(this.checkids.length==0){
            this.$Message.warning('新增报告条件不能为空');
            this.$store.commit("showReportConditionModal",true);
            this.isSend=false;
          }else {
            let _this=this;
            let tepData=_this.conditionslist;
             for(let i=0;i<tepData.length;i++){
              if(tepData[i].check){
               for(let j=0;j<tepData[i].list.length;j++){
                 if(tepData[i].list[j].conditions==undefined){
                   _this.isSend=false;
                  return _this.$Message.warning('请确保所勾选项的所有条件已经选');
                 }else {
                   _this.isSend=true;
                 }
               }
              }
            }
          }
        },
        //确认提交
        submitMyCheck(){
          //校验
          this.checkOfSubmit()
          if(this.isSend){
            //组装参数
            let tepParam=[];
            let _this=this;
            for(let n=0;n<_this.conditionslist.length;n++){
              for (let i=0;i<_this.checkids.length;i++){
                if(_this.conditionslist[n].id==_this.checkids[i]){
                  for(let j=0;j<_this.conditionslist[n].list.length;j++){
                    for(let k=0;k<_this.backCodes.length;k++){
                      if(_this.conditionslist[n].list[j].id==_this.backCodes[k].id){
                        tepParam.push({
                          id:_this.conditionslist[n].id,
                          child:_this.backCodes[k]
                        })
                      }
                    }
                  }
                }
              }
            }
            this.$http.request({
              method:'get',
              params:{
                id:tepParam
              },
              url:URL.queryreportconditions,
              success:(data) => {
                if(data.code==200){
                  //初始化
                  this.conditionslist=[];
                  this.checkids=[];
                  this.backCodes=[];
                  this.isSend=false;
                  this.$store.commit("showReportConditionModal",false);
                  this.$Message.success('新增报告成功！');
                }
              },
              error : (data) => {
                this.$Message.warning('请求数据失败！');
              }
            });
          }
        },
        //取消 关闭窗口
        cancelMyCheck(){
          this.conditionslist=[];
        },
      },
    }
</script>

<style scoped>
#conditions{
  width: 100%;
  padding:10px;
  height:700px;
  overflow:hidden;
  overflow-y: auto;
}
#conditions-list{
  width: 100%;
  padding:10px;
  height:500px;
  overflow:hidden;
  overflow-y: auto;
}
.cls-condition{
  width:100%;
  border-bottom:1px dashed #869891;
}
.cls-condition span{
  display: block;
}
.cls-check-info{
  width: 100%;
  padding:0px 5px;
  height:30px;
  background:#e4e7ea;
  margin:5px 0px;
  line-height: 30px;
  color: #0C0C0C;
  font-size: 20px;
}
.cls-img img{
  text-align: center;
  width:90%;
  height:300px;
  display: block;
  margin-bottom: 5px;
}
.cls-check-condition span{
  margin:10px 0px;
  color: #96aeb4;
  font-size: 14px;
  display: inline-block !important;
}
.cls-imgtitle{
  height:15px;
  line-height: 15px;
  color: #211d08;
  font-size: 14px;
  display: inline-block!important;
}
.check-conditions{
  color: #211d08 !important;
  font-size: 15px;
}
.cls-conditions-lists{
  width: 100%;
  padding:0px 8px;
}
.list-title{
  margin:5px 0px;
  width: 100%;
  display: inline-block;
  padding:0px 15px;
  height: 15px;
  line-height: 15px;
  color: #0f161a;
  font-size: 14px;
  /*border-radius:5px;*/
  background: #ececec;
}
.fls-conditions{
  width: 100%;
  padding:10px;
  height: 170px;
  background:#ececec;
  box-shadow: 0px 3px 5px #e0e7ee, -3px 0px 5px #e0e7ee, 0px -3px 5px #e0e7ee,  3px 0px 5px #e0e7ee;
}
.cls-check{
  display: inline-block!important;
  width: 15px;
  height: 15px;
  margin-right: 5px;
  border:1px solid #d5d8de;
}
.Currentsinglecheck{
  width: 15px;
  height: 15px;
  margin-right: 15px;
  border:1px solid #d5d8de;
  background:url("../../assets/img/cli.png") no-repeat;
}
#conditions-list>>>.checkBoxStyle {
  display: inline-block;
  height: 22px;
  line-height: 22px;
  border-radius: 3px;
  border: 1px solid #C0C4CC;
  margin: 2px 15px 2px 0;
  padding: 0 8px;
  font-size: 12px;
  vertical-align: middle;
  cursor: pointer;
  overflow: hidden;
  background: #f7f7f7;
}
#conditions-list>>>.label-active {
  color: #208cfa;
  background: #d5e0e9;
  border-color: #208cfa;
}
#conditions-list>>> .btn-primary{
  background: #6a87a1;
  border-color: #6a87a1;
  color: #fff;
}
#conditions-list>>> .btn-active {
  color: #fff;
  background-color: #2d8cf0;
  border-color: #2d8cf0;
}
</style>
