import { defineStore } from 'pinia'

import config from '@/config'
import storage from '@/utils/storage'
import constant from '@/utils/constant'
import { getToken, setToken, removeToken } from '@/utils/auth'
import request from '../utils/request.js'

const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken(),
    name: storage.get(constant.name),
    avatar: storage.get(constant.avatar),
    roles: storage.get(constant.roles),
    permissions: storage.get(constant.permissions),
  }),

  actions: {
    // 登录
    Login(userInfo) {
      return new Promise((resolve, reject) => {
        request({
          url: '/authorize/sysWorkUser/login',
          data: {
            loginName: userInfo.username.trim(),
            password: userInfo.password,
            clientType: 'pc_web'
          },
          method: 'POST',
          headers: {
            isToken: false,
          },
        })
          .then((res) => {
            setToken(res)
            this.token = res
            // this.name = res.mercName
            // storage.set(constant.name, res.mercName)
            resolve(res)
          })
          .catch((err) => {
            reject(err)
          })
      })
    },

    // 获取用户信息
    // GetInfo() {
    //   return new Promise((resolve, reject) => {
    //     getInfo()
    //       .then((res) => {
    //         const user = res.user
    //         const avatar =
    //           user == null || user.avatar == '' || user.avatar == null
    //             ? ''
    //             : baseUrl + user.avatar
    //         const username =
    //           user == null || user.userName == '' || user.userName == null
    //             ? ''
    //             : user.userName
    //         if (res.roles && res.roles.length > 0) {
    //           this.roles = res.roles
    //           storage.set(constant.roles, res.roles)
    //           this.permissions = res.permissions
    //           storage.set(constant.permissions, res.permissions)
    //         } else {
    //           this.roles = ['ROLE_DEFAULT']
    //           storage.set(constant.roles, ['ROLE_DEFAULT'])
    //         }
    //         resolve(res)
    //       })
    //       .catch((error) => {
    //         reject(error)
    //       })
    //   })
    // },

    // 退出系统
    LogOut() {
      return new Promise((resolve, reject) => {
        this.roles = ''
        storage.set(constant.roles, '')
        this.permissions = ''
        storage.set(constant.permissions, '')
        removeToken()
        storage.clean()
        resolve('退出登录成功~')
      })
    },
  },
})

export default useUserStore
