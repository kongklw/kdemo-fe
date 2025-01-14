<template>
  <div class="dashboard-editor-container">
    <panel-group :basic-info="basicInfo" @handleSetLineChartData="handleSetLineChartData" />

    <el-row :gutter="8" style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <line-chart :chart-data="currentLineChartData" />
    </el-row>

    <el-row :gutter="8">
      <el-col :xs="{ span: 24 }" :sm="{ span: 12 }" :md="{ span: 12 }" :lg="{ span: 6 }" :xl="{ span: 6 }"
        style="margin-bottom:30px;">
        <todo-list />
      </el-col>
    </el-row>

    <el-row style="background: #fff; padding: 16px 16px 0; margin-bottom: 32px">
      <event-tab />
    </el-row>
  </div>
</template>

<script>
import PanelGroup from './components/PanelGroup'
import LineChart from './components/LineChart'
import EventTab from './components/EventTab.vue'
import TodoList from './components/TodoList'
import { lineChartReq } from '@/api/baby'

export default {
  name: 'BabyDashboard',
  components: {
    // GithubCorner,
    PanelGroup,
    LineChart,
    TodoList,
    EventTab,
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
      basicInfo: { total_volume: 0, temperature: NaN },
      intervalId: null
    }
  },
  mounted() {
    const date = this.$route.query.date
    console.log('跳转过来传的值日期为 ', date)
    this.obtainLineChartData()
    this.dataRefresh()
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
        this.obtainLineChartData()
      }, 10000)
    },
    clear() {
      clearInterval(this.intervalId)
      this.intervalId = null
    },

    handleSetLineChartData(type) {
      // console.log('触发details 里面的handleSetLineChartData,type is ', type)
      // console.log('当前currentLineChartData', this.currentLineChartData)
      // console.log('this.totalLineChartData', this.totalLineChartData)
      // console.log('加入type 后的选择数据是', this.totalLineChartData[type])
      this.currentLineChartData = this.totalLineChartData[type]
    },
    obtainLineChartData() {
      lineChartReq().then((res) => {
        console.log(res)
        if (res.code === 200) {
          const data = res.data
          this.totalLineChartData = data.totalLineChartData
          this.currentLineChartData = this.totalLineChartData.milkVolumes
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
