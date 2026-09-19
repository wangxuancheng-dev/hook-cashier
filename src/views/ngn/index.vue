<template>
  <div class="payment-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <!-- <div class="loading-text">{{ t('loading.text') }}</div> -->
    </div>

    <template v-else>
      <!-- 错误提示 -->
      <div class="error-message" v-if="error">
        {{ error }}
      </div>

      <!-- 支付成功 -->
      <div v-if="success" class="pay-close-desc" style="text-align: center;margin-bottom: 20px">
        <img src="@/assets/ok.png" style="width: 60px;height: auto;margin-top: 100px;margin-bottom: 20px">
        <div class="order-details">
          <div class="detail-item">
            <div>Order completed</div>
            <div style="margin-top: 30px;">Order Number: {{ orderNumber }}</div>
          </div>
        </div>
      </div>

      <!-- 支付表单（非错误/成功状态） -->
      <div class="container" v-if="!error && !success">
        <div class="card">
          <!-- 金额展示 -->
          <div class="amount-display">
            <h2>₦{{ amount }}</h2>
            <p>Use this account for this transaction only</p>
          </div>

          <!-- 倒计时提示 -->
          <div class="expiry-warning">
            <i class="fas fa-clock"></i> Account expires within {{ formatTime(countdown) }}
          </div>

          <!-- 订单信息 -->
          <div class="order-info-container">
            <!-- 银行 -->
            <div class="order-info-item">
              <div class="info-label">Bank</div>
              <div class="info-value">{{ bankName }}</div>
              <button class="copy-btn" @click="copyText(bankName)">
                <i class="fas fa-copy"></i>Copy
              </button>
            </div>
            <!-- 户名 -->
            <div class="order-info-item">
              <div class="info-label">Name</div>
              <div class="info-value">{{ payeeName }}</div>
              <button class="copy-btn" @click="copyText(payeeName)">
                <i class="fas fa-copy"></i>Copy
              </button>
            </div>

            <!-- 账号 -->
            <div class="order-info-item">
              <div class="info-label">Account</div>
              <div class="info-value">{{ bankCardNumber }}</div>
              <button class="copy-btn" @click="copyText(bankCardNumber)">
                <i class="fas fa-copy"></i> Copy
              </button>
            </div>
            <!-- 金额 -->
            <div class="order-info-item">
              <div class="info-label">Amount</div>
              <div class="info-value">₦{{ amount }}</div>
              <button class="copy-btn" @click="copyText(`${amount}`)">
                <i class="fas fa-copy"></i> Copy
              </button>
            </div>
            <!-- 备注 -->
            <div class="order-info-item">
              <div class="info-label">Note</div>
              <div class="info-value">{{ memo }}</div>
              <button class="copy-btn" @click="copyText(memo)">
                <i class="fas fa-copy"></i> Copy
              </button>
            </div>
            <!-- 订单号 -->
            <div class="order-info-item">
              <div class="info-label">Order Number</div>
              <div class="info-value">{{ orderNumber }}</div>
              <button class="copy-btn" @click="copyText(orderNumber)">
                <i class="fas fa-copy"></i> Copy
              </button>
            </div>


          </div>

          <!-- 备注提示 -->
          <div class="note">
            <p><i class="fas fa-exclamation-circle"></i> Fill in the Note/Remark/Narration when transferring please.</p>
          </div>
        </div>

        <!-- 支付指南与按钮 -->
        <div class="card">
          <div class="guide">
            <h3>Payment Guide</h3>
            <ul class="guide-list">
              <li>
                <i class="warning-icon">⚠️</i>
                <span>Please complete the payment within the specified time! Otherwise your account will not be
                  credited!</span>
              </li>
              <li>
                <i class="warning-icon">⚠️</i>
                <span>Please fill in the Note when transferring, Otherwise it will not be automatically credited!</span>
              </li>
              <li>
                <i class="warning-icon">⚠️</i>
                <span>Please do not transfer funds to accounts twice, do not save these accounts to make payments, or
                  you will lose your money!</span>
              </li>
              <li>
                <i class="warning-icon">⚠️</i>
                <span>After completing the payment, Please click the "I have paid" button below, and we will confirm
                  your payment!</span>
              </li>
            </ul>
          </div>

          <button class="payment-btn" @click="handlePayment">
            <i class="fas fa-check-circle"></i> I have made this bank transfer
          </button>
        </div>
      </div>

      <!-- 复制成功提示 -->
      <div class="notification" id="notification">
        Text copied to clipboard!
      </div>

       <!-- 新增：支付相关通知（错误/加载状态，独立容器） -->
    <div class="payment-notification" id="paymentNotification">
    </div>

    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import QrcodeVue from 'qrcode.vue'
