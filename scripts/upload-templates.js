// 视频模板上传脚本 - 支持多个云存储平台
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import fetch from 'node-fetch'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 配置选项
const CONFIG = {
  // 本地视频文件夹路径
  localVideoDir: path.join(__dirname, '../videos'),
  // 输出目录
  outputDir: path.join(__dirname, '../public'),
  // 云存储配置
  storage: {
    // 阿里云 OSS
    aliyun: {
      enabled: false,
      region: process.env.ALIYUN_OSS_REGION || 'oss-cn-hangzhou',
      accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
      accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
      bucket: process.env.ALIYUN_OSS_BUCKET,
      domain: process.env.ALIYUN_OSS_DOMAIN // 自定义域名
    },
    // 腾讯云 COS
    tencent: {
      enabled: false,
      secretId: process.env.TENCENT_SECRET_ID,
      secretKey: process.env.TENCENT_SECRET_KEY,
      region: process.env.TENCENT_COS_REGION || 'ap-beijing',
      bucket: process.env.TENCENT_COS_BUCKET,
      domain: process.env.TENCENT_COS_DOMAIN
    },
    // Cloudflare R2
    r2: {
      enabled: true,
      accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
      bucket: process.env.CLOUDFLARE_R2_BUCKET,
      domain: process.env.CLOUDFLARE_R2_DOMAIN
    }
  }
}

class TemplateUploader {
  constructor() {
    this.uploadedTemplates = []
    this.ensureDirectories()
  }

  ensureDirectories() {
    if (!fs.existsSync(CONFIG.localVideoDir)) {
      fs.mkdirSync(CONFIG.localVideoDir, { recursive: true })
      console.log(`📁 创建本地视频目录: ${CONFIG.localVideoDir}`)
    }
    if (!fs.existsSync(CONFIG.outputDir)) {
      fs.mkdirSync(CONFIG.outputDir, { recursive: true })
    }
  }

  // 扫描本地视频文件（递归扫描子文件夹）
  scanLocalVideos() {
    console.log('🔍 扫描本地视频文件...')
    
    if (!fs.existsSync(CONFIG.localVideoDir)) {
      console.log('❌ 本地视频目录不存在，请先创建并放入视频文件')
      return []
    }

    const videoFiles = []
    let id = 1

    // 递归扫描所有子文件夹
    const scanDirectory = (dir, category = null) => {
      const items = fs.readdirSync(dir)
      
      for (const item of items) {
        const itemPath = path.join(dir, item)
        const stat = fs.statSync(itemPath)
        
        if (stat.isDirectory()) {
          // 如果是文件夹，使用文件夹名作为分类
          const folderCategory = this.formatCategoryName(item)
          scanDirectory(itemPath, folderCategory)
        } else if (stat.isFile() && item.toLowerCase().endsWith('.mp4')) {
          // 如果是视频文件
          const name = path.parse(item).name
          videoFiles.push({
            id: id++,
            name: this.formatTemplateName(name),
            localPath: itemPath,
            fileName: item,
            category: category || this.extractCategoryFromFilename(name),
            type: 'video'
          })
        }
      }
    }

    scanDirectory(CONFIG.localVideoDir)
    console.log(`📊 找到 ${videoFiles.length} 个视频文件`)
    return videoFiles
  }

  // 从文件名提取分类
  extractCategoryFromFilename(filename) {
    const categoryMap = {
      '搞笑': ['funny', 'laugh', 'comedy', 'joke'],
      '酷炫': ['cool', 'awesome', 'swag', 'stylish'],
      '情绪': ['emotion', 'mood', 'feeling', 'reaction'],
      '互动': ['interaction', 'action', 'gesture', 'wave'],
      '打击': ['hit', 'slap', 'punch', 'beat'],
      '魔法': ['magic', 'spell', 'power', 'fx']
    }

    const lowerName = filename.toLowerCase()
    for (const [category, keywords] of Object.entries(categoryMap)) {
      if (keywords.some(keyword => lowerName.includes(keyword))) {
        return category
      }
    }
    return '其他'
  }

