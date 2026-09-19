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
        </select>
      </div>

      <!-- 警告提示 -->
      <div class="warning-tip" v-if="!error && channelId != 7010" >
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
            <div class="label">{{ t('order.amount') }}</div>
            <div class="value">{{ amount }} THB</div>
          </div>
        </div>

        <div class="order-details">
          <div class="detail-item">
            <span>{{ t('order.number') }}</span>
            <span>{{ orderNumber }}</span>
          </div>
        </div>
      </div>
      
      <div v-if="!error && !success && channelId == 7010">
      
      <div class="container" >
        <div class="card">
          <!-- 金额展示 -->
          <div class="amount-display">
            <h2>฿{{ amount }}</h2>
            <p>{{t('tips.1')}}</p>
          </div>

          <!-- 倒计时提示 -->
          <div class="expiry-warning">
            <i class="fas fa-clock"></i> {{t('tips.2')}} {{ formatTime(countdown) }}
          </div>

          <!-- 订单信息 -->
          <div class="order-info-container">
            <!-- 银行 -->
            <div class="order-info-item">
              <div class="info-label">{{ t('bank') }}</div>
              <div class="info-value">{{ bankName }}</div>
              <button class="copy-btn" @click="copyText(bankName)">
                <i class="fas fa-copy"></i>{{ t('copy') }}
              </button>
            </div>
            <!-- 户名 -->
            <div class="order-info-item">
              <div class="info-label">{{ t('name') }}</div>
              <div class="info-value">{{ payeeName }}</div>
              <button class="copy-btn" @click="copyText(payeeName)">
                <i class="fas fa-copy"></i>{{ t('copy') }}
              </button>
            </div>

            <!-- 账号 -->
            <div class="order-info-item">
              <div class="info-label">{{ t('account') }}</div> 
              <div class="info-value">{{ bankCardNumber }}</div>
              <button class="copy-btn" @click="copyText(bankCardNumber)">
                <i class="fas fa-copy"></i> {{ t('copy') }}
              </button>
            </div>
            <!-- 金额 -->
            <div class="order-info-item">
              <div class="info-label">{{ t('amount') }}</div>
              <div class="info-value">฿{{ amount }}</div>
              <button class="copy-btn" @click="copyText(`${amount}`)">
                <i class="fas fa-copy"></i> {{ t('copy') }}
              </button>
            </div>
            <!-- 备注 -->
            <!-- <div class="order-info-item">
              <div class="info-label">{{ t('note') }}</div>
              <div class="info-value">{{ memo }}</div>
              <button class="copy-btn" @click="copyText(memo)">
                <i class="fas fa-copy"></i> {{ t('copy') }}
              </button>
            </div> -->
            <!-- 订单号 -->
            <div class="order-info-item">
              <div class="info-label">{{ t('order.number') }}</div>
              <div class="info-value">{{ orderNumber }}</div>
              <button class="copy-btn" @click="copyText(orderNumber)">
                <i class="fas fa-copy"></i> {{ t('copy') }}
              </button>
            </div>


          </div>

          <!-- 备注提示 -->
          <!-- <div class="note">
            <p><i class="fas fa-exclamation-circle"></i> {{t('tips.3')}}</p>
          </div> -->
        </div>

        <!-- 支付指南与按钮 -->
        <div class="card">
          <div class="guide">
            <h3>{{t('paymentGuide')}}</h3>
            <ul class="guide-list">
              <li>
                <i class="warning-icon">⚠️</i>
                <span>{{t('tips.4')}}</span>
              </li>
              <!-- <li>
                <i class="warning-icon">⚠️</i>
                <span>{{t('tips.5')}}</span>
              </li> -->
              <li>
                <i class="warning-icon">⚠️</i>
                <span>{{t('tips.6')}}</span>
              </li>
         
            </ul>
          </div>

      
        </div>
      </div>

      <!-- 复制成功提示 -->
      <div class="notification" id="notification">
       {{t('tips.7')}}
      </div>

        <!-- 新增：支付相关通知（错误/加载状态，独立容器） -->
        <div class="payment-notification" id="paymentNotification">
        </div>
      </div>
   
      <div v-if="!error && !success && channelId != 7010">
        <!-- 订单信息 -->
        <div class="order-info">
          <div class="countdown">
            {{ formatTime(countdown) }}
          </div>
          <div class="amount">
            <div class="label">{{ t('order.amount') }}</div>
            <div class="value">{{ amount }} THB</div>
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
import useClipboard from 'vue-clipboard3';

// 定义组件名称
defineOptions({
  name: 'THBQRPayment'
})

// 响应式状态
const url = new URL(window.location.href)
const trade_no = url.pathname.split('/').pop()
    
