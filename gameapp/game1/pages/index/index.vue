<template>
	<view class="container">
		<view class="head">
			<text>{{userInfo.nickName}}</text>
		</view>
		<view class="content">
			<block v-if="!roomNo">
				<view class="no-room" @click="start">
					立即开始
				</view>
			</block>
			<block v-else>
				<view class="room">
					<view v-for="(item,index) in roomMembers" :key="item.userId" class="user-item">
						<image :src="item.avatarUrl" mode="widthFix" class="avatar"></image>
						<view class="nick-name">{{item.nickName}}</view>
					</view>
				</view>


				<view @click="add">加入</view>
			</block>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				userInfo: {
					nickName: '',
					avatarUrl: '',
					userId: ''
				},
				roomNo: null,
				roomMembers: []
			}
		},
		async onLoad() {
			await this.login()
		},
		methods: {
			login() {
				return new Promise((resolve, reject) => {
					uni.login({
						provider: 'weixin',
						success: loginRes => {
							this.$request('/game/user/login', {
								code: loginRes.code
							}).then(res => {
								uni.setStorageSync('userId', res.data.userId)
								this.userInfo = res.data
								resolve(res.data.userId)
							}).catch(err => {
								resolve(err)
							})
						},
						fail: err => {
							resolve(err)
						}
					})
				})
			},

			async start() {
				console.log(123) 
				await this.createRoom()
			},

			createRoom() {
				return new Promise((resolve, reject) => {
					this.$request('/game/room/createRoom').then(res => {
						console.log(res)
						this.roomNo = res.data.roomNo
						this.roomMembers = res.data.roomMembers
						resolve(res.data.userId)
					}).catch(err => {
						resolve(err)
					})
				})
			},

			pay() {
				return new Promise((resolve, reject) => {
					this.$request('/game/room/settlement', {
						roomNo: this.roomNo,
					}).then(res => {
						console.log(res)
						resolve(res)
					}).catch(err => {
						resolve(err)
					})
				})
			},

			async add() {
				await this.$request('/game/room/joinRoom', {
					roomNo: this.roomNo,
				})
				await this.createRoom()
			},
		}
	}
</script>

<style lang="scss" scoped>
	.head {
		text-align: center;
	}

	.content {
		.no-room {
			text-align: center;
			width: 200rpx;
			line-height: 200rpx;
			border-radius: 8rpx;
			background-color: skyblue;
			color: #fff;
			margin: 400rpx auto;
		}

		.room {
			display: flex;
			padding: 20rpx;

			.user-item {
				display: flex;
				flex-direction: column;
				align-items: center;
				margin-right: 20rpx;

				.avatar {
					width: 100rpx;
					height: 100rpx;
					border-radius: 50%;
				}

				.nick-name {
					font-size: 26rpx;
					color: #666;
				}
			}
		}
	}
</style>