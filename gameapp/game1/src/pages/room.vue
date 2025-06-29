<template>
  <view class="container">
    <!-- 顶部背景装饰 -->
    <view class="header-bg">
      <view class="bg-circle circle-1"></view>
      <view class="bg-circle circle-2"></view>
      <view class="bg-circle circle-3"></view>
    </view>

    <!-- 房间信息卡片 -->
    <view class="room-card">
      <view class="room-header">
        <view class="room-icon">🎮</view>
        <view class="room-info">
          <view class="room-title">{{ roomInfo?.roomName || "棋牌记账" }}</view>
          <view class="room-subtitle"
            >房间ID: {{ roomInfo?.id || "000000" }}</view
          >
        </view>
        <view class="room-status">
          <view class="status-dot"></view>
          <text class="status-text">进行中</text>
        </view>

        <!-- 分享按钮 -->
        <view class="share-btn" @click="handleShareRoom">
          <text class="share-icon">📤</text>
        </view>
      </view>

      <!-- 房间统计 -->
      <view class="room-stats">
        <view class="stat-item">
          <text class="stat-value">{{ roomInfo?.users?.length || 0 }}</text>
          <text class="stat-label">玩家</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-value">{{ getCurrentRound() }}</text>
          <text class="stat-label">局数</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-value">{{ getTotalAmount() }}</text>
          <text class="stat-label">总金额</text>
        </view>
      </view>
    </view>

    <!-- 玩家列表 -->
    <view class="players-section" v-if="roomInfo">
      <view class="section-title">
        <text class="title-text">玩家列表</text>
        <text class="title-count">({{ roomInfo.users?.length || 0 }}人)</text>
      </view>

      <view class="players-grid">
        <view
          v-for="item in roomInfo.users"
          :key="item.id"
          class="player-card"
          :class="{ 'current-user': item.id == userId }"
          @click="handelPay(item)">
          <!-- 玩家头像 -->
          <view class="player-avatar-wrapper">
            <image
              :src="item.avatar"
              mode="aspectFill"
              class="player-avatar"></image>
            <view class="player-rank" v-if="getPlayerRank(item) <= 3">
              {{ getPlayerRank(item) }}
            </view>
            <view class="crown-icon" v-if="getPlayerRank(item) === 1">👑</view>
          </view>

          <!-- 玩家信息 -->
          <view class="player-info">
            <view class="player-name">{{ item.nickName }}</view>
            <view class="player-id">ID: {{ item.id }}</view>
          </view>

          <!-- 收益信息 -->
          <view class="player-earnings">
            <view
              :class="[
                'earnings-amount',
                item.netAmount > 0
                  ? 'profit'
                  : item.netAmount < 0
                  ? 'loss'
                  : 'neutral',
              ]">
              {{ item.netAmount > 0 ? "+" : "" }}{{ item.netAmount }}
            </view>
            <view class="earnings-label">净收益</view>
          </view>

          <!-- 操作按钮 -->
          <view class="player-actions" v-if="item.id != userId">
            <view class="action-btn pay-btn">
              <text class="btn-icon">💰</text>
            </view>
          </view>

          <!-- 当前用户标识 -->
          <!-- <view class="current-user-badge" v-if="item.id == userId">
            <text>我</text>
          </view> -->
        </view>
      </view>
    </view>

    <!-- 游戏操作按钮区域 -->
    <view class="game-actions">
      <view class="action-buttons">
        <!-- 结算按钮 -->
        <view class="game-btn settle-btn" @click="handleSettle">
          <view class="btn-icon">📊</view>
          <view class="btn-content">
            <text class="btn-title">结算</text>
            <text class="btn-subtitle">查看本局结果</text>
          </view>
        </view>

        <!-- 重开按钮 -->
        <view class="game-btn restart-btn" @click="handleRestart">
          <view class="btn-icon">🔄</view>
          <view class="btn-content">
            <text class="btn-title">重开</text>
            <text class="btn-subtitle">开始新的一局</text>
          </view>
        </view>

        <!-- 用户统计按钮 -->
        <view class="game-btn history-btn" @click="handleShowHistory">
          <view class="btn-icon">�</view>
          <view class="btn-content">
            <text class="btn-title">用户统计</text>
            <text class="btn-subtitle">查看收支统计</text>
          </view>
        </view>
      </view>

      <!-- 退出房间按钮 -->
      <!-- <view class="exit-btn" @click="handleExit">
        <text class="exit-text">退出房间</text>
      </view> -->
    </view>

    <!-- 结算弹框 -->
    <Dialog
      v-model="showSettleDialog"
      title="本局结算"
      :show-cancel-button="false"
      confirm-text="确定"
      @confirm="handleSettleConfirm">
      <view class="settle-content">
        <view class="settle-summary">
          <view class="summary-item">
            <text class="summary-label">游戏时长：</text>
            <text class="summary-value">{{ getGameDuration() }}</text>
          </view>
          <view class="summary-item">
            <text class="summary-label">总局数：</text>
            <text class="summary-value">{{ getCurrentRound() }}</text>
          </view>
        </view>

        <view class="settle-players">
          <view class="settle-title">玩家结算</view>
          <view
            v-for="player in getSortedPlayers()"
            :key="player.id"
            class="settle-player-item">
            <view class="settle-player-info">
              <image
                :src="player.avatar"
                mode="aspectFill"
                class="settle-avatar"></image>
              <text class="settle-name">{{ player.nickName }}</text>
            </view>
            <view
              :class="[
                'settle-amount',
                player.netAmount > 0
                  ? 'profit'
                  : player.netAmount < 0
                  ? 'loss'
                  : 'neutral',
              ]">
              {{ player.netAmount > 0 ? "+" : "" }}{{ player.netAmount }}
            </view>
          </view>
        </view>
      </view>
    </Dialog>

    <!-- 重开确认弹框 -->
    <Dialog
      v-model="showRestartDialog"
      title="重新开始"
      @confirm="handleRestartConfirm"
      @cancel="handleRestartCancel">
      <view class="restart-content">
        <view class="restart-warning">⚠️ 重新开始将清空当前游戏数据</view>
        <view class="restart-desc"
          >确定要重新开始游戏吗？所有玩家的当前数据将被重置。</view
        >
      </view>
    </Dialog>

    <!-- 退出房间确认弹框 -->
    <Dialog
      v-model="showExitDialog"
      title="退出房间"
      confirm-text="确定退出"
      cancel-text="取消"
      @confirm="handleExitConfirm"
      @cancel="handleExitCancel">
      <view class="exit-content">
        <view class="exit-warning">🚪 确定要退出房间吗？</view>
        <view class="exit-desc"
          >退出后需要重新扫码或创建房间才能继续游戏。</view
        >
      </view>
    </Dialog>

    <!-- 分享房间弹框 -->
    <Dialog v-model="showShareRoomDialog" title="分享房间" :show-footer="false">
      <view class="share-room-content">
        <!-- 房间信息 -->
        <view class="share-room-info">
          <view class="share-room-title">{{
            roomInfo?.name || "雀神对战"
          }}</view>
          <view class="share-room-id">房间ID: {{ roomInfo?.id }}</view>
          <view class="share-room-players"
            >当前玩家: {{ roomInfo?.users?.length || 0 }}人</view
          >
        </view>

        <!-- 二维码区域 -->
        <view class="qrcode-section">
          <view class="qrcode-title">扫描二维码加入房间</view>
          <view class="qrcode-container">
            <canvas
              v-if="showQRCode"
              canvas-id="roomQRCode"
              class="qrcode-canvas"
              :style="{
                width: qrCodeSize + 'px',
                height: qrCodeSize + 'px',
              }"></canvas>
            <view v-else class="qrcode-loading">
              <text class="loading-text">生成中...</text>
            </view>
          </view>
          <view class="qrcode-tip">好友扫码即可快速加入房间</view>
        </view>

        <!-- 分享操作按钮 -->
        <view class="share-actions">
          <view class="share-action-btn copy-btn" @click="copyRoomInfo">
            <text class="action-icon">📋</text>
            <text class="action-text">复制房间信息</text>
          </view>
          <view class="share-action-btn save-btn" @click="saveQRCode">
            <text class="action-icon">💾</text>
            <text class="action-text">保存二维码</text>
          </view>
          <view class="share-action-btn wechat-btn" @click="shareToWechat">
            <text class="action-icon">💬</text>
            <text class="action-text">微信分享</text>
          </view>
        </view>

        <!-- 关闭按钮 -->
        <view class="share-close-btn" @click="closeShareDialog">
          <text class="close-text">关闭</text>
        </view>
      </view>
    </Dialog>

    <!-- 用户统计弹框 -->
    <Dialog v-model="showHistoryDialog" title="用户统计" :show-footer="false">
      <view class="history-content">
        <!-- 房间统计信息 -->
        <view class="room-summary">
          <view class="summary-card">
            <text class="summary-label">参与用户</text>
            <text class="summary-value">{{ userStatsData.length }}人</text>
          </view>
          <view class="summary-card">
            <text class="summary-label">总流水</text>
            <text class="summary-value">{{ getTotalFlow() }}</text>
          </view>
        </view>

        <!-- 筛选选项 -->
        <view class="history-filter">
          <view class="filter-tabs">
            <view
              v-for="tab in filterTabs"
              :key="tab.value"
              :class="['filter-tab', { active: currentFilter === tab.value }]"
              @click="changeFilter(tab.value)">
              {{ tab.label }}
            </view>
          </view>
        </view>

        <!-- 用户统计列表 -->
        <view class="stats-list">
          <view v-if="filteredUserStats.length === 0" class="empty-state">
            <text class="empty-icon">�</text>
            <text class="empty-text">暂无用户数据</text>
          </view>

          <view
            v-for="(user, index) in filteredUserStats"
            :key="user.userId || index"
            class="user-stats-item">
            <!-- 用户信息 -->
            <view class="user-info">
              <image
                :src="user.avatar"
                mode="aspectFill"
                class="user-avatar"></image>
              <view class="user-details">
                <text class="user-name">{{ user.nickName || "匿名用户" }}</text>
                <text class="user-id">ID: {{ user.userId }}</text>
              </view>
            </view>

            <!-- 统计数据 -->
            <view class="user-stats">
              <view class="stat-row">
                <view class="stat-item pay">
                  <text class="stat-label">支出</text>
                  <text class="stat-value">{{ user.totalPay || 0 }}</text>
                </view>
                <view class="stat-item receive">
                  <text class="stat-label">收入</text>
                  <text class="stat-value">{{ user.totalReceive || 0 }}</text>
                </view>
              </view>
              <view class="net-amount">
                <text class="net-label">净收益</text>
                <text
                  :class="[
                    'net-value',
                    user.netAmount > 0
                      ? 'profit'
                      : user.netAmount < 0
                      ? 'loss'
                      : 'neutral',
                  ]">
                  {{ user.netAmount > 0 ? "+" : "" }}{{ user.netAmount || 0 }}
                </text>
              </view>
            </view>
          </view>
        </view>

        <!-- 关闭按钮 -->
        <view class="history-close-btn" @click="closeHistoryDialog">
          <text class="close-text">关闭</text>
        </view>
      </view>
    </Dialog>

    <!-- 支付弹框 -->
    <Dialog
      v-model="showBasicDialog"
      title="确认支付"
      @confirm="handlePayConfirm"
      @cancel="handlePayCancel">
      <view class="pay-pop">
        <input
          class="pay-input"
          type="number"
          placeholder="请输入支付金额"
          v-model="amount" />
      </view>
    </Dialog>
  </view>
