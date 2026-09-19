<template>
  <div class="payment-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <div class="loading-text">{{ t('loading.text') }}</div>
    </div>

    <template v-else>
      <!-- 语言切换 -->
      <div class="language-switcher">
        <select v-model="currentLocale" @change="changeLanguage">
          <option value="en">English</option>
          <option value="zh">中文</option>
          <option value="th">ไทย</option>
          <option value="vn">Vietnamese</option>
        </select>
      </div>

      <!-- 警告提示 -->
      <div class="warning-tip" v-if="!error">
        <i class="warning-icon">⚠️</i>
        {{ t('warning.qrOneTime') }}
      </div>

      <div class="error-message" v-if="error">
        {{ error }}
      </div>

      <div v-if="success" class="pay-close-desc" style="text-align: center;margin-bottom: 20px">
        <img src="@/assets/ok.png" style="width: 60px;height: auto;margin-top: 20px;margin-bottom: 20px">

          <div class="order-info">
      
          <div class="amount">
            <div class="label">{{ t('order.amount') }} {{bankName}}</div>
            <div class="value">{{ amount }} <span>ETC</span></div> 
          </div>
        </div>

        <div class="order-details">
          <div class="detail-item">
            <span style="text-align: left;">{{ t('order.number') }}</span>
            <span>{{ orderNumber }}</span>
          </div>
          <div class="detail-item">
            <span style="text-align: left;">{{ t('order.bankCardNumber') }}</span>
            <span>{{ bankCardNumber }}</span>
          </div>
        </div>
      </div>
      

      <div v-if="!error && !success">
        <!-- 订单信息 -->
        <div class="order-info">
          <div class="countdown">
            {{ formatTime(countdown) }}
          </div>
          <div class="amount">
            <div class="label">{{ t('order.amount') }} {{bankName}}</div>
            <div class="value">{{ amount }} <span>ETC</span></div> 
          </div>
        </div>

        <!-- 二维码区域 -->
        <div class="qr-container">
          <div v-if="qrCode" class="qr-wrapper">
            <div class="qr-code">
              <img id="dialogQrcode" class="pay-code" style="width:65%" :src="qrCode">
            </div>
            <!-- Debug info -->
            <div class="debug-info">
              <!-- <small>QR Data Length: {{ qrCode.length }}</small> -->
            </div>
          </div>
          <div class="qr-expired" v-else>
            {{ t('qr.expired') }}
          </div>
        </div>

        <!-- 订单信息 -->
        <div class="order-details">
          <div class="detail-item">
            <span>{{ t('order.number') }}</span>
            <span>{{ orderNumber }}</span>
          </div>

          <div class="detail-item">
            <span>{{ t('order.bankCardNumber') }}</span>
            <span>{{ bankCardNumber }}</span>
          </div>

        </div>

        <!-- 保存二维码按钮 -->
        <div class="action-button">
          <button @click="saveQRCode">{{ t('qr.save') }}</button>
        </div>
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

// 定义组件名称
defineOptions({
  name: 'UsdtQRPayment'
})

// 响应式状态
const url = new URL(window.location.href)
const trade_no = url.pathname.split('/').pop()
    
const loading = ref(true)
const amount = ref(0)
const bankCardNumber = ref('')
const orderNumber = ref('')
const bankName = ref('')
const createTime = ref('')
const expireTime = ref('')
const qrCode = ref('')
const countdown = ref(600) // 10分钟倒计时
const error = ref('')
const qrCodeRef = ref(null)
const currentLocale = ref('th') // 默认设置为泰语
const success = ref(false)
let statusInterval = null

