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
import { ref, onMounted, watch, computed } from 'vue'
import { useConflictStore } from '../stores/conflictStore'
import * as L from 'leaflet'

const mapContainer = ref(null)
const store = useConflictStore()
const dialogVisible = ref(false)

let map = null
const geoJsonLayer = ref(null)
const selectedConflict = ref(null)

const intensityColors = {
  high: '#e94560',
  medium: '#f39c12',
  low: '#3498db'
}

// 创建国家代码到冲突的映射
const countryConflictMap = computed(() => {
  const map = {}
  store.conflicts.forEach(conflict => {
    if (conflict.status !== 'active') return
    conflict.countries.forEach(code => {
      if (!map[code] || conflict.intensity === 'high') {
        // 高强度冲突优先显示
        map[code] = conflict
      } else if (map[code].intensity !== 'high' && conflict.intensity === 'medium') {
        map[code] = conflict
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

const getCountryStyle = (feature) => {
  const countryCode = feature.properties['ISO3166-1-Alpha-3'] || feature.properties.A3 || feature.properties.iso_a3
  const conflict = countryConflictMap.value[countryCode]
  
  if (conflict) {
    const color = intensityColors[conflict.intensity] || intensityColors.high
    return {
      fillColor: color,
      fillOpacity: 0.7,
      color: color,
      weight: 2,
      opacity: 1
    }
  }
  
  // 默认样式
  return {
    fillColor: '#3a3a5a',
    fillOpacity: 0.5,
    color: '#555',
    weight: 1,
    opacity: 0.8
  }
}

const onCountryClick = (e) => {
  const countryCode = e.target.feature.properties['ISO3166-1-Alpha-3'] || e.target.feature.properties.A3
  const conflict = countryConflictMap.value[countryCode]
  
  if (conflict) {
    selectedConflict.value = conflict
    dialogVisible.value = true
  }
}

const onCountryMouseOver = (e) => {
  const layer = e.target
  const countryCode = layer.feature.properties['ISO3166-1-Alpha-3'] || layer.feature.properties.A3
  const conflict = countryConflictMap.value[countryCode]
  
  if (conflict) {
    layer.setStyle({
      weight: 3,
      fillOpacity: 0.9
    })
    layer.bringToFront()
  }
}

const onCountryMouseOut = (e) => {
  const layer = e.target
  const countryCode = layer.feature.properties['ISO3166-1-Alpha-3'] || layer.feature.properties.A3
  const conflict = countryConflictMap.value[countryCode]
  
  if (conflict) {
    layer.setStyle({
      weight: 2,
      fillOpacity: 0.7
    })
  } else {
    layer.setStyle({
      weight: 1,
      fillOpacity: 0.5
    })
  }
}

const initMap = async () => {
  if (!mapContainer.value) return

  map = L.map(mapContainer.value, {
    center: [20, 0],
    zoom: 2,
    minZoom: 2,
    maxZoom: 8,
    zoomControl: false
  })

  L.control.zoom({
    position: 'bottomright'
  }).addTo(map)

  // 深色地图底图
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map)

  // 加载本地 GeoJSON 数据
  try {
    const response = await fetch('/countries.geojson')
    const geoData = await response.json()
    
    geoJsonLayer.value = L.geoJSON(geoData, {
      style: getCountryStyle,
      onEachFeature: (feature, layer) => {
        layer.on({
          click: onCountryClick,
          mouseover: onCountryMouseOver,
          mouseout: onCountryMouseOut
        })
        
        // 添加提示
        const countryName = feature.properties.name || ''
        const countryCode = feature.properties['ISO3166-1-Alpha-3'] || ''
        const conflict = countryConflictMap.value[countryCode]
        
        if (conflict) {
          layer.bindTooltip(`${countryName}\n${conflict.name}`, {
            permanent: false,
            direction: 'top'
          })
        }
      }
    }).addTo(map)
  } catch (error) {
    console.error('加载 GeoJSON 失败:', error)
  }
}

watch(() => store.selectedDate, () => {
  // 重新渲染地图
  if (geoJsonLayer.value) {
    map.removeLayer(geoJsonLayer.value)
  }
  
  if (map && geoJsonLayer.value) {
    geoJsonLayer.value = L.geoJSON(geoJsonLayer.value.toGeoJSON(), {
      style: getCountryStyle,
      onEachFeature: (feature, layer) => {
        layer.on({
          click: onCountryClick,
          mouseover: onCountryMouseOver,
          mouseout: onCountryMouseOut
        })
      }
    }).addTo(map)
  }
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

/* Leaflet 样式覆盖 */
:deep(.leaflet-control-zoom) {
  border: none !important;
  box-shadow: 0 2px 10px rgba(0,0,0,0.3) !important;
}

:deep(.leaflet-control-zoom-in),
:deep(.leaflet-control-zoom-out) {
  background: rgba(22, 33, 62, 0.9) !important;
  color: #eee !important;
  border: none !important;
}

:deep(.leaflet-control-zoom-in:hover),
:deep(.leaflet-control-zoom-out:hover) {
  background: rgba(233, 69, 96, 0.9) !important;
  color: #fff !important;
}
</style>
