<template>
  <div class="mobile-growing">
    <van-nav-bar
      title="成长记录"
      left-text="返回"
      left-arrow
      fixed
      placeholder
      :border="false"
      class="growing-nav"
      @click-left="onClickLeft"
    >
      <template #right>
        <div class="nav-add" @click="openAddDialog">
          <van-icon name="plus" size="18" />
        </div>
      </template>
    </van-nav-bar>

    <van-pull-refresh v-model="refreshing" class="growing-refresh" @refresh="onRefresh">
      <van-list
        v-model="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <div v-if="loading && list.length === 0" class="growing-skeleton">
          <van-skeleton v-for="n in 6" :key="n" title :row="2" class="skeleton-item" />
        </div>
        <div class="growing-list">
          <van-collapse v-model="activeNames" :border="false">
            <van-collapse-item
              v-for="item in list"
              :key="item.id"
              :name="item.id"
              class="growing-item"
              :class="{ 'is-open': isOpen(item.id) }"
            >
              <template #title>
                <div class="cell-head">
                  <div class="head-left">
                    <div class="item-title">
                      <span class="title-text">{{ item.title }}</span>
                      <span v-if="isToday(item.created_time)" class="today-pill">今天</span>
                    </div>
                    <div v-if="!isOpen(item.id) && item.content" class="item-preview">
                      {{ item.content }}
                    </div>
                  </div>
                  <div class="head-right">
                    <div class="pill date-pill">
                      <van-icon name="calendar-o" class="pill-icon" />
                      <span class="pill-text">{{ formatDate(item.created_time) }}</span>
                    </div>
                    <div v-if="ageText(item.created_time)" class="pill age-pill">
                      <span class="pill-text">{{ ageText(item.created_time) }}</span>
                    </div>
                  </div>
                </div>
              </template>
              <div class="content-text">{{ item.content }}</div>
            </van-collapse-item>
          </van-collapse>
        </div>
        <van-empty v-if="!loading && finished && list.length === 0" description="还没有记录，点右上角 + 添加" />
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
import { getBabyInfoReq, showGrowingListReq, addGrowingReq, geneContentReq } from '@/api/baby'
import { Toast } from 'vant'
import moment from 'moment'

