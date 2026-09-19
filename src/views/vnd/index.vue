<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import axios from "axios";
import Info from './components/Info.vue';
import Footer from './components/Footer.vue';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

const qrCodeSvg = ref('')
const id = ref('')
const qrCodeUrl = ref('')
const load = ref(true);
const type = ref(3) // 全部显示
const isMobileLayout = ref(false);
const expire = ref(false)
const success = ref(false)
// 支付成功后是否跳转 return_url（false = 不跳转，仅显示成功提示）
const enableReturnUrlRedirect = true
// 跳转前倒计时秒数
const redirectCountdownSeconds = 5
const isRedirectPopupShow = ref(false)
const redirectCountdown = ref(0)
const pendingRedirectUrl = ref('')
const step = ref(1) // 1: 选择银行 2:付款页
const order = ref({
  amount: '',
  bank_card_number: '',
  bank_logo_url: '',
  bank_name: '',
  code: '',
  remaining_seconds: '',
  qr_code_url: '',
  qr_url: '',
  trade_no: '',
  channel_id: ''
})

const handleResize = () => {
  isMobileLayout.value = window.innerWidth < 768;
};


const remainingTime = ref(0);
let countdownInterval = null;
let statusInterval = null;
let redirectTimer = null;

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
  expire.value = true
  clearRedirectTimer()
  redirectTimer = setInterval(() => {
    redirectCountdown.value--
    if (redirectCountdown.value <= 0) {
      doRedirect()
    }
  }, 1000)
}

const stopAllTimers = () => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
    countdownInterval = null
  }
  if (statusInterval) {
    clearInterval(statusInterval)
    statusInterval = null
  }
  if (echoInstance.value) {
    echoInstance.value.disconnect()
    echoInstance.value = null
  }
}

const onPaymentSuccess = (data) => {
  stopAllTimers()
  success.value = true
  expire.value = true
  const url = data?.return_url || order.value?.return_url
  if (enableReturnUrlRedirect && url) {
    startRedirectCountdown(url)
  }
}

const formatTime = computed(() => {
  const minutes = Math.floor(remainingTime.value / 1000 / 60);
  const seconds = Math.floor((remainingTime.value / 1000) % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});


onMounted(() => {
  init()
  handleResize();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  stopAllTimers()
  clearRedirectTimer()

  window.removeEventListener('resize', handleResize);
});


const formatCurrency = (value) => {
  const number = parseFloat(value);
  if (isNaN(number)) return value;
  return number.toLocaleString();
}

const getReferrer = () => {
  return document.referrer || null;
}

// 刷新二维码
const getQrcode = () => {
  console.log('获取二维码')
  qrCodeUrl.value = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAgAB/1h8KAAAAABJRU5ErkJggg==';
  const rand = id.value + Math.random().toString(36).substring(2) + Date.now().toString(36);
  qrCodeUrl.value = import.meta.env.VITE_API_URL + '/api/payments-qrcode/' + id.value + '?rand=' + rand
}

// 保存二维码
const saveQr = () => {
  const link = document.createElement('a');
  link.href = qrCodeUrl.value;
  link.download = 'qrcode.png';
  link.click();
}

const echoInstance = ref(null);

const reverb = () => {

  const url = new URL(import.meta.env.VITE_API_URL);
  const domain = url.hostname;

  echoInstance.value = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY ?? 'sgyrclcj2bwmke2w1swl',
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
    wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
  });


  console.log('reverb:' + `payment.${order.value.trade_no}`)
  echoInstance.value.channel(`payment.${order.value.trade_no}`)
    .listen('PaymentCompleted', (e) => {
      console.log(e)
      onPaymentSuccess(order.value)
    });
}


