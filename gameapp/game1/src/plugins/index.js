import tab from './tab'
import auth from './auth'
import modal from './modal'
import request from './request'
import sw from './sw'
import {
	useDict,
	getDictByValue,
	getDictByCode
} from './dict'

export default function installPlugins(app) {
	// 页签操作
	app.config.globalProperties.$tab = tab
	// 认证对象
	app.config.globalProperties.$auth = auth
	// 模态框对象
	app.config.globalProperties.$modal = modal
	//请求方法
	app.config.globalProperties.$request = request
	//公用方法
	app.config.globalProperties.$sw = sw
	//数据字典
	app.config.globalProperties.$useDict = useDict
	app.config.globalProperties.$getDictByValue = getDictByValue
	app.config.globalProperties.$getDictByCode = getDictByCode
}