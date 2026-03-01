<template>
  <div class="mobile-home">
    <!-- Baby Info Banner -->
    <div v-if="babyInfo.name" class="baby-info-card" @click="$router.push('/mobile/me')">
      <div class="baby-card-content">
        <div class="baby-info-left">
          <div class="baby-title-row">
            <span class="baby-title-text">宝宝 {{ babyAge }}</span>
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
            <img :src="babyInfo.image || 'https://img.yzcdn.cn/vant/cat.jpeg'">
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
      <!-- Todo List Preview -->
      <van-cell-group title="待办事项" inset>
        <van-cell title="查看更多待办" is-link to="/mobile/functions/todo" />
      </van-cell-group>
    </div>
  </div>
</template>

<script>
import { dashboardReq, getBabyInfoReq, saveAppOrderReq } from '@/api/baby'
import draggable from 'vuedraggable'

const DEFAULT_APP_ORDER = [
  'BreastFeed', 'Temperature', 'BabyPants', 'Sleep', 'Expense',
  'Analysis', 'Langchain', 'Todo', 'Growing', 'Album'
]

export default {
  name: 'MobileHome',
  components: {
    draggable
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
      draggableItems: []
    }
  },
  computed: {
    babyAge() {
      if (!this.babyInfo || !this.babyInfo.birthday) return ''
      const birth = new Date(this.babyInfo.birthday)
      const now = new Date()

      let years = now.getFullYear() - birth.getFullYear()
      let months = now.getMonth() - birth.getMonth()
      let days = now.getDate() - birth.getDate()

      if (days < 0) {
        months--
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0)
        days += prevMonth.getDate()
      }
      if (months < 0) {
        years--
        months += 12
      }

      let ageStr = ''
      if (years > 0) ageStr += `${years}岁`
      if (months > 0) ageStr += `${months}个月`
      if (days > 0) ageStr += `${days}天`
      return ageStr || '今天出生'
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
    this.obtainDashboardData()
    this.fetchBabyInfo()
  },
  methods: {
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
        case 'Album':
          return { type, label: '相册', icon: 'funny2', value: '照片', iconClass: 'icon-money' }
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
          this.babyInfo = res.data
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
        default:
          break
      }
    }
  }
}
</script>

<style scoped>
.mobile-home {
  padding-top: 20px;
  background-color: #f7f8fa;
  min-height: 100vh;
}
.baby-info-card {
    background: linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%);
    margin: 12px;
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
  margin-bottom: 12px;
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
  margin-top: 20px;
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
</style>
