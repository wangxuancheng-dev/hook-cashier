<script setup>
import useClipboard from 'vue-clipboard3';
const props = defineProps(['orderData', 'isMobileLayout'])
</script>
<template>
  <div class="bg-white bor p-20 m-b-10">
    <div class="p-b-10">Hướng dẫn nạp</div>
    <div class="p-b-10">Lưu ý</div>

    <div v-if="props.orderData.channel_id != 5014 && props.orderData.channel_id != 5015">
      <!-- 银行卡通道 -->
      <div v-if="props.orderData.channel_id != 5007 && props.orderData.channel_id != 5008"
        style="background: #F3F4FD;padding:12px;">
        Vui lòng kiểm tra đúng số tài khoản và tên người nhận thanh toán. Nếu có sai sót, việc chuyển tiền sẽ không được
        giải quyết.
        <br>
        <br>
        chú ý nội dung chuyển tiền nhớ sao chép là mã động , hệ thống sẽ tự động lên điểm cho bạn sau khi bạn chuyển
        khoản thành công
      </div>

      <!-- 钱包通道 -->
      <div v-else style="background: #F3F4FD;padding:12px;">
        Vui lòng quét mã QR để thanh toán, chuyển tiền vào thẻ ngân hàng tương ứng ,Mỗi lần chuyển tiền bạn vui lòng lấy
        mã qr mới nhất , hệ thống sẽ nhanh chóng tự động lên điểm giúp bạn sau khi bạn chuyển khoản thành công lưu ý nội
        dung chuyển tiền là sao chép mã động, Chuyển khoản vào ví MOMO không được hỗ trợ.
      </div>
    </div>

    <!-- usdt trx 通道-->
    <div v-if="props.orderData.channel_id == 5014 || props.orderData.channel_id == 5015" style="background: #F3F4FD;padding:12px;">
      Vui lòng kiểm tra đúng địa chỉ và số tiền nhận. Nếu có sai sót, việc chuyển tiền sẽ không được giải quyết.
    </div>

  </div>
</template>
