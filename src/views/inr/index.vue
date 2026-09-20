<template>
  <div class="main">

    <div class="main-box">


      <div class="main-title">

        <div v-if="qrCodeDialogVisible" class="modal-overlay" @click.self="qrCodeDialogVisible = false">
          <div class="modal" style="width: 400px; max-width: calc(100vw - 32px);">
            <div id="dialogQrcode" class="qrcode-img" style="display: flex; flex-direction: column; align-items: center;">
              <img style="width: 180px; height: 180px; margin-bottom: 10px" :src="qrCodeUrl" />
            </div>
            <div style="display: flex; justify-content: center;flex-direction: column;">
              <div style="margin-bottom:10px">Click the button to save the payment QR codeor manually take a screenshot to save the QR
                code</div>
              <button class="save-qr-button" @click="saveDialogQrcode">
                Save the QR code
              </button>
            </div>
          </div>
        </div>


        <h3>UPI</h3>
        <!-- <div class="title-line" /> -->
      </div>
      <!--      <div @click="handleSuccess">111</div>-->
      <div class="main-idbox">
        <div class="main-idbox-item">

          <!-- <div @click="handleSuccess()">测试</div> -->

          <div class="main-upi">UPI ID</div>
          <div class="main-number">{{ state.obj.bank_card_number }}</div>
        </div>
        <div class="main-idbox-copy" @click="doCopy(state.obj.bank_card_number)">Copy</div>
      </div>
      <div class="time-remaining" v-if="state.obj.status != 'success'">
        <div class="time-remaining-left">Time remaining</div>
        <div class="time-remaining-right">
          <!--          {{ formatTime(hours) }}:{{ formatTime(minutes) }}:{{ formatTime(seconds) }}-->
          <countdown :initial-seconds="900" @finish="handlePaymentDeadline" />
        </div>
      </div>
      <div v-if="state.timeout" class="qrcode">
        <div class="result result-error">
          <div class="result-title">Error Tip</div>
          <div class="result-sub">The order has exceeded the time limit</div>
        </div>
      </div>

      <div v-else-if="state.submitted || state.obj.status === 'success'" class="qrcode">
        <div class="result result-success">
          <div class="result-sub">UTR has been submitted. The system needs a few minutes to complete the order. Please wait.</div>
        </div>
        <!-- <el-result icon="success" title="Success Tip" sub-title="Order payment successful" /> -->
        
      </div>

      <div
        v-else-if="(!state.timeout && !state.submitted) || state.obj.status === 'pending'"
        class="qrcode"
      >
        <div v-if="state.loading" class="loading-overlay">
          <div class="spinner" />
        </div>
        <div class="qrcode">

        <div class="qrcode-imgbox">
          <a @click.prevent="showQrCode('gpay://upi/pay')"><img src="./assets/img/Gpay.png" width="50" /></a>
          <a :href="`paytmmp://cash_wallet?appid=inb_admin&am=${state.obj.amount}&mc=&pa=${state.obj.bank_card_number}&tn=${generateFutureTnTimestamp()}&cu=&mode=01&purpose=&featuretype=money_transfer`" ><img src="./assets/img/paytm.png" width="50" /></a>
          <a @click.prevent="showQrCode('phonepe://scan?time=3242432')"><img src="./assets/img/phonepe.png" width="70" /></a>
        </div>

          <div class="qrcode-title">FOR SINGLE TRANSACTION ONLY</div>
          <div id="qrcode" class="qrcode-img" @click="saveQrcode">
            <img style="width: 150px; height: 150px" :src="state.obj.qr_code_url" />
          </div>
          <div class="qrcode-amount">
            <span class="title">Amount</span>
            <span class="number">{{ state.obj.amount }}</span>
          </div>
          <div class="pay-list">PayTM, PhonePE, GooglePay, BHlM and more</div>
          <div class="qrcode-imgbox">
            <!-- <a href="bhim://upi/pay"><img src="./assets/img/bhim.png" width="50" /></a> -->
            <!-- <a href="gpay://upi/pay"><img src="./assets/img/Gpay.png" width="50" /></a> -->
 
            <!-- <a href="phonepe://scan?time=3242432" ><img src="./assets/img/phonepe.png" width="50" /></a> -->
           
            <!-- <img src="./assets/img/axis.png" width="80" /> -->
             <!-- <a @click.prevent="showQrCode(`000201010211021646049010648295430415512260006482953061661000200648295530826UTIB000050992402003851321426460010A0000005240128${state.obj.bank_card_number}27490010A000000524013103732400509012361000200648295535204505153033565802IN5912BOND service6006MUMBAI6106400070621207080648295563043DAD`)"><img src="./assets/img/axis.png" width="60" /></a>-->
          </div>
        </div>
        <input v-model="state.form.no" class="utr-no" placeholder="UTR NO." />
        <button class="submit" type="button" @click="doSubmit">Submit</button>
      </div>

      <div class="reminder">Reminder:</div>
      <div class="tip">
        1. Scan QR Code<br />
        2. If you enter the displayed UPI account number for deposit, please pay attention to
        whether the entered UPI account number is correct. Deposited into the wrong account cannot
        be refund.<br />
        3. After paying from the following payment option: PayTM,PhonePE,GooglePay,BHIM,etc.<br />
        4. Important reminder: After completing the UPI transaction,please backfill Ref No./UTR
        No./Google Pay : UPI Transaction ID/Freecharge: Transaction ID (12digits). If you do not
        back fill UTR, 100% of the deposit transaction will fail. Please be sure to backfill!<br />
      </div>
    </div>
    <div v-if="state.dialogVisible" class="modal-overlay" @click.self="() => {}">
      <div class="modal" :style="{ width: state.isMobile ? '50%' : '300px', maxWidth: 'calc(100vw - 32px)' }">
        <div v-if="state.submitResult" class="throb-box">
          <div class="progress-circle" :style="{ '--p': state.mapped }">
            <div class="progress-center">
              <countdown :initial-seconds="60" @finish="handleSessionExpiry" @throb="handleThrob" />
            </div>
          </div>
        </div>
        <div v-else class="throb-box">
          <div v-if="state.uploading" class="uploading">
            <div class="spinner" />
            <div class="uploading-text">Uploading...</div>
          </div>
          <div v-else class="avatar-uploader">
            <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="onFileChange" />
            <div class="avatar-uploader-body" @click="triggerFileSelect">
              <img v-if="imageUrl" :src="imageUrl" class="avatar" />
              <div v-else class="avatar-uploader-icon">+</div>
            </div>
            <div class="upload-tip">Please upload payment voucher</div>
            <div class="upload-tip">The size of the uploaded image should not exceed 2MB.</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="toast.visible" class="toast" :class="`toast-${toast.type}`">
      {{ toast.message }}
    </div>
  </div>
