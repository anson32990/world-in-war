<template>
  <div class="timeline-container">
    <div class="timeline-header">
      <h2>📅 时间轴</h2>
      <span class="selected-date">当前日期：{{ formatDate(selectedDate) }}</span>
    </div>
    
    <div class="timeline-content">
      <el-slider
        v-model="sliderValue"
        :min="minDate"
        :max="maxDate"
        :step="stepValue"
        :format-value="formatDate"
        :marks="marks"
        :tooltip-props="{ 
          formatter: (val) => formatTooltip(val) 
        }"
        @change="onDateChange"
      />
      
      <div class="timeline-controls">
        <el-button @click="decrementDate" :icon="Minus">上一月</el-button>
        <el-button @click="resetToToday">回到本月</el-button>
        <el-button @click="incrementDate" :icon="Plus">下一月</el-button>
      </div>
      
      <div class="active-conflicts-info">
        <h3>📊 当前活跃冲突</h3>
        <div class="conflicts-list">
          <el-empty v-if="activeConflicts.length === 0" description="该日期没有活跃的冲突" />
          <el-card
            v-for="conflict in activeConflicts"
            :key="conflict.id"
            class="conflict-card"
            shadow="hover"
            @click="selectConflict(conflict)"
          >
            <div class="conflict-card-header">
              <span class="conflict-name">{{ conflict.name }}</span>
              <el-tag :type="getIntensityType(conflict.intensity)" size="small">
                {{ getIntensityLabel(conflict.intensity) }}
              </el-tag>
            </div>
            <div class="conflict-card-body">
              <span class="conflict-countries">
                {{ getCountryNames(conflict.countries) }}
              </span>
              <span class="conflict-duration">
                {{ conflict.startDate }} - {{ conflict.endDate || '至今' }}
              </span>
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useConflictStore } from '../stores/conflictStore'
import { Minus, Plus } from '@element-plus/icons-vue'

const store = useConflictStore()
const selectedDate = ref(new Date().toISOString().split('T')[0])

// 从 1945 年（二战结束）开始
const startYear = 1945
const currentYear = new Date().getFullYear()

// 转换为月份滑块值 (YYYYMM 格式)
const minDate = startYear * 100 + 1  // 194501 = 1945 年 1 月
const maxDate = currentYear * 100 + 12  // 202612 = 2026 年 12 月
const stepValue = 1  // 每次移动 1 个月

const sliderValue = ref(dateToSlider(selectedDate.value))

// 生成月份标记
const marks = {}
for (let year = startYear; year <= currentYear; year += 5) {
  marks[year * 100 + 1] = `${year}年`
}

const activeConflicts = computed(() => {
  return store.getConflictsByDate(selectedDate.value)
})

function dateToSlider(dateStr) {
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  return year * 100 + month
}

function sliderToDate(sliderValue) {
  const year = Math.floor(sliderValue / 100)
  const month = sliderValue % 100
  // 返回该月的第一天
  return `${year}-${String(month).padStart(2, '0')}-01`
}

function formatDate(value) {
  if (typeof value === 'number') {
    const year = Math.floor(value / 100)
    const month = value % 100
    return `${year}年${month}月`
  }
  const date = new Date(value)
  return `${date.getFullYear()}年${date.getMonth() + 1}月`
}

function formatTooltip(value) {
  return formatDate(value)
}

function onDateChange(value) {
  selectedDate.value = sliderToDate(value)
  store.setSelectedDate(selectedDate.value)
}

// 增加一个月
function incrementDate() {
  const date = new Date(selectedDate.value)
  date.setMonth(date.getMonth() + 1)
  selectedDate.value = date.toISOString().split('T')[0]
  sliderValue.value = dateToSlider(selectedDate.value)
  store.setSelectedDate(selectedDate.value)
}

// 减少一个月
function decrementDate() {
  const date = new Date(selectedDate.value)
  date.setMonth(date.getMonth() - 1)
  selectedDate.value = date.toISOString().split('T')[0]
  sliderValue.value = dateToSlider(selectedDate.value)
  store.setSelectedDate(selectedDate.value)
}

function resetToToday() {
  selectedDate.value = new Date().toISOString().split('T')[0]
  sliderValue.value = dateToSlider(selectedDate.value)
  store.setSelectedDate(selectedDate.value)
}

function selectConflict(conflict) {
  store.selectConflict(conflict)
  window.dispatchEvent(new CustomEvent('open-conflict-detail', { detail: conflict }))
}

function getIntensityType(intensity) {
  const types = { high: 'danger', medium: 'warning', low: 'primary' }
  return types[intensity] || 'info'
}

function getIntensityLabel(intensity) {
  const labels = { high: '高强度', medium: '中强度', low: '低强度' }
  return labels[intensity] || '未知'
}

// ISO 国家代码到中文名称映射
const countryNames = {
  // 亚洲
  CHN: '中国',
  JPN: '日本',
  KOR: '韩国',
  PRK: '朝鲜',
  MMR: '缅甸',
  IRN: '伊朗',
  IRQ: '伊拉克',
  ISR: '以色列',
  SAU: '沙特阿拉伯',
  // 欧洲
  RUS: '俄罗斯',
  UKR: '乌克兰',
  GBR: '英国',
  DEU: '德国',
  FRA: '法国',
  // 美洲
  USA: '美国',
  CAN: '加拿大',
  // 非洲
  SDN: '苏丹',
  COD: '刚果（金）',
  COG: '刚果（布）',
  // 中东
  PSE: '巴勒斯坦',
  TUR: '土耳其',
  SYR: '叙利亚',
  YEM: '也门'
}

function getCountryName(code) {
  return countryNames[code] || code
}

function getCountryNames(codes) {
  return codes.map(code => getCountryName(code)).join(' / ')
}

onMounted(() => {
  resetToToday()
})
</script>

<style scoped>
.timeline-container {
  background: #16213e;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.timeline-header h2 {
  font-size: 1.2rem;
  color: #e94560;
}

.selected-date {
  color: #888;
  font-size: 0.9rem;
}

.timeline-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.timeline-controls {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.active-conflicts-info {
  margin-top: 10px;
}

.active-conflicts-info h3 {
  font-size: 1rem;
  color: #e94560;
  margin-bottom: 15px;
}

.conflicts-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
  max-height: 300px;
  overflow-y: auto;
  padding: 10px;
}

.conflict-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.conflict-card:hover {
  transform: translateY(-2px);
}

.conflict-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.conflict-name {
  font-weight: 600;
  color: #333;
}

.conflict-card-body {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 0.85rem;
}

.conflict-countries {
  color: #666;
}

.conflict-duration {
  color: #999;
}

:deep(.el-slider) {
  --el-slider-main-bg-color: #e94560;
  --el-slider-runway-bg-color: #333;
}

:deep(.el-slider__marks-text) {
  color: #888;
  font-size: 0.8rem;
}

:deep(.el-button) {
  background: #1a1a2e;
  border-color: #333;
  color: #eee;
}

:deep(.el-button:hover) {
  background: #e94560;
  border-color: #e94560;
  color: #fff;
}
</style>
