<template>
  <div class="dashboard-editor-container">

    <!-- 查询form -->
    <div>
      <el-form ref="formInline" :rules="rules" :inline="true" :model="formInline" class="demo-form-inline">
        <el-form-item label="日期" prop="date" required>
          <el-date-picker v-model="formInline.date" type="date" value-format="yyyy-MM-dd" placeholder="选择日期">
          </el-date-picker>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="onSubmit('formInline')">查询</el-button>
        </el-form-item>

      </el-form>
    </div>

    <div class="add-sleep">
      <el-form label-position="top" :model="sleepForm" :label-width="formLabelWidth">
        <el-row :gutter="5">
          <el-col :xs="{ span: 12 }" :sm="{ span: 12 }" :md="{ span: 12 }" :lg="{ span: 4 }" :xl="{ span: 4 }">
            <el-form-item label="时间点" required>
              <el-time-picker v-model="sleepForm.sleep_time" value-format="yyyy-MM-dd HH:mm:00" placeholder="时间点">
              </el-time-picker>
            </el-form-item>
          </el-col>

          <el-col :xs="{ span: 12 }" :sm="{ span: 12 }" :md="{ span: 12 }" :lg="{ span: 4 }" :xl="{ span: 4 }">
            <el-form-item label="状态" required :label-width="formLabelWidth">
              <el-select v-model="sleepForm.status" placeholder="状态">
                <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :xs="{ span: 24 }" :sm="{ span: 12 }" :md="{ span: 12 }" :lg="{ span: 10 }" :xl="{ span: 12 }">
            <el-form-item label="睡眠描述">
              <el-input type="textarea" ref="inputWord" v-model="sleepForm.describe" @blur="handleInputBlur"></el-input>
            </el-form-item>
            <div class="main-word">
              <div class="main-word-left">
                <span class="main-word-label">插入动态词包: </span>
                <el-button v-for="n in commonWordList" :key="n.creativeWordId" class="button-word" type="text"
                  @click="btnClick(n.name)">#{{ n.name }}</el-button>
              </div>
            </div>
          </el-col>

          <el-col :xs="{ span: 24 }" :sm="{ span: 12 }" :md="{ span: 12 }" :lg="{ span: 4 }" :xl="{ span: 2 }"
            :offset="2">
            <el-form-item>
              <el-button type="primary" @click="addSleepEvent">添加记录</el-button>
            </el-form-item>
          </el-col>


        </el-row>





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

        <el-table-column prop="describe" label="描述" />
        <el-table-column prop="amount" label="持续时间" />

      </el-table>
      <el-pagination background layout="prev, pager, next" :total="pageInfo.totalPage" :page-sizes="pageSizes"
        :page-size="pageInfo.pageSize" :current-page.sync="pageInfo.currentPage"
        @current-change="handleCurrentChange" />
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
      commonWordList: [
        { name: "喂水", creativeWordId: 1 },
        { name: "喂奶", creativeWordId: 2 },
        { name: "翻身", creativeWordId: 3 },
        { name: "轻拍", creativeWordId: 4 },
        { name: "奶嘴安抚", creativeWordId: 5 },
        { name: "哼唧", creativeWordId: 6 },
        { name: "侧漏", creativeWordId: 7 },
        { name: "梦哭", creativeWordId: 8 },
        { name: "梦笑", creativeWordId: 9 },

      ],
      cursorIndex: "", // 光标位置

      sleepForm: {
        sleep_time: this.moment().format('YYYY-MM-DD HH:mm:00'),
        
        status: '熟睡',
        describe: ''

      },
      statusOptions: [{
        value: '醒着',
        label: '醒着'
      }, {
        value: '熟睡',
        label: '熟睡'
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
    this.showSleepList()
  },

  destroyed() {

  },

  methods: {
    // 获取光标位置
    handleInputBlur(e) {
      this.cursorIndex = e.srcElement.selectionStart;
    },

    btnClick(label) {
      // 将文本内容在光标位置进行拆分
      const txt = this.sleepForm.describe;
      const start = txt.substring(0, this.cursorIndex);
      const end = txt.substring(this.cursorIndex, txt.length);

      // 插入关键词
      this.sleepForm.describe = start + `#${label} ` + end;

      // 获取文本框，设置焦点，处理光标位置
      if (this.$refs.inputWord) {
        // this.$refs.inputWord.focus();
        this.$nextTick(() => {
          var a = this.$refs.inputWord.$el.firstElementChild;
          a.focus();
          a.selectionStart = this.cursorIndex + label.length + 2;
          a.selectionEnd = this.cursorIndex + label.length + 2;
        });
      }
    },

    showSleepList() {
      const data = { ...this.pageInfo, ...this.formInline }
      console.log('--------data----', data)
      showSleepListReq(data).then(res => {
        if (res.code === 200) {

          this.tableData = res.data
        }
      })

    },

    onSubmit(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.showSleepList()

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
          this.showSleepList()
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
.add-sleep {
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

.el-row {
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
}

.el-col {
  border-radius: 4px;
}

.bg-purple-dark {
  background: #99a9bf;
}

.bg-purple {
  background: #d3dce6;
}

.bg-purple-light {
  background: #e5e9f2;
}

.grid-content {
  border-radius: 4px;
  min-height: 36px;
}

.row-bg {
  padding: 10px 0;
  background-color: #f9fafc;
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