const init = async () => {

  const url = new URL(window.location.href);
  const lastPathSegment = url.pathname.split('/').pop();
  id.value = lastPathSegment;

  const referrer = getReferrer();
  console.log("Referrer (with handling for null):", referrer);

  await axios
    .get(import.meta.env.VITE_API_URL + '/api/payments/' + id.value)
    .then(function (response) {
      console.log(response.data.data)
      order.value = response.data.data
    })
    .catch(function (error) {
      console.log(error);
      expire.value = true;
    });

  load.value = false

  if (order.value.params) {
    try {
      const parsedParams = JSON.parse(order.value.params);
      const extra = JSON.parse(parsedParams.extra);
      type.value = extra.type;
    } catch (e) {
      console.log(order.value.params)
    }
  }

  if (order.value.remaining_seconds > 0) {
    expire.value = false;
  } else {
    expire.value = true;
    console.log('订单过期')
  }

  if (order.value.status == 'success') {
    console.log('订单已完成')
    onPaymentSuccess(order.value)
    remainingTime.value = 0
    load.value = false
    return
  }

  // momo zalo
  if ([5012, 5008, 5010,5011].includes(order.value.channel_id)) {
    type.value = 2;
    // type.value = 3;
  }

  // 选择银行通道
  // if (order.value.channel_id == 5009 || order.value.channel_id == 5018) {
  if (order.value.channel_id == 5018) {
    type.value = 4;
  } else {
    step.value = 2
  }

  // 初始化二维码URL
  qrCodeUrl.value = order.value.qr_code_url
  getQrcode()

  console.log('倒计时', order.value.remaining_seconds)
  const endTime = Date.now() + 1000 * order.value.remaining_seconds;

  countdownInterval = setInterval(() => {
    const now = Date.now();
    remainingTime.value = endTime - now;

    if (remainingTime.value <= 0) {
      remainingTime.value = 0;
      expire.value = true
      clearInterval(countdownInterval);
    }
  }, 1000);


  // 添加响应式监听
watch([expire, success], ([newExpire, newSuccess]) => {
  if (newExpire || newSuccess) {
    // 清除所有定时器
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
    if (statusInterval) {
      clearInterval(statusInterval);
      statusInterval = null;
    }
    // 断开WebSocket连接
    if (echoInstance.value) {
      echoInstance.value.disconnect();
      echoInstance.value = null;
    }
  }
});

  statusInterval = setInterval(async () => {
    if (success.value || expire.value) return
    try {
      const response = await axios.get(import.meta.env.VITE_API_URL + '/api/payments/' + id.value)
      const data = response.data.data
      if (data?.status === 'success') {
        order.value = { ...order.value, ...data }
        onPaymentSuccess(data)
      }
    } catch (err) {
      console.error('Status poll failed:', err)
    }
  }, 10000);

  remainingTime.value = endTime - Date.now();

  reverb();

}

const getBankImage = (bankName) => {
  try {
    return new URL(`../../assets/bank/${bankName}.png`, import.meta.url).href
  } catch (e) {
    return new URL(`../../assets/bank/Default.png`, import.meta.url).href
  }
}

const getBankImage2 = (bankName) => {
  try {
    return new URL(`../../assets/bank/${bankName}2.png`, import.meta.url).href
  } catch (e) {
    return new URL(`../../assets/bank/Default.png`, import.meta.url).href
  }
}

// 选择银行
const selectBank = (bankName) => {
  order.value.bank_name = bankName
}

const selectBank2 = (bankName) => {
  order.value.bank_name = bankName
  goPay()
}

const goBank = () => {
  step.value = 1
}

const goPay = async () => {
  console.log(order.value.bank_name)

  // 修改订单选择的银行
  await axios
    .put(import.meta.env.VITE_API_URL + '/api/payments-selectBank', { bank_name: order.value.bank_name, trade_no: id.value })
    .then(function (response) {
      init()
      step.value = 2
      load.value = true
    })
    .catch(function (error) {
      init()
      console.log(error);
      step.value = 2
      load.value = false
    });

}


</script>

