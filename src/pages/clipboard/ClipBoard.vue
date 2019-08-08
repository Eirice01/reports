<template>
  <div id="clipboard">
    <div class="cli-main">
      <div class="cli-left">
        <div class="batch-btn">
          <div class="cli-time">
            <li class="modeltime" :class="index===currentime ?'currentime':''" v-for="(item,index) in timelist" :key="index" @click="initModels(item,index)">{{item}}</li>
          </div>
          <div class="cli-btn">
            <span class="modelbtn" @click="showCheck">批量</span>
          </div>
        </div>
        <div class="modellist">
          <li class="modelinfo" v-for="(item,index) in modellist" :key="index">
            <div class="singlecheck" @click="singleModelCheck($event,item.imageTimestap)" v-show="isShowSingle">
            </div>
            <div class="cli-img" :class="index===currentIndexs ?'Currentcliimg':''">
              <img :src="item.src"  @click="getmodelinfo(item.src,item.remark,index)">
            </div>
            <div class="cli-handle">
             <span class="cli-export" @click="exportImg(item.imageTimestap)">导出</span>
              <span class="cli-delete" @click="deleteImg(item.imageTimestap,index)">删除</span>
            </div>
          </li>
        </div>
        <div id="handles" v-show="isShowCheckall">
          <div class="cli-checkbtn">
            <div class="checkALL" @click="allCheck($event)">
            </div>
            <span class="cli-checkall">全选</span>
          </div>
          <div class="btn-list">
            <Button  type="primary" size="small" @click.native="deleteCheck">删除</Button>
            <Button  type="warning"  size="small" @click.native="exportcheck">导出</Button>
            <!--<Button  type="dashed"  size="small">取消</Button>-->
          </div>
        </div>
      </div>
      <div class="cli-right">
        <div class="mapimg">
          <img :src="Currentimg" >
        </div>
        <div class="mapinfos">{{remarkinfo}}</div>
      </div>
    </div>
  </div>
</template>

