import useDictStore from '@/stores/dict.js'
import request from '@/utils/request.js'
import {
	ref,
	toRefs
} from 'vue'

/**
 * 获取字典数据
 */
export function useDict(...args) {
	const res = ref({})
	return (() => {
		args.forEach((dictType, index) => {
			res.value[dictType] = []
			const dicts = useDictStore().getDict(dictType)
			if (dicts) {
				res.value[dictType] = dicts
			} else {
				request({
					url: '/sys/sys-dict/list2',
					data: {
						paterCode: dictType,
					},
				}).then((resp) => {
					console.log('resp', resp)
					res.value[dictType] = resp.map((p) => ({
						label: p.msg,
						value: p.value,
						code:p.code,
						elTagType: p.cssClass,
						elTagClass: p.cssClass,
					}))
					useDictStore().setDict(dictType, res.value[dictType])
				})
			}
		})
		console.log('res.value', res.value)
		return toRefs(res.value)
	})()
}
export function getDictByValue(dict, value) {
	let re = dict.find(e=>e.value == value);
	return re?re:{};
}
export function getDictByCode(dict, code) {
	let re = dict.find(e=>e.code == code);
	return re?re:{};
}
