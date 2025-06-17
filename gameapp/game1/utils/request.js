import baseUrl from '../config.js'

const request = function(url, data, method = 'post') {
	return new Promise((resolve, reject) => {
		uni.request({
				method: method,
				timeout: 15000,
				url: baseUrl + url,
				data: data,
				header: {
					userId: uni.getStorageSync('userId') || ''
				},
				dataType: 'json'
			}).then(res => {
				if(res.statusCode==200){
					let data=res.data
					if (data.code == 200) {
						resolve(data)
						return
					}
					uni.showToast({
						icon: 'error',
						message: '服务器错误'
					})
					reject(data)
				}else{
					reject(res.errMsg)
				}
			})
			.catch(error => {
				reject(error)
			})
	})
}

export default request