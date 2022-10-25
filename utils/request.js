const { BASE_URL } = require('../config/index')
const axios = require('axios');

function getMethod(url, params) {
  return axios({
    url: BASE_URL + url,
    method: 'get',
    params
  })
}

function postMethod(url, data) {
  return axios({
    url: BASE_URL + url,
    method: 'post',
    data
  })
}

module.exports = {
  getMethod,
  postMethod
}