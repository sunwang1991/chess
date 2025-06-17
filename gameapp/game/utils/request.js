import baseUrl from '../config.js'

const request = function(url, data, method = 'post') {
	return new Promise((resolve, reject) => {
		uni.request({
				method: method,
				timeout: 5000,
				url: baseUrl + url,
				data: data,
				header: {
					userId: uni.getStorageSync('userId') || ''
				},
				dataType: 'json'
			}).then(response => {
				let [error, res] = response
				//系统报错
				const code = res.data.code || 500

				if (code == 200) {
					resolve(res.data)
					return
				}

				uni.showToast({
					icon: 'error',
					message: '服务器错误'
				})
				reject(res.data)

			})
			.catch(error => {
				reject(error)
			})
	})
}

export default request