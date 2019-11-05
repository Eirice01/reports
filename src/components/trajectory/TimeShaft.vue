<template>
    <div id="time-shaft">
      <Slider v-model="timeValue" :step="0.5" range :min="0" :max="24" show-stops @on-change="changeSlider" :marks="marks" :tip-format="tipFormat" :show-tip="'always'"></Slider>
      <div class="num-shaft">
        <div class="num-stop" v-for="(item,index) in numData" :style="{left:index*4.16667+'%'}" :class="(index>=timeValue[0]&&index<=timeValue[1]) ? 'active-num':''">{{item}}</div>
      </div>
     <!-- <vue-slider
        v-model="timeValue"
        direction="ltr"
        :width="15"
        :min="0"
        :max="24"
        :interval="0.5"
        :marks="marks2"
        :tooltip="'always'"
        :adsorb="true"
        @drag-end="changeSlider"
        style="display: inline-block; margin: 30px 0; width: 100%;">
      </vue-slider>-->
    </div>
</template>

<script>
    export default {
      name: "time-shaft",
      data(){
         return{
           timeValue:[0,24],
           numData:["0点","1点","2点","3点","4点","5点","6点","7点","8点","9点","10点","11点","12点","13点","14点","15点","16点","17点","18点","19点","20点","21点","22点","23点","24点"],
           marks2: {
             '0': {
               label: '0点',
               style: {

               },
               labelStyle: {
                 color:'#21f0f3'
               }
             },
             '24': {
               label: '24点',
               style: {

               },
               labelStyle: {
                 color:'#21f0f3'
               }
             },
           },
           marks:{
            0:"0点",
            24:{
              label: this.$createElement('strong','24点'),
              style: {
                color:'#21f0f3'
              },
            }
           },
           timeAgentValue:[0,24]

         }
      },
      methods:{
        /*松开滑块*/
        changeSlider(val){
          let time =[];
          val.forEach((v,i)=>{
            console.log(v)
            if(v.toString().indexOf('.')>=0){
              if(v.toString().split('.')[0].length==1){
                time[i]= '0'+v.toString().split('.')[0]+":30"
              }else{
                time[i]= v.toString().split('.')[0]+":30"
              }
            }else{
              if(v.toString().length==1){
                time[i] = '0'+v+':00'
              }else{
                time[i] = v+':00'
              }
            }
          })
          /*if(time[1].indexOf('30')>=0){
            time[1] = time[1].split(':')[0]+":00"
          }else{
            time[1] = (Number(time[1].split(':')[0])-1) +":30"
          }*/
          console.log(time)
          this.$emit("transferTime",time)
        },
        /*滑块提示框显示内容*/
        tipFormat(val){
          if(val.toString().indexOf('.')>=0){
            return val.toString().split('.')[0]+":30"
          }else{
            return val+':00'
          }
        }
      },
      created(){

      },
      mounted(){

      },
      beforeDestroy(){

      }
    }
</script>

<style scoped>
  .num-shaft{
    width: 100%;
    height: 14px;
    position: relative;
  }
  .num-stop{
    position: absolute;
    width: 30px;
    height: 14px;
    transform: translateX(-50%);
    color: #5A768C;
  }
  .active-num{
    color: #299FC2;
  }
  #time-shaft>>>.ivu-slider-stop{
    width: 10px;
    height: 10px;
    top: -3px;
    background-color: #163957;
    border: 1px solid #355787;
  }
  #time-shaft>>>.ivu-slider-wrap{
    background-color: #254554;
  }
  #time-shaft>>>.ivu-slider-bar{
    background: #00B0C4;
  }
</style>