  // 格式化模板名称
  formatTemplateName(name) {
    // 移除 replicate-prediction- 前缀
    let cleanName = name.replace(/^replicate-prediction-/, '')
    
    // 移除文件扩展名
    cleanName = cleanName.replace(/\.mp4$/, '')
    
    // 如果是随机字符串，使用更友好的名称
    if (/^[a-z0-9]{20,}$/.test(cleanName)) {
      return '视频模板'
    }
    
    // 处理中文字符，确保JSON安全
    cleanName = cleanName.replace(/[\x00-\x1F\x7F-\x9F]/g, '') // 移除控制字符
    
    // 格式化其他名称
    return cleanName
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
  }

  // 格式化分类名称
  formatCategoryName(folderName) {
    // 直接使用文件夹名称作为分类
    return folderName
  }

  // 阿里云 OSS 上传
  async uploadToAliyun(template) {
    if (!CONFIG.storage.aliyun.enabled) return null

    try {
      const OSS = await import('ali-oss')
      const client = new OSS.default({
        region: CONFIG.storage.aliyun.region,
        accessKeyId: CONFIG.storage.aliyun.accessKeyId,
        accessKeySecret: CONFIG.storage.aliyun.accessKeySecret,
        bucket: CONFIG.storage.aliyun.bucket
      })

      const remotePath = `templates/${template.fileName}`
      const result = await client.put(remotePath, template.localPath)
      
      const url = CONFIG.storage.aliyun.domain 
        ? `https://${CONFIG.storage.aliyun.domain}/${remotePath}`
        : result.url

      console.log(`✅ 阿里云上传成功: ${template.name}`)
      return url
    } catch (error) {
      console.error(`❌ 阿里云上传失败: ${template.name}`, error.message)
      return null
    }
  }

  // 腾讯云 COS 上传
  async uploadToTencent(template) {
    if (!CONFIG.storage.tencent.enabled) return null

    try {
      const COS = await import('cos-nodejs-sdk-v5')
      const cos = new COS.default({
        SecretId: CONFIG.storage.tencent.secretId,
        SecretKey: CONFIG.storage.tencent.secretKey
      })

      const remotePath = `templates/${template.fileName}`
      const result = await cos.putObject({
        Bucket: CONFIG.storage.tencent.bucket,
        Region: CONFIG.storage.tencent.region,
        Key: remotePath,
        Body: fs.createReadStream(template.localPath)
      })

      const url = CONFIG.storage.tencent.domain
        ? `https://${CONFIG.storage.tencent.domain}/${remotePath}`
        : `https://${CONFIG.storage.tencent.bucket}.cos.${CONFIG.storage.tencent.region}.myqcloud.com/${remotePath}`

      console.log(`✅ 腾讯云上传成功: ${template.name}`)
      return url
    } catch (error) {
      console.error(`❌ 腾讯云上传失败: ${template.name}`, error.message)
      return null
    }
  }