</template>
<script setup>
import Dialog from "@/components/Dialog.vue";
import drawQrcode from "@/static/js/weapp.qrcode.esm.js";
const { proxy } = getCurrentInstance();
let roomInfo = ref(null);
let amount = ref(null);
let userId = ref(null);

userId.value = uni.getStorageSync("userId");

// 弹框控制状态
const showBasicDialog = ref(false);
const showCustomDialog = ref(false);
const showSettleDialog = ref(false);
const showRestartDialog = ref(false);
const showExitDialog = ref(false);
const showShareRoomDialog = ref(false);
const showHistoryDialog = ref(false);
const selectedUser = ref(null);

// 交易记录相关状态
const userStatsData = ref([]);
const currentFilter = ref("all");

// 筛选选项
const filterTabs = ref([
  { label: "全部用户", value: "all" },
  { label: "盈利用户", value: "profit" },
  { label: "亏损用户", value: "loss" },
]);

// 二维码相关状态
const showQRCode = ref(false);
const qrCodeSize = ref(200);

// 游戏状态
const gameStartTime = ref(Date.now());

function getRoomInfo() {
  proxy
    .$request("mini/room/active-room", {
      userId: userId.value,
    })
    .then((res) => {
      roomInfo.value = res.data;
    });
}

async function handelPay(item) {
  if (item.id == userId.value) return;
  // 显示确认支付弹框
  selectedUser.value = item;
  showBasicDialog.value = true;
}

