<template>
  <div class="dashboard-editor-container">
    <panel-group
      :basic-info="basicInfo"
      @handleSetLineChartData="handleSetLineChartData"
    />

    <el-row style="background: #fff; padding: 16px 16px 0; margin-bottom: 32px">
      <line-chart :chart-data="lineChartData" />
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
import { lineChartReq } from '@/api/baby'

const lineChartData = {
  milkVolume: {
    xAxisData: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    expectedData: [150, 150, 150, 150, 150, 150, 150],
    actualData: [150, 180, 150, 150, 150, 120, 150]
  },
  bodyTemperature: {
    expectedData: [36.5, 36.5, 36.5, 36.5, 36.5, 36.5, 36.5],
    actualData: [36.5, 36.5, 36.5, 36.5, 36.5, 36.5, 36.5]
  },
  babyPants: {
    expectedData: [10, 10, 10, 10, 10, 10, 10],
    actualData: [1, 2, 3, 4, 5, 6, 7]
  },
  purchases: {
    expectedData: [130, 140, 141, 142, 145, 150, 160],
    actualData: [120, 82, 91, 154, 162, 140, 130]
  }
}

export default {
  name: 'BabyDashboard',
  components: {
    // GithubCorner,
    PanelGroup,
    LineChart,
    EventTab
    // RaddarChart,
    // PieChart,
    // BarChart,
    // TransactionTable,
    // TodoList,
    // BoxCard
  },

  data() {
    return {
      lineChartData: lineChartData.milkVolume,
      basicInfo: { total_volume: 0 },
      intervalId: null
    }
  },

  created() {
    const date = this.$route.query.date
    console.log('跳转过来传的值日期为 ', date)
    // this.obtainLineChartData()
    this.dataRefresh()
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
      this.lineChartData = lineChartData[type]
    },
    obtainLineChartData() {
      lineChartReq().then((res) => {
        console.log(res)
        if (res.code === 200) {
          const data = res.data
          this.lineChartData = data.lineChartData.milkVolume
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
