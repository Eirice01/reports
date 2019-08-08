<template>
  <div id="addScenic">
    <Modal
      v-model="getAddScenicState"
      :title="title"
      width="1400"
      id="add-scenic-modal"
      @on-ok="addOk"
      @on-cancel="addCancel"
    >
      <div>
        <Form ref="addValidate2" :model="addValidate2"  :label-width="100">
          <FormItem label="景区名称：" prop="name" :rules="{required: true, message: '景区名称不能为空', trigger: 'blur'}">
            <Input v-model="addValidate2.name" placeholder="请输入景区名称" style="width: 590px;" :readonly="readShow"></Input>
          </FormItem>
          <Row>
            <Col span="12">
            <div class="add-content" style="padding-right: 10px;">
              <div style="text-align: right;padding: 5px;" :class="readShow ? 'read-show':''">
                <span style="display: inline-block;vertical-align: middle">
                  <Input v-model="addValidate2.location.x" placeholder="请输入经度" style="width: 200px;">
                    <span slot="prepend">经度：</span>
                  </Input>
                </span>
                <span  style="display: inline-block;vertical-align: middle">
                  <Input v-model="addValidate2.location.y" placeholder="请输入目的地纬度" style="width: 200px;">
                    <span slot="prepend">纬度：</span>
                  </Input>
                </span>
                <Button @click="getLocation('all')">
                  获取经纬度
                  <!--<span style="color: #515a6e;"><Icon type="md-pin"></Icon></span>-->
                </Button>
                <Button type="info" @click="regionMap('all')" size="small">框入</Button>
              </div>
              <FormItem label="整体边界：" class="item-text">
                <Row>
                  <Col span="24">
                  <FormItem prop="allBorder">
                    <Input v-model="addValidate2.allBorder"  type="textarea" :autosize="{minRows:6,maxRows:6}"
                           placeholder="[边界] 格式: xxx._xx" :readonly="readShow"></Input>
                  </FormItem>
                  </Col>
                </Row>
              </FormItem>
              <FormItem label="整体基站：" class="item-text">
                <Row :gutter="16">
                  <Col span="7">
                  <FormItem prop="yLacci">
                    <Input v-model="addValidate2.yLacci" type="textarea" :autosize="{minRows:6,maxRows:6}"
                           placeholder="[移动] 格式: LAC_CI" :readonly="readShow"></Input>
                  </FormItem>
                  </Col>
                  <Col span="7">
                  <FormItem prop="lLacci">
                    <Input v-model="addValidate2.lLacci" type="textarea" :autosize="{minRows:6,maxRows:6}"
                           placeholder="[联通] 格式: LAC_CI" :readonly="readShow"></Input>
                  </FormItem>
                  </Col>
                  <Col span="7">
                  <FormItem prop="dLacci">
                    <Input v-model="addValidate2.dLacci" type="textarea" :autosize="{minRows:6,maxRows:6}"
                           placeholder="[电信] 格式: LAC_CI" :readonly="readShow"></Input>
                  </FormItem>
                  </Col>
                </Row>
              </FormItem>
              <div v-for="(item,index) in addValidate2.areaData">
                <FormItem label="区域名称：" :prop="'areaData.'+index+'.areaName'" :rules="{required: true, message: '区域名称不能为空', trigger: 'blur'}">
                  <Input v-model="addValidate2.areaData[index].areaName" placeholder="请输入区域名称" :readonly="readShow"></Input>
                </FormItem>
                <div style="text-align: right;padding: 5px;" :class="readShow ? 'read-show':''">
                  <span style="display: inline-block;vertical-align: middle">
                  <Input v-model="addValidate2.areaData[index].location.x" placeholder="请输入经度" style="width: 200px;">
                    <span slot="prepend">经度：</span>
                    </Input>
                  </span>
                    <span  style="display: inline-block;vertical-align: middle">
                    <Input v-model="addValidate2.areaData[index].location.y" placeholder="请输入目的地纬度" style="width: 200px;">
                      <span slot="prepend">纬度：</span>
                    </Input>
                  </span>
                  <Button  @click="getLocation(index)">
                    获取经纬度
                  </Button>
                  <Button type="info" @click="regionMap(index)" size="small">框入</Button>
                </div>
                <FormItem label="区域边界：" class="item-text">
                  <Row>
                    <Col span="24">
                    <FormItem :prop="'areaData.'+index+'.areaBorder'"
                              :rules="{ validator:addRule2.areaBorder[0].validator,}">
                      <Input v-model="addValidate2.areaData[index].areaBorder" type="textarea"
                             :autosize="{minRows:6,maxRows:6}" placeholder="[边界] 格式: LAC_CI" :readonly="readShow"></Input>
                    </FormItem>
                    </Col>
                  </Row>
                </FormItem>
                <FormItem label="区域基站：" class="item-text">
                  <Row :gutter="16">
                    <Col span="7">
                    <FormItem :prop="'areaData.'+index+'.yLacciArea'"
                              :rules="{ validator:addRule.yLacciArea[0].validator,}">
                      <Input v-model="addValidate2.areaData[index].yLacciArea" type="textarea"
                             :autosize="{minRows:6,maxRows:6}" placeholder="[移动] 格式: LAC_CI" :readonly="readShow"></Input>
                    </FormItem>
                    </Col>
                    <Col span="7">
                    <FormItem :prop="'areaData.'+index+'.lLacciArea'"
                              :rules="{ validator:addRule.lLacciArea[0].validator,}">
                      <Input v-model="addValidate2.areaData[index].lLacciArea" type="textarea"
                             :autosize="{minRows:6,maxRows:6}" placeholder="[联通] 格式: LAC_CI" :readonly="readShow"></Input>
                    </FormItem>
                    </Col>
                    <Col span="7">
                    <FormItem :prop="'areaData.'+index+'.dLacciArea'"
                              :rules="{ validator:addRule.dLacciArea[0].validator,}">
                      <Input v-model="addValidate2.areaData[index].dLacciArea" type="textarea"
                             :autosize="{minRows:6,maxRows:6}" placeholder="[电信] 格式: LAC_CI" :readonly="readShow"></Input>
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
      <div slot="footer" v-if="readShow">

      </div>
    </Modal>
  </div>