<script>
  import {URL} from '../../../api/urlsConfig'
  export default {
    name: "clipboard",
    data(){
      return {
        timelist:[],
        modellist:[],
        changeChose:false,
        currentImgList:'',
        upImgList:'',
        Currentimg:'',
        remarkinfo:'',
        currentIndexs:'',
        currentime:'',
        isShowSingle:false,
        isShowCheckall:false,
        firstFlag:false,
        checkImgid:[],

      }
    },
    created(){

    },
    mounted(){
      if(this.$route.query.iscli){
        this.initShearPlateList()
      }
    },
    methods:{
      //单选 全选显示  批量操作
      showCheck(){
        this.changeChose=!this.changeChose;
        if(this.changeChose){
          this.isShowSingle=true;
          this.isShowCheckall=true;
        }else {
          this.isShowSingle=false;
          this.isShowCheckall=false;
        }
      },
      //单个模型选中
      getmodelinfo(src,remark,index){
        if(index!=0){
          this.firstFlag=false;
        }else {
          this.firstFlag=true;
        }

        this.currentIndexs=index;
        this.Currentimg=src;
        this.remarkinfo=remark;
      },
      //导出图片
      exportImg(id){
        let currentTime=document.querySelector(".currentime").innerHTML;
        window.location.href = URL.downloadImageSigle+"?date="+currentTime+"&fileName="+id;
      },
      //删除当前选中图表信息
      deleteImg(id,index){
        let currentTime=document.querySelector(".currentime").innerHTML;
        this.$http.request({
          method:'get',
          params:{
            date:currentTime,
            fileNames:id,
          },
          url:URL.batchDeleteShearPlate,
          success:(data) => {
            if(data.code==200){
              let res=data.data
              this.upDleteImg(index)
              this.$Message.success('删除成功'+res+'个')
            }
          },
          error : (data) => {
            this.$Message.warning('请求数据失败！');
          }
        });

      },

      //删除后更新模型列表
      upDleteImg(index){
        // this.modellist=[];
        let _this=this;
        let currentTime=document.querySelector(".currentime").innerHTML;
        this.$http.request({
          method:'get',
          params:{},
          url:URL.queryShearPlateList,
          success:(data) => {
            let res=data.data
            _this.upImgList=res;
            _.each(_this.upImgList,function (value,key) {
              if(currentTime==key) {
                _this.modellist = value;
                let tpeLength=_this.modellist.length;
                if(tpeLength>1){
                  if(index==0){
                    //删除后默认显示,如果上次删除的是第一个默认在显示下一个
                    let senidnex=index
                    let sendSrc=_this.modellist[senidnex].src
                    let sendRemark=_this.modellist[senidnex].remark
                    _this.upCheck(sendSrc,sendRemark,senidnex)

                  }else {
                    if(_this.firstFlag){
                      //更新模型如果上一次删除的不是第一个且第一个被选中 恢复选中第一个
                      let sendSrc=_this.modellist[0].src
                      let sendRemark=_this.modellist[0].remark
                      _this.initCheckFirst(sendSrc,sendRemark)
                    }else {
                      //删除后默认显示,如果上次删除的不是第一个,第一个没被选中,显示上一个
                      let senidnex=index-1
                      let sendSrc=_this.modellist[senidnex].src
                      let sendRemark=_this.modellist[senidnex].remark
                      _this.upCheck(sendSrc,sendRemark,senidnex)
                    }

                  }
                }else if(tpeLength==1){
                  //删除后默认显示,删除后之后返回新的只有一个时
                  let sendSrc=_this.modellist[0].src
                  let sendRemark=_this.modellist[0].remark
                  _this.initCheckFirst(sendSrc,sendRemark)
                }else if(tpeLength==0){
                  //删除后默认显示,删除后返回的是空时
                  _this.currentIndexs='';
                  _this.Currentimg='';
                  _this.remarkinfo='';
                }
              }
            })
          },
          error : (data) => {
            this.$Message.warning('请求数据失败！');
          }
        });

      },
      //更新选中
      upCheck(src,remark,senidnex){
        this.currentIndexs=senidnex;
        this.Currentimg=src;
        this.remarkinfo=remark;
      },
      //批量导出
      exportcheck(){
       if(this.checkImgid.length>0){
         for(let i=0;i<this.checkImgid.length;i++){
           this.exportImg(this.checkImgid[i])
         }
       }
      },
      //批量删除
      deleteCheck(){
        let currentTime=document.querySelector(".currentime").innerHTML;
        if(typeof (this.checkImgid)=='object'){
          this.checkImgid=this.checkImgid.join(",")
        }else if(typeof (this.checkImgid)=='string'){
          this.checkImgid;
        }
        this.$http.request({
          method:'get',
          params:{
            date:currentTime,
            fileNames:this.checkImgid,
          },
          url:URL.batchDeleteShearPlate,
          success:(data) => {
            if(data.code==200){
              let res=data.data
              this.checkImgid=[];
              this.refsModelList(currentTime)
              this.$Message.success('删除成功'+res+'个')
            }
          },
          error : (data) => {
            this.$Message.warning('请求数据失败！');
          }
        });

      },

      //批量删除后列表刷新默认选中
      refsModelList(time){
        let _this=this;
        this.$http.request({
          method:'get',
          params:{},
          url:URL.queryShearPlateList,
          success:(data) => {
            let res=data.data
            _.each(res,function (value,key) {
              if(time==key) {
                _this.modellist = value;
              }
            })
            if(_this.modellist.length!=0){
              let sendSrc=_this.modellist[0].src;
              let sendRemark=_this.modellist[0].remark;
              let senidnex=0;
              let checkList=document.getElementsByClassName("singlecheck");
              for(let i=0;i<checkList.length;i++){
                if(checkList[i].classList.contains("Currentsinglecheck")){
                  checkList[i].classList.remove("Currentsinglecheck");
                }
              }
              _this.upCheck(sendSrc,sendRemark,senidnex)
            }else {
              //删除后默认显示,删除后返回的是空时
              _this.currentIndexs='';
              _this.Currentimg='';
              _this.remarkinfo='';
            }
          },
          error : (data) => {
            _this.$Message.warning('请求数据失败！');
          }
        });
      },
      //单个选中事件
      singleModelCheck(e,imgid){
        if(e.target.classList.contains("Currentsinglecheck")){
          e.target.classList.remove("Currentsinglecheck");
          //单选触发全选取消
          let es=document.getElementsByClassName("checkALL");
          es[0].classList.remove("CurrentcheckALL");
          if(this.checkImgid.length!=0){
            //将去勾选的图片id从原存储数据中删除
            this.checkImgid = _.pull(this.checkImgid,imgid);
          }
        }else {
          e.target.classList.add("Currentsinglecheck")
          //将勾选状态的图片id存储
          this.checkImgid.push(imgid);
          let el=document.getElementsByClassName("Currentsinglecheck")
          if(el.length==this.modellist.length){
            let es=document.getElementsByClassName("checkALL");
            es[0].classList.add("CurrentcheckALL");
            //全选时将当前列表中所有图片id存储
            this.checkImgid=_.map(this.modellist,"imageTimestap");
          }
        }
        // console.log(this.checkImgid)
      },
      //列表全选
      allCheck(e){
        if(e.target.classList.contains("CurrentcheckALL")){
          e.target.classList.remove("CurrentcheckALL");
          //取消全选时将存储的图片id清空
          this.checkImgid=[];
          $(".singlecheck").removeClass("Currentsinglecheck");
        }else {
          e.target.classList.add("CurrentcheckALL");
          //全选时将当前列表中所有图片id存储
          this.checkImgid=_.map(this.modellist,"imageTimestap");
          $(".singlecheck").addClass("Currentsinglecheck");
        }
      },
      //初始化默认显示第一个
      initCheckFirst(src,remark){
        this.firstFlag=true;
        this.currentIndexs=0;
        this.Currentimg=src;
        this.remarkinfo=remark;
      },
      //初始化时间选中
      initTimeCheck(){
        this.currentime=0;
      },
      //时间列表样式更换
      chengeTimeList(index){
        this.currentime=index
      },

      //获取模型列表数据
      initShearPlateList(){
        this.$http.request({
          method:'get',
          params:{},
          url:URL.queryShearPlateList,
          success:(data) => {
            let res=data.data
            this.currentImgList=res;
            this.timelist=_.keys(res);
            //初始化显示时间和图片
            this.initTimeCheck()
            for(let i=0;i<this.timelist.length;i++){
              let firsttime=this.timelist[0];
              this.initModels(firsttime,0)
            }
          },
          error : (data) => {
            this.$Message.warning('请求数据失败！');
          }
        });

      },
      //初始化模型
      initModels(time,index){
        this.chengeTimeList(index)
        let _this=this;
        _.each(_this.currentImgList,function (value,key) {
          if(time==key){
            _this.modellist=value;
            for(let i=0;i<_this.modellist.length;i++){
              let firstSrc=_this.modellist[0].src;
              let firstRemark=_this.modellist[0].remark;
              _this.initCheckFirst(firstSrc,firstRemark)
            }
          }
        })
      },

    }
  }