<template>


  <div v-if="!load" class="flex flex-center" style="max-width:924px;margin:auto">


    <!-- 选择银行页start -->
    <div v-if="step == 1 && !expire">


      <div v-if="order.channel_id == 5009" style="padding:20px">
        <div class="df" style="justify-content: space-between;margin-top: 50px;flex-wrap: wrap">
          <div></div>
          <div style="font-size: 20px;color:#000">{{ order.currency }} {{ formatCurrency(order.amount) }}</div>
        </div>

        <div class="df" style="justify-content: space-between;margin-top: 10px;flex-wrap: wrap">
          <div>Mā giao dich</div>
          <div>{{ order.trade_no }}</div>
        </div>

        <div style="margin-top: 15px;">Chọn ngân hàng</div>

        <div class="df" style="justify-content: space-between;flex-wrap: wrap;margin-bottom: 30px;">
          <div v-if="order.bank_list.length > 0" class="bank-select" v-for="(item, index) in order.bank_list"
            :key="items">
            <div class="bank-name " :class="{ selected: item.bank_name == order.bank_name }"
              @click="selectBank(item.bank_name)">
              <div class="df" style="align-items:center">
                <div class="df" style="justify-content: center;margin-right: 5px;">
                  <img :src="getBankImage(item.bank_name)" style="height: 18px;">
                  <!-- <img :src="getBankImage(item.bank_name)" style="height: 16px;"> -->
                </div>
                <div style="max-width:110px">{{ item.bank_name }}</div>
              </div>
              <span :class="{ choiceActive: item.bank_name == order.bank_name }"></span>
            </div>
          </div>
          <div class="bank-select">
            <div class="bank-name " @click="selectBank('All banks support')"
              :class="{ selected: 'All banks support' == order.bank_name }">
              <div>All banks support</div>
              <span :class="{ choiceActive: 'All banks support' == order.bank_name }"></span>
            </div>
          </div>

          <!-- <div class="bank-select">
          <div class="bank-name selected"> All banks support</div>
        </div> -->
        </div>

        <div class="pay-button" @click="goPay">Thanh toán ngay</div>
      </div>

      <div class="full-background" v-else>
        <div style="margin-bottom: 20px; color: #fff;text-align: center;">
          <div style="font-size: 2.1rem;">
            Danh sách ngân hàng
          </div>
          <div style="font-weight: 100;">Xin vui lòng chọn ngân hàng bạn muốn chuyển khoản</div>
        </div>
        <div class="df" style="justify-content: space-between;flex-wrap: wrap;padding:10px">
          <div v-if="order.bank_list.length > 0" class="bank-select2" v-for="(item, index) in order.bank_list"
            :key="items">
            <div style=" border-radius: 15px;">
              <div>
                <div style=" background-color: #ABB7BE;">
                  <img :src="getBankImage2(item.bank_name)" style="height: 75px;">
                </div>
                <div @click="selectBank2(item.bank_name)" style="font-weight: 400; 
                  cursor: pointer; 
                  color:#fff;text-align: center;
                  background-color: #FF5353;
                  padding:10px; 
                  border-top: 2px solid black;
                  border-radius: 0 0 5px 5px;">Chọn</div>
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
    <!-- 选择银行页end -->


    <div v-else>

       <div v-if="order.title != ''" style="margin: 0px;text-align: center;font-size: 20px;color: cornflowerblue;" class="flex flex-dc  flex-center">
        <div>{{ order.title }}</div>
      </div>

      <div style="margin:0px 0 0px;text-align: center" class="flex flex-dc  flex-center">
        <img v-if="order.bank_logo_url != ''" :src="order.bank_logo_url" style="width: 150px;height: auto;">
        <h2 v-if="order.bank_logo_url == ''" style="color: #FF5353;">{{ order.bank_name }}</h2>
      </div>
      <div v-if="!expire" class="time">{{ formatTime }}</div>
      <div v-if="!expire"
        :class="{ 'mobile-layout': isMobileLayout, 'pc-layout': !isMobileLayout, 'df': type != 2 && type != 1 }"
        class="app-wrap" style="justify-content:space-between">

        <div class="head flex" style="justify-content: center;">
          <div v-if="type == 2" style="text-align: center;color: #FF5353;margin-bottom: 5px;">{{ order.amount }}
            {{ order.currency }}
          </div>
          <!-- Inline QrCode component -->
          <div v-if="type != 1" class="head-two flex flex-1 flex-dc bg-white bor p-20 m-b-10 right-column">
            <div class="p-b-10">Mã QR</div>
            <div style="background: #4964F3;" class="p-20 bor flex flex-dc flex-center">
              <div class="text-center" style="max-width: 300px;margin:auto">
                <img class="pay-code" style="width:80%" :src="qrCodeUrl">
                <img class="pay-code-success" style="width:175px;height:175px;display: none" src="" alt="">
                <img class="pay-code-failed" style="width:175px;height:175px;display: none" src="" alt="">
                <img class="pay-code-error" style="width:175px;height:175px;display: none" src="" alt="">
              </div>
              <div class="flex flec-cc" style="color:#fff;font-weight: normal;font-size: 18px;cursor:pointer">
                <div style="border:solid 1px #fff;padding:5px;border-radius: 5px;" @click="saveQr" class="text-center">
                  <span>Lưu mã QR</span>
                </div>
              </div>
              <a href="momo://?action=p2p&isScanQR=true&url=https://momo.vn/download&serviceCode=transfer_p2p&refId=TransferInputMoney"
                target="_top" class="momo-button" v-if="isMobileLayout && [5010, 5011].includes(order.channel_id) && order.momo_deeplink == ''">
                <div style="border-radius: 8px;background-color: #d82d8b;border-color: #d82d8b;padding:10px;margin-top: 10px;">
                  Click để thanh toán
                </div>
              </a>
              <a :href="order.momo_deeplink" target="_top" class="momo-button"
                v-if="isMobileLayout && [5010, 5011].includes(order.channel_id) && order.momo_deeplink != ''">
                <div style="border-radius: 8px;background-color: #d82d8b;border-color: #d82d8b;padding:10px;margin-top: 10px;">
                  Click để thanh toán
                </div>
              </a>
            </div>
          </div>
        </div>
        <div v-if="type != 2" style="margin-bottom: 30px;">
          <Info :orderData="order" :isMobileLayout="isMobileLayout" />
          <!-- <div v-if="type == 4" class="pay-button" @click="goBank">Chọn ngân hàng</div> -->
        </div>

      </div>
      <div v-if="expire && !success" class="pay-close-desc" style="text-align: center;margin-bottom: 20px">
        <img src="@/assets/fail.png" style="width: 60px;height: auto;margin-top: 20px;margin-bottom: 20px">
        <h4>Lệnh đã hết hạn, vui lòng mở lại giao dịch.</h4>
      </div>
      <div v-if="success" class="pay-close-desc" style="text-align: center;margin-bottom: 20px">
        <img src="@/assets/ok.png" style="width: 60px;height: auto;margin-top: 20px;margin-bottom: 20px">
        <h4>Lệnh đã hoàn tất!</h4>
      </div>

      <Footer :orderData="order" />
    </div>

  </div>
  <!-- <div v-if="load" class="loader" style="margin-top: 10px;"></div> -->

  <!-- 支付成功跳转倒计时弹窗 -->
  <div v-if="isRedirectPopupShow" class="popup-mask">
    <div class="popup-content">
      <h3>Lệnh đã hoàn tất!</h3>
      <p class="redirect-countdown">Chuyển hướng sau {{ redirectCountdown }} giây.</p>
      <div class="popup-buttons">
        <button class="popup-confirm" @click="doRedirect">Chuyển ngay</button>
      </div>
    </div>
  </div>

