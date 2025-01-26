import request from '@/utils/request'



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

export function showTodoListReq() {
  return request({
    url: '/baby/todo',
    method: 'get'
    // params: query
  })
}

export function addTodoListReq(data) {
  return request({
    url: '/baby/todo',
    method: 'post',
    data
  })
}

export function updateTodoListReq(data) {
  return request({
    url: '/baby/todo',
    method: 'put',
    data
  })
}

export function deleteTodoListReq(data) {
  return request({
    url: '/baby/todo',
    method: 'delete',
    data
  })
}

export function babyPantsListReq(query) {
  return request({
    url: '/baby/pants',
    method: 'get',
    params: query
  })
}

export function addBabyPantsReq(data) {
  return request({
    url: '/baby/pants',
    method: 'post',
    data
  })
}

export function feedListReq(query) {
  return request({
    url: '/baby/feed',
    method: 'get',
    params: query
  })
}

export function addFeedReq(data) {
  return request({
    url: '/baby/feed',
    method: 'post',
    data
  })
}

export function deleteFeedReq(data) {
  return request({
    url: '/baby/feed',
    method: 'delete',
    data
  })
}

export function temperatureListReq(query) {
  return request({
    url: '/baby/temperature',
    method: 'get',
    params: query
  })
}

export function addTemperatureReq(data) {
  return request({
    url: '/baby/temperature',
    method: 'post',
    data
  })
}

export function lineChartReq() {
  return request({
    url: '/baby/line_chart',
    method: 'get'
    // params: query
  })
}

