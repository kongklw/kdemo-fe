<template>
  <div class="mobile-temperature">
    <!-- Navbar -->
    <van-nav-bar
      title="体温记录"
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

    <!-- Stats -->
    <div class="stats-card">
      <div class="stat-item">
        <div class="stat-label">今日体温</div>
        <div class="stat-value">{{ currentTemperature || '-' }} <span class="unit">°C</span></div>
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
                  <span class="time">{{ item.measure_date }}</span>
                  <van-tag :type="getTempType(item.temperature)" size="medium" class="temp-tag">{{ item.temperature }} °C</van-tag>
                </div>
              </template>
              <template #label>
                <div class="cell-desc">状态: {{ item.status }}</div>
              </template>
            </van-cell>
            <template #right>
              <van-button square text="删除" type="danger" class="action-button" @click="handleDelete(item)" />
            </template>
          </van-swipe-cell>
        </van-cell-group>
      </van-list>
    </van-pull-refresh>

    <!-- Add Dialog -->
    <van-popup v-model="showAddDialog" position="bottom" :style="{ height: '50%' }" round>
      <div class="add-dialog-content">
        <van-nav-bar
          title="记录体温"
          left-text="取消"
          right-text="保存"
          @click-left="showAddDialog = false"
          @click-right="saveRecord"
        />
        <div class="form-content">
          <van-form ref="tempForm">
            <van-field
              readonly
              clickable
              name="datetime"
              :value="form.measure_date"
              label="日期"
              placeholder="点击选择日期"
              @click="showDatePicker = true"
            />

            <van-field name="temperature" label="体温">
              <template #input>
                <van-stepper v-model="form.temperature" step="0.1" :min="35" :max="42" decimal-length="1" input-width="80px" button-size="32px" />
              </template>
            </van-field>
          </van-form>
        </div>
      </div>
    </van-popup>

    <!-- Date Picker for Form -->
    <van-popup v-model="showDatePicker" position="bottom">
      <van-datetime-picker
        v-model="formDate"
        type="date"
        title="选择日期"
        @confirm="onConfirmDate"
        @cancel="showDatePicker = false"
      />
    </van-popup>

  </div>
</template>

<script>
import { addTemperatureReq, temperatureListReq, deleteTemperatureReq } from '@/api/baby'
import moment from 'moment'
import { Toast, Dialog } from 'vant'

export default {
  name: 'MobileTemperature',
  data() {
    return {
      list: [],
      currentTemperature: '',
      loading: false,
      finished: false,
      refreshing: false,

      // Pagination
      page: 1,
      pageSize: 20,

      // Add
      showAddDialog: false,
      showDatePicker: false,
      formDate: new Date(),
      form: {
        measure_date: '',
        temperature: 36.5
      }
    }
  },
  methods: {
    onClickLeft() {
      this.$router.push('/mobile/home')
    },
    getTempType(temp) {
      if (temp >= 38.5) return 'danger'
      if (temp >= 37.3) return 'warning'
      return 'success'
    },
    async onLoad() {
      if (this.refreshing) {
        this.page = 1
        this.list = []
        this.refreshing = false
      }

      try {
        const res = await temperatureListReq({
          page: this.page,
          page_size: this.pageSize
        })
        if (res.code === 200) {
          const results = res.data.results || []
          this.currentTemperature = res.data.temperature // Assuming API returns this like in original vue

          if (this.page === 1) {
            this.list = results
          } else {
            this.list = [...this.list, ...results]
          }

          if (results.length < this.pageSize) {
            this.finished = true
          } else {
            this.page++
          }
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
    openAddDialog() {
      this.form.measure_date = moment().format('YYYY-MM-DD')
      this.formDate = new Date()
      this.form.temperature = 36.5
      this.showAddDialog = true
    },
    onConfirmDate(value) {
      this.form.measure_date = moment(value).format('YYYY-MM-DD')
      this.showDatePicker = false
    },
    async saveRecord() {
      if (!this.form.measure_date) {
        Toast('请选择日期')
        return
      }

      try {
        const res = await addTemperatureReq(this.form)
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
            const res = await deleteTemperatureReq(item)
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
.mobile-temperature {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 20px;
}

.stats-card {
  margin: 12px 16px;
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  justify-content: center;
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
      font-size: 24px;
      font-weight: bold;
      color: #333;

      .unit {
        font-size: 14px;
        font-weight: normal;
        color: #666;
      }
    }
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

.temp-tag {
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
  display: flex;
  flex-direction: column;
}

.form-content {
    flex: 1;
    padding: 20px 0;
}
</style>
