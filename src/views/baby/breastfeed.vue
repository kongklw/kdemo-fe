<template>
  <div class="dashboard-editor-container">
    <div class="data-area">
      <el-form :model="feedForm" :inline="true">
        <el-form-item label="时间" required>
          <el-date-picker v-model="feedForm.feed_time" type="datetime" placeholder="选择日期时间" align="left"
             value-format="yyyy-MM-dd HH:mm:00" />
        </el-form-item>
        <el-form-item label="奶量">

          <el-input-number v-model="feedForm.milk_volume" :step="10"  :min="10" :max="300"
            label="吃奶量"></el-input-number>

        </el-form-item>

        <el-button type="primary" @click="addFeedEvent">添加</el-button>
      </el-form>

    </div>

    <div class="pannel">
      <el-row :gutter="10" class="panel-group">
        <el-col :xs="24" :sm="12" :lg="12" class="card-panel-col">
          <div class="card-panel">
            <div class="card-panel-icon-wrapper icon-people">
              <svg-icon icon-class="babygirl" class-name="card-panel-icon" />
            </div>

            <!-- <div class="card-panel-description">
              <div class="card-panel-text">
                参考量
              </div>
              <label class="card-panel-num">{{ basicInfo.refermilkVolumes }} ml</label>
            </div> -->

            <div class="card-panel-description">
              <div class="card-panel-text">
                奶量
              </div>
              <label class="card-panel-num">{{ basicInfo.milkVolumes }} ml</label>

            </div>

          </div>
        </el-col>

      </el-row>
    </div>



    <!-- <panel-group :basic-info="basicInfo" @handleSetLineChartData="handleSetLineChartData" /> -->

    <el-row :gutter="8" style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <line-chart :chart-data="currentLineChartData" />
    </el-row>

    <el-table v-loading="loading" :data="feedList" style="width: 100%;padding-top: 15px;">
      <el-table-column label="时间" min-width="90">
        <template slot-scope="scope">
          {{ scope.row.feed_time }}
        </template>
      </el-table-column>
      <el-table-column label="奶量" min-width="50">
        <template slot-scope="scope">
          {{ scope.row.milk_volume }}
        </template>
      </el-table-column>
      <el-table-column label="时间间隔" min-width="90">
        <template slot-scope="scope">
          {{ scope.row.time_different }}
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="80">

        <template slot-scope="scope">
          <el-button type="danger" size="mini" @click="open(scope.row)">删除</el-button>
        </template>
      </el-table-column>

    </el-table>


  </div>
</template>

<script>
import PanelGroup from './components/FeedPanelGroup.vue'
import LineChart from './components/LineChart'
import EventTab from './components/EventTab.vue'
import TodoList from './components/TodoList'
import {
  feedListReq, addFeedReq, deleteFeedReq,
  lineChartReq,
} from '@/api/baby'


export default {
  name: 'BabyBreastfeed',
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
      loading:false,
      feedList: [],
      feed_query: { 'start_time': '', 'end_time': '' },

      feedForm: {
        milk_volume: 150,
        feed_time: this.moment().format('YYYY-MM-DD HH:mm:00')
      },


      // 因为只显示一个Linechart 所以data 里面的代表正在展示的。lineChartData
      currentLineChartData: {
        xAxisData: [],
        expectedData: [],
        actualData: []
      },
      totalLineChartData: {},
      basicInfo: { milkVolumes: 200, refermilkVolumes: 1000, temperature: NaN },
      intervalId: null
    }
  },
  mounted() {
    // const date = this.$route.query.date
    // console.log('跳转过来传的值日期为 ', date)
    // this.obtainLineChartData()
    // this.dataRefresh()
    this.fetchData()
  },

  created() {

  },

  destroyed() {
    this.clear()
  },

  methods: {
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
    },


    fetchData() {
      // var now_time = new Date()
      var date_time = new Date().format('yyyy-MM-dd hh:mm:ss')

      var date = new Date().format('yyyy-MM-dd')
      var before_now_24 = new Date(new Date().getTime() - 24 * 60 * 60 * 1000).format('yyyy-MM-dd hh:mm:ss')

      this.date = date
      this.date_time = date_time
      this.feed_query.end_time = date_time
      this.feed_query.start_time = before_now_24

      feedListReq(this.feed_query).then(res => {
        if (res.code === 200) {
          this.feedList = res.data
        }
      })

      lineChartReq().then((res) => {
        console.log(res)
        if (res.code === 200) {
          const data = res.data
          this.totalLineChartData = data.totalLineChartData
          this.currentLineChartData = this.totalLineChartData.milkVolumes
          this.basicInfo = data.basicInfo
        }
      })

    },

    addFeedEvent() {
      const data = { ...this.feedForm }

      addFeedReq(data).then(res => {
        if (res.code === 200) {
          this.fetchData()

        }
      })
    },

    open(row) {
      this.$confirm(`你将删除时间为${row.feed_time} 奶量为 ${row.milk_volume}的喂奶记录, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {

        deleteFeedReq(row).then(res => {
          console.log('删除的',res)
          if (res.code === 200) {
            this.fetchData()
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
          } else {
            this.$message({
              type: 'info',
              message: '删除失败'
            });
          }
        })

      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },


    handleChange(value) {
      console.log(value);
    },
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
          console.log('data ----', data)
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
.panel-group {
  margin-top: 12px;

  .card-panel-col {
    margin-bottom: 12px;

  }

  .card-panel {
    height: 90px;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
    border-color: rgba(0, 0, 0, .05);

    &:hover {
      .card-panel-icon-wrapper {
        color: #fff;
      }

      .icon-people {
        background: #40c9c6;
      }

      .icon-message {
        background: #36a3f7;
      }

      .icon-money {
        background: #f4516c;
      }

      .icon-shopping {
        background: #34bfa3
      }
    }

    .icon-people {
      color: #40c9c6;
    }

    .icon-message {
      color: #36a3f7;
    }

    .icon-money {
      color: #f4516c;
    }

    .icon-shopping {
      color: #34bfa3
    }

    .card-panel-icon-wrapper {
      float: left;
      margin: 12px 0 0 12px;
      padding: 12px;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }

    .card-panel-icon {
      float: left;
      font-size: 50px;
    }

    .card-panel-description {
      width: 100px;
      float: left;
      font-weight: bold;
      margin: 12px;
      margin-left: 10px;

      .card-panel-text {
        line-height: 40px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 16px;
        margin-bottom: 10px;
      }

      .card-panel-num {
        font-size: 16px;
      }
    }
  }
}


@media (max-width:200px) {
  .card-panel-description {
    display: none;
  }

  .card-panel-icon-wrapper {
    float: none !important;
    width: 100px;
    height: 100px;
    margin: 0 !important;

    .svg-icon {
      display: block;
      margin: 14px auto !important;
      float: none !important;
    }
  }
}

.data-area {
  margin: 10px 0px 20px 0px;
  padding: 10px;
  /* 输入框内边距 */
  background-color: #fff;
  /* 背景色 */
  border: 1px solid #dcdcdc;
  /* 边框 */
  border-radius: 10px;
  /* 圆角 */
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
  /* 阴影效果，增加层次感 */
}

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