import domtoimage from 'dom-to-image-more'
import useClipboard from 'vue-clipboard3';

// 定义组件名称
defineOptions({
  name: 'THBQRPayment'
})

// 从URL获取交易号
const url = new URL(window.location.href)
const trade_no = url.pathname.split('/').pop()

// 响应式状态
const loading = ref(true)
const amount = ref(0)
const bankCardNumber = ref('')
const orderNumber = ref('')
const bankName = ref('')
const memo = ref('')
const payeeName = ref('')
const createTime = ref('')
const expireTime = ref('')
const qrCode = ref('')
const countdown = ref(600) // 10分钟倒计时（秒）
const error = ref('')
const qrCodeRef = ref(null)
const currentLocale = ref('en')
const success = ref(false)
let statusInterval = null
let timer = null

// 多语言配置（可根据需求补充）
const messages = {}

// 剪贴板功能
const { toClipboard } = useClipboard();
const copyText = (text) => {
  return new Promise((resolve, reject) => {
    try {
      toClipboard(text);
      // 显示复制成功提示（替代alert，更友好）
      const notification = document.getElementById('notification');
      notification.classList.add('show');
      setTimeout(() => notification.classList.remove('show'), 2000);
      resolve(text);
    } catch (e) {
      alert('Copy failed, please try again');
      reject(e);
    }
  });
};

// 多语言翻译函数
const t = (key) => {
  const keys = key.split('.')
  return keys.reduce((obj, k) => obj?.[k], messages[currentLocale.value]) || key
}

// 语言切换处理
const changeLanguage = (event) => {
  currentLocale.value = event.target.value
  localStorage.setItem('payment-language', event.target.value)
}

// 格式化倒计时（分:秒）
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

// 启动倒计时
const startCountdown = () => {
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      clearInterval(timer)
      qrCode.value = '' // 倒计时结束清空二维码
    }
  }, 1000)
}

// 新增：支付相关通知工具函数（仅操作新容器，不影响复制提示）
const showPaymentNotification = (message, type = 'success') => {
  const notification = document.getElementById('paymentNotification');
  // 设置通知内容和状态（成功/错误）
  notification.textContent = message;
  notification.className = `payment-notification ${type}`;
  // 显示通知（2.5秒后自动隐藏）
  notification.classList.add('show');
  setTimeout(() => notification.classList.remove('show'), 2500);
};

