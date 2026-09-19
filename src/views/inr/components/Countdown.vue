<!-- Countdown.vue -->
<template>
    <div class="time-remaining-right">
      {{ formatTime(hours) }}:{{ formatTime(minutes) }}:{{ formatTime(seconds) }}
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  initialSeconds: {
    type: Number,
    required: true
  },
  label: {
    type: String,
    default: 'Time remaining'
  }
})

const totalSeconds = ref(props.initialSeconds)
const hours = ref(0)
const minutes = ref(0)
const seconds = ref(0)
let timer = null

// 格式化时间显示
const formatTime = (time) => {
  return time.toString().padStart(2, '0')
}

// 更新时间显示
const updateTime = () => {
  if (totalSeconds.value <= 0) {
    clearInterval(timer)
    emit('finish');
    return
  }
  totalSeconds.value--
  hours.value = Math.floor(totalSeconds.value / 3600)
  minutes.value = Math.floor((totalSeconds.value % 3600) / 60)
  seconds.value = totalSeconds.value % 60
  emit('throb', totalSeconds.value);
}

// 开始计时
const startTimer = () => {
  timer = setInterval(updateTime, 1000)
}

// 重置计时
const resetTimer = () => {
  clearInterval(timer)
  totalSeconds.value = props.initialSeconds
  startTimer()
}

// 监听初始时间变化
watch(() => props.initialSeconds, (newVal) => {
  totalSeconds.value = newVal
  resetTimer()
})

onMounted(() => {
  startTimer()
})

onUnmounted(() => {
  clearInterval(timer)
})

const emit = defineEmits(['finish', 'throb']);
</script>

<style scoped>
/* 时间显示样式保持与原组件一致 */
.time-remaining {
  display: flex;
  justify-content: center;
  align-items: center;
}

.time-remaining-left {
  color: #000;
  margin-right: 10px;
}

.time-remaining-right {
  color: #C94D24;
  font-weight: bold;
}
</style>
