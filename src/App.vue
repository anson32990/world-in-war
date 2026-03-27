<template>
  <div class="app-container">
    <header class="header">
      <h1>🌍 World in War</h1>
      <p class="subtitle">世界战争地图 - 追踪全球冲突</p>
      
      <!-- GitHub 链接 -->
      <a 
        href="https://github.com/anson32990/world-in-war" 
        target="_blank" 
        rel="noopener noreferrer"
        class="github-link"
        title="在 GitHub 上查看"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
        <span>GitHub</span>
      </a>
    </header>

    <main class="main-content">
      <WorldMap />
      <Timeline />
    </main>

    <footer class="footer">
      <p>World in War © 2026 - 数据来源于公开资料或AI生成，仅供参考</p>
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
  position: relative;
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

.github-link {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  color: #eee;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.github-link:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  transform: translateY(-2px);
}

.github-link svg {
  width: 20px;
  height: 20px;
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