export default {
  name: 'MobileGrowing',
  data() {
    return {
      babyInfo: null,
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
  created() {
    this.fetchBabyInfo()
  },
  methods: {
    onClickLeft() {
      this.$router.back()
    },
    fetchBabyInfo() {
      getBabyInfoReq().then((res) => {
        if (res.code === 200) {
          this.babyInfo = res.data || null
        }
      }).catch(() => {})
    },
    formatDate(val) {
      if (!val) return ''
      return moment(val).format('YYYY-MM-DD')
    },
    isToday(val) {
      if (!val) return false
      return moment(val).isSame(moment(), 'day')
    },
    isOpen(id) {
      return Array.isArray(this.activeNames) && this.activeNames.includes(id)
    },
    ageText(recordDate) {
      const birthday = this.babyInfo && this.babyInfo.birthday
      if (!birthday || !recordDate) return ''

      const birth = moment(birthday)
      const record = moment(recordDate)
      if (!birth.isValid() || !record.isValid()) return ''
      if (record.isBefore(birth, 'day')) return ''

      const cursor = birth.clone()
      const years = record.diff(cursor, 'years')
      cursor.add(years, 'years')
      const months = record.diff(cursor, 'months')
      cursor.add(months, 'months')
      const days = record.diff(cursor, 'days')

      if (years <= 0) {
        if (months > 0 && days > 0) return `${months}月${days}天`
        if (months > 0) return `${months}月`
        return `${days}天`
      }
      if (months > 0 && days > 0) return `${years}岁${months}月${days}天`
      if (months > 0) return `${years}岁${months}月`
      if (days > 0) return `${years}岁${days}天`
      return `${years}岁`
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
  --g-primary: #ff6b6b;
  --g-primary-2: #ff8a5c;
  --g-bg: #f7f8fa;
  --g-bg-top: #fff2ec;
  --g-surface: #ffffff;
  --g-text: #2b3445;
  --g-title: #263246;
  --g-muted: #6b7280;
  --g-muted-2: #9ca3af;

  padding-bottom: 28px;
  background: linear-gradient(180deg, var(--g-bg-top) 0%, var(--g-bg) 55%, var(--g-bg) 100%);
  min-height: 100vh;
}

.growing-refresh {
  min-height: calc(100vh - 46px);
}

.growing-nav {
  ::v-deep .van-nav-bar__content {
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(10px);
  }

  ::v-deep .van-nav-bar__title {
    color: var(--g-text);
    font-weight: 700;
    letter-spacing: 0.5px;
  }

  ::v-deep .van-nav-bar__text,
  ::v-deep .van-icon-arrow-left {
    color: #2563eb;
  }
}

.nav-add {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--g-primary), var(--g-primary-2));
  color: #fff;
  box-shadow: 0 8px 16px rgba(255, 107, 107, 0.22);
}

.growing-list {
  padding: 12px;
}

.growing-skeleton {
  padding: 12px;
}

.skeleton-item {
  margin-bottom: 12px;
  padding: 14px 14px;
  border-radius: 16px;
  background: var(--g-surface);
  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.06);
}

.growing-item {
  margin-bottom: 12px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.06);
  background:
    linear-gradient(var(--g-surface), var(--g-surface)) padding-box,
    linear-gradient(135deg, rgba(255, 107, 107, 0.28), rgba(255, 138, 92, 0.22), rgba(37, 99, 235, 0.14)) border-box;
  border: 1px solid transparent;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.growing-item.is-open {
  transform: translateY(-1px);
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.08);
}

::v-deep .van-collapse-item__content {
  padding: 4px 16px 16px;
  color: var(--g-muted);
  font-size: 14px;
  line-height: 1.6;
}

::v-deep .van-cell {
  padding: 14px 16px;
  background-color: var(--g-surface);
  align-items: flex-start;
  font-size: 16px;

  &::after {
    display: none;
  }
}

.item-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-title::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--g-primary), var(--g-primary-2));
  box-shadow: 0 6px 14px rgba(255, 107, 107, 0.22);
}

.title-text {
  font-weight: 700;
  color: var(--g-title);
  line-height: 1.25;
  max-width: calc(100vw - 210px);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: 0.2px;
}

.today-pill {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: var(--g-primary);
  background: rgba(255, 107, 107, 0.14);
}

.item-preview {
  margin-top: 6px;
  font-size: 13px;
  color: var(--g-muted);
  line-height: 1.5;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  word-break: break-word;
}

.cell-head {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
}

.head-left {
  flex: 1;
  min-width: 0;
}

.head-right {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  padding-top: 2px;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  line-height: 1;
  white-space: nowrap;
}

.pill-icon {
  font-size: 14px;
  opacity: 0.8;
}

.pill-text {
  font-size: 12px;
  font-weight: 600;
}

.date-pill {
  color: rgba(37, 99, 235, 0.82);
  background: rgba(37, 99, 235, 0.1);
}

.age-pill {
  color: rgba(255, 107, 107, 0.92);
  background: rgba(255, 107, 107, 0.14);
}

.content-text {
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--g-muted);
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
  background: linear-gradient(180deg, #ffffff 0%, var(--g-bg) 100%);
}

.popup-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  padding: 0 16px;
  background-color: var(--g-surface);
}

.header-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--g-text);
}

.popup-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.form-group {
  margin-bottom: 12px;
  background-color: var(--g-surface);
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
  color: var(--g-muted-2);
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
  background: rgba(255, 138, 92, 0.12);
  color: #ea580c;
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
  background-color: var(--g-surface);
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
