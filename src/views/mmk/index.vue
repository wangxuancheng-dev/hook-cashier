<template>
  <div class="top-up-container">
    <!-- 顶部步骤与信息栏 -->
    <div class="top-bar">
      <div class="payment-method">
        <span class="wavepay-tag"></span>
      </div>
      <span class="countdown">{{ formatTime(countdown) }}</span>
      <div class="step-indicator"></div>
    </div>

    <!-- 收款号区域 -->
    <div class="receiver-phone">
      <p class="section-label">အကောင့်နံပါတ်：</p>
      <div class="phone-display">
        <p class="phone-number">{{ bankCardNumber }}</p>
        <button class="copy-btn" @click="copyText(bankCardNumber)">ကော်ပီ</button>
      </div>
    </div>

    <!-- 金额区域 -->
    <div class="amount-area">
      <div class="amount-display">
        <h2 class="amount">Ks. {{ amount }} </h2>
        <button class="copy-btn" @click="copyText(amount)">ကော်ပီ</button>
      </div>
      <!-- <button class="confirm-amount">确认</button>
      <p class="amount-desc">请按此金额转账</p> -->
        <div v-if="!success" class="input-container">
        <input
          v-model="lastFiveDigits"
          type="text"
          placeholder="ကျေးဇူးပြု၍ အရောင်းအဝယ်နံပါတ်ကို ထည့်သွင်းပါ"
          class="transaction-input"
        />
        <button class="submit-btn" @click="submitTransaction">→</button>
        <!-- ငွေလွှဲပြီးနောက်လုပ်ငန်းစဉ်နံပါတ်ကိုထည့်ပါ။ -->
      </div>

      <div>
        <p v-if="success">အောင်မြင်သောငွေလွှဲပြောင်းပြီးပါပြီ။</p>
      </div>
      
    </div>




    <!-- 提示信息 -->
    <div class="tip-area">
      <p>ကျေးဇူးပြု၍ အရောင်းအဝယ်နံပါတ်ကို ထည့်သွင်းပါ, အောင်မြင်သောငွေလွှဲပြောင်းပြီးနောက် 5 မိနစ်အတွင်းငွေလွှဲပြောင်းလက်ခံရခြင်းမရှိပါက Customer Service ကိုဆက်သွယ်ပါ ကျေးဇူးပြု၍ တောင်းဆိုချက်ကို ထပ်မံမပြုပါ။</p>
    </div>

    <!-- 支持APP区域 -->
    <!-- <div class="support-app-area">
      <p>Support the following APP</p>
      <img
        src="https://via.placeholder.com/60"
        alt="支持的APP图标"
        class="app-icon"
      />
    </div> -->

    <!-- 注意事项区域 -->
    <div class="notes-area">
      <h3 class="notes-title">မှတ်ချက်များ</h3>
      <ol class="notes-list">
        <li>ကုန်သွယ်မှုနံပါတ်ကိုမထည့်သွင်းပါက / ထည့်သွင်းမှုအမှားကိုမထည့်သွင်းပါက, ကျေးဇူးပြု၍တိကျစွာဖြည့်သွင်းပ</li>
        <li>ကျေးဇူးပြု၍ သတ်မှတ်ထားသောအချိန်အတွင်းတွင်ပြန်လည်ထည့်သွင်းရန်အမိန့်ကိုတင်ပြန်ပြီးအချိန်ကျော်လွန် ကျေးဇူးပြု၍ ငွေပေးသွင်းပမာဏနှင့် ဖုန်းနံပါတ်ကို တိကျစွာ ရွေးချယ်ပါ/ထည့်သွင်းပါ။ မှားယွင်းသော ငွေပေးသွင</li>
        <li>တင်ပြထားသော အပြန်ထည့်သွင်းမှု အမိန့်ပမာဏသည် အမှန်တကယ် အပြန်ထည့်သွင်းမှု ပမာဏနှင့် ကိုက်ညီရမည်ဖြစ်ပြီး</li>
        <li>အောင်မြင်စွာပြန်ထည့်သွင်းမှုအမှာစာကိုတင်ပို့ခဲ့ပါက ၁၀ မိနစ်အတွင်းပြန်ထည့်သွင်းပါ။</li>
      </ol>
    </div>

    <div>
        <small data-v-200efed3="">အော်ဒါနံပါတ်： {{ trade_no }}</small>
    </div>

    <!-- 弹窗（错误/提示用） -->
    <div v-if="isPopupShow" class="popup-mask">
      <div class="popup-content">
        <!-- <h3>အကြံပေးချက်များ</h3> -->
        <h3></h3>
        <p>{{ popupMsg }}</p>
        <div class="popup-buttons">
          <button class="popup-cancel" @click="isPopupShow = false">ဖျက်သိမ်း</button>
          <button class="popup-confirm" @click="confirmPopup">အတည်ပြုချက်</button>
        </div>
      </div>
    </div>

    <!-- 支付成功跳转倒计时弹窗 -->
    <div v-if="isRedirectPopupShow" class="popup-mask">
      <div class="popup-content">
        <h3>အောင်မြင်သောငွေလွှဲပြောင်းပြီးပါပြီ။</h3>
        <p class="redirect-countdown">{{ redirectCountdown }} စက္ကန့်အတွင်း ပြန်လည်လမ်းညွှန်ပါမည်။</p>
        <div class="popup-buttons">
          <button class="popup-confirm" @click="doRedirect">ယခုသွားပါ</button>
        </div>
      </div>
    </div>
    
    <!-- 通知区域 -->
    <div id="paymentNotification" class="payment-notification"></div>
    <div id="notification" class="notification"></div>
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



