import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

// Mock Styles Data
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

// Mock Results Database (Better quality images)
const MOCK_RESULTS = {
  'cinematic': [
    'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000&auto=format&fit=crop'
  ],
  'anime': [
    'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1560972550-aba3456b5564?q=80&w=1000&auto=format&fit=crop'
  ],
  'cyberpunk': [
    'https://images.unsplash.com/photo-1635322966219-b75ed372eb01?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1515630278258-407f66498911?q=80&w=1000&auto=format&fit=crop'
  ],
  '3d-render': [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1633419461186-7d40a2e10e7e?q=80&w=1000&auto=format&fit=crop'
  ],
  'default': 'https://images.unsplash.com/photo-1635322966219-b75ed372eb01?q=80&w=1000&auto=format&fit=crop'
};

function AIStudioPage({ mode: initialMode = 'image' }) {
  const navigate = useNavigate();
  const [mode] = useState(initialMode); // 'image' | 'video' | 'edit' - now controlled by route
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('cinematic');
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null); // For Edit mode

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setUploadedImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = () => {
    if (!prompt) return;
    if (mode === 'edit' && !uploadedImage) return; // Edit mode requires image

    setIsGenerating(true);
    setProgress(0);
    setResult(null);
    
    // Simulate progressive generation
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        
        // Generation complete
        setTimeout(() => {
          setIsGenerating(false);
          
          // Select a random image based on style
          const styleImages = MOCK_RESULTS[selectedStyle] || MOCK_RESULTS['default'];
          const randomImage = Array.isArray(styleImages) 
            ? styleImages[Math.floor(Math.random() * styleImages.length)] 
            : styleImages;
            
          setResult({
            type: mode === 'video' ? 'video' : 'image',
            url: mode === 'video' 
              ? 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbW50eHR4eXh4eXh4eXh4eXh4eXh4eXh4eXh4eXh4eXh4eSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7btP1aG4yd8RQ06s/giphy.mp4'
              : randomImage // In edit mode, this would be the edited image
          });
        }, 500);
      }
      setProgress(Math.min(currentProgress, 99));
    }, 300);
  };

  const handleUseForFaceSwap = () => {
    if (!result) return;
    
    // Navigate to Home and pass the image data
    navigate('/', { 
      state: { 
        fromStudio: true, 
        imageUrl: result.url,
        prompt: prompt
      } 
    });
  };

  // ... existing imports ...

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
           'Image to Video Generator - Convert Image to Video | FaceAI Hub'}
        </title>
        <meta name="description" content={
          mode === 'image' ? 'Create AI images from text descriptions! Free AI image generator, generate custom images for face swapping. No watermark.' :
          mode === 'video' ? 'Create AI videos from text descriptions! Free AI video generator, make your own meme videos. No watermark.' :
          'Convert images to videos with AI! Upload an image and describe the animation you want. Free AI image to video converter.'
        } />
        <meta name="keywords" content={
          mode === 'image' ? 'AI image generator, text to image, create image from text, ai image creator free' :
          mode === 'video' ? 'AI video generator, text to video ai, create meme video from text, ai video creator free' :
          'image to video, convert image to video, animate image, ai image to video converter'
        } />
        <link rel="canonical" href={`https://faceaihub.com/ai-studio/${mode === 'image' ? 'text-to-image' : mode === 'video' ? 'text-to-video' : 'image-to-video'}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={
          mode === 'image' ? 'Text to Image Generator - AI Image Creator' :
          mode === 'video' ? 'Text to Video Generator - AI Video Creator' :
          'Image to Video Generator - Convert Image to Video'
        } />
        <meta property="og:description" content={
          mode === 'image' ? 'Create AI images from text descriptions instantly.' :
          mode === 'video' ? 'Create AI videos from text descriptions instantly.' :
          'Convert images to videos with AI animation.'
        } />
        <meta property="og:url" content={`https://faceaihub.com/ai-studio/${mode === 'image' ? 'text-to-image' : mode === 'video' ? 'text-to-video' : 'image-to-video'}`} />
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
               'Image to Video'}
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

            {/* Prompt Input */}
            <div className="control-group">
              <label>
                {mode === 'image' ? 'Prompt' :
                 mode === 'video' ? 'Prompt' :
                 'Transformation Prompt'}
              </label>
              <textarea 
                className="prompt-input"
                placeholder={mode === 'image' 
                  ? "Describe the image you want to create... (e.g., A futuristic cyberpunk city with neon lights, cinematic lighting, highly detailed)" 
                  : mode === 'video'
                    ? "Describe the video you want to create... (e.g., A cinematic drone shot of a mountain peak at sunset, smooth camera movement, epic landscape)"
                    : "Describe how to transform this image into a video... (e.g., Make the person dance smoothly, add flowing effects, create smooth movement, animate the background)"}
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
                <div className="empty-icon">🎨</div>
                <h3>Ready to Create?</h3>
                <p>Enter a prompt on the left to start generating amazing AI content.</p>
                <div className="example-prompts">
                  <span onClick={() => setPrompt("A cute cat astronaut on Mars, cinematic lighting, 8k")}>
                    Try: "A cute cat astronaut on Mars"
                  </span>
                  <span onClick={() => setPrompt("Cyberpunk street food vendor, neon lights, rainy night, highly detailed")}>
                    Try: "Cyberpunk street food vendor"
                  </span>
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
