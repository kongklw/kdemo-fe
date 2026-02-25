<template>
  <div class="dashboard-editor-container">

    <!-- Unified Top Card -->
    <div class="unified-card">
      <!-- Top Bar -->
      <div class="top-control-bar">
        <div class="month-selector" @click="openMobileMonthPicker">
          <i class="el-icon-date" style="margin-right: 5px;" />
          <span>{{ monthrangeText || '点击选择月份' }}</span>
        </div>
        <div class="filter-toggle" @click="showFilter = !showFilter">
          <div class="filter-icon-wrapper">
            <i class="el-icon-filter" />
          </div>
          <span class="filter-text">筛选</span>
        </div>
      </div>

      <!-- Filter Panel -->
      <transition name="el-zoom-in-top">
        <div v-show="showFilter" class="filter-panel-container">
          <el-input v-model="formInline.name" placeholder="物品名称" prefix-icon="el-icon-search" clearable size="small" />
          <div style="margin-top: 10px;">
            <el-radio-group v-model="formInline.expense_type" size="small" @change="refreshList">
              <el-radio-button label="">全部</el-radio-button>
              <el-radio-button label="income">收入</el-radio-button>
              <el-radio-button label="expense">支出</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </transition>

      <!-- Stats Panel -->
      <div class="stats-panel">
        <div class="stats-row">
          <div class="stat-col">
            <div class="stat-label">总收入</div>
            <div class="stat-value">{{ all_income }}</div>
          </div>
          <div class="stat-col">
            <div class="stat-label">总支出</div>
            <div class="stat-value">{{ all_expense }}</div>
          </div>
          <div class="stat-col">
            <div class="stat-label">查询总收入</div>
            <div class="stat-value">{{ range_income }}</div>
          </div>
          <div class="stat-col">
            <div class="stat-label">查询总支出</div>
            <div class="stat-value">{{ range_expense }}</div>
          </div>
        </div>
      </div>

      <!-- Action Bar -->
      <div class="action-bar-container">
        <el-button style="margin-right: 10px;" size="small" type="danger" @click="batchDelete">批量删除</el-button>
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
          :show-file-list="false"
        >
          <el-button slot="trigger" size="small" type="primary">点击上传</el-button>
        </el-upload>
        <el-button style="margin-left: 10px;" size="small" type="primary" @click="batchProcess">批量AI处理</el-button>
        <el-button style="margin-left: 10px;" size="small" type="primary" @click="dialogFormVisible = true">单个添加</el-button>
      </div>
    </div>

    <!-- Month Picker Popup -->
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
    <div>
      <!-- <el-button @click="clearFilter">清除所有过滤器</el-button> -->

      <div class="expense-container">
        <van-list
          v-model="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
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
        </van-list>

        <!-- Empty state -->
        <div v-if="tableData.length === 0 && !loading" class="empty-state">
          暂无数据
        </div>
      </div>
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
            <div class="tag-group">
              <el-tag
                v-for="tag in allTags"
                :key="tag"
                :effect="expenseForm.tag === tag ? 'dark' : 'plain'"
                class="tag-item"
                @click="selectTag(tag)"
              >
                {{ tag }}
              </el-tag>
              <el-button class="button-new-tag" size="small" icon="el-icon-plus" @click="showInput">标签</el-button>
            </div>
            <el-dialog
              title="添加标签"
              :visible.sync="tagDialogVisible"
              :width="device === 'mobile' ? '90%' : '30%'"
              append-to-body
            >
              <el-input
                v-model="newTagName"
                placeholder="请输入新标签名称"
                @keyup.enter.native="handleInputConfirm"
              />
              <span slot="footer" class="dialog-footer">
                <el-button @click="tagDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleInputConfirm">确 定</el-button>
              </span>
            </el-dialog>
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
  addExpenseReq, showExpenseListReq, uploadExpenseFile, batchProcessExpenseReq, batchDeleteExpenseReq, updateExpenseReq,
  getExpenseTagsReq, addExpenseTagReq
} from '@/api/baby'
import { mapGetters } from 'vuex'

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
      // search_amount: 0,
      // total_amount: 0,
      range_income: 0,
      range_expense: 0,
      all_income: 0,
      all_expense: 0,

      showFilter: false, // Control filter panel visibility

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
      userTags: [],
      tagDialogVisible: false,
      newTagName: '',
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
        name: '',
        expense_type: ''
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

      // Infinite Scroll
      loading: false,
      finished: false,

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
    ...mapGetters([
      'device'
    ]),
    monthrangeText() {
      const range = this.formInline && this.formInline.monthrange
      if (!Array.isArray(range) || range.length !== 2 || !range[0] || !range[1]) {
        return ''
      }
      return `${this.moment(range[0]).format('YYYY-MM')} 至 ${this.moment(range[1]).format('YYYY-MM')}`
    },
    mobileMonthPickerTitle() {
      return this.mobileMonthPickStep === 'start' ? '选择开始月份' : '选择结束月份'
    },
    allTags() {
      const defaultTags = this.tagOptions.map(t => t.value)
      // Merge unique
      // Check if userTags is array
      const userTags = Array.isArray(this.userTags) ? this.userTags : []
      const tags = new Set([...defaultTags, ...userTags])
      return Array.from(tags)
    }
  },

  watch: {
    'formInline.monthrange': {
      handler(val) {
        this.refreshList()
      },
      deep: true
    },
    'formInline.name': function(val) {
      if (this.searchTimer) clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => {
        this.refreshList()
      }, 500)
    }
  },

  mounted() {},

  created() {
    // let van-list trigger initial load
    this.fetchTags()
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
      // Fix: Replace backslashes with forward slashes for Windows compatibility
      const url = row.image_url.replace(/\\/g, '/')
      return this.$BASE_API + '/media/' + url
    },

    fetchTags() {
      getExpenseTagsReq().then(res => {
        if (res.code === 200) {
          this.userTags = res.data
        }
      })
    },

    selectTag(tag) {
      this.expenseForm.tag = tag
    },

    showInput() {
      this.tagDialogVisible = true
      this.newTagName = ''
    },

    handleInputConfirm() {
      const name = this.newTagName
      if (name) {
        addExpenseTagReq({ name }).then(res => {
          if (res.code === 200) {
            this.userTags.push(name)
            this.tagDialogVisible = false
            this.$message.success('Tag added')
          } else {
            this.$message.error(res.msg)
          }
        })
      }
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

    onLoad() {
      // Prevent duplicate loading if already loading (except initial manual call which sets loading=true)
      // Actually van-list handles this via v-model="loading", but we can be extra safe
      // if (this.loading && this.tableData.length > 0) return

      const data = {
        page_num: this.pageInfo.currentPage,
        page_size: this.pageInfo.pageSize,
        ...this.formInline
      }

      showExpenseListReq(data).then(res => {
        if (res.code === 200) {
          const data = res.data
          const list = data.list || data.expense_list || []

          // Update stats (always)
          if (data.range_income !== undefined) this.range_income = data.range_income
          if (data.range_expense !== undefined) this.range_expense = data.range_expense
          if (data.all_income !== undefined) this.all_income = data.all_income
          if (data.all_expense !== undefined) this.all_expense = data.all_expense

          // Safety check: if list is empty, we are finished
          if (list.length === 0) {
            this.finished = true
            this.loading = false
            return
          }

          // Append or Set data
          if (this.pageInfo.currentPage === 1) {
            this.tableData = list
          } else {
            this.tableData.push(...list)
          }

          if (data.total !== undefined) {
            this.pageInfo.totalPage = data.total
          }

          // Loading done
          this.loading = false

          // Check finished
          if (this.tableData.length >= data.total) {
            this.finished = true
          } else {
            this.pageInfo.currentPage++
          }
        } else {
          this.loading = false
          this.finished = true
        }
      }).catch(() => {
        this.loading = false
        this.finished = true
      })
    },

    refreshList() {
      this.pageInfo.currentPage = 1
      this.finished = false
      this.loading = true
      this.onLoad()
    },

    showExpenseList() {
      this.refreshList()
    },

    handleSelectionChange(val) {
      const idsArray = val.map(v => (
        v.id
      ))
      this.multipleSelection = idsArray
    },

    // onSubmit(formName) {
    //   this.$refs[formName].validate((valid) => {
    //     if (valid) {
    //       this.showExpenseList()
    //     } else {
    //       return false
    //     }
    //   })
    // },

    addExpenseEvent() {
      const data = { ...this.expenseForm }
      if (this.currentEditId) {
        data.id = this.currentEditId
        updateExpenseReq(data).then(res => {
          if (res.code === 200) {
            // Update local list data directly to maintain scroll position
            const index = this.tableData.findIndex(item => item.id === this.currentEditId)
            if (index !== -1) {
              const updatedItem = { ...this.tableData[index], ...data }
              this.$set(this.tableData, index, updatedItem)
            }

            this.dialogFormVisible = false
            this.currentEditId = null
            this.$message.success('修改成功')

            // Optionally refresh stats silently if needed, or just let them be updated on next load
          }
        })
      } else {
        addExpenseReq(data).then((res) => {
          if (res.code === 200) {
            this.showExpenseList()
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
    min-height: 90px;
    height: auto;
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

.unified-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
  margin-bottom: 20px;
  overflow: hidden;
}

.top-control-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;

  .month-selector {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #333;
    cursor: pointer;
    font-weight: 500;
  }

  .filter-toggle {
    display: flex;
    align-items: center;
    cursor: pointer;
    color: #666;
    font-size: 14px;

    .filter-icon-wrapper {
       font-size: 16px;
       margin-right: 4px;
    }

    .filter-text {
       font-size: 14px;
       margin-top: 0;
    }
  }
}

.filter-panel-container {
   padding: 10px 15px;
   background-color: #f9f9f9;
   border-bottom: 1px solid #eee;
}

.stats-panel {
  background: #fff;
  padding: 12px;
  margin-bottom: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

  .stats-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .stat-col {
    flex: 1;
    text-align: center;
    position: relative;

    &:not(:last-child)::after {
      content: '';
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      height: 60%;
      width: 1px;
      background-color: #eee;
    }
  }

  .stat-label {
    font-size: 12px;
    color: #909399;
    margin-bottom: 4px;
  }

  .stat-value {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }
}

.action-bar-container {
   padding: 10px 15px 20px 15px;
   display: flex;
   flex-wrap: nowrap;
   align-items: center;
   background: #fff;
   margin-top: 0;
   overflow-x: auto;
   border-top: 1px solid #f5f5f5;

   /* Hide scrollbar */
   &::-webkit-scrollbar {
     display: none;
   }
   -ms-overflow-style: none;
   scrollbar-width: none;
}

.tag-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}
.tag-item {
  cursor: pointer;
  margin-right: 10px;
  margin-bottom: 10px;
}
.button-new-tag {
  margin-bottom: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
</style>
