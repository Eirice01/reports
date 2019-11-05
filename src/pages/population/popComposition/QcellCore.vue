<template>
  <div id="qcellcore">
    <div id="originplace">
      <div class="Titelinfo">
        <span class="address-title" v-if="areaNames==undefined? true: false">陕西省西安市{{areaName}}</span>
        <span class="address-title" v-if="areaName==undefined? true: false">陕西省西安市{{areaNames}}</span>
        <span class="time-title">{{titleTime}} 数据</span>
      </div>
      <div id="leftBack">
        <li @click="backIndexInfo">返回</li>
      </div>
      <div id="fesContent">
        <div class="fesContentTitle">
          <li class="fes-title">
            人口构成-归属地（详细信息）
          </li>
        </div>
        <li class="fes-searche">
          <div class="searchemian">
            <div class="searchePop">
              <Select v-model="sendvalue" filterable multiple @on-change="sendProCode" v-show="!isWord">
                <Option v-for="(item,index) in data2" :value="item.cityCode" :key="index" >{{item.cityName}}</Option>
              </Select>
              <Select v-model="sendvalue" filterable multiple @on-change="sendCountryCode" v-show="isWord">
                <Option v-for="(item,index) in data1" :value="item.abbreviation" :key="index" >{{item.countryName}}</Option>
              </Select>
            </div>
            <span class="fes-butn" @click="senCityDta" v-show="!isWord"><Icon type="ios-search"  /></span>
            <span class="fes-butn" @click="senCountryDta" v-show="isWord"><Icon type="ios-search" /></span>
          </div>
        </li>
        <div class="fes-tableInfo">
          <div class="fes-tablebody">
            <Table stripe  :columns="columns3" :data="dataCountry" size="small"  @on-row-click="changetable" v-show="isWord">
            </Table>
            <Table stripe  :columns="columnslx" :data="dataPro" size="small" @on-row-dblclick="changword" v-show="!isWord">
            </Table>
          </div>
          <!--国家分页-->
          <div class="fes-page" style="margin-top: 10px" v-show="isWord" >
            <Row type="flex" justify="end" align="middle" >
              <Page :total="pageParams.totalCount" show-total  size="small" :page-size="pageParams.pageSize"
                    :current="pageParams.current"  @on-change="changePage"></Page>
            </Row>
          </div>
          <!--省份分页-->
          <div class="fes-page" style="margin-top: 10px" v-show="!isWord">
            <Row type="flex" justify="end" align="middle" >
              <Page :total="pageCitys.totalCount" show-total  size="small" :page-size="pageCitys.pageSize"
                    :current="pageCitys.current"  @on-change="changePagepro"></Page>
            </Row>
          </div>
        </div>

      </div>
      </div>
    </div>
</template>

