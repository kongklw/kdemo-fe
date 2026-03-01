<template>
  <div class="mobile-breastfeed">
    <!-- Navbar -->
    <van-nav-bar
      title="喂奶记录"
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

    <!-- Date Filter -->
    <div class="filter-bar">
      <div class="date-selector" @click="showDatePicker = true">
        <van-icon name="calendar-o" />
        <span>{{ currentDateText }}</span>
        <van-icon name="arrow-down" size="12" style="margin-left: 4px;" />
      </div>
    </div>

    <!-- Stats/Summary Panel (Figure 1 Style) -->
    <div v-if="dailySummary" class="summary-panel">
      <div class="summary-card">
        <div class="summary-row">
          <div class="summary-item">
            <span class="s-label">亲喂{{ dailySummary.breastCount }}次</span>
            <span class="s-value">共{{ formatDurationText(dailySummary.breastDuration) }}</span>
          </div>
          <div class="summary-divider" />
          <div class="summary-item">
            <span class="s-label">瓶喂{{ dailySummary.bottleCount }}次</span>
            <span class="s-value">共{{ dailySummary.bottleVolume }}ml</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Timeline List -->
    <van-pull-refresh v-model="refreshing" class="timeline-wrapper" @refresh="onRefresh">
      <van-list
        v-model="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <div v-if="list.length === 0 && !loading" class="empty-state">
          <van-empty description="暂无记录" />
        </div>

        <div class="timeline-container">
          <div v-for="(item, index) in list" :key="index" class="timeline-row">
            <div class="time-node">
              <div class="time-text">{{ formatTime(item.feed_time) }}</div>
              <div class="node-dot" :class="{ 'current-dot': index === 0 && item.milk_volume === '还没吃' }" />
              <div v-if="index !== list.length - 1" class="node-line">
                <div class="line-interval-text">{{ item.time_different }}</div>
              </div>
            </div>

            <div class="content-card-wrapper">
              <!-- Special Card for 'Current Status' (Not eaten yet) -->
              <div v-if="item.milk_volume === '还没吃'" class="content-card current-status-card">
                <div class="status-header">
                  <span class="status-title">当前状态</span>
                  <van-tag type="primary" size="medium">还没吃</van-tag>
                </div>
                <div class="status-interval">
                  距离上次: {{ item.time_different }}
                </div>
              </div>

              <!-- Regular Feed Record Card -->
              <van-swipe-cell v-else class="swipe-card-wrapper">
                <div class="content-card record-card">
                  <div class="card-header">
                    <div class="left-info">
                      <div class="type-icon-wrapper" :class="getFeedType(item)">
                        <span class="emoji-icon">{{ getFeedTypeIcon(item) }}</span>
                      </div>
                      <span class="type-name">{{ getFeedTypeName(item) }}</span>
                    </div>
                    <van-icon name="ellipsis" class="more-icon" @click.stop="openActionSheet(item)" />
                  </div>

                  <div class="card-body">
                    <template v-if="getFeedType(item) === 'breast'">
                      <div class="breast-stats">
                        <div class="stat-col">
                          <span class="stat-label">总时长</span>
                          <span class="stat-val main">{{ formatDurationText(item.duration_total || 0) }}</span>
                        </div>
                        <div class="stat-col">
                          <span class="stat-label">左侧</span>
                          <span class="stat-val">{{ formatDurationText(item.left_duration || 0) }}</span>
                        </div>
                        <div class="stat-col">
                          <span class="stat-label">右侧</span>
                          <span class="stat-val">{{ formatDurationText(item.right_duration || 0) }}</span>
                        </div>
                      </div>
                    </template>
                    <template v-else>
                      <div class="bottle-stats">
                        <span class="volume-num">{{ item.milk_volume }}</span>
                        <span class="volume-unit">ml</span>
                      </div>
                    </template>

                    <div v-if="item.note" class="note-text">{{ item.note }}</div>
                  </div>

                  <div class="card-footer">
                    <!-- interval moved to timeline -->
                  </div>
                </div>
                <template #right>
                  <van-button square text="删除" type="danger" class="delete-button" @click="handleDelete(item)" />
                </template>
              </van-swipe-cell>
            </div>
          </div>
        </div>

      </van-list>
    </van-pull-refresh>

    <!-- Date Picker -->
    <van-popup v-model="showDatePicker" position="bottom">
      <van-datetime-picker
        v-model="currentDate"
        type="date"
        title="选择日期"
        :min-date="minDate"
        :max-date="maxDate"
        @confirm="onConfirmDate"
        @cancel="showDatePicker = false"
      />
    </van-popup>

    <!-- Add Popup -->
    <van-popup v-model="showAdd" position="bottom" :style="{ height: '80%' }" round @closed="resetForm">
      <div class="add-container">
        <div class="popup-header">
          <div class="cancel-btn" @click="showAdd = false">
            <van-icon name="cross" size="20" />
          </div>
          <div class="popup-title">{{ isEdit ? '编辑喂奶记录' : '喂奶记录' }}</div>
          <div class="save-btn" style="visibility: hidden;">占位</div>
        </div>

        <div class="popup-content">

          <van-tabs v-model="activeTab" :border="false" color="#ff7043" title-active-color="#ff7043">
            <van-tab title="亲喂" name="breast" />
            <van-tab title="母乳瓶喂" name="breast_bottle" />
            <van-tab title="喂奶粉" name="formula" />
          </van-tabs>

          <div v-if="activeTab === 'breast'" class="breast-container">
            <div class="mode-switch-container">
              <div class="mode-switch">
                <div :class="['mode-item', { active: breastMode === 'timer' }]" @click="breastMode = 'timer'">自动计时器</div>
                <div :class="['mode-item', { active: breastMode === 'manual' }]" @click="breastMode = 'manual'">手动输入</div>
              </div>
            </div>

            <div v-if="breastMode === 'timer'" class="timer-ui">
              <div class="total-time">
                <div class="time-text">{{ totalDuration }}</div>
                <div class="time-label">总时长</div>
              </div>

              <div class="timer-controls">
                <div class="timer-circle" :class="{ running: timer.activeSide === 'left' }" @click="toggleTimer('left')">
                  <div class="circle-content">
                    <div class="label">左侧</div>
                    <van-icon :name="timer.activeSide === 'left' ? 'pause' : 'play'" size="32" color="#ff7043" />
                    <div class="sub-time">{{ formatDuration(timer.left) }}</div>
                  </div>
                </div>

                <div class="timer-circle" :class="{ running: timer.activeSide === 'right' }" @click="toggleTimer('right')">
                  <div class="circle-content">
                    <div class="label">右侧</div>
                    <van-icon :name="timer.activeSide === 'right' ? 'pause' : 'play'" size="32" color="#ff7043" />
                    <div class="sub-time">{{ formatDuration(timer.right) }}</div>
                  </div>
                </div>
              </div>

              <div class="timer-tip">温馨提示：每10~15分钟要换另一侧乳房喂养哦~</div>
            </div>

            <div v-else class="manual-ui">
              <van-field v-model="manualLeft" type="digit" label="左侧" placeholder="请输入时长" label-width="40px">
                <template #extra>分钟</template>
              </van-field>
              <van-field v-model="manualRight" type="digit" label="右侧" placeholder="请输入时长" label-width="40px">
                <template #extra>分钟</template>
              </van-field>
            </div>
          </div>

          <div v-else class="bottle-container">
            <div class="bottle-wrapper">
              <div class="bottle-nipple" />
              <div class="bottle-neck" />
              <div class="bottle-body">
                <div class="milk-level" :style="{ height: milkHeight + '%' }">
                  <div class="milk-surface" />
                </div>
                <div class="scale-marks">
                  <div v-for="i in 6" :key="i" class="mark" :style="{ bottom: (i * 16.6) + '%' }">
                    <span class="mark-label">{{ i * 50 }}</span>
                  </div>
                </div>
              </div>
              <!-- Invisible slider for interaction -->
              <div
                ref="bottleSlider"
                class="bottle-slider-overlay"
                @touchstart.prevent="onTouchStart"
                @touchmove.prevent="onTouchMove"
                @touchend="onTouchEnd"
                @click="onBottleClick"
              />
            </div>

            <div class="volume-display">
              <div class="volume-value">{{ form.milk_volume }}<span class="unit">ml</span></div>
              <div v-if="recommendedVolumeRange" class="volume-hint">
                推荐奶量: {{ recommendedVolumeRange }}
              </div>
            </div>
          </div>

          <div class="form-section">
            <van-cell title="喂奶时间" is-link :value="formattedFormTime" @click="showTimePicker = true" />
            <van-field
              v-model="form.note"
              rows="2"
              autosize
              label="添加备注"
              type="textarea"
              placeholder="来添加宝宝的吃奶状态吧"
            />
          </div>

          <div class="action-footer">
            <van-button block round color="#ff7043" @click="saveFeed">完成</van-button>
          </div>
        </div>
      </div>
    </van-popup>

    <!-- Time Picker for Form -->
    <van-popup v-model="showTimePicker" position="bottom">
      <van-datetime-picker
        v-model="formDate"
        type="datetime"
        title="选择时间"
        @confirm="onConfirmFormTime"
        @cancel="showTimePicker = false"
      />
    </van-popup>

    <!-- Action Sheet -->
    <van-action-sheet
      v-model="showActionSheet"
      class="custom-action-sheet"
      :safe-area-inset-bottom="true"
    >
      <div class="sheet-wrapper">
        <div class="sheet-actions">
          <div class="sheet-btn" @click="onActionEdit">
            <van-icon name="edit" color="#1989fa" size="20" />
            <span class="btn-text" style="color: #1989fa">编辑记录</span>
          </div>
          <div class="sheet-divider" />
          <div class="sheet-btn" @click="onActionDelete">
            <van-icon name="delete-o" color="#ee0a24" size="20" />
            <span class="btn-text" style="color: #ee0a24">删除记录</span>
          </div>
        </div>
        <div class="sheet-cancel" @click="showActionSheet = false">
          取消
        </div>
      </div>
    </van-action-sheet>

  </div>
