<template>
  <view class="container">
    <!-- 顶部背景装饰 -->
    <view class="header-bg">
      <view class="bg-circle circle-1"></view>
      <view class="bg-circle circle-2"></view>
      <view class="bg-circle circle-3"></view>
    </view>

    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="user-info">
        <view class="avatar-wrapper">
          <image
            :src="userInfo?.avatar"
            mode="aspectFill"
            class="avatar"></image>
          <view class="online-dot"></view>
        </view>
        <view class="user-details">
          <view class="nick-name">{{ userInfo?.nickName || "游客" }}</view>
          <view class="user-id">ID: {{ userInfo?.id || "000000" }}</view>
        </view>
      </view>
      <view class="level-badge">
        <text class="level-text">LV.5</text>
      </view>
    </view>

    <!-- 统计数据卡片 -->
    <view class="stats-card">
      <view class="stats-header">
        <text class="stats-title">战绩统计</text>
        <text class="stats-subtitle">本月数据</text>
      </view>
      <view class="stats-grid">
        <view class="stat-item income">
          <view class="stat-icon">💰</view>
          <view class="stat-value">+1,280</view>
          <view class="stat-label">总收入</view>
        </view>
        <view class="stat-item rate">
          <view class="stat-icon">📈</view>
          <view class="stat-value">68%</view>
          <view class="stat-label">胜率</view>
        </view>
        <view class="stat-item games">
          <view class="stat-icon">🎮</view>
          <view class="stat-value">156</view>
          <view class="stat-label">总局数</view>
        </view>
        <view class="stat-item wins">
          <view class="stat-icon">🏆</view>
          <view class="stat-value">106</view>
          <view class="stat-label">胜利</view>
        </view>
      </view>
    </view>

    <!-- 功能按钮区域 -->
    <view class="action-section">
      <view class="section-title">快速开始</view>
      <view class="action-buttons">
        <!-- 扫码加入 -->
        <!-- <view class="action-btn scan-btn" @click="scan">
          <view class="btn-icon">
            <text class="icon">📱</text>
          </view>
          <view class="btn-content">
            <text class="btn-title">扫码加入</text>
            <text class="btn-subtitle">扫描二维码进入房间</text>
          </view>
          <view class="btn-arrow">→</view>
        </view> -->

        <!-- 输入房间号加入 -->
        <view class="action-btn scan-btn" @click="enter">
          <view class="btn-icon">
            <text class="icon">📱</text>
          </view>
          <view class="btn-content">
            <text class="btn-title">加入房间</text>
            <text class="btn-subtitle">输入房间号进入房间</text>
          </view>
          <view class="btn-arrow">→</view>
        </view>

        <!-- 创建房间 -->
        <view class="action-btn create-btn" @click="create">
          <view class="btn-icon">
            <text class="icon">🏠</text>
          </view>
          <view class="btn-content">
            <text class="btn-title">创建房间</text>
            <text class="btn-subtitle">创建新的游戏房间</text>
          </view>
          <view class="btn-arrow">→</view>
        </view>

        <!-- 分享转发 -->
        <!-- <view class="action-btn share-btn" @click="handleShare">
          <view class="btn-icon">
            <text class="icon">📤</text>
          </view>
          <view class="btn-content">
            <text class="btn-title">分享游戏</text>
            <text class="btn-subtitle">邀请好友一起玩</text>
          </view>
          <view class="btn-arrow">→</view>
        </view> -->
      </view>
    </view>

    <!-- 底部装饰 -->
    <view class="footer-decoration">
      <view class="decoration-line"></view>
    </view>
  </view>
</template>
<script setup>
const { proxy } = getCurrentInstance();
let userInfo = ref(null);

function login() {
  return new Promise((resolve, reject) => {
    try {
      uni.login({
        provider: "weixin",
        success: (res) => {
          proxy
            .$request("mini/user/login", {
              code: res.code,
            })
            .then((res) => {
              resolve(res.data);
            });
        },
        fail: (err) => {
          reject(err);
        },
      });
    } catch (error) {
      reject(error);
    }
  });
}

