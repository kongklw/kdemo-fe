import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'

Vue.use(Vuex)

// https://webpack.js.org/guides/dependency-management/#requirecontext
const modulesFiles = require.context('./modules', true, /\.js$/)
console.log('modulesFiles---', modulesFiles)

// you do not need `import app from './modules/app'`
// it will auto require all vuex module from modules file
const modules = modulesFiles.keys().reduce((modules, modulePath) => {
  // set './app.js' => 'app'
  console.log('modules-----', modules, 'path---', modulePath)
  const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, '$1')
  console.log('moduleName-----', moduleName)
  const value = modulesFiles(modulePath)
  console.log('value-----', value)
  modules[moduleName] = value.default
  console.log('modules')
  return modules
}, {})

const store = new Vuex.Store({
  modules,
  getters
})

export default store
