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
      <line-chart :chart-data="currentLineChartData" />
    </el-row>



    <el-row style="background: #fff; padding: 16px 16px 0; margin-bottom: 32px">
      <event-tab />
    </el-row>
  </div>
</template>

<script>
import PanelGroup from './components/DashboardPanelGroup.vue'
import LineChart from './components/LineChart'
import EventTab from './components/EventTab.vue'
import TodoList from './components/TodoList'
import { dashboardReq } from '@/api/baby'

export default {
  name: 'BabyDashboard',
  components: {
    // GithubCorner,
    PanelGroup,
    LineChart,
    TodoList,
    // EventTab, 
    // RaddarChart,
    // PieChart,
    // BarChart,
    // TransactionTable,

    // BoxCard
  },

  data() {
    return {
      // 因为只显示一个Linechart 所以data 里面的代表正在展示的。lineChartData
      currentLineChartData: {
        xAxisData: [],
        expectedData: [],
        actualData: []
      },
      totalLineChartData: {},
      basicInfo: { total_milk_volumes: 0, total_amount: 0, current_temperature: '', babyPantsCount: 0 },
      intervalId: null
    }
  },
  mounted() {
    // const date = this.$route.query.date
    // console.log('跳转过来传的值日期为 ', date)
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
        console.log('refresh')
        this.obtainDashboardData()
      }, 10000)
    },
    clear() {
      clearInterval(this.intervalId)
      this.intervalId = null
    },

    handleNavigate(type) {
      console.log('触发details 里面的handleNavigate,type is ', type)
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

      }


      // console.log('当前currentLineChartData', this.currentLineChartData)
      // console.log('this.totalLineChartData', this.totalLineChartData)
      // console.log('加入type 后的选择数据是', this.totalLineChartData[type])
      // this.currentLineChartData = this.totalLineChartData[type]
    },
    obtainDashboardData() {
      dashboardReq().then((res) => {
        console.log(res)
        if (res.code === 200) {
          const data = res.data
          console.log('dash board data', data)
          // this.totalLineChartData = data.totalLineChartData
          this.currentLineChartData = data.milk_chart
          this.basicInfo = data.basicInfo
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
  padding: 32px;
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
