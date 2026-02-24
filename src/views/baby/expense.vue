<template>
  <div class="dashboard-editor-container">

    <div class="pannel">
      <el-row :gutter="10" class="panel-group">
        <el-col :xs="24" :sm="24" :lg="12" class="card-panel-col">
          <div class="card-panel" @click="handleSetLineChartData('purchases')">
            <div class="card-panel-icon-wrapper icon-money">
              <svg-icon icon-class="money" class-name="card-panel-icon" />
            </div>

            <div class="card-panel-description">
              <div class="card-panel-text">
                总花费
              </div>
              <label class="card-panel-num">{{ total_amount }}</label>
              <!-- <count-to :start-val="0" :end-val="9280" :duration="3200" class="card-panel-num" /> -->
            </div>

            <div class="card-panel-description">
              <div class="card-panel-text">
                查询总花费
              </div>
              <label class="card-panel-num">{{ search_amount }} </label>
              <!-- <count-to :start-val="0" :end-val="9280" :duration="3200" class="card-panel-num" /> -->
            </div>
          </div>
        </el-col>

      </el-row>
    </div>

    <!-- 查询form -->
    <div>

      <div class="batch-process">
        <el-upload
          ref="upload"
          class="upload-demo inline-block"
          multiple
          action=""
          :http-request="upload"
          :on-preview="handlePreview"
          :on-remove="handleRemove"
          :file-list="fileList"
          list-type="picture"
        >
          <el-button slot="trigger" size="small" type="primary">点击上传</el-button>
          <el-button style="margin-left: 10px;" size="small" type="primary" @click="batchProcess">批量AI处理</el-button>
          <el-button
            style="margin-left: 20px;"
            size="small"
            type="primary"
            @click="dialogFormVisible = true"
          >单个添加</el-button>
          <!-- <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div> -->
        </el-upload>
      </div>

      <div class="batch-process">
        <el-form ref="formInline" :rules="rules" :inline="true" :model="formInline" class="demo-form-inline">
          <el-form-item label="月份" prop="monthrange" required>
            <!-- PC/手机统一：Vant 滑动选择（先选开始月份，再选结束月份） -->
            <div class="monthrange-mobile" @click="openMobileMonthPicker">
              <el-input
                :value="monthrangeText"
                readonly
                placeholder="点击选择月份范围"
                prefix-icon="el-icon-date"
              />
            </div>

            <van-popup v-model="showMonthPicker" class="month-picker-popup" position="center" get-container="body">
              <div class="month-picker-modal">
                <div class="month-picker-toolbar">
                  <button class="month-picker-action" type="button" @click="onMobileMonthCancel">取消</button>
                  <div class="month-picker-title">{{ mobileMonthPickerTitle }}</div>
                  <button class="month-picker-action primary" type="button" @click="onMobileMonthConfirm(mobileMonthDate)">确认</button>
                </div>

                <div class="month-picker-shortcuts">
                  <button class="month-picker-shortcut" type="button" @click="applyMonthShortcut(1)">近1月</button>
                  <button class="month-picker-shortcut" type="button" @click="applyMonthShortcut(3)">近3月</button>
                  <button class="month-picker-shortcut" type="button" @click="applyMonthShortcut(6)">近半年</button>
                  <button class="month-picker-shortcut" type="button" @click="applyMonthShortcut(12)">近1年</button>
                </div>

                <div class="month-picker-columns-labels">
                  <span class="column-label">年</span>
                  <span class="column-label">月</span>
                </div>

                <van-datetime-picker
                  v-model="mobileMonthDate"
                  type="year-month"
                  :min-date="minMonthDate"
                  :max-date="maxMonthDate"
                  :show-toolbar="false"
                />
              </div>
            </van-popup>
          </el-form-item>
          <el-form-item label="物品名称" prop="name">
            <el-input v-model="formInline.name" placeholder="例如 尿不湿" />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="onSubmit('formInline')">查询</el-button>
          </el-form-item>

          <el-form-item>
            <el-button style="margin-left: 10px;" size="small" type="danger" @click="batchDelete">批量删除</el-button>
          </el-form-item>

        </el-form>
      </div>
    </div>
    <div>
      <!-- <el-button @click="clearFilter">清除所有过滤器</el-button> -->

      <div class="expense-container">
        <el-checkbox-group v-model="multipleSelection">
          <van-swipe-cell v-for="item in tableData" :key="item.id" class="expense-swipe-cell">
            <div class="expense-card">
              <div class="card-header">
                <span class="card-date">{{ item.order_time ? item.order_time.replace('T', ' ') : '' }}</span>
                <el-button type="text" icon="el-icon-edit" class="edit-btn-text" @click.stop="handleEdit(item)">编辑</el-button>
              </div>

              <div class="card-body">
                <div class="card-checkbox-wrapper">
                  <el-checkbox :label="item.id" class="hide-label" />
                </div>

                <div class="card-image-wrapper">
                  <el-image
                    class="card-image"
                    :src="getImageUrl(item)"
                    :preview-src-list="[getImageUrl(item)]"
                    fit="cover"
                  >
                    <div slot="error" class="image-slot">
                      <i class="el-icon-picture-outline" />
                    </div>
                  </el-image>
                </div>

                <div class="card-content">
                  <div class="card-title">{{ item.name }}</div>
                </div>

                <div class="card-price-wrapper">
                  <span class="price-symbol">¥</span>
                  <span class="price-integer">{{ item.amount }}</span>
                </div>
              </div>

              <div class="card-footer">
                <el-tag size="mini" type="info" effect="plain">{{ item.tag || '无标签' }}</el-tag>
                <el-tag size="mini" :type="item.expense_type === 'income' ? 'success' : 'danger'" style="margin-left: 10px;">
                  {{ item.expense_type === 'income' ? '收入' : '支出' }}
                </el-tag>
              </div>
            </div>
            <template #right>
              <van-button square type="danger" text="删除" class="delete-button" @click="handleDelete(item)" />
            </template>
          </van-swipe-cell>
        </el-checkbox-group>

        <!-- Empty state -->
        <div v-if="tableData.length === 0" class="empty-state">
          暂无数据
        </div>
      </div>

      <el-pagination
        background
        layout="prev, pager, next"
        :total="pageInfo.totalPage"
        :page-sizes="pageSizes"
        :page-size="pageInfo.pageSize"
        :current-page.sync="pageInfo.currentPage"
        @current-change="handleCurrentChange"
      />
    </div>
    <!-- modal 框 -->
    <div>
      <el-dialog title="收支" :visible.sync="dialogFormVisible" width="80%" destroy-on-close center>
        <el-form :model="expenseForm" :label-width="formLabelWidth">
          <el-form-item label="日期" required>
            <el-date-picker
              v-model="expenseForm.order_time"
              type="date"
              placeholder="选择日期"
              align="left"
              value-format="yyyy-MM-dd"
              :default-value="new Date()"
              style="width: 100%;"
            />
          </el-form-item>

          <el-form-item label="类型" :label-width="formLabelWidth">
            <el-radio-group v-model="expenseForm.expense_type">
              <el-radio label="expense">支出</el-radio>
              <el-radio label="income">收入</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="名称" :label-width="formLabelWidth">
            <el-input v-model="expenseForm.name" autocomplete="off" />
          </el-form-item>

          <el-form-item label="标签" :label-width="formLabelWidth">
            <el-select
              v-model="expenseForm.tag"
              placeholder="请选择或输入标签"
              filterable
              allow-create
              default-first-option
            >
              <el-option v-for="item in tagOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>

          <el-form-item label="金额" :label-width="formLabelWidth">
            <el-input v-model="expenseForm.amount" autocomplete="off" />
          </el-form-item>

        </el-form>

        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="addExpenseEvent">确 定</el-button>
        </div>
      </el-dialog>
    </div>

  </div>
