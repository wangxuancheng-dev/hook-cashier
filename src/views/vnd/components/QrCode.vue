<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps(['orderData', 'qrCodeSvg', 'isMobileLayout'])

console.log(props.orderData)
const paycode = props.orderData.qr_code_url
const channel_id = props.orderData.channel_id
const momo_deeplink = props.orderData.momo_deeplink

// const downloadLink = ref('')
const qrCodeUrl = ref(paycode);
const id = ref("")
const url = new URL(window.location.href);
const lastPathSegment = url.pathname.split('/').pop();
id.value = lastPathSegment;

onMounted(() => {
  // if (channel_id === 5010) {
  //   createDownloadLink();
  // }

  // if (channel_id === 5009) {
    getQrcode();
  // }

});


// 保存二维码
const saveQr = () => {
  const link = document.createElement('a');
  link.href = qrCodeUrl.value;
  link.download = 'qrcode.png';
  link.click();
};

// 刷新二维码
const getQrcode = () => {
  console.log('获取二维码')
  qrCodeUrl.value = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAgAB/1h8KAAAAABJRU5ErkJggg==';
  const rand = id.value + Math.random().toString(36).substring(2) + Date.now().toString(36);
  qrCodeUrl.value = import.meta.env.VITE_API_URL + '/api/payments-qrcode/' + id.value + '?rand=' + rand
}

</script>
<template>
  <div class="head-two flex flex-1 flex-dc bg-white bor p-20 m-b-10 right-column">

    <div class="p-b-10">Mã QR</div>

    <div style="background: #4964F3;" class="p-20 bor flex flex-dc flex-center">
      <div class="text-center" style="max-width: 300px;margin:auto">

        <!-- <div v-if="channel_id === 5010" v-html="props.qrCodeUrl"></div> -->
        <img  class="pay-code" style="width:80%" :src="qrCodeUrl">

        <img class="pay-code-success" style="width:175px;height:175px;display: none" src="" alt="">
        <img class="pay-code-failed" style="width:175px;height:175px;display: none" src="" alt="">
        <img class="pay-code-error" style="width:175px;height:175px;display: none" src="" alt="">
      </div>

      <div class="flex flec-cc"
        style="color:#fff;font-weight: normal;font-size: 18px;cursor:pointer">
        <div style="border:solid 1px #fff;padding:5px;border-radius: 5px;" @click="saveQr" class="text-center">
          <span>Lưu mã QR</span>
        </div>
      </div>


      <!-- <div v-if="channel_id == 5010" class="flex flec-cc"
        style="color:#fff;font-weight: normal;font-size: 18px;cursor:pointer">
        <div style="border:solid 1px #fff;padding:4px;border-radius: 5px;" class="text-center">
          <a :href="downloadLink" download="qrcode.png" style="color:#fff;text-decoration:none"><span>Lưu mã QR</span>
          </a>
        </div>
      </div> -->

      <a href="momo://?action=p2p&isScanQR=true&url=https://momo.vn/download&serviceCode=transfer_p2p&refId=TransferInputMoney"
        target="_top" class="momo-button" v-if="props.isMobileLayout && [5010, 5011].includes(channel_id) && momo_deeplink == ''">
        <div style="border-radius: 8px;background-color: #d82d8b;border-color: #d82d8b;padding:10px;margin-top: 10px;">
          Click để thanh toán
        </div>
      </a>

      <a :href="momo_deeplink" target="_top" class="momo-button"
        v-if="props.isMobileLayout && [5010, 5011].includes(channel_id) && momo_deeplink != ''">
        <div style="border-radius: 8px;background-color: #d82d8b;border-color: #d82d8b;padding:10px;margin-top: 10px;">
          Click để thanh toán
        </div>
      </a>

    </div>

  </div>
</template>

<style scoped>
.pay-close-desc {
  text-align: center
}

.text-center {
  text-align: center
}

.momo-button {
  color: #fff;
  text-decoration: none
}
</style>
