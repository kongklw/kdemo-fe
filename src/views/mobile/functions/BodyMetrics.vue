<template>
  <div class="mobile-body-metrics">
    <van-nav-bar
      title="宝宝"
      left-arrow
      right-text="添加"
      fixed
      placeholder
      @click-left="onClickLeft"
      @click-right="goAdd"
    />

    <van-tabs v-model="activeTab" sticky offset-top="46" color="#ff6b81" title-active-color="#ff6b81" @change="handleTabChange">
      <van-tab title="记录列表">
        <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
          <van-list
            v-model="loading"
            :finished="finished"
            finished-text="没有更多了"
            @load="onLoad"
          >
            <div v-if="list.length === 0 && !loading" class="empty">
              <div class="empty-illus">
                <img :src="emptySvg" alt="empty">
              </div>
              <div class="empty-title">定期测量身高体重</div>
              <div class="empty-sub">每一次长大都值得被记录</div>
              <van-button round type="danger" class="start-btn" @click="goAdd">开始记录</van-button>
            </div>

            <div v-else class="list-wrap">
              <div class="record-list">
                <div v-for="item in list" :key="item.id" class="record-card" @click="goEdit(item)">
                  <div class="record-head">
                    <div class="head-left">
                      <span class="head-date">{{ item.measure_date }}</span>
                      <span class="head-age">{{ item.age_description }}</span>
                    </div>
                  </div>
                  <div class="record-body">
                    <div class="thumb">
                      <img v-if="item.photo" :src="item.photo" alt="photo">
                      <div v-else class="thumb-placeholder" />
                    </div>
                    <div class="metrics">
                      <div class="metric">
                        <div class="metric-value">{{ formatNum(item.height_cm, 1) || '-' }}<span v-if="formatNum(item.height_cm, 1)" class="metric-unit">cm</span></div>
                        <div class="metric-label">身高</div>
                      </div>
                      <div class="metric">
                        <div class="metric-value">{{ formatNum(item.weight_kg, 2) || '-' }}<span v-if="formatNum(item.weight_kg, 2)" class="metric-unit">kg</span></div>
                        <div class="metric-label">体重</div>
                      </div>
                      <div class="metric">
                        <div class="metric-value">{{ formatNum(item.head_circumference_cm, 1) || '-' }}<span v-if="formatNum(item.head_circumference_cm, 1)" class="metric-unit">cm</span></div>
                        <div class="metric-label">头围</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="bottom-actions">
                <van-button round type="danger" class="start-btn" @click="goAdd">开始记录</van-button>
              </div>
            </div>
          </van-list>
        </van-pull-refresh>
      </van-tab>

      <van-tab title="身高曲线">
        <div class="curve">
          <div ref="heightChart" class="chart" />
          <div class="curve-foot">
            <div class="hint">曲线根据 WS/T 423-2022《7岁以下儿童生长标准》绘制</div>
            <div class="link" @click="openHelp">如何记录宝宝成长 &gt;</div>
          </div>
        </div>
      </van-tab>

      <van-tab title="体重曲线">
        <div class="curve">
          <div ref="weightChart" class="chart" />
          <div class="curve-foot">
            <div class="hint">曲线根据 WS/T 423-2022《7岁以下儿童生长标准》绘制</div>
            <div class="link" @click="openHelp">如何记录宝宝成长 &gt;</div>
          </div>
        </div>
      </van-tab>

      <van-tab title="头围曲线">
        <div class="curve">
          <div ref="headChart" class="chart" />
          <div class="curve-foot">
            <div class="hint">曲线根据 WS/T 423-2022《7岁以下儿童生长标准》绘制</div>
            <div class="link" @click="openHelp">如何记录宝宝成长 &gt;</div>
          </div>
        </div>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script>
import echarts from 'echarts'
import moment from 'moment'
import { Toast } from 'vant'
import { getBabyInfoReq, getGrowthRecordsReq } from '@/api/baby'

