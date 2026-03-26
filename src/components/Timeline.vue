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
        <el-button @click="decrementDate" :icon="Minus">前一天</el-button>
        <el-button @click="resetToToday">回到今天</el-button>
        <el-button @click="incrementDate" :icon="Plus">后一天</el-button>
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

const minDate = 20200101
const maxDate = 20261231
const stepValue = 1

const sliderValue = ref(dateToSlider(selectedDate.value))

const marks = {
  20200101: '2020',
  20210101: '2021',
  20220101: '2022',
  20230101: '2023',
  20240101: '2024',
  20250101: '2025',
  20260101: '2026'
}

const activeConflicts = computed(() => {
  return store.getConflictsByDate(selectedDate.value)
})

function dateToSlider(dateStr) {
  const date = new Date(dateStr)
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate()
}

function sliderToDate(sliderValue) {
  const year = Math.floor(sliderValue / 10000)
  const month = Math.floor((sliderValue % 10000) / 100) - 1
  const day = sliderValue % 100
  const date = new Date(year, month, day)
  return date.toISOString().split('T')[0]
}

function formatDate(value) {
  if (typeof value === 'number') {
    const year = Math.floor(value / 10000)
    const month = Math.floor((value % 10000) / 100)
    const day = value % 100
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }
  return value
}

function formatTooltip(value) {
  return formatDate(value)
}

function onDateChange(value) {
  selectedDate.value = sliderToDate(value)
  store.setSelectedDate(selectedDate.value)
}

function incrementDate() {
  const date = new Date(selectedDate.value)
  date.setDate(date.getDate() + 1)
  selectedDate.value = date.toISOString().split('T')[0]
  sliderValue.value = dateToSlider(selectedDate.value)
  store.setSelectedDate(selectedDate.value)
}

function decrementDate() {
  const date = new Date(selectedDate.value)
  date.setDate(date.getDate() - 1)
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

function getCountryNames(codes) {
  return codes.map(code => store.countries[code]?.name || code).join(' / ')
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
