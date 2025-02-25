<template>
  <div class="dashboard-editor-container">

    <div class="top-tab">

      <el-tabs type="border-card" v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="成长记录" name="first">

          <el-collapse v-model="logActiveName" accordion>
            <el-collapse-item v-for="item in tableData" :name="item.id">
              <template slot="title">
                {{ item.title }} &nbsp;&nbsp;&nbsp;&nbsp; {{ item.created_time }}
              </template>
              <div>{{ item.content }}</div>

            </el-collapse-item>

          </el-collapse>

        </el-tab-pane>

        <el-tab-pane label="添加记录" name="second">
          <div>
            <el-form ref="growingForm" label-position="top" :model="growingForm">
              <el-row :gutter="5">
                <el-col :xs="{ span: 12 }" :sm="{ span: 12 }" :md="{ span: 12 }" :lg="{ span: 4 }" :xl="{ span: 4 }">
                  <el-form-item label="文章标题" required prop="title">
                    <el-input v-model="growingForm.title"></el-input>
                  </el-form-item>
                </el-col>

                <el-col :xs="{ span: 24 }" :sm="{ span: 12 }" :md="{ span: 12 }" :lg="{ span: 10 }" :xl="{ span: 12 }">
                  <el-form-item label="文章内容" required prop="content">

                    <el-input type="textarea" autosize v-model="growingForm.content"></el-input>
                  </el-form-item>

                </el-col>

                <el-col :xs="{ span: 24 }" :sm="{ span: 12 }" :md="{ span: 12 }" :lg="{ span: 4 }" :xl="{ span: 2 }"
                  :offset="2">
                  <el-form-item>
                    <el-button type="primary" @click="dialogVisible = true">AI帮写</el-button>
                    <el-button type="primary" @click="addEvent">添加记录</el-button>
                    <el-button @click="resetForm('growingForm')">重置</el-button>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </div>
        </el-tab-pane>

      </el-tabs>
    </div>

    <div>
      <el-dialog title="AI 帮写" :visible.sync="dialogVisible" width="100%" :before-close="handleClose">
        <span>
          <el-form label-position="top" :model="growingAIForm">
            <el-row :gutter="5">

              <el-col :xs="{ span: 24 }" :sm="{ span: 12 }" :md="{ span: 12 }" :lg="{ span: 10 }" :xl="{ span: 12 }">
                <el-form-item required label="提示词">
                  <el-input type="textarea" autosize v-model="growingAIForm.content"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>

        </span>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="aiGenEvent">确 定</el-button>
        </span>
      </el-dialog>

    </div>
  </div>
</template>

<script>
import {
  addGrowingReq, showGrowingListReq, geneContentReq
} from '@/api/baby'

export default {
  name: 'BabySleep',
  components: {

  },

  data() {
    return {
      activeName: 'first',
      logActiveName: '1',
      fullscreenLoading: false,
      dialogVisible: false,


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

      growingForm: {
        title: '',
        content: ''

      },

      growingAIForm: {
        content: "",
      },


      tableData: [],


    }
  },
  mounted() {
  },

  created() {
    this.showGrowingList()
  },

  destroyed() {

  },

  methods: {

    handleClose(done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          done();
        })
        .catch(_ => { });
    },

    aiGenEvent() {
      this.dialogVisible = false
      const data = this.growingAIForm
      const loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });


      geneContentReq(data).then((res) => {

        if (res.code === 200) {
          console.log(res.data)
          this.growingForm = res.data
          loading.close();

        } else {
          loading.close();
        }
      })

    },

    handleClick(tab, event) {
      console.log(tab, event);
    },

    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    // 获取光标位置
    handleInputBlur(e) {
      this.cursorIndex = e.srcElement.selectionStart;
    },

    btnClick(label) {
      // 将文本内容在光标位置进行拆分
      const txt = this.growingForm.content;
      const start = txt.substring(0, this.cursorIndex);
      const end = txt.substring(this.cursorIndex, txt.length);

      // 插入关键词
      this.growingForm.content = start + `#${label} ` + end;

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

    showGrowingList() {
      const data = { ...this.pageInfo, ...this.formInline }
      console.log('--------data----', data)
      showGrowingListReq().then(res => {
        if (res.code === 200) {
          console.log('data', res.data)
          this.tableData = res.data
        }
      })

    },

    onSubmit(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {

          this.showGrowingList()

        } else {
          console.log('error submit!!')
          return false
        }
      })

    },

    addEvent() {
      const data = this.growingForm

      addGrowingReq(data).then((res) => {

        if (res.code === 200) {
          this.resetForm("growingForm")
          this.activeName = "first"

          this.tableData = res.data
          this.showGrowingList()
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
.top-tab {
  margin: 10px 0px 20px 0px;
  padding: 0px;
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

.add-growing {
  margin: 10px 0px 20px 0px;
  padding: 0px;
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
