<template>
  <div class="mobile-home">
    <!-- Baby Info Banner -->
    <div v-if="babyInfo.name" class="baby-info-card" @click="$router.push('/mobile/me')">
      <div class="baby-card-content">
        <div class="baby-info-left">
          <div class="baby-title-row">
            <span class="baby-title-text">{{ babyInfo.name || '宝宝' }} {{ babyAge }}</span>
            <van-icon name="arrow" color="#888" size="14" />
          </div>
          <div class="baby-growth-tip">
            <span class="tip-label">宝宝变化:</span>
            <span class="tip-content">有的宝宝在1岁后会越来越黏人，即使短暂的分离也会让他哭得撕心裂肺。你的...</span>
            <van-icon name="arrow" color="#ff9a9e" size="12" />
          </div>
          <div class="baby-stats-row">
            75.2-86.2cm | 8.2-13.0kg
          </div>
        </div>
        <div class="baby-info-right">
          <div class="baby-avatar-large">
            <img :src="babyInfo.image_full || babyInfo.image || 'https://img.yzcdn.cn/vant/cat.jpeg'">
          </div>
        </div>
      </div>
    </div>
    <div v-else class="baby-info-card" @click="$router.push('/mobile/me')">
      <div class="baby-header" style="justify-content: center;">
        <span class="baby-name">点击添加宝宝信息</span>
        <van-icon name="add-o" />
      </div>
    </div>

    <!-- App Grid -->
    <div class="grid-section">
      <draggable
        v-model="draggableItems"
        class="custom-grid"
        :delay="300"
        :delay-on-touch-only="true"
        @end="onDragEnd"
      >
        <div
          v-for="item in draggableItems"
          :key="item.type"
          class="custom-grid-item-wrapper"
          @click="handleNavigate(item.type)"
        >
          <div class="custom-grid-item">
            <div class="icon-wrapper" :class="item.iconClass">
              <svg-icon :icon-class="item.icon" class-name="grid-icon" />
            </div>
            <span class="grid-text">{{ item.label }}</span>
            <span v-if="item.value" class="grid-value">{{ item.value }}</span>
          </div>
        </div>
      </draggable>
    </div>

    <!-- Optional: Charts or Todo List below -->
    <div class="dashboard-widgets">
      <van-cell-group title="生日提醒" inset class="birthday-group">
        <template v-if="birthdayReminders.length === 0">
          <van-cell
            title="15天内暂无生日"
            is-link
            to="/mobile/functions/birthday"
          />
        </template>
        <template v-else>
          <van-cell
            v-for="item in birthdayReminders"
            :key="'b-' + item.id"
            class="birthday-reminder-cell"
            is-link
            to="/mobile/functions/birthday"
          >
            <template #title>
              <div class="birthday-reminder-title">
                <div class="birthday-reminder-left">
                  <span class="birthday-dot" :class="item.calendar_type === 'lunar' ? 'is-lunar' : 'is-solar'" />
                  <span class="birthday-reminder-name">{{ item.name }}</span>
                  <span v-if="item.relation" class="birthday-reminder-relation">{{ item.relation }}</span>
                </div>
                <span class="birthday-reminder-pill">还有{{ item.next_birthday_in_days }}天</span>
              </div>
            </template>
            <template #label>
              <div class="birthday-reminder-sub">
                <span class="birthday-reminder-next">下次 {{ item.next_birthday_date || '-' }}</span>
                <span class="birthday-reminder-sep">·</span>
                <span class="birthday-reminder-cal">{{ formatReminderCalendar(item) }}</span>
              </div>
            </template>
          </van-cell>
        </template>
      </van-cell-group>

      <!-- Todo List Preview -->
      <van-cell-group title="待办事项" inset>
        <van-cell title="查看更多待办" is-link to="/mobile/functions/todo" />
      </van-cell-group>
    </div>
  </div>
</template>

<script>
import { dashboardReq, getBabyInfoReq, getBirthdayListReq, saveAppOrderReq } from '@/api/baby'
import draggable from 'vuedraggable'

const DEFAULT_APP_ORDER = [
  'BreastFeed', 'Temperature', 'BabyPants', 'Sleep', 'Expense', 'Period',
  'Birthday', 'Analysis', 'Langchain', 'Todo', 'Growing', 'BodyMetrics', 'Album', 'VaccineSchedule'
]

