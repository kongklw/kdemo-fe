<template>
  <div class="mobile-message">
    <van-nav-bar title="消息" fixed placeholder />

    <van-list>
      <van-cell-group>
        <van-cell v-for="item in messages" :key="item.id" center is-link>
          <template #icon>
            <van-icon name="chat-o" size="32" color="#1989fa" style="margin-right: 10px;" />
          </template>
          <template #title>
            <span class="msg-title">{{ item.title }}</span>
          </template>
          <template #label>
            <span class="msg-desc">{{ item.desc }}</span>
          </template>
          <template #right-icon>
            <span class="msg-time">{{ item.time }}</span>
          </template>
        </van-cell>
      </van-cell-group>
    </van-list>
  </div>
</template>

<script>
export default {
  data() {
    return {
      messages: [
        { id: 1, title: '系统通知', desc: '您的账号已登录', time: '10:00' },
        { id: 2, title: '商城活动', desc: '双11大促即将开始', time: '昨天' },
        { id: 3, title: '宝宝成长', desc: '恭喜宝宝满1岁啦！', time: '前天' }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
.mobile-message {
  background-color: #f7f8fa;
  min-height: 100vh;
}

.msg-title {
    font-weight: bold;
}

.msg-time {
    font-size: 12px;
    color: #999;
}
</style>
