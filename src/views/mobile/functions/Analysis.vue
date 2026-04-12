<template>
  <div class="mobile-analysis">
    <van-nav-bar
      title="健康分析"
      left-text="返回"
      left-arrow
      fixed
      placeholder
      @click-left="onClickLeft"
    />

    <van-tabs v-model="activeTab" sticky offset-top="46px" color="#ff976a">
      <van-tab title="健康仪表盘">
        <div class="dashboard">
          <div class="hero-card">
            <div class="hero-top">
              <div class="hero-title">今日健康</div>
              <div class="hero-date">{{ currentDateStr }}</div>
            </div>
            <div class="hero-score">
              <div class="score">{{ healthScore }}</div>
              <div class="score-label">综合指数</div>
            </div>
            <van-progress :percentage="healthScore" stroke-width="10" color="#ff976a" track-color="#f5f5f5" :show-pivot="false" />
          </div>

          <van-grid :column-num="2" :gutter="10" class="metric-grid">
            <van-grid-item>
              <div class="metric">
                <div class="metric-label">今日奶量</div>
                <div class="metric-value">{{ todayMilk }}<span class="metric-unit">ml</span></div>
                <div class="metric-sub">参考 {{ milkRefRangeText }}</div>
              </div>
            </van-grid-item>
            <van-grid-item>
              <div class="metric">
                <div class="metric-label">喂养次数</div>
                <div class="metric-value">{{ todayFeedCount }}<span class="metric-unit">次</span></div>
                <div class="metric-sub">最近一次 {{ lastFeedText }}</div>
              </div>
            </van-grid-item>
            <van-grid-item>
              <div class="metric">
                <div class="metric-label">体温</div>
                <div class="metric-value">
                  {{ todayTemperature }}<span v-if="isNumericTemperature" class="metric-unit">℃</span>
                </div>
                <div class="metric-sub">{{ temperatureHint }}</div>
              </div>
            </van-grid-item>
            <van-grid-item>
              <div class="metric">
                <div class="metric-label">尿不湿</div>
                <div class="metric-value">{{ todayDiapers }}<span class="metric-unit">次</span></div>
                <div class="metric-sub">漏尿率 {{ leakRateText }}</div>
              </div>
            </van-grid-item>
          </van-grid>

          <van-cell-group title="今日洞察">
            <van-cell v-for="(tip, idx) in insights" :key="idx" :title="tip" />
            <van-empty v-if="insights.length === 0" description="暂无洞察" />
          </van-cell-group>

          <van-cell-group title="近期提醒">
            <van-cell title="近7天疫苗提醒" :value="vaccineDueText" is-link @click="activeTab = 2" />
            <van-cell title="最新身高体重记录" :value="growthLatestText" is-link @click="activeTab = 2" />
          </van-cell-group>
        </div>
      </van-tab>

      <van-tab title="趋势">
        <div class="trend">
          <div class="section">
            <div class="section-title">喂养趋势</div>
            <van-grid :column-num="2" :border="false" class="seg">
              <van-grid-item :class="{ active: feedChartMode === 'current_day' }" @click="setFeedChartMode('current_day')">
                今日
              </van-grid-item>
              <van-grid-item :class="{ active: feedChartMode === 'latest_week' }" @click="setFeedChartMode('latest_week')">
                近15天
              </van-grid-item>
            </van-grid>
            <feed-chart v-if="currentFeedChart.xAxisData" :chart-data="currentFeedChart" height="280px" width="100%" />
            <van-loading v-else size="24px" vertical>加载中...</van-loading>
          </div>

          <div class="section">
            <div class="section-title">体温与漏尿</div>
            <van-grid :column-num="2" :border="false" class="seg">
              <van-grid-item :class="{ active: currentTrendType === 'temperature' }" @click="setTrendType('temperature')">
                体温
              </van-grid-item>
              <van-grid-item :class="{ active: currentTrendType === 'babyPants' }" @click="setTrendType('babyPants')">
                漏尿
              </van-grid-item>
            </van-grid>
            <line-chart v-if="trendChartData.xAxisData" :chart-data="trendChartData" height="280px" width="100%" />
            <van-empty v-else description="暂无数据" />
          </div>
        </div>
      </van-tab>

      <van-tab title="健康档案">
        <div class="profile">
          <van-cell-group title="成长记录">
            <van-cell title="最新记录日期" :value="growthLatestDate" />
            <van-cell title="身高" :value="growthHeightText" />
            <van-cell title="体重" :value="growthWeightText" />
            <van-cell title="头围" :value="growthHeadText" />
          </van-cell-group>

          <van-cell-group title="疫苗计划">
            <van-cell title="近7天需接种" :value="vaccineDueText" />
            <van-cell v-for="item in vaccineDueList" :key="item.vaccine_key + '-' + item.recommend_date" :title="item.name" :label="item.recommend_date" />
            <van-empty v-if="vaccineDueList.length === 0" description="暂无近期疫苗" />
          </van-cell-group>
        </div>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script>
