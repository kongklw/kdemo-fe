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
      <el-card class="box-card" v-for="(card) in todoTableList" :key="card.date">
        <div slot="header" class="clearfix">
          <span>{{ `日期: ${card.date}` }}</span>
        </div>

        <div>
            <el-checkbox v-for="item in card.date_items" :label="item.text" v-model="item.done" 
              :key="item.text"></el-checkbox>
        </div>
      
      </el-card>
    </div>

  </div>
</template>

<script>

import TodoList from './components/TodoList'
import { addTodoListReq, updateTodoListReq, showTodoListReq, deleteTodoListReq, showTodoTableReq } from '@/api/baby'


export default {
  name: 'BabyTodo',
  components: {
    TodoList,

  },

  data() {
    return {
      range_date: { start_date: this.moment().subtract(1, "weeks").format('YYYY-MM-DD'), end_date: this.moment().format('YYYY-MM-DD'), },
      todoTableList: [],
    }
  },
  mounted() {

  },

  created() {
    this.showTodoList()
    this.showTodoTable()
  },

  destroyed() {
    this.clear()
  },

  methods: {

    showTodoTable() {
      showTodoTableReq(this.range_date).then(res => {
        if (res.code === 200) {
          console.log('todo table-----------', res.data)
          this.todoTableList = res.data
        }
      })
    },




    showTodoList() {
      showTodoListReq(this.range_date).then(res => {
        if (res.code === 200) {
          console.log('todo-----------', res.data)
          this.todos = res.data
        }
      })
    },

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
  width: 100%;
  margin-bottom: 10px;
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
