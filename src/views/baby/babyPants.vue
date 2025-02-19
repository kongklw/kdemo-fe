<template>
  <div class="dashboard-editor-container">

    <div class="pannel">
      <el-row :gutter="10" class="panel-group">
        <el-col :xs="24" :sm="12" :lg="6" class="card-panel-col">
          <div class="card-panel panel-group">
            <div class="card-panel-icon-wrapper icon-message">
              <svg-icon icon-class="babyPants" class-name="card-panel-icon" />
            </div>
            <div class="card-panel-description">
              <div class="card-panel-text">
                尿不湿
              </div>
              <label class="card-panel-num">{{ babyPantsCount }} 个</label>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="add-babyPants">
      <el-form :model="babyPantsForm" label-position="top" :label-width="formLabelWidth">

        <el-row>
          <el-col :xs="{ span: 24 }" :sm="{ span: 12 }" :md="{ span: 12 }" :lg="{ span: 6 }" :xl="{ span: 6 }">
            <el-form-item label="更换时间" label-position="left" required>
              <el-date-picker v-model="babyPantsForm.use_date" type="datetime" placeholder="选择日期时间" align="left"
                value-format="yyyy-MM-dd HH:mm:00" />
            </el-form-item>
          </el-col>

          <el-col :xs="{ span: 24 }" :sm="{ span: 12 }" :md="{ span: 12 }" :lg="{ span: 6 }" :xl="{ span: 6 }">

            <el-form-item label="侧漏" :label-width="formLabelWidth">
              <el-radio-group v-model="babyPantsForm.is_leaked">
                <el-radio :label="true">是</el-radio>
                <el-radio :label="false">否</el-radio>
              </el-radio-group>

            </el-form-item>
          </el-col>


          <el-col :xs="{ span: 24 }" :sm="{ span: 12 }" :md="{ span: 12 }" :lg="{ span: 12 }" :xl="{ span: 12 }">
            <el-form-item :label-width="formLabelWidth">
              <template slot="label">
                <label for="">品牌 <el-button type="text" @click="openAddBrandModel"
                    class="btn-word">+</el-button></label>
              </template>
              <el-radio-group v-model="babyPantsForm.brand">
                <el-radio v-for="item in babyPantsoptions" :key="item.value" :label="item.label">{{ item.value
                  }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>


        </el-row>

        <el-form-item label-position="top" label="尿布状态" required>
          <el-tabs type="border-card" v-model="babyPantsForm.tabActiveName" @tab-click="handleTabClick">
            <el-tab-pane name="peeing">
              <span slot="label"><svg-icon icon-class="peeing" /> 嘘嘘</span>
              <el-form-item label="嘘嘘颜色" required>
                <el-radio-group v-model="babyPantsForm.peeing_color">
                  <el-radio v-for="item in peeingColorOptions" :key="item.value" :label="item.label">{{ item.value
                    }}</el-radio>

                </el-radio-group>
              </el-form-item>


            </el-tab-pane>

            <el-tab-pane name="stool">
              <span slot="label"><svg-icon icon-class="stool" /> 便便</span>
              <el-form-item label="便便形状(多选)" required>


                <el-checkbox-group v-model="babyPantsForm.stool_shape_list">
                  <el-checkbox v-for="item in stoolShapeOptions" :key="item.value" :label="item.label">{{ item.value }}</el-checkbox>
                </el-checkbox-group>

                <!-- <el-radio-group v-model="babyPantsForm.stool_shape">
                  <el-radio v-for="item in stoolShapeOptions" :key="item.value" :label="item.label">{{ item.value
                    }}</el-radio>
                </el-radio-group> -->

              </el-form-item>

              <el-form-item label="便便颜色(单选)" required>
                <el-radio-group v-model="babyPantsForm.stool_color">
                  <el-radio v-for="item in stoolColorOptions" :key="item.value" :label="item.label">{{ item.value
                    }}</el-radio>
                </el-radio-group>
              </el-form-item>

            </el-tab-pane>

            <el-tab-pane name="peeing-stool">
              <span slot="label"><svg-icon icon-class="peeing-stool" /> 嘘嘘+便便</span>

              <el-form-item label="嘘嘘颜色(单选)" required>

                <el-radio-group v-model="babyPantsForm.peeing_color">
                  <el-radio v-for="item in peeingColorOptions" :key="item.label" :label="item.label">{{ item.value
                    }}</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="便便形状(多选)" required>

                <el-checkbox-group v-model="babyPantsForm.stool_shape_list">
                  <el-checkbox v-for="item in stoolShapeOptions" :key="item.value" :label="item.label">{{ item.value }}</el-checkbox>
                </el-checkbox-group>

                <!-- <el-radio-group v-model="babyPantsForm.stool_shape">
                  <el-radio v-for="item in stoolShapeOptions" :key="item.value" :label="item.label">{{ item.value
                    }}</el-radio>
                </el-radio-group> -->
              </el-form-item>

              <el-form-item label="便便颜色(单选)" required>
                <el-radio-group v-model="babyPantsForm.stool_color">
                  <el-radio v-for="item in stoolColorOptions" :key="item.value" :label="item.label">{{ item.value
                    }}</el-radio>

                </el-radio-group>
              </el-form-item>

            </el-tab-pane>

            <el-tab-pane name="dry">
              <span slot="label"><svg-icon icon-class="babyPants" /> 干爽</span>
            </el-tab-pane>
          </el-tabs>
        </el-form-item>

        <el-form-item label="添加备注">
          <el-input type="textarea" ref="inputWord" v-model="babyPantsForm.describe"></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="addRecordEventvent">添加记录</el-button>
        </el-form-item>

      </el-form>
    </div>

    <!-- 查询form -->
    <div class="query-babyPants">
      <el-form ref="formInline" :rules="rules" :inline="true" :model="formInline" class="demo-form-inline">
        <el-form-item label="日期">
          <el-date-picker v-model="formInline.use_date" type="date" value-format="yyyy-MM-dd" placeholder="选择日期">
          </el-date-picker>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="onSubmit('formInline')">查询</el-button>
        </el-form-item>

      </el-form>
    </div>


    <div>
      <el-table ref="filterTable" :data="tableData" style="width: 100%">
        <el-table-column prop="use_date" label="更换时间" min-width="100" />
        <el-table-column prop="status" label="状态" min-width="100" />
        <el-table-column prop="peeing" label="嘘嘘" />
        <el-table-column prop="stool" label="大便" />
        <el-table-column prop="describe" label="描述" />
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
  addBabyPantsReq, babyPantsListReq, deleteBabyPantsReq
} from '@/api/baby'

