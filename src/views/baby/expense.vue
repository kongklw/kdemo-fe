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
        <el-upload class="upload-demo inline-block" ref="upload" multiple action="" :http-request="upload"
          :on-preview="handlePreview" :on-remove="handleRemove" :file-list="fileList" list-type="picture">
          <el-button slot="trigger" size="small" type="primary">点击上传</el-button>
          <el-button style="margin-left: 10px;" size="small" type="primary" @click="batchProcess">批量AI处理</el-button>
          <el-button style="margin-left: 20px;" size="small" type="primary"
            @click="dialogFormVisible = true">单个添加</el-button>
          <!-- <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div> -->
        </el-upload>
      </div>

      <div class="batch-process">
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
            <el-button style="margin-left: 10px;" size="small" type="danger" @click="batchDelete">批量删除</el-button>
          </el-form-item>


        </el-form>
      </div>
    </div>
    <div>
      <!-- <el-button @click="clearFilter">清除所有过滤器</el-button> -->
      <el-table ref="filterTable" @selection-change="handleSelectionChange" :data="tableData" style="width: 100%">
        <el-table-column type="selection" prop="id" min-width="30px">
        </el-table-column>
        <el-table-column prop="order_time" min-width="80px" label="消费日期" column-key="date" />
        <el-table-column prop="name" min-width="80px" label="物品名称" />
        <el-table-column prop="amount" min-width="70px" label="金额" :formatter="formatter" />
        <el-table-column prop="tag" min-width="70px" label="标签">
          <template slot-scope="scope">
            <el-tag type="success">{{
              scope.row.tag }}</el-tag>
          </template>
        </el-table-column>
        <!-- <el-table-column prop="tag" min-width="80px" label="标签"
          :filters="[{ text: '家', value: '家' }, { text: '公司', value: '公司' }]" :filter-method="filterTag"
          filter-placement="bottom-end">
          <template slot-scope="scope">
            <el-tag :type="scope.row.tag === '家' ? 'primary' : 'success'" disable-transitions>{{
              scope.row.tag }}</el-tag>
          </template>
        </el-table-column> -->

        <el-table-column prop="image_url" min-width="200px" label="图片">
          <template slot-scope="scope">
            <el-image style="width: 100px; height: 100px" :preview-src-list="[getImageUrl(scope.row)]"
              :src="getImageUrl(scope.row)" fit="scale-down" lazy></el-image>
          </template>

        </el-table-column>


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
  addExpenseReq, showExpenseListReq, uploadExpenseFile, batchProcessExpenseReq, batchDeleteExpenseReq
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
        monthrange: [this.moment().subtract(2, 'months').startOf().format('YYYY-MM-DD'), this.moment().format('YYYY-MM-DD')],
        name: ''
      },
      tableData: [],
      multipleSelection: [],

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

    getImageUrl(row) {
   
      // const url =this.$BASE_API+"/media/"+row.image_url
      const url = this.$BASE_API + "/media/expense1.png"
    
      return url
    },

    batchProcess() {
      const loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });

    
      const data = { 'fileList': this.myFileList }
      batchProcessExpenseReq(data).then(res => {
        if (res.code === 200) {
        
          loading.close();
          // alert('batch process successful')
          this.fileList = []
          this.myFileList = []

          this.showExpenseList()

        }
      }).catch(err => {
        loading.close();
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
      ));
      this.multipleSelection = idsArray;
    
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
      const data = this.expenseForm
    
      addExpenseReq(data).then((res) => {
       
        if (res.code === 200) {
          this.tableData = res.data
          this.dialogFormVisible = false
        }
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
</style>