</template>
<script setup>
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import Countdown from './components/Countdown.vue'
import domtoimage from 'dom-to-image-more'
import useClipboard from 'vue-clipboard3'
import { useRoute } from 'vue-router'
import { toSVG } from 'qrto'
import axios from "axios";
const route = useRoute()
import { getPayments, upload, addPayment } from './services.js'

const qrCodeDialogVisible = ref(false)
const qrCodeUrl = ref('')

const url = new URL(window.location.href);
const trade_no = url.pathname.split('/').pop();

const remainingTime = ref(0);
let countdownInterval = null;
let statusInterval = null;

const toast = reactive({
  visible: false,
  message: '',
  type: 'info',
  _timer: null,
})

const showToast = (message, type = 'info', duration = 2500) => {
  toast.message = message
  toast.type = type
  toast.visible = true
  if (toast._timer) clearTimeout(toast._timer)
  toast._timer = setTimeout(() => {
    toast.visible = false
  }, duration)
}

const getErrorMessage = (err) => {
  const data = err?.errors ? err : err?.response?.data
  const fieldFirstError = data?.errors && Object.values(data.errors)?.[0]?.[0]
  return fieldFirstError || data?.message || err?.message || 'Request failed'
}

const showQrCode = (url) => {
  // 使用qrto生成SVG二维码
  const svgData = toSVG(url, {
    size: 150,
    margin: 0,
    color: '#000000'
  });
  qrCodeUrl.value = `data:image/svg+xml;base64,${btoa(svgData)}`;
  qrCodeDialogVisible.value = true;
}


