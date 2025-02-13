<template>
  <div class="dashboard-editor-container">

    <div class="pannel">
      <el-row :gutter="10" class="panel-group">
        <el-col :xs="24" :sm="12" :lg="6" class="card-panel-col">
          <div class="card-panel panel-group">
            <div class="card-panel-icon-wrapper icon-message">
              <svg-icon icon-class="bodyTemperature" class-name="card-panel-icon" />
            </div>
            <div class="card-panel-description">
              <div class="card-panel-text">
                今日体温
              </div>
              <label class="card-panel-num">{{ temperature }} 度</label>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="add-temperature">
      <el-form label-position="left" :model="temperatureForm" :label-width="formLabelWidth" :inline="true">

        <el-form-item label="测量日期" required>
          <el-date-picker v-model="temperatureForm.measure_date" type="date" placeholder="选择日期"
            value-format="yyyy-MM-dd" style="width: 100%;" />
        </el-form-item>

        <el-form-item label="体温" required>

          <el-input-number v-model="temperatureForm.temperature" :step="0.1" :min="35" :max="40"
            label="体温"></el-input-number>

        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="addRecordEventvent">添加记录</el-button>
        </el-form-item>

      </el-form>
    </div>

    <!-- 查询form -->
    <div class="query-temperature">
      <el-form ref="formInline" :rules="rules" :inline="true" :model="formInline" class="demo-form-inline">
        <el-form-item label="日期" prop="measure_date" required>
          <el-date-picker v-model="formInline.measure_date" type="date" value-format="yyyy-MM-dd" placeholder="选择日期">
          </el-date-picker>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="onSubmit('formInline')">查询</el-button>
        </el-form-item>

      </el-form>
    </div>


    <div>
      <!-- <el-button @click="clearFilter">清除所有过滤器</el-button> -->
      <el-table ref="filterTable" :data="tableData" style="width: 100%">
        <el-table-column prop="measure_date" label="测量时间" min-width="100" column-key="measure_date" />
        <el-table-column prop="temperature" label="体温" />
        <el-table-column prop="status" label="状态" />
        <el-table-column label="操作" min-width="80">
          <template slot-scope="scope">
            <el-button type="danger" size="mini" @click="open(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background layout="prev, pager, next" :total="pageInfo.totalPage" :page-sizes="pageSizes"
        :page-size="pageInfo.pageSize" :current-page.sync="pageInfo.currentPage"
        @current-change="handleCurrentChange" />
    </div>


  </div>
</template>

<script>
import {
  addTemperatureReq, temperatureListReq,deleteTemperatureReq
} from '@/api/baby'

export default {
  name: 'BabyTemperature',
  components: {

  },

  data() {
    return {

      temperatureForm: {
        measure_date: this.moment().format('YYYY-MM-DD'),
        temperature: 36.5
      },
      temperature: "36.4",
      formLabelWidth: '80px',
      pageSizes: [20, 50, 100],
      pageInfo: {
        totalPage: 100,
        currentPage: 1,
        pageSize: 20
      },
      formInline: {
        end_date: this.moment().format('YYYY-MM-DD'),
        start_date: this.moment().subtract(1, "month").format('YYYY-MM-DD'),

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
    this.showRecordList()
  },

  destroyed() {

  },

  methods: {


    open(row) {
      this.$confirm(`你将删除时间为${row.measure_date} 体温为 ${row.temperature}的体温记录, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {

        deleteTemperatureReq(row).then(res => {
       
          if (res.code === 200) {
            this.showRecordList()
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



    // 获取光标位置
    handleInputBlur(e) {
      this.cursorIndex = e.srcElement.selectionStart;
    },

    btnClick(label) {
      // 将文本内容在光标位置进行拆分
      const txt = this.temperatureForm.describe;
      const start = txt.substring(0, this.cursorIndex);
      const end = txt.substring(this.cursorIndex, txt.length);

      // 插入关键词
      this.temperatureForm.describe = start + `#${label} ` + end;

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

    showRecordList() {
      const data = { ...this.pageInfo, ...this.formInline }
    
      temperatureListReq(data).then(res => {
        if (res.code === 200) {
       
          const data = res.data
          this.tableData = data.temperature_list
          this.temperature = data.current_temperature
        }
      })

    },

    onSubmit(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.showRecordList()

        } else {
        
          return false
        }
      })
   
   
    },

    addRecordEventvent() {
      const data = this.temperatureForm
    
      addTemperatureReq(data).then((res) => {
     
        if (res.code === 200) {
          this.tableData = res.data
          this.showRecordList()
        }
      })
    },

    handleCurrentChange(val) {
      // console.log(`当前页: ${val}`)
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
.query-temperature {
  margin: 10px 0px 10px 0px;
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

.add-temperature {
  margin: 10px 0px 10px 0px;
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