// 弹框事件处理方法
const handlePayConfirm = async () => {
  if (selectedUser.value) {
    await pay(selectedUser.value.id);
    amount.value = null;
    getRoomInfo();

    // 如果用户统计弹框是打开的，刷新统计数据
    if (showHistoryDialog.value) {
      loadTransactionStats();
    }

    proxy.$modal.msg("操作成功");
  }
};

const handlePayCancel = () => {
  selectedUser.value = null;
};

const handleBackHome = () => {
  proxy.$tab.navigateTo("/pages/home");
};

// 辅助方法
const getCurrentRound = () => {
  // 这里可以根据实际业务逻辑计算当前局数
  return roomInfo.value?.currentRound || 1;
};

const getTotalAmount = () => {
  // 计算总金额
  if (!roomInfo.value?.users) return 0;
  return roomInfo.value.users.reduce(
    (total, user) => total + Math.abs(user.netAmount),
    0
  );
};

const getPlayerRank = (player) => {
  // 根据净收益排名
  if (!roomInfo.value?.users) return 1;
  const sortedUsers = [...roomInfo.value.users].sort(
    (a, b) => b.netAmount - a.netAmount
  );
  return sortedUsers.findIndex((user) => user.id === player.id) + 1;
};

// 新增的游戏操作方法
const handleSettle = () => {
  showSettleDialog.value = true;
};

const handleRestart = () => {
  showRestartDialog.value = true;
};

const handleExit = () => {
  showExitDialog.value = true;
};

const handleShowHistory = () => {
  showHistoryDialog.value = true;
  loadTransactionStats();
};

// 结算相关方法
const handleSettleConfirm = async () => {
  await finishGame();
  showSettleDialog.value = false;
  proxy.$tab.navigateBack();
};

const finishGame = () => {
  return new Promise((resolve, reject) => {
    try {
      proxy
        .$request("mini/room/finish", {
          roomId: roomInfo.value.id,
          userId: userId.value,
        })
        .then((res) => {
          resolve(res.data);
        });
    } catch (error) {
      reject(error);
    }
  });
};

const getSortedPlayers = () => {
  if (!roomInfo.value?.users) return [];
  return [...roomInfo.value.users].sort((a, b) => b.netAmount - a.netAmount);
};

const getGameDuration = () => {
  const duration = Date.now() - gameStartTime.value;
  const minutes = Math.floor(duration / 60000);
  const seconds = Math.floor((duration % 60000) / 1000);
  return `${minutes}分${seconds}秒`;
};

