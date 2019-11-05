<template>
    <div id="report-conditions">
      <Modal
        v-model="getReportConditions"
        title="报告条件筛选"
        width="1200"
        id="preview-report-modal">
        <div id="conditions">
          <div class="report-title" style="width: 50%;margin:0 auto;margin-bottom: 20px">
            <span class="report-main">
              报告标题： <Input style="width: 300px" v-model="reportTitle" @on-change="reportTitleTest"/>
            </span>
            <span style="display: block;color: #d90000;font-size: 10px;text-align: center;width: 300px" v-show="isErroInfo">{{erroText}}</span>
          </div>
          <li class="cls-condition" v-for="(item,index) in conditionslist" :key="index">
            <span class="cls-check-info">
              <Checkbox @on-change="getCheckInfo($event,item.id)">{{item.title}}</Checkbox>
            </span>
           <div class="cls-content" v-for="(items,indexs) in item.list" :key="indexs">
             <span class="cls-imgtitle">{{items.content}}:</span>
             <Button type="primary" size="small" style="float: right" @click="showConditionModal(item.flag,items.id,items.origin,items.people,items.region,items.flager,items.sarea,)">条件选择</Button>
            <span class="cls-check-condition">
                      <span class="check-conditions" >已选条件:</span>
                      <span>{{items.conditions==undefined?"未选择任何条件":items.conditions}}</span>
             </span>
           </div>
          </li>
        </div>
        <div slot="close" @click="cancelMyCheck"><Icon type="ios-close"></Icon></div>
        <div slot="footer" style="margin-right: 25px;">
          <Button type="primary" @click="submitMyCheck">确定</Button>
        </div>
        <Modal
          v-model="isConditionsModal"
          title="条件筛选"
          width="700"
          >
          <div id="conditions-list">
            <condition-of-time ref="conditionoftime" :sendFlag="sendFlag":sendid="sendid"></condition-of-time>
            <condition-of-area ref="conditionofarea" :sendFlag="sendFlag" v-if="isRegion==1?true:false"></condition-of-area>
            <condition-of-type ref="conditionoftype" :sendFlag="sendFlag" v-if="isPople==1?true:false" :typeMulti="typeMulti"></condition-of-type>
            <condition-of-source  ref="conditionofsource" :sourceMulti="sourceMulti"  v-if="isOrigin==1?true:false" :isFlager="isFlager"></condition-of-source>
            <conditon-of-sarea ref="conditionofsarea" v-if="isSarea==undefined?false:true"></conditon-of-sarea>
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
 import ConditonOfSarea from "./ConditionOfSarea"
 export default {
   name: "report-conditions",
   data() {
     return {
       isConditionsModal: false,
       conditionslist: [],
       checkids: [],
       backIds: "",
       sendid: "",
       typeMulti:false,//人口类型多选
       reportTitle: "",
       sendFlag: "",     //人口 0，旅游 1标识
       sourceMulti: false,  // 级联多选标识 true
       backinfo: [],
       backCodes: [],
       isErroInfo:false,
       erroText:'',
       isOrigin: "",
       isPople: "",
       isRegion: "",
       isSarea: '',
       isFlager: '',
       isSend: false,
     }
   },
   components: {
     ConditionOfArea,
     ConditionOfTime,
     ConditionOfType,
     ConditionOfSource,
     ConditonOfSarea
   },
   computed: {
     //弹窗显示状态改变
     getReportConditions: {
       get: function () {
         if (this.$store.state.reportCondition) {
           this.getNewReportCondition()
         }
         return this.$store.state.reportCondition;
       },
       set: function () {
         this.$store.commit("showReportConditionModal");
       }
     },
   },
   created() {

   },

   mounted() {

   },

   methods: {

     //条件选择页面关闭
     cancelMyChooseSubmit() {
       this.isConditionsModal = false;
       this.resetCheck()
     },

     reportTitleTest(){
       if(this.reportTitle.includes(" ")){
         this.isErroInfo=true;
         this.erroText='报告名称不能含有空格'
         this.isSend=false;
       }else if(this.reportTitle.length>20){
         this.isErroInfo=true;
         this.erroText='报告名称不能超过20个字节'
         this.isSend=false;
       }
       else {
         this.isErroInfo=false;
         this.erroText='';
         this.isSend=true;
       }
     },
     //条件勾选界面确认提交
     myChooseSubmit() {
       this.backinfo = [];
       if (this.$refs.conditionoftime.formValidate.time == "") {
         this.$Message.warning("请选择时间！");
         return;
       }
       if (this.$refs.conditionoftime.timeId == "") {
         this.$Message.warning("请选择时间类型！");
         return;
       }
       if (this.isRegion != "0") {
         if (this.$refs.conditionofarea.areaData.length == 0) {
           this.$Message.warning("请选择区域！");
           return;
         }

       }
       if(this.sendFlag==0){
         if(this.$refs.conditionofarea.day==''){
           this.$Message.warning("请选择划分标准！");
           return;
         }
       }
       if (this.isPople != "0") {
         if (this.$refs.conditionoftype.selectItem.length == 0) {
           this.$Message.warning("请选择人口类别！");
           return;
         }
       }
       let ptypeName=[];
       if(this.isPople == "1" &&this.typeMulti==false){

         ptypeName=this.$refs.conditionoftype.selectItem[0].name;
       }else if(this.isPople == "1"&&this.typeMulti==true){
         for(let i=0; i<this.$refs.conditionoftype.selectItem.length;i++){
           ptypeName.push(this.$refs.conditionoftype.selectItem[i].name)
         }
         ptypeName= ptypeName.join(",")
       }
       //回填信息
       this.backinfo.push({
         id: this.sendid,
         time: this.$refs.conditionoftime.formValidate.time,
         timeType: this.$refs.conditionoftime.timeId == 1 ? "（天）" : "（月）",
         areas: this.isRegion == "1" ? this.$refs.conditionofarea.selectAreaName.join(",") : "暂无",
         dayOrNight: this.isRegion == "1" ? this.$refs.conditionofarea.day : "暂无",
         poptype: this.isPople == "1" ? ptypeName : "暂无",
         originOrBelong: this.isOrigin == "1" ? this.isFlager== '0' ? "来源地" : "归属地" : "暂无",
         Sarea:this.isSarea != undefined?"(特殊区域：新疆 西藏)":"",
         // originOrBelongCode: this.isOrigin == "1" ? this.$refs.conditionofsource.placeName : "暂无"
       })
       //重复添加条件时候替换原有的条件(从已有条件中删除掉)
       if(this.backCodes.length!=0){
         for(let i=0;i< this.backCodes.length;i++){
           if(this.backCodes[i].id==this.sendid){
             this.backCodes.splice(i,1)
           }
         }
       }
       //选择后的code 0人口，1旅游
       if (this.sendFlag == "0") {
         var ptype=[];
         if(this.isPople == "1" &&this.typeMulti==false){
           ptype=this.$refs.conditionoftype.selectItem[0].code;
         }else if(this.isPople == "1"&&this.typeMulti==true){
           for(let i=0; i<this.$refs.conditionoftype.selectItem.length;i++){
             ptype.push(this.$refs.conditionoftype.selectItem[i].code)
           }
           ptype= ptype.join(";")
         }
         this.backCodes.push({
           id: this.sendid,
           type: this.sendFlag,
           times: this.$refs.conditionoftime.formValidate.time,
           timeType: this.$refs.conditionoftime.timeId,
           cityOrDev: this.isRegion == "1" ? this.$refs.conditionofarea.selectName == "kaifa" ? '1' : '0' : "",
           area: this.isRegion == "1" ? this.$refs.conditionofarea.areaData.join(";") : "",
           dayOrNight: this.isRegion == "1" ? this.$refs.conditionofarea.day == "白天" ? "0" : "1" : "",
           ptype: this.isPople == "1"? ptype : "",
           // ptype: this.isPople == "1" ? this.$refs.conditionoftype.selectItem[0].code : "",
           stype: this.isOrigin == "1" ? this.isFlager : "",
           homeArea: this.isSarea != undefined ? this.$refs.conditionofsarea.sareaId.join(",") : ""
         })
       } else if (this.sendFlag == "1") {
         let ptype=[];
         if(this.isPople == "1" &&this.typeMulti==false){
            ptype=this.$refs.conditionoftype.selectItem[0].code;
         }else if(this.isPople == "1"&&this.typeMulti==true){
           for(let i=0; i<this.$refs.conditionoftype.selectItem.length;i++){
             ptype.push(this.$refs.conditionoftype.selectItem[i].code)
           }
           ptype= ptype.join(";")
         }
         this.backCodes.push({
           id: this.sendid,
           type: this.sendFlag,
           times: this.$refs.conditionoftime.formValidate.time,
           timeType: this.$refs.conditionoftime.timeId,
           area: this.isRegion == "1" ? (this.$refs.conditionofarea.areaData == "all" ? this.$refs.conditionofarea.allViewId.join(",") : this.$refs.conditionofarea.areaData.join(",")) : "",
           // dayOrNight: this.isRegion == "1" ? this.$refs.conditionofarea.day == "白天" ? "0" : "1" : "",
           // cityOrDev: this.isRegion == "1" ? this.$refs.conditionofarea.selectName == "kaifa" ? '1' : '0' : "",
           dayOrNight:'',
           cityOrDev:'',
           ptype: this.isPople == "1"? ptype : "",
           stype: this.isOrigin == "1" ? this.isFlager : "",
           homeArea: this.isSarea != undefined ? this.$refs.conditionofsarea.sareaId.join(",") : ""
         })
       }
       let backInfo = [];
       backInfo.push({
         id: this.backinfo[0].id,
         info: "时间：" + this.backinfo[0].time + "" + this.backinfo[0].timeType + "; " + "区域选择：" + this.backinfo[0].areas + " " + this.backinfo[0].dayOrNight + "; " + "人口类别：" + this.backinfo[0].poptype + "; " + "人口来源：" + this.backinfo[0].originOrBelong + " " + this.backinfo[0].Sarea
       })
       this.refreshConditionModel(backInfo)
       this.backIds = "";
       this.isConditionsModal = false;
       this.resetCheck()
     },

     //更新条件筛选后的筛选界面
     refreshConditionModel(data) {
       let tepData = this.conditionslist;
       for (let i = 0; i < tepData.length; i++) {
         for (let j = 0; j < tepData[i].list.length; j++) {
           if (tepData[i].list[j].id == data[0].id) {
             tepData[i].list[j].conditions = data[0].info;
           }
         }
       }
     },
     //获取选中条件id
     getCheckInfo(e, id) {
       var tepData = this.conditionslist;
       if (e) {
         for (var i = 0; i < tepData.length; i++) {
           if (tepData[i].id == id) {
             tepData[i].check = true;
           }
         }
         this.checkids.push(id);
       } else {
         for (var i = 0; i < tepData.length; i++) {
           if (tepData[i].id == id) {
             tepData[i].check = false;
           }
         }
         this.checkids = _.pull(this.checkids, id);
       }
     },

     //获取新增报告条件数据
     getNewReportCondition() {
       this.$http.request({
         method: 'get',
         params: {},
         url: URL.reportconditionslist,
         success: (data) => {
           if (data.code == 200) {
             this.conditionslist = data.data
           }
         },
         error: (data) => {
           this.$Message.warning('请求数据失败！');
         }
       });

     },
     //条件页面展示
     showConditionModal(flag, id, origin, people, region, flager, sarea) {
       //获取对应显示级别
       this.isOrigin = origin;   //1显示0不显示
       this.isRegion = region;
       this.isPople = people;
       this.isSarea = sarea;    //t特殊区域
       //对应显示子模块
       this.isFlager = flager;
       this.isConditionsModal = true;
       this.sendid = id;
       this.$refs.conditionoftime.handleChangeTime(id)
       if(id=="prksl_content_002"||id=="prksl_content_003"){
         this.typeMulti=true;
       }else {
         this.typeMulti=false;
       }
       this.sendFlag = flag;
     },

     //重置
     resetCheck() {
       // if(this.sendid!='prksl_content_003'){
       // this.$refs.conditionoftime.formValidate.time = '';
       // this.$refs.conditionoftime.timeId ='1';
       // }
       if (this.isRegion == "1") {
         this.$refs.conditionofarea.areaData = [];
         this.$refs.conditionofarea.day = ""
         this.$refs.conditionofarea.resetLabels('allSelect', this.$refs.conditionofarea.labels);
         this.$refs.conditionofarea.resetLabels('allSelectCountry', this.$refs.conditionofarea.areas);
         this.$refs.conditionofarea.resetLabels('allSelectView', this.$refs.conditionofarea.viewAreas);
       }
       if (this.isPople == "1") {
         this.$refs.conditionoftype.resetPeopleLabel();
       }
       if (this.isOrigin == "1") {
         this.$refs.conditionofsource.sourceValue = [];
         this.$refs.conditionofsource.belongValue = [];
         this.$refs.conditionofsource.showSource = "";
       }
       // if (this.isSarea != undefined) {
       //   this.$refs.conditionofsarea.sareaId = ""
       // }
     },

     //获取新增报告条件数据
     getNewReportCondition() {
       this.$http.request({
         method: 'get',
         params: {},
         url: URL.reportconditionslist,
         success: (data) => {
           if (data.code == 200) {
             this.conditionslist = data.data
           }
         },
         error: (data) => {
           this.$Message.warning('请求数据失败！');
         }
       });
     },
     //获取新增报告条件数据
     getNewReportCondition() {
       this.$http.request({
         method: 'get',
         params: {},
         url: URL.reportconditionslist,
         success: (data) => {
           if (data.code == 200) {
             this.conditionslist = data.data
           }
         },
         error: (data) => {
           this.$Message.warning('请求数据失败！');
         }
       });
     },
     //提交前的校验
     checkOfSubmit() {
       if (this.reportTitle == "") {
         this.$Message.warning('新增报告名称不能为空');
         this.isSend = false;
         return
       }
       if (this.checkids.length == 0) {
         this.$Message.warning('新增报告条件不能为空');
         this.$store.commit("showReportConditionModal", true);
         this.isSend = false;
         return
       } else {
         let _this = this;
         let tepData = _this.conditionslist;
         for (let i = 0; i < tepData.length; i++) {
           if (tepData[i].check) {
             for (let j = 0; j < tepData[i].list.length; j++) {
               if (tepData[i].list[j].conditions == undefined) {
                 _this.isSend = false;
                 return _this.$Message.warning('请确保所勾选项的所有条件已经选');
               } else {
                 _this.isSend = true;
               }
             }
           }
         }
       }
     },
     //确认提交
     submitMyCheck() {
       //校验
       this.checkOfSubmit()
       let reportTemplate = {};
       if (this.isSend) {
         //组装参数
         let condition = [];
         let tep=[];
         let _this = this;
         for (let n = 0; n < _this.conditionslist.length; n++) {
           for (let i = 0; i < _this.checkids.length; i++) {
             if (_this.conditionslist[n].id == _this.checkids[i]) {
               for (let j = 0; j < _this.conditionslist[n].list.length; j++) {
                 for (let k = 0; k < _this.backCodes.length; k++) {
                   if (_this.conditionslist[n].list[j].id == _this.backCodes[k].id) {
                     _this.backCodes[k].tid = _this.conditionslist[n].id
                     condition.push(_this.backCodes[k])
                   }
                 }
               }
             }
           }
         }
         // map是用来过渡的  //参数重组
         // let map = new Map();
         // let resultData=[];
         // for(let i=0;i<tepParam.length;i++){
         //   if(map.get(tepParam[i].id)){
         //     let arrayChild = map.get(tepParam[i].id);
         //     arrayChild.push(tepParam[i].child);
         //   }else{
         //     let array = [];
         //     array.push(tepParam[i].child);
         //     map.set(tepParam[i].id,array);
         //     resultData.push({"id": tepParam[i].id,"child": array})
         //   }
         // }
         //去重
         condition=condition.reduce((item,next)=>{
           tep[next.id]?'':condition[next.id]=true&&item.push(next);
           return item
         },[])

         reportTemplate = {
           rname: this.reportTitle,
           list: condition
         };
       this.$http.request({
         method: 'post',
         data: reportTemplate,
         url: URL.insertReportTerm,
         success: (data) => {
           if (data.code == 200) {
             //初始化
             this.conditionslist = [];
             this.checkids = [];
             this.backCodes = [];
             this.isSend = false;
             this.reportTitle = '';
             this.$store.commit("showReportConditionModal", false);
             this.$Message.success('新增报告成功！');
             //刷新列表
             let parms={
               current:1,
               pageSize:15,
             }
             this.$emit("getReportData",parms)
           }
         },
         error: (data) => {
           this.$Message.warning('请求数据失败！');
         }
       });
       }
     },
   //取消 关闭窗口
   cancelMyCheck() {
     this.isErroInfo=false;
     this.erroText='';
     this.conditionslist = [];
     this.reportTitle = "";
   },
   }
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
