<template>
  <div class="mobile-me">
    <div class="user-profile">
      <van-image
        round
        width="5rem"
        height="5rem"
        src="https://img.yzcdn.cn/vant/cat.jpeg"
      />
      <div class="username">Admin</div>
    </div>

    <van-cell-group title="我的服务" inset>
      <van-cell title="个人资料" is-link icon="user-o" />
      <van-cell title="系统设置" is-link icon="setting-o" />
      <van-cell title="退出登录" is-link icon="revoke" @click="logout" />
    </van-cell-group>
  </div>
</template>

<script>
export default {
  methods: {
    async logout() {
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)
    }
  }
}
</script>

<style scoped>
.mobile-me {
  padding-top: 20px;
}
.user-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}
.username {
  margin-top: 10px;
  font-weight: bold;
  font-size: 18px;
}
</style>