// 优化：handlePayment 函数（仅使用新通知，不触碰复制提示）
const handlePayment = async () => {
  // 1. 显示“支付验证中”提示（成功状态样式）
  showPaymentNotification('Verifying your payment...', 'success');

  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/payments/${trade_no}`);
    const { data } = response.data;

    if (data.status === 'success') {
      // 2. 支付成功：更新状态并提示
      success.value = true;
      clearInterval(statusInterval);
      showPaymentNotification('Payment confirmed successfully!', 'success');
    } else {
      // 3. 支付未确认：错误提示
      showPaymentNotification('Payment not confirmed yet. Please check if the transfer is completed.', 'error');
    }
  } catch (err) {
    console.error('Payment check failed:', err);
    // 4. 网络/接口错误：分场景提示
    const errorMsg = err.message.includes('Network Error') 
      ? 'Network error. Please check your internet connection and try again.' 
      : 'Failed to verify payment. Please try again later.';
    showPaymentNotification(errorMsg, 'error');
  }
};

// 获取支付信息
const getPaymentInfo = async () => {
  loading.value = true
  error.value = ''

  try {
    if (!trade_no) throw new Error('Missing trade number')

    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/payments/${trade_no}`)
    const { data } = response.data

    if (data) {
      // 若已支付成功，直接显示成功页面
      if (data.status === 'success') {
        success.value = true
        if (timer) clearInterval(timer)
      }

      // 赋值支付信息
      bankCardNumber.value = data.bank_card_number
      amount.value = data.amount
      orderNumber.value = data.trade_no
      bankName.value = data.bank_name
      memo.value = data.memo
      payeeName.value = data.payee_name

      // 使用接口返回的倒计时（若有）
      if (data.countdown) countdown.value = data.countdown
      startCountdown()
    } else {
      error.value = 'Failed to obtain payment information'
    }
  } catch (err) {
    console.error('Get payment info failed:', err)
    error.value = 'Failed to obtain payment information'
  } finally {
    loading.value = false
  }
}

