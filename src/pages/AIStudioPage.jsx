import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

// Style presets and aspect ratios (kept for UX hints)
const STYLE_PRESETS = [
  { id: 'cinematic', name: 'Cinematic', icon: '🎬' },
  { id: 'anime', name: 'Anime', icon: '🎌' },
  { id: 'cyberpunk', name: 'Cyberpunk', icon: '🌆' },
  { id: '3d-render', name: '3D Render', icon: '🧊' },
  { id: 'watercolor', name: 'Watercolor', icon: '🎨' },
  { id: 'oil-painting', name: 'Oil Painting', icon: '🖼️' },
];

const ASPECT_RATIOS = [
  { id: '9:16', name: '9:16 (TikTok)', icon: '📱' },
  { id: '16:9', name: '16:9 (YouTube)', icon: '💻' },
  { id: '1:1', name: '1:1 (Square)', icon: '🟦' },
];

// Helper to read file as data URL
const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

async function callEvolink(action, payload) {
  const res = await fetch('/api/evolink', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, payload }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    const message = data?.error || `Evolink error (${res.status})`;
    throw new Error(message);
  }
  return data.data;
}

async function pollEvolink(taskId, endpoint) {
  for (let i = 0; i < 120; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const res = await fetch(`/api/evolink?taskId=${encodeURIComponent(taskId)}${endpoint ? `&endpoint=${encodeURIComponent(endpoint)}` : ''}`);
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data?.error || `Status error (${res.status})`);
    }
    const status = data.data?.status || data.data?.task_status || data.data?.data?.status;
    const output = data.data?.output || data.data?.result || data.data?.data?.result || data.data?.data?.output;
    if (status === 'finished' || status === 'succeeded' || status === 'success') {
      return output;
    }
    if (status === 'failed' || status === 'error') {
      throw new Error(data.data?.error || 'Generation failed');
    }
  }
  throw new Error('Generation timeout');
}

