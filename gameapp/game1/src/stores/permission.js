import {
	defineStore
} from 'pinia'
import storage from '@/utils/storage'
import constant from '@/utils/constant'
import request from '../utils/request.js'
import {
	deepClone
} from '@/utils/common.js'

const usePermissionStore = defineStore('permission', {
	state: () => ({
		permissions_menu: storage.get(constant.permissions_menu),
		permissions_btn: storage.get(constant.permissions_btn),
	}),
	actions: {
		// 获取用户权限信息
		GetPermis() {
			return new Promise(async (resolve, reject) => {
				let sysIds = await getSystemMenus()
				if (sysIds.length > 0) {
					request({
							url: '/authorize/sys-menu/workMenuList',
							data: {
								sysId: sysIds, //平台端获取固定系统ID
							},
						})
						.then((res) => {
							if (res && res.length > 0) {
								const sdata = JSON.parse(JSON.stringify(res))
								let assembleData = refitRouterList(sdata)

								// 按钮权限集合
								this.permissions_btn = assembleData.btn
								storage.set(constant.permissions_btn, assembleData.btn)
								// 菜单权限集合
								this.permissions_menu = assembleData.tree
								storage.set(
									constant.permissions_menu,
									this.permissions_menu
								)
							}
							resolve(res)
						})
						.catch((error) => {
							reject(error)
						})
				} else {
					reject('没有权限')
				}
			})
		},
	},
})

//获取顶部系统
function getSystemMenus() {
	return new Promise((resolve, reject) => {
		request({
				url: '/authorize/sys-system/list',
				data: {},
			})
			.then((res) => {
				console.log('getSystemMenus', res)
				let arr = []
				//pc固定的四个系统id,如有改动,对应调整
				// let menuIds = [371447078143236, 374535658992901, 374535711753477, 374535878972677];
				//pc固定的四个系统标识,如有改动,对应调整
				let menuCodes = ['xy_system', 'xy_quality', 'xy_data', 'xy_merc_be']
				if (res && res.length) {
					res.forEach((i) => {
						if (menuCodes.find((j) => j == i.code)) {
							arr.push(i.id)
						}
					})
				}
				resolve(arr)
			})
			.catch((err) => {
				reject(err)
			})
	})
}

//组装路由
function refitRouterList(allRouterMenu) {
	let newRouterList = new Array()
	let btnPromission = new Array() //按钮权限

	for (let index = 0; index < allRouterMenu.length; index++) {
		const element = allRouterMenu[index]
		//系统路由转换
		let newSystemItem = adjustRouterList(element, true)
		if (element.menu && element.menu.length > 0) {
			//格式转换后的路由,同时收集按钮菜单权限
			let newMenuList = new Array()
			let menuList = element.menu
			for (let index = 0; index < menuList.length; index++) {
				const router = menuList[index]
				let newRouterItem = adjustRouterList(router) //其他菜单路由转换
				newMenuList.push(newRouterItem) //添加到数据待用
				//按钮权限集合
				if (router.type !== 1) {
					btnPromission.push(router.code)
				}
			}
			newSystemItem.children = assembleRouter(newMenuList)
		}

		newRouterList.push(newSystemItem)
	}

	return {
		tree: newRouterList,
		btn: btnPromission,
	}
}

// 遍历系统模块下菜单，转化为路由组件对象
function adjustRouterList(routerItem, isSystemMenu = false) {
	let newRouterItem = {}
	if (isSystemMenu) {
		newRouterItem = {
			id: routerItem.id,
			name: routerItem.code,
			hidden: false,
			meta: {
				title: routerItem.name,
				icon: routerItem.icon,
			},
			path: '/' + routerItem.code, //路由路径
			component: 'Layout', //组件地址
			children: [],
		}
		return newRouterItem
	}
	newRouterItem.name = routerItem.code
	newRouterItem.id = routerItem.id
	newRouterItem.paterId = routerItem.paterId
	newRouterItem.hidden = false
	newRouterItem.type = routerItem.type
	newRouterItem.meta = {
		icon: routerItem.icon,
		title: routerItem.name,
	}

	//根目录及其他目录处理
	if (
		(routerItem.paterId === null && routerItem.type != 2) ||
		routerItem.type == 1
	) {
		newRouterItem.path = '/' + routerItem.route //路由路径
		newRouterItem.component = 'ParentView'
	}

	//菜单项处理
	if (routerItem.type == 2) {
		newRouterItem.path = '/' + routerItem.route //路由路径
		newRouterItem.component = routerItem.route
		newRouterItem.code = routerItem.code
	}

	//按钮/功能处理
	if (routerItem.type == 3) {
		newRouterItem = routerItem
	}

	return newRouterItem
}

//遍历后台传来的路由,组成路由树结构
function assembleRouter(allRouterMenu) {
	// 收集每一项的下标
	const idMapping = allRouterMenu.reduce((acc, el, i) => {
		acc[el.id] = i
		return acc
	}, {})
	let root = []
	allRouterMenu.forEach((el) => {
		// 判断根节点
		if (el.paterId === null || el.paterId === 0) {
			root.push(el)
			return
		}
		// 用映射表找到父元素
		const parentEl = allRouterMenu[idMapping[el.paterId]]
		// 把当前元素添加到父元素的`children`数组中
		if (el.type !== 3) {
			//非按钮，组成路由树结构
			parentEl.children = [...(parentEl.children || []), el]
		}
	})
	return root
}

//遍历树节点,组装成二级路由
function recombineRoute(tree) {
	let newTree = deepClone(tree)
	let newRouter = []
	for (let index = 0; index < newTree.length; index++) {
		const element = newTree[index]
		if (element.children && element.children.length > 0) {
			element.children = filtNode(element.children)
		}
		newRouter.push(element)
	}
	return newRouter
}

//树形结构抓取所有末尾节点，组装数组
function filtNode(tree) {
	let nodeList = []
	findLastNode(tree)

	function findLastNode(childList) {
		for (let index = 0; index < childList.length; index++) {
			const element = childList[index]
			if (!element.children) {
				nodeList.push(element)
			} else {
				findLastNode(element.children)
			}
		}
	}
	return nodeList
}

export default usePermissionStore