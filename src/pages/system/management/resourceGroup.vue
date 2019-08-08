<template>
  <div class="resource-group">
    <!--<div>{{checkedData}}</div>-->
    <CheckboxGroup v-model="checkedData" @on-change="handleCheckboxGroupChange">
      <div class="resource-group-item" v-for="item in stateData" :key="item.id">
        <div>
          <Checkbox :label="item.id">{{item.title}}</Checkbox>
        </div>
        <div v-if="item.children" class="resource-group-item-body">
          <Checkbox v-for="child in item.children" :key="child.id" :label="child.id">
            {{child.title}}
          </Checkbox>
        </div>
      </div>
    </CheckboxGroup>

     <span class="cls-titles">默认角色</span>
          <span>
                <i-Switch v-model=ischeck   @on-change="changeControl($event)" size="small"></i-Switch>
          </span>
  </div>
</template>

<script>
  export default {
    name: "resource-group",
    props: {
      data: {
        type: Array,
        default() {
          return [];

        }
      },

    },
    data() {
      return {
        stateData: this.data,
        checkedData: [],
        preCheckedData: [],
        flatData: {},
        ischeck:false
      }
    },
    watch: {
      data: {
        deep: true,
        handler() {
          this.stateData = this.data;
          this.flatData = this.compileFlatData();
          this.checkedData = this.compileCheckedData();
          this.preCheckedData = this.checkedData;
          this.$emit('on-change', this.getChecked())
        }
      }
    },
    methods: {

      changeControl(data){

      },

      handleCheckboxGroupChange(checkedKey) {
        let currLen = this.checkedData.length;
        let preLen = this.preCheckedData.length;
        if (currLen > preLen) {
          //表示本次操作勾选某个checkbox
          this.checkParent();
        } else if (currLen < preLen) {
          //表示本次操作取消了某个checkbox
          this.unCheckChildren();
        }


        this.preCheckedData = this.checkedData;

        this.$emit('on-change', this.getChecked())

      },
      checkParent() {
        let difference = this.checkedData.filter(key => this.preCheckedData.indexOf(key) === -1)
        difference.forEach(key => {
          let pid = this.flatData[key].pid;
          if (pid && this.flatData[pid]) {
            if (this.checkedData.indexOf(pid) === -1) {
              this.checkedData.push(pid);
            }
          }
        })
      },
      unCheckChildren() {
        let difference = this.preCheckedData.filter(key => this.checkedData.indexOf(key) === -1 && this.flatData[key].children)
        difference.forEach(key => {
          let children = this.flatData[key].children;
          children.forEach(child => {
            let index = this.checkedData.indexOf(child.id);
            if (index >= 0) {
              this.checkedData.splice(index, 1);
            }
          });
        })
      },
      compileFlatData() {
        const flatData = {};
        function flatMap(node) {
          flatData[node.id] = node;
          if (node.children) {
            node.children.forEach(item => {
              flatMap(item);
            })
          }
        };
        this.stateData.forEach(item => {
          flatMap(item);
        })
        return flatData;
      },
      compileCheckedData() {
        const checkedData = [];
        for (let key in this.flatData) {
          let item = this.flatData[key];
          if (item.checked) {
            checkedData.push(item.id)
            if (this.flatData[item.pid] && checkedData.indexOf(item.pid) < 0) {
              checkedData.push(item.pid)
            }
          }
        }
        return checkedData;
      },
      getChecked() {
        return this.checkedData;
      },
      backisdefout(){
        return this.ischeck;
      },
    },
    created() {
      this.flatData = this.compileFlatData();
      this.checkedData = this.compileCheckedData();
    },
    mounted() {
      // this.$on('on-change', this.handleCheckChange);
    }

  }
</script>

<style scoped>
  .resource-group {
    display: inline-block;
    width: 100%;
  }

  .resource-group-item {
    padding-bottom: 15px;
  }

  .resource-group-item-body {
    border: 1px dashed #1B334F;
    padding: 5px 15px;
  }
</style>
