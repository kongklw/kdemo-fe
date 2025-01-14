import request from '@/utils/request'

export function showExpenseListReq(query) {
  return request({
    url: '/baby/expense_list',
    method: 'get',
    params: query
  })
}

export function askAIReq(data) {
  return request({
    url: '/ai/ask',
    method: 'post',
    data
  })
}