</template>

<script>
import { feedListReq, addFeedReq, deleteFeedReq, getBabyInfoReq, updateFeedReq } from '@/api/baby'
import moment from 'moment'
import { Toast, Dialog, ActionSheet } from 'vant'

export default {
  name: 'MobileBreastFeed',
  components: {
    [ActionSheet.name]: ActionSheet
  },
  data() {
    return {
      isEdit: false,
      editId: null,
      showActionSheet: false,
      currentActionItem: null,
      list: [],
      basicInfo: {},
      babyDetails: null,
      loading: false,
      finished: false,
      refreshing: false,

      currentDate: new Date(),
      showDatePicker: false,
      minDate: new Date(2020, 0, 1),
      maxDate: new Date(2030, 11, 31),

      // Add
      showAdd: false,
      showTimePicker: false,
      formDate: new Date(),
      activeTab: 'formula',
      breastMode: 'timer',
      timer: {
        activeSide: null,
        left: 0,
        right: 0,
        interval: null
      },
      manualLeft: '',
      manualRight: '',
      form: {
        feed_time: '',
        milk_volume: 120,
        feed_type: 'bottle',
        note: ''
      },

      quickVolumes: [30, 60, 90, 120, 150, 180, 210, 240],
      isTouching: false
    }
  },
  computed: {
    currentDateText() {
      return moment(this.currentDate).format('YYYY-MM-DD')
    },
    formattedFormTime() {
      return this.form.feed_time || '请选择时间'
    },
    milkHeight() {
      // Map 0-300ml to 0-100%
      const maxVolume = 300
      const pct = (this.form.milk_volume / maxVolume) * 100
      return Math.min(100, Math.max(0, pct))
    },
    recommendedVolumeRange() {
      if (!this.babyDetails || !this.babyDetails.birthday) return ''

      const birthDate = moment(this.babyDetails.birthday)
      const now = moment()
      const daysOld = now.diff(birthDate, 'days')
      const monthsOld = now.diff(birthDate, 'months')

      // Simple heuristic based on age
      if (daysOld < 7) return '30ml - 60ml'
      if (daysOld < 30) return '60ml - 90ml'
      if (monthsOld < 3) return '90ml - 120ml'
      if (monthsOld < 6) return '120ml - 180ml'
      if (monthsOld < 12) return '180ml - 240ml'
      return '200ml+'
    },
    totalDuration() {
      const total = this.timer.left + this.timer.right
      // We can reuse the format method if we move it or duplicate logic
      const m = Math.floor(total / 60)
      const s = total % 60
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    },
    dailySummary() {
      let breastCount = 0
      let breastDuration = 0
      let bottleCount = 0
      let bottleVolume = 0

      this.list.forEach(item => {
        if (item.milk_volume === '还没吃') return

        const type = this.getFeedType(item)
        if (type === 'breast') {
          breastCount++
          breastDuration += (item.duration_total || 0)
        } else {
          bottleCount++
          bottleVolume += (parseInt(item.milk_volume) || 0)
        }
      })

      return { breastCount, breastDuration, bottleCount, bottleVolume }
    }
  },
  created() {
    this.fetchBabyInfo()
  },
  methods: {
    async fetchBabyInfo() {
      try {
        const res = await getBabyInfoReq()
        if (res.code === 200 && res.data && res.data.length > 0) {
          this.babyDetails = res.data[0]
        }
      } catch (e) {
        console.error(e)
      }
    },
    onClickLeft() {
      this.$router.push('/mobile/home')
    },
    formatTime(time) {
      if (!time) return ''
      return moment(time).format('HH:mm')
    },
    // Action Sheet
    openActionSheet(item) {
      this.currentActionItem = item
      this.showActionSheet = true
    },
    onActionEdit() {
      this.showActionSheet = false
      if (this.currentActionItem) {
        this.handleEdit(this.currentActionItem)
      }
    },
    onActionDelete() {
      this.showActionSheet = false
      if (this.currentActionItem) {
        Dialog.confirm({
          title: '提示',
          message: '确定要删除这条记录吗？'
        })
          .then(() => {
            this.handleDelete(this.currentActionItem)
          })
          .catch(() => {})
      }
    },
    handleEdit(item) {
      this.isEdit = true
      this.editId = item.id
      this.form = {
        feed_time: item.feed_time,
        milk_volume: parseInt(item.milk_volume) || 0,
        feed_type: this.getFeedType(item),
        note: item.note || ''
      }

      // Set Active Tab
      const type = this.getFeedType(item)
      if (type === 'breast') {
        this.activeTab = 'breast'
        // Decide mode based on duration
        if (item.left_duration || item.right_duration) {
          this.breastMode = 'timer'
          this.timer.left = item.left_duration || 0
          this.timer.right = item.right_duration || 0
        } else {
          this.breastMode = 'manual'
          // If it was manual but only total, we might not split. Assume timer mode for visual if data exists.
        }
        // If user manually entered data, populate manual fields
        this.manualLeft = Math.floor((item.left_duration || 0) / 60)
        this.manualRight = Math.floor((item.right_duration || 0) / 60)
      } else {
        this.activeTab = type === 'breast_bottle' ? 'breast_bottle' : 'formula'
      }

      this.showAdd = true
    },
    resetForm() {
      this.isEdit = false
      this.editId = null
      this.form = {
        feed_time: '',
        milk_volume: 120,
        feed_type: 'bottle',
        note: ''
      }
      this.timer = { left: 0, right: 0, activeSide: null, interval: null }
      this.manualLeft = ''
      this.manualRight = ''
      this.activeTab = 'formula' // default tab
    },

    async onLoad() {
      if (this.refreshing) {
        this.list = []
        this.refreshing = false
      }

      const start_time = moment(this.currentDate).format('YYYY-MM-DD 00:00:00')
      const end_time = moment(this.currentDate).format('YYYY-MM-DD 23:59:59')

      try {
        const res = await feedListReq({ start_time, end_time })
        if (res.code === 200) {
          this.list = res.data.results || (Array.isArray(res.data) ? res.data : [])
          this.basicInfo = res.data.basicInfo || {}
          this.finished = true
        }
      } catch (error) {
        console.error(error)
        this.finished = true
      } finally {
        this.loading = false
      }
    },
    onRefresh() {
      this.finished = false
      this.loading = true
      this.onLoad()
    },
    onConfirmDate(value) {
      this.currentDate = value
      this.showDatePicker = false
      this.onRefresh()
    },
    openAddDialog() {
      this.form.feed_time = moment().format('YYYY-MM-DD HH:mm:00')
      this.formDate = new Date()
      this.form.milk_volume = 120
      this.form.note = ''
      this.activeTab = 'formula' // Default or based on history?

      // Reset Timer
      this.breastMode = 'timer'
      this.timer = {
        activeSide: null,
        left: 0,
        right: 0,
        interval: null
      }
      this.manualLeft = ''
      this.manualRight = ''

      this.showAdd = true
    },
    onCloseAddDialog() {
      this.pauseTimer()
    },

    // Timer Logic
    formatDuration(seconds) {
      const m = Math.floor(seconds / 60)
      const s = seconds % 60
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    },
    toggleTimer(side) {
      if (this.timer.activeSide === side) {
        this.pauseTimer()
      } else {
        this.startTimer(side)
      }
    },
    startTimer(side) {
      this.pauseTimer()
      this.timer.activeSide = side
      this.timer.interval = setInterval(() => {
        this.timer[side]++
      }, 1000)
    },
    pauseTimer() {
      if (this.timer.interval) {
        clearInterval(this.timer.interval)
        this.timer.interval = null
      }
      this.timer.activeSide = null
    },

    onConfirmFormTime(value) {
      this.form.feed_time = moment(value).format('YYYY-MM-DD HH:mm:ss')
      this.showTimePicker = false
    },

    // Bottle Interaction
    updateVolumeFromTouch(e) {
      const slider = this.$refs.bottleSlider
      if (!slider) return

      const rect = slider.getBoundingClientRect()
      const touch = e.touches ? e.touches[0] : e
      const clientY = touch.clientY

      // Calculate height from bottom
      const height = rect.bottom - clientY
      const percentage = Math.max(0, Math.min(1, height / rect.height))

      // Map to 0-300ml, step 5ml
      const rawVol = percentage * 300
      this.form.milk_volume = Math.round(rawVol / 5) * 5
    },

    // Helpers
    getFeedType(item) {
      if (item.feed_type) return item.feed_type
      // Fallback for old data or if type is not set
      if (item.milk_volume > 0) return 'formula'
      if (item.duration_total > 0) return 'breast'
      return 'formula' // default
    },
    getFeedTypeName(item) {
      const type = this.getFeedType(item)
      const map = {
        'breast': '母乳亲喂',
        'breast_bottle': '母乳瓶喂',
        'formula': '喂奶粉'
      }
      return map[type] || '喂奶'
    },
    getFeedTypeIcon(item) {
      const type = this.getFeedType(item)
      if (type === 'breast') return '🤱'
      if (type === 'breast_bottle') return '🍼'
      return '🍼'
    },
    formatDurationText(seconds) {
      if (!seconds) return '0分钟'
      const m = Math.floor(seconds / 60)
      if (m === 0 && seconds > 0) return '1分钟'
      return `${m}分钟`
    },

    onTouchStart(e) {
      this.isTouching = true
      this.updateVolumeFromTouch(e)
    },
    onTouchMove(e) {
      if (this.isTouching) {
        this.updateVolumeFromTouch(e)
      }
    },
    onTouchEnd() {
      this.isTouching = false
    },
    onBottleClick(e) {
      // Handle click as well for desktop testing or quick tap
      // Manually construct a mock event with clientY
      const mockEvent = { clientY: e.clientY, touches: [{ clientY: e.clientY }] }
      this.updateVolumeFromTouch(mockEvent)
    },

    async saveFeed() {
      if (!this.form.feed_time) {
        Toast('请选择时间')
        return
      }

      const payload = { ...this.form }
      payload.feed_type = this.activeTab

      if (this.activeTab === 'breast') {
        if (this.breastMode === 'timer') {
          payload.left_duration = this.timer.left
          payload.right_duration = this.timer.right
          payload.duration_total = this.timer.left + this.timer.right
        } else {
          const leftSec = (parseInt(this.manualLeft) || 0) * 60
          const rightSec = (parseInt(this.manualRight) || 0) * 60
          payload.left_duration = leftSec
          payload.right_duration = rightSec
          payload.duration_total = leftSec + rightSec
        }
        payload.milk_volume = 0

        if (payload.duration_total === 0) {
          Toast('请记录喂奶时长')
          return
        }
      } else {
        if (!this.form.milk_volume) {
          Toast('请输入奶量')
          return
        }
      }

      try {
        let res
        if (this.isEdit) {
          payload.id = this.editId
          res = await updateFeedReq(payload)
        } else {
          res = await addFeedReq(payload)
        }

        if (res.code === 200) {
          Toast.success(this.isEdit ? '修改成功' : '添加成功')
          this.showAdd = false
          this.onRefresh()
        } else {
          Toast.fail(res.msg || '操作失败')
        }
      } catch (err) {
        console.error(err)
        Toast.fail('网络错误')
      }
    },
    handleDelete(item) {
      Dialog.confirm({
        title: '提示',
        message: '确认删除该记录吗？'
      })
        .then(async() => {
          try {
            const res = await deleteFeedReq(item)
            if (res.code === 200) {
              Toast.success('删除成功')
              this.onRefresh()
            } else {
              Toast.fail(res.msg || '删除失败')
            }
          } catch (error) {
            console.error(error)
            Toast.fail('删除失败')
          }
        })
        .catch(() => {
          // on cancel
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.mobile-breastfeed {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 20px;
}

.filter-bar {
  background: #fff;
  padding: 10px 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 99; /* Below Navbar */
}

.date-selector {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  padding: 6px 12px;
  background: #f0f2f5;
  border-radius: 16px;

  .van-icon {
    margin-right: 6px;
  }
}

.stats-card {
  margin: 12px 16px;
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);

  .stat-item {
    text-align: center;

    .stat-label {
      font-size: 12px;
      color: #999;
      margin-bottom: 4px;
    }

    .stat-value {
      font-size: 20px;
      font-weight: bold;
      color: #333;

      .unit {
        font-size: 12px;
        font-weight: normal;
        color: #666;
      }
    }
  }

  .stat-divider {
    width: 1px;
    height: 30px;
    background-color: #eee;
  }
}

.list-group {
  margin-top: 10px;
}

.list-item {
  margin-bottom: 1px;
}

.cell-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.time {
  font-weight: bold;
  font-size: 16px;
  color: #333;
}

.volume-tag {
  font-weight: bold;
}

.cell-desc {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.action-button {
  height: 100%;
}

.add-container {
  background-color: #fff;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: #fff;
  border-bottom: 1px solid #f5f5f5;

  .cancel-btn {
    font-size: 14px;
    color: #969799;
    padding: 4px 8px;
  }

  .popup-title {
    font-size: 16px;
    font-weight: bold;
    color: #323233;
  }

  .save-btn {
    font-size: 14px;
    color: #ff7043;
    font-weight: bold;
    padding: 4px 8px;
  }
}

.popup-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  display: flex;
  flex-direction: column;
}

.bottle-container {
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.bottle-wrapper {
  position: relative;
  width: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 30px;
}

.bottle-nipple {
  width: 36px;
  height: 24px;
  background-color: #ffccbc;
  border-radius: 12px 12px 4px 4px;
  margin-bottom: -4px;
  z-index: 2;
}

.bottle-neck {
  width: 50px;
  height: 12px;
  background-color: #ffab91;
  border-radius: 4px;
  z-index: 2;
}

.bottle-body {
  position: relative;
  width: 100px;
  height: 180px;
  border: 3px solid #ffab91;
  border-radius: 20px 20px 40px 40px;
  background-color: #fff;
  overflow: hidden;
  margin-top: -2px;
}

.milk-level {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #fff3e0; /* Milk color */
  transition: height 0.1s linear;

  .milk-surface {
    width: 100%;
    height: 4px;
    background-color: #ffe0b2;
    opacity: 0.6;
  }
}

.scale-marks {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;

  .mark {
    position: absolute;
    width: 100%;
    border-top: 1px solid rgba(255, 171, 145, 0.4);
    text-align: center;

    .mark-label {
      font-size: 10px;
      color: #ffab91;
      background: rgba(255,255,255,0.8);
      padding: 0 2px;
    }
  }
}

.bottle-slider-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  cursor: pointer;
}

.volume-display {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 100px;
}

.volume-value {
  font-size: 32px;
  font-weight: bold;
  color: #ff7043;

  .unit {
    font-size: 16px;
    color: #999;
    margin-left: 4px;
  }
}

.volume-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #999;
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
}

.form-section {
  padding: 0 16px;
  margin-bottom: 20px;
}

.action-footer {
  padding: 16px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1px solid #f5f5f5;
}

.summary-panel {
  padding: 10px 16px;
  background-color: #f7f8fa;
}

.summary-card {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}

.summary-row {
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;

  .s-label {
     font-size: 14px;
     color: #333;
     font-weight: bold;
     margin-bottom: 4px;
  }

  .s-value {
     font-size: 12px;
     color: #999;
  }
}

.summary-divider {
  width: 1px;
  height: 24px;
  background-color: #eee;
}

/* Timeline Styles */
.timeline-wrapper {
  background-color: #f7f8fa;
  min-height: calc(100vh - 200px);
}

.timeline-container {
  padding: 10px 16px;
}

.timeline-row {
  display: flex;
  margin-bottom: 0;
}

.time-node {
  width: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 10px;
  position: relative;

  .time-text {
    font-size: 14px;
    font-weight: bold;
    color: #333;
    margin-bottom: 4px;
    line-height: 1.2;
  }

  .node-dot {
    width: 8px;
    height: 8px;
    background-color: #ddd;
    border-radius: 50%;
    z-index: 2;

    &.current-dot {
      background-color: #1989fa;
      width: 10px;
      height: 10px;
    }
  }

  .node-line {
    width: 1px;
    background-color: #eee;
    flex: 1;
    margin-top: -2px; /* Connect to dot */
    min-height: 20px;
    position: relative; /* For absolute text */

    .line-interval-text {
       position: absolute;
       top: 50%;
       left: 50%;
       transform: translate(-50%, -50%);
       background: #f7f8fa; /* Match bg */
       padding: 2px 4px;
       font-size: 10px;
       color: #999;
       white-space: nowrap;
       border-radius: 4px;
       z-index: 1;
    }
  }
}

.content-card-wrapper {
  flex: 1;
  padding-bottom: 20px;
}

.content-card {
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
  position: relative;

  &.current-status-card {
    background: #e8f3ff;
    border: 1px solid #d0e6fd;

    .status-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;

      .status-title {
        font-weight: bold;
        color: #1989fa;
      }
    }

    .status-interval {
       font-size: 12px;
       color: #666;
    }
  }

  &.record-card {
     /* Regular card style */
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  .left-info {
    display: flex;
    align-items: center;

    .type-icon-wrapper {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #fff3e0;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-right: 8px;

      &.breast { background: #ffebee; }
      &.formula { background: #e3f2fd; }

      .emoji-icon {
         font-size: 14px;
      }
    }

    .type-name {
      font-size: 15px;
      font-weight: bold;
      color: #333;
    }
  }

  .more-icon {
    color: #ccc;
    font-size: 20px;
    padding: 4px;
  }
}

.card-body {
  padding-left: 32px; /* Align with text not icon */
  margin-bottom: 8px;

  .volume-stats {
     display: flex;
     align-items: baseline;
  }

  .volume-num {
     font-size: 24px;
     font-weight: bold;
     color: #333;
     margin-right: 4px;
  }

  .volume-unit {
     font-size: 14px;
     color: #999;
  }

  .breast-stats {
     display: flex;
     justify-content: space-between;
     background: #f9f9f9;
     border-radius: 8px;
     padding: 8px 12px;

     .stat-col {
        display: flex;
        flex-direction: column;
        align-items: center;

        .stat-label {
           font-size: 10px;
           color: #999;
           margin-bottom: 2px;
        }

        .stat-val {
           font-size: 13px;
           color: #666;
           font-weight: 500;

           &.main {
              font-weight: bold;
              color: #333;
           }
        }
     }
  }

  .note-text {
     margin-top: 8px;
     font-size: 13px;
     color: #999;
     line-height: 1.4;
  }
}

.card-footer {
  padding-left: 32px;
  display: flex;
  justify-content: flex-end;

  .interval-text {
     font-size: 12px;
     color: #999;
     background: #f5f5f5;
     padding: 2px 6px;
     border-radius: 4px;
  }
}

.delete-button {
  height: 100%;
}

.breast-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  width: 100%;
}

.mode-switch-container {
  margin-bottom: 20px;
}

.mode-switch {
  display: flex;
  background: #f5f5f5;
  border-radius: 20px;
  padding: 4px;
}

.mode-item {
  padding: 6px 16px;
  border-radius: 18px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;

  &.active {
    background: #fff;
    color: #333;
    font-weight: bold;
    box-shadow: 0 1px 4px rgba(0,0,0,0.1);
  }
}

.timer-ui {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.total-time {
  text-align: center;
  margin-bottom: 30px;

  .time-text {
    font-size: 48px;
    font-weight: bold;
    color: #333;
    line-height: 1;
    font-family: monospace;
  }

  .time-label {
    font-size: 14px;
    color: #999;
    margin-top: 8px;
  }
}

.timer-controls {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 30px;
}

.timer-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 2px dashed #e0e0e0;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  position: relative;
  transition: all 0.3s;

  &.running {
    border-color: #ff7043;
    background-color: #fff8f5;
    border-style: solid;
  }

  .circle-content {
    display: flex;
    flex-direction: column;
    align-items: center;

    .label {
      font-size: 12px;
      color: #999;
      margin-bottom: 4px;
    }

    .sub-time {
      font-size: 14px;
      color: #999;
      margin-top: 4px;
      font-family: monospace;
    }
  }
}

.timer-tip {
  font-size: 12px;
  color: #999;
  text-align: center;
  margin-top: 20px;
  width: 80%;
  line-height: 1.5;
}

.manual-ui {
    width: 100%;
    padding: 20px 0;
  }

  /* Custom Action Sheet Styles */
  .custom-action-sheet {
    background-color: transparent !important;

    .van-action-sheet__content {
      background: transparent !important;
    }
  }

  .sheet-wrapper {
     padding: 10px 16px;
     padding-bottom: calc(10px + env(safe-area-inset-bottom));
  }

  .sheet-actions {
     display: flex;
     align-items: center;
     background: #fff;
     border-radius: 12px;
     height: 60px;
     margin-bottom: 12px;
     box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }

  .sheet-btn {
     flex: 1;
     display: flex;
     justify-content: center;
     align-items: center;
     height: 100%;
     cursor: pointer;

     &:active {
        background-color: #f9f9f9;
     }

     .btn-text {
        font-size: 16px;
        margin-left: 8px;
        font-weight: 500;
     }
  }

  .sheet-divider {
     width: 1px;
     height: 24px;
     background-color: #eee;
  }

  .sheet-cancel {
     background: #fff;
     border-radius: 12px;
     height: 50px;
     display: flex;
     justify-content: center;
     align-items: center;
     font-size: 16px;
     color: #333;
     font-weight: bold;
     box-shadow: 0 2px 8px rgba(0,0,0,0.05);
     cursor: pointer;

     &:active {
        background-color: #f9f9f9;
     }
  }
</style>