function create() {
  proxy
    .$request("mini/room/create", {
      creator: uni.getStorageSync("userId"),
      roomName: "匿名",
    })
    .then((res) => {
      proxy.$tab.reLaunch("/pages/room");
    });
}

function hasGameFun(userId) {
  return new Promise((resolve, reject) => {
    proxy
      .$request("mini/room/active-room", {
        userId: userId,
      })
      .then((res) => {
        resolve(res.data);
      });
  });
}

async function scan() {
  const scanRes = await proxy.$sw.scan();
  const roomId = scanRes.result;
  await join(roomId);
  proxy.$tab.reLaunch("/pages/room");
}

async function enter() {
  uni.showModal({
    title: "输入房间号",
    content: "",
    editable: true,
    success: async (res) => {
      if (res.confirm) {
        try {
          const roomId = res.content;
          await join(roomId);
          proxy.$tab.reLaunch("/pages/room");
        } catch (error) {
          proxy.$modal.msg(error);
        }
      }
    },
  });
}

function join(roomId) {
  return new Promise((resolve, reject) => {
    proxy
      .$request("mini/room/join", {
        roomId: roomId,
        userId: uni.getStorageSync("userId"),
      })
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

// 分享转发功能
const handleShare = () => {
  // 触发微信小程序的分享功能
  uni.showShareMenu({
    withShareTicket: true,
    success: () => {
      proxy.$modal.msgSuccess("请点击右上角分享按钮");
    },
    fail: (err) => {
      console.error("分享菜单显示失败:", err);
      // 如果不支持分享菜单，则使用自定义分享弹框
      showCustomShare();
    },
  });
};

// 自定义分享弹框
const showCustomShare = () => {
  uni.showActionSheet({
    itemList: ["分享给微信好友", "分享到朋友圈", "复制链接"],
    success: (res) => {
      switch (res.tapIndex) {
        case 0:
          shareToFriend();
          break;
        case 1:
          shareToMoments();
          break;
        case 2:
          copyShareLink();
          break;
      }
    },
  });
};

// 分享给好友
const shareToFriend = () => {
  // 这里可以调用微信分享API或者显示分享信息
  proxy.$modal.msg("请使用右上角菜单分享给好友");
};

// 分享到朋友圈
const shareToMoments = () => {
  proxy.$modal.msg("请使用右上角菜单分享到朋友圈");
};

// 复制分享链接
const copyShareLink = () => {
  const shareText = `我在玩雀神棋牌记账，快来一起玩吧！用户ID: ${
    userInfo.value?.id || "000000"
  }`;

  // #ifdef H5
  if (navigator.clipboard) {
    navigator.clipboard.writeText(shareText).then(() => {
      proxy.$modal.msgSuccess("分享内容已复制到剪贴板");
    });
  } else {
    proxy.$modal.msg("请手动复制分享内容");
  }
  // #endif

  // #ifdef MP-WEIXIN
  uni.setClipboardData({
    data: shareText,
    success: () => {
      proxy.$modal.msgSuccess("分享内容已复制到剪贴板");
    },
    fail: () => {
      proxy.$modal.msgError("复制失败");
    },
  });
  // #endif
};

onLoad(async (options) => {
  userInfo.value = await login();
  uni.setStorageSync("userId", userInfo.value.id);

  // 检查是否通过二维码分享进入
  if (options.roomId && options.action === "join") {
    // 通过二维码扫描进入，直接加入房间
    try {
      await join(options.roomId);
      proxy.$modal.msgSuccess("成功加入房间");
      proxy.$tab.reLaunch("/pages/room");
      return;
    } catch (error) {
      proxy.$modal.msgError("加入房间失败，房间可能已不存在");
    }
  }

  //查询是否有正在开始的对局
  const hasGameRes = await hasGameFun(userInfo.value.id);
  if (!hasGameRes) return;
  //有则直接跳转到对局页面
  proxy.$tab.reLaunch("/pages/room");
});

// 微信小程序分享配置
// #ifdef MP-WEIXIN
// 分享给好友
onShareAppMessage(() => {
  return {
    title: "雀神棋牌记账 - 和朋友一起记录游戏收益",
    desc: "专业的棋牌游戏记账工具，实时统计收益，支持多人房间",
    path: "/pages/home",
    imageUrl: "", // 分享图片，建议尺寸 5:4
    success: (res) => {
      console.log("分享成功", res);
      proxy.$modal.msgSuccess("分享成功");
    },
    fail: (err) => {
      console.error("分享失败", err);
      proxy.$modal.msgError("分享失败");
    },
  };
});

// 分享到朋友圈
onShareTimeline(() => {
  return {
    title: "雀神棋牌记账 - 专业的游戏记账工具",
    query: `inviter=${userInfo.value?.id || ""}`,
    imageUrl: "",
    success: (res) => {
      console.log("分享到朋友圈成功", res);
      proxy.$modal.msgSuccess("分享成功");
    },
    fail: (err) => {
      console.error("分享到朋友圈失败", err);
      proxy.$modal.msgError("分享失败");
    },
  };
});
// #endif

// 处理分享进入的用户
onShow(() => {
  // 获取页面参数，检查是否是通过分享进入
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = currentPage.options;

  if (options.inviter) {
    console.log("通过用户分享进入，邀请者ID:", options.inviter);
    // 这里可以添加邀请奖励逻辑
    proxy.$modal.msg(`欢迎通过好友邀请进入游戏！`);
  }
});
</script>
<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

/* 顶部背景装饰 */
.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 400rpx;
  overflow: hidden;

  .bg-circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);

    &.circle-1 {
      width: 200rpx;
      height: 200rpx;
      top: -100rpx;
      right: -50rpx;
      animation: float 6s ease-in-out infinite;
    }

    &.circle-2 {
      width: 150rpx;
      height: 150rpx;
      top: 100rpx;
      left: -75rpx;
      animation: float 8s ease-in-out infinite reverse;
    }

    &.circle-3 {
      width: 100rpx;
      height: 100rpx;
      top: 200rpx;
      right: 100rpx;
      animation: float 10s ease-in-out infinite;
    }
  }
}

