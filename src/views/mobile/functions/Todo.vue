<template>
  <div class="mobile-todo">
    <van-nav-bar
      title="宝宝待办"
      left-text="返回"
      left-arrow
      fixed
      placeholder
      @click-left="onClickLeft"
    />

    <van-tabs v-model="activeTab" sticky offset-top="46px" color="#ff976a">
      <!-- Today's Todo -->
      <van-tab title="今日任务">
        <div class="todo-container">

          <!-- Daily Habits Section -->
          <div class="section-title">
            <span>每日必做</span>
            <div class="right-actions">
              <span class="progress-text">{{ completedHabits }}/{{ dailyHabits.length }}</span>
              <van-icon name="setting-o" class="setting-icon" @click="openHabitManager" />
            </div>
          </div>
          <div class="progress-bar-container">
            <van-progress :percentage="habitProgress" stroke-width="8" color="#ff976a" track-color="#f5f5f5" :show-pivot="false" />
          </div>

          <div class="habits-grid">
            <div
              v-for="habit in dailyHabits"
              :key="habit.id"
              class="habit-item"
              :class="{ 'habit-done': habit.done }"
              @click="toggleHabit(habit)"
            >
              <div class="habit-icon-wrapper">
                <van-icon :name="getIcon(habit.icon)" class="habit-icon" />
              </div>
              <span class="habit-text">{{ habit.text }}</span>
              <van-icon v-if="habit.done" name="success" class="check-mark" />
            </div>
          </div>

          <van-divider />

          <!-- Other Tasks Section -->
          <div class="section-title">
            <span>临时待办</span>
          </div>

          <div class="add-task-box">
            <van-field
              v-model="newTodoText"
              placeholder="添加临时任务..."
              right-icon="plus"
              class="add-input"
              @click-right="onAddTodo"
              @keyup.enter="onAddTodo"
            />
          </div>

          <van-list>
            <van-swipe-cell v-for="todo in otherTasks" :key="todo.id" class="task-swipe">
              <van-cell class="task-cell" center>
                <template #icon>
                  <van-checkbox v-model="todo.done" checked-color="#ff976a" @change="onTaskChange(todo)" />
                </template>
                <template #title>
                  <span :class="{ 'task-done-text': todo.done }" class="task-text">{{ todo.text }}</span>
                </template>
              </van-cell>
              <template #right>
                <van-button square text="删除" type="danger" class="delete-button" @click="onDeleteTodo(todo)" />
              </template>
            </van-swipe-cell>
          </van-list>

          <van-empty v-if="otherTasks.length === 0" description="暂无临时任务" image="search" />

        </div>
      </van-tab>

      <!-- History -->
      <van-tab title="历史记录">
        <div class="history-container">
          <van-collapse v-model="historyActiveNames" accordion>
            <van-collapse-item
              v-for="(card, index) in todoTableList"
              :key="index"
              :name="index"
            >
              <template #title>
                <div class="history-title">
                  <span>{{ card.date }}</span>
                  <span class="history-count">完成 {{ getCompletedCount(card.date_items) }}/{{ card.date_items.length }}</span>
                </div>
              </template>
              <div class="history-list">
                <div v-for="(item, i) in card.date_items" :key="i" class="history-item">
                  <van-icon :name="item.done ? 'checked' : 'circle'" :color="item.done ? '#07c160' : '#ccc'" />
                  <span :class="{ 'text-done': item.done }">{{ item.text }}</span>
                  <van-tag v-if="item.is_daily" type="warning" plain size="mini" style="margin-left: 5px">日常</van-tag>
                </div>
              </div>
            </van-collapse-item>
          </van-collapse>
          <van-empty v-if="todoTableList.length === 0" description="暂无历史记录" />
        </div>
      </van-tab>
    </van-tabs>

    <!-- Habit Manager Popup -->
    <van-popup v-model="showHabitManager" position="bottom" :style="{ height: '60%' }" round closeable>
      <div class="habit-manager">
        <div class="popup-title">管理每日习惯</div>

        <div class="add-habit-box">
          <van-field
            v-model="newHabitText"
            placeholder="输入习惯名称 (如: 喝水)"
            right-icon="plus"
            @click-right="addHabit"
            @keyup.enter="addHabit"
          />
        </div>

        <div class="habit-list-container">
          <van-cell-group>
            <van-swipe-cell v-for="habit in habitList" :key="habit.id">
              <van-cell :title="habit.text">
                <template #right-icon>
                  <van-icon :name="getIcon(habit.icon)" />
                </template>
              </van-cell>
              <template #right>
                <van-button square text="停用" type="danger" class="delete-button" @click="deleteHabit(habit)" />
              </template>
            </van-swipe-cell>
          </van-cell-group>
          <van-empty v-if="habitList.length === 0" description="暂无习惯，请添加" />
        </div>
        <div class="popup-footer">
          <div class="tip">注意：修改习惯仅影响明日及以后的任务生成</div>
        </div>
      </div>
    </van-popup>

  </div>