export default {
  name: 'MobileHome',
  components: {
    draggable
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.refresh()
    })
  },
  data() {
    return {
      babyInfo: {},
      basicInfo: {
        total_milk_volumes: 0,
        total_amount: 0,
        current_temperature: '',
        babyPantsCount: 0,
        todo_count: 0,
        growing_moments: 0,
        app_order: []
      },
      draggableItems: [],
      birthdayReminders: []
    }
  },
  computed: {
    babyAge() {
      if (!this.babyInfo || !this.babyInfo.birthday) return ''

      // Parse YYYY-MM-DD manually
      const parts = this.babyInfo.birthday.split('-')
      const birthYear = parseInt(parts[0], 10)
      const birthMonth = parseInt(parts[1], 10) - 1 // 0-indexed
      const birthDay = parseInt(parts[2], 10)

      const birth = new Date(birthYear, birthMonth, birthDay)
      const now = new Date()

      // Reset time part
      now.setHours(0, 0, 0, 0)
      birth.setHours(0, 0, 0, 0)

      if (now < birth) return '待产中'

      // 1. Calculate Years
      let years = 0
      // Baseline date after adding years
      let tempDate = new Date(birthYear, birthMonth, birthDay)

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const nextYear = birthYear + years + 1
        // Handle Feb 29 -> Feb 28 in common years
        const isLeap = (y) => (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0)
        const nextMaxDay = (birthMonth === 1 && birthDay === 29 && !isLeap(nextYear)) ? 28 : birthDay

        const nextDate = new Date(nextYear, birthMonth, nextMaxDay)

        if (nextDate > now) break
        years++
        tempDate = nextDate
      }

      // 2. Calculate Months
      let months = 0
      // Calculate based on (Birth Year + Years) to avoid drift
      // e.g. Jan 31 -> Feb 28 -> March 31 (Good), not Feb 28 -> March 28 (Bad)
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const totalMonths = months + 1

        let targetYear = birthYear + years
        let targetMonth = birthMonth + totalMonths

        // Normalize month/year overflow
        targetYear += Math.floor(targetMonth / 12)
        targetMonth = targetMonth % 12

        // Clamp day
        const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate()
        const targetDay = Math.min(birthDay, daysInMonth)

        const nextDate = new Date(targetYear, targetMonth, targetDay)

        if (nextDate > now) break
        months++
        tempDate = nextDate
      }

      // 3. Calculate Days
      // tempDate is now the date at (Birth + Years + Months)
      const diffTime = now - tempDate
      const days = Math.floor(diffTime / (1000 * 60 * 60 * 24))

      let ageStr = ''
      if (years > 0) ageStr += `${years}岁`
      if (months > 0) ageStr += `${months}个月`
      if (days > 0) ageStr += `${days}天`

      if (!ageStr) return '今天出生'

      return ageStr
    }
  },
  watch: {
    basicInfo: {
      handler() {
        this.updateDraggableItems()
      },
      deep: true
    }
  },
  mounted() {
    this.updateDraggableItems()
    this.refresh()
  },
  activated() {
    this.refresh()
  },
  methods: {
    refresh() {
      this.obtainDashboardData()
      this.fetchBabyInfo()
      this.fetchBirthdayReminders()
    },
    async fetchBirthdayReminders() {
      try {
        const res = await getBirthdayListReq()
        if (res && res.code === 200) {
          const items = Array.isArray(res.data) ? res.data : []
          this.birthdayReminders = items
            .filter(x => typeof x.next_birthday_in_days === 'number' && x.next_birthday_in_days >= 0 && x.next_birthday_in_days <= 15)
            .sort((a, b) => (a.next_birthday_in_days || 0) - (b.next_birthday_in_days || 0))
            .slice(0, 5)
        } else {
          this.birthdayReminders = []
        }
      } catch (e) {
        this.birthdayReminders = []
      }
    },
    formatBirthdayLabel(item) {
      const nextText = item.next_birthday_date ? `下次 ${item.next_birthday_date}` : '下次 -'
      if (item.calendar_type === 'lunar') {
        const y = item.lunar_year ? `${item.lunar_year}年` : ''
        const leapText = item.lunar_is_leap ? '闰' : ''
        return `${nextText} · 农历 ${y}${leapText}${item.lunar_month}月${item.lunar_day}日`
      }
      return `${nextText} · 阳历 ${item.solar_date}`
    },
    formatReminderCalendar(item) {
      if (item.calendar_type === 'lunar') {
        const y = item.lunar_year ? `${item.lunar_year}年` : ''
        const leapText = item.lunar_is_leap ? '闰' : ''
        return `农历 ${y}${leapText}${item.lunar_month}月${item.lunar_day}日`
      }
      return `阳历 ${item.solar_date || '-'}`
    },
    getAppItem(type) {
      const info = this.basicInfo || {}
      switch (type) {
        case 'BreastFeed':
          return { type, label: '奶量', icon: 'babygirl', value: `${info.total_milk_volumes || 0} ml`, iconClass: 'icon-people' }
        case 'Temperature':
          return { type, label: '体温', icon: 'bodyTemperature', value: info.current_temperature, iconClass: 'icon-message' }
        case 'BabyPants':
          return { type, label: '尿不湿', icon: 'babyPants', value: `${info.babyPantsCount || 0} 个`, iconClass: 'icon-message' }
        case 'Sleep':
          return { type, label: '睡眠', icon: 'sleep2', value: '记录', iconClass: 'icon-message' }
        case 'Expense':
          return { type, label: '花费', icon: 'money', value: info.total_amount, iconClass: 'icon-money' }
        case 'Analysis':
          return { type, label: '分析', icon: 'data-analysis', value: '', iconClass: 'icon-money' }
        case 'Langchain':
          return { type, label: 'Langchain', icon: 'langchain', value: 'Chatbot', iconClass: 'icon-money' }
        case 'Todo':
          return { type, label: '待办', icon: 'todo', value: info.todo_count, iconClass: 'icon-money' }
        case 'Growing':
          return { type, label: '成长', icon: 'tree3', value: info.growing_moments, iconClass: 'icon-money' }
        case 'BodyMetrics':
          return { type, label: '身高体重', icon: 'size', value: '曲线', iconClass: 'icon-money' }
        case 'Album':
          return { type, label: '相册', icon: 'funny2', value: '照片', iconClass: 'icon-money' }
        case 'VaccineSchedule':
          return { type, label: '疫苗时间表', icon: 'tab', value: '', iconClass: 'icon-money' }
        case 'Period':
          return { type, label: '经期记录', icon: 'tab', value: '记录', iconClass: 'icon-money' }
        case 'Birthday':
          return { type, label: '生日', icon: 'birthday', value: '', iconClass: 'icon-money' }
        default:
          return null
      }
    },
    updateDraggableItems() {
      let order = [...(this.basicInfo.app_order || [])]
      if (order.length === 0) {
        order = [...DEFAULT_APP_ORDER]
      }

      // Ensure all default apps are present
      const currentSet = new Set(order)
      DEFAULT_APP_ORDER.forEach(app => {
        if (!currentSet.has(app)) {
          order.push(app)
        }
      })

      // Filter out invalid ones if any
      const items = order.map(type => this.getAppItem(type)).filter(item => item !== null)
      this.draggableItems = items
    },
    onDragEnd() {
      const newOrder = this.draggableItems.map(item => item.type)
      this.basicInfo.app_order = newOrder // Optimistic update
      saveAppOrderReq({ app_order: newOrder }).then(res => {
        if (res.code === 200) {
          // Success
        } else {
          this.$toast.fail('保存排序失败')
        }
      }).catch(() => {
        this.$toast.fail('保存排序失败')
      })
    },
    async fetchBabyInfo() {
      try {
        const res = await getBabyInfoReq()
        if (res.data) {
          // Handle array response if backend returns a list
          this.babyInfo = Array.isArray(res.data) ? (res.data[0] || {}) : res.data
        } else {
          this.babyInfo = {}
        }
      } catch (e) {
        console.error(e)
      }
    },
    formatGender(val) {
      if (val === 'M') return '小王子'
      if (val === 'F') return '小公主'
      return ''
    },
    obtainDashboardData() {
      dashboardReq().then((res) => {
        if (res.code === 200) {
          const data = res.data
          this.basicInfo = data.basicInfo || {}
        }
      })
    },
    handleNavigate(type) {
      switch (type) {
        case 'BreastFeed':
          this.$router.push('/mobile/functions/breastfeed')
          break
        case 'Temperature':
          this.$router.push('/mobile/functions/temperature')
          break
        case 'BabyPants':
          this.$router.push('/mobile/functions/babypants')
          break
        case 'Expense':
          this.$router.push('/mobile/functions/expense')
          break
        case 'Sleep':
          this.$router.push('/mobile/functions/sleep')
          break
        case 'Todo':
          this.$router.push('/mobile/functions/todo')
          break
        case 'Growing':
          this.$router.push('/mobile/functions/growing')
          break
        case 'Analysis':
          this.$router.push('/mobile/functions/analysis')
          break
        case 'Langchain':
          this.$router.push('/mobile/functions/langchain')
          break
        case 'Album':
          this.$router.push('/mobile/functions/album')
          break
        case 'BodyMetrics':
          this.$router.push('/mobile/functions/bodymetrics')
          break
        case 'VaccineSchedule':
          this.$router.push('/mobile/functions/vaccine')
          break
        case 'Period':
          this.$router.push('/mobile/functions/period')
          break
        case 'Birthday':
          this.$router.push('/mobile/functions/birthday')
          break
        default:
          break
      }
    }
  }
}
</script>