  // Cloudflare R2 上传
  async uploadToR2(template) {
    if (!CONFIG.storage.r2.enabled) return null

    try {
      const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3')
      
      const client = new S3Client({
        region: 'auto',
        endpoint: `https://${CONFIG.storage.r2.accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: CONFIG.storage.r2.accessKeyId,
          secretAccessKey: CONFIG.storage.r2.secretAccessKey
        },
        forcePathStyle: true
      })

      const remotePath = `templates/${template.fileName}`
      const fileContent = fs.readFileSync(template.localPath)
      
      await client.send(new PutObjectCommand({
        Bucket: CONFIG.storage.r2.bucket,
        Key: remotePath,
        Body: fileContent,
        ContentType: 'video/mp4'
      }))

      const url = CONFIG.storage.r2.domain
        ? `https://${CONFIG.storage.r2.domain}/${remotePath}`
        : `https://pub-d13aea5d949d4ec79ba60a1e36ea96d4.r2.dev/${remotePath}`

      console.log(`✅ R2上传成功: ${template.name}`)
      return url
    } catch (error) {
      console.error(`❌ R2上传失败: ${template.name}`, error.message)
      return null
    }
  }

  // 上传单个模板
  async uploadTemplate(template) {
    console.log(`📤 上传模板: ${template.name}`)
    
    let videoUrl = null

    // 尝试多个云存储平台
    if (CONFIG.storage.aliyun.enabled) {
      videoUrl = await this.uploadToAliyun(template)
    }
    
    if (!videoUrl && CONFIG.storage.tencent.enabled) {
      videoUrl = await this.uploadToTencent(template)
    }
    
    if (!videoUrl && CONFIG.storage.r2.enabled) {
      videoUrl = await this.uploadToR2(template)
    }

    if (videoUrl) {
      return {
        ...template,
        gifUrl: videoUrl
      }
    } else {
      console.error(`❌ 所有平台上传失败: ${template.name}`)
      return null
    }
  }

  // 批量上传
  async uploadAll() {
    console.log('🚀 开始批量上传模板...')
    
    const templates = this.scanLocalVideos()
    if (templates.length === 0) {
      console.log('❌ 没有找到视频文件')
      return
    }

    const results = []
    for (const template of templates) {
      const result = await this.uploadTemplate(template)
      if (result) {
        results.push(result)
        this.uploadedTemplates.push(result)
      }
      
      // 避免请求过快
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // 生成 templates.json
    this.generateTemplatesJson(results)
    
    console.log(`\n📊 上传完成:`)
    console.log(`  成功: ${results.length}`)
    console.log(`  失败: ${templates.length - results.length}`)
  }

  // 生成 templates.json
  generateTemplatesJson(templates) {
    const outputPath = path.join(CONFIG.outputDir, 'templates.json')
    fs.writeFileSync(outputPath, JSON.stringify(templates, null, 2))
    console.log(`📄 已生成 templates.json: ${outputPath}`)
  }

  // 生成环境变量配置模板
  generateEnvTemplate() {
    const envTemplate = `# 云存储配置模板
# 复制到 .env 文件并填入真实值

# 阿里云 OSS
ALIYUN_OSS_REGION=oss-cn-hangzhou
ALIYUN_ACCESS_KEY_ID=your_access_key_id
ALIYUN_ACCESS_KEY_SECRET=your_access_key_secret
ALIYUN_OSS_BUCKET=your_bucket_name
ALIYUN_OSS_DOMAIN=your_custom_domain.com

# 腾讯云 COS
TENCENT_SECRET_ID=your_secret_id
TENCENT_SECRET_KEY=your_secret_key
TENCENT_COS_REGION=ap-beijing
TENCENT_COS_BUCKET=your_bucket_name
TENCENT_COS_DOMAIN=your_custom_domain.com

# Cloudflare R2
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key_id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_access_key
CLOUDFLARE_R2_BUCKET=your_bucket_name
CLOUDFLARE_R2_DOMAIN=your_custom_domain.com
`
    
    fs.writeFileSync(path.join(__dirname, '../.env.template'), envTemplate)
    console.log('📝 已生成 .env.template 配置文件')
  }
}

// 命令行使用
async function main() {
  const uploader = new TemplateUploader()
  
  const command = process.argv[2]
  
  switch (command) {
    case 'scan':
      console.log('🔍 扫描本地视频文件...')
      const templates = uploader.scanLocalVideos()
      console.log('找到的模板:', templates)
      break
      
    case 'upload':
      await uploader.uploadAll()
      break
      
    case 'env':
      uploader.generateEnvTemplate()
      break
      
    default:
      console.log('使用方法:')
      console.log('  node upload-templates.js scan   - 扫描本地视频')
      console.log('  node upload-templates.js upload - 上传所有视频')
      console.log('  node upload-templates.js env    - 生成环境变量模板')
      break
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

export default TemplateUploader
