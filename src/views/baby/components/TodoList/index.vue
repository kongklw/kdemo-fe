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
import Todo from './Todo.vue'
import { addTodoListReq, updateTodoListReq, showTodoListReq, deleteTodoListReq } from '@/api/baby'

const STORAGE_KEY = 'todos'
const filters = {
  all: todos => todos,
  active: todos => todos.filter(todo => !todo.done),
  completed: todos => todos.filter(todo => todo.done)
}

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
      todos: [],
      range_date: { start_date: this.moment().format('YYYY-MM-DD'), end_date: this.moment().format('YYYY-MM-DD'), }
    }
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

  created() {
    this.showTodoList()
  },
  methods: {

    showTodoList() {
      showTodoListReq(this.range_date).then(res => {
        if (res.code === 200) {
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
       
        addTodoListReq(data).then(res => {
          if (res.code === 200) {
        
            this.showTodoList()
          }
        })
      }
      e.target.value = ''
    },
    toggleTodo(val) {
      val.done = !val.done
      this.setLocalStorage()
    
      updateTodoListReq(val).then(res => {
        if (res.code === 200) {
        
          this.showTodoList()
        }
      })
    },
    deleteTodo(todo) {
      this.todos.splice(this.todos.indexOf(todo), 1)
    
      deleteTodoListReq(todo).then(res => {
        if (res.code === 200) {
       
          this.showTodoList()
        }
      })
      this.setLocalStorage()
    },
    editTodo({ todo, value }) {
      todo.text = value
      this.setLocalStorage()
   
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
