<template>
  <div>
    <el-tabs type="border-card">
      <el-tab-pane>
        <span slot="label"><svg-icon icon-class="milkBottle2" class-name="card-panel-icon" /> 奶量</span>
        <el-row>
          <el-button type="primary" @click="milk_dialogFormVisible = true">添加记录</el-button>
        </el-row>
        <el-dialog title="奶量" :visible.sync="milk_dialogFormVisible" width="100%" destroy-on-close>
          <el-form :model="feedForm" :label-width="formLabelWidth">
            <el-form-item label="喂奶时间" required>
              <el-date-picker
                v-model="feedForm.feed_time"
                type="datetime"
                placeholder="选择日期时间"
                align="left"
                :picker-options="pickerOptions"
                value-format="yyyy-MM-dd HH:mm:00"

                size="mini"

                editable="false"
              />
            </el-form-item>
            <el-form-item label="奶量" :label-width="formLabelWidth">
              <el-input v-model="feedForm.milk_volume" autocomplete="off" />
            </el-form-item>
          </el-form>

          <div slot="footer" class="dialog-footer">
            <el-button @click="milk_dialogFormVisible = false">取 消</el-button>
            <el-button type="primary" @click="addFeedEvent">确 定</el-button>
          </div>
        </el-dialog>

        <el-table v-loading="loading" :data="feedList" style="width: 100%;padding-top: 15px;">
          <el-table-column label="时间" min-width="100">
            <template slot-scope="scope">
              {{ scope.row.feed_time }}
            </template>
          </el-table-column>
          <el-table-column label="奶量" min-width="100">
            <template slot-scope="scope">
              {{ scope.row.milk_volume }}
            </template>
          </el-table-column>
          <el-table-column label="时间间隔" min-width="100">
            <template slot-scope="scope">
              {{ scope.row.time_different }}
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="100">

            <template slot-scope="scope">
              <el-button type="danger" @click="deleteFeedLog(scope.row)">删除</el-button>

            </template>
          </el-table-column>

        </el-table>
      </el-tab-pane>

      <el-tab-pane label="体温记录">
        <span slot="label"><svg-icon icon-class="bodyTemperature" class-name="card-panel-icon" /> 体温</span>
        <el-row>
          <el-button type="primary" @click="temperature_dialogFormVisible = true">添加记录</el-button>
        </el-row>
        <el-dialog title="体温记录" :visible.sync="temperature_dialogFormVisible" width="80%" destroy-on-close>
          <el-form :model="temperatureForm" :label-width="formLabelWidth">
            <el-form-item label="测量日期" required>
              <el-date-picker
                v-model="temperatureForm.date"
                type="date"
                placeholder="选择日期"
                align="left"
                :picker-options="pickerOptions"
                value-format="yyyy-MM-dd"
                style="width: 100%;"
                editable="false"
              />
            </el-form-item>
            <el-form-item label="体温" :label-width="formLabelWidth">
              <el-input v-model="temperatureForm.temperature" autocomplete="off" />
            </el-form-item>
          </el-form>

          <div slot="footer" class="dialog-footer">
            <el-button @click="temperature_dialogFormVisible = false">取 消</el-button>
            <el-button type="primary" @click="addTemperatureEvent">确 定</el-button>
          </div>
        </el-dialog>
        <el-table :data="temperatureList" style="width: 100%;padding-top: 15px;">
          <el-table-column label="时间" min-width="100">
            <template slot-scope="scope">
              {{ scope.row.date }}
            </template>
          </el-table-column>
          <el-table-column label="体温" min-width="100">
            <template slot-scope="scope">
              {{ scope.row.temperature }}
            </template>
          </el-table-column>

        </el-table>
      </el-tab-pane>

      <el-tab-pane label="尿不湿">
        <span slot="label"><svg-icon icon-class="babyPants" class-name="card-panel-icon" /> 尿不湿</span>

        <!-- 尿不湿添加记录显示button -->
        <el-row>
          <el-button type="primary" @click="pants_dialogFormVisible = true">添加记录</el-button>
        </el-row>

        <!-- 尿不湿dialog -->
        <el-dialog title="尿不湿" :visible.sync="pants_dialogFormVisible" width="80%" destroy-on-close>
          <el-form :model="babyPantsForm" :label-width="formLabelWidth">
            <el-form-item label="更换时间" required>
              <el-date-picker
                v-model="babyPantsForm.use_date"
                type="datetime"
                placeholder="选择日期时间"
                align="left"
                :picker-options="pickerOptions"
                value-format="yyyy-MM-dd HH:mm:00"
                style="width: 100%;"
                editable="false"
              />
            </el-form-item>

            <el-form-item label="是否侧漏" :label-width="formLabelWidth">
              <el-radio v-model="babyPantsForm.is_leaked" label="true">是</el-radio>
              <el-radio v-model="babyPantsForm.is_leaked" label="false">否</el-radio>
            </el-form-item>

            <el-form-item label="品牌" :label-width="formLabelWidth">
              <el-select v-model="babyPantsForm.brand" placeholder="请选择">
                <el-option v-for="item in babyPantsoptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-form>

          <div slot="footer" class="dialog-footer">
            <el-button @click="pants_dialogFormVisible = false">取 消</el-button>
            <el-button type="primary" @click="addBabyPantsEvent">确 定</el-button>
          </div>
        </el-dialog>

        <!-- 展示尿不湿信息记录 -->
        <el-table :data="babyPantsList" style="width: 100%;padding-top: 15px;">
          <el-table-column label="时间" min-width="100">
            <template slot-scope="scope">
              {{ scope.row.use_date }}
            </template>
          </el-table-column>
          <el-table-column label="侧漏" min-width="100">
            <template slot-scope="scope">
              {{ scope.row.is_leaked }}
            </template>
          </el-table-column>
          <el-table-column label="品牌" min-width="100">
            <template slot-scope="scope">
              {{ scope.row.brand }}
            </template>
          </el-table-column>

        </el-table>

      </el-tab-pane>

      <el-tab-pane label="睡眠记录">尿不湿</el-tab-pane>

      <el-tab-pane label="购买记录">
        <el-table :data="list" style="width: 100%;padding-top: 15px;">
          <el-table-column label="Order_No" min-width="200">
            <template slot-scope="scope">
              {{ scope.row.order_no | orderNoFilter }}
            </template>
          </el-table-column>
          <el-table-column label="Price" width="195" align="center">
            <template slot-scope="scope">
              ¥{{ scope.row.price | toThousandFilter }}
            </template>
          </el-table-column>
          <el-table-column label="Status" width="100" align="center">
            <template slot-scope="{row}">
              <el-tag :type="row.status | statusFilter">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="其他事项">其他事项记录</el-tab-pane>
    </el-tabs>

  </div>

