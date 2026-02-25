<template>
  <div class="mobile-analysis">
    <van-nav-bar
      title="数据分析"
      left-text="返回"
      left-arrow
      fixed
      placeholder
      @click-left="onClickLeft"
    />

    <van-tabs v-model="activeTab" sticky offset-top="46px">
      <van-tab title="今日概览">
        <div class="overview-container">
          <!-- Summary Cards -->
          <van-grid :column-num="2" :gutter="10" clickable class="summary-grid">
            <van-grid-item
              v-for="item in summaryCards"
              :key="item.type"
              class="summary-card"
              @click="handleSummaryClick(item.type)"
            >
              <div class="summary-content">
                <div class="summary-icon" :class="item.iconClass">
                  <svg-icon :icon-class="item.icon" />
                </div>
                <div class="summary-info">
                  <div class="summary-label">{{ item.label }}</div>
                  <div class="summary-value">{{ item.value }} <span class="unit">{{ item.unit }}</span></div>
                </div>
              </div>
            </van-grid-item>
          </van-grid>

          <div class="content-section">
            <van-collapse v-model="activeNames">
              <van-collapse-item name="1">
                <template #title>
                  <div class="collapse-title">
                    <span class="date-tag">{{ currentDateStr }}</span>
                    <span class="volume-tag">喂奶记录</span>
                  </div>
                </template>

                <!-- Date Picker Trigger -->
                <van-cell title="选择日期" :value="currentDateStr" is-link @click="showCalendar = true" />

                <!-- Supplements Checkboxes -->
                <div class="supplements-section">
                  <div class="section-label">补充剂打卡</div>
                  <van-checkbox-group v-model="checkedSupplements" direction="horizontal">
                    <van-checkbox name="AD" shape="square">AD</van-checkbox>
                    <van-checkbox name="Calcium" shape="square">钙</van-checkbox>
                    <van-checkbox name="Probiotics" shape="square">益生菌</van-checkbox>
                    <van-checkbox name="Poo" shape="square">大便</van-checkbox>
                  </van-checkbox-group>
                </div>

                <!-- Feeding List Table -->
                <div class="feeding-table">
                  <van-cell-group title="详细记录">
                    <van-cell
                      v-for="(item, index) in list"
                      :key="index"
                      :title="formatTime(item.time)"
                      :value="item.volume + ' ml'"
                    />
                    <van-empty v-if="list.length === 0" description="暂无记录" />
                  </van-cell-group>
                </div>

              </van-collapse-item>

              <van-collapse-item title="使用说明" name="2">
                <div class="text-content">点击上方概览卡片可快速切换图表视图。</div>
                <div class="text-content">喂奶记录支持日期筛选和补充剂打卡。</div>
              </van-collapse-item>
            </van-collapse>
          </div>

          <van-calendar v-model="showCalendar" :min-date="minDate" :max-date="maxDate" @confirm="onConfirmDate" />
        </div>
      </van-tab>

      <van-tab title="数据图表">
        <div class="chart-container">
          <div class="chart-wrapper">
            <div class="chart-header">喂奶趋势 (周)</div>
            <feed-chart v-if="feedWeekChartData.xAxisData" :chart-data="feedWeekChartData" height="300px" width="100%" />
            <van-loading v-else size="24px" vertical>加载中...</van-loading>
          </div>

          <div class="chart-wrapper">
            <div class="chart-header">趋势分析</div>

            <!-- Chart Type Selector -->
            <van-grid :column-num="4" :border="false" class="chart-selector">
              <van-grid-item
                v-for="item in chartTypes"
                :key="item.type"
                class="selector-item"
                :class="{ active: currentChartType === item.type }"
                @click="handleChartTypeChange(item.type)"
              >
                <div class="selector-content">
                  <svg-icon :icon-class="item.icon" class-name="selector-icon" />
                  <span class="selector-label">{{ item.label }}</span>
                </div>
              </van-grid-item>
            </van-grid>

            <line-chart v-if="lineChartData.xAxisData" :chart-data="lineChartData" height="300px" width="100%" />
            <div v-else-if="!lineChartData.xAxisData && !loadingCharts" class="empty-chart">
              <van-empty description="暂无数据" />
            </div>
            <van-loading v-else size="24px" vertical>加载中...</van-loading>
          </div>
        </div>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script>
import { feedListReq, dashboardReq, lineChartReq } from '@/api/baby'
import FeedChart from '@/views/baby/components/FeedChart'
import LineChart from '@/views/baby/components/LineChart'
import moment from 'moment'

