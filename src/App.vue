<template>
  <div id="app" class="app-main">
    <router-view></router-view>
  </div>
</template>


<script>
export default {
  name: 'app'
}
</script>

<style>
html,body{
  height:100%;
  width: 100%;
  background: #000c2b;
}
#app {
  height:100%;
  width: 100%;
  overflow: auto;
}
</style>
