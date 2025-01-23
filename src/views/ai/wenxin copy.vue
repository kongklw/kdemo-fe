<template>
  <div class="app-container">

    <div class="chat-content">
      <el-card>
        <div v-for="(message, index) in messages" :key="index" class="message-item">
          <span class="message-author">{{ message.author }}</span>
          <span class="message-text">{{ message.text }}</span>
        </div>
      </el-card>

    </div>

    <div class="fixed-bottom-input">

      <span style="color:#67C23A; margin:0px 0px 20px 60px; font-size: large;">Hello everyone, we are experiencing
        a
        wonderful era
        of AI. Try it !!! <br>
      </span>
      <!-- <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" suffix-icon="el-icon-date"
          prefix-icon="el-icon-search" placeholder="来用AI吧! go go go" v-model="form.textarea">
        </el-input> -->
      <el-row>
        <el-col :span="20">
          <el-input
            v-model="newMessage"
            placeholder="试试AI吧"
            class="input-message"
            @keyup.enter.native="sendMessage"
          />
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="sendMessage">交流</el-button>
        </el-col>
      </el-row>

    </div>

  </div>
</template>

<script>

import {
  askAIReq
} from '@/api/aipark'
import data from '../pdf/content'

export default {

  data() {
    return {
      form: {
        textarea: ''
      },

      dialogVisible: true,
      messages: [
        { author: 'Alice', text: 'Hello, Bob!' },
        { author: 'Bob', text: 'Hi, Alice! How are you?' }
      ],
      newMessage: ''

    }
  },

  created() {

  },

  methods: {

    handleClose() {
      // 可以在这里处理对话框关闭前的逻辑
    },

    sendMessage() {
      if (this.newMessage.trim()) {
        this.messages.push({ author: 'You', text: this.newMessage })

        // 发送后端请求，将结果加入到messages里面.
        const data = { content: this.newMessage }
        askAIReq(data).then(res => {
          this.newMessage = ''
          if (res.code === 200) {
            this.messages.push({ author: 'OpenAI', text: res.data })
          }
        })

        // 可以在这里添加滚动到底部的逻辑
        this.$nextTick(() => {
          const chatContent = this.$el.querySelector('.chat-content .el-card__body')
          chatContent.scrollTop = chatContent.scrollHeight
        })
      }
    }

  }

}
</script>

<style>

.fixed-bottom-input {
  position: fixed; /* 固定定位 */
  bottom: 50px; /* 固定在底部 */
  left: 50%; /* 水平居中（需要配合transform使用） */
  transform: translateX(-50%); /* 水平方向偏移自身宽度的一半，实现居中 */
  width: calc(100% - 40px); /* 宽度为视口宽度减去左右padding（这里假设padding为20px，左右共40px） */
  max-width: 900px; /* 最大宽度，防止输入框过宽 */
  box-sizing: border-box; /* 包括padding和border在内计算元素总宽度 */
  padding: 10px; /* 输入框内边距 */
  background-color: #fff; /* 背景色 */
  border: 1px solid #dcdcdc; /* 边框 */
  border-radius: 10px; /* 圆角 */
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1); /* 阴影效果，增加层次感 */
}

.chat-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: center;
    /* align-items: center; */
    min-width: 60%;
}

.message-item {
    display: flex;
    justify-content: flex-start;
    margin-bottom: 10px;
}

.message-author {
    font-weight: bold;
    margin-right: 5px;
}

.message-text {
    background-color: #f5f7fa;
    padding: 5px 10px;
    border-radius: 4px;
}

.input-message {
    flex: 1;
    margin-bottom: 10px;
}
</style>
