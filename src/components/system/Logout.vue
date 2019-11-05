<template>
  <div id="logout">
    <Modal v-model="getLogoutState" title="退出" :styles="{top: '160px',width:'450px'}">
      <div class="logoutText">
        是否退出？
      </div>
      <div slot="footer">
        <Button type="text" @click="cancelLogout">取消</Button>
        <Button type="default" @click="okLogout">确定</Button>
      </div>
    </Modal>

  </div>
</template>

<script>
  import {URL} from "../../../api/urlsConfig"
    export default {
        name: "logout",
        data() {
          return {
            logoutUrl:""
          }
        },
        created() {

        },
        computed:{
          getLogoutState:{
            get:function () {
              return this.$store.state.isLogout;
            },
            set:function () {
              this.$store.commit("setLogoutState");
            }
          }
        },
        inject:[

        ],
        mounted() {

        },
        methods: {
          cancelLogout(){
            this.$store.commit("setLogoutState",false);
          },
          //退出系统url
          okLogout() {
            let _this = this;
            this.$http.request({
              method: 'get',
              url: URL.queryURLConfig,
              params: {},
              success: (data) => {
                if (data.code === 200){
                  window.location.href=data.data
                  this.$store.commit("setLogoutState",false);
                }
              }
            });
          }
        }
    }
</script>

<style scoped>
  .logoutText{
    text-align: center;
    font-size: 14px;
    font-weight: 700;
    font-family: "Microsoft YaHei", \5fae\8f6f\96c5\9ed1, arial, \5b8b\4f53;
  }
</style>
