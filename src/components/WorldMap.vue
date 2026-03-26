<template>
  <div class="map-container">
    <div class="map-header">
      <h2>🗺️ 全球冲突地图</h2>
      <div class="legend">
        <span class="legend-item">
          <span class="legend-dot high"></span> 高强度
        </span>
        <span class="legend-item">
          <span class="legend-dot medium"></span> 中强度
        </span>
        <span class="legend-item">
          <span class="legend-dot low"></span> 低强度
        </span>
      </div>
    </div>
    <div ref="mapContainer" class="map"></div>
    
    <el-dialog
      v-model="dialogVisible"
      :title="selectedConflict?.name"
      width="600px"
      @close="clearSelection()"
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
import { ref, onMounted, watch } from 'vue'
import { useConflictStore } from '../stores/conflictStore'
import 'leaflet'

const mapContainer = ref(null)
const store = useConflictStore()
const dialogVisible = ref(false)

let map = null
const markers = []

const selectedConflict = ref(null)

const intensityColors = {
  high: '#e94560',
  medium: '#f39c12',
  low: '#3498db'
}

const getIntensityType = (intensity) => {
  const types = { high: 'danger', medium: 'warning', low: 'primary' }
  return types[intensity] || 'info'
}

const getIntensityLabel = (intensity) => {
  const labels = { high: '高强度', medium: '中强度', low: '低强度' }
  return labels[intensity] || '未知'
}

const initMap = () => {
  if (!mapContainer.value) return

  map = L.map(mapContainer.value).setView([20, 0], 2)

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map)

  addConflictMarkers()
}

const addConflictMarkers = () => {
  markers.forEach(marker => marker.remove())
  markers.length = 0

  store.conflicts.forEach(conflict => {
    if (conflict.status !== 'active') return

    conflict.countries.forEach(countryCode => {
      const country = store.countries[countryCode]
      if (!country) return

      const color = intensityColors[conflict.intensity] || '#e94560'
      
      const circle = L.circleMarker(country.coordinates, {
        color: color,
        fillColor: color,
        fillOpacity: 0.6,
        radius: 12
      }).addTo(map)

      circle.bindTooltip(`${country.name} - ${conflict.name}`, {
        permanent: false,
        direction: 'top'
      })

      circle.on('click', () => {
        selectedConflict.value = conflict
        dialogVisible.value = true
      })

      markers.push(circle)
    })
  })
}

watch(() => store.selectedDate, () => {
  addConflictMarkers()
})

onMounted(() => {
  initMap()
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

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

.legend-dot.high {
  background: #e94560;
}

.legend-dot.medium {
  background: #f39c12;
}

.legend-dot.low {
  background: #3498db;
}

.map {
  height: 500px;
  width: 100%;
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
</style>
