import request from '@/utils/request'

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

