<template>
  <div class="app-container">
    <header class="header">
      <h1>🌍 World in War</h1>
      <p class="subtitle">世界战争地图 - 追踪全球冲突</p>
    </header>
    
    <main class="main-content">
      <WorldMap />
      <Timeline />
    </main>
    
    <footer class="footer">
      <p>World in War © 2026 - 数据来源于公开资料，仅供参考</p>
    </footer>
  </div>
</template>

<script setup>
import WorldMap from './components/WorldMap.vue'
import Timeline from './components/Timeline.vue'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #1a1a2e;
  color: #eee;
  min-height: 100vh;
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: linear-gradient(135deg, #16213e 0%, #1a1a2e 100%);
  padding: 20px 40px;
  text-align: center;
  border-bottom: 1px solid #333;
}

.header h1 {
  font-size: 2rem;
  color: #e94560;
  margin-bottom: 8px;
}

.subtitle {
  color: #888;
  font-size: 0.9rem;
}

.main-content {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.footer {
  background: #16213e;
  padding: 15px;
  text-align: center;
  color: #666;
  font-size: 0.85rem;
  border-top: 1px solid #333;
}
</style>
