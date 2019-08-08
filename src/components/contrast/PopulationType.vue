<template>
    <div id="people-type">
      <div class="check-list-title">
        <span class="check-list-title-left"><span class="item-warn">*</span>{{typeTitle}}：</span>
        <span class="check-list-title-right"></span>
      </div>
      <div class="check-list-content">
        <div class="list-box">
          <label  v-for="item in peopleType" class="checkBoxStyle" :key="item.code" :class="item.checked==true ? 'label-active':''" @click="selectPeopleLabel(item)">{{item.name}}</label>
        </div>
      </div>
    </div>
</template>

<script>
  import {URL} from '../../../api/urlsConfig'
    export default {
      name: "population-type",
      data(){
        return{
          peopleType:[

          ],
          peopleTypeData:[],
          selectItem:[],
          selectIds:[],
          typeTitle:this.$route.query.type == "pop" ? '人口类别':'景区人口类别',
        }
      },
      props:[
        "typeMulti"
      ],
      watch:{
        '$route':function() {
          this.typeTitle = this.$route.query.type == "pop" ?  '人口类别':'景区人口类别';
          this.queryPeopleType();
        }
      },
      methods:{
        //获取人口类别数据
        queryPeopleType(){
          let url =""
          switch (this.$route.query.type){
            case "pop":
              url= URL.queryPeopleType;
              break;
            case "tour":
              url= URL.getScenicTypeList;
              break;
          }
          this.$http.request({
            method:'get',
            params:{},
            url:url,
            success:(data) => {
              if(!!data.data){
                let res  =data.data;
                res.forEach((item)=>{
                  item.checked = false;
                })
                this.peopleType = res;
              }

            },
            error : (data) => {
            }
          });
        },
        //选择人口类别标签
        selectPeopleLabel(item){
          if(this.typeMulti){//多选
           item.checked =!item.checked;
           this.selectItem =this.selectItem.filter(data=>{return data.name!=item.name});
           if(item.checked){
             this.selectItem.push(item);
           }
          }else{//单选
            if(this.selectItem.length==0){
              this.selectItem.push(item);
            }else if(this.selectItem.length==1){
              if(this.selectItem[0].name==item.name){
                this.selectItem = []
              }else{
                this.selectItem[0].checked =false;
                this.selectItem =[item];
              }
            }
            item.checked =!item.checked;
          }
          //console.log(this.selectItem);

        },
        /*selectPeopleLabel(item){
          if(this.typeMulti){//多选
            item.checked =!item.checked;
            this.selectItem =this.selectItem.filter(id=>{return id!=item.code});
            if(item.checked){
              this.selectItem.push(item.code);
            }
          }else{//单选
            if(this.selectItem.length==0){
              this.selectItem.push(item.code);
            }else if(this.selectItem.length==1){
              if(this.selectItem[0]==item.code){
                this.selectItem = [];
              }else{
                this.peopleType.forEach((i)=>{
                  if(i.code==this.selectItem[0]){
                    i.checked =false;
                  }
                })
                this.selectItem =[item.code];
              }
            }
            item.checked =!item.checked;
          }


          console.log(this.selectItem,this.selectIds);

        },*/
        //重置
        resetPeopleLabel(){
          this.peopleType.forEach((item)=>{
            item.checked =false;
          })
          this.selectItem = [];
        }
      },
      created(){
        this.queryPeopleType()
        console.log(this.selectItem)
      },
      mounted(){

      }
    }
</script>

<style scoped>
  #people-type{
    width: 100%;
  }
</style>