</script>

<style scoped lang="less">
  #clipboard{
    width: 100%;
    height: 100%;
    >.cli-main{
      overflow: hidden;
      width: 100%;
      margin-top: 30px;

      height:calc(100% - 30px) ;
      >.cli-left{
        width: 330px;
        height: 100%;
        float: left;
        overflow: auto;
        cursor: pointer;

      }
      >.cli-right{
        background: #fcf9f2;
        box-sizing: border-box;
        margin-right:10px;
        margin-left: 350px;
        margin-top: 30px;
        width:calc(100% - 365px);
        height:calc(100% - 60px);
        padding:30px;
        box-shadow: 0px 3px 5px #e0e7ee, -3px 0px 5px #e0e7ee, 0px -3px 5px #e0e7ee,  3px 0px 5px #e0e7ee;
        >.mapimg{
          width: 100%;
          height:calc(100% - 60px);
          /*background: red;*/
          >img{
            width: 100%;
            height:100%;
          }
        }
        >.mapinfos{
          /*background: #1b62a2;*/
          width: 100%;
          height: 60px;
          color: #000000;
          font-size: 18px;
          line-height: 60px;
          text-align: center;
        }
      }
    }
  }
  #climapcontent{
    width: 100%;
    height:calc(100% - 100px) ;
  }
  .batch-btn{
    width: 100%;
    height: 80px;
    display: flex;
    padding-left: 35px;
  }
  .cli-time{
    width: 75%;
    height: 100%;
  }
  .modeltime{
    color: #637a93;
    font-size: 16px;
  }
  .currentime{
    color: #4a90e2;
    font-size: 16px;
  }
  .cli-btn{
    width: 25%;
    height: 100%;
    >.modelbtn{
      display: inline-block;
      width:60px;
      height: 26px;
      line-height: 26px;
      color: #f2f7fc;
      background: #4a90e2;
      margin-top: 26px;
      text-align: center;
      border-radius: 5px;
    }
  }
  .modellist{
    padding-left: 35px;
    width: 100%;
    height:calc(100% - 150px);
    background: #f0f0f0;
    overflow: auto;
    >.modelinfo{
      margin:15px 0px;
      width: 100%;
      height: 126px;
      display: flex;
      >.cli-handle{
        width:calc(100% - 210px);
        height: 100%;
        >.cli-export{
          width: 50px;
          height: 25px;
          line-height: 25px;
          text-align: center;
          display: block;
          /*padding:10px 20px;*/
          color: #4f94e2;
          border-radius: 3px;
          font-size: 8px;
          border: 1px solid #4aa0f7;
          margin-top: 56px;
          margin-bottom: 15px;
        }
        >.cli-delete{
          width: 50px;
          height: 25px;
          line-height: 25px;
          text-align: center;
          display: block;
          /*padding:10px 20px;*/
          color: #b9b8b8;
          border-radius: 3px;
          font-size: 8px;
          border: 1px solid #d6d6d6;
        }
      }
    }
  }
  .cli-img{
    width: 186px;
    height: 126px;
    /*margin:0px 15px;*/
    margin-right: 15px;
    box-shadow: 0px 3px 5px #e0e7ee, -3px 0px 5px #e0e7ee, 0px -3px 5px #e0e7ee,  3px 0px 5px #e0e7ee;
    >img{
      width: 186px;
      height: 126px;
    }
  }
  .Currentcliimg{
    width: 186px;
    height: 126px;
    /*margin:0px 15px;*/
    margin-right: 15px;
    >img{
      width: 186px;
      height: 126px;
      border:1px dashed #666666;

    }

  }
  #handles{
    height: 70px;
    border-top: 1px solid #dad6d6;
    width: calc(100% - 35px);
    padding-left: 35px;
    margin: 0px 20px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    text-align: center;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    >.cli-checkbtn{
      width: 40%;
      display: inline-block;
      margin-right: 15px;
      overflow: hidden;
      height: 50px;
      line-height: 50px;
      >.cli-checkall{
        display: inline-block;
        vertical-align: middle;
      }
    }
    >.btn-list{
      width: 60%;
      height: 50px;
      line-height: 50px;
    }
  }
  .singlecheck{
    transition: all .5s;
    width: 20px;
    height:15px;
    margin-right: 15px;
    border:1px solid #d5d8de;
    background: #ffffff;
  }
  .Currentsinglecheck{
    width: 20px;
    height:15px;
    margin-right: 15px;
    border:1px solid #d5d8de;
    background:url("../../assets/img/cli.png") no-repeat;
  }
  .checkALL{
    display: inline-block;
    margin-top: 17px;
    width: 15px;
    margin-right: 5px;
    height:15px;
    border:1px solid #d5d8de;
    background: #ffffff;

  }
  .CurrentcheckALL{
    display: inline-block;
    margin-top: 17px;
    width: 15px;
    margin-right: 5px;
    height:15px;
    border:1px solid #d5d8de;
    background:url("../../assets/img/cli.png") no-repeat;
  }
</style>

