import request from '@/utils/request'

export function addSport(data) {
  return request({
    url: '/sport/add',
    method: 'post',
    data
  })
}

export function sportList() {
  return request({
    url: '/sport/list',
    method: 'get'
    // params: { token }
  })
}

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}