//创建游戏
function create() {
  proxy
    .$request("mini/room/create", {
      creator: userId.value,
      roomName: "匿名",
    })
    .then((res) => {
      proxy.$tab.navigateTo("/pages/room");
    });
}

// 重开游戏相关方法
const handleRestartConfirm = async () => {
  try {
    // 调用结束游戏的API
    await finishGame();
    await create();
    proxy.$modal.msgSuccess("游戏已重新开始");
    gameStartTime.value = Date.now();
    getRoomInfo();
  } catch (error) {
    proxy.$modal.msgError("重开失败，请重试");
  }
};

const handleRestartCancel = () => {
  console.log("取消重开");
};

const restartGame = () => {
  return new Promise((resolve, reject) => {
    try {
      proxy
        .$request("mini/room/restart", {
          roomId: roomInfo.value.id,
          userId: userId.value,
        })
        .then((res) => {
          resolve(res.data);
        });
    } catch (error) {
      reject(error);
    }
  });
};

// 退出房间相关方法
const handleExitConfirm = async () => {
  try {
    await exitRoom();
    proxy.$modal.msgSuccess("已退出房间");
    proxy.$tab.navigateTo("/pages/home");
  } catch (error) {
    proxy.$modal.msgError("退出失败，请重试");
  }
};

const handleExitCancel = () => {
  console.log("取消退出");
};

const exitRoom = () => {
  return new Promise((resolve, reject) => {
    try {
      proxy
        .$request("mini/room/exit", {
          roomId: roomInfo.value.id,
          userId: userId.value,
        })
        .then((res) => {
          resolve(res.data);
        });
    } catch (error) {
      reject(error);
    }
  });
};

// 分享房间相关方法
const handleShareRoom = () => {
  showShareRoomDialog.value = true;
  generateQRCode();
};

const closeShareDialog = () => {
  showShareRoomDialog.value = false;
  showQRCode.value = false;
};

// 生成房间二维码
const generateQRCode = () => {
  showQRCode.value = false;

  // 构建小程序页面路径，包含房间ID参数
  const roomPath = `pages/home?roomId=${roomInfo.value?.id}&action=join`;

  // 调用后端API生成小程序二维码
  // proxy
  //   .$request("mini/room/generate-qrcode", {
  //     roomId: roomInfo.value?.id,
  //     path: roomPath,
  //     width: qrCodeSize.value,
  //   })
  //   .then((res) => {
  //     if (res.data && res.data.qrCodeUrl) {
  //       drawQRCodeOnCanvas(res.data.qrCodeUrl);
  //     } else {
  //       // 如果后端不支持，使用前端生成
  //       generateQRCodeLocally(roomPath);
  //     }
  //   })
  //   .catch(() => {
  //     // 后端API失败时，使用前端生成
  //     generateQRCodeLocally(roomPath);
  //   });
  generateQRCodeLocally(roomPath);
};

// 在canvas上绘制二维码
const drawQRCodeOnCanvas = (qrCodeUrl) => {
  const ctx = uni.createCanvasContext("roomQRCode");

  // 下载二维码图片
  uni.downloadFile({
    url: qrCodeUrl,
    success: (res) => {
      if (res.statusCode === 200) {
        ctx.drawImage(
          res.tempFilePath,
          0,
          0,
          qrCodeSize.value,
          qrCodeSize.value
        );
        ctx.draw(false, () => {
          showQRCode.value = true;
        });
      }
    },
    fail: () => {
      proxy.$modal.msgError("二维码生成失败");
    },
  });
};

// 前端生成二维码（备用方案）
const generateQRCodeLocally = (content) => {
  drawQrcode({
    width: 200,
    height: 200,
    canvasId: "roomQRCode",
    text: content,
  });

  showQRCode.value = true;
};

// 复制房间信息
const copyRoomInfo = () => {
  const roomText = `【雀神棋牌记账】
房间名称: ${roomInfo.value?.name || "雀神对战"}
房间ID: ${roomInfo.value?.id}
当前玩家: ${roomInfo.value?.users?.length || 0}人
快来一起玩吧！`;

  uni.setClipboardData({
    data: roomText,
    success: () => {
      proxy.$modal.msgSuccess("房间信息已复制到剪贴板");
    },
    fail: () => {
      proxy.$modal.msgError("复制失败");
    },
  });
};

// 保存二维码到相册
const saveQRCode = () => {
  if (!showQRCode.value) {
    proxy.$modal.msgError("二维码还未生成完成");
    return;
  }

  uni.canvasToTempFilePath({
    canvasId: "roomQRCode",
    success: (res) => {
      uni.saveImageToPhotosAlbum({
        filePath: res.tempFilePath,
        success: () => {
          proxy.$modal.msgSuccess("二维码已保存到相册");
        },
        fail: () => {
          proxy.$modal.msgError("保存失败，请检查相册权限");
        },
      });
    },
    fail: () => {
      proxy.$modal.msgError("生成图片失败");
    },
  });
};

// 微信分享
const shareToWechat = () => {
  // 触发微信小程序分享
  uni.showShareMenu({
    withShareTicket: true,
    success: () => {
      proxy.$modal.msg("请点击右上角分享按钮");
    },
    fail: () => {
      proxy.$modal.msg("请使用右上角菜单进行分享");
    },
  });
};