function AIStudioPage({ mode: initialMode = 'image' }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState(initialMode); // 'image' | 'video' | 'edit' | 'remix'
  
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('cinematic');
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null); // For image-to-video
  const [uploadedVideo, setUploadedVideo] = useState(null); // For video-to-video
  const [errorMessage, setErrorMessage] = useState('');

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const dataUrl = await readFileAsDataUrl(file);
      setUploadedImage(dataUrl);
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const dataUrl = await readFileAsDataUrl(file);
      setUploadedVideo(dataUrl);
    }
  };

  const buildPayload = async () => {
    const base = { prompt };
    if (mode === 'image') {
      return { ...base, ratio: aspectRatio };
    }
    if (mode === 'video') {
      return { ...base, ratio: aspectRatio, duration: 6 };
    }
    if (mode === 'edit') {
      if (!uploadedImage) throw new Error('Please upload an image first.');
      return { ...base, image_base64: uploadedImage, ratio: aspectRatio, duration: 6 };
    }
    if (mode === 'remix') {
      if (!uploadedVideo) throw new Error('Please upload a video first.');
      return { ...base, video_base64: uploadedVideo, duration: 6 };
    }
    throw new Error('Unknown mode');
  };

  const handleGenerate = async () => {
    try {
      setErrorMessage('');
      if (!prompt && mode !== 'remix' && mode !== 'edit') throw new Error('Please enter a prompt');
      if (mode === 'edit' && !uploadedImage) throw new Error('Please upload an image first');
      if (mode === 'remix' && !uploadedVideo) throw new Error('Please upload a video first');

      setIsGenerating(true);
      setProgress(5);
      setResult(null);

      const payload = await buildPayload();
      let action = 'text-to-image';
      if (mode === 'video') action = 'text-to-video';
      if (mode === 'edit') action = 'image-to-video';
      if (mode === 'remix') action = 'video-to-video';

      const createData = await callEvolink(action, payload);
      const taskId = createData?.task_id || createData?.data?.task_id || createData?.result?.task_id;
      if (!taskId) throw new Error('No task_id returned from Evolink');

      setProgress(15);
      const output = await pollEvolink(taskId);
      setProgress(100);

      // Attempt to extract output URL
      const outputUrl = Array.isArray(output) ? output[0] : (output?.url || output?.video_url || output?.image_url || output);
      if (!outputUrl) throw new Error('No output URL in Evolink response');

      setResult({
        type: mode === 'image' ? 'image' : 'video',
        url: outputUrl
      });
      setIsGenerating(false);
      setProgress(0);
    } catch (error) {
      console.error('Evolink generate error:', error);
      setErrorMessage(error.message || 'Generation failed');
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const handleUseForFaceSwap = () => {
    if (!result) return;
    navigate('/', { 
      state: { 
        fromStudio: true, 
        imageUrl: result.url,
        prompt: prompt
      } 
    });
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "AI Video Generator - AI Studio",
    "description": "Create AI videos and images from text description. Free AI video generator for memes and social media content.",
    "url": "https://faceaihub.com/ai-studio",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "Web Browser",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.7",
      "ratingCount": "85"
    }
  };

  return (
    <div className="ai-studio-container">
      <Helmet>
        <title>
          {mode === 'image' ? 'Text to Image Generator - AI Image Creator | FaceAI Hub' :
           mode === 'video' ? 'Text to Video Generator - AI Video Creator | FaceAI Hub' :
           mode === 'edit' ? 'Image to Video Generator - Convert Image to Video | FaceAI Hub' :
           'Video to Video Generator - Remix Videos with AI | FaceAI Hub'}
        </title>
        <meta name="description" content={
          mode === 'image' ? 'Create AI images from text descriptions! Free AI image generator, generate custom images for face swapping. No watermark.' :
          mode === 'video' ? 'Create AI videos from text descriptions! Free AI video generator, make your own meme videos. No watermark.' :
          mode === 'edit' ? 'Convert images to videos with AI! Upload an image and describe the animation you want. Free AI image to video converter.' :
          'Remix source videos into new AI videos. Upload a video and describe the motion you want.'
        } />
        <meta name="keywords" content={
          mode === 'image' ? 'AI image generator, text to image, create image from text, ai image creator free' :
          mode === 'video' ? 'AI video generator, text to video ai, create meme video from text, ai video creator free' :
          mode === 'edit' ? 'image to video, convert image to video, animate image, ai image to video converter' :
          'video to video, ai video remix, convert video to ai video'
        } />
        <link rel="canonical" href={`https://faceaihub.com/ai-studio/${mode === 'image' ? 'text-to-image' : mode === 'video' ? 'text-to-video' : mode === 'edit' ? 'image-to-video' : 'video-to-video'}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={
          mode === 'image' ? 'Text to Image Generator - AI Image Creator' :
          mode === 'video' ? 'Text to Video Generator - AI Video Creator' :
          mode === 'edit' ? 'Image to Video Generator - Convert Image to Video' :
          'Video to Video Generator - Remix Videos with AI'
        } />
        <meta property="og:description" content={
          mode === 'image' ? 'Create AI images from text descriptions instantly.' :
          mode === 'video' ? 'Create AI videos from text descriptions instantly.' :
          mode === 'edit' ? 'Convert images to videos with AI animation.' :
          'Remix videos with AI using your own source clips.'
        } />
        <meta property="og:url" content={`https://faceaihub.com/ai-studio/${mode === 'image' ? 'text-to-image' : mode === 'video' ? 'text-to-video' : mode === 'edit' ? 'image-to-video' : 'video-to-video'}`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://faceaihub.com/og-image.jpg" />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="studio-header-mobile">
        <h1>
          {mode === 'image' ? '✨ Text to Image' :
           mode === 'video' ? '✨ Text to Video' :
           '✨ Image to Video'}
        </h1>
      </div>

        <div className="studio-layout">
          {/* Left Panel: Controls */}
          <div className="studio-controls glass-panel">
            <div className="controls-header">
              <h2>
                {mode === 'image' ? 'Text to Image' : 
               mode === 'video' ? 'Text to Video' : 
               mode === 'edit' ? 'Image to Video' : 'Video to Video'}
            </h2>
          </div>

          <div className="control-scroll-area">
            {/* Image Upload for Edit Mode */}
            {mode === 'edit' && (
              <div className="control-group">
                <label>Upload Image to Edit</label>
                <div className="studio-upload-box">
                  {uploadedImage ? (
                    <div className="studio-uploaded-preview">
                      <img src={uploadedImage} alt="Upload" />
                      <button onClick={() => setUploadedImage(null)} className="studio-remove-btn">✕</button>
                    </div>
                  ) : (
                    <label className="studio-upload-label">
                      <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
                      <span className="upload-icon">📤</span>
                      <span>Click to Upload Image</span>
                    </label>
                  )}
                </div>
              </div>
            )}
            {mode === 'remix' && (
              <div className="control-group">
                <label>Upload Video to Remix</label>
                <div className="studio-upload-box">
                  <label className="studio-upload-label">
                    <input type="file" accept="video/*" onChange={handleVideoUpload} hidden />
                    <span className="upload-icon">📤</span>
                    <span>Click to Upload Video</span>
                  </label>
                </div>
              </div>
            )}

            {/* Prompt Input */}
            <div className="control-group">
              <label>
                {mode === 'image' ? 'Prompt' :
                 mode === 'video' ? 'Prompt' :
                 mode === 'edit' ? 'Transformation Prompt' : 'Remix Prompt'}
              </label>
              <textarea 
                className="prompt-input"
                placeholder={mode === 'image' 
                  ? "Describe the image you want to create... (e.g., A futuristic cyberpunk city with neon lights, cinematic lighting, highly detailed)" 
                  : mode === 'video'
                    ? "Describe the video you want to create... (e.g., A cinematic drone shot of a mountain peak at sunset, smooth camera movement, epic landscape)"
                    : mode === 'edit'
                      ? "Describe how to transform this image into a video... (e.g., Make the person dance smoothly, add flowing effects, create smooth movement, animate the background)"
                      : "Describe how to remix this video... (e.g., Add cinematic slow motion, enhance colors, apply anime style)"}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={6}
              />
            </div>

            {/* Aspect Ratio */}
            <div className="control-group">
              <label>Aspect Ratio</label>
              <div className="ratio-selector">
                {ASPECT_RATIOS.map(ratio => (
                  <button
                    key={ratio.id}
                    className={`ratio-btn ${aspectRatio === ratio.id ? 'active' : ''}`}
                    onClick={() => setAspectRatio(ratio.id)}
                  >
                    {ratio.icon} {ratio.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="action-area-fixed">
            <button 
              className={`generate-magic-btn ${isGenerating ? 'generating' : ''}`}
              onClick={handleGenerate}
              disabled={isGenerating || !prompt || (mode === 'edit' && !uploadedImage)}
            >
              {isGenerating ? (
                <>
                  <div className="spinner-small"></div>
                  {mode === 'image' ? 'Generating Image...' :
                   mode === 'video' ? 'Generating Video...' :
                   'Transforming to Video...'} {Math.round(progress)}%
                </>
              ) : (
                <>✨ {mode === 'image' ? 'Generate Image' :
                      mode === 'video' ? 'Generate Video' :
                      'Transform to Video'}</>
              )}
            </button>
            {isGenerating && (
              <div className="progress-bar-mini">
                <div className="progress-fill-mini" style={{ width: `${progress}%` }}></div>
              </div>
            )}
            <div className="cost-info">
              <span>⚡ 1 Credit per generation</span>
            </div>
          </div>
        </div>

        {/* Right Panel: Preview */}
        <div className="studio-preview-area">
          {result ? (
            <div className="result-viewer glass-panel">
              <div className="result-media-container">
                {result.type === 'image' ? (
                  <img src={result.url} alt="AI Generated" className="result-media" />
                ) : (
                  <video src={result.url} autoPlay loop muted controls className="result-media" />
                )}
              </div>
              <div className="result-actions-bar">
                <button className="action-btn primary">📥 Download</button>
                <button onClick={handleUseForFaceSwap} className="action-btn secondary">
                  🎭 Use for Face Swap
                </button>
              </div>
            </div>
          ) : (
            <div className="empty-state-container">
              <div className="empty-state-content">
                <div className="empty-icon">
                  {mode === 'image' ? '🎨' : mode === 'video' ? '🎬' : '🪄'}
                </div>
                <h3>
                  {mode === 'image' ? 'Ready to Create Images?' :
                   mode === 'video' ? 'Ready to Create Videos?' :
                   'Ready to Transform Images?'}
                </h3>
                <p>
                  {mode === 'image' ? 'Enter a prompt on the left to start generating amazing AI images.' :
                   mode === 'video' ? 'Enter a prompt on the left to start generating amazing AI videos.' :
                   'Upload an image and describe how to transform it into a video.'}
                </p>
                <div className="example-prompts">
                  {mode === 'image' && (
                    <>
                      <span onClick={() => setPrompt("A cute cat astronaut on Mars, cinematic lighting, 8k")}>
                        Try: "A cute cat astronaut on Mars"
                      </span>
                      <span onClick={() => setPrompt("Cyberpunk street food vendor, neon lights, rainy night, highly detailed")}>
                        Try: "Cyberpunk street food vendor"
                      </span>
                    </>
                  )}
                  {mode === 'video' && (
                    <>
                      <span onClick={() => setPrompt("A cinematic drone shot of a mountain peak at sunset, smooth camera movement, epic landscape")}>
                        Try: "Cinematic mountain peak at sunset"
                      </span>
                      <span onClick={() => setPrompt("A futuristic cityscape with flying cars, dynamic camera angles, neon lights")}>
                        Try: "Futuristic cityscape with flying cars"
                      </span>
                    </>
                  )}
                  {mode === 'edit' && (
                    <>
                      <span onClick={() => setPrompt("Make the person dance smoothly, add flowing effects, create smooth movement")}>
                        Try: "Make the person dance smoothly"
                      </span>
                      <span onClick={() => setPrompt("Animate the background, add flowing effects, create smooth movement")}>
                        Try: "Animate the background"
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AIStudioPage;
