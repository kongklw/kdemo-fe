<template>
  <div class="dashboard-editor-container">
    <el-alert title="1.该项目会持续开发宝贝发育成长各个阶段所需要的功能.  2.技术趋势应用及Demo" type="success" show-icon>
    </el-alert>

    <panel-group :basic-info="basicInfo" @handleNavigate="handleNavigate" />
    <el-row :gutter="8">
      <el-col :xs="{ span: 24 }" :sm="{ span: 12 }" :md="{ span: 12 }" :lg="{ span: 6 }" :xl="{ span: 6 }"
        style="margin-bottom:30px;">
        <todo-list />
      </el-col>
    </el-row>

    <el-row :gutter="8" style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <feed-chart :chart-data="feedWeekChartData" />
    </el-row>

  </div>
</template>

<script>
import PanelGroup from './components/DashboardPanelGroup.vue'
import TodoList from './components/TodoList'
import { dashboardReq } from '@/api/baby'
import FeedChart from './components/FeedChart.vue'

export default {
  name: 'BabyDashboard',
  components: {
    // GithubCorner,
    PanelGroup,
    TodoList,
    FeedChart,
  },

  data() {
    return {
    
      feedDayChartData: {
        xAxisData: [],
        lowData: [],
        highData: [],
        actualData: [],
        titleText:"",
        yMin:0,
      },

      feedWeekChartData: {
        xAxisData: [],
        lowData: [],
        highData: [],
        actualData: [],
        titleText:"",
        yMin:0,
      },

      basicInfo: { total_milk_volumes: 0, total_amount: 0, current_temperature: '', babyPantsCount: 0 ,todo_count:4},
      intervalId: null
    }
  },
  mounted() {
   
    this.obtainDashboardData()
    // this.dataRefresh()
  },

  created() {

  },

  destroyed() {
    this.clear()
  },

  methods: {
    dataRefresh() {
      if (this.intervalId != null) {
        return
      }

      this.intervalId = setInterval(() => {
      
        this.obtainDashboardData()
      }, 10000)
    },
    clear() {
      // clearInterval(this.intervalId)
      // this.intervalId = null
    },

    handleNavigate(type) {
    
      switch (type) {
        case "BreastFeed":
          this.$router.push('/baby/breastfeed')
          // this.$router.push(redirect)
          break
        case "Temperature":
          this.$router.push("/baby/temperature")
          break
        case "BabyPants":
          this.$router.push("/baby/babypants")
          break
        case "Expense":
          this.$router.push("/baby/expense")
          break
        case "Sleep":
          this.$router.push("/baby/sleep")
          break
        case "Langchain":
          this.$router.push("/ai/langchain")
          break
        case "Analysis":
          this.$router.push("/baby/analysis")
          break
        case "Todo":
          this.$router.push("/baby/todo")
          break

        case "Growing":
          this.$router.push("/baby/growing")
          break

      }

    },


    obtainDashboardData() {
      dashboardReq().then((res) => {
        if (res.code === 200) {
          const data = res.data
          this.feedDayChartData = data.charData.current_day
          this.feedWeekChartData = data.charData.latest_week
          this.basicInfo = data.basicInfo
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
  padding: 5px;
  background-color: rgb(240, 242, 245);
  position: relative;

  .github-corner {
    position: absolute;
    top: 0px;
    border: 0;
    right: 0;
  }

  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}

@media (max-width: 1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
