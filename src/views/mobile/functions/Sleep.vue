<template>
  <div class="mobile-sleep">
    <!-- Navbar -->
    <van-nav-bar
      title="睡眠记录"
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
                  <span class="time">{{ formatTime(item.sleep_time) }}</span>
                  <van-tag :type="getStatusType(item.status)" class="status-tag">{{ item.status }}</van-tag>
                </div>
              </template>
              <template #label>
                <div v-if="item.describe" class="cell-desc">{{ item.describe }}</div>
                <div v-if="item.amount" class="cell-duration">持续: {{ item.amount }}</div>
              </template>
            </van-cell>
            <!--
            <template #right>
                <van-button square text="删除" type="danger" class="action-button" @click="handleDelete(item)" />
            </template>
            -->
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
          title="新增睡眠记录"
          left-text="取消"
          right-text="保存"
          @click-left="showAddDialog = false"
          @click-right="saveSleep"
        />
        <van-form ref="sleepForm">
          <van-field
            readonly
            clickable
            name="datetime"
            :value="form.sleep_time"
            label="时间"
            placeholder="点击选择时间"
            @click="showTimePicker = true"
          />

          <van-field name="radio" label="状态">
            <template #input>
              <van-radio-group v-model="form.status" direction="horizontal">
                <van-radio name="熟睡">熟睡</van-radio>
                <van-radio name="醒着">醒着</van-radio>
                <van-radio name="其他">其他</van-radio>
              </van-radio-group>
            </template>
          </van-field>

          <van-field
            v-model="form.describe"
            rows="2"
            autosize
            label="描述"
            type="textarea"
            placeholder="请输入描述"
          />

          <div class="quick-tags">
            <div class="tag-label">快速标签:</div>
            <div class="tags-container">
              <van-tag
                v-for="word in commonWordList"
                :key="word.creativeWordId"
                plain
                type="primary"
                size="medium"
                class="quick-tag"
                @click="appendTag(word.name)"
              >
                #{{ word.name }}
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
import { addSleepReq, showSleepListReq } from '@/api/baby'
import moment from 'moment'

export default {
  name: 'MobileSleep',
  data() {
    return {
      list: [],
      loading: false,
      finished: false,
      refreshing: false,

      currentDate: new Date(),
      showDatePicker: false,
      minDate: new Date(2020, 0, 1),
      maxDate: new Date(2030, 11, 31),

      // Pagination
      page: 1,
      pageSize: 20,
      total: 0,

      // Add
      showAddDialog: false,
      showTimePicker: false,
      formDate: new Date(),
      form: {
        sleep_time: '',
        status: '熟睡',
        describe: ''
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
      ]
    }
  },
  computed: {
    currentDateText() {
      return moment(this.currentDate).format('YYYY-MM-DD')
    }
  },
  methods: {
    onClickLeft() {
      this.$router.back()
    },

    async onLoad() {
      if (this.refreshing) {
        this.list = []
        this.refreshing = false
      }

      const params = {
        page_num: this.page,
        page_size: this.pageSize,
        date: this.currentDateText
      }

      try {
        const res = await showSleepListReq(params)
        if (res.code === 200) {
          const data = res.data
          if (this.page === 1) {
            this.list = data.results
          } else {
            this.list = [...this.list, ...data.results]
          }

          this.total = data.count

          this.page++
          if (this.list.length >= this.total) {
            this.finished = true
          }
        } else {
          this.finished = true
        }
      } catch (error) {
        this.finished = true
      } finally {
        this.loading = false
      }
    },

    onRefresh() {
      this.finished = false
      this.loading = true
      this.page = 1
      this.onLoad()
    },

    onConfirmDate(value) {
      this.showDatePicker = false
      this.currentDate = value
      this.onRefresh()
    },

    formatTime(timeStr) {
      if (!timeStr) return ''
      // Extract HH:mm:ss from YYYY-MM-DD HH:mm:ss
      return moment(timeStr).format('HH:mm')
    },

    getStatusType(status) {
      if (status === '熟睡') return 'success'
      if (status === '醒着') return 'primary'
      return 'default'
    },

    // Add Logic
    openAddDialog() {
      this.form = {
        sleep_time: moment().format('YYYY-MM-DD HH:mm:00'),
        status: '熟睡',
        describe: ''
      }
      this.formDate = new Date()
      this.showAddDialog = true
    },

    onConfirmFormTime(value) {
      this.form.sleep_time = moment(value).format('YYYY-MM-DD HH:mm:ss')
      this.showTimePicker = false
    },

    appendTag(tagName) {
      const tag = `#${tagName} `
      this.form.describe = this.form.describe ? this.form.describe + tag : tag
    },

    saveSleep() {
      if (!this.form.sleep_time) {
        this.$toast.fail('请选择时间')
        return
      }

      addSleepReq(this.form).then(res => {
        if (res.code === 200) {
          this.$toast.success('保存成功')
          this.showAddDialog = false
          this.onRefresh()
        } else {
          this.$toast.fail(res.msg || '保存失败')
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.mobile-sleep {
  background-color: #f7f8fa;
  min-height: 100vh;
  padding-bottom: 20px;
}

.filter-bar {
  background-color: #fff;
  padding: 10px 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid #f5f6f7;

  .date-selector {
    display: flex;
    align-items: center;
    font-size: 16px;
    font-weight: bold;
    color: #333;
    padding: 8px 16px;
    background-color: #f0f2f5;
    border-radius: 20px;

    span {
      margin-left: 6px;
    }
  }
}

.list-group {
    margin-top: 10px;
}

.cell-title {
    display: flex;
    align-items: center;

    .time {
        font-size: 16px;
        font-weight: bold;
        margin-right: 10px;
    }
}

.cell-desc {
    color: #666;
    margin-top: 4px;
}

.cell-duration {
    color: #999;
    font-size: 12px;
    margin-top: 2px;
}

.add-dialog-content {
    background-color: #fff;
    height: 100%;
}

.quick-tags {
    padding: 10px 16px;

    .tag-label {
        font-size: 14px;
        color: #666;
        margin-bottom: 8px;
    }

    .tags-container {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }
}
</style>
