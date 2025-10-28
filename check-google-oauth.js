/**
 * Google OAuth 配置检查工具
 * 在浏览器控制台运行此脚本来检查配置是否正确
 */

console.log('🔍 开始检查 Google OAuth 配置...\n')

// 1. 检查 Google API 是否已加载
if (typeof window !== 'undefined' && window.google) {
  console.log('✅ Google API 脚本已加载')
  
  // 2. 检查 Client ID 配置
  const scriptElement = document.getElementById('google-signin-script')
  if (scriptElement) {
    console.log('✅ Google 登录脚本已添加到页面')
  } else {
    console.log('⚠️  Google 登录脚本未找到')
  }
  
  // 3. 检查初始化状态
  try {
    const isInitialized = window.google.accounts && window.google.accounts.id
    if (isInitialized) {
      console.log('✅ Google 登录已初始化')
    } else {
      console.log('⚠️  Google 登录未初始化')
    }
  } catch (error) {
    console.error('❌ Google 登录初始化失败:', error)
  }
  
} else {
  console.error('❌ Google API 脚本未加载')
  console.log('请检查 index.html 中是否包含了 Google API 脚本')
}

// 4. 检查 Client ID
console.log('\n📋 检查项目配置...')
console.log('请检查以下内容：')
console.log('1. 在 src/App.jsx 中找到 client_id 配置')
console.log('2. 确认 client_id 不是 "YOUR_GOOGLE_CLIENT_ID"')
console.log('3. 确认 client_id 格式为: xxxxxx-xxxxx.apps.googleusercontent.com')
console.log('\n💡 如果上述检查都通过，请尝试点击 Log In 按钮测试登录功能')