/* 用户信息卡片 */
.user-card {
  margin: 100rpx 30rpx 40rpx;
  padding: 40rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10rpx);
  display: flex;
  align-items: center;
  justify-content: space-between;

  .user-info {
    display: flex;
    align-items: center;

    .avatar-wrapper {
      position: relative;
      margin-right: 30rpx;

      .avatar {
        width: 120rpx;
        height: 120rpx;
        border-radius: 60rpx;
        border: 4rpx solid #fff;
        box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
      }

      .online-dot {
        position: absolute;
        bottom: 8rpx;
        right: 8rpx;
        width: 24rpx;
        height: 24rpx;
        background: #2ed573;
        border-radius: 50%;
        border: 3rpx solid #fff;
      }
    }

    .user-details {
      .nick-name {
        font-size: 36rpx;
        font-weight: 600;
        color: #333;
        margin-bottom: 8rpx;
      }

      .user-id {
        font-size: 24rpx;
        color: #999;
      }
    }
  }

  .level-badge {
    background: linear-gradient(45deg, #ffd700, #ffed4e);
    padding: 12rpx 24rpx;
    border-radius: 20rpx;
    box-shadow: 0 4rpx 12rpx rgba(255, 215, 0, 0.3);

    .level-text {
      font-size: 24rpx;
      font-weight: 600;
      color: #333;
    }
  }
}

