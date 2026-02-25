<template>
  <div class="mobile-layout">
    <div class="header-container">
      <van-search
        v-model="searchValue"
        placeholder="Search for something..."
        shape="round"
        background="#1989fa"
        input-align="center"
      />
    </div>

    <div class="main-content">
      <transition name="fade-transform" mode="out-in">
        <router-view />
      </transition>
    </div>

    <van-tabbar v-model="active" route active-color="#1989fa" inactive-color="#7d7e80">
      <van-tabbar-item replace to="/mobile/home" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item replace to="/mobile/mall" icon="shop-o">商城</van-tabbar-item>
      <van-tabbar-item replace to="/mobile/ai" icon="apps-o">AI Park</van-tabbar-item>
      <van-tabbar-item replace to="/mobile/message" icon="chat-o">消息</van-tabbar-item>
      <van-tabbar-item replace to="/mobile/me" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script>
export default {
  name: 'MobileLayout',
  data() {
    return {
      active: 0,
      searchValue: ''
    }
  }
}
</script>

<style scoped>
.mobile-layout {
  background-color: #f7f8fa;
  min-height: 100vh;
  padding-bottom: 50px; /* Space for tabbar */
}

.header-container {
  position: sticky;
  top: 0;
  z-index: 999;
}

.main-content {
  padding: 10px;
}
</style>
