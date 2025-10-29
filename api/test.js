export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  
  try {
    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN
    const IMGBB_API_KEY = process.env.IMGBB_API_KEY
    
    return res.json({
      success: true,
      message: 'API endpoint is working',
      env: {
        hasReplicateToken: !!REPLICATE_API_TOKEN,
        hasImgbbKey: !!IMGBB_API_KEY,
        nodeVersion: process.version
      }
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

