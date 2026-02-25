<template>
  <div class="mobile-langchain">
    <van-nav-bar
      title="Langchain Chat"
      left-text="返回"
      left-arrow
      fixed
      placeholder
      @click-left="onClickLeft"
    />

    <div ref="chatContainer" class="chat-container">
      <div class="message-list">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          class="message-item"
          :class="{ 'message-mine': msg.author === 'You', 'message-ai': msg.author === 'AI' || msg.author === 'Alice' || msg.author === 'Bob' }"
        >
          <div v-if="msg.author !== 'You'" class="avatar">
            <van-icon name="smile-o" size="24" />
          </div>
          <div class="content">
            <div class="text">{{ msg.text }}</div>
          </div>
          <div v-if="msg.author === 'You'" class="avatar">
            <van-icon name="user-o" size="24" />
          </div>
        </div>
      </div>
    </div>

    <div class="input-area">
      <van-field
        v-model="newMessage"
        center
        clearable
        placeholder="试试AI吧"
      >
        <template #button>
          <van-button size="small" type="primary" :loading="sending" @click="sendMessage">发送</van-button>
        </template>
      </van-field>
    </div>

  </div>
</template>

<script>
import { askAIReq } from '@/api/aipark'

export default {
  name: 'MobileLangchain',
  data() {
    return {
      messages: [
        { author: 'Alice', text: 'Hello, Bob!' },
        { author: 'Bob', text: 'Hi, Alice! How are you?' }
      ],
      newMessage: '',
      thread_id: '',
      sending: false
    }
  },
  methods: {
    onClickLeft() {
      this.$router.back()
    },

    sendMessage() {
      if (!this.newMessage.trim()) return

      this.messages.push({ author: 'You', text: this.newMessage })
      const content = this.newMessage
      this.newMessage = ''
      this.sending = true

      this.scrollToBottom()

      const data = { content: content, thread_id: this.thread_id }
      askAIReq(data).then(res => {
        this.sending = false
        if (res.code === 200) {
          const data = res.data
          this.messages.push({ author: 'AI', text: data.msg })
          this.thread_id = data.thread_id
          this.scrollToBottom()
        } else {
          this.$toast.fail('AI 响应失败')
        }
      }).catch(() => {
        this.sending = false
        this.$toast.fail('网络错误')
      })
    },

    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.chatContainer
        container.scrollTop = container.scrollHeight
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.mobile-langchain {
  background-color: #f7f8fa;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.chat-container {
    flex: 1;
    overflow-y: auto;
    padding: 10px;
    padding-bottom: 60px; /* Space for input area */
}

.message-item {
    display: flex;
    margin-bottom: 10px;
    align-items: flex-start;

    &.message-mine {
        justify-content: flex-end;
        .content {
            background-color: #95ec69;
            margin-right: 8px;
            margin-left: 0;
        }
    }

    &.message-ai {
        justify-content: flex-start;
        .content {
            background-color: #fff;
            margin-left: 8px;
            margin-right: 0;
        }
    }

    .avatar {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #eee;
        border-radius: 50%;
    }

    .content {
        padding: 8px 12px;
        border-radius: 8px;
        max-width: 70%;
        word-break: break-all;
        box-shadow: 0 1px 2px rgba(0,0,0,0.1);

        .text {
            font-size: 14px;
            color: #333;
            line-height: 1.4;
        }
    }
}

.input-area {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background: #fff;
    border-top: 1px solid #eee;
    padding: 0;
    z-index: 100;
}
</style>
