import Vue from 'vue'

import Cookies from 'js-cookie'

import 'normalize.css/normalize.css' // a modern alternative to CSS resets

import Element from 'element-ui'
import './styles/element-variables.scss'
import enLang from 'element-ui/lib/locale/lang/en'// 如果使用中文语言包请默认支持，无需额外引入，请删除该依赖

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'

import './icons' // icon
import './permission' // permission control
import './utils/error-log' // error log

import * as filters from './filters' // global filters
import moment from 'moment'

// Vant UI (Mobile)
import { Picker, DatetimePicker, Popup, SwipeCell, Button, List, Tabbar, TabbarItem, Search, Grid, GridItem, Icon, NavBar, Cell, CellGroup, Tag, PullRefresh, DropdownMenu, DropdownItem, Form, Field, RadioGroup, Radio, Uploader, Dialog, Image as VanImage, Tab, Tabs, Stepper, Switch, Checkbox, CheckboxGroup, Empty, Card, Collapse, CollapseItem, Toast, Calendar, Loading, Divider } from 'vant'
import 'vant/lib/datetime-picker/style'
import 'vant/lib/popup/style'
import 'vant/lib/swipe-cell/style'
import 'vant/lib/button/style'
import 'vant/lib/list/style'
import 'vant/lib/tabbar/style'
import 'vant/lib/tabbar-item/style'
import 'vant/lib/search/style'
import 'vant/lib/grid/style'
import 'vant/lib/grid-item/style'
import 'vant/lib/icon/style'
import 'vant/lib/nav-bar/style'
import 'vant/lib/cell/style'
import 'vant/lib/cell-group/style'
import 'vant/lib/tag/style'
import 'vant/lib/pull-refresh/style'
import 'vant/lib/dropdown-menu/style'
import 'vant/lib/dropdown-item/style'
import 'vant/lib/form/style'
import 'vant/lib/field/style'
import 'vant/lib/radio-group/style'
import 'vant/lib/radio/style'
import 'vant/lib/uploader/style'
import 'vant/lib/dialog/style'
import 'vant/lib/image/style'
import 'vant/lib/tab/style'
import 'vant/lib/tabs/style'
import 'vant/lib/stepper/style'
import 'vant/lib/switch/style'
import 'vant/lib/checkbox/style'
import 'vant/lib/checkbox-group/style'
import 'vant/lib/empty/style'
import 'vant/lib/card/style'
import 'vant/lib/collapse/style'
import 'vant/lib/collapse-item/style'
import 'vant/lib/toast/style'
import 'vant/lib/calendar/style'
import 'vant/lib/loading/style'
import 'vant/lib/divider/style'
import 'vant/lib/picker/style'

Vue.use(Picker)
Vue.use(DatetimePicker)
Vue.use(Popup)
Vue.use(SwipeCell)
Vue.use(Button)
Vue.use(List)
Vue.use(Tabbar)
Vue.use(TabbarItem)
Vue.use(Search)
Vue.use(Grid)
Vue.use(GridItem)
Vue.use(Icon)
Vue.use(NavBar)
Vue.use(Cell)
Vue.use(CellGroup)
Vue.use(Tag)
Vue.use(PullRefresh)
Vue.use(DropdownMenu)
Vue.use(DropdownItem)
Vue.use(Form)
Vue.use(Field)
Vue.use(RadioGroup)
Vue.use(Radio)
Vue.use(Uploader)
Vue.use(Dialog)
Vue.use(VanImage)
Vue.use(Tab)
Vue.use(Tabs)
Vue.use(Stepper)
Vue.use(Switch)
Vue.use(Checkbox)
Vue.use(CheckboxGroup)
Vue.use(Empty)
Vue.use(Card)
Vue.use(Collapse)
Vue.use(CollapseItem)
Vue.use(Toast)
Vue.use(Calendar)
Vue.use(Loading)
Vue.use(Divider)

/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online ! ! !
 */
// if (process.env.NODE_ENV === 'production') {
//   const { mockXHR } = require('../mock')
//   mockXHR()
// }

Vue.use(Element, {
  size: Cookies.get('size') || 'medium', // set element-ui default size
  locale: enLang // 如果使用中文，无需设置，请删除
})

// myconfig
Vue.prototype.moment = moment

Vue.prototype.$BASE_API = process.env.VUE_APP_BASE_API

// register global utility filters
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

// 关闭生产环境下的提示功能
Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