export default {
  name: 'MobileBodyMetrics',
  data() {
    return {
      activeTab: 0,
      list: [],
      loading: false,
      finished: false,
      refreshing: false,

      babyInfo: null,
      chartInstances: {
        height: null,
        weight: null,
        head: null
      }
    }
  },
  computed: {
    emptySvg() {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="160" viewBox="0 0 220 160"><defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#ffe3ea"/><stop offset="1" stop-color="#ffd1da"/></linearGradient></defs><rect x="0" y="0" width="220" height="160" rx="16" fill="url(#g)"/><circle cx="74" cy="62" r="20" fill="#ff9fb0"/><circle cx="145" cy="54" r="16" fill="#ff9fb0"/><path d="M52 120c12-26 34-40 58-40s46 14 58 40" fill="none" stroke="#ff6b81" stroke-width="8" stroke-linecap="round"/><path d="M96 74c0 10 8 18 18 18s18-8 18-18" fill="none" stroke="#ff6b81" stroke-width="6" stroke-linecap="round"/></svg>`
      return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
    }
  },
  mounted() {
    this.loadBabyInfo()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    Object.values(this.chartInstances).forEach(c => {
      if (c) c.dispose()
    })
  },
  methods: {
    onClickLeft() {
      this.$router.push('/mobile/home')
    },
    goAdd() {
      this.$router.push('/mobile/functions/bodymetrics/add')
    },
    openHelp() {
      Toast('功能开发中')
    },
    formatDateCN(dateStr) {
      if (!dateStr) return ''
      return moment(dateStr).format('YYYY年M月D日')
    },
    formatNum(val, digits) {
      if (val === null || val === undefined || val === '') return ''
      const n = Number(val)
      if (Number.isNaN(n)) return ''
      return n.toFixed(digits)
    },
    async loadBabyInfo() {
      try {
        const res = await getBabyInfoReq()
        if (res.code === 200) {
          this.babyInfo = res.data
          this.tryRenderCharts()
        }
      } catch (e) {
        this.babyInfo = null
      }
    },
    handleTabChange() {
      this.$nextTick(() => {
        this.tryRenderCharts()
      })
    },
    handleResize() {
      Object.values(this.chartInstances).forEach(c => {
        if (c) c.resize()
      })
    },
    onRefresh() {
      this.finished = false
      this.loading = true
      this.refreshing = true
      this.onLoad()
    },
    async onLoad() {
      if (this.refreshing) {
        this.list = []
        this.refreshing = false
      }

      const pageSize = 20
      const page = Math.floor(this.list.length / pageSize) + 1

      try {
        const res = await getGrowthRecordsReq({ page_num: page, page_size: pageSize })
        if (res.code !== 200) {
          this.finished = true
          this.loading = false
          return
        }

        const { list: pageList, total } = res.data
        this.list = [...this.list, ...(pageList || [])]

        if (!pageList || pageList.length < pageSize) {
          this.finished = true
        }
        if (typeof total === 'number' && this.list.length >= total) {
          this.finished = true
        }
      } catch (e) {
        this.finished = true
      } finally {
        this.loading = false
        this.tryRenderCharts()
      }
    },
    goEdit(item) {
      this.$router.push(`/mobile/functions/bodymetrics/edit/${item.id}`)
    },
    calcAgeMonths(birthdayStr, dateStr) {
      if (!birthdayStr || !dateStr) return null
      const b = moment(birthdayStr, 'YYYY-MM-DD')
      const d = moment(dateStr, 'YYYY-MM-DD')
      if (!b.isValid() || !d.isValid()) return null
      if (d.isBefore(b, 'day')) return null

      let months = (d.year() - b.year()) * 12 + (d.month() - b.month())
      if (d.date() < b.date()) {
        months -= 1
      }
      return months
    },
    buildStandard(metric, months) {
      const base = {
        height: { p50: 50, slope: 0.8, offsets: { p3: -6, p25: -3, p75: 3, p97: 6 }},
        weight: { p50: 3.3, slope: 0.25, offsets: { p3: -1.4, p25: -0.7, p75: 0.7, p97: 1.4 }},
        head: { p50: 34.5, slope: 0.18, offsets: { p3: -2.2, p25: -1.1, p75: 1.1, p97: 2.2 }}
      }[metric]

      const p50 = months.map(m => Number((base.p50 + base.slope * m).toFixed(2)))
      const p3 = p50.map(v => Number((v + base.offsets.p3).toFixed(2)))
      const p25 = p50.map(v => Number((v + base.offsets.p25).toFixed(2)))
      const p75 = p50.map(v => Number((v + base.offsets.p75).toFixed(2)))
      const p97 = p50.map(v => Number((v + base.offsets.p97).toFixed(2)))

      return { p3, p25, p50, p75, p97 }
    },
    getActualSeries(metric, months) {
      if (!this.babyInfo || !this.babyInfo.birthday) return months.map(() => null)
      const field = metric === 'height' ? 'height_cm' : (metric === 'weight' ? 'weight_kg' : 'head_circumference_cm')
      const map = new Map()
      this.list.forEach(r => {
        const m = this.calcAgeMonths(this.babyInfo.birthday, r.measure_date)
        if (m === null) return
        if (r[field] === null || r[field] === undefined || r[field] === '') return
        map.set(m, Number(r[field]))
      })
      return months.map(m => (map.has(m) ? map.get(m) : null))
    },
    tryRenderCharts() {
      if (this.activeTab === 0) return

      const months = []
      for (let i = 0; i <= 36; i += 1) {
        months.push(i)
      }
      const xAxis = months.map(m => `${m}`)

      if (this.activeTab === 1) {
        this.renderChart('height', this.$refs.heightChart, xAxis, months)
      } else if (this.activeTab === 2) {
        this.renderChart('weight', this.$refs.weightChart, xAxis, months)
      } else if (this.activeTab === 3) {
        this.renderChart('head', this.$refs.headChart, xAxis, months)
      }
    },
    renderChart(metric, el, xAxis, months) {
      if (!el) return
      if (!this.chartInstances[metric]) {
        this.chartInstances[metric] = echarts.init(el)
      }
      const standard = this.buildStandard(metric, months)
      const actual = this.getActualSeries(metric, months)

      const colors = {
        p3: '#b5d6ff',
        p25: '#a2ccff',
        p50: '#79b7ff',
        p75: '#58a6ff',
        p97: '#3f93ff',
        actual: '#ff6b81'
      }

      const unit = metric === 'height' ? 'cm' : (metric === 'weight' ? 'kg' : 'cm')
      const yName = metric === 'height' ? '身高' : (metric === 'weight' ? '体重' : '头围')

      const makeLine = (name, dataKey, color, showLabel) => ({
        name,
        type: 'line',
        data: standard[dataKey],
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2.5, color },
        itemStyle: { color },
        label: {
          show: showLabel,
          position: 'end',
          color,
          fontSize: 10,
          formatter: name
        }
      })

      this.chartInstances[metric].setOption({
        grid: { left: 42, right: 54, top: 24, bottom: 64, containLabel: true },
        tooltip: { trigger: 'axis' },
        xAxis: {
          type: 'category',
          data: xAxis,
          boundaryGap: false,
          axisLabel: {
            interval: 0,
            rotate: 45,
            fontSize: 10,
            color: '#666'
          },
          axisTick: { show: false },
          name: '月龄',
          nameTextStyle: { color: '#999', fontSize: 12 },
          nameGap: 40
        },
        yAxis: {
          type: 'value',
          name: `${yName}(${unit})`,
          axisLine: { show: false },
          axisLabel: { color: '#666', fontSize: 10 },
          nameTextStyle: { color: '#999', fontSize: 12 },
          nameGap: 18
        },
        series: [
          makeLine('3%', 'p3', colors.p3, true),
          makeLine('25%', 'p25', colors.p25, true),
          makeLine('50%', 'p50', colors.p50, true),
          makeLine('75%', 'p75', colors.p75, true),
          makeLine('97%', 'p97', colors.p97, true),
          {
            name: '宝宝',
            type: 'line',
            data: actual,
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: { width: 3, color: colors.actual },
            itemStyle: { color: colors.actual }
          }
        ]
      }, true)

      this.$nextTick(() => {
        if (this.chartInstances[metric]) this.chartInstances[metric].resize()
      })
    }
  }
}
</script>

