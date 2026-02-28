import request from '@/utils/request'

export function geneContentReq(data) {
  return request({
    url: '/baby/ai_gen',
    method: 'post',
    data
  })
}

export function showGrowingListReq() {
  return request({
    url: '/baby/growing',
    method: 'get'

  })
}

export function addGrowingReq(data) {
  return request({
    url: '/baby/growing',
    method: 'post',
    data
  })
}

export function showSleepListReq(data) {
  return request({
    url: '/baby/sleep_list',
    method: 'post',
    data
  })
}

export function addSleepReq(data) {
  return request({
    url: '/baby/sleep',
    method: 'post',
    data
  })
}

export function uploadExpenseFile(data) {
  return request({
    url: '/file/upload',
    method: 'post',
    data
  })
}

export function batchProcessExpenseReq(data) {
  return request({
    url: '/baby/batch_expense',
    method: 'post',
    data
  })
}

export function batchDeleteExpenseReq(data) {
  return request({
    url: '/baby/batch_delete_expense',
    method: 'post',
    data
  })
}

export function showExpenseListReq(data) {
  return request({
    url: '/baby/expense_list',
    method: 'post',
    data
  })
}

export function addExpenseReq(data) {
  return request({
    url: '/baby/expense',
    method: 'post',
    data
  })
}

export function updateExpenseReq(data) {
  return request({
    url: '/baby/expense',
    method: 'put',
    data
  })
}

export function getExpenseTagsReq() {
  return request({
    url: '/baby/expense_tags',
    method: 'get'
  })
}

export function addExpenseTagReq(data) {
  return request({
    url: '/baby/expense_tags',
    method: 'post',
    data
  })
}

export function getBabyInfoReq() {
  return request({
    url: '/baby/info',
    method: 'get'
  })
}

export function updateBabyInfoReq(data) {
  return request({
    url: '/baby/info',
    method: 'post',
    data
  })
}

export function getBabyAlbumsReq(params) {
  return request({
    url: '/baby/albums',
    method: 'get',
    params
  })
}

export function addBabyAlbumReq(data) {
  return request({
    url: '/baby/albums',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export function deleteBabyAlbumReq(id) {
  return request({
    url: `/baby/albums/${id}`,
    method: 'delete'
  })
}

// Baby Pants
export function addBabyPantsReq(data) {
  return request({
    url: '/baby/pants',
    method: 'post',
    data
  })
}

export function babyPantsListReq(params) {
  return request({
    url: '/baby/pants',
    method: 'get',
    params
  })
}

export function deleteBabyPantsReq(id) {
  return request({
    url: '/baby/pants',
    method: 'delete',
    data: { id }
  })
}

// Feed
export function addFeedReq(data) {
  return request({
    url: '/baby/feed',
    method: 'post',
    data
  })
}

export function feedListReq(params) {
  return request({
    url: '/baby/feed',
    method: 'get',
    params
  })
}

export function deleteFeedReq(id) {
  return request({
    url: '/baby/feed',
    method: 'delete',
    data: { id }
  })
}

export function feedChartReq() {
  return request({
    url: '/baby/feed_chart',
    method: 'get'
  })
}

// Temperature
export function addTemperatureReq(data) {
  return request({
    url: '/baby/temperature',
    method: 'post',
    data
  })
}

export function temperatureListReq(params) {
  return request({
    url: '/baby/temperature',
    method: 'get',
    params
  })
}

export function deleteTemperatureReq(id) {
  return request({
    url: '/baby/temperature',
    method: 'delete',
    data: { id }
  })
}

// Todo
export function addTodoListReq(data) {
  return request({
    url: '/baby/todo',
    method: 'post',
    data
  })
}

export function showTodoListReq(params) {
  return request({
    url: '/baby/todo',
    method: 'get',
    params
  })
}

export function showTodoTableReq(params) {
  return request({
    url: '/baby/todo_table',
    method: 'get',
    params
  })
}

export function updateTodoListReq(data) {
  return request({
    url: '/baby/todo',
    method: 'put',
    data
  })
}

export function deleteTodoListReq(id) {
  return request({
    url: '/baby/todo',
    method: 'delete',
    data: { id }
  })
}

// Line Chart
export function lineChartReq(params) {
  return request({
    url: '/baby/line_chart',
    method: 'get',
    params
  })
}

// Dashboard
export function dashboardReq() {
  return request({
    url: '/baby/dashboard',
    method: 'get'
  })
}
