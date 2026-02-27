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
