// SEO关键词搜索工具
import templateKeywordsMapping from '../../TEMPLATE_KEYWORDS_MAPPING.json'

// 从文件名生成slug
function generateSlug(fileName) {
  return fileName
    .replace(/\.mp4$/, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
}

// 获取模板的SEO配置
export function getTemplateSEOConfig(template) {
  const slug = generateSlug(template.fileName)
  const mapping = templateKeywordsMapping.templates.find(
    t => generateSlug(t.fileName) === slug
  )
  
  if (mapping) {
    return {
      seoName: mapping.seoName,
      keywords: mapping.keywords,
      description: mapping.description
    }
  }
  
  // 如果没有映射，返回默认值
  return {
    seoName: template.name,
    keywords: `${template.name} face swap, ${template.category.toLowerCase()} face swap`,
    description: `Create a ${template.name.toLowerCase()} face swap video!`
  }
}

// 扩展的搜索功能，支持SEO关键词匹配
export function searchTemplatesWithSEO(templates, searchQuery) {
  if (!searchQuery) return templates
  
  const query = searchQuery.toLowerCase().trim()
  const queryWords = query.split(/\s+/).filter(word => word.length > 0)
  
  if (queryWords.length === 0) return templates
  
  return templates.filter(template => {
    // 基础搜索：名称和分类
    const nameMatch = template.name.toLowerCase().includes(query)
    const categoryMatch = template.category.toLowerCase().includes(query)
    
    // SEO关键词搜索
    const seoConfig = getTemplateSEOConfig(template)
    const seoNameMatch = seoConfig.seoName.toLowerCase().includes(query)
    const keywordsMatch = seoConfig.keywords.toLowerCase().includes(query)
    const descriptionMatch = seoConfig.description.toLowerCase().includes(query)
    
    // 关键词分词匹配（提高匹配精度）
    const keywordsLower = seoConfig.keywords.toLowerCase()
    const keywordWordMatch = queryWords.some(word => keywordsLower.includes(word))
    
    // 描述分词匹配
    const descriptionLower = seoConfig.description.toLowerCase()
    const descriptionWordMatch = queryWords.some(word => descriptionLower.includes(word))
    
    return nameMatch || categoryMatch || seoNameMatch || keywordsMatch || 
           descriptionMatch || keywordWordMatch || descriptionWordMatch
  })
}

// 搜索建议（用于自动完成）
export function getSearchSuggestions(searchQuery, templates, maxSuggestions = 5) {
  if (!searchQuery || searchQuery.length < 2) return []
  
  const query = searchQuery.toLowerCase().trim()
  const suggestions = new Set()
  
  templates.forEach(template => {
    const seoConfig = getTemplateSEOConfig(template)
    
    // 从SEO名称提取建议
    const seoNameWords = seoConfig.seoName.toLowerCase().split(/\s+/)
    seoNameWords.forEach(word => {
      if (word.startsWith(query) && word.length > query.length) {
        suggestions.add(word)
      }
    })
    
    // 从关键词提取建议
    const keywords = seoConfig.keywords.toLowerCase().split(',').map(k => k.trim())
    keywords.forEach(keyword => {
      if (keyword.includes(query)) {
        const words = keyword.split(/\s+/)
        words.forEach(word => {
          if (word.length > query.length) {
            suggestions.add(word)
          }
        })
      }
    })
  })
  
  // 分类建议
  const categories = [...new Set(templates.map(t => t.category.toLowerCase()))]
  categories.forEach(category => {
    if (category.includes(query)) {
      suggestions.add(category)
    }
  })
  
  return Array.from(suggestions).slice(0, maxSuggestions)
}

// 按搜索相关性排序
export function sortByRelevance(templates, searchQuery) {
  if (!searchQuery) return templates
  
  const query = searchQuery.toLowerCase().trim()
  const queryWords = query.split(/\s+/).filter(word => word.length > 0)
  
  return [...templates].sort((a, b) => {
    const scoreA = calculateRelevanceScore(a, query, queryWords)
    const scoreB = calculateRelevanceScore(b, query, queryWords)
    return scoreB - scoreA
  })
}

// 计算相关性分数
function calculateRelevanceScore(template, query, queryWords) {
  let score = 0
  const seoConfig = getTemplateSEOConfig(template)
  
  // 名称完全匹配 - 最高分
  if (template.name.toLowerCase() === query) {
    score += 100
  }
  
  // 名称包含查询
  if (template.name.toLowerCase().includes(query)) {
    score += 50
  }
  
  // SEO名称完全匹配
  if (seoConfig.seoName.toLowerCase() === query) {
    score += 90
  }
  
  // SEO名称包含查询
  if (seoConfig.seoName.toLowerCase().includes(query)) {
    score += 45
  }
  
  // 关键词匹配
  const keywordsLower = seoConfig.keywords.toLowerCase()
  if (keywordsLower.includes(query)) {
    score += 40
  }
  
  // 关键词分词匹配
  const keywordMatches = queryWords.filter(word => keywordsLower.includes(word)).length
  score += keywordMatches * 10
  
  // 分类匹配
  if (template.category.toLowerCase().includes(query)) {
    score += 20
  }
  
  // 描述匹配
  const descriptionLower = seoConfig.description.toLowerCase()
  if (descriptionLower.includes(query)) {
    score += 15
  }
  
  return score
}

