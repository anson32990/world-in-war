<template>
  <div class="map-container">
    <div class="map-header">
      <h2>🗺️ 全球冲突地图</h2>
      <div class="legend">
        <span class="legend-item">
          <span class="legend-box high"></span> 高强度
        </span>
        <span class="legend-item">
          <span class="legend-box medium"></span> 中强度
        </span>
        <span class="legend-item">
          <span class="legend-box low"></span> 低强度
        </span>
      </div>
    </div>

    <div class="svg-map-wrapper">
      <div 
        class="svg-map-container"
        ref="mapContainer"
        @wheel.prevent="handleWheel"
      >
        <div 
          class="svg-map-content"
          ref="mapContent"
          :style="mapTransformStyle"
        >
          <svg
            v-if="svgContent"
            viewBox="0 0 1009.67 665.96"
            xmlns="http://www.w3.org/2000/svg"
            v-html="svgContent"
          ></svg>
        </div>
      </div>
      
      <!-- 缩放控制 -->
      <div class="zoom-controls">
        <button @click="zoomIn" class="zoom-btn">+</button>
        <button @click="zoomOut" class="zoom-btn">-</button>
        <button @click="resetMap" class="zoom-btn">重置</button>
      </div>
    </div>

    <!-- 国家提示框 -->
    <div v-if="tooltip.visible" class="map-tooltip" :style="tooltipStyle">
      <strong>{{ tooltip.name }}</strong>
      <div v-if="tooltip.conflict" class="tooltip-conflict">
        {{ tooltip.conflict.name }}
        <el-tag size="small" :type="getIntensityType(tooltip.conflict.intensity)">
          {{ getIntensityLabel(tooltip.conflict.intensity) }}
        </el-tag>
      </div>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="selectedConflict?.name"
      width="600px"
      @close="handleDialogClose"
    >
      <div v-if="selectedConflict" class="conflict-detail">
        <div class="conflict-info">
          <p><strong>状态:</strong>
            <el-tag :type="selectedConflict.status === 'active' ? 'danger' : 'info'">
              {{ selectedConflict.status === 'active' ? '进行中' : '已结束' }}
            </el-tag>
          </p>
          <p><strong>时间:</strong> {{ selectedConflict.startDate }} - {{ selectedConflict.endDate || '至今' }}</p>
          <p><strong>强度:</strong>
            <el-tag :type="getIntensityType(selectedConflict.intensity)">
              {{ getIntensityLabel(selectedConflict.intensity) }}
            </el-tag>
          </p>
        </div>

        <el-divider>冲突详情</el-divider>
        <p class="description">{{ selectedConflict.description }}</p>

        <el-divider>伤亡统计</el-divider>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="军人伤亡">{{ selectedConflict.casualties.military }}</el-descriptions-item>
          <el-descriptions-item label="平民伤亡">{{ selectedConflict.casualties.civilian }}</el-descriptions-item>
          <el-descriptions-item label="流离失所">{{ selectedConflict.casualties.displaced }}</el-descriptions-item>
        </el-descriptions>

        <el-divider>时间线</el-divider>
        <el-timeline>
          <el-timeline-item
            v-for="event in selectedConflict.timeline"
            :key="event.date"
            :timestamp="event.date"
            placement="top"
          >
            {{ event.event }}
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
import { useConflictStore } from '../stores/conflictStore'

const mapContainer = ref(null)
const mapContent = ref(null)
const store = useConflictStore()
const dialogVisible = ref(false)
const selectedConflict = ref(null)
const svgContent = ref('')
const tooltip = ref({ visible: false, name: '', conflict: null })
const tooltipPos = ref({ x: 0, y: 0 })

// 缩放和平移状态
const scale = ref(0.9)
const translateX = ref(0)
const translateY = ref(0)
const isDragging = ref(false)
const startX = ref(0)
const startY = ref(0)

const intensityColors = {
  high: '#e94560',
  medium: '#f39c12',
  low: '#3498db',
  none: '#3a3a5a'
}

const mapTransformStyle = computed(() => ({
  transform: `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value})`,
  transformOrigin: 'center center'
}))