</template>

<script>
import {
  addExpenseReq, showExpenseListReq, uploadExpenseFile, batchProcessExpenseReq, batchDeleteExpenseReq, updateExpenseReq
} from '@/api/baby'

export default {
  name: 'BabyExpense',
  components: {

  },

  data() {
    return {

      fileList: [
        // { name: 'food.jpeg', url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100' },
        // { name: 'food2.jpeg', url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100' }
      ],

      myFileList: [],
      search_amount: 0,
      total_amount: 0,

      expenseForm: {
        order_time: this.moment().format('YYYY-MM-DD'),
        name: '',
        tag: '',
        amount: 0,
        expense_type: 'expense'
      },

      tagOptions: [{
        value: '奶粉',
        label: '奶粉'
      }, {
        value: '衣服',
        label: '衣服'
      }, {
        value: '玩具',
        label: '玩具'
      }, {
        value: '娱乐',
        label: '娱乐'
      }, {
        value: '红包',
        label: '红包'
      }, {
        value: '食品',
        label: '食品'
      }, {
        value: '旅行',
        label: '旅行'
      }, {
        value: '其他',
        label: '其他'
      }
      ],
      dialogFormVisible: false,
      formLabelWidth: '80px',
      pageSizes: [20, 50, 100],
      pageInfo: {
        totalPage: 100,
        currentPage: 1,
        pageSize: 20
      },
      // totalPage: 100,
      // currentPage: 1,
      // pageSizes: "[20, 50,100]",
      // pageSize: "20",
      formInline: {
        monthrange: [this.moment().subtract(2, 'months').startOf().format('YYYY-MM-DD'), this.moment().format('YYYY-MM-DD')],
        name: ''
      },
      tableData: [],
      multipleSelection: [],

      // mobile 月份范围选择（Vant：year-month，分两步选 start/end）
      showMonthPicker: false,
      mobileMonthPickStep: 'start', // 'start' | 'end'
      mobileMonthDate: new Date(),
      tempStartMonthDate: null,
      minMonthDate: new Date(2020, 0, 1),
      maxMonthDate: new Date(2030, 11, 1),
      currentEditId: null, // 当前编辑的 ID

      monthPickerOptions: {
        shortcuts: [
          {
            text: '本月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setDate(1)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '近3个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setMonth(start.getMonth() - 2)
              start.setDate(1)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '近6个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setMonth(start.getMonth() - 5)
              start.setDate(1)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '近一年',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setFullYear(start.getFullYear() - 1)
              start.setDate(1)
              picker.$emit('pick', [start, end])
            }
          }
        ]
      },

      rules: {

        monthrange: [
          { required: true, message: '请选择查询起止月份', trigger: 'change' }
        ]
        // name: [
        //     { required: true, message: '请输入活动名称', trigger: 'blur' },
        //     { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        // ],
      }

    }
  },
  computed: {
    monthrangeText() {
      const range = this.formInline && this.formInline.monthrange
      if (!Array.isArray(range) || range.length !== 2 || !range[0] || !range[1]) {
        return ''
      }
      return `${this.moment(range[0]).format('YYYY-MM')} 至 ${this.moment(range[1]).format('YYYY-MM')}`
    },
    mobileMonthPickerTitle() {
      return this.mobileMonthPickStep === 'start' ? '选择开始月份' : '选择结束月份'
    }
  },

  mounted() {},

  created() {
    this.showExpenseList()
  },

  destroyed() {

  },

  methods: {
    openMobileMonthPicker() {
      const range = this.formInline && this.formInline.monthrange
      let start = null
      let end = null

      if (Array.isArray(range) && range.length === 2) {
        start = range[0] ? new Date(String(range[0]).replace(/-/g, '/')) : null
        end = range[1] ? new Date(String(range[1]).replace(/-/g, '/')) : null
      }

      // 初始化：从当前范围的 start 月开始；否则用当前月
      this.mobileMonthPickStep = 'start'
      this.tempStartMonthDate = start && !isNaN(start.getTime()) ? start : null
      this.mobileMonthDate = this.tempStartMonthDate || (end && !isNaN(end.getTime()) ? end : new Date())
      this.showMonthPicker = true
    },

    applyMonthShortcut(monthCount) {
      const months = Number(monthCount)
      if (!months || months <= 0) return

      const startMoment = this.moment().subtract(months - 1, 'months').startOf('month')
      const endMoment = this.moment()

      this.formInline.monthrange = [startMoment.format('YYYY-MM-DD'), endMoment.format('YYYY-MM-DD')]

      this.showMonthPicker = false
      this.mobileMonthPickStep = 'start'
      this.tempStartMonthDate = null
      this.mobileMonthDate = new Date()
    },

    onMobileMonthCancel() {
      this.showMonthPicker = false
      this.mobileMonthPickStep = 'start'
      this.tempStartMonthDate = null
    },

    onMobileMonthConfirm(value) {
      const picked = value instanceof Date ? value : new Date(value)
      if (isNaN(picked.getTime())) {
        return
      }

      if (this.mobileMonthPickStep === 'start') {
        this.tempStartMonthDate = picked
        this.mobileMonthPickStep = 'end'
        // 继续在同一个弹层里选结束月份，默认跳到开始月份所在月
        this.mobileMonthDate = picked
        return
      }

      const startMonth = this.tempStartMonthDate || picked
      const endMonth = picked

      let startMoment = this.moment(startMonth).startOf('month')
      let endMoment = this.moment(endMonth).endOf('month')

      if (endMoment.isBefore(startMoment)) {
        startMoment = this.moment(endMonth).startOf('month')
        endMoment = this.moment(startMonth).endOf('month')
      }

      // 结束月份如果是当月，用今天作为结束日期（与原 shortcuts 行为一致）
      if (endMoment.isSame(this.moment(), 'month')) {
        endMoment = this.moment()
      }

      this.formInline.monthrange = [startMoment.format('YYYY-MM-DD'), endMoment.format('YYYY-MM-DD')]

      this.showMonthPicker = false
      this.mobileMonthPickStep = 'start'
      this.tempStartMonthDate = null
    },

    getImageUrl(row) {
      if (!row || !row.image_url) {
        return ''
      }
      return this.$BASE_API + '/media/' + row.image_url
    },

    batchProcess() {
      const loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })

      const data = { 'fileList': this.myFileList }
      batchProcessExpenseReq(data).then(res => {
        if (res.code === 200) {
          loading.close()
          // alert('batch process successful')
          this.fileList = []
          this.myFileList = []

          this.showExpenseList()
        }
      }).catch(() => {
        loading.close()
      })
    },

    batchDelete() {
      const data = { 'ids': this.multipleSelection }
      batchDeleteExpenseReq(data).then(res => {
        if (res.code === 200) {
          this.showExpenseList()
        }
      })
    },

    upload(param) {
      const formData = new FormData()
      formData.append('file', param.file)

      uploadExpenseFile(formData).then(res => {
        if (res.code === 200) {
          const data = res.data
          this.myFileList.push(data)
        }
      })
    },

    handleRemove(file, fileList) {

    },
    handlePreview(file) {

    },

    showExpenseList() {
      const data = { ...this.pageInfo, ...this.formInline }

      showExpenseListReq(data).then(res => {
        if (res.code === 200) {
          const data = res.data

          this.tableData = data.expense_list
          this.search_amount = data.search_amount
          this.total_amount = data.total_amount
        }
      })
    },

    handleSelectionChange(val) {
      const idsArray = val.map(v => (
        v.id
      ))
      this.multipleSelection = idsArray
    },

    onSubmit(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.showExpenseList()
        } else {
          return false
        }
      })
    },

    addExpenseEvent() {
      const data = { ...this.expenseForm }
      if (this.currentEditId) {
        data.id = this.currentEditId
        updateExpenseReq(data).then(res => {
          if (res.code === 200) {
            this.showExpenseList()
            this.dialogFormVisible = false
            this.currentEditId = null
          }
        })
      } else {
        addExpenseReq(data).then((res) => {
          if (res.code === 200) {
            this.tableData = res.data
            this.dialogFormVisible = false
          }
        })
      }
    },

    handleEdit(item) {
      this.currentEditId = item.id
      this.expenseForm = {
        order_time: item.order_time ? item.order_time.split('T')[0] : '',
        name: item.name,
        tag: item.tag,
        amount: item.amount,
        expense_type: item.expense_type || 'expense'
      }
      this.dialogFormVisible = true
    },

    handleDelete(item) {
      const data = { ids: [item.id] }
      this.$confirm('确认删除该记录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        batchDeleteExpenseReq(data).then(res => {
          if (res.code === 200) {
            this.showExpenseList()
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
          }
        })
      }).catch(() => {
        // cancelled
      })
    },

    handleCurrentChange(val) {

    },

    clearFilter() {
      this.$refs.filterTable.clearFilter()
    },
    formatter(row, column) {
      return row.amount
    },
    filterTag(value, row) {
      return row.tag === value
    }
    // filterHandler(value, row, column) {
    //     const property = column['property'];
    //     return row[property] === value;
    // }
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
      float: right;
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
    width: 50%;
    height: 50%;
    margin: 0 !important;

    .svg-icon {
      display: block;
      margin: 14px auto !important;
      float: none !important;
    }
  }
}