// 定时轮询支付状态（15秒一次）
statusInterval = setInterval(async () => {
  if (countdown.value <= 0) return // 倒计时结束停止轮询
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/payments/${trade_no}`)
    if (response.data.data.status === 'success') {
      success.value = true
      clearInterval(statusInterval);
      if (timer) clearInterval(timer)
    }
  } catch (err) {
    console.error('Status poll failed:', err)
  }
}, 15000);

// 监听倒计时结束
watch(countdown, (newVal) => {
  if (newVal <= 0) {
    qrCode.value = ''
    if (statusInterval) clearInterval(statusInterval);
  }
})

// 生命周期钩子
onMounted(() => {
  // 初始化语言（优先使用本地存储）
  const savedLanguage = localStorage.getItem('payment-language')
  if (savedLanguage) {
    currentLocale.value = savedLanguage
  } else {
    localStorage.setItem('payment-language', 'en') // 默认英文（原代码逻辑修正）
    currentLocale.value = 'en'
  }

  // 获取支付信息
  getPaymentInfo()
})

onUnmounted(() => {
  // 清除定时器
  if (timer) clearInterval(timer)
  if (statusInterval) clearInterval(statusInterval);
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

body {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
  color: #333;
  line-height: 1.6;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.container {
  width: 100%;
  max-width: 800px;
  margin: 30px auto;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h1 {
  color: #2c3e50;
  font-size: 32px;
  margin-bottom: 10px;
  font-weight: 700;
}

.header p {
  color: #7f8c8d;
  font-size: 18px;
}

.card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 30px;
  margin-bottom: 30px;
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
}

.amount-display {
  text-align: center;
  margin-bottom: 25px;
  padding: 20px;
  background: linear-gradient(135deg, #3498db 0%, #2c3e50 100%);
  border-radius: 12px;
  color: white;
}

.amount-display h2 {
  font-size: 42px;
  margin-bottom: 10px;
  font-weight: 700;
}

.amount-display p {
  font-size: 16px;
  opacity: 0.9;
}

/* 订单信息：Flex 布局核心样式 */
.order-info-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  /* 垂直方向间距 */
  margin-bottom: 20px;
}

.order-info-item {
  display: flex;
  align-items: center;
  /* 垂直居中 */
  justify-content: space-between;
  /* 横向分布 */
  padding: 15px 10px;
  border-bottom: 1px solid #ecf0f1;
  /* 分隔线 */
}

.order-info-item:last-child {
  border-bottom: none;
}

.info-label {
  color: #7f8c8d;
  font-weight: 500;
  width: 30%;
  /* PC端固定宽度 */
  min-width: 120px;
  /* 防止过窄换行 */
}

.info-value {
  color: #2c3e50;
  font-weight: 600;
  font-size: 18px;
  width: 45%;
  /* PC端中间区域宽度 */
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  /* 超长文本省略 */
  white-space: nowrap;
}

.copy-btn {
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 15px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 5px;
  width: 20%;
  /* PC端按钮宽度 */
  justify-content: center;
}

.copy-btn:hover {
  background: #2980b9;
  transform: scale(1.05);
}

.note {
  background: #fff8e1;
  padding: 20px;
  border-radius: 12px;
  margin: 25px 0;
  border-left: 5px solid #ffc107;
}

.note p {
  color: #e65100;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
}

.guide {
  margin-top: 25px;
}

.guide h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #ecf0f1;
  font-size: 22px;
}

.guide-list {
  list-style: none;
}

.guide-list li {
  padding: 12px 0;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  /* 图标与文字间距 */
}

.warning-icon {
  color: #e74c3c;
  margin-top: 4px;
}

.payment-btn {
  display: block;
  width: 100%;
  padding: 18px;
  background: #2ecc71;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 25px;
  box-shadow: 0 4px 15px rgba(46, 204, 113, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.payment-btn:hover {
  background: #27ae60;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(46, 204, 113, 0.4);
}

.expiry-warning {
  color: #e74c3c;
  text-align: center;
  font-weight: 600;
  margin: 20px 0;
  padding: 15px;
  background: #ffebee;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.footer {
  text-align: center;
  margin-top: 30px;
  color: #7f8c8d;
  font-size: 14px;
}

/* 复制成功提示 */
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 25px;
  background: #2ecc71;
  color: white;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  transform: translateX(150%);
  transition: transform 0.3s ease;
  z-index: 1000;
}

.notification.show {
  transform: translateX(0);
}

/* 加载状态（补充样式，原代码缺失） */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* 错误提示样式（补充） */
.error-message {
  background: #ffebee;
  color: #e74c3c;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  margin-bottom: 20px;
  font-weight: 500;
}

/* 响应式：平板及以下（<768px）- 核心调整：信息可换行，按钮同行 */
@media (max-width: 768px) {
  .header h1 {
    font-size: 28px;
  }

  .amount-display h2 {
    font-size: 36px;
  }

  .card {
    padding: 20px;
  }

  /* 订单信息：标签左固定 + 内容换行 + 按钮右固定 */
  .order-info-item {
    flex-direction: row; /* 保持横向布局 */
    align-items: flex-start; /* 标签和按钮与内容顶部对齐（避免内容换行后错位） */
    padding: 12px 10px;
    gap: 10px; /* 标签、内容、按钮之间的间距 */
  }

  /* 标签：左固定宽度，不换行 */
  .info-label {
    width: 25%;
    min-width: 80px; /* 确保标签不被压缩 */
    padding-bottom: 0;
    border-bottom: none;
    font-size: 14px;
    white-space: nowrap; /* 标签文字强制不换行 */
    color: #7f8c8d;
  }

  /* 内容区：占据中间所有空间，允许换行（核心） */
  .info-value {
    width: calc(75% - 80px); /* 总宽度 - 标签宽度 - 按钮宽度，确保不挤压按钮 */
    font-size: 15px;
    padding-left: 0;
    white-space: normal; /* 允许内容自动换行 */
    word-wrap: break-word; /* 长文本（如账号）强制换行，避免溢出 */
    line-height: 1.5; /* 换行后文字更易读 */
  }

  /* 复制按钮：右固定宽度，与内容行保持同行 */
  .copy-btn {
    width: 80px; /* 固定按钮宽度，不随内容变化 */
    margin-top: 0;
    padding: 6px 0; /* 上下内边距适配，左右居中 */
    font-size: 12px;
    flex-shrink: 0; /* 禁止按钮被压缩 */
  }

  .guide-list li {
    flex-direction: row;
    gap: 8px;
  }

  .warning-icon {
    margin-top: 2px;
    margin-bottom: 0;
  }
}

/* 响应式：手机（<480px）- 进一步适配小屏幕 */
@media (max-width: 480px) {
  .header h1 {
    font-size: 24px;
  }

  .amount-display h2 {
    font-size: 32px;
  }

  .payment-btn {
    padding: 15px;
    font-size: 16px;
  }

  .note {
    padding: 15px;
  }

  .order-info-container {
    gap: 15px; /* 增加项与项之间的间距，避免换行后拥挤 */
  }

  .order-info-item {
    padding: 10px 5px;
    gap: 8px;
  }

  /* 标签：微调宽度适配手机 */
  .info-label {
    width: 28%;
    min-width: 70px;
    font-size: 13px;
  }

  /* 内容区：适配手机宽度 */
  .info-value {
    width: calc(72% - 70px); /* 同步调整宽度计算 */
    font-size: 14px;
  }

  /* 按钮：缩小宽度适配手机 */
  .copy-btn {
    /* width: 70px; */
    padding: 5px 0;
    font-size: 11px;
  }

  /* 错误通知样式（保持原逻辑） */
  .notification.error {
    background: #e74c3c;
  }

  .notification.success {
    background: #2ecc71;
  }
}
/* 响应式：手机（<480px）- 进一步优化紧凑度 */
@media (max-width: 480px) {
  .header h1 {
    font-size: 24px;
  }

  .amount-display h2 {
    font-size: 32px;
  }

  .payment-btn {
    padding: 15px;
    font-size: 16px;
  }

  .note {
    padding: 15px;
  }

  .order-info-container {
    gap: 8px;
  }

  .order-info-item {
    padding: 10px 5px;
    gap: 5px; /* 进一步缩小间距 */
  }

  .info-label {
    width: 28%; /* 微调标签宽度，适配极小屏幕 */
    min-width: 70px;
    font-size: 13px;
  }

  .info-value {
    width: 42%;
    font-size: 14px;
  }

  .copy-btn {
    /* width: 30%; */
    padding: 5px 5px;
    font-size: 11px;
  }

  /* 错误通知样式（保持原逻辑） */
  .notification.error {
    background: #e74c3c;
  }

  .notification.success {
    background: #2ecc71;
  }
}

/* 响应式：手机（<480px） */
@media (max-width: 480px) {
  .header h1 {
    font-size: 24px;
  }

  .amount-display h2 {
    font-size: 32px;
  }

  .payment-btn {
    padding: 15px;
    font-size: 16px;
  }

  .note {
    padding: 15px;
  }

  .order-info-container {
    gap: 8px;
  }

  .order-info-item {
    padding: 10px 8px;
  }

  .info-value {
    font-size: 15px;
  }

  /* 错误通知（与成功通知样式统一，仅颜色区分） */
.notification.error {
  background: #e74c3c; /* 错误色：红色 */
}

/* 保持原有成功通知样式（无需修改） */
.notification.success {
  background: #2ecc71; /* 成功色：绿色 */
}
}

/* 新增：支付通知样式（独立样式，位置与复制提示错开） */
.payment-notification {
  position: fixed;
  top: 80px; /* 与复制提示上下错开，避免重叠 */
  right: 20px;
  padding: 15px 25px;
  color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateX(150%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); /* 缓动动画更自然 */
  z-index: 1000;
  font-weight: 500;
}

/* 支付通知-成功状态（如“验证中”） */
.payment-notification.success {
  background: #2ecc71; /* 与复制提示同色系，保持风格统一 */
}

/* 支付通知-错误状态 */
.payment-notification.error {
  background: #e74c3c; /* 错误色：红色，区分状态 */
}

.payment-notification.show {
  transform: translateX(0);
}
</style>