// 响应式数据：交易号最后5位、弹窗显隐、弹窗提示语
const lastFiveDigits = ref('');
const isPopupShow = ref(false);
const popupMsg = ref('ထည့်သွင်းထားသော ကုန်သွယ်မှုနံပါတ်မှားယွင်းနိုင်သည်');


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
const returnUrl = ref('')
// 支付成功后是否跳转 return_url（false = 不跳转，仅显示成功提示）
const enableReturnUrlRedirect = true
// 跳转前倒计时秒数
const redirectCountdownSeconds = 5
const isRedirectPopupShow = ref(false)
const redirectCountdown = ref(0)
const pendingRedirectUrl = ref('')
let statusInterval = null
let timer = null
let redirectTimer = null

const clearRedirectTimer = () => {
  if (redirectTimer) {
    clearInterval(redirectTimer)
    redirectTimer = null
  }
}

const doRedirect = () => {
  if (!pendingRedirectUrl.value) return
  clearRedirectTimer()
  window.location.href = pendingRedirectUrl.value
}

const startRedirectCountdown = (url) => {
  pendingRedirectUrl.value = url
  redirectCountdown.value = redirectCountdownSeconds
  isRedirectPopupShow.value = true
  success.value = true
  clearRedirectTimer()
  redirectTimer = setInterval(() => {
    redirectCountdown.value--
    if (redirectCountdown.value <= 0) {
      doRedirect()
    }
  }, 1000)
}

const stopTimers = () => {
  if (statusInterval) {
    clearInterval(statusInterval)
    statusInterval = null
  }
  if (timer) clearInterval(timer)
}

const onPaymentSuccess = (data) => {
  stopTimers()
  const url = data?.return_url || returnUrl.value
  if (enableReturnUrlRedirect && url) {
    startRedirectCountdown(url)
    return
  }
  success.value = true
}

// 多语言配置（可根据需求补充）
const messages = {}

