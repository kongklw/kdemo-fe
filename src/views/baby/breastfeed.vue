<template>
  <div class="dashboard-editor-container">
    <div class="data-area">

      <el-form :model="feedForm" :inline="true">
        <el-form-item label="时间" required>
          <div @click="showPicker = true">
            <el-input 
              :value="feedForm.feed_time" 
              readonly 
              placeholder="点击选择时间" 
              prefix-icon="el-icon-time"
            />
          </div>

          <van-popup v-model="showPicker" position="bottom" get-container="body">
            <van-datetime-picker
              v-model="currentDate"
              type="datetime"
              title="选择时间"
              :min-date="minDate"
              :max-date="maxDate"
              @confirm="onConfirm"
              @cancel="showPicker = false"
            />
          </van-popup>
        </el-form-item>

        <el-form-item label="快捷">
          <el-radio-group v-model="feedForm.milk_volume">
            <el-radio :label="30">30</el-radio>
            <el-radio :label="60">60</el-radio>
            <el-radio :label="90">90</el-radio>
            <el-radio :label="120">120</el-radio>
            <el-radio :label="150">150</el-radio>
            <el-radio :label="180">180</el-radio>
            <el-radio :label="210">210</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="奶量">
          <el-input-number v-model="feedForm.milk_volume" :step="10" :min="10" :max="300" label="吃奶量"></el-input-number>

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


            <div class="card-panel-description">
              <div class="card-panel-text">
                今日奶量
              </div>
              <label class="card-panel-num">{{ basicInfo.milkVolumes }} ml</label>
            </div>

            <div class="card-panel-description">
              <div class="card-panel-text">
                参考奶量
              </div>
              <label class="card-panel-num">{{ basicInfo.refermilkVolumes }} ml</label>
            </div>
          </div>
        </el-col>

      </el-row>
    </div>

    <el-row :gutter="8" style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <feed-chart :chart-data="feedDayChartData" />
    </el-row>

    <el-row :gutter="8" style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <feed-chart :chart-data="feedWeekChartData" />
    </el-row>



    <el-table v-loading="loading" :data="feedList" style="width: 100%;padding-top: 15px;">
      <el-table-column label="时间" min-width="90px">
        <template slot-scope="scope">
          {{ showTime(scope.row.feed_time) }}

        </template>
      </el-table-column>
      <el-table-column label="奶量" min-width="50px">
        <template slot-scope="scope">
          {{ scope.row.milk_volume }}
        </template>
      </el-table-column>
      <el-table-column label="间隔" min-width="50px">
        <template slot-scope="scope">
          {{ scope.row.time_different }}
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="50px">
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
import FeedChart from './components/FeedChart.vue'
import EventTab from './components/EventTab.vue'
import TodoList from './components/TodoList'



import {
  feedListReq, addFeedReq, deleteFeedReq, feedChartReq
} from '@/api/baby'


export default {
  name: 'BabyBreastfeed',
  components: {
    // GithubCorner,
    PanelGroup,
    LineChart,
    FeedChart,
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
      selectedData: '',
      loading: false,
      feedList: [],
      feed_query: { 'start_time': '', 'end_time': '' },

      feedForm: {
        milk_volume: 210,
        feed_time: this.moment().format('YYYY-MM-DD HH:mm:00')

      },

      showPicker: false,
      minDate: new Date(2020, 0, 1),
      maxDate: new Date(2030, 11, 31),
      currentDate: new Date(),

      feedDayChartData: {
        xAxisData: [],
        lowData: [],
        highData: [],
        actualData: [],
        titleText: "",
        yMin: 0,
      },

      feedWeekChartData: {
        xAxisData: [],
        lowData: [],
        highData: [],
        actualData: [],
        titleText: "",
        yMin: 0,
      },



      totalLineChartData: {},
      basicInfo: { milkVolumes: 0, refermilkVolumes: "800-1000", temperature: 36.5 },
      intervalId: null
    }
  },
  watch: {
    'feedForm.feed_time': {
      handler(val) {
        if (val) {
          this.currentDate = new Date(val.replace(/-/g, '/'))
        }
      },
      immediate: true
    }
  },

  mounted() {
    // this.dataRefresh()
    this.fetchData()
    this.showFeedChart()
  },

  created() {

  },

  destroyed() {
    this.clear()
  },

  methods: {

    onConfirm(value) {
      this.feedForm.feed_time = this.moment(value).format('YYYY-MM-DD HH:mm:ss')
      this.showPicker = false
    },

    showFeedChart() {
      feedChartReq().then(res => {
        if (res.code === 200) {
          const data = res.data
          this.feedDayChartData = data.current_day
          this.feedWeekChartData = data.latest_week
          this.basicInfo = data.basic_info

        }
      })
    },

    showTime(feed_time) {
      const aim_time = this.moment(feed_time).format("YYYY-MM-DD HH:mm")
      return aim_time
    },


    fetchData() {

      this.feed_query.end_time = this.moment().format('YYYY-MM-DD HH:mm:ss')
      this.feed_query.start_time = this.moment().subtract(1, 'days').format('YYYY-MM-DD HH:mm:ss')

      feedListReq(this.feed_query).then(res => {
        if (res.code === 200) {
          this.feedList = res.data
        }
      })

    },

    addFeedEvent() {
      const data = { ...this.feedForm }

      addFeedReq(data).then(res => {
        if (res.code === 200) {
          this.fetchData()
          this.showFeedChart()

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

          if (res.code === 200) {
            this.fetchData()
            this.showFeedChart()
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

    },
    dataRefresh() {
      if (this.intervalId != null) {
        return
      }

      this.intervalId = setInterval(() => {

        this.showFeedChart()

      }, 10000)
    },
    clear() {
      clearInterval(this.intervalId)
      this.intervalId = null
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
      padding: 5px;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }

    .card-panel-icon {
      float: left;
      font-size: 50px;
    }

    .card-panel-description {
      // width: 100px;
      float: left;
      font-weight: bold;
      margin: 12px;
      margin-left: 30px;

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

@media screen and (max-width: 768px) {
  .dashboard-editor-container {
    padding: 16px;
  }
  .pc-only { display: none !important; }
  .mobile-only { display: inline-block !important; }
}

@media screen and (min-width: 769px) {
  .pc-only { display: inline-block !important; }
  .mobile-only { display: none !important; }
}
</style>
