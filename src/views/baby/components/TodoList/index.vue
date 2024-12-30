<template>
  <section class="todoapp">
    <!-- header -->
    <header class="header">
      <input class="new-todo" autocomplete="off" placeholder="在此添加事项" @keyup.enter="addTodo">
    </header>
    <!-- main section -->
    <section v-show="todos.length" class="main">
      <input id="toggle-all" :checked="allChecked" class="toggle-all" type="checkbox"
        @change="toggleAll({ done: !allChecked })">
      <label for="toggle-all" />
      <ul class="todo-list">
        <todo v-for="(todo, index) in filteredTodos" :key="index" :todo="todo" @toggleTodo="toggleTodo"
          @editTodo="editTodo" @deleteTodo="deleteTodo" />
      </ul>
    </section>
    <!-- footer -->
    <footer v-show="todos.length" class="footer">
      <span class="todo-count">
        <strong>{{ remaining }}</strong>
        {{ remaining | pluralize('item') }} left
      </span>
      <ul class="filters">
        <li v-for="(val, key) in filters" :key="key">
          <a :class="{ selected: visibility === key }" @click.prevent="visibility = key">{{ key | capitalize }}</a>
        </li>
      </ul>
      <!-- <button class="clear-completed" v-show="todos.length > remaining" @click="clearCompleted">
        Clear completed
      </button> -->
    </footer>
  </section>
</template>

<script>
import { done } from 'nprogress';
import Todo from './Todo.vue'
import { addTodoListReq, updateTodoListReq, showTodoListReq, deleteTodoListReq } from '@/api/baby'

const STORAGE_KEY = 'todos'
const filters = {
  all: todos => todos,
  active: todos => todos.filter(todo => !todo.done),
  completed: todos => todos.filter(todo => todo.done)
}
const defalutList = [
  { text: 'AD', done: false },
  { text: '钙', done: false },
  { text: '大便', done: false },
  { text: '益生菌', done: true },

]
export default {
  components: { Todo },
  filters: {
    pluralize: (n, w) => n === 1 ? w : w + 's',
    capitalize: s => s.charAt(0).toUpperCase() + s.slice(1)
  },
  data() {
    return {
      visibility: 'all',
      filters,
      // todos: JSON.parse(window.localStorage.getItem(STORAGE_KEY)) || defalutList
      todos: defalutList
    }
  },

  created() {
    this.todo_init()
  },
  computed: {
    allChecked() {
      return this.todos.every(todo => todo.done)
    },
    filteredTodos() {
      return filters[this.visibility](this.todos)
    },
    remaining() {
      return this.todos.filter(todo => !todo.done).length
    }
  },
  methods: {

    todo_init() {
      showTodoListReq().then(res => {
        if (res.code === 200) {
          console.log(res)
          this.todos = res.data
        }
      })
    },
    setLocalStorage() {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.todos))
    },
    addTodo(e) {
      const text = e.target.value
      if (text.trim()) {
        const data = {
          text,
          done: false
        }
        this.todos.push(data)
        this.setLocalStorage()
        console.log('addTodo', text, false)
        addTodoListReq(data).then(res => {
          if (res.code === 200) {
            console.log(res)
            this.showTodoListReq()
          }
        })
      }
      e.target.value = ''
    },
    toggleTodo(val) {
      val.done = !val.done
      this.setLocalStorage()
      console.log('切换事件', val, typeof (val.done))
      updateTodoListReq(val).then(res => {
        if (res.code === 200) {
          console.log(res)
          this.showTodoListReq()
        }
      })

    },
    deleteTodo(todo) {
      this.todos.splice(this.todos.indexOf(todo), 1)
      console.log('deleteTodo', todo)
      deleteTodoListReq(todo).then(res => {
        if (res.code === 200) {
          console.log(res)
          this.showTodoListReq()
        }
      })
      this.setLocalStorage()
    },
    editTodo({ todo, value }) {
      todo.text = value
      this.setLocalStorage()
      console.log('editTodo', todo, value)
    },
    clearCompleted() {
      this.todos = this.todos.filter(todo => !todo.done)
      this.setLocalStorage()
    },
    toggleAll({ done }) {
      this.todos.forEach(todo => {
        todo.done = done
        this.setLocalStorage()
      })
    }
  }
}
</script>

<style lang="scss">
@import './index.scss';
</style>
