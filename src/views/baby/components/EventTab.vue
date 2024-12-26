<template>
  <div>
    <el-tabs type="border-card">
      <el-tab-pane>
        <span slot="label"><i class="el-icon-date" /> 宝贝喂奶记录</span>
        <el-row>
          <el-button type="primary" @click="dialogFormVisible = true">添加喂奶记录</el-button>
        </el-row>

        <el-dialog title="喂奶记录" :visible.sync="dialogFormVisible" destroy-on-close="true">
          <el-form :model="feedForm" label-width="100px">
            <el-form-item label="喂奶时间" required>
              <el-col :span="11">
                <el-date-picker
                  v-model="feedForm.feed_time"
                  type="datetime"
                  placeholder="选择日期时间"
                  align="right"
                  :picker-options="pickerOptions"
                  value-format="yyyy-MM-dd HH:mm:00"
                  style="width: 100%;"
                />

              </el-col>

              <!-- <el-col :span="6">
                                <el-form-item prop="feedDate">
                                    <el-date-picker type="date" placeholder="选择日期" v-model="feedForm.feedDate"
                                        style="width: 100%;"></el-date-picker>
                                </el-form-item>
                            </el-col>
                            <el-col class="line" :span="2">-</el-col>
                            <el-col :span="6">

                                <el-form-item prop="feedTime">
                                    <el-time-select v-model="feedForm.feedTime" :picker-options="{
                                        start: '00:00',
                                        step: '00:10',
                                        end: '24:00'
                                    }" placeholder="选择时间">
                                    </el-time-select>
                                </el-form-item>
                            </el-col> -->
            </el-form-item>

            <el-form-item label="奶量" :label-width="formLabelWidth">
              <el-input v-model="feedForm.milk_volume" autocomplete="off" />

            </el-form-item>

          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="dialogFormVisible = false">取 消</el-button>
            <el-button type="primary" @click="addFeedEvent">确 定</el-button>
          </div>
        </el-dialog>

        <el-table :data="feedList" style="width: 100%;padding-top: 15px;">
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

        </el-table>

      </el-tab-pane>
      <el-tab-pane label="睡眠记录">尿不湿</el-tab-pane>
      <el-tab-pane label="尿不湿记录">尿不湿</el-tab-pane>
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
import { feedListReq, addFeedReq } from '@/api/baby'

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
      dialogFormVisible: false,
      formLabelWidth: '120px',
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
      // list: [{"order_no":1,"price":100,"status":"success"},{"order_no":2,"price":200,"status":"success"},]

      feedList: [],
      list: [{ 'order_no': 1, 'price': 100 }, { 'order_no': 2, 'price': 200 }],
      feed_query: { 'date': '' }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {

    fetchData() {
      var date = new Date().format('yyyy-MM-dd 00:00:00')
      console.log('--------time ', date)
      this.feed_query.date = date
      feedListReq(this.feed_query).then(res => {
        console.log('result is ', res)
        if (res.code === 200) {
          this.feedList = res.data
        }
      })
      // transactionList().then(response => {
      //   this.list = response.data.items.slice(0, 8)
      // })
    },
    addFeedEvent() {
      console.log('添加喂养记录')
      const data = { ...this.feedForm }

      addFeedReq(data).then(res => {
        console.log(res)
        if (res.code === 200) {
          this.dialogFormVisible = false
          this.fetchData(this.feed_query)
        }
      })
    }
  }
}
</script>
