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

    <van-pull-refresh v-model="refreshing" class="growing-refresh" @refresh="onRefresh">
      <van-list
        v-model="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <div class="growing-list">
          <van-collapse v-model="activeNames" :border="false">
            <van-collapse-item
              v-for="item in list"
              :key="item.id"
              :name="item.id"
              class="growing-item"
            >
              <template #title>
                <div class="item-title">
                  <span class="title-text">{{ item.title }}</span>
                </div>
              </template>
              <template #value>
                <span class="item-date">{{ item.created_time }}</span>
              </template>
              <div class="content-text">{{ item.content }}</div>
            </van-collapse-item>
          </van-collapse>
        </div>
      </van-list>
    </van-pull-refresh>

    <!-- Add Record Dialog -->
    <van-popup
      v-model="showAddDialog"
      position="bottom"
      :style="{ height: '80%' }"
      round
      safe-area-inset-bottom
      class="growing-popup"
    >
      <div class="popup-container">
        <div class="popup-header">
          <div class="header-btn" @click="showAddDialog = false">
            <van-icon name="cross" size="22" color="#333" />
          </div>
          <div class="header-title">添加成长记录</div>
          <div class="header-btn" style="visibility: hidden" />
        </div>

        <div class="popup-body">
          <van-form ref="addForm" :show-error-message="false">
            <div class="form-group">
              <van-field
                v-model="form.title"
                name="title"
                placeholder="请输入标题"
                :rules="[{ required: true, message: '请填写标题' }]"
                class="custom-field title-field"
              />
            </div>

            <div class="form-group">
              <van-field
                ref="contentInput"
                v-model="form.content"
                name="content"
                type="textarea"
                placeholder="记录宝宝成长的每一个瞬间..."
                rows="6"
                autosize
                show-word-limit
                maxlength="500"
                class="custom-field content-field"
                @blur="handleInputBlur"
              />
            </div>
          </van-form>

          <div class="tools-area">
            <div class="section-header">
              <span class="section-title">快捷词</span>
            </div>
            <div class="tags-container">
              <span
                v-for="word in commonWordList"
                :key="word.creativeWordId"
                class="custom-tag"
                @click="insertWord(word.name)"
              >
                {{ word.name }}
              </span>
            </div>

            <div class="ai-btn-container">
              <van-button
                icon="magic-stick"
                color="#7c4dff"
                block
                round
                plain
                class="ai-btn"
                @click="showAIDialog = true"
              >
                AI 帮写
              </van-button>
            </div>
          </div>
        </div>

        <div class="popup-footer">
          <van-button block round color="#ff7043" class="save-btn" @click="onAddSave">
            保存记录
          </van-button>
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

.growing-refresh {
  min-height: calc(100vh - 46px);
}

.growing-list {
  padding: 12px;
}

/* Card Style for Collapse Item */
.growing-item {
  margin-bottom: 12px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  background: #fff;
}

::v-deep .van-collapse-item__content {
  padding: 0 16px 16px;
  color: #666;
  font-size: 14px;
  line-height: 1.6;
}

::v-deep .van-cell {
  padding: 16px;
  background-color: #fff;
  align-items: center;
  font-size: 16px;

  &::after {
    display: none; /* Remove inner border */
  }
}

.item-title {
  display: flex;
  align-items: center;
}

.title-text {
  font-weight: 600;
  color: #333;
  margin-right: 8px;
}

.item-date {
  font-size: 13px;
  color: #999;
}

.content-text {
  white-space: pre-wrap;
  word-break: break-all;
}

.popup-content {
  /* removed */
}

/* Popup Styles */
.growing-popup {
  overflow: hidden;
}

.popup-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f7f8fa;
}

.popup-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  padding: 0 16px;
  background-color: #fff;
}

.header-title {
  font-size: 17px;
  font-weight: 600;
  color: #333;
}

.popup-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.form-group {
  margin-bottom: 12px;
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.02);
}

.custom-field {
  padding: 16px;
  background-color: transparent;
}

.title-field ::v-deep .van-field__control {
  font-size: 16px;
  font-weight: 600;
}

.content-field ::v-deep .van-field__control {
  font-size: 15px;
  line-height: 1.6;
}

.tools-area {
  margin-top: 20px;
  padding: 0 4px;
}

.section-header {
  margin-bottom: 12px;
  padding-left: 4px;
}

.section-title {
  font-size: 14px;
  color: #999;
  font-weight: 500;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 24px;
}

.custom-tag {
  padding: 6px 12px;
  background-color: #e3f2fd;
  color: #1976d2;
  border-radius: 20px;
  font-size: 13px;
  transition: all 0.2s;

  &:active {
    opacity: 0.7;
    transform: scale(0.95);
  }
}

.ai-btn-container {
  margin-top: 12px;
}

.ai-btn {
  height: 44px;
  font-weight: 500;
  border-width: 1.5px;
}

.popup-footer {
  flex-shrink: 0;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  background-color: #fff;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.03);
}

.save-btn {
  height: 44px;
  font-weight: 600;
  font-size: 16px;
}

.ai-dialog-content {
  padding: 20px 16px;
}
</style>