<style scoped>
.mobile-body-metrics {
  min-height: 100vh;
  background: #f7f8fa;
}

.record-list {
  padding: 8px 12px 0;
}

.record-card {
  background: #fff;
  border-radius: 14px;
  padding: 12px;
  margin-bottom: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
}

.record-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.head-left {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.head-date {
  font-size: 13px;
  color: #999;
}

.head-age {
  font-size: 13px;
  color: #333;
  font-weight: 600;
}

.record-body {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.thumb {
  width: 58px;
  height: 58px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f3f4f6;
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.thumb-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #ffe3ea 0%, #ffd1da 100%);
}

.metrics {
  flex: 1;
  display: flex;
  justify-content: space-between;
}

.metric {
  flex: 1;
  text-align: center;
}

.metric-value {
  font-size: 18px;
  font-weight: 700;
  color: #ff6b81;
  line-height: 1.1;
}

.metric-unit {
  margin-left: 2px;
  font-size: 12px;
  font-weight: 600;
  color: #ff6b81;
}

.metric-label {
  margin-top: 4px;
  font-size: 12px;
  color: #666;
}

.empty {
  padding: 42px 24px 24px;
  text-align: center;
}

.empty-illus img {
  width: 220px;
  height: 160px;
}

.empty-title {
  margin-top: 14px;
  font-size: 18px;
  font-weight: 600;
  color: #222;
}

.empty-sub {
  margin-top: 6px;
  font-size: 14px;
  color: #666;
}

.start-btn {
  margin-top: 22px;
  width: 160px;
  background: #ff6b81;
  border-color: #ff6b81;
}

.bottom-actions {
  padding: 14px 24px 0;
  display: flex;
  justify-content: center;
}

.curve {
  padding: 12px 12px 24px;
}

.chart {
  height: 320px;
  background: #fff;
  border-radius: 12px;
}

.curve-foot {
  margin-top: 10px;
  text-align: center;
}

.hint {
  font-size: 12px;
  color: #999;
}

.link {
  margin-top: 8px;
  font-size: 13px;
  color: #1989fa;
}

.form {
  padding: 8px 12px 20px;
}

.unit {
  color: #999;
  font-size: 12px;
}

.uploader {
  margin-top: 12px;
  background: #fff;
  border-radius: 12px;
  padding: 12px;
}

.uploader-label {
  margin-bottom: 10px;
  font-size: 14px;
  color: #333;
}
</style>