const loading = ref(true)
const amount = ref(0)
const channelId = ref('')
const bankCardNumber = ref('')
const bankName = ref('')
const memo = ref('')
const payeeName = ref('')
const orderNumber = ref('')
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
    tips:{
      1:"Use this account for this transaction only,Copy the card number and amount, fill in the transfer form on the bank card",  
      2:"Account expires within",
      3: "Fill in the Note/Remark/Narration when transferring please.",
      4: "Please complete the payment within the specified time! Otherwise your account will not be credited!",
      5: "Please fill in the Note when transferring, Otherwise it will not be automatically credited!",
      6: "Please do not transfer funds to accounts twice, do not save these accounts to make payments, or you will lose your money!",
      7: "Text copied to clipboard!"
    },
    copy: "Copy",
    paymentGuide: "Payment Guide",
    bank:"Bank",
    name: "Name",
    account: "Account",
    note: 'Note',
    amount: "Amount",
    loading: { text: 'Loading payment information...' },
    warning: { title: 'Warning', qrOneTime: 'Long press to save the QR code, please do not make duplicate payments! Otherwise, the funds cannot be returned!' },
    order: { bankCardNumber: "Account number", amount: 'Order Amount', number: 'Transaction Number', createTime: 'Creation Time', expireTime: 'Expiration Time' },
    qr: { expired: 'QR Code Expired', save: 'Save QR Code' },
    error: { invalidParams: 'Invalid payment parameters', getInfoFailed: 'Failed to get payment information', retry: 'Failed to get payment information, please try again', saveFailed: 'Failed to save QR code, please try again' }
  },
  zh: {
    tips:{
      1:"仅将此帐户用于此交易,复制卡号金额在银行卡填写转账",  
      2:"账户有效期为",
      3: "转账时请填写备注 / 附言 / 摘要",
      4: "请在规定时间内完成付款！否则账户将无法到账！",
      5: "转账时请填写备注，否则将无法自动到账！",
      6: "请勿向账户重复转账，切勿保存此类账户用于付款，否则可能导致资金损失!",
      7: "文本已复制到剪贴板"
    },
    copy: "复制",
    paymentGuide: "支付指南",
    bank:"银行",
    name: "名字",
    account: "账号",
    amount: "金额",
    note: '备注',
    loading: { text: '正在加载支付信息...' },
    warning: { title: '警告', qrOneTime: '长按保存二维码,请不要重复支付！否则资金无法返回！' },
    order: { bankCardNumber: '账号', amount: '订单金额', number: '交易单号', createTime: '订单生成时间', expireTime: '订单过期时间' },
    qr: { expired: '二维码已过期', save: '保存二维码' },
    error: { invalidParams: '无效的支付参数', getInfoFailed: '获取支付信息失败', retry: '获取支付信息失败，请稍后重试', saveFailed: '保存二维码失败，请重试' }
  },
  th: {
    tips:{
     "1": "ใช้บัญชีนี้สำหรับการทำธุรกรรมครั้งนี้เท่านั้น,คัดลอกหมายเลขบัตร จำนวนเงิน กรอกการโอนเงินผ่านบัตรธนาคาร",
      "2": "บัญชีหมดอายุภายใน",
      "3": "โปรดกรอกหมายเหตุ/ข้อความเพิ่ม/รายละเอียดเมื่อทำการโอนเงิน",
      "4": "โปรดเสร็จสิ้นการชำระเงินภายในเวลาที่กำหนด! มิฉะนั้นบัญชีของคุณจะไม่เข้าถึงเงิน (ไม่เข้าระบบ)!",
      "5": "โปรดกรอกหมายเหตุเมื่อทำการโอนเงิน มิฉะนั้นจะไม่เข้าถึงเงินอัตโนมัติ (ไม่เข้าระบบอัตโนมัติ)!",
      "6": "อย่าโอนเงินเข้าไปในบัญชีซ้ำๆ อย่าเก็บบัญชีเหล่านี้ไว้สำหรับการชำระเงิน มิฉะนั้นคุณอาจสูญเสียเงินได้!",
      "7": "ข้อความถูก скопирован в буфер обмена!"
    },
    copy: "คัดลอก",
    paymentGuide: "แนะนำการชำระเงิน",
    bank:"ธนาคาร",
    name: "ชื่อ",
    account: "บัญชี",
    amount: "จำนวนเงิน",
    note: 'หมายเหตุ',
    loading: { text: 'กำลังโหลดข้อมูลการชำระเงิน...' },
    warning: { title: 'คำเตือน', qrOneTime: 'กดยาวเพื่อบันทึกรหัส QR โปรดอย่าชำระเงินซ้ำ! ไม่งั้นเงินจะคืนไม่ได้!' },
    order: { bankCardNumber: 'หมายเลขบัญชี',amount: 'จำนวนเงิน', number: 'หมายเลขธุรกรรม', createTime: 'เวลาสร้าง', expireTime: 'เวลาหมดอายุ' },
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

      bankCardNumber.value = data.bank_card_number
      amount.value = data.amount
      orderNumber.value = data.trade_no
      qrCode.value = String(data.qr_code_url)
      channelId.value = data.channel_id
      bankName.value = data.bank_name
      memo.value = data.memo
      payeeName.value = data.payee_name

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
      localStorage.setItem('payment-language', 'th')
      currentLocale.value = 'th'
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
    font-size: 32px;
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
  margin: 0 auto;
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
  margin: 0 auto;
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
  /* transform: translateY(-5px); */
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
  word-wrap: break-word;
  /* overflow: hidden;
  text-overflow: ellipsis; */
  /* 超长文本省略 */
  /* white-space: nowrap; */
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
  width: 15%;
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
    width: 50px; /* 固定按钮宽度，不随内容变化 */
    margin-top: 0;
    padding:  0; /* 上下内边距适配，左右居中 */
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