<script>
  import {URL} from '../../../../api/urlsConfig'
  export default {
    name: "qcellcore",
    data(){
      return {
        sendvalue:'',
        isWord:true,
        prolist:'',
        countrylist:'',
        date:'',
        areaName:'',
        areaNames:'',
        dataCountry:[],
        dataPro:[],
        data1:[],
        titleTime:'',
        pageParams : {
          totalCount :0,
          pageSize :20,
          current : 1
        },
        pageCitys:{
          totalCount :0,
          pageSize :20,
          current : 1
        },
        data2:[],
        sendResult:'',
        columns3:[
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
            "title":"国家",
            "key":"countryName",
            "align":'center',
            render:(h,params) => {
              if(params.row.china==false){
                return h('div',[
                  h('span',(params.row.countryName))
                ])
              }
              if(params.row.china==true){
                return h('div',[
                  h('span',(params.row.countryName))
                ])
              }

            }

          },

          {
            "title":"人数/人",
            "key":"peopleNums",
            // "sortable":true,
            "align":'center',
          },
          {
            "title":"占比",
            "key":"ratio",
            "align":'center',
          },
        ],
        columnslx:[
          {
            // type: 'index',
            title: "序号",
            width: 90,
            align: 'center',
            render:(h,params) => {
              return h('div',[
                h('span',(params.index+1)+this.pageCitys.pageSize*(this.pageCitys.current-1)),
              ])

            } ,
          },
          {
            "title":"省份",
            "key":"privinceName",
            "align":'center',


          },
          {
            "title":"地市",
            "key":"cityName",
            "align":'center',
          },
          {
            "title":"人数/人",
            "key":"peopleNums",
            // "sortable":true,
            "align":'center',
          },
          {
            "title":"占比",
            "key":"ratio",
            "align":'center',
          },
        ],

        isShowcader:true,
        isreal:'',
        isreData:'',
      }
    },
    inject:[
      "initDate",
      "titletimes"
    ],
    created(){

    },
    mounted(){
      if(this.$route.query.areaName!=''||this.$route.query.areaName!==undefined){
        this.areaName=this.$route.query.areaName;
      }else {
        this.areaName='';
      }
      if(this.$route.query.areaNames!=''||this.$route.query.areaNames!==undefined){
        this.areaNames=this.$route.query.areaNames;
      }else {
        this.areaNames='';
      }
      if(this.$route.query.sendData!=undefined&&this.$route.query.isTypes==true){
        this.titleTime=this.$route.query.sendData;
      }else {
        this.date=this.$route.query.date.replace(/-/g,'');
        // this.titleTime=this.date.substring(0,4)+'年'+this.date.substring(4,6)+'月'+this.date.substring(6)+'日';
        this.titleTime=this.date.substring(6)==''?this.date.substring(0,4)+'-'+this.date.substring(4,6)+'-':this.date.substring(0,4)+'-'+this.date.substring(4,6)+'-'+this.date.substring(6);
      }

      this.getCutrySelectData();
      //列表数据初始化
      this.sendResult=this.$route.query.istype
      this.isreal=this.$route.query.isTypes;
      this.isreData=this.$route.query.sendData;
      let parms={};
      let url="";
      if(this.sendResult=="pops"||this.sendResult==undefined){
        //人口页面时参数配置
        url=URL.queryConstituteList;
          parms={
            code:this.$route.query.code,
            cityName:'',
            flag:1,
            date:this.date,
            pageSize:this.pageParams.pageSize,
            currPage:1
          }
      }else if(this.sendResult=="tours"){
        //旅游页面时参数配置
        url=URL.querytourConstituteList;
        if(this.isreal){
          parms={
            code:this.$route.query.code,
            cityName:'',
            flag:1,
            date:this.isreData,
            pageSize:this.pageParams.pageSize,
            currPage:1,
            isRealtime:false,
          }
        }else {
          parms={
            code:this.$route.query.code,
            cityName:'',
            flag:1,
            date:this.$route.query.date,
            pageSize:this.pageParams.pageSize,
            currPage:1,
            isRealtime:false
          }
        }

      }
      this.getqcellData(parms,url)
    },
    methods:{
      //获取选择的省份
      sendProCode(option){
        this.prolist=option.join(",");
      },
      //获取世界选择
      sendCountryCode(option){
        this.countrylist=option.join(",");
      },
      //获取国家下拉数据
      getCutrySelectData(){
        this.$http.request({
          method:'get',
          params:{
            pid:1,
            flag:1
          },
          url:URL.queryCountryData,
          success:(data) => {
            if(data.code==200){
              let res =data.data;
              this.data1=res;
            }
          },
          error : (data) => {
            this.$Message.warning('请求数据失败！');
          }
        });
      },
      //获取归属地中省份下拉数据
      getProSelectData(){
        this.$http.request({
          method:'get',
          params:{
            pid:1,
            flag:1
          },
          url:URL.querySourceData,
          success:(data) => {
            if(data.code==200){
              let res =data.data;
              this.data2=res;
            }
          },
          error : (data) => {
            this.$Message.warning('请求数据失败！');
          }
        });
      },
      //发送查询世界级信息
      senCountryDta(){
          let parms={};
          let url="";
          if(this.sendResult=="pops"||this.sendResult==undefined){
            //人口页面时参数配置
            url=URL.queryConstituteList;
            parms={
              code:this.$route.query.code,
              cityName:'',
              flag:1,
              date:this.date,
              currPage:1,
              proIdOrAbbreviation:this.countrylist,
            }
          }else if(this.sendResult=="tours"){
            //旅游页面时参数配置
            url=URL.querytourConstituteList;
            if(this.isreal){
              parms={
                code:this.$route.query.code,
                cityName:'',
                flag:1,
                date:this.isreData,
                currPage:1,
                proIdOrAbbreviation:this.countrylist,
                isRealtime:false
              }
            }else {
              parms={
                code:this.$route.query.code,
                cityName:'',
                flag:1,
                date:this.$route.query.date,
                currPage:1,
                proIdOrAbbreviation:this.countrylist,
                isRealtime:false
              }
            }

          }
          this.getqcellData(parms,url)
      },
      //发送查询的省市级信息
      senCityDta(){
          let parms={};
          let url="";
          if(this.sendResult=="pops"||this.sendResult==undefined){
            //人口页面时参数配置
            url=URL.queryProvinceCityList;
              parms={
                code:this.$route.query.code,
                cityName:'',
                flag:1,
                date:this.date,
                currPage:1,
                proIdOrAbbreviation:this.prolist,
              }
          }else if(this.sendResult=="tours"){
            //旅游页面时参数配置
            url=URL.queryTourCityList;
            if(this.isreal){
              parms={
                code:this.$route.query.code,
                cityName:'',
                flag:1,
                date:this.isreData,
                currPage:1,
                proIdOrAbbreviation:this.prolist,
                isRealtime:false
              }
            }else {
              parms={
                code:this.$route.query.code,
                cityName:'',
                flag:1,
                date:this.$route.query.date,
                currPage:1,
                proIdOrAbbreviation:this.prolist,
                isRealtime:false
              }
            }

          }
          this.getProCityData(parms,url)
      },
      //双击还原会原来表格
      changword(value,index){
        let parms={};
        let url="";
        if(this.sendResult=="pops"||this.sendResult==undefined){
          //人口页面时参数配置
          url=URL.queryConstituteList;
            parms={
              code:this.$route.query.code,
              cityName:'',
              flag:1,
              date:this.date,
              pageSize:this.pageParams.pageSize,
              currPage:1,
              proIdOrAbbreviation:'',
            }
        }else if(this.sendResult=="tours"){
          //旅游页面时参数配置
          url=URL.querytourConstituteList;
          if(this.isreal){
            parms={
              code:this.$route.query.code,
              cityName:'',
              flag:1,
              date:this.isreData,
              pageSize:this.pageParams.pageSize,
              currPage:1,
              proIdOrAbbreviation:'',
              isRealtime:false
            }
          }else {
            parms={
              code:this.$route.query.code,
              cityName:'',
              flag:1,
              date:this.$route.query.date,
              pageSize:this.pageParams.pageSize,
              currPage:1,
              proIdOrAbbreviation:'',
              isRealtime:false
            }
          }

        }
        this.isWord=true;
        this.getCutrySelectData();
        this.getqcellData(parms,url)
      },
      //根据条件更换表格
      changetable(value,index){
        if(value.countryAbbreviation=="CN"){
          this.isWord=false;
          this.getProSelectData()
          let parms={};
          let url="";
          if(this.sendResult=="pops"||this.sendResult==undefined){
            //人口页面时参数配置
            url=URL.queryProvinceCityList;
              parms={
                code:this.$route.query.code,
                cityName:'',
                flag:1,
                date:this.date,
                pageSize:this.pageCitys.pageSize,
                currPage:1,
                proIdOrAbbreviation:'',
              }
          }else if(this.sendResult=="tours"){
            //旅游页面时参数配置
            url=URL.queryTourCityList;
            if(this.isreal){
              parms={
                code:this.$route.query.code,
                cityName:'',
                flag:1,
                date:this.isreData,
                pageSize:this.pageCitys.pageSize,
                currPage:1,
                proIdOrAbbreviation:'',
                isRealtime:false
              }
            }else {
              parms={
                code:this.$route.query.code,
                cityName:'',
                flag:1,
                date:this.$route.query.date,
                pageSize:this.pageCitys.pageSize,
                currPage:1,
                proIdOrAbbreviation:'',
                isRealtime:false
              }
            }

          }
          this.getProCityData(parms,url)
        }
      },
      //国家级处理分页
      changePage(current){
        this.pageParams.current = current;
        let parms={};
        let url="";
        if(this.sendResult=="pops"||this.sendResult==undefined){
          //人口页面时参数配置
          url=URL.queryConstituteList;
            parms={
              code:this.$route.query.code,
              cityName:'',
              flag:1,
              date:this.date,
              pageSize:this.pageParams.pageSize,
              currPage:this.pageParams.current,
              proIdOrAbbreviation:this.countrylist,
            }
        }else if(this.sendResult=="tours"){
          //旅游页面时参数配置
          url=URL.querytourConstituteList;
          if(this.isreal){
            parms={
              code:this.$route.query.code,
              cityName:'',
              flag:1,
              date:this.isreData,
              pageSize:this.pageParams.pageSize,
              currPage:this.pageParams.current,
              proIdOrAbbreviation:this.countrylist,
              isRealtime:false
            }
          }else {
            parms={
              code:this.$route.query.code,
              cityName:'',
              flag:1,
              date:this.$route.query.date,
              pageSize:this.pageParams.pageSize,
              currPage:this.pageParams.current,
              proIdOrAbbreviation:this.countrylist,
              isRealtime:false
            }
          }
        }
        this.getqcellData(parms,url)
      },
      //省份级处理分页
      changePagepro(current){
        this.pageCitys.current=current;
        let parms={};
        let url="";
        if(this.sendResult=="pops"||this.sendResult==undefined){
          //人口页面时参数配置
          url=URL.queryProvinceCityList;

            parms={
              code:this.$route.query.code,
              cityName:'',
              flag:1,
              date:this.date,
              // pageSize:this.pageCitys.pageSize,
              currPage:this.pageCitys.current,
              proIdOrAbbreviation:this.prolist,
            }
        }else if(this.sendResult=="tours"){
          //旅游页面时参数配置
          url=URL.queryTourCityList;
          if(this.isreal){
            parms={
              code:this.$route.query.code,
              cityName:'',
              flag:1,
              date:this.isreData,
              // pageSize:this.pageCitys.pageSize,
              currPage:this.pageCitys.current,
              proIdOrAbbreviation:this.prolist,
              isRealtime:false
            }
          }else {
            parms={
              code:this.$route.query.code,
              cityName:'',
              flag:1,
              date:this.$route.query.date,
              // pageSize:this.pageCitys.pageSize,
              currPage:this.pageCitys.current,
              proIdOrAbbreviation:this.prolist,
              isRealtime:false
            }
          }

        }
        this.getProCityData(parms,url)
      },

      //获取中国省份地市数据
      getProCityData(parms,url){
        this.$http.request({
          method:'get',
          params:parms,
          url:url,
          success:(data) => {
            if(data.code==200){
              let res =data.data;
              this.dataPro=res.list;
              this.pageCitys.totalCount=parseInt(res.totalCount);
              this.pageCitys.pageSize=parseInt(res.pageSize);
              // this.pageCitys.current=parseInt(res.currPage);
            }
          },
          error : (data) => {
            this.$Message.warning('请求数据失败！');
          }
        });
      },
      //获取世界国家数据
      getqcellData(parms,url){
        //真是接口使用后台联调时请使用queryConstituteList
        this.$http.request({
          method:'get',
          params:parms,
          url:url,
          success:(data) => {
            if(data.code==200){
              let res =data.data;
              this.dataCountry=res.list
              this.pageParams.totalCount=parseInt(res.totalCount);
              this.pageParams.pageSize=parseInt(res.pageSize);
              // this.pageParams.current=parseInt(res.currPage)
            }
          },
          error : (data) => {
            this.$Message.warning('请求数据失败！');
          }
        });
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
              // date:this.$route.query.date
            }
          });
        }else if(this.$route.query.istype=='tours'){
          this.$router.push({
            name: 'tour',
            query:{
              istype:"tours",
              oldstatus:this.$route.query.oldstatus,
              oldtypes:this.$route.query.oldtype,
              date:this.$route.query.oldtime
              // date:this.$route.query.date
            }
          });
        }

      },
    }
  }
</script>

<style scoped>

</style>