</template>

<script>
import {
  addTodoListReq,
  updateTodoListReq,
  showTodoListReq,
  deleteTodoListReq,
  showTodoTableReq,
  getDailyHabitReq,
  addDailyHabitReq,
  updateDailyHabitReq
} from '@/api/baby'
import { Toast, Dialog } from 'vant'

export default {
  name: 'MobileTodo',
  data() {
    return {
      activeTab: 0,
      newTodoText: '',
      allTodos: [],

      historyActiveNames: ['0'],
      todoTableList: [],

      // Habit Manager
      showHabitManager: false,
      habitList: [],
      newHabitText: '',

      range_date: {
        start_date: this.moment().subtract(1, 'weeks').format('YYYY-MM-DD'),
        end_date: this.moment().format('YYYY-MM-DD')
      },
      today_date: {
        start_date: this.moment().format('YYYY-MM-DD'),
        end_date: this.moment().format('YYYY-MM-DD')
      }
    }
  },
  computed: {
    dailyHabits() {
      return this.allTodos.filter(t => t.is_daily)
    },
    otherTasks() {
      return this.allTodos.filter(t => !t.is_daily)
    },
    completedHabits() {
      return this.dailyHabits.filter(t => t.done).length
    },
    habitProgress() {
      if (this.dailyHabits.length === 0) return 0
      return (this.completedHabits / this.dailyHabits.length) * 100
    }
  },
  created() {
    this.loadTodos()
    this.loadHistory()
  },
  methods: {
    onClickLeft() {
      this.$router.back()
    },
    getIcon(iconName) {
      if (!iconName) return 'star-o'
      const map = {
        'medication': 'bag-o',
        'book': 'orders-o',
        'cube': 'cube-o',
        'flower-o': 'flower-o',
        'smile-o': 'smile-o',
        'hot-o': 'hot-o',
        'like-o': 'like-o',
        'location-o': 'location-o'
      }
      return map[iconName] || iconName
    },
    loadTodos() {
      Toast.loading({ forbidClick: true, duration: 0 })
      showTodoListReq(this.today_date).then(res => {
        Toast.clear()
        if (res.code === 200) {
          this.allTodos = res.data
        }
      }).catch(() => Toast.clear())
    },
    loadHistory() {
      showTodoTableReq(this.range_date).then(res => {
        if (res.code === 200) {
          this.todoTableList = res.data
        }
      })
    },

    // Habit Manager Methods
    openHabitManager() {
      this.showHabitManager = true
      this.loadHabits()
    },
    loadHabits() {
      getDailyHabitReq().then(res => {
        if (res.code === 200) {
          this.habitList = res.data
        }
      })
    },
    addHabit() {
      const text = this.newHabitText.trim()
      if (!text) return

      const data = {
        text: text,
        icon: 'star-o', // Default icon
        is_active: true
      }

      addDailyHabitReq(data).then(res => {
        if (res.code === 200) {
          Toast.success('添加成功')
          this.newHabitText = ''
          this.loadHabits()
          this.loadTodos()
        } else {
          Toast.fail(res.msg || '添加失败')
        }
      })
    },
    deleteHabit(habit) {
      // Soft delete or deactivate
      const data = {
        ...habit,
        is_active: false
      }
      // Assuming update endpoint handles updates
      updateDailyHabitReq(data).then(res => {
        if (res.code === 200) {
          Toast.success('已停用')
          this.loadHabits()
          this.loadTodos()
        }
      })
    },

    onAddTodo() {
      const text = this.newTodoText.trim()
      if (!text) return

      const data = {
        text,
        done: false,
        is_daily: false
      }

      addTodoListReq(data).then(res => {
        if (res.code === 200) {
          this.newTodoText = ''
          this.loadTodos()
        }
      })
    },
    onTaskChange(todo) {
      this.updateTodoStatus(todo)
    },
    toggleHabit(habit) {
      habit.done = !habit.done
      this.updateTodoStatus(habit)
    },
    updateTodoStatus(todo) {
      updateTodoListReq(todo).then(res => {
        if (res.code !== 200) {
          // Revert if failed
          todo.done = !todo.done
          Toast.fail('更新失败')
        }
      })
    },
    onDeleteTodo(todo) {
      Dialog.confirm({
        title: '确认删除',
        message: '确定要删除这个任务吗？'
      }).then(() => {
        deleteTodoListReq({ id: todo.id }).then(res => {
          if (res.code === 200) {
            this.loadTodos()
          }
        })
      }).catch(() => {})
    },
    getCompletedCount(items) {
      return items.filter(i => i.done).length
    }
  }
}
</script>