const tooltipStyle = computed(() => ({
  left: `${tooltipPos.value.x}px`,
  top: `${tooltipPos.value.y}px`
}))

// 创建国家代码到冲突的映射
const countryConflictMap = computed(() => {
  const map = {}
  const date = store.selectedDate
  const targetDate = new Date(date)
  const targetYear = targetDate.getFullYear()
  const targetMonth = targetDate.getMonth()

  store.conflicts.forEach(conflict => {
    const startDate = new Date(conflict.startDate)
    const endDate = conflict.endDate ? new Date(conflict.endDate) : null
    const startYear = startDate.getFullYear()
    const startMonth = startDate.getMonth()

    if (targetYear < startYear || (targetYear === startYear && targetMonth < startMonth)) {
      return
    }

    if (endDate) {
      const endYear = endDate.getFullYear()
      const endMonth = endDate.getMonth()
      if (targetYear > endYear || (targetYear === endYear && targetMonth > endMonth)) {
        return
      }
    }

    conflict.countries.forEach(code => {
      if (!map[code]) {
        map[code] = conflict
      } else {
        const currentIntensity = map[code].intensity
        const newIntensity = conflict.intensity
        const intensityOrder = { high: 3, medium: 2, low: 1 }
        if (intensityOrder[newIntensity] > intensityOrder[currentIntensity]) {
          map[code] = conflict
        }
      }
    })
  })
  return map
})

const getIntensityType = (intensity) => {
  const types = { high: 'danger', medium: 'warning', low: 'primary' }
  return types[intensity] || 'info'
}

const getIntensityLabel = (intensity) => {
  const labels = { high: '高强度', medium: '中强度', low: '低强度' }
  return labels[intensity] || '未知'
}

// 更新地图颜色
const updateMapColors = () => {
  if (!mapContainer.value) return

  const paths = mapContainer.value.querySelectorAll('path')
  paths.forEach(path => {
    const code = path.id
    const conflict = countryConflictMap.value[code]
    const title = path.getAttribute('title') || ''

    if (conflict) {
      path.style.fill = intensityColors[conflict.intensity]
      path.style.cursor = 'pointer'
      path.classList.add('has-conflict')
      path.dataset.conflict = 'true'
    } else {
      path.style.fill = intensityColors.none
      path.style.cursor = 'default'
      path.classList.remove('has-conflict')
      path.dataset.conflict = 'false'
    }

    // 存储国家信息用于提示
    path.dataset.name = title
    path.dataset.code = code
  })
}

// 添加交互事件
const addInteractions = () => {
  if (!mapContainer.value) return

  const paths = mapContainer.value.querySelectorAll('path')
  paths.forEach(path => {
    path.addEventListener('click', handleCountryClick)
    path.addEventListener('mouseenter', handleCountryMouseEnter)
    path.addEventListener('mouseleave', handleCountryMouseLeave)
    path.addEventListener('mousemove', handleCountryMouseMove)
  })

  // 拖拽事件
  mapContainer.value.addEventListener('mousedown', handleDragStart)
  document.addEventListener('mousemove', handleDragMove)
  document.addEventListener('mouseup', handleDragEnd)
}

const handleCountryClick = (e) => {
  const code = e.target.id
  const conflict = countryConflictMap.value[code]
  if (conflict) {
    selectedConflict.value = conflict
    dialogVisible.value = true
  }
}

const handleCountryMouseEnter = (e) => {
  const path = e.target
  const code = path.id
  const name = path.getAttribute('title') || ''
  const conflict = countryConflictMap.value[code]

  if (conflict) {
    tooltip.value = {
      visible: true,
      name,
      conflict
    }
    path.style.filter = 'brightness(1.3)'
    path.style.stroke = '#fff'
    path.style.strokeWidth = '1'
  } else {
    tooltip.value = {
      visible: true,
      name,
      conflict: null
    }
  }
}

const handleCountryMouseLeave = (e) => {
  const path = e.target
  const code = path.id
  const conflict = countryConflictMap.value[code]

  if (conflict) {
    path.style.filter = ''
    path.style.stroke = ''
    path.style.strokeWidth = ''
  }
  tooltip.value.visible = false
}

