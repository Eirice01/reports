<template>
  <div id="addScenic">
    <Modal
      v-model="getAddScenicState"
      :title="title"
      width="1400"
      id="add-scenic-modal"
    >
      <div>
        <Form ref="addValidate2" :model="addValidate2" :label-width="100">
          <FormItem label="景区名称：" prop="name" >
            <Input v-model="addValidate2.name" placeholder="请输入景区名称" style="width: 590px;" :readonly="readShow" @on-blur="testAreaName"></Input>
            <div style="display: flex;width: 300px">
              <p  class="cls-test" style="margin-left: 95px;width: 180px" v-show="isErroMsg">{{erroName}}</p>
            </div>
          </FormItem>
          <Row>
            <Col span="12">
            <div class="add-content" style="padding-right: 10px;">
              <div style="text-align: right;padding: 5px;" :class="readShow ? 'read-show':''">
                <span style="display: inline-block;vertical-align: middle">
                  <Input v-model="addValidate2.location.x" placeholder="请输入经度" style="width: 150px;" @on-blur="testLon">
                    <span slot="prepend">经度：</span>
                  </Input>
                </span>
                <span style="display: inline-block;vertical-align: middle">
                  <Input v-model="addValidate2.location.y" placeholder="请输入纬度" style="width: 150px;" @on-blur="testLat">
                    <span slot="prepend">纬度：</span>
                  </Input>
                </span>
                <span style="display: inline-block;vertical-align: middle">
                  <Input v-model="addValidate2.square" readonly style="width: 115px;">
                    <span slot="prepend">面积：</span>
                  </Input>
                </span>
                <Button @click="getLocation('all')">
                  获取经纬度
                  <!--<span style="color: #515a6e;"><Icon type="md-pin"></Icon></span>-->
                </Button>
                <Button type="info" @click="regionMap('all')" size="small">框入</Button>
                <div style="display: flex">
                  <p  class="cls-test" style="margin-left: 95px" v-show="isErroMsg">{{erroMSgx}}</p>
                  <p  class="cls-test"  v-show="isErroMsg">{{erroMSgy}}</p>
                </div>
              </div>
              <FormItem label="整体边界：" class="item-text" style="margin-bottom: 10px">
                <Row>
                  <Col span="24">
                    <!--:rules="{ validator:addRule2.allBorder[0].validator,}"-->
                  <FormItem prop="allBorder" >
                    <Input v-model="addValidate2.allBorder" type="textarea" :autosize="{minRows:6,maxRows:6}"
                           placeholder="[边界] 格式: 经度,纬度;经度,纬度;经度,纬度" :readonly="readShow" @on-blur="testArea1"></Input>
                  </FormItem>
                  </Col>
                </Row>
                <div style="display: flex">
                  <p  class="cls-test" style="margin-left: 95px" v-show="isErroMsg">{{erroArea1}}</p>
                </div>
              </FormItem>
              <FormItem label="整体基站：" class="item-text">
                <Row :gutter="16">
                  <Col span="7">
                  <FormItem prop="yLacci" :rules="{validator:addRule.yLacci[0].validator}">
                    <Input v-model="addValidate2.yLacci" type="textarea" :autosize="{minRows:6,maxRows:6}"
                           placeholder="[移动] 格式: LAC_CI,多个号码使用回车分隔" :readonly="readShow" ></Input>
                  </FormItem>
                  </Col>
                  <Col span="7">
                  <FormItem prop="lLacci" :rules="{validator:addRule.lLacci[0].validator}">
                    <Input v-model="addValidate2.lLacci" type="textarea" :autosize="{minRows:6,maxRows:6}"
                           placeholder="[联通] 格式: LAC_CI,多个号码使用回车分隔" :readonly="readShow"></Input>
                  </FormItem>
                  </Col>
                  <Col span="7">
                  <FormItem prop="dLacci" :rules="{validator:addRule.dLacci[0].validator}">
                    <Input v-model="addValidate2.dLacci" type="textarea" :autosize="{minRows:6,maxRows:6}"
                           placeholder="[电信] 格式: LAC_CI,多个号码使用回车分隔" :readonly="readShow"></Input>
                  </FormItem>
                  </Col>
                </Row>
              </FormItem>
              <div v-for="(item,index) in addValidate2.areaData">
                <FormItem label="区域名称：" :prop="'areaData.'+index+'.areaName'"
                          :rules="{ validator:addRule.areaName[0].validator,}">
                  <Input v-model="addValidate2.areaData[index].areaName" placeholder="请输入区域名称"
                         :readonly="readShow"></Input>
                </FormItem>
                <div style="text-align: right;padding: 5px;" :class="readShow ? 'read-show':''">
                  <span style="display: inline-block;vertical-align: middle">
                  <Input v-model="addValidate2.areaData[index].location.x" placeholder="请输入经度" style="width: 150px;" @on-blur="areaLon(index)">
                    <span slot="prepend">经度：</span>
                    </Input>
                  </span>
                  <span style="display: inline-block;vertical-align: middle">
                    <Input v-model="addValidate2.areaData[index].location.y" placeholder="请输入纬度"
                           style="width: 150px;"  @on-blur="areaLat(index)">
                      <span slot="prepend">纬度：</span>
                    </Input>
                  </span>
                  <span style="display: inline-block;vertical-align: middle">
                  <Input v-model="addValidate2.areaData[index].square" readonly style="width: 115px;">
                    <span slot="prepend">面积：</span>
                    </Input>
                </span>
                  <Button @click="getLocation(index)">
                    获取经纬度
                  </Button>
                  <Button type="info" @click="regionMap(index)" size="small">框入</Button>
                  <div style="display: flex;width: 500px;height: 20px">
                    <p  class="cls-test" style="margin-left: 95px" v-show="isArealon==index?true:false">{{areaMSgx}}</p>
                    <p  class="cls-test"  v-show="isArealan==index?true:false">{{areaMSgy}}</p>
                  </div>
                </div>
                <FormItem label="区域边界：" class="item-text">
                  <Row>
                    <Col span="24">
                    <FormItem :prop="'areaData.'+index+'.areaBorder'"
                              :rules="{ validator:addRule2.areaBorder[0].validator,}">
                      <Input v-model="addValidate2.areaData[index].areaBorder" type="textarea"
                             :autosize="{minRows:6,maxRows:6}" placeholder="[边界] 格式: 经度,纬度;经度,纬度;经度,纬度"
                             :readonly="readShow" @on-blur="testArea2(index)"></Input>
                    </FormItem>
                      <div style="display: flex">
                        <p  class="cls-test" style="margin-left: 95px" v-show="isCurrentMSg==index?true:false">{{areamsg}}</p>
                      </div>
                    </Col>
                  </Row>
                </FormItem>
                <FormItem label="区域基站：" class="item-text">
                  <Row :gutter="16">
                    <Col span="7">
                    <FormItem :prop="'areaData.'+index+'.yLacciArea'"
                              :rules="{ validator:addRule.yLacciArea[0].validator,}">
                      <Input v-model="addValidate2.areaData[index].yLacciArea" type="textarea"
                             :autosize="{minRows:6,maxRows:6}" placeholder="[移动] 格式: LAC_CI,多个号码使用回车分隔"
                             :readonly="readShow"></Input>
                    </FormItem>
                    </Col>
                    <Col span="7">
                    <FormItem :prop="'areaData.'+index+'.lLacciArea'"
                              :rules="{ validator:addRule.lLacciArea[0].validator,}">
                      <Input v-model="addValidate2.areaData[index].lLacciArea" type="textarea"
                             :autosize="{minRows:6,maxRows:6}" placeholder="[联通] 格式: LAC_CI,多个号码使用回车分隔"
                             :readonly="readShow"></Input>
                    </FormItem>
                    </Col>
                    <Col span="7">
                    <FormItem :prop="'areaData.'+index+'.dLacciArea'"
                              :rules="{ validator:addRule.dLacciArea[0].validator,}">
                      <Input v-model="addValidate2.areaData[index].dLacciArea" type="textarea"
                             :autosize="{minRows:6,maxRows:6}" placeholder="[电信] 格式: LAC_CI,多个号码使用回车分隔"
                             :readonly="readShow"></Input>
                    </FormItem>
                    </Col>
                  </Row>
                </FormItem>

              </div>
              <FormItem label="" style="text-align: right;" :class="readShow ? 'read-show':''">
                <Button type="info" @click="addAreaPoints" size="small">添加</Button>
                <Button type="warning" @click="delAreaPoints" size="small">删除</Button>
              </FormItem>
            </div>
            </Col>
            <Col span="12">
            <div class="add-content add-map-content">
              <div id="map-box">

              </div>
              <div class="mapTools">
                <ul class="clearFix">
                  <div class="fl" style="background:#5b6d80;margin-left: 200px">
                    <li id="map-box_ctm_tool_pop_drawpolygon" class="iconItem">
                      <Tooltip content="多边形区域框选" placement="bottom"><i class="iconfont icon-icon-test-copy1"></i>
                      </Tooltip>
                    </li>
                    <li id="map-box_ctm_tool_pop_drawrect" class="iconItem">
                      <Tooltip content="矩形区域框选" placement="bottom"><i class="iconfont icon-icon-test-copy11"></i>
                      </Tooltip>
                    </li>
                    <li>
                      <span style="border-right: 2px solid #fff;float: left;height:28px;margin: 6px 10px;"></span>
                    </li>
                    <li id="map-box_ctm_tool_pop_zoomin" class="iconItem">
                      <Tooltip content="放大" placement="bottom"><i class="iconfont icon-fangda"></i></Tooltip>
                    </li>
                    <li id="map-box_ctm_tool_pop_zoomout" class="iconItem">
                      <Tooltip content="缩小" placement="bottom"><i class="iconfont icon-suoxiao"></i></Tooltip>
                    </li>
                    <li id="map-box_ctm_tool_pop_measurel" class="iconItem">
                      <Tooltip content=" 测量距离" placement="bottom"><i class="iconfont icon-celiang1"></i></Tooltip>
                    </li>
                    <li id="map-box_ctm_tool_pop_measurea" class="iconItem">
                      <Tooltip content="  测量面积 " placement="bottom"><i class="iconfont icon-mianjiceliang"></i>
                      </Tooltip>
                    </li>
                    <li id="map-box_ctm_tool_list" class="iconItem">
                      <Tooltip content="图层切换" placement="bottom"><i class="iconfont icon-qiehuan"></i></Tooltip>
                    </li>
                    <li id="map-box_clear" class="iconItem" @click="clearTravelMap">
                      <Tooltip content="清除覆盖物" placement="bottom"><i class="iconfont icon-ft-eraser"></i></Tooltip>
                    </li>
                    <li>
                      <span style="border-right: 2px solid #fff;float: right;height:28px;margin: 6px 10px;"></span>
                    </li>
                  </div>
                </ul>
              </div>
            </div>
            </Col>
          </Row>
        </Form>
      </div>
      <div slot="close" @click="addCancel"><Icon type="ios-close"></Icon></div>
      <div slot="footer" style="margin-right: 25px;">
        <Button type="text" @click="addCancel">取消</Button>
        <Button type="primary" @click="addOk">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
  import {URL} from '../../../api/urlsConfig'

  export default {
    name: "add-scenic",
    data() {
      const Name=(rule, value, callback)=>{



      }
      return {
        isErroMsg:true,
        erroMSgx:'',
        erroMSgy:'',
        erroArea1:'',
        isCurrentMSg:'',
        areamsg:'',
        areaMSgy:'',
        areaMSgx:'',
        isArealan:false,
        isArealon:false,
        erroName:'',
        title: "新增景区",
        type: "name1",
        areaId: "",
        addRule0: {
          name: [
            { message: '景区名称不能为空', trigger: 'change'}
          ]
        },
        addValidate: {
          name: "",
          yLacci: "",
          lLacci: "",
          dLacci: "",
          areaData: [
            {
              name:"",
              areaName: "",
              yLacciArea: "",
              lLacciArea: "",
              dLacciArea: "",

            }
          ]
        },
        scenicAreaName:{trigger: 'change',validator:Name},
        addRule: {
          areaName: [
            {
              validator: (rule, value, callback) => {
                  if(value.length==0){
                    callback("区域名称不能为空！")
                  }else if(value.includes(" ")){
                    callback("区域名称不能包含空格")
                  }else if(value.length>20){
                    callback("区域名称长度不能超过20个字节")
                  }
                 else {
                   callback()
                  }
              }

            }
          ],
          yLacci: [
            {
              validator: (rule, value, callback) => {
                var pattern = /^([0-9]+_[0-9]+\s*)(\n+[0-9]+_[0-9]+\s*)*\s*$/;
                if (value.length != 0 && !pattern.test(value)) {
                  callback("请输入有效的LAC_CI,多个LAC_CI换行输入！")
                }
                else {
                  callback();
                }
              }
            }
          ],
          lLacci: [
            {
              validator: (rule, value, callback) => {
                var pattern = /^([0-9]+_[0-9]+\s*)(\n+[0-9]+_[0-9]+\s*)*\s*$/;
                if (value.length != 0 && !pattern.test(value)) {
                  callback("请输入有效的LAC_CI,多个LAC_CI换行输入！")
                } else {
                  callback();
                }
              }
            }
          ],
          dLacci: [
            {
              validator: (rule, value, callback) => {
                var pattern = /^([0-9]+_[0-9]+\s*)(\n+[0-9]+_[0-9]+\s*)*\s*$/;
                if (value.length != 0 && !pattern.test(value)) {
                  callback("请输入有效的LAC_CI,多个LAC_CI换行输入！")
                } else {
                  callback();
                }
              }
            }
          ],
          yLacciArea: [
            {
              validator: (rule, value, callback) => {
                var pattern = /^([0-9]+_[0-9]+\s*)(\n+[0-9]+_[0-9]+\s*)*\s*$/;
                if (value.length != 0 && !pattern.test(value)) {
                  callback("请输入有效的LAC_CI,多个LAC_CI换行输入！")
                }
                else {
                  callback();
                }
              }
            }
          ],
          lLacciArea: [
            {
              validator: (rule, value, callback) => {
                var pattern = /^([0-9]+_[0-9]+\s*)(\n+[0-9]+_[0-9]+\s*)*\s*$/;
                if (value.length != 0 && !pattern.test(value)) {
                  callback("请输入有效的LAC_CI,多个LAC_CI换行输入！")
                } else {
                  callback();
                }
              }
            }
          ],
          dLacciArea: [
            {
              validator: (rule, value, callback) => {
                var pattern = /^([0-9]+_[0-9]+\s*)(\n+[0-9]+_[0-9]+\s*)*\s*$/;
                if (value.length != 0 && !pattern.test(value)) {
                  callback("请输入有效的LAC_CI,多个LAC_CI换行输入！")
                } else {
                  callback();
                }
              }
            }
          ],
        },
        addValidate2: {
          name: "",
          createDate: '',
          allBorder: "",
          yLacci: "",
          lLacci: "",
          dLacci: "",
          square: "",
          location: {
            x: "",
            y: ""
          },
          areaData: [
            // {
            //   areaName: "",
            //   createDate: '',
            //   areaBorder: "",
            //   yLacciArea: "",
            //   lLacciArea: "",
            //   dLacciArea: "",
            //   square: "",
            //   location: {
            //     x: "",
            //     y: ""
            //   }
            // }
          ],
        },
        square: "",
        addRule2: {
          areaName:[
            {
              validator: (rule, value, callback) => {
                callback();
                /*var pattern = /^([0-9]+_[0-9]+\s*)(\n+[0-9]+_[0-9]+\s*)*\s*$/;
                if (value.length != 0 && !pattern.test(value)) {
                  callback("请输入有效的边界,多个号码间必须换行！")
                } else {
                  callback();
                }*/
              }
            }
          ],
          allBorder: [
            // {
            //   validator: (rule, value, callback) => {
            //     let tep=value.split(";")
            //     let lonReg=/^(\-|\+)?(((\d|[1-9]\d|1[0-7]\d|0{1,3})\.\d{0,6})|(\d|[1-9]\d|1[0-7]\d|0{1,3})|180\.0{0,6}|180)$/;
            //     let latReg=/^(\-|\+)?([0-8]?\d{1}\.\d{0,6}|90\.0{0,6}|[0-8]?\d{1}|90)$/;
            //     for(let i=0;i<tep.length;i++){
            //       if(value.length != 0&&lonReg.test(tep[i].split(",")[0])===false){
            //         callback("[边界] 格式: 经度,纬度;经度,纬度;经度,纬度请输入有效的经纬度！")
            //       }else if(value.length != 0&& latReg.test(tep[i].split(",")[1])===false){
            //         callback("[边界] 格式: 经度,纬度;经度,纬度;经度,纬度请输入有效的经纬度！")
            //       }
            //       else {
            //         callback()
            //       }
            //     }
            //
            //   }
            // }
          ],
          areaBorder: [
            {
              validator: (rule, value, callback) => {
                callback();
                /*var pattern = /^([0-9]+_[0-9]+\s*)(\n+[0-9]+_[0-9]+\s*)*\s*$/;
                if (value.length != 0 && !pattern.test(value)) {
                  callback("请输入有效的边界,多个号码间必须换行！")
                } else {
                  callback();
                }*/
              }
            }
          ],
          yLacci: [
            {
              validator: (rule, value, callback) => {
                var pattern = /^([0-9]+_[0-9]+\s*)(\n+[0-9]+_[0-9]+\s*)*\s*$/;
                if (value.length != 0 && !pattern.test(value)) {
                  callback("请输入有效的LAC_CI,多个LAC_CI换行输入！")
                }
                else {
                  callback();
                }
              }
            }
          ],
          lLacci: [
            {
              validator: (rule, value, callback) => {
                var pattern = /^([0-9]+_[0-9]+\s*)(\n+[0-9]+_[0-9]+\s*)*\s*$/;
                if (value.length != 0 && !pattern.test(value)) {
                  callback("请输入有效的LAC_CI,多个LAC_CI换行输入！")
                } else {
                  callback();
                }
              }
            }
          ],
          dLacci: [
            {
              validator: (rule, value, callback) => {
                var pattern = /^([0-9]+_[0-9]+\s*)(\n+[0-9]+_[0-9]+\s*)*\s*$/;
                if (value.length != 0 && !pattern.test(value)) {
                  callback("请输入有效的LAC_CI,多个LAC_CI换行输入！")
                } else {
                  callback();
                }
              }
            }
          ],
          yLacciArea: [
            {
              validator: (rule, value, callback) => {
                var pattern = /^([0-9]+_[0-9]+\s*)(\n+[0-9]+_[0-9]+\s*)*\s*$/;
                if (value.length != 0 && !pattern.test(value)) {
                  callback("请输入有效的LAC_CI,多个LAC_CI换行输入！")
                }
                else {
                  callback();
                }
              }
            }
          ],
          lLacciArea: [
            {
              validator: (rule, value, callback) => {
                var pattern = /^([0-9]+_[0-9]+\s*)(\n+[0-9]+_[0-9]+\s*)*\s*$/;
                if (value.length != 0 && !pattern.test(value)) {
                  callback("请输入有效的LAC_CI,多个LAC_CI换行输入！")
                } else {
                  callback();
                }
              }
            }
          ],
          dLacciArea: [
            {
              validator: (rule, value, callback) => {
                var pattern = /^([0-9]+_[0-9]+\s*)(\n+[0-9]+_[0-9]+\s*)*\s*$/;
                if (value.length != 0 && !pattern.test(value)) {
                  callback("请输入有效的LAC_CI,多个LAC_CI换行输入！")
                } else {
                  callback();
                }
              }
            }
          ],
        },
        firstClick: true,
        chooseBorder: "all",
        coords: "",
        readShow: false,

      }
    },
    computed: {
      //弹窗显示状态改变
      getAddScenicState: {
        get: function () {
          return this.$store.state.addScenicModal;
        },
        set: function () {
          this.$store.commit("showAddScenicModal");
        }
      },
    },
    methods: {
      //主景区名称校验
      testAreaName(){
         if(this.addValidate2.name.length==0){
           this.erroName="景区名称不能为空！"
         }else if(this.addValidate2.name.includes(" ")){
           this.erroName="景区名称不能含有空格！"
         }else if(this.addValidate2.name.length>20){
           this.erroName="景区名称长度不能超过20个字！"
         }
         else {
           this.erroName=""
         }
       },

      //经度校验
      testLon(){
        var lonReg=/^(\-|\+)?(((\d|[1-9]\d|1[0-7]\d|0{1,3})\.\d{0,6})|(\d|[1-9]\d|1[0-7]\d|0{1,3})|180\.0{0,6}|180)$/;
         if(this.addValidate2.location.x!=''){
           if(lonReg.test(this.addValidate2.location.x)){
             this.erroMSgx="";
           }else {
             this.erroMSgx="请输入正确的经度";
           }
         }else {
           this.erroMSgx="";
         }
      },
      //纬度校验
      testLat(){
        var latReg=/^(\-|\+)?([0-8]?\d{1}\.\d{0,6}|90\.0{0,6}|[0-8]?\d{1}|90)$/;
        if(this.addValidate2.location.y!=''){
          if(latReg.test(this.addValidate2.location.y)){
            this.erroMSgy="";
          }else {
            this.erroMSgy="请输入正确的纬度";
          }
        }else {
          this.erroMSgy="";
        }
      },
      //区域经度
        areaLon(index){
          var lonReg=/^(\-|\+)?(((\d|[1-9]\d|1[0-7]\d|0{1,3})\.\d{0,6})|(\d|[1-9]\d|1[0-7]\d|0{1,3})|180\.0{0,6}|180)$/;
         if(this.addValidate2.areaData[index].location.x!=''){
           if(lonReg.test(this.addValidate2.areaData[index].location.x)){
             this.areaMSgx="";
             this.isArealan="";
           }else {
             this.isArealon=index;
             this.areaMSgx="请输入正确的经度";
           }
         }else {
           this.areaMSgx="";
           this.isArealon="";
         }
        },
      //区域纬度
        areaLat(index){
          var latReg=/^(\-|\+)?([0-8]?\d{1}\.\d{0,6}|90\.0{0,6}|[0-8]?\d{1}|90)$/;
          if(this.addValidate2.areaData[index].location.y!=''){
            if(latReg.test(this.addValidate2.areaData[index].location.y)){
              this.areaMSgy="";
              this.isArealan="";
            }else {
              this.isArealan=index;
              this.areaMSgy="请输入正确的纬度";
            }
          }else {
            this.areaMSgy="";
            this.isArealan="";
          }
      },
      //整体区域校验
      testArea1(){
       if(this.addValidate2.allBorder!=''){
         let tep=this.addValidate2.allBorder.split(";")
         let lonReg=/^(\-|\+)?(((\d|[1-9]\d|1[0-7]\d|0{1,3})\.\d{0,6})|(\d|[1-9]\d|1[0-7]\d|0{1,3})|180\.0{0,6}|180)$/;
         let latReg=/^(\-|\+)?([0-8]?\d{1}\.\d{0,6}|90\.0{0,6}|[0-8]?\d{1}|90)$/;
         if(tep.length < 3){
           this.erroArea1="经纬度不能少于3对";
         }
         for(let i=0;i<tep.length;i++){
           if(lonReg.test(tep[i].split(",")[0])===false){
            this.erroArea1="请输入有效的经纬度";
            break;
           }else if(latReg.test(tep[i].split(",")[1])===false){
             this.erroArea1="请输入有效的经纬度";
             break;
           } else {
             this.erroArea1="";
           }
         }
       }else {
         this.erroArea1="";
       }
      },

      //区域校验
      testArea2(index){
        if(this.addValidate2.areaData[index].areaBorder!=''){
          let tep=this.addValidate2.areaData[index].areaBorder.split(";")
          let lonReg=/^(\-|\+)?(((\d|[1-9]\d|1[0-7]\d|0{1,3})\.\d{0,6})|(\d|[1-9]\d|1[0-7]\d|0{1,3})|180\.0{0,6}|180)$/;
          let latReg=/^(\-|\+)?([0-8]?\d{1}\.\d{0,6}|90\.0{0,6}|[0-8]?\d{1}|90)$/;
          if(tep.length < 3){
            this.erroArea1="经纬度不能少于3对"
          }
          for(let i=0;i<tep.length;i++){
            if(lonReg.test(tep[i].split(",")[0])===false){
              this.isCurrentMSg=index;
              this.areamsg="请输入有效的经纬度";
              break;
            }else if(latReg.test(tep[i].split(",")[1])===false){
              this.isCurrentMSg=index;
              this.areamsg="请输入有效的经纬度";
              break;
            } else {
              this.isCurrentMSg='';
              this.areamsg=""
            }
          }
        }else {
          this.isCurrentMSg='';
          this.areamsg=""
        }
      },
      //添加景区确定
      addOk() {
        let areaFlag=true;
        this.$refs["addValidate2"].validate((valid) => {
          if (valid&&this.addValidate2.name!=''&&this.addValidate2.allBorder!='') {
            let params = {
              areaId: this.areaId,
              areaName: this.addValidate2.name,
              createDate: this.addValidate2.createDate,
              nodes: this.addValidate2.allBorder,
              lon: this.addValidate2.location.x,
              lat: this.addValidate2.location.y,
              square: this.addValidate2.square,
              stations: {
                M: this.addValidate2.yLacci.split('\n'),
                T: this.addValidate2.lLacci.split('\n'),
                U: this.addValidate2.dLacci.split('\n')
              },
              subAreaList: []
            }

            this.addValidate2.areaData.forEach((item, index) => {
              if (item.areaName != "") {
                params.subAreaList.push({
                  areaId: item.areaId,
                  areaName: item.areaName,
                  createDate: item.createDate,
                  nodes: item.areaBorder,
                  lon: item.location.x,
                  lat: item.location.y,
                  square: item.square,
                  stations: {
                    M: item.yLacciArea.split('\n'),
                    T: item.lLacciArea.split('\n'),
                    U: item.dLacciArea.split('\n')
                  }
                })
                }
              })
              if(params.subAreaList.length!=0){
              params.subAreaList.forEach((item1,index)=>{
                if(item1.areaName!=''){
                  if((item1.nodes==undefined||item1.nodes.length==0)&&item1.stations.M[0]==''&&item1.stations.U[0]==''&&item1.stations.T[0]==''){
                    areaFlag=false;
                  } else {
                    areaFlag=true;
                  }
                }
              })
             }

                if(this.erroName!=''){
                  this.$Message.warning('请检查景区名称！');
                 this.$store.commit('showAddScenicModal', true);
                }else if(this.erroArea1!=''){
                 this.$Message.warning('请检查经纬度是否合法！');
                  this.$store.commit('showAddScenicModal', true);
               }else if(this.areamsg!=''){
                  this.$Message.warning('请检查区域边界经纬度是否合法！');
                  this.$store.commit('showAddScenicModal', true);
                }else if(this.erroMSgx!=''){
                  this.$Message.warning('请检查经度是否合法！');
                  this.$store.commit('showAddScenicModal', true);
                }else if(this.erroMSgy!=''){
                  this.$Message.warning('请检查纬度是否合法！');
                  this.$store.commit('showAddScenicModal', true);
                } else if(areaFlag==false){
                  this.$Message.warning('请检查区域边界，区域基站确保至少有一项不能为空！');
                  this.$store.commit('showAddScenicModal', true);
                }
                else {
                  this.$http.request({
                    method: 'post',
                    data: params,
                    url: this.areaId == "" ? URL.addScenicData : URL.update,
                    success: (data) => {
                      if (data.code == 200) {
                        this.$Message.success("提交成功！")
                        this.$store.commit('showAddScenicModal', false);
                        //调接口
                        this.$emit("queryScenicData");
                        //重置
                        this.addCancel();
                      } else {
                        this.$Message.success(data.msg)
                      }
                    },
                    error: (data) => {
                      this.$Message.warning('请求数据失败！');
                    }
                  });
                }
            }else {
            this.$Message.warning('请核对新增数据确保整体边界，景区名称不能为空！');
          }
        })
      },
      //添加景区取消
      addCancel() {
        this.addValidate2 = {
          name: "",
          allBorder: "",
          yLacci: "",
          lLacci: "",
          dLacci: "",
          square: "",
          location: {
            x: "",
            y: ""
          },
          areaData: [
            // {
            //   areaName: "",
            //   areaBorder: "",
            //   yLacciArea: "",
            //   lLacciArea: "",
            //   dLacciArea: "",
            //   square: "",
            //   location: {
            //     x: "",
            //     y: ""
            //   }
            // }
          ]

        }
        this.coords='';
        this.square='';
        this.erroMSgx='';
        this.erroMSgy='';
        this.erroName='';
        this.erroArea1='';
        this.areaMSgx='';
        this.areaMSgy='';
        this.areamsg='';
        this.$store.commit('showAddScenicModal', false);
      },
      //经纬度添加区域
      addAreaPoints() {
        this.addValidate2.areaData.push(
          {
            areaName: "",
            areaBorder: "",
            yLacciArea: "",
            lLacciArea: "",
            dLacciArea: "",
            square: "",
            location: {
              x: "",
              y: ""
            }
          }
        )
      },
      //经纬度删除区域
      delAreaPoints() {
        if (this.addValidate2.areaData.length > 0) {
          this.addValidate2.areaData.splice((this.addValidate2.areaData.length - 1))
        }
      },
      //地图初始化
      changeTabs() {
        $("#map-box").html("");
        initMap('map-box', true, false, true, true, URL.isDebug);
        this.firstClick = false;
        this.mapTools();
      },
      clearTravelMap() {
        //移除测量长度/面积结果显示
        $(".t-tooltip-static").parent().remove();
        removeUndefinedFeatures();
      },
      mapTools() {
        var homeThis = this;
        // var totalCount = 0 ;
        //添加绘制工具类
        var drawEndFunction = function (evt) {
          com.jiusuo.map.tMap.removeCurrentInteraction('draw');
          var geom = evt.feature.getGeometry();
          //获取绘制区域面积
          homeThis.square = parseFloat(geom.getArea()/1000000).toFixed(2);
          var otherGeoJson = com.jiusuo.map.TGeometryUtils.toGeoJsonString(geom);
          var array = otherGeoJson.coordinates[0];
          var coords = "";
          for (var i = 0; i < array.length; i++) {
            coords += array[i][0].toFixed(6) + ",";
            coords += array[i][1].toFixed(6) + ";";
          }
          coords = coords.substring(0, coords.length - 1);
          var style = new com.jiusuo.map.style.TStyle({
            fill: new com.jiusuo.map.style.TFill({
              color: 'rgba(30,144,255,0.5)'
            }),
            stroke: new com.jiusuo.map.style.TStroke({
              color: 'rgba(30,144,255,0.9)',
              width: 2
            }),
            text: new com.jiusuo.map.style.TText({
              text: homeThis.totalCount,
              font: '28px sans-serif',
              fill: new com.jiusuo.map.style.TFill({
                color: 'white'
              }),
              textBaseline: 'middle',
              stroke: new com.jiusuo.map.style.TStroke({
                color: 'black',
                width: 3
              })
            })
          });
          evt.feature.setStyle(style);
          homeThis.coords = coords
          //todo:调用添加区域弹框
        };

        var drawStartFunction = function (evt) {
          var style = new com.jiusuo.map.style.TStyle({
            fill: new com.jiusuo.map.style.TFill({
              color: 'rgba(255, 255, 255, 0.6)'
            }),
            stroke: new com.jiusuo.map.style.TStroke({
              color: 'rgba(255, 0, 255, 0.2)',
              width: 2
            }),
          });
          evt.feature.setStyle(style);
        };
        //图层切换
        com.jiusuo.map.tMap.addControl(new com.jiusuo.map.TLayerSwapeControl({tipLabel: '图层切换'}));
        com.jiusuo.map.tMap.addControl(new com.jiusuo.map.TDrawRectControl({
          tipLabel: '矩形区域人口查询',
          innerHTML: '矩形',
          startFunction: drawStartFunction,
          endFunction: drawEndFunction
        }));
        com.jiusuo.map.tMap.addControl(new com.jiusuo.map.TDrawPolygonControl({
          tipLabel: '多边形区域人口查询',
          innerHTML: '面',
          startFunction: drawStartFunction,
          endFunction: drawEndFunction
        }));
      },
      //查看,修改
      checkScenicData(id, flag, title) {
        this.areaId = id;
        let params = {
          areaId: id
        }
        this.$http.request({
          method: 'get',
          params: params,
          url: URL.find,
          success: (data) => {
            if (data.code == 200) {
              let res = data.data;
              this.readShow = flag;
              this.title = title;
              this.addValidate2.name = res.areaName;
              this.addValidate2.createDate = res.createDate;
              this.addValidate2.allBorder = res.nodes;
              this.addValidate2.square = res.square;
              this.addValidate2.yLacci = res.stations.M.join('\n');
              this.addValidate2.lLacci = res.stations.T.join('\n');
              this.addValidate2.dLacci = res.stations.U.join('\n');
              this.addValidate2.location.x = res.lon;
              this.addValidate2.location.y = res.lat;
              this.addValidate2.areaData = [];
              showPolygon(res.nodes);
              res.subAreaList.forEach((item, index) => {
                this.addValidate2.areaData.push({
                  areaId: item.areaId,
                  areaName: item.areaName,
                  createDate: item.createDate,
                  areaBorder: item.nodes,
                  square: item.square,
                  yLacciArea: item.stations.M.join('\n'),
                  lLacciArea: item.stations.T.join('\n'),
                  dLacciArea: item.stations.U.join('\n'),
                  location: {
                    x: item.lon,
                    y: item.lat,
                  }
                })
                showPolygon(item.nodes);
              })
              console.log(this.addValidate2.areaData)
            }
          },
          error: (data) => {
            this.$Message.warning('请求数据失败！');
          }
        });
      },
      //框入
      regionMap(index) {
        if (index == 'all') {
          this.addValidate2.allBorder = this.coords;
          this.addValidate2.square = this.square;
        } else {
          this.addValidate2.areaData[index].areaBorder = this.coords;
          this.addValidate2.areaData[index].square = this.square;
        }
      },
      //获取经纬度
      getLocation(type) {
        var homeThis = this;
        var getCoordFunction = function (coords) {
          if (type == 'all') {
            homeThis.addValidate2.location.x = coords[0];
            homeThis.addValidate2.location.y = coords[1];
          } else {
            homeThis.addValidate2.areaData[type].location.x = coords[0];
            homeThis.addValidate2.areaData[type].location.y = coords[1];
          }
        }
        com.jiusuo.map.tMap.getMouseCoordinate(getCoordFunction);

      }
    },
    created() {

    },
    mounted() {

    },


  }
