<template>
  <div class="dashboard-editor-container">

    <!-- 查询form -->
    <div>

      <div>

        <el-upload class="upload-demo inline-block" ref="upload" action="" :http-request="upload"
          :on-preview="handlePreview" :on-remove="handleRemove" :file-list="fileList" list-type="picture">

          <el-button slot="trigger" size="small" type="primary">点击上传</el-button>
          <el-button style="margin-left: 10px;" size="small" type="success" @click="batchProcess">批量处理</el-button>
          <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
        </el-upload>

      </div>

      <el-form ref="formInline" :rules="rules" :inline="true" :model="formInline" class="demo-form-inline">
        <el-form-item label="月份" prop="monthrange" required>

          <el-date-picker v-model="formInline.monthrange" type="monthrange" align="right" unlink-panels
            range-separator="至" start-placeholder="开始月份" end-placeholder="结束月份" :picker-options="pickerOptions"
            value-format="yyyy-MM-dd" />
        </el-form-item>
        <el-form-item label="物品名称" prop="name">
          <el-input v-model="formInline.name" placeholder="例如 尿不湿" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="onSubmit('formInline')">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="dialogFormVisible = true">添加记录</el-button>
        </el-form-item>

        <el-form-item>
          <el-button style="margin-left: 10px;" size="small" type="success" @click="batchProcess">批量处理</el-button>
        </el-form-item>


      </el-form>
    </div>
    <div>
      <!-- <el-button @click="clearFilter">清除所有过滤器</el-button> -->
      <el-table ref="filterTable" :data="tableData" style="width: 100%">
        <el-table-column prop="create_time" label="消费日期" column-key="date" />
        <el-table-column prop="name" label="物品名称" />
        <el-table-column prop="amount" label="金额" :formatter="formatter" />
        <el-table-column prop="tag" label="标签" :filters="[{ text: '家', value: '家' }, { text: '公司', value: '公司' }]"
          :filter-method="filterTag" filter-placement="bottom-end">
          <template slot-scope="scope">
            <el-tag :type="scope.row.tag === '家' ? 'primary' : 'success'" disable-transitions>{{
              scope.row.tag }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="image_url" label="图片地址" />

      </el-table>
      <el-pagination background layout="prev, pager, next" :total="pageInfo.totalPage" :page-sizes="pageSizes"
        :page-size="pageInfo.pageSize" :current-page.sync="pageInfo.currentPage"
        @current-change="handleCurrentChange" />
    </div>
    <!-- modal 框 -->
    <div>
      <el-dialog title="购买记录" :visible.sync="dialogFormVisible" width="80%" destroy-on-close>
        <el-form :model="expenseForm" :label-width="formLabelWidth">
          <el-form-item label="购买日期" required>
            <el-date-picker v-model="expenseForm.order_time" type="date" placeholder="选择日期" align="left"
              value-format="yyyy-MM-dd" :default-value="new Date()" style="width: 100%;" />
          </el-form-item>
          <el-form-item label="名称" :label-width="formLabelWidth">
            <el-input v-model="expenseForm.name" autocomplete="off" />
          </el-form-item>

          <el-form-item label="标签" :label-width="formLabelWidth">
            <el-select v-model="expenseForm.tag" placeholder="请选择标签分类">
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
  addExpenseReq, showExpenseListReq, uploadExpenseFile, batchProcessExpenseReq
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

      expenseForm: {
        order_time: this.moment().format('YYYY-MM-DD'),
        name: '',
        tag: '',
        amount: 0

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
        value: '其他',
        label: '其他'
      }],
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
        monthrange: [this.moment().subtract(2,'months').startOf().format('YYYY-MM-DD'),this.moment().format('YYYY-MM-DD')],
        name: ''
      },
      tableData: [],

      pickerOptions: {
        shortcuts: [{
          text: '本月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setDate(1)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '今年至今',
          onClick(picker) {
            const end = new Date()
            const start = new Date(new Date().getFullYear(), 0)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '近2个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setMonth(start.getMonth() - 2)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '近3个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setMonth(start.getMonth() - 3)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '近6个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setMonth(start.getMonth() - 6)
            picker.$emit('pick', [start, end])
          }
        },
        {
          text: '近一年',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setMonth(start.getMonth() - 12)
            picker.$emit('pick', [start, end])
          }
        }]
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
  mounted() {

  },

  created() {
    this.showExpenseList()

  },

  destroyed() {

  },

  methods: {

    batchProcess() {
      console.log('batch process', this.myFileList)
      const data = { 'fileList': this.myFileList }
      batchProcessExpenseReq(data).then(res => {
        if (res.code === 200) {
          console.log('success')
          // alert('batch process successful')
          this.fileList = []
          this.myFileList = []
          
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

      // const url = 'http://localhost:8000/file/upload'
      // axios.post(url, formData).then(data => {
      //   console.log('data is ',data)
      //   console.log('上传图片成功')
      // }).catch(response => {
      //   console.log('失败原因',response.message)
      //   console.log('图片上传失败')
      // })
    },

    handleRemove(file, fileList) {
      console.log('remove------', file, fileList);
    },
    handlePreview(file) {
      console.log('hahahah', file);
    },

    showExpenseList() {
      const data = { ...this.pageInfo, ...this.formInline }
      console.log('--------data----', data)
      showExpenseListReq(data).then(res => {
        if (res.code === 200) {
          console.log('res data', res.data)
          this.tableData = res.data
        }
      })
    },

    onSubmit(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.showExpenseList()
        } else {
          console.log('error submit!!')
          return false
        }
      })
      console.log('submit!')
      console.log(this.formInline)
    },

    addExpenseEvent() {
      const data = this.expenseForm
      console.log('expense data ', data)
      addExpenseReq(data).then((res) => {
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
.inline-block {
  display: inline-block;
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