<style scoped>
.mobile-todo {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 20px;
}
.todo-container {
  padding: 16px;
}
.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #323233;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.right-actions {
    display: flex;
    align-items: center;
}
.setting-icon {
    font-size: 18px;
    color: #969799;
    margin-left: 10px;
    padding: 5px;
}
.progress-text {
    font-size: 14px;
    color: #969799;
    font-weight: normal;
}
.progress-bar-container {
    margin-bottom: 20px;
}

.habits-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}
.habit-item {
  background: #fff;
  border-radius: 12px;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
  transition: all 0.2s;
  border: 1px solid transparent;
}
.habit-item:active {
    transform: scale(0.95);
}
.habit-done {
    background: #f0fdf4;
    border-color: #bbf7d0;
}
.habit-icon-wrapper {
  width: 40px;
  height: 40px;
  background: #f5f6f7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}
.habit-done .habit-icon-wrapper {
    background: #dcfce7;
}
.habit-icon {
  font-size: 20px;
  color: #646566;
}
.habit-done .habit-icon {
    color: #16a34a;
}
.habit-text {
  font-size: 12px;
  color: #323233;
  text-align: center;
}
.check-mark {
    position: absolute;
    top: 5px;
    right: 5px;
    color: #16a34a;
    font-size: 12px;
}

.add-task-box {
    margin-bottom: 16px;
}
.add-input {
    border-radius: 8px;
    padding: 10px 16px;
}

.task-cell {
    border-radius: 8px;
    margin-bottom: 8px;
}
.task-text {
    margin-left: 8px;
    font-size: 15px;
}
.task-done-text {
    text-decoration: line-through;
    color: #969799;
}
.delete-button {
    height: 100%;
}

/* History Styles */
.history-container {
    padding: 10px;
}
.history-title {
    display: flex;
    justify-content: space-between;
}
.history-count {
    font-size: 12px;
    color: #969799;
}
.history-list {
    padding: 5px 0;
}
.history-item {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    font-size: 14px;
    color: #323233;
}
.history-item .van-icon {
    margin-right: 8px;
    font-size: 16px;
}
.text-done {
    color: #969799;
    text-decoration: line-through;
}

/* Popup Styles */
.habit-manager {
    padding: 20px 16px;
    height: 100%;
    display: flex;
    flex-direction: column;
}
.popup-title {
    font-size: 18px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 20px;
}
.add-habit-box {
    margin-bottom: 20px;
}
.habit-list-container {
    flex: 1;
    overflow-y: auto;
}
.popup-footer {
    margin-top: 10px;
    text-align: center;
}
.tip {
    font-size: 12px;
    color: #969799;
}
</style>