</template>

<style scoped>
.pay-button {
  cursor: pointer;
  background-color: #00b300;
  color: white;
  border-radius: 15px;
  text-align: center;
  padding: 10px;
  margin: auto;
  width: 95%
}

.bank-select {
  flex: 0 0 50%;
  box-sizing: border-box;
  padding: 5px;
  margin: 5px 0px;
}

.bank-select2 {
  box-sizing: border-box;
  padding: 5px;
  margin: 5px 0px;
}

.bank-select .bank-name {
  border: solid 1px gray;
  border-radius: 5px;
  /* text-align: center; */
  color: #686868;
  padding: 10px;
  position: relative;
}

.selected {
  border: solid 2px #00b300 !important;
}

.choiceActive {
  color: #00b300;

  &::before {
    content: '';
    position: absolute;
    right: 0;
    bottom: 0;
    border: 12px solid #00b300;
    border-top-color: transparent;
    border-left-color: transparent;
  }

  &::after {
    content: '';
    width: 3px;
    height: 5px;
    position: absolute;
    right: 4px;
    bottom: 5px;
    border: 1px solid #fff;
    border-top-color: transparent;
    border-left-color: transparent;
    transform: rotate(45deg);
  }
}

.mobile-layout {
  display: flex;
  flex-direction: column;
}

.pc-layout {
  /* display: flex; */
  flex-direction: row;
}

.df {
  display: flex;
}


/* HTML: <div class="loader"></div> */
.loader {
  margin: auto;
  width: 50px;
  padding: 8px;
  aspect-ratio: 1;
  border-radius: 50%;
  background: #25b09b;
  --_m:
    conic-gradient(#0000 10%, #000),
    linear-gradient(#000 0 0) content-box;
  -webkit-mask: var(--_m);
  mask: var(--_m);
  -webkit-mask-composite: source-out;
  mask-composite: subtract;
  animation: l3 1s infinite linear;
}

.full-background {
  background-image: url('@/assets/bank/bg.webp');
  background-image: image-set(
    url('@/assets/bank/bg.webp') type('image/webp')
  );
  z-index: 2;
  background-size: cover;
  background-position: center;
  height: 100vh;
  width: 100%;
  justify-content: center;
  align-items: center;
}

@keyframes l3 {
  to {
    transform: rotate(1turn)
  }
}

.momo-button {
  color: #fff;
  text-decoration: none;
}

.text-center {
  text-align: center;
}

/* 跳转倒计时弹窗 */
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
  justify-content: center;
}

.popup-confirm {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
  background: #4964F3;
  color: #fff;
  transition: background 0.2s;
}

.popup-confirm:hover {
  background: #3a56c7;
}

.redirect-countdown {
  font-size: 18px;
  font-weight: 600;
  color: #4964F3;
}
</style>
