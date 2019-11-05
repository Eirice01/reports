<template>
  <div id="people-source">
    <div class="check-list-title">
        <span class="check-list-title-left">
          <!--<span class="item-warn" v-show="this.$route.query.type=='pop'">*</span>-->
          人口来源：
        </span>
      <span class="check-list-title-right">
        <div class="list-box" style="margin-bottom: 5px;display: inline-block">
        <!--<Button  size="small" @click="selectSourceType('0')" :class="showSource=='0' ? 'btn-active':''" v-if="isFlager==0?true:false" disabled>来源地</Button>-->
        <!--<Button  size="small" @click="selectSourceType('1')" :class="showSource=='1' ? 'btn-active':''" v-if="isFlager==1?true:false" disabled>归属地</Button>-->
          <Button  size="small" @click="selectSourceType('0')" class="btn-active" v-if="isFlager==0?true:false" disabled>来源地</Button>
          <Button  size="small" @click="selectSourceType('1')" class="btn-active" v-if="isFlager==1?true:false" disabled>归属地</Button>
      </div>
      </span>
    </div>
    <div class="check-list-content">
    </div>
  </div>
</template>

<script>
  /*import {city} from "../../../static/map/city";*/
  import {URL} from '../../../api/urlsConfig'
  export default {
    name: "condition-of-source",
    data(){
      return{
        showSource:'',
        sourceValue: [],
        source:[],
        belongValue:[],
        sourceData:[],
        belongData:[],
        placeName:"",
        source:""
      }
    },
    props:[
      'sourceMulti',
      'isFlager'
    ],
    watch:{
      isFlager:function () {
        if(this.isFlager==0){
          this.showSource=0;
        }
        if(this.isFlager==1){
          this.showSource=1;
        }
      }
    },
    methods:{

      //获取来源地，归属地级联数据
      queryCascadeData(num){
        this.$http.request({
          method:'get',
          params:{flag:num},//flag 0来源地 1归属地
          url:URL.queryCascadeData,
          success:(data) => {
            if(data.code==200){
              if(num=="0"){
                this.sourceData = data.data;
              }else{
                this.belongData =data.data;
              }
            }

          },
          error : (data) => {
          }
        });
      },
      //来源归属切换
      selectSourceType(flag){
        this.showSource=flag;
        if(this.sourceData.length==0&&flag=='0'){
          // this.queryCascadeData("0")
        }else if(this.belongData.length==0&&flag=='1'){
          // this.queryCascadeData("1")
        }
      },

      //级联选择
      changeSelect(value,data){
        //console.log(value,data);
        if(data.length!=0&&data[data.length-1].__label!=undefined){
          this.placeName =data[data.length-1].__label ;
        }

      },
      //级联多选
      changeSelectMulti(value,data){
        let labels =[]
        for(let i=0; i<value.length; i++){
          for(let j=0;j<data.length; j++){
            if(value[i]==data[j].value){
              labels.push(data[j].label);
            }else{
              if(data[j].children!=undefined){
                for(let z=0;z<data[j].children.length; z++){
                  if(value[i]==data[j].children[z].value){
                    labels.push(data[j].children[z].label);
                  }
                }
              }
            }
          }
        };
        this.placeName =labels.join(',') ;
      },

    },
    created(){
      // this.queryCascadeData("0")//来源地级联数据
    },
    mounted(){

    }
  }
</script>

<style scoped>
  #people-source{
    width: 100%;
  }
</style>