const saveDialogQrcode = () => {
  domtoimage.toPng(document.getElementById('dialogQrcode')).then(function (dataUrl) {
    var img = new Image()
    img.src = dataUrl
    img.onload = function () {
      var canvas = document.createElement('canvas')
      var ctx = canvas.getContext('2d')
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0, img.width, img.height) // 绘制图片
      var dataURL = canvas.toDataURL('image/png') // 将canvas转换为dataURL
      var a = document.createElement('a')
      a.download = 'qrcode.png'
      a.href = dataURL
      a.click() // 触发下载
      a.remove() // 移除a标签
    }
  })
}

const generateFutureTnTimestamp = (offsetMinutes = 5) => { 
  const futureDate = new Date(Date.now() + offsetMinutes * 60 * 1000);
  const pad2 = (n) => n.toString().padStart(2, '0');
  const generate5Digits = () => {
    const ms = futureDate.getMilliseconds().toString().padStart(3, '0');
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `${ms}${random}`;
  };

  return `P${futureDate.getFullYear()}${pad2(futureDate.getMonth() + 1)}${pad2(futureDate.getDate())}${pad2(futureDate.getHours())}${pad2(futureDate.getMinutes())}${pad2(futureDate.getSeconds())}${generate5Digits()}`;
};

const state = reactive({
  form: {
    no: '',
    trade_no: trade_no,
  },
  isMobile: false,
  dialogVisible: false,
  loading: false,
  submitResult: false,
  submitted: false,
  timeout: false, // 15分钟还没提交，显示超时
  uploading: false,
  mapped: 1,
  obj: {},
})
const { toClipboard } = useClipboard()
const doCopy = async (id) => {
  try {
    await toClipboard(id)
    showToast('Replicated', 'success')
  } catch (e) {
    showToast('Copy failed', 'error')
  }
}
const imageUrl = ref(null)
const fileInput = ref(null)

const triggerFileSelect = () => {
  if (fileInput.value) fileInput.value.click()
}

const onFileChange = async (e) => {
  const file = e?.target?.files?.[0]
  if (!file) return
  const ok = beforeUpload(file)
  if (!ok) {
    if (fileInput.value) fileInput.value.value = ''
    return
  }
  await customUpload(file)
  if (fileInput.value) fileInput.value.value = ''
}
const saveQrcode = () => {
  // 保存二维码
  domtoimage.toPng(document.getElementById('qrcode')).then(function (dataUrl) {
    var img = new Image()
    img.src = dataUrl
    img.onload = function () {
      var canvas = document.createElement('canvas')
      var ctx = canvas.getContext('2d')
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0, img.width, img.height) // 绘制图片
      var dataURL = canvas.toDataURL('image/png') // 将canvas转换为dataURL
      var a = document.createElement('a')
      a.download = 'qrcode.png'
      a.href = dataURL
      a.click() // 触发下载
      a.remove() // 移除a标签
    }
  })
}
const beforeUpload = (file) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isJpgOrPng) {
    showToast('Only JPG/PNG files are allowed!', 'error')
    return false
  }
  const isLt2M = file.size / (1024 * 1024) < 2
  if (!isLt2M) {
    showToast('The size of the uploaded image should not exceed 2MB!', 'error')
    return false
  }
  return true
}
const customUpload = async (file) => {
  state.uploading = true
  const formData = new FormData()
  formData.append('image', file)
  formData.append('trade_no', trade_no)
  try {
    let { data } = await upload(formData)
    if (data) {
      state.dialogVisible = false
      state.submitted = true
      imageUrl.value = data.url
      showToast('Upload success', 'success')
    }
  } catch (e) {
    showToast(getErrorMessage(e), 'error')
  } finally {
    state.uploading = false
  }
}

const doSubmit = async () => {
  if (!state.form.no) {
    showToast('Please enter the UTR NO', 'warning')

    // ElMessage({
    //   message: 'Please enter the UTR NO',
    //   type: 'warning',
    //   offset: window.screen.height / 2.5
    // })

  } else {
    try {
      let res = await addPayment(state.form)
      // console.log(res)
      if (state.obj.indian_payment_screenshot_enabled == '1') {
        state.dialogVisible = true
        state.submitResult = true
      } else {
        state.submitted = true
      }
    } catch (e) {
      showToast(getErrorMessage(e), 'error')
    } finally {
    }
  }
}
const handlePaymentDeadline = () => {
  if (!state.submitted) {
    state.timeout = true
    state.dialogVisible = false
  }
}