export default {
  name: 'BabyPants',
  components: {

  },

  data() {
    return {

      babyPantsForm: {
        use_date: this.moment().format('YYYY-MM-DD HH:mm:00'),
        peeing_color: "正常",
        describe: '',
        // stool_shape: 1,
        stool_shape_list:['膏状'],
        stool_color: "黄色",
        is_leaked: false,
        brand: 'whatever',
        tabActiveName: "peeing",

      },

      formInline: {
        use_date: this.moment().format('YYYY-MM-DD'),
        start_date: this.moment().subtract(1, "month").format('YYYY-MM-DD'),

      },

      peeingColorOptions: [{
        value: '乳白色',
        label: '乳白色'
      }, {
        value: '粉色',
        label: '粉色'
      }, {
        value: '正常',
        label: '正常'
      }, {
        value: '黄色',
        label: '黄色'
      }, {
        value: '红色',
        label: '红色'
      },
      {
        value: '浓茶色',
        label: '浓茶色'
      }],



      stoolColorOptions: [{
        value: '墨绿色',
        label:'墨绿色',
      }, {
        value: '绿色',
        label: '绿色',
      }, {
        value: '黄色',
        label: '黄色',
      }, {
        value: '棕色',
        label: '棕色',
      }, {
        value: '红色',
        label: '红色',
      },
      {
        value: '黑色',
        label:'黑色',
      }, {
        value: '灰白色',
        label:'灰白色',
      }],


      stoolShapeOptions: [{
        value: '膏状',
        label: '膏状',
      }, {
        value: '泡沫样',
        label:'泡沫样',
      }, {
        value: '有奶瓣',
        label: '有奶瓣',
      }, {
        value: '有食物残渣',
        label: '有食物残渣',
      }, {
        value: '蛋花样',
        label:'蛋花样',
      },
      {
        value: '水样便',
        label: '水样便',
      }, {
        value: '羊屎便',
        label: '羊屎便',
      },
      {
        value: '含血便',
        label: '含血便',
      }],
      babyPantsoptions: [{
        value: 'whatever',
        label: 'whatever'
      }, {
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

      babyPantsCount: 0,
      formLabelWidth: '80px',
      pageSizes: [20, 50, 100],
      pageInfo: {
        totalPage: 100,
        currentPage: 1,
        pageSize: 20
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

    openAddBrandModel() {
      console.log('data')

    },

    handleTabClick(tab, event) {
      // console.log(tab, event);
      console.log(tab.name)

    },


    open(row) {
      this.$confirm(`您将删除: ${row.use_date}  尿不湿状态: ${row.status} 的记录, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {

        deleteBabyPantsReq(row).then(res => {

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

    showRecordList() {
      const data = { ...this.pageInfo, ...this.formInline }

      babyPantsListReq(data).then(res => {
        if (res.code === 200) {

          const data = res.data
          console.log(data)
          this.tableData = data.status_list
          this.babyPantsCount = data.babyPantsCount
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
      const data = this.babyPantsForm

      addBabyPantsReq(data).then((res) => {

        if (res.code === 200) {
          console.log(res.data)
          // this.tableData = res.data
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
.btn-word {
  font-size: large;
  color: #f4516c;
  font-weight: bold;
  margin-left: 10px;

}

.query-babyPants {
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

.add-babyPants {
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