const handleCountryMouseMove = (e) => {
  tooltipPos.value = {
    x: e.clientX + 15,
    y: e.clientY + 15
  }
}

// 缩放控制
const handleWheel = (e) => {
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  const newScale = Math.min(Math.max(scale.value + delta, 0.5), 5)
  scale.value = newScale
}

const zoomIn = () => {
  scale.value = Math.min(scale.value + 0.5, 5)
}

const zoomOut = () => {
  scale.value = Math.max(scale.value - 0.5, 0.5)
}

const resetMap = () => {
  scale.value = 0.9
  translateX.value = 0
  translateY.value = 0
}

// 拖拽控制
const handleDragStart = (e) => {
  if (e.target.tagName === 'path') return
  isDragging.value = true
  startX.value = e.clientX - translateX.value
  startY.value = e.clientY - translateY.value
  mapContainer.value.style.cursor = 'grabbing'
}

const handleDragMove = (e) => {
  if (!isDragging.value) return
  translateX.value = e.clientX - startX.value
  translateY.value = e.clientY - startY.value
}

const handleDragEnd = () => {
  isDragging.value = false
  if (mapContainer.value) {
    mapContainer.value.style.cursor = 'grab'
  }
}

const handleDialogClose = () => {
  selectedConflict.value = null
}

// 加载 SVG
const loadSVG = async () => {
  try {
    const response = await fetch('/world-map.svg')
    const svgText = await response.text()
    // 移除 SVG 中的 width 和 height 属性，让它自适应
    const cleanedSvg = svgText
      .replace(/width="[^"]*"/, '')
      .replace(/height="[^"]*"/, '')
    svgContent.value = cleanedSvg
    
    nextTick(() => {
      updateMapColors()
      addInteractions()
    })
  } catch (error) {
    console.error('加载 SVG 失败:', error)
  }
}

// 监听日期变化
watch(() => store.selectedDate, () => {
  updateMapColors()
})

onMounted(() => {
  loadSVG()
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleDragMove)
  document.removeEventListener('mouseup', handleDragEnd)
})
</script>

<style scoped>
.map-container {
  background: #16213e;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.map-header {
  padding: 15px 20px;
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.map-header h2 {
  font-size: 1.2rem;
  color: #e94560;
}

.legend {
  display: flex;
  gap: 15px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.85rem;
  color: #aaa;
}

.legend-box {
  width: 16px;
  height: 16px;
  display: inline-block;
  border-radius: 3px;
}

.legend-box.high {
  background: #e94560;
}

.legend-box.medium {
  background: #f39c12;
}

.legend-box.low {
  background: #3498db;
}

.svg-map-wrapper {
  position: relative;
  width: 100%;
  height: 600px;
  overflow: hidden;
  background: #0f1a2e;
}

.svg-map-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: center;
}

.svg-map-content {
  transition: transform 0.1s ease;
  min-width: 100%;
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.svg-map-content :deep(svg) {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
}

.svg-map-content :deep(path) {
  transition: fill 0.2s ease;
  stroke: #555;
  stroke-width: 0.5;
}

.zoom-controls {
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 10;
}

.zoom-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  background: rgba(22, 33, 62, 0.9);
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  transition: background 0.3s;
}

.zoom-btn:hover {
  background: rgba(233, 69, 96, 0.9);
}

.map-tooltip {
  position: fixed;
  background: rgba(22, 33, 62, 0.95);
  color: #fff;
  padding: 10px 15px;
  border-radius: 8px;
  font-size: 14px;
  pointer-events: none;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  max-width: 250px;
}

.tooltip-conflict {
  margin-top: 5px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.conflict-detail {
  color: #333;
}

.conflict-info p {
  margin-bottom: 10px;
}

.description {
  line-height: 1.8;
  color: #555;
}

:deep(.el-dialog) {
  background: #fff;
}

:deep(.el-dialog__title) {
  color: #333;
}

:deep(.el-tag) {
  font-size: 12px;
}
</style>
