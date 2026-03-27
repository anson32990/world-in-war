/**
 * 一键部署脚本（跨平台，SSH 密钥登录）
 * 使用方法：npm run deploy
 * 
 * 前提：已配置 SSH 密钥到服务器
 * 配置：复制 .deploy.env.example 为 .deploy.env 并修改配置
 */
import { execSync } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// 读取 .deploy.env 文件
const envFile = join(__dirname, '.deploy.env')
const envConfig = {}

if (existsSync(envFile)) {
  const envContent = readFileSync(envFile, 'utf-8')
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=')
    if (key && value) {
      envConfig[key.trim()] = value.trim()
    }
  })
}

// 服务器配置（必须从 .deploy.env 读取）
const config = {
  host: envConfig.DEPLOY_HOST,
  user: envConfig.DEPLOY_USER,
  deployPath: envConfig.DEPLOY_PATH,
  port: envConfig.DEPLOY_PORT
}

// 验证配置
if (!config.host || !config.user || !config.deployPath || !config.port) {
  console.error('❌ 配置缺失！\n')
  console.error('📋 请复制并编辑配置文件：')
  console.error('   cp .deploy.env.example .deploy.env\n')
  console.error('💡 必需的配置项：')
  console.error('   DEPLOY_HOST=你的服务器 IP')
  console.error('   DEPLOY_USER=用户名')
  console.error('   DEPLOY_PATH=部署目录')
  console.error('   DEPLOY_PORT=SSH 端口\n')
  process.exit(1)
}

console.log('🚀 开始部署 World in War...\n')
console.log('📋 部署配置:')
console.log(`   服务器：${config.user}@${config.host}:${config.port}`)
console.log(`   部署目录：${config.deployPath}\n`)

try {
  // 1. 构建项目
  console.log('📦 步骤 1/2: 构建项目...')
  execSync('npm run build', { stdio: 'inherit', cwd: __dirname })
  console.log('✅ 构建完成\n')

  // 2. 上传到服务器
  console.log('📦 步骤 2/2: 上传文件到服务器...')
  console.log('   使用 scp 上传（SSH 密钥）...\n')
  
  const scpCmd = `scp -r -P ${config.port} ./dist/* ${config.user}@${config.host}:${config.deployPath}/`
  execSync(scpCmd, { stdio: 'inherit', cwd: __dirname })
  
  console.log('\n✅ 上传完成\n')
  console.log('🎉 部署成功！')
  
} catch (error) {
  console.error('❌ 部署失败:', error.message)
  console.error('')
  console.error('💡 可能的原因：')
  console.error('   1. SSH 密钥未配置')
  console.error('   2. SSH 密钥权限问题')
  console.error('   3. 服务器连接失败')
  console.error('')
  console.error('📋 测试 SSH 连接：')
  console.error(`   ssh ${config.user}@${config.host} -p ${config.port}\n`)
  process.exit(1)
}
