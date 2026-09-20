<script setup>
import useClipboard from 'vue-clipboard3';
import { ref } from 'vue';

const props = defineProps(['orderData','isMobileLayout'])

console.log('订单数据')
console.log(props.orderData)

const { toClipboard } = useClipboard();
// 复制成功提示状态
const showCopySuccess = ref(false);
// 复制失败提示状态
const showCopyError = ref(false);

	// 点击复制文本
	const copyText = (text) => {
		return new Promise((resolve, reject) => {
			try {
				//复制
				toClipboard(text);
				// 显示复制成功提示
				showCopySuccess.value = true;
				// 添加show类触发动画
				setTimeout(() => {
					const toast = document.querySelector('.copy-toast.success');
					if (toast) toast.classList.add('show');
				}, 10);
				// 1秒后开始隐藏
				setTimeout(() => {
					const toast = document.querySelector('.copy-toast.success');
					if (toast) toast.classList.remove('show');
					// 等待动画结束后完全隐藏元素
					setTimeout(() => {
						showCopySuccess.value = false;
					}, 300);
				}, 1000);
				resolve(text);
			} catch (e) {
				//复制失败
				showCopyError.value = true;
				// 添加show类触发动画
				setTimeout(() => {
					const toast = document.querySelector('.copy-toast.error');
					if (toast) toast.classList.add('show');
				}, 10);
				// 2秒后开始隐藏
				setTimeout(() => {
					const toast = document.querySelector('.copy-toast.error');
					if (toast) toast.classList.remove('show');
					// 等待动画结束后完全隐藏元素
					setTimeout(() => {
						showCopyError.value = false;
					}, 300);
				}, 2000);
				reject(e);
			}
		});
	};

// 金额格式化函数 - 将数字转换为千分位格式
const  formatAmount = (amount) => {
  let num;
  if (typeof amount === 'string') {
    num = parseFloat(amount);
    if (isNaN(num)) {
      return amount;
    }
  } else if (typeof amount === 'number') {
    num = amount;
  } else {
    return amount;
  }
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
}

</script>

<template>
  <!-- 复制成功提示 -->
  <div v-show="showCopySuccess" class="copy-toast success">
    Sao chép thành công
  </div>
  <!-- 复制失败提示 -->
  <div v-show="showCopyError" class="copy-toast error">
    Sao chép thất bại, vui lòng thử lại
  </div>
  <div v-if="props.isMobileLayout && props.orderData.bank_name != 'All banks support'" style="text-align: center;margin-bottom: 10px;color:#D33A2C">Ngân hàng: {{props.orderData.bank_name}}</div>
  <div class="head-two flex flex-1 flex-dc bg-white bor p-20 m-b-10 right-column">
    <div style="margin:0px 0 10px;" v-if="props.orderData.holder_name != ''">
      <div class="p-b-10">Thông tin người thụ hưởng:</div>
      <div class="item flex flex-sb">
        <div class="info" id="name">{{props.orderData.holder_name}}</div>
      </div>
    </div>

    <div style="margin:0px 0 10px;" v-if="props.orderData.channel_id == 5014">
      <div class="p-b-10">đồng token:</div>
      <div class="item flex flex-sb">
        <div class="info" id="sn" value="">TRC20</div>
      </div>
    </div>

    <div style="margin:0px 0 10px;" v-if="props.orderData.channel_id == 5015">
      <div class="p-b-10">đồng token:</div>
      <div class="item flex flex-sb">
        <div class="info" id="sn" value="">TRX</div>
      </div>
    </div>

    <div style="margin:0px 0 10px;">
      <div class="p-b-10">Số tài khoản:</div>
      <div class="item flex flex-sb">
        <div class="info" id="sn" value="" :title="props.orderData.bank_card_number">{{props.orderData.bank_card_number}}</div>
        <button class="btn copySn" data-clipboard-target="#sn"  @click="copyText(props.orderData.bank_card_number)">sao chép</button>
      </div>
    </div>

    <div style="margin:0px 0 10px;">
      <div class="p-b-10">số tiền:</div>
      <div class="item flex flex-sb">
        <div class="info" id="amount">{{formatAmount(props.orderData.amount)}} {{props.orderData.currency}}</div>

        <button class="btn copyAmount" data-clipboard-target="#amount"  @click="copyText(props.orderData.amount)">sao chép</button>
      </div>
    </div>
    <div style="margin:0px 0 10px;" v-if="props.orderData.channel_id != 5014 && props.orderData.channel_id != 5015">
    <!-- <div style="margin:0px 0 10px;" > -->
      <div class="p-b-10">Nội dung chuyển:</div>
      <p style="color:#ff8080;margin-bottom:2px">Vui lòng điền chính xác Nội dung chuyển vào mục Nội dung chuyển tiền</p>
      <div class="item flex flex-sb">
        <div class="info" id="code" value="">
          {{props.orderData.code}}
        </div>
        <button class="btn copyCode" data-clipboard-target="#code"  @click="copyText(props.orderData.code)">sao chép</button>
      </div>
    </div>
    
  </div>
</template>
<style>
.head-two .flex{display:flex}
/* 复制提示样式 */
.copy-toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 12px 24px;
  border-radius: 4px;
  font-size: 14px;
  z-index: 9999;
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
  white-space: nowrap;
  min-width: 200px;
  text-align: center;
}

/* 显示提示时的样式 */
.copy-toast.success.show, .copy-toast.error.show {
  opacity: 1;
}

/* 复制成功提示样式 */
.copy-toast.success {
  background-color: rgba(0, 0, 0, 0.7);
}

/* 复制失败提示样式 */
.copy-toast.error {
  background-color: rgba(211, 58, 44, 0.9);
}
</style>
