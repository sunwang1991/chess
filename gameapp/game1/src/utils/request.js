import useUserStore from '@/stores/user.js'
import config from '@/config'
import { getToken } from '@/utils/auth'
import errorCode from '@/utils/errorCode'
import { toast, showConfirm, tansParams } from '@/utils/common'

let timeout = 10000
const baseUrl = config.baseUrl

const request = (config) => {
  // 是否需要设置 token
  const isToken = (config.headers || {}).isToken === false
  config.header = config.header || {}
  if (getToken() && !isToken) {
    config.header['satoken'] = getToken()
    config.header['sysId'] = uni.getStorageSync('sysId')
  }

  // get请求映射params参数
  if (config.params) {
    let url = config.url + '?' + tansParams(config.params)
    url = url.slice(0, -1)
    config.url = url
  }

  return new Promise((resolve, reject) => {
    uni
      .request({
        method: config.method || 'post',
        timeout: config.timeout || timeout,
        url: config.baseUrl || baseUrl + config.url,
        data: config.data,
        header: config.header,
        dataType: 'json',
      })
      .then((response) => {
        const { data } = response
        saveLogs(config.url, config.data, data.data)
        const code = data.code || 404
        const msg = errorCode[code] || data.msg || errorCode['default']
        if (code === 501) {
          let pages = getCurrentPages()
          let currentPage = pages[pages.length - 1].route
          if (currentPage != 'pages/login') {
            toast('登录状态已过期，请重新登陆！')
            reject('无效的会话，或者会话已过期，请重新登录。')
            useUserStore()
              .LogOut()
              .then((res) => {
                uni.reLaunch({
                  url: '/pages/login',
                })
              })
          }
        } else if (code === 500) {
          toast(msg.substr(0, 50))
          reject(msg)
        } else if (code !== 200) {
          toast(msg)
          reject(code)
        } else if (code === 404) {
          toast('请求超时')
          reject(code)
        }
        resolve(data.data)
      })
      .catch((error) => {
        saveLogs(config.url, config.data, error)
        uni.hideLoading()
        let { message } = error
        if (message === 'Network Error') {
          message = '网络连接超时'
        } else if (message.includes('timeout')) {
          message = '网络连接超时'
        } else if (message.includes('Request failed with status code')) {
          message = '系统接口' + message.substr(message.length - 3) + '异常'
        }
        toast(message)
        reject(error)
      })
  })
}

function saveLogs(url, params, res) {
  let arr = []
  let obj = {
    url: url,
    time: uni.$u.timeFormat(new Date(), 'yyyy-mm-dd hh:MM:ss'),
    params: JSON.stringify(params) || '无',
    res: JSON.stringify(res).substr(0, 1000),
  }
  if (uni.getStorageSync('logs')) {
    let arr = JSON.parse(uni.getStorageSync('logs'))
    arr.unshift(obj)
    if (arr.length > 30) {
      arr.pop()
    }
    uni.setStorageSync('logs', JSON.stringify(arr))
  } else {
    arr.unshift(obj)
    uni.setStorageSync('logs', JSON.stringify(arr))
  }
}

// 验证是否为blob格式
async function blobValidate(data) {
  try {
    const text = await data.text()
    JSON.parse(text)
    return false
  } catch (error) {
    return true
  }
}

export function downLoadReq(config) {
  uni.showLoading({
    title: '加载中',
  })
  // 是否需要设置 token
  const isToken = (config.headers || {}).isToken === false
  config.header = config.header || {}
  if (getToken() && !isToken) {
    config.header['satoken'] = getToken()
    config.header['sysId'] = uni.getStorageSync('sysId')
  }

  // get请求映射params参数
  if (config.params) {
    let url = config.url + '?' + tansParams(config.params)
    url = url.slice(0, -1)
    config.url = url
  }
  return new Promise((resolve, reject) => {
    uni
      .request({
        method: config.method || 'get',
        timeout: config.timeout || timeout,
        url: config.baseUrl || baseUrl + config.url,
        data: config.data,
        header: config.header,
        dataType: 'json',
      })
      .then(async (response) => {
        let data = response.data
        uni.hideLoading()
        const isLogin = await blobValidate(data)
        if (isLogin) {
          wx.getFileSystemManager().readFile({
            filePath: data, //选择图片返回的相对路径
            encoding: 'base64', //这个是很重要的
            success: (res) => {
              //成功的回调
            },
            fail: (err) => {},
          })
        } else {
        }
        resolve(data)
      })
      .catch((r) => {
        reject(r)
      })
  })
}

export default request