// 用户统计相关方法
const loadTransactionStats = async () => {
  try {
    const res = await proxy.$request("mini/room/transaction-stats", {
      roomId: roomInfo.value?.id,
    });

    if (res.data && Array.isArray(res.data)) {
      userStatsData.value = res.data;
    }
  } catch (error) {
    console.error("加载用户统计失败:", error);
    proxy.$modal.msgError("加载用户统计失败");
  }
};

const changeFilter = (filterValue) => {
  currentFilter.value = filterValue;
};

const closeHistoryDialog = () => {
  showHistoryDialog.value = false;
  // 清空数据
  userStatsData.value = [];
};

// 计算属性：根据筛选条件过滤用户统计
const filteredUserStats = computed(() => {
  if (!userStatsData.value || currentFilter.value === "all") {
    return userStatsData.value || [];
  }

  return userStatsData.value.filter((user) => {
    if (currentFilter.value === "profit") {
      return user.netAmount > 0;
    } else if (currentFilter.value === "loss") {
      return user.netAmount < 0;
    }
    return true;
  });
});

// 计算总流水
const getTotalFlow = () => {
  if (!userStatsData.value || userStatsData.value.length === 0) {
    return 0;
  }

  return userStatsData.value.reduce((total, user) => {
    return total + (user.totalPay || 0) + (user.totalReceive || 0);
  }, 0);
};

function pay(receiveUserId) {
  return new Promise((resolve, reject) => {
    try {
      proxy
        .$request("mini/room/pay", {
          roomId: roomInfo.value.id,
          payUserId: userId.value,
          receiveUserId: receiveUserId,
          amount: amount.value,
        })
        .then((res) => {
          resolve(res.data);
        });
    } catch (error) {
      reject(error);
    }
  });
}

onLoad(() => {
  getRoomInfo();
});

let timer = setInterval(() => {
  getRoomInfo();
}, 2000);

onUnload(() => {
  clearInterval(timer);
});

// 微信小程序分享配置
// #ifdef MP-WEIXIN
// 分享给好友
onShareAppMessage(() => {
  return {
    title: `${roomInfo.value?.name || "雀神对战"} - 房间ID: ${
      roomInfo.value?.id
    }`,
    desc: `当前${roomInfo.value?.users?.length || 0}人在线，快来一起玩吧！`,
    path: `/pages/home?roomId=${roomInfo.value?.id}&action=join`,
    imageUrl: "/src/static/logo/logo.png",
    success: (res) => {
      console.log("房间分享成功", res);
      proxy.$modal.msgSuccess("分享成功");
    },
    fail: (err) => {
      console.error("房间分享失败", err);
      proxy.$modal.msgError("分享失败");
    },
  };
});

// 分享到朋友圈
onShareTimeline(() => {
  return {
    title: `${roomInfo.value?.name || "雀神对战"} - 邀请你一起玩棋牌记账`,
    query: `roomId=${roomInfo.value?.id}&action=join`,
    imageUrl: "/src/static/logo/logo.png",
    success: (res) => {
      console.log("房间分享到朋友圈成功", res);
      proxy.$modal.msgSuccess("分享成功");
    },
    fail: (err) => {
      console.error("房间分享到朋友圈失败", err);
      proxy.$modal.msgError("分享失败");
    },
  };
});
// #endif
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

/* 房间信息卡片 */
.room-card {
  margin: 100rpx 30rpx 40rpx;
  padding: 40rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10rpx);

  .room-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 30rpx;

    .room-icon {
      font-size: 48rpx;
      margin-right: 20rpx;
    }

    .room-info {
      flex: 1;

      .room-title {
        font-size: 36rpx;
        font-weight: 600;
        color: #333;
        margin-bottom: 8rpx;
      }

      .room-subtitle {
        font-size: 24rpx;
        color: #999;
      }
    }

    .room-status {
      display: flex;
      align-items: center;

      .status-dot {
        width: 16rpx;
        height: 16rpx;
        background: #2ed573;
        border-radius: 50%;
        margin-right: 12rpx;
        animation: pulse 2s infinite;
      }

      .status-text {
        font-size: 24rpx;
        color: #2ed573;
        font-weight: 500;
      }
    }

    .share-btn {
      width: 60rpx;
      height: 60rpx;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 30rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: 16rpx;
      box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
      transition: all 0.3s ease;

      &:active {
        transform: scale(0.9);
      }

      .share-icon {
        font-size: 28rpx;
        color: #fff;
      }
    }
  }

  .room-stats {
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 20rpx 0;
    background: rgba(102, 126, 234, 0.1);
    border-radius: 16rpx;

    .stat-item {
      text-align: center;

      .stat-value {
        display: block;
        font-size: 32rpx;
        font-weight: 700;
        color: #667eea;
        margin-bottom: 8rpx;
      }

      .stat-label {
        font-size: 24rpx;
        color: #666;
      }
    }

    .stat-divider {
      width: 2rpx;
      height: 60rpx;
      background: rgba(102, 126, 234, 0.2);
    }
  }
}

