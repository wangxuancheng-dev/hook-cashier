<script setup>
import { ref, onMounted, defineAsyncComponent } from 'vue';

const Vnd = defineAsyncComponent(() => import('./views/vnd/index.vue'));
const Inr = defineAsyncComponent(() => import('./views/inr/index.vue'));
const Thb = defineAsyncComponent(() => import('./views/thb/index.vue'));
const Usdt = defineAsyncComponent(() => import('./views/usdt/index.vue'));
const Ngn = defineAsyncComponent(() => import('./views/ngn/index.vue'));
const Mmk = defineAsyncComponent(() => import('./views/mmk/index.vue'));
const Btc = defineAsyncComponent(() => import('./views/btc/index.vue'));
const Etc = defineAsyncComponent(() => import('./views/etc/index.vue'));


const url = new URL(window.location.href);
const trade_no = url.pathname.split('/').pop();

const currency_code = ref('');

onMounted(async () => {

  const currencyFromUrl = url.searchParams.get('currency');
  if (currencyFromUrl) {
    currency_code.value = currencyFromUrl;
  }else{
    try {
        const { default: axios } = await import('axios');
        const response = await axios.get(import.meta.env.VITE_API_URL + '/api/payments-currency/' + trade_no);
        currency_code.value = response.data.data;

        console.log(currency_code.value);
        
    } catch (error) {
        console.error('请求出错:', error);
    }
  }

});

</script>

<template>

    <div class="loader" v-if="currency_code == ''"></div>

    <Vnd v-if="currency_code == 'VND'" />

    <Thb v-if="currency_code == 'THB'" />

    <Inr v-if="currency_code == 'INR' && currency_code != ''" />

    <Usdt v-if="currency_code == 'USDT'" />

    <Ngn v-if="currency_code == 'NGN'" />

    <Mmk v-if="currency_code == 'MMK'" />

    <Btc v-if="currency_code == 'BTC'" />

    <Etc v-if="currency_code == 'ETC'" />

</template>

<style scoped>
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

</style>
