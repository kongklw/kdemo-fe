<template>
  <div class="mobile-home">
    <!-- App Grid -->
    <van-grid :column-num="4" :gutter="10" clickable :border="false">
      <van-grid-item
        v-for="item in menuItems"
        :key="item.type"
        class="grid-item-wrapper"
        @click="handleNavigate(item.type)"
      >
        <div class="custom-grid-item">
          <div class="icon-wrapper" :class="item.iconClass">
            <svg-icon :icon-class="item.icon" class-name="grid-icon" />
          </div>
          <span class="grid-text">{{ item.label }}</span>
          <span v-if="item.value" class="grid-value">{{ item.value }}</span>
        </div>
      </van-grid-item>
    </van-grid>

    <!-- Optional: Charts or Todo List below -->
    <div class="dashboard-widgets">
      <!-- Todo List Preview -->
      <van-cell-group title="待办事项" inset>
        <van-cell title="查看更多待办" is-link to="/mobile/todo" />
      </van-cell-group>
    </div>
  </div>
</template>

<script>
import { dashboardReq } from '@/api/baby'

export default {
  name: 'MobileHome',
  data() {
    return {
      basicInfo: {
        total_milk_volumes: 0,
        total_amount: 0,
        current_temperature: '',
        babyPantsCount: 0,
        todo_count: 0,
        growing_moments: 0
      }
    }
  },
  computed: {
    menuItems() {
      return [
        { type: 'BreastFeed', label: '奶量', icon: 'babygirl', value: `${this.basicInfo.total_milk_volumes || 0} ml`, iconClass: 'icon-people' },
        { type: 'Temperature', label: '体温', icon: 'bodyTemperature', value: this.basicInfo.current_temperature, iconClass: 'icon-message' },
        { type: 'BabyPants', label: '尿不湿', icon: 'babyPants', value: `${this.basicInfo.babyPantsCount || 0} 个`, iconClass: 'icon-message' },
        { type: 'Sleep', label: '睡眠', icon: 'sleep2', value: '记录', iconClass: 'icon-message' },
        { type: 'Expense', label: '花费', icon: 'money', value: this.basicInfo.total_amount, iconClass: 'icon-money' },
        { type: 'Analysis', label: '分析', icon: 'data-analysis', value: '', iconClass: 'icon-money' },
        { type: 'Langchain', label: 'Langchain', icon: 'langchain', value: 'Chatbot', iconClass: 'icon-money' },
        { type: 'Todo', label: '待办', icon: 'todo', value: this.basicInfo.todo_count, iconClass: 'icon-money' },
        { type: 'Growing', label: '成长', icon: 'tree3', value: this.basicInfo.growing_moments, iconClass: 'icon-money' }
      ]
    }
  },
  mounted() {
    this.obtainDashboardData()
  },
  methods: {
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
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.mobile-home {
  padding-bottom: 20px;
}

.custom-grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px 0;

  .icon-wrapper {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 8px;

    &.icon-people { background-color: #40c9c6; }
    &.icon-message { background-color: #36a3f7; }
    &.icon-money { background-color: #f4516c; }

    .grid-icon {
      font-size: 24px;
      color: #fff;
    }
  }

  .grid-text {
    font-size: 12px;
    color: #333;
    margin-bottom: 4px;
  }

  .grid-value {
    font-size: 10px;
    color: #999;
  }
}

.dashboard-widgets {
  margin-top: 20px;
}
</style>