import { babyPantsListReq, feedChartReq, feedListReq, getGrowthRecordsReq, getVaccineScheduleReq, lineChartReq, showSleepListReq } from '@/api/baby'
import FeedChart from '@/views/baby/components/FeedChart'
import LineChart from '@/views/baby/components/LineChart'
import moment from 'moment'
import { Toast } from 'vant'

export default {
  name: 'MobileAnalysis',
  components: {
    FeedChart,
    LineChart
  },
  data() {
    return {
      activeTab: 0,
      currentDate: new Date(),
      feedChartMode: 'latest_week',
      feedChartData: null,
      feedList: [],
      sleepList: [],
      diapersCount: 0,
      lineChartTotal: null,
      currentTrendType: 'temperature',
      growthLatest: null,
      vaccineSchedule: null,
      loading: false
    }
  },
  computed: {
    currentDateStr() {
      return moment(this.currentDate).format('YYYY-MM-DD')
    },
    todayMilk() {
      const v = this.feedChartData && this.feedChartData.basic_info && this.feedChartData.basic_info.milkVolumes
      const n = Number(v)
      return Number.isFinite(n) ? n : 0
    },
    milkRefRangeText() {
      const t = this.feedChartData && this.feedChartData.basic_info && this.feedChartData.basic_info.refermilkVolumes
      return t || '-'
    },
    todayFeedCount() {
      return this.feedList.filter(x => Number.isFinite(Number(x.milk_volume))).length
    },
    lastFeedText() {
      const list = this.feedList.filter(x => Number.isFinite(Number(x.milk_volume)))
      if (list.length === 0) return '-'
      const last = list[0]
      const dt = moment(last.feed_time)
      if (!dt.isValid()) return '-'
      return dt.format('HH:mm')
    },
    todayTemperature() {
      const v = this.lineChartTotal && this.lineChartTotal.basicInfo && this.lineChartTotal.basicInfo.temperature
      return v || '未测'
    },
    isNumericTemperature() {
      return Number.isFinite(Number(this.todayTemperature))
    },
    temperatureHint() {
      const n = Number(this.todayTemperature)
      if (!Number.isFinite(n)) return '建议每日固定时间测量'
      if (n >= 37.5) return '偏高，建议复测并观察'
      if (n < 36.0) return '偏低，注意保暖并复测'
      return '正常范围'
    },
    todayDiapers() {
      return Number.isFinite(Number(this.diapersCount)) ? this.diapersCount : 0
    },
    leakRateText() {
      const raw = this.lineChartTotal && this.lineChartTotal.totalLineChartData && this.lineChartTotal.totalLineChartData.babyPants
      const list = raw && Array.isArray(raw.actualData) ? raw.actualData : []
      const nums = list.map(v => (String(v).toLowerCase() === 'true' ? 1 : 0)).filter(x => Number.isFinite(x))
      if (nums.length === 0) return '-'
      const rate = (nums.reduce((a, b) => a + b, 0) / nums.length) * 100
      return `${rate.toFixed(0)}%`
    },
    currentFeedChart() {
      if (!this.feedChartData) return {}
      const v = this.feedChartData[this.feedChartMode]
      return v || {}
    },
    trendChartData() {
      const total = this.lineChartTotal && this.lineChartTotal.totalLineChartData
      if (!total || !total[this.currentTrendType]) return {}
      const raw = total[this.currentTrendType]
      if (this.currentTrendType !== 'babyPants') return raw || {}
      const expected = (raw.expectedData || []).map(v => (String(v).toLowerCase() === 'true' ? 1 : 0))
      const actual = (raw.actualData || []).map(v => (String(v).toLowerCase() === 'true' ? 1 : 0))
      return { ...raw, expectedData: expected, actualData: actual }
    },
    vaccineDueList() {
      const data = this.vaccineSchedule
      if (!data || !data.groups) return []
      const today = moment(this.currentDateStr)
      const end = today.clone().add(7, 'days')
      const list = []
      data.groups.forEach(g => {
        const items = g.items || []
        items.forEach(it => {
          if (it.status !== 'pending') return
          const d = moment(it.recommend_date)
          if (!d.isValid()) return
          if (d.isSameOrAfter(today, 'day') && d.isSameOrBefore(end, 'day')) list.push(it)
        })
      })
      list.sort((a, b) => String(a.recommend_date).localeCompare(String(b.recommend_date)))
      return list
    },
    vaccineDueText() {
      const n = this.vaccineDueList.length
      return n ? `${n} 项` : '无'
    },
    growthLatestText() {
      if (!this.growthLatest) return '暂无'
      const d = this.growthLatest.measure_date || '-'
      const h = this.growthLatest.height_cm ? `${this.growthLatest.height_cm}cm` : ''
      const w = this.growthLatest.weight_kg ? `${this.growthLatest.weight_kg}kg` : ''
      const parts = [h, w].filter(Boolean)
      return parts.length ? `${d} ${parts.join(' ')}` : d
    },
    growthLatestDate() {
      return (this.growthLatest && this.growthLatest.measure_date) || '暂无'
    },
    growthHeightText() {
      const v = this.growthLatest && this.growthLatest.height_cm
      return v ? `${v} cm` : '-'
    },
    growthWeightText() {
      const v = this.growthLatest && this.growthLatest.weight_kg
      return v ? `${v} kg` : '-'
    },
    growthHeadText() {
      const v = this.growthLatest && this.growthLatest.head_circumference_cm
      return v ? `${v} cm` : '-'
    },
    insights() {
      const tips = []
      const range = this.parseRange(this.milkRefRangeText)
      const milk = this.todayMilk
      if (range && milk) {
        if (milk < range.min) tips.push('今日奶量偏低，建议适当增加喂养频次或复盘喂养间隔')
        if (milk > range.max) tips.push('今日奶量偏高，注意观察吐奶与精神状态')
      }
      const temp = Number(this.todayTemperature)
      if (Number.isFinite(temp) && temp >= 37.5) tips.push('体温偏高，建议复测并观察精神状态、食欲与尿量')
      if (this.todayDiapers && this.todayDiapers < 4) tips.push('尿不湿次数偏少，注意补水与尿量变化')
      const due = this.vaccineDueList.length
      if (due) tips.push(`近7天有 ${due} 项疫苗计划，建议提前预约`)
      const sleepHours = this.calcSleepHours()
      if (sleepHours !== null && sleepHours < 10) tips.push('今日有效睡眠偏少，建议关注入睡时段与环境干扰因素')
      return tips.slice(0, 6)
    },
    healthScore() {
      const range = this.parseRange(this.milkRefRangeText)
      const milk = this.todayMilk
      let milkScore = 0
      if (range && milk) {
        if (milk >= range.min && milk <= range.max) milkScore = 30
        else if (milk < range.min) milkScore = Math.max(0, Math.min(30, (milk / range.min) * 30))
        else milkScore = Math.max(0, Math.min(30, (range.max / milk) * 30))
      }

      const temp = Number(this.todayTemperature)
      let tempScore = 10
      if (Number.isFinite(temp)) {
        tempScore = temp >= 36.0 && temp <= 37.4 ? 30 : 15
      }

      const diapers = this.todayDiapers
      let diaperScore = 10
      if (diapers >= 4 && diapers <= 12) diaperScore = 20
      else if (diapers > 0) diaperScore = 15

      const sleepHours = this.calcSleepHours()
      let sleepScore = 0
      if (sleepHours !== null) sleepScore = Math.max(0, Math.min(20, (sleepHours / 12) * 20))

      const total = milkScore + tempScore + diaperScore + sleepScore
      return Math.round(Math.max(0, Math.min(100, total)))
    }
  },
  created() {
    this.loadAll()
  },
  methods: {
    onClickLeft() {
      this.$router.back()
    },
    setFeedChartMode(mode) {
      this.feedChartMode = mode
    },
    setTrendType(type) {
      this.currentTrendType = type
    },
    parseRange(text) {
      const s = String(text || '')
      const m = s.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/)
      if (!m) return null
      const min = Number(m[1])
      const max = Number(m[2])
      if (!Number.isFinite(min) || !Number.isFinite(max)) return null
      return { min, max }
    },
    calcSleepHours() {
      if (!Array.isArray(this.sleepList) || this.sleepList.length === 0) return null
      const totalSeconds = this.sleepList.reduce((sum, x) => {
        const dur = Number(x.duration)
        const status = String(x.status || '')
        if (!Number.isFinite(dur) || dur <= 0) return sum
        if (!status.includes('睡')) return sum
        return sum + dur
      }, 0)
      if (!totalSeconds) return 0
      return totalSeconds / 3600
    },
    async loadAll() {
      if (this.loading) return
      this.loading = true
      Toast.loading({ forbidClick: true, duration: 0, message: '加载中...' })
      const dateStr = this.currentDateStr
      const start_time = `${dateStr} 00:00:00`
      const end_time = `${dateStr} 23:59:59`

      try {
        const [feedChartRes, feedListRes, diapersRes, lineRes, sleepRes, growthRes, vaccineRes] = await Promise.all([
          feedChartReq(),
          feedListReq({ start_time, end_time }),
          babyPantsListReq({ use_date: dateStr, page_size: 100, page_num: 1 }),
          lineChartReq(),
          showSleepListReq({ date: dateStr, page_size: 200, page_num: 1 }),
          getGrowthRecordsReq({ page_size: 1, page_num: 1 }),
          getVaccineScheduleReq()
        ])

        if (feedChartRes && feedChartRes.code === 200) this.feedChartData = feedChartRes.data
        if (feedListRes && feedListRes.code === 200) this.feedList = Array.isArray(feedListRes.data) ? feedListRes.data : []
        if (diapersRes && diapersRes.code === 200 && diapersRes.data) this.diapersCount = diapersRes.data.count || 0
        if (lineRes && lineRes.code === 200 && lineRes.data) this.lineChartTotal = lineRes.data
        if (sleepRes && sleepRes.code === 200 && sleepRes.data && sleepRes.data.results) this.sleepList = sleepRes.data.results
        if (growthRes && growthRes.code === 200 && growthRes.data && Array.isArray(growthRes.data.list)) this.growthLatest = growthRes.data.list[0] || null
        if (vaccineRes && vaccineRes.code === 200 && vaccineRes.data) this.vaccineSchedule = vaccineRes.data
      } catch (e) {
        Toast.fail('加载失败')
      } finally {
        Toast.clear()
        this.loading = false
      }
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
.dashboard,
.trend,
.profile {
  padding: 12px;
}

.hero-card {
  background: #fff;
  border-radius: 12px;
  padding: 14px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  margin-bottom: 12px;
}

.hero-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.hero-title {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
}

.hero-date {
  font-size: 12px;
  color: #969799;
}

.hero-score {
  display: flex;
  align-items: baseline;
  justify-content: center;
  margin: 6px 0 10px;
}

.score {
  font-size: 34px;
  font-weight: 700;
  color: #ff976a;
  line-height: 1;
}

.score-label {
  font-size: 12px;
  color: #969799;
  margin-left: 8px;
}

.metric-grid {
  margin-bottom: 12px;
}

.metric {
  width: 100%;
  text-align: left;
}

.metric-label {
  font-size: 12px;
  color: #969799;
  margin-bottom: 4px;
}

.metric-value {
  font-size: 20px;
  font-weight: 700;
  color: #323233;
}

.metric-unit {
  font-size: 12px;
  font-weight: 400;
  margin-left: 4px;
  color: #969799;
}

.metric-sub {
  margin-top: 4px;
  font-size: 12px;
  color: #969799;
}

.section {
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 10px;
}

.seg {
  margin-bottom: 10px;
}

.seg ::v-deep .van-grid-item__content {
  padding: 10px 0;
  border-radius: 10px;
  background: #f7f8fa;
}

.seg .active ::v-deep .van-grid-item__content {
  background: rgba(255, 151, 106, 0.14);
  border: 1px solid rgba(255, 151, 106, 0.35);
}
</style>