/* 统计数据卡片 */
.stats-card {
  margin: 0 30rpx 40rpx;
  padding: 40rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10rpx);

  .stats-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40rpx;

    .stats-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
    }

    .stats-subtitle {
      font-size: 24rpx;
      color: #999;
    }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30rpx;

    .stat-item {
      text-align: center;
      padding: 30rpx 20rpx;
      border-radius: 16rpx;
      position: relative;
      overflow: hidden;

      &::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        opacity: 0.1;
        border-radius: 16rpx;
      }

      &.income {
        background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);

        &::before {
          background: #ff6b6b;
        }
      }

      &.rate {
        background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);

        &::before {
          background: #00d2ff;
        }
      }

      &.games {
        background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);

        &::before {
          background: #ff8a80;
        }
      }

      &.wins {
        background: linear-gradient(135deg, #a8e6cf 0%, #dcedc1 100%);

        &::before {
          background: #4ecdc4;
        }
      }

      .stat-icon {
        font-size: 48rpx;
        margin-bottom: 16rpx;
      }

      .stat-value {
        font-size: 40rpx;
        font-weight: 700;
        color: #333;
        margin-bottom: 8rpx;
      }

      .stat-label {
        font-size: 24rpx;
        color: #666;
      }
    }
  }
}

/* 功能按钮区域 */
.action-section {
  margin: 0 30rpx 60rpx;

  .section-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #fff;
    margin-bottom: 30rpx;
    text-align: center;
  }

  .action-buttons {
    .action-btn {
      display: flex;
      align-items: center;
      padding: 30rpx;
      margin-bottom: 20rpx;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 20rpx;
      box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(10rpx);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;

      &::before {
        content: "";
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.4),
          transparent
        );
        transition: left 0.5s;
      }

      &:active {
        transform: scale(0.98);
        box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.15);

        &::before {
          left: 100%;
        }
      }

      .btn-icon {
        width: 80rpx;
        height: 80rpx;
        border-radius: 16rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 24rpx;

        .icon {
          font-size: 40rpx;
        }
      }

      .btn-content {
        flex: 1;

        .btn-title {
          display: block;
          font-size: 32rpx;
          font-weight: 600;
          color: #333;
          margin-bottom: 8rpx;
        }

        .btn-subtitle {
          display: block;
          font-size: 24rpx;
          color: #999;
        }
      }

      .btn-arrow {
        font-size: 32rpx;
        color: #ccc;
        font-weight: 600;
      }

      &.scan-btn {
        .btn-icon {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

          .icon {
            filter: grayscale(1) brightness(10);
          }
        }
      }

      &.create-btn {
        .btn-icon {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);

          .icon {
            filter: grayscale(1) brightness(10);
          }
        }
      }
    }
  }
}

/* 底部装饰 */
.footer-decoration {
  position: relative;
  height: 100rpx;

  .decoration-line {
    position: absolute;
    bottom: 40rpx;
    left: 50%;
    transform: translateX(-50%);
    width: 100rpx;
    height: 6rpx;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3rpx;
  }
}

/* 动画效果 */
@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

/* 响应式设计 */
@media (max-width: 750rpx) {
  .user-card {
    margin: 80rpx 20rpx 30rpx;
    padding: 30rpx;

    .user-info {
      .avatar-wrapper {
        margin-right: 20rpx;

        .avatar {
          width: 100rpx;
          height: 100rpx;
          border-radius: 50rpx;
        }
      }

      .user-details {
        .nick-name {
          font-size: 32rpx;
        }

        .user-id {
          font-size: 22rpx;
        }
      }
    }
  }

  .stats-card {
    margin: 0 20rpx 30rpx;
    padding: 30rpx;

    .stats-grid {
      gap: 20rpx;

      .stat-item {
        padding: 24rpx 16rpx;

        .stat-icon {
          font-size: 40rpx;
        }

        .stat-value {
          font-size: 36rpx;
        }

        .stat-label {
          font-size: 22rpx;
        }
      }
    }
  }

  .action-section {
    margin: 0 20rpx 40rpx;

    .action-buttons {
      .action-btn {
        padding: 24rpx;

        .btn-icon {
          width: 70rpx;
          height: 70rpx;
          margin-right: 20rpx;

          .icon {
            font-size: 36rpx;
          }
        }

        .btn-content {
          .btn-title {
            font-size: 28rpx;
          }

          .btn-subtitle {
            font-size: 22rpx;
          }
        }
      }
    }
  }
}
</style>
