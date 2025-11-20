import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

function HowToPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Create Face Swap Video Online Free",
    "description": "Step-by-step guide to create face swap videos using FaceAI Hub's free online tool",
    "step": [
      {
        "@type": "HowToStep",
        "position": 1,
        "name": "Choose a Template",
        "text": "Browse our collection of 30+ video templates and select one that matches your style. We have categories like Emotional Reactions, Magic Effects, Dance, and more.",
        "image": "https://faceaihub.com/images/step1-choose-template.jpg"
      },
      {
        "@type": "HowToStep",
        "position": 2,
        "name": "Upload Your Photo",
        "text": "Click the upload button or drag and drop your photo. For duo templates, upload two photos. Supported formats: JPEG, PNG, WebP. Maximum size: 5MB.",
        "image": "https://faceaihub.com/images/step2-upload-photo.jpg"
      },
      {
        "@type": "HowToStep",
        "position": 3,
        "name": "Generate Your Video",
        "text": "Click 'Create Video' and wait 15-30 seconds for AI processing. You can track progress in real-time with our progress bar.",
        "image": "https://faceaihub.com/images/step3-generate-video.jpg"
      },
      {
        "@type": "HowToStep",
        "position": 4,
        "name": "Download and Share",
        "text": "Once complete, preview your face swap video and download it in MP4 format. Share on TikTok, Instagram, or any social media platform!",
        "image": "https://faceaihub.com/images/step4-download-share.jpg"
      }
    ],
    "totalTime": "PT30S",
    "tool": {
      "@type": "HowToTool",
      "name": "FaceAI Hub"
    }
  }

  return (
    <>
      <Helmet>
        <title>How to Create Face Swap Video Online Free - Step by Step Guide | FaceAI Hub</title>
        <meta name="description" content="Learn how to create face swap videos online for free. Complete step-by-step tutorial with tips and tricks. No app download required - works in browser!" />
        <meta name="keywords" content="how to create face swap video online free, face swap video tutorial step by step, how to make funny meme video with face swap, face swap video maker online tutorial" />
        <link rel="canonical" href="https://faceaihub.com/how-to-create-face-swap-video" />
        
        {/* Open Graph */}
        <meta property="og:title" content="How to Create Face Swap Video Online Free - Step by Step Guide" />
        <meta property="og:description" content="Learn how to create face swap videos online for free. Complete tutorial with tips and tricks." />
        <meta property="og:url" content="https://faceaihub.com/how-to-create-face-swap-video" />
        <meta property="og:type" content="article" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="how-to-page">
        <div className="how-to-header">
          <nav className="breadcrumb">
            <Link to="/">Home</Link>
            <span> / </span>
            <span>How To</span>
          </nav>
          
          <h1>How to Create Face Swap Video Online Free</h1>
          <p className="intro-text">
            Creating face swap videos has never been easier! Follow our simple step-by-step guide 
            to create hilarious face swap memes in just 30 seconds. No app download required - 
            everything works right in your browser.
          </p>
        </div>

        <div className="how-to-content">
          <section className="steps-section">
            <div className="step-item">
              <div className="step-number">1</div>
              <div className="step-content">
                <h2>Choose a Template</h2>
                <p>
                  Browse our collection of <strong>30+ video templates</strong> organized into 7 categories:
                </p>
                <ul>
                  <li><Link to="/templates/emotional-reactions">Emotional Reactions</Link> - Surprised, laughing, crying reactions</li>
                  <li><Link to="/templates/magic-effects">Magic Effects</Link> - Fantasy transformations and supernatural effects</li>
                  <li><Link to="/templates/slapstick-comedy">Slapstick Comedy</Link> - Hilarious comedy memes</li>
                  <li><Link to="/templates/sci-fi-effects">Sci-Fi Effects</Link> - Futuristic and cyberpunk styles</li>
                  <li><Link to="/templates/style-makeovers">Style Makeovers</Link> - Fashion transformations</li>
                  <li><Link to="/templates/burlesque-dance">Burlesque Dance</Link> - Fun dance templates</li>
                  <li><Link to="/templates/duo-interaction">Duo Interaction</Link> - Two-person face swap templates</li>
                </ul>
                <p>
                  <strong>Tip:</strong> For best results, choose a template that matches the emotion or style you want to create.
                </p>
              </div>
            </div>

            <div className="step-item">
              <div className="step-number">2</div>
              <div className="step-content">
                <h2>Upload Your Photo</h2>
                <p>Upload your photo using one of these methods:</p>
                <ul>
                  <li><strong>Click Upload:</strong> Click the upload button and select your photo from your device</li>
                  <li><strong>Drag & Drop:</strong> Simply drag your photo into the upload area</li>
                  <li><strong>Mobile:</strong> Tap the upload area to select from your phone's gallery</li>
                </ul>
                <p><strong>Photo Requirements:</strong></p>
                <ul>
                  <li>Formats: JPEG, PNG, or WebP</li>
                  <li>Maximum size: 5MB (we automatically compress larger files)</li>
                  <li>Best quality: Clear, front-facing photo with good lighting</li>
                  <li>For duo templates: Upload two photos (one for each person)</li>
                </ul>
                <p>
                  <strong>Tip:</strong> Photos are automatically compressed to optimize processing speed while maintaining quality.
                </p>
              </div>
            </div>

            <div className="step-item">
              <div className="step-number">3</div>
              <div className="step-content">
                <h2>Generate Your Video</h2>
                <p>Click the <strong>"Create Video"</strong> button to start processing:</p>
                <ul>
                  <li>Processing time: <strong>15-30 seconds</strong> (depending on video length)</li>
                  <li>Real-time progress: Watch the progress bar and estimated time</li>
                  <li>No account required: Free users get 3 videos per day</li>
                  <li>More generations: <Link to="/">Sign in with Google</Link> to get 6 videos per day</li>
                </ul>
                <p>
                  <strong>What happens during processing?</strong> Our AI analyzes your photo, detects facial features, 
                  and seamlessly replaces the face in the video template using advanced machine learning technology.
                </p>
              </div>
            </div>

            <div className="step-item">
              <div className="step-number">4</div>
              <div className="step-content">
                <h2>Download and Share</h2>
                <p>Once your video is ready:</p>
                <ul>
                  <li><strong>Preview:</strong> Watch your face swap video in the preview player</li>
                  <li><strong>Download:</strong> Click "Download Video" to save as MP4 file</li>
                  <li><strong>Share:</strong> Share directly to TikTok, Instagram, Facebook, or any platform</li>
                  <li><strong>No Watermark:</strong> All videos are watermark-free!</li>
                </ul>
                <p>
                  <strong>Video Quality:</strong> All videos are generated in high-quality MP4 format, 
                  optimized for social media sharing.
                </p>
              </div>
            </div>
          </section>

          <section className="tips-section">
            <h2>Pro Tips for Best Results</h2>
            <div className="tips-grid">
              <div className="tip-card">
                <h3>📸 Photo Quality</h3>
                <p>Use clear, well-lit photos with your face clearly visible. Front-facing photos work best.</p>
              </div>
              <div className="tip-card">
                <h3>🎭 Template Selection</h3>
                <p>Choose templates that match the emotion or style you want. Emotional reactions work great for reactions!</p>
              </div>
              <div className="tip-card">
                <h3>👥 Duo Templates</h3>
                <p>For duo templates, upload two clear photos. Perfect for creating couple or friend memes!</p>
              </div>
              <div className="tip-card">
                <h3>⚡ Processing Speed</h3>
                <p>Shorter videos process faster. Most templates are 3-5 seconds, perfect for social media!</p>
              </div>
            </div>
          </section>

          <section className="faq-section">
            <h2>Common Questions</h2>
            <div className="faq-mini">
              <div className="faq-item-mini">
                <h3>Do I need to download an app?</h3>
                <p>No! FaceAI Hub works entirely in your browser. No app download required.</p>
              </div>
              <div className="faq-item-mini">
                <h3>Is it really free?</h3>
                <p>Yes! Free users get 3 videos per day. Sign in with Google for 6 videos per day.</p>
              </div>
              <div className="faq-item-mini">
                <h3>Will there be a watermark?</h3>
                <p>No! All generated videos are completely watermark-free.</p>
              </div>
              <div className="faq-item-mini">
                <h3>Can I use it on mobile?</h3>
                <p>Yes! FaceAI Hub is fully responsive and works on all mobile devices.</p>
              </div>
            </div>
            <Link to="/faq" className="view-all-faq">View All FAQs →</Link>
          </section>

          <section className="cta-section">
            <h2>Ready to Create Your Face Swap Video?</h2>
            <p>Start creating hilarious memes in seconds - it's free and easy!</p>
            <Link to="/" className="cta-button">Start Creating Now →</Link>
          </section>

          <section className="related-links">
            <h2>Related Resources</h2>
            <div className="links-grid">
              <Link to="/best-face-swap-tool" className="resource-link">
                Best Face Swap Video Tool 2025
              </Link>
              <Link to="/templates" className="resource-link">
                Browse All Templates
              </Link>
              <Link to="/faq" className="resource-link">
                Frequently Asked Questions
              </Link>
              <Link to="/no-watermark-face-swap" className="resource-link">
                No Watermark Face Swap
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}

export default HowToPage