/* 玩家列表区域 */
.players-section {
  margin: 0 30rpx 60rpx;

  .section-title {
    display: flex;
    align-items: center;
    margin-bottom: 30rpx;

    .title-text {
      font-size: 32rpx;
      font-weight: 600;
      color: #fff;
      margin-right: 16rpx;
    }

    .title-count {
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.7);
    }
  }

  .players-grid {
    display: flex;
    flex-direction: column;
    gap: 20rpx;

    .player-card {
      display: flex;
      align-items: center;
      padding: 30rpx;
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

        &::before {
          left: 100%;
        }
      }

      &.current-user {
        border: 3rpx solid #667eea;
        background: linear-gradient(
          135deg,
          rgba(102, 126, 234, 0.1) 0%,
          rgba(255, 255, 255, 0.95) 100%
        );
      }

      .player-avatar-wrapper {
        position: relative;
        margin-right: 24rpx;

        .player-avatar {
          width: 100rpx;
          height: 100rpx;
          border-radius: 50rpx;
          border: 4rpx solid #fff;
          box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
        }

        .player-rank {
          position: absolute;
          top: -8rpx;
          right: -8rpx;
          width: 32rpx;
          height: 32rpx;
          background: linear-gradient(45deg, #ffd700, #ffed4e);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20rpx;
          font-weight: 700;
          color: #333;
          border: 2rpx solid #fff;
          box-shadow: 0 2rpx 8rpx rgba(255, 215, 0, 0.3);
        }

        .crown-icon {
          position: absolute;
          top: -16rpx;
          left: 50%;
          transform: translateX(-50%);
          font-size: 32rpx;
          filter: drop-shadow(0 2rpx 4rpx rgba(0, 0, 0, 0.2));
        }
      }

      .player-info {
        flex: 1;
        margin-right: 20rpx;

        .player-name {
          font-size: 32rpx;
          font-weight: 600;
          color: #333;
          margin-bottom: 8rpx;
        }

        .player-id {
          font-size: 24rpx;
          color: #999;
        }
      }

      .player-earnings {
        text-align: center;
        margin-right: 20rpx;

        .earnings-amount {
          font-size: 36rpx;
          font-weight: 700;
          margin-bottom: 4rpx;

          &.profit {
            color: #2ed573;
          }

          &.loss {
            color: #ff4757;
          }

          &.neutral {
            color: #666;
          }
        }

        .earnings-label {
          font-size: 22rpx;
          color: #999;
        }
      }

      .player-actions {
        .action-btn {
          width: 60rpx;
          height: 60rpx;
          border-radius: 30rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;

          &.pay-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);

            .btn-icon {
              font-size: 28rpx;
              filter: grayscale(1) brightness(10);
            }

            &:active {
              transform: scale(0.9);
            }
          }
        }
      }

      .current-user-badge {
        position: absolute;
        top: 16rpx;
        right: 16rpx;
        background: linear-gradient(45deg, #667eea, #764ba2);
        color: #fff;
        padding: 8rpx 16rpx;
        border-radius: 20rpx;
        font-size: 20rpx;
        font-weight: 600;
        box-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.3);
      }
    }
  }
}

/* 游戏操作按钮区域 */
.game-actions {
  margin: 40rpx 30rpx 60rpx;

  .action-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
    margin-bottom: 30rpx;

    .game-btn {
      flex: 1;
      min-width: 200rpx;
      display: flex;
      align-items: center;
      padding: 30rpx 24rpx;
      border-radius: 20rpx;
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
          rgba(255, 255, 255, 0.3),
          transparent
        );
        transition: left 0.5s;
      }

      &:active {
        transform: scale(0.98);

        &::before {
          left: 100%;
        }
      }

      .btn-icon {
        font-size: 40rpx;
        margin-right: 20rpx;
      }

      .btn-content {
        flex: 1;

        .btn-title {
          display: block;
          font-size: 32rpx;
          font-weight: 600;
          margin-bottom: 6rpx;
        }

        .btn-subtitle {
          display: block;
          font-size: 24rpx;
          opacity: 0.8;
        }
      }

      &.settle-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #fff;
        box-shadow: 0 8rpx 32rpx rgba(102, 126, 234, 0.3);
      }

      &.restart-btn {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: #fff;
        box-shadow: 0 8rpx 32rpx rgba(240, 147, 251, 0.3);
      }

      &.history-btn {
        background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
        color: #333;
        box-shadow: 0 8rpx 32rpx rgba(168, 237, 234, 0.3);
      }
    }
  }

  .exit-btn {
    width: 100%;
    padding: 24rpx;
    background: rgba(255, 255, 255, 0.1);
    border: 2rpx solid rgba(255, 255, 255, 0.3);
    border-radius: 16rpx;
    text-align: center;
    transition: all 0.3s ease;

    &:active {
      transform: scale(0.98);
      background: rgba(255, 255, 255, 0.2);
    }

    .exit-text {
      font-size: 28rpx;
      color: rgba(255, 255, 255, 0.9);
      font-weight: 500;
    }
  }
}