// 剪贴板功能
const { toClipboard } = useClipboard();
const copyText = (text) => {
  return new Promise((resolve, reject) => {
    try {
      toClipboard(String(text));
      // alert('အောင်မြင်စွာ ကူးယူခြင်း');
      isPopupShow.value = true;
      popupMsg.value = 'အောင်မြင်စွာ ကူးယူခြင်း';
      resolve(text);
    } catch (e) {
      console.error('Copy failed, please try again:', e);
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


// 提交交易号逻辑
const submitTransaction = async () => {
  
  if (!lastFiveDigits.value) {
    isPopupShow.value = true;
    popupMsg.value = 'ကုန်သွယ်မှုနံပါတ် ထည့်သွင်းမှုအမှားကိုစစ်ပါ။';
    return;
  }

  if(!/^\d+$/.test(lastFiveDigits.value)){
    isPopupShow.value = true;
    popupMsg.value = 'ကုန်သွယ်မှုနံပါတ် ထည့်သွင်းမှုအမှားကိုစစ်ပါ။';
    return;
  }

  
  // if(lastFiveDigits.value.slice(-1) != 5){
  //   isPopupShow.value = true;
  //   popupMsg.value = 'ကုန်သွယ်မှုနံပါတ် ထည့်သွင်းမှုအမှားကိုစစ်ပါ။';
  //   return;
  // }
  
  
  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/payments-no`, {
      trade_no: trade_no,
      no: lastFiveDigits.value,
    },{
    headers: {
      'Accept-Language': 'my'
    }
  })

    isPopupShow.value = true;
    popupMsg.value = response.data.message;
    success.value = true

  } catch (err) {

    if(err.response.data.data){
      isPopupShow.value = true;
      popupMsg.value = err.response.data.message;
      success.value = true
    }else{
      console.log(err.response.data.message)
      console.log(err.response)
      isPopupShow.value = true;
      popupMsg.value = err.response.data.message;
    }
    // console.error('Status poll failed:', err)
  }


};

// 弹窗“确认”按钮逻辑
const confirmPopup = () => {
  isPopupShow.value = false;
  lastFiveDigits.value = ''; // 重置输入框
};



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


// 获取支付信息
const getPaymentInfo = async () => {
  loading.value = true
  error.value = ''

  try {
    if (!trade_no) throw new Error('Missing trade number')

    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/payments/${trade_no}`)
    const { data } = response.data

    if (data) {
      returnUrl.value = data.return_url || ''

      // 若已支付成功，显示成功页面或跳转 return_url
      if (data.status === 'success') {
        onPaymentSuccess(data)
      }

      // 赋值支付信息
      bankCardNumber.value = data.bank_card_number
      amount.value = data.amount
      orderNumber.value = data.trade_no
      bankName.value = data.bank_name
      memo.value = data.memo
      payeeName.value = data.payee_name

      // 使用接口返回的倒计时（若有）
      if (data.status !== 'success' || !enableReturnUrlRedirect || !data.return_url) {
        if (data.countdown) countdown.value = data.countdown
        startCountdown()
      }
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



// 定时轮询支付状态（每 10 秒）
statusInterval = setInterval(async () => {
  if (success.value || countdown.value <= 0) return
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/payments/${trade_no}`)
    const data = response.data.data
    if (data?.return_url) returnUrl.value = data.return_url
    if (data?.status === 'success') {
      onPaymentSuccess(data)
    }
  } catch (err) {
    console.error('Status poll failed:', err)
  }
}, 10000)

// 支付成功时停止轮询与倒计时
watch(success, (newVal) => {
  if (newVal) stopTimers()
})

// 监听倒计时结束
watch(countdown, (newVal) => {
  if (newVal <= 0) {
    qrCode.value = ''
    if (statusInterval) {
      clearInterval(statusInterval)
      statusInterval = null
    }
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
  clearRedirectTimer()
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.top-up-container {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  padding: 16px;
  max-width: 500px;
  margin: 0 auto;
  background-color: #f8f9fa;
  min-height: 100vh;
  color: #333;
}

/* 顶部栏样式 */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 12px 16px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* .wavepay-tag {
  background: linear-gradient(135deg, #4a6bdf, #3a56c7);
  color: #fff;
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
} */

.countdown {
  background: #ff4757;
  color: #fff;
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
}

/* .step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: #4a6bdf;
  color: white;
  border-radius: 50%;
  font-weight: 600;
  font-size: 14px;
} */

/* 收款手机号区域 */
.receiver-phone {
  background-color: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-label {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #666;
}

.phone-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.phone-number {
  margin: 0;
  font-weight: 700;
  color: #ff4757;
  font-size: 18px;
}

.copy-btn {
  background: #4a6bdf;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

.copy-btn:hover {
  background: #3a56c7;
}

/* 金额区域 */
.amount-area {
  text-align: center;
  background-color: white;
  padding: 10px 10px;
  border-radius: 12px;
  /* margin-bottom: 20px; */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom:20px;
}

.amount {
  color: #ff4757;
  margin: 0 0 16px 0;
  font-size: 28px;
  font-weight: 700;
}

.amount-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.confirm-amount {
  background: #4a6bdf;
  color: #fff;
  border: none;
  padding: 10px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 12px;
  transition: background 0.2s;
  width: 100%;
  max-width: 200px;
}

.confirm-amount:hover {
  background: #3a56c7;
}

.amount-desc {
  margin: 0;
  color: #666;
  font-size: 14px;
}

/* 交易号输入区域 */
.transaction-input-area {
  background-color: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.input-container {
  display: flex;
  margin-bottom: 12px;
}

.transaction-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  margin-right: 12px;
  font-size: 16px;
  transition: border 0.2s;
}

.transaction-input:focus {
  outline: none;
  border-color: #4a6bdf;
  box-shadow: 0 0 0 2px rgba(74, 107, 223, 0.2);
}

.submit-btn {
  background: #4a6bdf;
  color: #fff;
  border: none;
  padding: 12px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 18px;
  transition: background 0.2s;
  min-width: 60px;
}

.submit-btn:hover {
  background: #3a56c7;
}

.input-hint {
  margin: 0;
  color: #888;
  font-size: 14px;
}

/* 提示信息区域 */
.tip-area {
  background-color: #fff9e6;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid #ffc107;
}

.tip-area p {
  margin: 0;
  color: #856404;
  font-size: 14px;
  line-height: 1.5;
}

/* 支持APP区域 */
.support-app-area {
  background-color: white;
  text-align: center;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.support-app-area p {
  margin: 0 0 12px 0;
  color: #666;
  font-size: 16px;
}

.app-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  object-fit: cover;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

/* 注意事项区域 */
.notes-area {
  background: #f1f3f9;
  padding: 20px;
  border-radius: 12px;
  /* max-height: 280px; */
  /* overflow-y: auto; */
  margin-bottom: 20px;
}

.notes-title {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
}

.notes-list {
  margin: 0;
  padding-left: 20px;
}

.notes-list li {
  margin-bottom: 12px;
  line-height: 1.5;
  color: #555;
  font-size: 14px;
}

/* 弹窗样式 */
.popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.popup-content {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  width: 85%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.popup-content h3 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 20px;
}

.popup-content p {
  margin: 0 0 24px 0;
  color: #666;
  line-height: 1.5;
}

.popup-buttons {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.popup-cancel, .popup-confirm {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.2s;
}

.popup-cancel {
  background: #f1f2f6;
  color: #666;
}

.popup-cancel:hover {
  background: #e4e6eb;
}

.popup-confirm {
  background: #4a6bdf;
  color: #fff;
}

.popup-confirm:hover {
  background: #3a56c7;
}

.redirect-countdown {
  font-size: 18px;
  font-weight: 600;
  color: #4a6bdf;
}

/* 通知样式 */
.notification, .payment-notification {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%) translateY(-100px);
  padding: 12px 24px;
  border-radius: 6px;
  color: white;
  font-weight: 600;
  z-index: 1001;
  transition: transform 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.notification.show, .payment-notification.show {
  transform: translateX(-50%) translateY(0);
}

.notification {
  background: #2ed573;
}

.payment-notification.success {
  background: #2ed573;
}

.payment-notification.error {
  background: #ff4757;
}

/* 响应式调整 */
@media (max-width: 480px) {
  .top-up-container {
    padding: 12px;
  }
  
  .phone-display {
    /* flex-direction: column; */
    align-items: flex-start;
    gap: 12px;
  }
  
  .copy-btn {
    align-self: flex-end;
  }
  
  .amount {
    font-size: 24px;
  }
  
  .popup-content {
    width: 90%;
    padding: 20px;
  }
}
</style>