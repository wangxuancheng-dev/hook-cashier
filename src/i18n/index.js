import { createI18n } from 'vue-i18n'

const messages = {
  en: {
    loading: {
      text: 'Loading payment information...'
    },
    warning: {
      title: 'Warning',
      qrOneTime: 'QR code can only be used once. Please do not save the QR code for repeated payments! Otherwise, the funds cannot be returned!'
    },
    order: {
      amount: 'Order Amount',
      number: 'Transaction Number',
      createTime: 'Creation Time',
      expireTime: 'Expiration Time'
    },
    qr: {
      expired: 'QR Code Expired',
      save: 'Save QR Code'
    },
    error: {
      invalidParams: 'Invalid payment parameters',
      getInfoFailed: 'Failed to get payment information',
      retry: 'Failed to get payment information, please try again',
      saveFailed: 'Failed to save QR code, please try again'
    }
  },
  zh: {
    loading: {
      text: '正在加载支付信息...'
    },
    warning: {
      title: '警告',
      qrOneTime: '二维码只能支付一次，请不要保存二维码重复支付！否则资金无法返回！'
    },
    order: {
      amount: '订单金额',
      number: '交易单号',
      createTime: '订单生成时间',
      expireTime: '订单过期时间'
    },
    qr: {
      expired: '二维码已过期',
      save: '保存二维码'
    },
    error: {
      invalidParams: '无效的支付参数',
      getInfoFailed: '获取支付信息失败',
      retry: '获取支付信息失败，请稍后重试',
      saveFailed: '保存二维码失败，请重试'
    }
  },
  th: {
    loading: {
      text: 'กำลังโหลดข้อมูลการชำระเงิน...'
    },
    warning: {
      title: 'คำเตือน',
      qrOneTime: 'รหัส QR สามารถใช้ได้เพียงครั้งเดียว โปรดอย่าบันทึกรหัส QR เพื่อการชำระเงินซ้ำ! มิฉะนั้น จะไม่สามารถคืนเงินได้!'
    },
    order: {
      amount: 'จำนวนเงิน',
      number: 'หมายเลขธุรกรรม',
      createTime: 'เวลาสร้าง',
      expireTime: 'เวลาหมดอายุ'
    },
    qr: {
      expired: 'รหัส QR หมดอายุ',
      save: 'บันทึกรหัส QR'
    },
    error: {
      invalidParams: 'พารามิเตอร์การชำระเงินไม่ถูกต้อง',
      getInfoFailed: 'ไม่สามารถรับข้อมูลการชำระเงิน',
      retry: 'ไม่สามารถรับข้อมูลการชำระเงิน โปรดลองอีกครั้ง',
      saveFailed: 'ไม่สามารถบันทึกรหัส QR โปรดลองอีกครั้ง'
    }
  }
}

export const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: 'en', // 默认语言
  // locale: localStorage.getItem('payment-language') || navigator.language.split('-')[0] || 'en',
  fallbackLocale: 'en', // 回退语言
  messages
}) 

// 保存当前语言到 localStorage
if (typeof window !== 'undefined') {
  // localStorage.setItem('payment-language', i18n.global.locale.value)
}