// 多语言消息配置
const messages = {
  en: {
    loading: { text: 'Loading payment information...' },
    warning: { title: 'Warning', qrOneTime: 'Long press to save the QR code, please do not make duplicate payments! Otherwise, the funds cannot be returned, Pay according to the order amount, otherwise it will not be credited to the account!' },
    order: {bankCardNumber: "Account number", amount: 'Order Amount', number: 'Transaction Number', createTime: 'Creation Time', expireTime: 'Expiration Time' },

    qr: { expired: 'QR Code Expired', save: 'Save QR Code' },
    error: { invalidParams: 'Invalid payment parameters', getInfoFailed: 'Failed to get payment information', retry: 'Failed to get payment information, please try again', saveFailed: 'Failed to save QR code, please try again' }
  },
  vn: {
    loading: { text: 'Đang tải thông tin thanh toán...' }, // “加载”对应“Đang tải”，符合越南语APP加载提示常用表达
    warning: { 
        title: 'Cảnh báo', // “警告”标准翻译，适用于系统提示场景
        qrOneTime: 'Nhấn giữ để lưu mã QR, vui lòng không thực hiện thanh toán trùng lặp! Nếu không, tiền không thể hoàn lại. Vui lòng thanh toán theo số tiền đơn hàng, nếu không sẽ không được ghi nộp vào tài khoản!' 
        // 补充“vui lòng”（请）使语气更礼貌；“ghi nộp vào tài khoản”（入账）为支付场景专业表述，比直译“credited to the account”更符合越南本地支付习惯
    },
    order: {
        bankCardNumber: "Số tài khoản", // “账号”在支付场景中统一译为“Số tài khoản”（账户号码），比“Số thẻ ngân hàng”（银行卡号）更通用（涵盖非银行卡支付场景）
        amount: 'Số tiền đơn hàng', // “订单金额”标准翻译，“Số tiền”明确“金额”属性
        number: 'Mã giao dịch', // “交易号”专业表述，越南支付系统通用
        createTime: 'Thời gian tạo', // “创建时间”简洁准确
        expireTime: 'Thời gian hết hạn' // “过期时间”标准表达，贴合订单/二维码失效场景
    },
    qr: { 
        expired: 'Mã QR đã hết hạn', // “二维码已过期”，用“đã”强调状态，符合提示语逻辑
        save: 'Lưu mã QR' // “保存二维码”，省略冗余词汇，简洁清晰
    },
    error: { 
        invalidParams: 'Tham số thanh toán không hợp lệ', // “支付参数无效”，“tham số”（参数）为技术场景通用词
        getInfoFailed: 'Lấy thông tin thanh toán thất bại', // “获取支付信息失败”，“lấy...thất bại”（获取...失败）是越南语技术报错常用结构
        retry: 'Không thể lấy thông tin thanh toán, vui lòng thử lại', // 补充“Không thể”（无法）使语义更完整，“thử lại”（重试）自然易懂
        saveFailed: 'Không thể lưu mã QR, vui lòng thử lại' // 同上述逻辑，优化语义连贯性
    }
  },
  zh: {
    loading: { text: '正在加载支付信息...' },
    warning: { title: '警告', qrOneTime: '长按保存二维码,请不要重复支付！否则资金无法返回！按照订单金额支付，不然无法到账' },
    order: { bankCardNumber: '账号', amount: '订单金额', number: '交易单号', createTime: '订单生成时间', expireTime: '订单过期时间' },
    qr: { expired: '二维码已过期', save: '保存二维码' },
    error: { invalidParams: '无效的支付参数', getInfoFailed: '获取支付信息失败', retry: '获取支付信息失败，请稍后重试', saveFailed: '保存二维码失败，请重试' }
  },
  th: {
    loading: { text: 'กำลังโหลดข้อมูลการชำระเงิน...' },
    warning: { title: 'คำเตือน', qrOneTime: 'กดยาวเพื่อบันทึกรหัส QR โปรดอย่าชำระเงินซ้ำ! ไม่งั้นเงินจะคืนไม่ได้!' },
    order: { bankCardNumber: 'หมายเลขบัญชี', amount: 'จำนวนเงิน', number: 'หมายเลขธุรกรรม', createTime: 'เวลาสร้าง', expireTime: 'เวลาหมดอายุ' },
    qr: { expired: 'รหัส QR หมดอายุ', save: 'บันทึกรหัส QR' },
    error: { invalidParams: 'พารามิเตอร์การชำระเงินไม่ถูกต้อง', getInfoFailed: 'ไม่สามารถรับข้อมูลการชำระเงิน', retry: 'ไม่สามารถรับข้อมูลการชำระเงิน โปรดลองอีกครั้ง', saveFailed: 'ไม่สามารถบันทึกรหัส QR โปรดลองอีกครั้ง' }
  }
}

// 多语言翻译函数
const t = (key) => {
  const keys = key.split('.')
  return keys.reduce((obj, k) => obj?.[k], messages[currentLocale.value]) || key
}

let timer = null

// 语言切换处理
const changeLanguage = (event) => {
  currentLocale.value = event.target.value
  // 保存语言选择到 localStorage
  localStorage.setItem('payment-language', event.target.value)
}

// 格式化倒计时时间
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
      qrCode.value = '' // 清空二维码
    }
  }, 1000)
}

// 保存二维码
const saveQRCode2 = () => {
  if (!document.getElementById('dialogQrcode')) {
    error.value = t('error.saveFailed')
    return
  }
  
  domtoimage.toPng(document.getElementById('dialogQrcode'))
    .then((dataUrl) => {
      const img = new Image()
      img.src = dataUrl
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0, img.width, img.height)
        canvas.toBlob((blob) => {
          if (navigator.msSaveBlob) {
            navigator.msSaveBlob(blob, 'qrcode.png')
          } else if (navigator.saveBlob) {
            navigator.saveBlob(blob, 'qrcode.png')
          } else {
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.download = 'qrcode.png'
            a.href = url
            // 确保在 iOS 上可点击
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
          }
        }, 'image/png')
      }
    })
    .catch(() => {
      error.value = t('error.saveFailed')
    })
}

