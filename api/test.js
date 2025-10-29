export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  
  try {
    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN
    const AIFACESWAP_API_KEY = process.env.AIFACESWAP_API_KEY
    const IMGBB_API_KEY = process.env.IMGBB_API_KEY
    const FACESWAP_API = process.env.FACESWAP_API || 'replicate'
    
    // 判断当前使用的 API
    let currentAPI = 'None'
    if (FACESWAP_API === 'aifaceswap' && AIFACESWAP_API_KEY) {
      currentAPI = 'AIFaceSwap (Faster - 1-3 minutes)'
    } else if (REPLICATE_API_TOKEN) {
      currentAPI = 'Replicate (Slower - 5-10 minutes)'
    } else {
      currentAPI = 'None configured'
    }
    
    return res.json({
      success: true,
      message: 'API endpoint is working',
      currentAPI: currentAPI,
      env: {
        hasReplicateToken: !!REPLICATE_API_TOKEN,
        hasAIFaceSwapKey: !!AIFACESWAP_API_KEY,
        hasImgbbKey: !!IMGBB_API_KEY,
        faceswapApiSetting: FACESWAP_API,
        nodeVersion: process.version
      },
      recommendation: !AIFACESWAP_API_KEY && REPLICATE_API_TOKEN 
        ? 'Consider adding AIFACESWAP_API_KEY and setting FACESWAP_API=aifaceswap for faster processing'
        : null
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