</template>

<style lang="scss">

.el-date-picker .el-picker-panel__body {
    // min-width: 100%;
    // width: 390px
}
  // .el-picker-panel__body-wrapper{
  //   min-width: 390px;

  // }
  .el-picker-panel__sidebar{
    margin-left: 50px;
    width:60px ;
  }
  // .el-picker-panel__body {
  //   margin-left: 80px !important;
  // }
  .el-date-picker__time-header {
    width: 290px;
  }

</style>

<script>
// import { transactionList } from '@/api/remote-search'
Date.prototype.format = function(fmt) {
  var o = {
    'M+': this.getMonth() + 1, // 月份
    'd+': this.getDate(), // 日
    'h+': this.getHours(), // 小时
    'm+': this.getMinutes(), // 分
    's+': this.getSeconds(), // 秒
    'q+': Math.floor((this.getMonth() + 3) / 3), // 季度
    'S': this.getMilliseconds() // 毫秒
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  for (var k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
    }
  }
  return fmt
}
import {
  feedListReq, addFeedReq, deleteFeedReq,
  addTemperatureReq, temperatureListReq,
  babyPantsListReq, addBabyPantsReq
} from '@/api/baby'

export default {
  filters: {
    statusFilter(status) {
      const statusMap = {
        success: 'success',
        pending: 'danger'
      }
      return statusMap[status]
    },
    orderNoFilter(str) {
      return str.substring(0, 30)
    }
  },
  data() {
    return {
      loading: false,
      milk_dialogFormVisible: false,
      temperature_dialogFormVisible: false,
      pants_dialogFormVisible: false,
      formLabelWidth: '80px',
      pickerOptions: {
        shortcuts: [{
          text: '今天',
          onClick(picker) {
            picker.$emit('pick', new Date())
          }
        }, {
          text: '昨天',
          onClick(picker) {
            const date = new Date()
            date.setTime(date.getTime() - 3600 * 1000 * 24)
            picker.$emit('pick', date)
          }
        }, {
          text: '一周前',
          onClick(picker) {
            const date = new Date()
            date.setTime(date.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', date)
          }
        }]
      },
      feedForm: {
        milk_volume: '',
        feed_time: ''
      },
      temperatureForm: {
        temperature: '',
        date: ''
      },
      babyPantsoptions: [{
        value: '好奇',
        label: '好奇'
      }, {
        value: '帮宝适',
        label: '帮宝适'
      }, {
        value: '龙猫',
        label: '龙猫'
      }, {
        value: '路安视',
        label: '路安视'
      }, {
        value: 'BabyCare',
        label: 'BabyCare'
      }],

      babyPantsForm: {
        use_date: NaN,
        brand: '好奇',
        is_leaked: 'false'
      },

      // list: [{"order_no":1,"price":100,"status":"success"},{"order_no":2,"price":200,"status":"success"},]

      feedList: [],
      temperatureList: [],
      babyPantsList: [],

      list: [{ 'order_no': 1, 'price': 100 }, { 'order_no': 2, 'price': 200 }],
      feed_query: { 'start_time': '', 'end_time': '' },
      temperature_query: { 'date': '', 'mode': 'today' },
      date: '',
      date_time: ''

    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    deleteFeedLog(row) {
      this.loading = true
      console.log('delete feed log  row is ', row)
      deleteFeedReq(row).then(res => {
        console.log(res)
        if (res.code === 200) {
          this.fetchData()
        }
      })
      this.loading = false
    },

    fetchData() {
      // var now_time = new Date()
      var date_time = new Date().format('yyyy-MM-dd hh:mm:ss')

      var date = new Date().format('yyyy-MM-dd')
      var before_now_36 = new Date(new Date().getTime() - 36 * 60 * 60 * 1000).format('yyyy-MM-dd hh:mm:ss')

      this.date = date
      this.date_time = date_time
      this.feed_query.end_time = date_time
      this.feed_query.start_time = before_now_36
      this.temperature_query.date = date

      const babyPantsQuery = { 'use_date': this.date }
      babyPantsListReq(babyPantsQuery).then(res => {
        if (res.code === 200) {
          this.babyPantsList = res.data
        }
      })

      feedListReq(this.feed_query).then(res => {
        if (res.code === 200) {
          this.feedList = res.data
        }
      })

      const temperatureListQuery = { 'date': this.date, 'mode': 'week' }
      temperatureListReq(temperatureListQuery).then(res => {
        if (res.code === 200) {
          this.temperatureList = res.data
        }
      })
      // transactionList().then(response => {
      //   this.list = response.data.items.slice(0, 8)
      // })
    },

    addBabyPantsEvent() {
      const data = { ...this.babyPantsForm }

      addBabyPantsReq(data).then(res => {
        if (res.code === 200) {
          this.pants_dialogFormVisible = false
          this.fetchData()
        }
      })
    },

    addFeedEvent() {
      const data = { ...this.feedForm }

      addFeedReq(data).then(res => {
        if (res.code === 200) {
          this.milk_dialogFormVisible = false
          this.fetchData(this.feed_query)
        }
      })
    },

    addTemperatureEvent() {
      const data = { ...this.temperatureForm }
      addTemperatureReq(data).then(res => {
        if (res.code === 200) {
          this.temperature_dialogFormVisible = false
          this.fetchData(this.temperature_query)
        }
      })
    }

  }
}
</script>