.batch-process {
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

.monthrange-mobile {
  width: 100%;
}

.month-picker-popup {
  width: 92%;
  border-radius: 12px;
  overflow: hidden;
}

.month-picker-modal {
  background: #fff;
}

.month-picker-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 12px 8px;
  border-bottom: 1px solid #f0f0f0;
}

.month-picker-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.month-picker-action {
  background: transparent;
  border: 0;
  padding: 6px 8px;
  font-size: 14px;
  color: #606266;
}

.month-picker-action.primary {
  color: #1989fa; /* Vant 默认主色 */
}

.month-picker-shortcuts {
  display: flex;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid #f6f6f6;
  flex-wrap: wrap;
}

.month-picker-shortcut {
  border: 1px solid #e5e5e5;
  background: #fafafa;
  color: #303133;
  padding: 6px 10px;
  font-size: 13px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s;

  &:active {
    background: #ebedf0;
  }
}

.month-picker-columns-labels {
  display: flex;
  justify-content: space-around;
  padding: 10px 0 5px;
  background: #fff;
  border-bottom: 1px solid #f6f6f6;
}

.column-label {
  flex: 1;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.inline-block {
  display: inline-block;
}

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

.expense-container {
  padding: 10px 0;
}

.expense-swipe-cell {
    margin-bottom: 12px;
  }

  .expense-card {
    background: #fff;
    border-radius: 12px;
    /* margin-bottom: 12px; */
    padding: 12px;
    position: relative;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);

    .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #f5f5f5;

    .card-date {
      font-weight: 600;
      color: #333;
      font-size: 14px;
    }

    .card-status {
      color: #999;
      font-size: 12px;
    }
  }

  .card-body {
    display: flex;
    align-items: center;
  }

  .card-checkbox-wrapper {
    display: flex;
    align-items: center;
    margin-right: 8px;
    /* padding-top: 30px; Removed padding to align center */
  }

  .card-image-wrapper {
    width: 80px;
    height: 80px;
    margin-right: 12px;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
    border: 1px solid #f0f0f0;

    .card-image {
      width: 100%;
      height: 100%;
    }

    .image-slot {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
      background: #f5f7fa;
      color: #909399;
      font-size: 20px;
    }
  }

  .card-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 80px;
    margin-right: 10px;

    .card-title {
      font-size: 14px;
      color: #333;
      line-height: 1.4;
      font-weight: 500;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
    }
  }

  .card-price-wrapper {
    text-align: right;
    white-space: nowrap;

    .price-symbol {
      font-size: 14px;
      color: #ff5000;
      margin-right: 2px;
    }

    .price-integer {
      font-size: 20px;
      color: #ff5000;
      font-weight: bold;
    }
  }

  .card-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #f9f9f9;
    gap: 10px;

    .el-button--mini {
      padding: 7px 15px;
      border-radius: 14px;
    }

    .action-btn-primary {
      color: #ff5000;
    }
  }

  /* Add new styles */
  .hide-label {
    /* Hide the text part of checkbox */
    ::v-deep .el-checkbox__label {
      display: none;
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .edit-btn-text {
    font-size: 14px;
    padding: 0;
    color: #409EFF; /* Blue color for edit */
  }

  .delete-button {
    height: 100% !important;
  }

  ::v-deep .van-swipe-cell__right {
    height: 100%;
    display: flex;
    align-items: center;
  }

  .action-btn-primary {
    color: #ff5000;
    border-color: #ff5000;
    background: #fff;

    &:focus, &:hover {
      background: #fff0e6;
      border-color: #ff3300;
      color: #ff3300;
    }
  }
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #999;
  font-size: 14px;
}
</style>
