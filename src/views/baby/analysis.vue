<template>
  <div class="app-container">
    <el-collapse v-model="activeNames" @change="handleChange">
      <el-collapse-item name="1">
        <template slot="title">
          <!-- title="2024/12/21 Milk volume" -->

          <el-tag>2024/12/21</el-tag>

          <el-tag type="success">总奶量</el-tag>

          <el-tag>参考总奶量</el-tag>&nbsp;&nbsp;&nbsp;&nbsp;

          <!-- 选项ad 钙吃了没有选项框 -->
          <el-checkbox
            v-model="checkAll"
            :indeterminate="isIndeterminate"
            @change="handleCheckAllChange"
          >全选</el-checkbox>
          <div style="margin: 15px 0;" />
          <el-checkbox-group v-model="checkedCities" @change="handleCheckedCitiesChange">
            <el-checkbox v-for="city in cities" :key="city" :label="city">{{ city }}</el-checkbox>
          </el-checkbox-group>
          <!-- <el-tag type="info">AD</el-tag>
                    <el-tag type="warning">钙</el-tag>
                    <el-tag type="danger">标签五</el-tag> -->
        </template>

        <el-table :data="tableData" style="width: 100%" :row-class-name="tableRowClassName" border>
          <el-table-column prop="date" label="Feed time" width="180" />
          <el-table-column prop="volume" label="Milk volume" width="180" />
        </el-table>

      </el-collapse-item>

      <el-collapse-item title="反馈 Feedback" name="2">

        <div>控制反馈：通过界面样式和交互动效让用户可以清晰的感知自己的操作；</div>
        <div>页面反馈：操作后，通过页面元素的变化清晰地展现当前状态。</div>
      </el-collapse-item>

      <el-collapse-item title="效率 Efficiency" name="3">
        <div>简化流程：设计简洁直观的操作流程；</div>
        <div>清晰明确：语言表达清晰且表意明确，让用户快速理解进而作出决策；</div>
        <div>帮助用户识别：界面简单直白，让用户快速识别而非回忆，减少用户记忆负担。</div>
      </el-collapse-item>
      <el-collapse-item title="可控 Controllability" name="4">
        <div>用户决策：根据场景可给予用户操作建议或安全提示，但不能代替用户进行决策；</div>
        <div>结果可控：用户可以自由的进行操作，包括撤销、回退和终止当前操作等。</div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<style>
.el-table .warning-row {
    background: oldlace;
}

.el-table .success-row {
    background: #f0f9eb;
}
</style>

<script>
const cityOptions = ['AD', '钙', '益生菌', '大便']

export default {

  data() {
    return {
      activeNames: ['1'],
      tableData: [{
        date: '2016-05-02 12:10',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        date: '2016-05-04',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1517 弄'
      }, {
        date: '2016-05-01',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1519 弄'
      }, {
        date: '2016-05-03',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1516 弄'
      }],

      checkAll: false,
      checkedCities: [],
      cities: cityOptions,
      isIndeterminate: true
    }
  },

  created() {

  },

  methods: {
    handleChange(val) {
      console.log(val)
    },
    tableRowClassName({ row, rowIndex }) {
      if (rowIndex === 1) {
        return 'warning-row'
      } else if (rowIndex === 3) {
        return 'success-row'
      }
      return ''
    },

    handleCheckAllChange(val) {
      this.checkedCities = val ? cityOptions : []
      this.isIndeterminate = false
    },
    handleCheckedCitiesChange(value) {
      const checkedCount = value.length
      this.checkAll = checkedCount === this.cities.length
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.cities.length
    }
  }

}
</script>
