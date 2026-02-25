<template>
  <div class="mobile-function-layout">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'MobileFunctionLayout'
}
</script>

<style scoped>
.mobile-function-layout {
  min-height: 100vh;
  background-color: #f7f8fa;
}
</style>