/* 弹框内容样式 */
.settle-content {
  .settle-summary {
    margin-bottom: 30rpx;
    padding: 20rpx;
    background: #f8f9fa;
    border-radius: 12rpx;

    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12rpx;

      &:last-child {
        margin-bottom: 0;
      }

      .summary-label {
        font-size: 28rpx;
        color: #666;
      }

      .summary-value {
        font-size: 28rpx;
        font-weight: 600;
        color: #333;
      }
    }
  }

  .settle-players {
    .settle-title {
      font-size: 30rpx;
      font-weight: 600;
      color: #333;
      margin-bottom: 20rpx;
      text-align: center;
    }

    .settle-player-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20rpx;
      margin-bottom: 16rpx;
      background: #f8f9fa;
      border-radius: 12rpx;

      &:last-child {
        margin-bottom: 0;
      }

      .settle-player-info {
        display: flex;
        align-items: center;

        .settle-avatar {
          width: 60rpx;
          height: 60rpx;
          border-radius: 30rpx;
          margin-right: 16rpx;
        }

        .settle-name {
          font-size: 28rpx;
          color: #333;
          font-weight: 500;
        }
      }

      .settle-amount {
        font-size: 32rpx;
        font-weight: 700;

        &.profit {
          color: #2ed573;
        }

        &.loss {
          color: #ff4757;
        }

        &.neutral {
          color: #666;
        }
      }
    }
  }
}

.restart-content,
.exit-content {
  text-align: center;

  .restart-warning,
  .exit-warning {
    font-size: 32rpx;
    margin-bottom: 20rpx;
    color: #ff6b6b;
    font-weight: 600;
  }

  .restart-desc,
  .exit-desc {
    font-size: 28rpx;
    color: #666;
    line-height: 1.6;
  }
}

/* 输入框样式 */
.pay-pop {
  :deep(input) {
    width: 100%;
    height: 100rpx;
    line-height: 100rpx;
    padding: 0 30rpx;
    border: 2rpx solid #e6e6e6;
    border-radius: 16rpx;
    font-size: 32rpx;
    color: #333;
    background-color: #fafafa;
    box-sizing: border-box;
    transition: all 0.3s ease;

    /* 聚焦状态 */
    &:focus {
      border-color: #667eea;
      background-color: #fff;
      box-shadow: 0 0 0 4rpx rgba(102, 126, 234, 0.1);
      outline: none;
    }

    /* 占位符样式 */
    &::placeholder {
      color: #999;
      font-size: 30rpx;
    }
  }
}

/* 分享房间弹框样式 */
.share-room-content {
  text-align: center;

  .share-room-info {
    margin-bottom: 30rpx;
    padding: 20rpx;
    background: #f8f9fa;
    border-radius: 12rpx;

    .share-room-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
      margin-bottom: 12rpx;
    }

    .share-room-id {
      font-size: 28rpx;
      color: #667eea;
      font-weight: 500;
      margin-bottom: 8rpx;
    }

    .share-room-players {
      font-size: 24rpx;
      color: #999;
    }
  }

  .qrcode-section {
    margin-bottom: 30rpx;

    .qrcode-title {
      font-size: 28rpx;
      color: #333;
      margin-bottom: 20rpx;
      font-weight: 500;
    }

    .qrcode-container {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 16rpx;

      .qrcode-canvas {
        border: 2rpx solid #e6e6e6;
        border-radius: 12rpx;
        background: #fff;
      }

      .qrcode-loading {
        width: 200rpx;
        height: 200rpx;
        border: 2rpx solid #e6e6e6;
        border-radius: 12rpx;
        background: #f8f9fa;
        display: flex;
        align-items: center;
        justify-content: center;

        .loading-text {
          font-size: 24rpx;
          color: #999;
        }
      }
    }

    .qrcode-tip {
      font-size: 24rpx;
      color: #999;
      line-height: 1.4;
    }
  }

  .share-actions {
    display: flex;
    justify-content: space-around;
    margin-bottom: 30rpx;

    .share-action-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20rpx 16rpx;
      border-radius: 12rpx;
      transition: all 0.3s ease;
      min-width: 120rpx;

      &:active {
        transform: scale(0.95);
      }

      .action-icon {
        font-size: 32rpx;
        margin-bottom: 8rpx;
      }

      .action-text {
        font-size: 22rpx;
        color: #666;
      }

      &.copy-btn {
        background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);

        .action-icon {
          color: #00d2ff;
        }
      }

      &.save-btn {
        background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);

        .action-icon {
          color: #ff8a80;
        }
      }

      &.wechat-btn {
        background: linear-gradient(135deg, #a8e6cf 0%, #dcedc1 100%);

        .action-icon {
          color: #4ecdc4;
        }
      }
    }
  }

  .share-close-btn {
    width: 100%;
    padding: 24rpx;
    background: #f8f9fa;
    border-radius: 12rpx;
    transition: all 0.3s ease;

    &:active {
      transform: scale(0.98);
      background: #e9ecef;
    }

    .close-text {
      font-size: 28rpx;
      color: #666;
      font-weight: 500;
    }
  }
}