</template>

<script>
  import {URL} from '../../../api/urlsConfig'

  export default {
    name: "add-scenic",
    data() {
      return {
        title:"新增景区",
        type: "name1",
        areaId:"",
        addRule0: {
          name: [
            {required: true, message: '景区名称不能为空', trigger: 'blur'}
          ]
        },
        addValidate: {
          name: "",
          yLacci: "",
          lLacci: "",
          dLacci: "",
          areaData: [
            {
              areaName: "",
              yLacciArea: "",
              lLacciArea: "",
              dLacciArea: "",

            }
          ]
        },
        addRule: {
          name: [
            {required: true, message: '景区名称不能为空', trigger: 'blur'}
          ],
          areaName: [
            {required: true, message: '区域名称不能为空', trigger: 'blur'}
          ],
          yLacci: [
            {
              validator: (rule, value, callback) => {
                var pattern = /^([0-9]+_[0-9]+\s*)(,+[0-9]+_[0-9]+\s*)*\s*$/;
                if (value.length != 0 && !pattern.test(value)) {
                  callback("请输入有效的LAC_CI,多个号码间用,隔开！")
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
                var pattern = /^([0-9]+_[0-9]+\s*)(,+[0-9]+_[0-9]+\s*)*\s*$/;
                if (value.length != 0 && !pattern.test(value)) {
                  callback("请输入有效的LAC_CI,多个号码间用,隔开！")
                } else {
                  callback();
                }
              }
            }
          ],
          dLacci: [
            {
              validator: (rule, value, callback) => {
                var pattern = /^([0-9]+_[0-9]+\s*)(,+[0-9]+_[0-9]+\s*)*\s*$/;
                if (value.length != 0 && !pattern.test(value)) {
                  callback("请输入有效的LAC_CI,多个号码间用,隔开！")
                } else {
                  callback();
                }
              }
            }
          ],
          yLacciArea: [
            {
              validator: (rule, value, callback) => {
                var pattern = /^([0-9]+_[0-9]+\s*)(,+[0-9]+_[0-9]+\s*)*\s*$/;
                if (value.length != 0 && !pattern.test(value)) {
                  callback("请输入有效的LAC_CI,多个号码间用,隔开！")
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
                  callback("请输入有效的LAC_CI,多个号码间必须换行！")
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
                  callback("请输入有效的LAC_CI,多个号码间必须换行！")
                } else {
                  callback();
                }
              }
            }
          ],
        },
        addValidate2: {
          name:"",
          createDate:'',
          allBorder: "",
          yLacci: "",
          lLacci: "",
          dLacci: "",
          location:{
            x:"",
            y:""
          },
          areaData: [
            {
              areaName: "",
              createDate:'',
              areaBorder: "",
              yLacciArea: "",
              lLacciArea: "",
              dLacciArea: "",
              location:{
                x:"",
                y:""
              }
            }
          ],
        },
        addRule2: {
          allBorder: [
            {
              validator: (rule, value, callback) => {
                  callback();
                /*var pattern = /^([0-9]+_[0-9]+\s*)(\n+[0-9]+_[0-9]+\s*)*\s*$/;
                if (value.length != 0 && !pattern.test(value)) {
                  callback("请输入有效的边界,多个号码间必须换行！")
                }
                else {
                  callback();
                }*/
              }
            }
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
                var pattern = /^([0-9]+_[0-9]+\s*)(,+[0-9]+_[0-9]+\s*)*\s*$/;
                if (value.length != 0 && !pattern.test(value)) {
                  callback("请输入有效的LAC_CI,多个号码间用,隔开！")
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
                var pattern = /^([0-9]+_[0-9]+\s*)(,+[0-9]+_[0-9]+\s*)*\s*$/;
                if (value.length != 0 && !pattern.test(value)) {
                  callback("请输入有效的LAC_CI,多个号码间用,隔开！")
                } else {
                  callback();
                }
              }
            }
          ],
          dLacci: [
            {
              validator: (rule, value, callback) => {
                var pattern = /^([0-9]+_[0-9]+\s*)(,+[0-9]+_[0-9]+\s*)*\s*$/;
                if (value.length != 0 && !pattern.test(value)) {
                  callback("请输入有效的LAC_CI,多个号码间用,隔开！")
                } else {
                  callback();
                }
              }
            }
          ],
          yLacciArea: [
            {
              validator: (rule, value, callback) => {
                var pattern = /^([0-9]+_[0-9]+\s*)(,+[0-9]+_[0-9]+\s*)*\s*$/;
                if (value.length != 0 && !pattern.test(value)) {
                  callback("请输入有效的LAC_CI,多个号码间用,隔开！")
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
                  callback("请输入有效的LAC_CI,多个号码间必须换行！")
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
                  callback("请输入有效的LAC_CI,多个号码间必须换行！")
                } else {
                  callback();
                }
              }
            }
          ],
        },
        firstClick: true,
        chooseBorder:"all",
        coords:"",
        readShow:false,

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
      //添加景区确定
      addOk() {
        this.$refs["addValidate2"].validate((valid) => {
          if (valid) {
            let params = {
              areaId:this.areaId,
              areaName: this.addValidate2.name,
              createDate:this.addValidate2.createDate,
              nodes: this.addValidate2.allBorder,
              lon:this.addValidate2.location.x,
              lat:this.addValidate2.location.y,
              stations :{
                M:this.addValidate2.yLacci.split(','),
                U:this.addValidate2.lLacci.split(','),
                T:this.addValidate2.dLacci.split(',')
              },
              subAreaList:[]
            }
            this.addValidate2.areaData.forEach((item,index)=>{
              if(item.areaName!=""){
                params.subAreaList.push({
                  areaId:item.areaId,
                  areaName:item.areaName,
                  createDate:item.createDate,
                  nodes: item.areaBorder,
                  lon:item.location.x,
                  lat:item.location.y,
                  stations:{
                    M:item.yLacciArea.split(','),
                    U:item.lLacciArea.split(','),
                    T:item.dLacciArea.split(',')
                  }
                })
              }
            })
            this.$http.request({
              method: 'post',
              data: params,
              url: this.areaId=="" ? URL.addScenicData: URL.update,
              success: (data) => {
                if (data.code == 200) {
                  this.$Message.success("提交成功！")
                  this.$store.commit('showAddScenicModal', false);
                  //调接口
                  this.$emit("queryScenicData");
                  //重置
                  this.addCancel();
                }else{
                  this.$Message.success(data.msg)
                }
              },
              error: (data) => {
                this.$Message.warning('请求数据失败！');
              }
            });
          }
        })
      },
      //添加景区取消
      addCancel() {
        this.addValidate2={
          name: "",
          allBorder: "",
          yLacci: "",
          lLacci: "",
          dLacci: "",
          location:{
            x:"",
            y:""
          },
          areaData: [
            {
              areaName: "",
              areaBorder: "",
              yLacciArea: "",
              lLacciArea: "",
              dLacciArea: "",
              location:{
                x:"",
                y:""
              }
            }
          ]
        }
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
            location:{
              x:"",
              y:""
            }
          }
        )
      },
      //经纬度删除区域
      delAreaPoints(){
        if(this.addValidate2.areaData.length>0){
          this.addValidate2.areaData.splice((this.addValidate2.areaData.length-1))
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
      checkScenicData(id,flag,title){
        this.areaId =id;
        let params={
          areaId:id
        }
        this.$http.request({
          method: 'get',
          params: params,
          url: URL.find,
          success: (data) => {
            if(data.code == 200) {
              let res = data.data;
              this.readShow =flag;
              this.title = title;
              this.addValidate2.name = res.areaName;
              this.addValidate2.createDate = res.createDate;
              this.addValidate2.allBorder  =res.nodes;
              this.addValidate2.yLacci= res.stations.M.join(',');
              this.addValidate2.lLacci= res.stations.T.join(',');
              this.addValidate2.dLacci= res.stations.U.join(',');
              this.addValidate2.location.x = res.lon;
              this.addValidate2.location.y = res.lat;
              this.addValidate2.areaData=[];
              showPolygon(res.nodes);
              res.subAreaList.forEach((item,index)=>{
                this.addValidate2.areaData.push({
                  areaId: item.areaId,
                  areaName: item.areaName,
                  createDate: item.createDate,
                  areaBorder: item.nodes,
                  yLacciArea: item.stations.M.join(','),
                  lLacciArea: item.stations.T.join(','),
                  dLacciArea: item.stations.U.join(','),
                  location:{
                    x:item.lon,
                    y:item.lat,
                  }
                })
                showPolygon(item.nodes);
              })
            }
          },
          error: (data) => {
            this.$Message.warning('请求数据失败！');
          }
        });
      },
      //框入
      regionMap(index){
        if(index=='all'){
          this.addValidate2.allBorder = this.coords;
        }else{
          this.addValidate2.areaData[index].areaBorder =this.coords;
        }
      },
      //获取经纬度
      getLocation(type){
        var homeThis = this;
        var getCoordFunction = function(coords){
          if(type == 'all'){
            homeThis.addValidate2.location.x = coords[0];
            homeThis.addValidate2.location.y = coords[1];
          }else {
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
  #add-scenic-modal{
    background-color: aqua;
  }
  .ivu-tabs-content{

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
  .add-content{
    height: 480px;
    overflow-y: auto;
    overflow-x: hidden;
  }
  .add-map-content{
    overflow: hidden;
    position: relative;
  }
  .read-show{
    display: none;
  }
</style>