const handleSessionExpiry = () => {
  // 倒计时
  if (state.obj.indian_payment_screenshot_enabled == '1') {
    state.submitResult = false
    // submitResult = false
  } else {
    state.dialogVisible = false
    state.submitted = true
  }
}

const handleSuccess = () => {
  // 支付成功回调
  state.submitted = true
  state.form.no = null
}

const handleThrob = (value) => {
  state.mapped = 100 - (value / 60) * 100
  // = mappedValue;
}
const isMobile = () => {
  // 判断是否为移动设备
  return (
    typeof window.orientation !== 'undefined' || // 判断是否存在window.orientation属性，此属性在移动设备上一般存在
    navigator.userAgent.indexOf('IEMobile') !== -1 || // 判断是否为Windows Phone
    navigator.userAgent.indexOf('iPhone') !== -1 || // 判断是否为iPhone
    (navigator.userAgent.indexOf('Android') !== -1 &&
      navigator.userAgent.indexOf('Mobile') !== -1) || // 判断是否为Android手机
    navigator.userAgent.indexOf('BlackBerry') !== -1 || // 判断是否为BlackBerry
    navigator.userAgent.indexOf('Opera Mini') !== -1 // 判断是否为Opera Mini浏览器
  )
}

const getPays = async () => {

  if (!trade_no) {
    showToast('Invalid request', 'error')
    return
  }
  try {
    state.loading = true
    let res = await getPayments(trade_no)
    // res.data.status = 'success'
    state.obj = res.data
    // state.obj.qr_code_url = '';

    if (res.data.status == 'success') {
      handleSuccess()
      clearInterval(statusInterval);
    }

    if(res.data.remaining_seconds <= 0){
      state.timeout = true
      clearInterval(statusInterval);
    }

  } catch (e) {
    // console.log(e)
  } finally {
    state.loading = false
  }
}


const init  = () => {
  const endTime = Date.now() + 1000 * 60 * 20;

  countdownInterval = setInterval(() => {
    const now = Date.now();
    remainingTime.value = endTime - now;

    if (remainingTime.value <= 0) {
      remainingTime.value = 0;
      // expire.value = true
      console.log('到期')
      clearInterval(countdownInterval);
    }
  }, 1000);

  statusInterval = setInterval(async () => {
    await axios
      .get(import.meta.env.VITE_API_URL + '/api/payments/' + trade_no)
      .then(function (response) {
        if (response.data.data.status == 'success') {
          handleSuccess()
          clearInterval(statusInterval);
        }
      })
      .catch(function (error) {
        clearInterval(statusInterval);
      });
  }, 15000);

  remainingTime.value = endTime - Date.now();
}

onMounted(() => {
  // 组件挂载时执行的逻辑
  state.isMobile = isMobile()
  getPays()
  init()
})

</script>
<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal {
  background: #fff;
  border-radius: 10px;
  padding: 16px;
}

.toast {
  position: fixed;
  left: 50%;
  bottom: 30px;
  transform: translateX(-50%);
  padding: 10px 14px;
  border-radius: 8px;
  color: #fff;
  font-size: 13px;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.8);
}

.toast-success {
  background: rgba(0, 160, 80, 0.92);
}

.toast-error {
  background: rgba(220, 53, 69, 0.92);
}

.toast-warning {
  background: rgba(255, 193, 7, 0.95);
  color: #1b1c21;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
}