export default {
  name: 'MobileAnalysis',
  components: {
    FeedChart,
    LineChart
  },
  data() {
    return {
      activeTab: 0,
      activeNames: ['1'],
      showCalendar: false,
      currentDate: new Date(),
      minDate: new Date(2020, 0, 1),
      maxDate: new Date(),

      checkedSupplements: [], // Local state only
      list: [],
      totalVolume: 0,

      // Chart Data
      feedWeekChartData: {},
      lineChartData: {},
      totalLineChartData: {},
      currentChartType: 'milkVolumes',
      loadingCharts: false,
      chartTypes: [
        { type: 'milkVolumes', label: '奶量', icon: 'babygirl' },
        { type: 'temperature', label: '体温', icon: 'bodyTemperature' },
        { type: 'babyPants', label: '尿不湿', icon: 'babyPants' },
        { type: 'purchases', label: '花费', icon: 'money' }
      ]
    }
  },
  computed: {
    currentDateStr() {
      return moment(this.currentDate).format('YYYY-MM-DD')
    }
  },
  created() {
    this.fetchData()
    this.fetchChartsData()
  },
  methods: {
    onClickLeft() {
      this.$router.back()
    },
    formatTime(timeStr) {
      return moment(timeStr).format('HH:mm')
    },
    fetchData() {
      const dateStr = this.currentDateStr
      feedListReq({ date: dateStr }).then(res => {
        if (res.code === 200) {
          this.list = res.data
          this.calculateTotal()
        }
      })
    },
    fetchChartsData() {
      // Fetch Dashboard Data for FeedChart
      dashboardReq().then(res => {
        if (res.code === 200 && res.data.feedWeekChartData) {
          this.feedWeekChartData = res.data.feedWeekChartData
        }
      })

      // Fetch Line Chart Data
      lineChartReq().then(res => {
        if (res.code === 200 && res.data) {
          const data = res.data
          this.totalLineChartData = data.totalLineChartData
          this.basicInfo = data.basicInfo || {}

          // Initialize chart with current type
          this.handleChartTypeChange(this.currentChartType)
        }
      })
    },
    handleChartTypeChange(type) {
      this.currentChartType = type
      if (this.totalLineChartData && this.totalLineChartData[type]) {
        this.lineChartData = this.totalLineChartData[type]
      } else {
        this.lineChartData = {}
      }
    },
    calculateTotal() {
      this.totalVolume = this.list.reduce((sum, item) => sum + (Number(item.volume) || 0), 0)
    },
    onConfirmDate(date) {
      this.showCalendar = false
      this.currentDate = date
      this.fetchData()
    }
  }
}
</script>

<style scoped>
.mobile-analysis {
  padding-bottom: 20px;
  background-color: #f7f8fa;
  min-height: 100vh;
}
.content {
  padding: 10px;
}
.collapse-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
.date-tag {
  font-weight: bold;
  color: #333;
}
.volume-tag {
  color: #1989fa;
  font-weight: bold;
}
.supplements-section {
  padding: 10px 16px;
  background-color: #fff;
  border-bottom: 1px solid #ebedf0;
}
.section-label {
  font-size: 14px;
  color: #646566;
  margin-bottom: 8px;
}
.feeding-table {
  margin-top: 10px;
}
.text-content {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 8px;
}
.chart-container {
  padding: 15px;
  background-color: #f7f8fa;
}
.chart-wrapper {
  background: #fff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.chart-header {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
  padding-left: 5px;
  border-left: 4px solid #1989fa;
}
.chart-selector {
  margin-bottom: 20px;
  background: #fff;
  border-radius: 8px;
  padding: 10px 0;
}

.selector-item {
  ::v-deep .van-grid-item__content {
    padding: 10px 5px;
    border-radius: 8px;
    background-color: #f8f8f8;
    transition: all 0.3s;
  }

  &.active {
    ::v-deep .van-grid-item__content {
      background-color: #e6f7ff;
      border: 1px solid #1890ff;
    }
    .selector-label {
      color: #1890ff;
      font-weight: bold;
    }
    .selector-icon {
      color: #1890ff !important;
    }
  }
}

.selector-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.selector-icon {
  font-size: 24px;
  margin-bottom: 8px;
  color: #666;
}

.selector-label {
  font-size: 12px;
  color: #666;
}

.summary-grid {
  margin: 10px 0;
}

.summary-card {
  ::v-deep .van-grid-item__content {
    padding: 15px;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  }
}

.summary-content {
  display: flex;
  align-items: center;
  width: 100%;
}

.summary-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;

  &.icon-milk {
    background-color: rgba(64, 201, 198, 0.1);
    color: #40c9c6;
  }
  &.icon-temp {
    background-color: rgba(54, 163, 247, 0.1);
    color: #36a3f7;
  }
  &.icon-pants {
    background-color: rgba(52, 191, 163, 0.1);
    color: #34bfa3;
  }
  &.icon-money {
    background-color: rgba(244, 81, 108, 0.1);
    color: #f4516c;
  }

  .svg-icon {
    font-size: 24px;
  }
}

.summary-info {
  flex: 1;

  .summary-label {
    font-size: 12px;
    color: #909399;
    margin-bottom: 4px;
  }

  .summary-value {
    font-size: 18px;
    font-weight: bold;
    color: #303133;

    .unit {
      font-size: 12px;
      font-weight: normal;
      color: #909399;
      margin-left: 2px;
    }
  }
}

.overview-container {
  padding: 10px;
  background-color: #f7f8fa;
  min-height: calc(100vh - 90px);
}

.content-section {
  margin-top: 10px;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
}

.empty-chart {
    padding: 20px 0;
    text-align: center;
}
</style>