const saveQRCode = () => {

  
  const link = document.createElement('a');
  link.href = qrCode.value;
  link.download = 'qrcode.png';
  link.click();


  return 

  
  if (!document.getElementById('dialogQrcode')) {
    error.value = t('error.saveFailed')
    return
  }
  
  domtoimage.toPng(document.getElementById('dialogQrcode'))
    .then((dataUrl) => {
      const img = new Image()
      img.src = dataUrl
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0, img.width, img.height)
        const dataURL = canvas.toDataURL('image/png')
        const a = document.createElement('a')
        a.download = 'qrcode.png'
        a.href = dataURL
        a.click()
        a.remove()
      }
    })
    .catch(() => {
      error.value = t('error.saveFailed')
    })
}

// 获取支付信息
const getPaymentInfo = async () => {
  loading.value = true
  error.value = ''
  
  try {

    if (!trade_no) {
      throw new Error('Missing trade number')
    }
    
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/payments/${trade_no}`)
    const { data } = response.data
    
    if (data) {
      if (data.status === 'success') {
        success.value = true
        if (timer) clearInterval(timer)
      }
      
      amount.value = data.amount
      bankCardNumber.value = data.bank_card_number
      orderNumber.value = data.trade_no
      bankName.value = data.bank_name
      qrCode.value = String(data.qr_code_url)

      const rand = trade_no + Math.random().toString(36).substring(2) + Date.now().toString(36);
      qrCode.value = import.meta.env.VITE_API_URL + '/api/payments-qrcode/' + trade_no + '?rand=' + rand
      
      if (data.countdown) {
        countdown.value = data.countdown
      }
      
      startCountdown()
    } else {
      error.value = t('error.getInfoFailed')
    }
  } catch (err) {
    console.error('获取支付信息失败:', err)
    error.value = t('error.retry')
  } finally {
    loading.value = false
  }
}

statusInterval = setInterval(async () => {
  await axios
    .get(import.meta.env.VITE_API_URL + '/api/payments/' + trade_no)
    .then(function (response) {
      if (response.data.data.status == 'success') {
        success.value = true
        clearInterval(statusInterval);
      }
    })
}, 15000);



// 监听倒计时变化
watch(countdown, (newVal) => {
  if (newVal <= 0) {
    qrCode.value = ''
    if (statusInterval) {
      clearInterval(statusInterval);
    }
  }
})


// 生命周期钩子
onMounted(() => {
  // 设置默认语言
  const savedLanguage = localStorage.getItem('payment-language')
  if (savedLanguage) {
    currentLocale.value = savedLanguage
  }else{
    if (typeof window !== 'undefined') {
      localStorage.setItem('payment-language', 'en')
      currentLocale.value = 'en'
    }
  }
  
  getPaymentInfo()

})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }

  if (statusInterval) {
    clearInterval(statusInterval);
  }

})
</script>

<style scoped>
/* 加载动画样式 */
.loading-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

.loading-text {
  color: #666;
  font-size: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.language-switcher {
  position: absolute;
  top: 20px;
  right: 20px;
}

.language-switcher select {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background: white;
  font-size: 14px;
  cursor: pointer;
}

/* 保持原有样式 */
.payment-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  min-height: 100vh;
  position: relative;
}

.error-message {
  background: #fff2f0;
  border: 1px solid #ffccc7;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
  color: #ff4d4f;
  text-align: center;
}

.warning-tip {
  background: #fff7e6;
  border: 1px solid #ffe7ba;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  color: #d46b08;
  margin-top: 50px;
}

.warning-icon {
  margin-right: 8px;
}

.order-info {
  text-align: center;
  margin-bottom: 20px;
}

.countdown {
  font-size: 24px;
  color: #333;
  margin-bottom: 10px;
}

.amount {
  .label {
    font-size: 14px;
    color: #666;
    margin-bottom: 5px;
  }
  .value {
    color: #ff4d4f;
    font-size: 28px;
    font-weight: bold;
  }
}

.qr-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.debug-info {
  color: #666;
  font-size: 12px;
  margin-top: 8px;
}

.qr-container {
  background: #f8f8f8;
  padding: 1;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 1px;
}

.qr-code {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin: 10px auto;
  width: fit-content;
}

.qr-expired {
  color: #ff4d4f;
  font-size: 16px;
  padding: 40px 0;
}

.payment-methods {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;

  .method-icon {
    width: 40px;
    height: 40px;
    object-fit: contain;
  }
}


.order-details {
  background: #f8f8f8;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  max-width: 100%;

  .detail-item {
    display: flex;
    justify-content: space-between;
    padding: 12px 0;
    font-size: 14px;
    color: #666;
    flex-wrap: wrap;

    &:not(:last-child) {
      border-bottom: 1px solid #eee;
    }

    span:last-child {
      text-align: left;
    }

    span {
      word-break: break-all;
      padding: 0 4px;
      min-width: 45%;
    }
  }
}

.order-details2 {
  background: #f8f8f8;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;

  .detail-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    font-size: 14px;
    color: #666;

    &:not(:last-child) {
      border-bottom: 1px solid #eee;
    }
  }
}

.action-button {
  text-align: center;

  button {
    background: #1890ff;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    transition: background 0.3s;

    &:hover {
      background: #40a9ff;
    }
  }
}
</style>