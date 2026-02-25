<template>
  <div class="mobile-growing">
    <van-nav-bar
      title="成长记录"
      left-text="返回"
      left-arrow
      fixed
      placeholder
      @click-left="onClickLeft"
    >
      <template #right>
        <van-icon name="plus" size="18" @click="openAddDialog" />
      </template>
    </van-nav-bar>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <van-collapse v-model="activeNames">
          <van-collapse-item
            v-for="item in list"
            :key="item.id"
            :name="item.id"
            :title="item.title"
            :value="item.created_time"
          >
            <div class="content-text">{{ item.content }}</div>
          </van-collapse-item>
        </van-collapse>
      </van-list>
    </van-pull-refresh>

    <!-- Add Record Dialog -->
    <van-popup
      v-model="showAddDialog"
      position="bottom"
      :style="{ height: '80%' }"
      round
    >
      <div class="popup-content">
        <van-nav-bar
          title="添加记录"
          left-text="取消"
          right-text="保存"
          @click-left="showAddDialog = false"
          @click-right="onAddSave"
        />
        <div class="form-content">
          <van-form ref="addForm">
            <van-field
              v-model="form.title"
              name="title"
              label="标题"
              placeholder="请输入标题"
              :rules="[{ required: true, message: '请填写标题' }]"
            />
            <van-field
              ref="contentInput"
              v-model="form.content"
              name="content"
              label="内容"
              type="textarea"
              placeholder="请输入内容"
              rows="5"
              autosize
              show-word-limit
              @blur="handleInputBlur"
            />
          </van-form>

          <div class="tools-area">
            <div class="section-title">快捷词</div>
            <div class="tags-container">
              <van-tag
                v-for="word in commonWordList"
                :key="word.creativeWordId"
                plain
                type="primary"
                size="medium"
                class="word-tag"
                @click="insertWord(word.name)"
              >
                {{ word.name }}
              </van-tag>
            </div>

            <div class="ai-btn-container">
              <van-button icon="magic-stick" type="info" block plain @click="showAIDialog = true">AI 帮写</van-button>
            </div>
          </div>
        </div>
      </div>
    </van-popup>

    <!-- AI Helper Dialog -->
    <van-dialog v-model="showAIDialog" title="AI 帮写" show-cancel-button @confirm="onAIGen">
      <div class="ai-dialog-content">
        <van-field
          v-model="aiForm.content"
          type="textarea"
          placeholder="请输入提示词，例如：宝宝今天第一次翻身..."
          rows="3"
          autosize
        />
      </div>
    </van-dialog>
  </div>
</template>

<script>
import { showGrowingListReq, addGrowingReq, geneContentReq } from '@/api/baby'
import { Toast } from 'vant'

export default {
  name: 'MobileGrowing',
  data() {
    return {
      list: [],
      loading: false,
      finished: false,
      refreshing: false,
      activeNames: [],

      showAddDialog: false,
      showAIDialog: false,

      form: {
        title: '',
        content: ''
      },

      aiForm: {
        content: ''
      },

      commonWordList: [
        { name: '喂水', creativeWordId: 1 },
        { name: '喂奶', creativeWordId: 2 },
        { name: '翻身', creativeWordId: 3 },
        { name: '轻拍', creativeWordId: 4 },
        { name: '奶嘴安抚', creativeWordId: 5 },
        { name: '哼唧', creativeWordId: 6 },
        { name: '侧漏', creativeWordId: 7 },
        { name: '梦哭', creativeWordId: 8 },
        { name: '梦笑', creativeWordId: 9 }
      ],

      cursorIndex: 0
    }
  },
  methods: {
    onClickLeft() {
      this.$router.back()
    },

    onLoad() {
      // Since the API returns all data at once, we simulate pagination or just load once
      if (this.refreshing) {
        this.list = []
        this.refreshing = false
      }

      showGrowingListReq().then(res => {
        if (res.code === 200) {
          this.list = res.data
          this.finished = true // Assuming no pagination from backend for now
        } else {
          this.finished = true
        }
        this.loading = false
      }).catch(() => {
        this.loading = false
        this.finished = true
      })
    },

    onRefresh() {
      this.finished = false
      this.loading = true
      this.onLoad()
    },

    openAddDialog() {
      this.form = { title: '', content: '' }
      this.showAddDialog = true
    },

    handleInputBlur(e) {
      // Capture cursor position for inserting words
      if (e && e.target) {
        this.cursorIndex = e.target.selectionStart
      }
    },

    insertWord(word) {
      const txt = this.form.content || ''
      // If cursorIndex is invalid, append to end
      const index = (this.cursorIndex >= 0 && this.cursorIndex <= txt.length) ? this.cursorIndex : txt.length

      const start = txt.substring(0, index)
      const end = txt.substring(index, txt.length)

      this.form.content = start + `#${word} ` + end

      // Update cursor position (approximate)
      this.cursorIndex = index + word.length + 2
    },

    onAIGen() {
      if (!this.aiForm.content) {
        Toast('请输入提示词')
        return
      }

      Toast.loading({
        message: 'AI 生成中...',
        forbidClick: true,
        duration: 0
      })

      geneContentReq(this.aiForm).then(res => {
        Toast.clear()
        if (res.code === 200) {
          // The API returns the full form data structure usually, or just content
          // Based on original code: this.growingForm = res.data
          if (res.data) {
            this.form.title = res.data.title || this.form.title
            this.form.content = res.data.content || this.form.content
          }
        }
      }).catch(() => {
        Toast.clear()
        Toast.fail('生成失败')
      })
    },

    onAddSave() {
      this.$refs.addForm.validate().then(() => {
        Toast.loading({
          message: '保存中...',
          forbidClick: true
        })

        addGrowingReq(this.form).then(res => {
          Toast.clear()
          if (res.code === 200) {
            Toast.success('添加成功')
            this.showAddDialog = false
            this.onRefresh()
          }
        })
      }).catch(() => {
        // Validation failed
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.mobile-growing {
  padding-bottom: 20px;
  background-color: #f7f8fa;
  min-height: 100vh;
}

.content-text {
  white-space: pre-wrap;
  line-height: 1.5;
  color: #333;
}

.popup-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.form-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.tools-area {
  margin-top: 20px;
  padding: 0 10px;
}

.section-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.word-tag {
  padding: 4px 10px;
}

.ai-btn-container {
  margin-top: 10px;
}

.ai-dialog-content {
  padding: 20px 16px;
}
</style>