</script>
<style lang="less">
  /* .vertical-center-modal {
     display: flex;
     align-items: center;
     justify-content: center;

   .ivu-modal {
     top: 0;
   }
   }*/
  #add-scenic-modal {
    background-color: aqua;
  }

  .ivu-tabs-content {

  }
</style>
<style scoped>
  .btn-box {
    text-align: right;
  }

  #map-box {
    width: 100%;
    height: 450px;
    border: 1px solid #ccc;
  }

  .mapTools {
    position: absolute;
    z-index: 3;
    width: 700px;
    left: 0;
    right: 0;
    top: 0px;
    margin: auto;
    height: 38px;
    line-height: 38px;
    color: #fff;
  }

  .mapTools ul li {
    float: left;
  }

  .iconItem {
    width: 40px;
    padding: 0 5px;

  }

  .mapTools .iconfont {
    font-size: 24px;

  }

  .mapTools .iconfont:hover {
    font-size: 30px;
    cursor: pointer;
  }

  .add-content {
    height: 480px;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .add-map-content {
    overflow: hidden;
    position: relative;
  }

  .read-show {
    display: none;
  }
  .cls-test{
    text-align: center;
    color: #ed4014;
    display: inline-block;
    width: 150px;
    height: 15px;
    margin:3px 0px 3px 30px;
  }
</style>

