<template>
    <div id="daypermanent">
      <div class="dataTitel">
        <span class="address-title">陕西省西安市{{areaName}}</span>
        <span class="time-title">{{titleTime}} 数据</span>
      </div>
      <div id="leftBack">
        <li @click="backIndexInfo">返回</li>
      </div>
      <div id="dayContent">
       <div class="mapContent">
         <div class="maptitle">
           行为特征/白天常住地
         </div>
         <div class="mapMain">
           <div class="mapData" id="mapData"ref="mapData"></div>
         </div>
       </div>
      <!--<div class="dayTabel">-->
        <!--<div class="fcs-table">-->
          <!--<Table :columns="columns8" :data="data5" size="small"></Table>-->
        <!--</div>-->
        <!--<div class="fcs-page" style="margin-top: 10px">-->
          <!--<Row type="flex" justify="end" align="middle" >-->
            <!--<Page :total="pageParams.total" show-total :page-size="pageParams.pageSize"-->
                  <!--:current="pageParams.current" show-elevator @on-change="changePage"></Page>-->
          <!--</Row>-->
        <!--</div>-->
      <!--</div>-->
      </div>
    </div>
</template>

<script>
    import {URL} from "../../../../api/urlsConfig"
    export default {
      name: "daypermanent",
      data(){
      return {
        date:'',
        titleTime:'',
        sendResult:'',
        areaName:'',
        pageParams : {
          total : 25,
          pageSize : 17,
          current : 1
        },
        data5:[],
        columns8:[
          {
            // type: 'index',
            title: "序号",
            width: 90,
            align: 'center',
            render:(h,params) => {
              return h('div',[
                h('span',(params.index+1)+this.pageParams.pageSize*(this.pageParams.current-1))
              ])
            }
          },
          {
            "title":"省份/省",
            "key":"省份",
            "width":115,


          },
          {
            "title":"人数/万",
            "key":"人数",
            "width":115,
            "sortable":true
          },
          {
            "title":"占比",
            "key":"占比",
            "width":150,

          },
        ],

      }
    },
      inject:[
        "initDate",
        "titletimes"
      ],
    created(){

    },
    watch:{

    },
    mounted(){
      if(this.$route.query.areaName!=''||this.$route.query.areaName!==undefined){
        this.areaName=this.$route.query.areaName;
      }else {
        this.areaName='';
      }
      //时间
      this.date=this.$route.query.date.replace(/-/g,'');
      // this.titleTime=this.date.substring(0,4)+'年'+this.date.substring(4,6)+'月'+this.date.substring(6)+'日';
      this.titleTime=this.date.substring(6)==''?this.date.substring(0,4)+'-'+this.date.substring(4,6)+'-':this.date.substring(0,4)+'-'+this.date.substring(4,6)+'-'+this.date.substring(6);

      initMap('mapData', true, false, true, false,URL.isDebug);
      // this.myEarchts()
      this.sendResult=this.$route.query.result
      let flag=this.$route.query.flag
      if(this.sendResult){
        // this.getPermanentData()
      }
      let parms={
        date:this.$route.query.date.replace(/-/g,''),
        flag:flag,
        code:this.$route.query.code
      }
      this.getHotMap(parms);
      this.getHotMap(parms);
    },
    methods:{
      //处理分页
      //分页
      changePage(current){
        this.pageParams.current = current;
        //"0"为非自动刷新
        // this.queryTaskList("0");
      },
      //返回
      backIndexInfo(){
        if(this.$route.query.istype=='pops'||this.$route.query.istype==undefined){
          this.$router.push({
            name: 'population',
            query:{
              istype:"pops",
              oldtypes:this.$route.query.oldtype,
              date:this.$route.query.oldtime
            }
          });
        }
      },
      //获取图标数据
      getPermanentData(){
        this.$http.request({
          method:'get',
          params:'',
          url:URL.queryDayPermanent,
          success:(data) => {
            let res =data.data;
            this.data5=res
          },
          error : (data) => {
            this.$Message.warning('请求数据失败！');
          }
        });
      },
      //
      getHotMap(parms){
        this.$http.request({
          method:'get',
          params:parms,
          url:URL.queryHeatMap,
          success:(data) => {
            showHeatMap(data.data);
          },
          error : (data) => {
            this.$Message.warning('请求数据失败！');
          }
        });
      },
      //map
      myEarchts(){
        let mych=this.$echarts.init(this.$refs.mapData);
        window.onresize=mych.resize;
        mych.setOption({         //配置项
          backgroundColor:"#fcf9f2",  //基本背景颜色
          tooltip:{},              //浮动窗，鼠标移入显示内容
          dataRange:{               // 阈值控件
            show:true,              //
            min:0,
            max:1000,
            text:['height','Low'],       //文本默认数值文本
            realtime:true,
            calculable: true,            //true为线性渐变
            color:['orangered','yellow','lightskyblue'],
            textStyle:{
              color:'#bcd6f6'
            }
          },
          toolbox:{
            show:true,
            orient:'horizontal', //布局方式，水平（vertical）,垂直（horizontal）
            x:'right',              //横向位置
            y:'top',              //纵向位置
            feature:{
              mark:{
                show:true,          //辅助线
              },
              dataView:{
                show:false,
                readOnly:true,
              },
              restore:{
                show:true
              },                //还原
              saveAsImage:{
                show:true            //保存为图片
              }

            }
          },
          geo:{
            //重点配置区域
            map:'china',   //表示中国地图
            roam:false,
            label:{
              normal:{
                show:true,    //是否显示对应地名
                textStyle:{
                  color:'#bcd6f6'
                }
              }
            },
            itemStyle:{
              normal:{
                borderColor:'rgba(0,0,0,0.2)'
              },
              emphasis:{
                areaColor:null,
                shadowOffsetX:0,
                shadowOffsetY:0,
                shadowBlur:20,
                borderWidth:0,
                shadowColor:'rgba(0,0,0,0.5)'
              }
            }
          },
          series:[
            // {
            //   type:'scatter',
            //   // map:'china',
            //   coordinateSystem:'geo',
            //   symbolSize:30,
            //   symbol:'image:../../assets/img/u90.jpg',
            //   symbolRotate:35,
            //   showEffectOn:'render',
            //   effectType:'ripple',
            //   rippleEffect:{
            //     period:4,
            //     scale:2.4,
            //     brushType:'stroke'
            //   },
            //   data:[
            //     {
            //       'name':'北京',
            //       'value':599
            //     },
            //     {
            //       "name":"上海",
            //       'value':142
            //   }]
            // },
            {
              name:'启动次数', //浮动框的标题
              type:'map',
              // mapType:'china',
              coordinateSystem:'geo',
              roam:true,
              geoIndex:0,

              itemStyle:{
                normal:{
                  label:{
                    // show:true,
                    formatter:'{b}\n{c}'
                  },
                  borderWidth:0.5,
                  borderColor:'#A1DFF2'
                },
                emphasis:{    //地图内强调的样式，悬浮式的样式显示
                  label:{
                    show:false
                  },
                  areaColor:'rgb(213,214,79)',
                  borderColor:'#1e90ff',
                  borderWidth:3
                }
              },

              data:[
                {
                  'name':'北京',
                  'value':599
                },
                {
                  "name":"上海",
                  'value':142
                }
              ]
            },
          ]

        })
        mych.on('click',function (param) {
          console.log(param)
        })
      },
    }
    }

</script>

<style scoped >


</style>
<style>


</style>