/* 用户统计弹框样式 */
.history-content {
  .room-summary {
    display: flex;
    gap: 20rpx;
    margin-bottom: 30rpx;

    .summary-card {
      flex: 1;
      padding: 24rpx;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 16rpx;
      text-align: center;
      color: #fff;

      .summary-label {
        display: block;
        font-size: 24rpx;
        opacity: 0.9;
        margin-bottom: 8rpx;
      }

      .summary-value {
        display: block;
        font-size: 32rpx;
        font-weight: 700;
      }
    }
  }

  .history-filter {
    margin-bottom: 30rpx;

    .filter-tabs {
      display: flex;
      background: #f8f9fa;
      border-radius: 12rpx;
      padding: 6rpx;

      .filter-tab {
        flex: 1;
        text-align: center;
        padding: 16rpx 20rpx;
        font-size: 28rpx;
        color: #666;
        border-radius: 8rpx;
        transition: all 0.3s ease;

        &.active {
          background: #667eea;
          color: #fff;
          font-weight: 600;
        }

        &:active {
          transform: scale(0.95);
        }
      }
    }
  }

  .stats-list {
    max-height: 600rpx;
    overflow-y: auto;
    margin-bottom: 30rpx;

    .empty-state {
      text-align: center;
      padding: 80rpx 20rpx;

      .empty-icon {
        display: block;
        font-size: 64rpx;
        margin-bottom: 20rpx;
        opacity: 0.5;
      }

      .empty-text {
        font-size: 28rpx;
        color: #999;
      }
    }

    .user-stats-item {
      display: flex;
      align-items: center;
      padding: 24rpx 20rpx;
      margin-bottom: 16rpx;
      background: #f8f9fa;
      border-radius: 12rpx;
      border-left: 6rpx solid #667eea;

      &:last-child {
        margin-bottom: 0;
      }

      .user-info {
        display: flex;
        align-items: center;
        margin-right: 20rpx;

        .user-avatar {
          width: 60rpx;
          height: 60rpx;
          border-radius: 30rpx;
          margin-right: 16rpx;
          border: 2rpx solid #fff;
        }

        .user-details {
          .user-name {
            display: block;
            font-size: 28rpx;
            color: #333;
            font-weight: 500;
            margin-bottom: 4rpx;
          }

          .user-id {
            font-size: 22rpx;
            color: #999;
          }
        }
      }

      .user-stats {
        flex: 1;

        .stat-row {
          display: flex;
          gap: 20rpx;
          margin-bottom: 12rpx;

          .stat-item {
            flex: 1;
            text-align: center;

            .stat-label {
              display: block;
              font-size: 22rpx;
              color: #999;
              margin-bottom: 4rpx;
            }

            .stat-value {
              display: block;
              font-size: 26rpx;
              font-weight: 600;
              color: #333;
            }

            &.pay .stat-value {
              color: #ff4757;
            }

            &.receive .stat-value {
              color: #2ed573;
            }
          }
        }

        .net-amount {
          text-align: center;
          padding: 8rpx 16rpx;
          background: rgba(102, 126, 234, 0.1);
          border-radius: 8rpx;

          .net-label {
            font-size: 22rpx;
            color: #666;
            margin-right: 8rpx;
          }

          .net-value {
            font-size: 28rpx;
            font-weight: 700;

            &.profit {
              color: #2ed573;
            }

            &.loss {
              color: #ff4757;
            }

            &.neutral {
              color: #666;
            }
          }
        }
      }
    }
  }

  .history-close-btn {
    width: 100%;
    padding: 24rpx;
    background: #f8f9fa;
    border-radius: 12rpx;
    text-align: center;
    transition: all 0.3s ease;

    &:active {
      transform: scale(0.98);
      background: #e9ecef;
    }

    .close-text {
      font-size: 28rpx;
      color: #666;
      font-weight: 500;
    }
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

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: 750rpx) {
  .room-card {
    margin: 80rpx 20rpx 30rpx;
    padding: 30rpx;

    .room-header {
      .room-icon {
        font-size: 40rpx;
      }

      .room-info {
        .room-title {
          font-size: 32rpx;
        }

        .room-subtitle {
          font-size: 22rpx;
        }
      }

      .room-status {
        .status-text {
          font-size: 22rpx;
        }
      }
    }

    .room-stats {
      .stat-item {
        .stat-value {
          font-size: 28rpx;
        }

        .stat-label {
          font-size: 22rpx;
        }
      }
    }
  }

  .players-section {
    margin: 0 20rpx 40rpx;

    .section-title {
      .title-text {
        font-size: 28rpx;
      }

      .title-count {
        font-size: 22rpx;
      }
    }

    .players-grid {
      gap: 16rpx;

      .player-card {
        padding: 24rpx;

        .player-avatar-wrapper {
          margin-right: 20rpx;

          .player-avatar {
            width: 80rpx;
            height: 80rpx;
            border-radius: 40rpx;
          }

          .player-rank {
            width: 28rpx;
            height: 28rpx;
            font-size: 18rpx;
          }

          .crown-icon {
            font-size: 28rpx;
          }
        }

        .player-info {
          .player-name {
            font-size: 28rpx;
          }

          .player-id {
            font-size: 22rpx;
          }
        }

        .player-earnings {
          .earnings-amount {
            font-size: 32rpx;
          }

          .earnings-label {
            font-size: 20rpx;
          }
        }

        .player-actions {
          .action-btn {
            width: 50rpx;
            height: 50rpx;
            border-radius: 25rpx;

            .btn-icon {
              font-size: 24rpx;
            }
          }
        }

        .current-user-badge {
          padding: 6rpx 12rpx;
          font-size: 18rpx;
        }
      }
    }
  }
}
</style>