.spinner {
  width: 28px;
  height: 28px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top-color: rgba(0, 0, 0, 0.55);
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.result {
  width: 100%;
  padding: 16px;
  border-radius: 10px;
  text-align: center;
}

.result-title {
  font-weight: 700;
  font-size: 16px;
  margin-bottom: 6px;
}

.result-sub {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

.result-error {
  border: 1px solid rgba(220, 53, 69, 0.25);
  background: rgba(220, 53, 69, 0.06);
}

.result-success {
  border: 1px solid rgba(0, 160, 80, 0.25);
  background: rgba(0, 160, 80, 0.06);
}

.progress-circle {
  --p: 0;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: conic-gradient(#2d8df3 calc(var(--p) * 1%), #e9ecef 0);
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-center {
  width: 94px;
  height: 94px;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-uploader-body {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  border-radius: 8px;
  border: 1px dashed #cbd5e1;
  cursor: pointer;
  overflow: hidden;
}

.avatar-uploader-icon {
  font-size: 36px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.uploading-text {
  margin-top: 10px;
  font-size: 12px;
  color: #666;
}

.save-qr-button {
  background-color: #2d8df3;
  color: white;
  padding: 12px 24px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  width: auto;
  text-align: center;
  transition: all 0.3s ease;
}

.save-qr-button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.qrcode-img {
  padding: 6px;
  border-radius: 6px;
  background: #fff;
}
.uploading {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.upload-tip {
  text-align: center;
  font-size: 10px;
  margin-top: 14px;
}
.throb-box {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  min-height: 100px;
}
.main {
  padding: 14px;
  display: flex;
  height: 100vh;
  justify-content: center;
  background: #f1f1f1;
}
.main-box {
  max-width: 750px;
  padding-left: 10px;
  padding-right: 10px;
  width: 100%;
  height: 100%;
  background: #fff;
  border-radius: 10px;
  overflow-y: scroll;
  scrollbar-width: none;
  scrollbar-color: transparent transparent;
  .main-title {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 10px;
    h3 {
      width: 100%;
      text-align: center;
      background: #52d2e2;
      color: #fff;
      border-radius: 4px;
    }
  }
  .title-line {
    border-bottom: solid 2px #4f89ab;
    width: 16px;
  }

  .main-idbox {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
    align-items: center;
    .main-idbox-item {
      display: flex;
      flex: 1;
      padding: 10px;
      flex-direction: row;
      justify-content: center;
      border: solid 1px #dedede;
      border-top-left-radius: 6px;
      border-bottom-left-radius: 6px;
      .main-upi {
        padding: 0 6px;
        border-right: solid 1px #dedede;
        margin-right: 6px;
        color:#333;
      }
      .main-number {
        flex: 1;
        color: #000;
        font-size:12.5px
      }
    }
    .main-idbox-copy {
      background: #2d8df3;
      padding: 11px 10px;
      border-top-right-radius: 6px;
      border-bottom-right-radius: 6px;
      color: #fff;
    }
  }

  .time-remaining {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
    .time-remaining-left {
      color: #000;
      margin-right: 10px;
    }
    .time-remaining-right {
      color: #c94d24;
      font-weight: bold;
    }
  }
  .qrcode {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-top: 15px;
    .qrcode-title {
      color: #b08e93;
      font-size: 16px;
      margin-bottom: 16px;
    }
    .qrcode-amount {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      margin-top: 16px;
      .title {
        color: #c2c2c2;
        font-weight: bold;
        font-size: 14px;
      }
      .number {
        color: #000;
        font-weight: bold;
        font-size: 20px;
      }
    }
    .pay-list {
      margin-top: 16px;
      margin-bottom: 6px;
      font-size: 8px;
    }
    .qrcode-imgbox {
      display: flex;
      justify-content: space-around;
      align-items: center;
      margin-bottom:10px;
      img {
        margin: 0 6px;
      }
    }
  }
  .utr-no {
    margin-top: 16px;
    color: #c2c2c2;
    font-size: 14px;
    width: 100%;
    border-radius: 6px;
  }
  .submit {
    padding: 10px;
    background: #2d8df3;
    width: 100%;
    color: #fff;
    margin-top: 6px;
    border-radius: 6px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .reminder {
    margin: 16px 0;
    color: #000;
    font-weight: bold;
    font-size: 14px;
  }
  .tip {
    font-size: 12px;
    color: #c97265;
    padding-bottom: 16px;
  }
}
.avatar-uploader {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.avatar-uploader .avatar {
  width: 100px;
  height: 100px;
  display: block;
}

.qrcode-img {
  padding: 20px;
}

.save-qr-button {
  width: auto;
  text-align: center;
  transition: all 0.3s ease;
}

.save-qr-button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}
</style>
