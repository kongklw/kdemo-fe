<template>
  <div class="dashboard-editor-container">

    <!-- 查询form -->
    <div>
      <el-form ref="formInline" :rules="rules" :inline="true" :model="formInline" class="demo-form-inline">
        <el-form-item label="日期" prop="date" required>
          <el-date-picker v-model="formInline.date" type="date" value-format="yyyy-MM-dd" placeholder="选择日期">
          </el-date-picker>
        </el-form-item>

        <!-- <el-form-item label="物品名称" prop="name">
          <el-input v-model="formInline.name" placeholder="例如 尿不湿" />
        </el-form-item> -->

        <el-form-item>
          <el-button type="primary" @click="onSubmit('formInline')">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="dialogFormVisible = true">添加记录</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div>
      <!-- <el-button @click="clearFilter">清除所有过滤器</el-button> -->
      <el-table ref="filterTable" :data="tableData" style="width: 100%">
        <el-table-column prop="sleep_time" label="时间点" column-key="sleep_time" />

        <el-table-column prop="status" label="状态"
          :filters="[{ text: '醒着', value: '醒着' }, { text: '熟睡', value: '熟睡' }, { text: '哼唧', value: '哼唧' }, { text: '开心', value: '开心' }, { text: '普通', value: '普通' }, { text: '难过', value: '难过' }, { text: '其他', value: '其他' }]"
          :filter-method="filterTag" filter-placement="bottom-end">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === '醒着' ? 'primary' : 'success'" disable-transitions>{{
              scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="持续时间" />


      </el-table>
      <el-pagination background layout="prev, pager, next" :total="pageInfo.totalPage" :page-sizes="pageSizes"
        :page-size="pageInfo.pageSize" :current-page.sync="pageInfo.currentPage"
        @current-change="handleCurrentChange" />
    </div>
    <!-- modal 框 -->
    <div>
      <el-dialog title="睡眠记录" :visible.sync="dialogFormVisible" width="80%" destroy-on-close>
        <el-form :model="sleepForm" :label-width="formLabelWidth">
          <el-form-item label="时间点" required>

            <el-time-picker v-model="sleepForm.sleep_time"  placeholder="时间点">
            </el-time-picker>
          </el-form-item>

          <el-form-item label="状态" required :label-width="formLabelWidth">
            <el-select v-model="sleepForm.status" placeholder="状态">
              <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>

          </el-form-item>

        </el-form>

        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="addSleepEvent">确 定</el-button>
        </div>
      </el-dialog>
    </div>

  </div>
</template>

<script>
import {
  addSleepReq, showSleepListReq
} from '@/api/baby'

export default {
  name: 'BabySleep',
  components: {

  },

  data() {
    return {
      sleepForm: {
        sleep_time: this.moment().format('YYYY-MM-DD HH:mm:ss'),
        status: '熟睡',

      },

      statusOptions: [{
        value: '醒着',
        label: '醒着'
      }, {
        value: '熟睡',
        label: '熟睡'
      }, {
        value: '哼唧',
        label: '哼唧'
      },
      {
        value: '开心',
        label: '开心'
      }, 
      {
        value: '普通',
        label: '普通'
      }, 
      {
        value: '难过',
        label: '难过'
      }, 
      {
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

      formInline: {
        date: this.moment().format('YYYY-MM-DD'),

      },
      tableData: [],



      rules: {

        date: [
          { required: true, message: '请选择查询日期', trigger: 'change' }
        ]
      }

    }
  },
  mounted() {

  },

  created() {
    this.onSubmit('formInline')

  },

  destroyed() {

  },

  methods: {

    onSubmit(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          const data = { ...this.pageInfo, ...this.formInline }
          console.log('--------data----', data)
          showSleepListReq(data).then(res => {
            if (res.code === 200) {
              console.log('res data', res.data)
              this.tableData = res.data
            }
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
      console.log('submit!')
      console.log(this.formInline)
    },

    addSleepEvent() {
      const data = this.sleepForm
      console.log('sleepForm data ', data)
      addSleepReq(data).then((res) => {
        console.log('res')
        if (res.code === 200) {
          this.tableData = res.data
          this.dialogFormVisible = false
        }
      })
    },

    handleCurrentChange(val) {
      console.log(`当前页: ${val}`)
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
