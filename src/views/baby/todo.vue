<template>
  <div class="dashboard-editor-container">
    <div>
      <el-row :gutter="8">
        <el-col :xs="{ span: 24 }" :sm="{ span: 12 }" :md="{ span: 12 }" :lg="{ span: 6 }" :xl="{ span: 6 }"
          style="margin-bottom:30px;">
          <todo-list />
        </el-col>
      </el-row>
    </div>


    <div>
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>卡片名称</span>
          <el-button style="float: right; padding: 3px 0" type="text">操作按钮</el-button>
        </div>
        <div v-for="o in 4" :key="o" class="text item">
          {{ '列表内容 ' + o }}
        </div>
      </el-card>
    </div>

  </div>
</template>

<script>

import TodoList from './components/TodoList'
import {
  feedListReq, addFeedReq, deleteFeedReq,
  lineChartReq,
  addTemperatureReq, temperatureListReq,
  babyPantsListReq, addBabyPantsReq
} from '@/api/baby'


export default {
  name: 'BabyTodo',
  components: {
    TodoList,
  },

  data() {
    return {

    }
  },
  mounted() {

  },

  created() {

  },

  destroyed() {
    this.clear()
  },

  methods: {

  }
}
</script>

<style lang="scss" scoped>
.text {
  font-size: 14px;
}

.item {
  margin-bottom: 18px;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}

.clearfix:after {
  clear: both
}

.box-card {
  width: 480px;
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
</style>
