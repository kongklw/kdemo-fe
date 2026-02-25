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

    <!-- Stats -->
    <div class="stats-card">
      <div class="stat-item">
        <div class="stat-label">今日奶量</div>
        <div class="stat-value">{{ basicInfo.milkVolumes || 0 }} <span class="unit">ml</span></div>
      </div>
      <div class="stat-divider" />
      <div class="stat-item">
        <div class="stat-label">参考奶量</div>
        <div class="stat-value">{{ basicInfo.refermilkVolumes || '-' }} <span class="unit">ml</span></div>
      </div>
    </div>

    <!-- List -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <div v-if="list.length === 0 && !loading" class="empty-state">
          <van-empty description="暂无记录" />
        </div>
        <van-cell-group v-else inset class="list-group">
          <van-swipe-cell v-for="item in list" :key="item.id" class="list-item">
            <van-cell center>
              <template #title>
                <div class="cell-title">
                  <span class="time">{{ formatTime(item.feed_time) }}</span>
                  <van-tag type="primary" size="medium" class="volume-tag">{{ item.milk_volume }} ml</van-tag>
                </div>
              </template>
              <template #label>
                <div class="cell-desc">间隔: {{ item.time_different }}</div>
              </template>
            </van-cell>
            <template #right>
              <van-button square text="删除" type="danger" class="action-button" @click="handleDelete(item)" />
            </template>
          </van-swipe-cell>
        </van-cell-group>
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

    <!-- Add Dialog -->
    <van-popup v-model="showAddDialog" position="bottom" :style="{ height: '80%' }" round>
      <div class="add-dialog-content">
        <van-nav-bar
          title="添加喂奶记录"
          left-text="取消"
          right-text="保存"
          @click-left="showAddDialog = false"
          @click-right="saveFeed"
        />
        <van-form ref="feedForm">
          <van-field
            readonly
            clickable
            name="datetime"
            :value="form.feed_time"
            label="时间"
            placeholder="点击选择时间"
            @click="showTimePicker = true"
          />

          <van-field
            v-model.number="form.milk_volume"
            type="number"
            label="奶量 (ml)"
            placeholder="请输入奶量"
          />

          <div class="quick-tags">
            <div class="tag-label">快速选择:</div>
            <div class="tags-container">
              <van-tag
                v-for="vol in quickVolumes"
                :key="vol"
                plain
                type="primary"
                size="large"
                class="quick-tag"
                :class="{ active: form.milk_volume === vol }"
                @click="form.milk_volume = vol"
              >
                {{ vol }}
              </van-tag>
            </div>
          </div>
        </van-form>
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

  </div>
</template>

<script>
import { feedListReq, addFeedReq, deleteFeedReq } from '@/api/baby'
import moment from 'moment'
import { Toast, Dialog } from 'vant'

export default {
  name: 'MobileBreastFeed',
  data() {
    return {
      list: [],
      basicInfo: {},
      loading: false,
      finished: false,
      refreshing: false,

      currentDate: new Date(),
      showDatePicker: false,
      minDate: new Date(2020, 0, 1),
      maxDate: new Date(2030, 11, 31),

      // Add
      showAddDialog: false,
      showTimePicker: false,
      formDate: new Date(),
      form: {
        feed_time: '',
        milk_volume: 120
      },

      quickVolumes: [30, 60, 90, 120, 150, 180, 210, 240]
    }
  },
  computed: {
    currentDateText() {
      return moment(this.currentDate).format('YYYY-MM-DD')
    }
  },
  methods: {
    onClickLeft() {
      this.$router.push('/mobile/home')
    },
    formatTime(time) {
      if (!time) return ''
      return moment(time).format('HH:mm')
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
          this.list = res.data.results || []
          this.basicInfo = res.data.basicInfo || {}
          this.finished = true // Assuming no pagination for daily view
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
      this.showAddDialog = true
    },
    onConfirmFormTime(value) {
      this.form.feed_time = moment(value).format('YYYY-MM-DD HH:mm:ss')
      this.showTimePicker = false
    },
    async saveFeed() {
      if (!this.form.feed_time || !this.form.milk_volume) {
        Toast('请填写完整信息')
        return
      }

      try {
        const res = await addFeedReq(this.form)
        if (res.code === 200) {
          Toast.success('添加成功')
          this.showAddDialog = false
          this.onRefresh()
        } else {
          Toast.fail(res.msg || '添加失败')
        }
      } catch (error) {
        console.error(error)
        Toast.fail('添加失败')
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

.add-dialog-content {
  background-color: #fff;
  height: 100%;
}

.quick-tags {
    padding: 16px;

    .tag-label {
        font-size: 14px;
        color: #666;
        margin-bottom: 10px;
    }

    .tags-container {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
    }

    .quick-tag {
        padding: 4px 12px;

        &.active {
            background-color: #1989fa;
            color: #fff;
        }
    }
}
</style>