<style scoped>
.mobile-home {
  padding-top: 0;
  background-color: #f7f8fa;
  min-height: 100vh;
  --page-gutter: 3px;
}
.baby-info-card {
    background: linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%);
    margin: 12px var(--page-gutter);
    padding: 20px;
    border-radius: 16px;
    color: white;
    box-shadow: 0 4px 12px rgba(255, 154, 158, 0.3);
}
.baby-card-content {
    display: flex;
    align-items: center;
}
.baby-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 15px;
    border: 2px solid rgba(255, 255, 255, 0.8);
    flex-shrink: 0;
}
.baby-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.baby-info-text {
    flex: 1;
}
.baby-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}
.baby-name {
    font-size: 20px;
    font-weight: bold;
}
.baby-status {
    font-size: 14px;
    background: rgba(255,255,255,0.2);
    padding: 2px 8px;
    border-radius: 10px;
}
.baby-age {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 8px;
}
.baby-details {
    font-size: 14px;
    opacity: 0.9;
    display: flex;
    gap: 10px;
}

/* Added styles for the new layout structure */
.baby-info-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-right: 12px;
  overflow: hidden; /* Prevent text overflow from pushing width */
}

.baby-info-right {
  flex-shrink: 0;
}

.baby-avatar-large {
  width: 90px;
  height: 110px; /* Slightly rectangular portrait aspect ratio */
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  background-color: #fff; /* Fallback */
}

.baby-avatar-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.baby-title-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.baby-title-text {
  font-size: 20px;
  font-weight: bold;
  margin-right: 6px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.baby-growth-tip {
  font-size: 12px;
  background: rgba(255,255,255,0.25);
  padding: 8px 10px;
  border-radius: 8px;
  margin-bottom: 8px;
  display: flex;
  align-items: flex-start;
  line-height: 1.4;
  backdrop-filter: blur(5px);
}

.tip-label {
  font-weight: bold;
  margin-right: 4px;
  white-space: nowrap;
}

.tip-content {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* Limit to 2 lines */
  -webkit-box-orient: vertical;
}

.baby-stats-row {
  font-size: 13px;
  opacity: 0.95;
  font-weight: 500;
}

/* Grid Section Styles */
.grid-section {
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  margin: 0 var(--page-gutter) 12px;
  padding: 0 6px;
}
.grid-item-wrapper {
  /* No special styles needed here if using van-grid-item default,
     but we can adjust if needed */
}
.custom-grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6px 0;
  width: 100%;
}
.icon-wrapper {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2px;
}
.grid-icon {
  font-size: 24px;
}
.grid-text {
  font-size: 12px;
  color: #333;
  margin-top: 4px;
}

/* Dashboard Widgets */
.dashboard-widgets {
  margin-top: 0;
}

.custom-grid {
  display: flex;
  flex-wrap: wrap;
}

.custom-grid-item-wrapper {
  width: 20%;
  box-sizing: border-box;
}

.grid-value {
  font-size: 10px;
  color: #999;
  margin-top: 2px;
}

.birthday-reminder-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.birthday-reminder-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.birthday-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 77, 125, 0.9);
  box-shadow: 0 6px 14px rgba(255, 77, 125, 0.22);
  flex-shrink: 0;
}
.birthday-dot.is-solar {
  background: rgba(42, 123, 255, 0.9);
  box-shadow: 0 6px 14px rgba(42, 123, 255, 0.22);
}
.birthday-reminder-name {
  font-weight: 700;
  color: #1f2329;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.birthday-reminder-relation {
  font-size: 12px;
  color: #646a73;
  background: #f7f8fa;
  border-radius: 999px;
  padding: 2px 8px;
  flex-shrink: 0;
}
.birthday-reminder-pill {
  flex-shrink: 0;
  font-size: 12px;
  color: #ffffff;
  background: linear-gradient(135deg, rgba(255, 77, 125, 0.95), rgba(255, 154, 77, 0.9));
  padding: 3px 10px;
  border-radius: 999px;
}
.birthday-group ::v-deep .birthday-reminder-cell .van-cell__title {
  flex: 1;
  min-width: 0;
}
.birthday-reminder-sub {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.birthday-reminder-next {
  color: #8b949e;
  flex-shrink: 0;
}
.birthday-reminder-sep {
  color: #c9cdd4;
  flex-shrink: 0;
}
.birthday-reminder-cal {
  color: #646a73;
  overflow: hidden;
  text-overflow: ellipsis;
}
.birthday-group ::v-deep .van-cell-group__title {
  padding-left: var(--page-gutter);
  padding-right: var(--page-gutter);
  font-weight: 700;
  color: #1f2329;
}

.dashboard-widgets ::v-deep .van-cell-group--inset {
  margin-left: var(--page-gutter);
  margin-right: var(--page-gutter);
}
</style>
