import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

const FAQ_ITEMS = [
  {
    question: 'What is face swap?',
    answer: 'Face swap is a technology that allows you to replace faces in videos or images using AI. Our tool uses advanced machine learning to seamlessly swap faces in video templates, creating funny and entertaining memes.'
  },
  {
    question: 'Is FaceAI Hub free to use?',
    answer: 'Yes! FaceAI Hub is completely free to use. Non-registered users can create 3 videos per day, and registered users get 6 videos per day. No credit card required.'
  },
  {
    question: 'How do I create a face swap video?',
    answer: 'Creating a face swap video is easy: 1) Choose a template from our collection, 2) Upload your photo (or two photos for duo templates), 3) Click "Create Video" and wait for processing, 4) Download your result! The whole process takes about 15-30 seconds.'
  },
  {
    question: 'What photo formats are supported?',
    answer: 'We support JPEG, PNG, and WebP image formats. Photos are automatically compressed to optimize processing speed. Maximum file size is 5MB.'
  },
  {
    question: 'How long does it take to generate a face swap video?',
    answer: 'Most face swap videos are generated in 15-30 seconds. Processing time depends on video length and complexity. You can track progress in real-time on our progress bar.'
  },
  {
    question: 'Can I use face swap videos commercially?',
    answer: 'Generated videos are for personal and entertainment use. For commercial use, please ensure you have rights to all content used, including the template and your photo.'
  },
  {
    question: 'Do I need to create an account?',
    answer: 'No account is required to use FaceAI Hub. However, creating a free account with Google login gives you more daily generations (6 vs 3) and saves your videos to "My Videos" for easy access.'
  },
  {
    question: 'What is the difference between single and duo face swap?',
    answer: 'Single face swap replaces one face in a video template. Duo face swap (Duo Interaction category) allows you to replace two faces in videos that feature two people, perfect for couple memes or friend videos.'
  },
  {
    question: 'Can I download the videos?',
    answer: 'Yes! All generated videos can be downloaded in MP4 format. Simply click the "Download Video" button after generation is complete.'
  },
  {
    question: 'Why is my face swap not working?',
    answer: 'Common issues: 1) Photo quality too low - use a clear, front-facing photo, 2) Face not clearly visible - ensure your face is well-lit and unobstructed, 3) File size too large - we automatically compress, but very large files may fail. If problems persist, try a different photo.'
  },
  {
    question: 'Are my photos stored?',
    answer: 'Photos are temporarily stored during processing and then deleted. Generated videos are stored only if you\'re logged in and choose to save them to "My Videos". We do not share your photos or videos with third parties.'
  },
  {
    question: 'Can I use face swap on mobile?',
    answer: 'Yes! FaceAI Hub is fully responsive and works on all mobile devices. You can upload photos directly from your phone and create face swap videos on the go.'
  },
  {
    question: 'What video quality do I get?',
    answer: 'All generated videos are high-quality MP4 format, optimized for sharing on social media platforms like Instagram, TikTok, and Facebook.'
  },
  {
    question: 'How many templates are available?',
    answer: 'We currently offer 30+ video templates across 7 categories: Emotional Reactions, Magic Effects, Slapstick Comedy, Sci-Fi Effects, Style Makeovers, Burlesque Dance, and Duo Interaction. New templates are added regularly.'
  },
  {
    question: 'Is there a watermark on the videos?',
    answer: 'No! All generated videos are watermark-free. You can download and share them without any branding or watermarks.'
  }
]

function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null)

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  // 结构化数据 - FAQPage
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQ_ITEMS.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  }

  return (
    <>
      <Helmet>
        <title>Face Swap FAQ - Frequently Asked Questions | FaceAI Hub</title>
        <meta name="description" content="Get answers to common questions about face swap videos, AI meme generation, and using FaceAI Hub. Learn how to create face swap videos for free." />
        <meta name="keywords" content="face swap FAQ, face swap questions, face swap help, face swap problems, face swap troubleshooting" />
        <link rel="canonical" href="https://faceaihub.com/faq" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Face Swap FAQ - Frequently Asked Questions" />
        <meta property="og:description" content="Get answers to common questions about face swap videos and AI meme generation." />
        <meta property="og:url" content="https://faceaihub.com/faq" />
        <meta property="og:type" content="website" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(faqStructuredData)}
        </script>
      </Helmet>

      <div className="faq-page">
        <div className="faq-header">
          <nav className="breadcrumb">
            <Link to="/">Home</Link>
            <span> / </span>
            <span>FAQ</span>
          </nav>
          
          <h1>Frequently Asked Questions</h1>
          <p className="faq-intro">
            Find answers to common questions about FaceAI Hub, face swap technology, and creating memes.
            Can't find what you're looking for? <Link to="/contact">Contact us</Link>.
          </p>
        </div>

        <div className="faq-content">
          <div className="faq-list">
            {FAQ_ITEMS.map((item, index) => (
              <div key={index} className="faq-item">
                <button
                  className={`faq-question ${openIndex === index ? 'open' : ''}`}
                  onClick={() => toggleFAQ(index)}
                  aria-expanded={openIndex === index}
                >
                  <span>{item.question}</span>
                  <span className="faq-icon">{openIndex === index ? '−' : '+'}</span>
                </button>
                {openIndex === index && (
                  <div className="faq-answer">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <section className="related-links">
            <h2>Related Resources</h2>
            <div className="links-grid">
              <Link to="/how-to-face-swap" className="resource-link">
                📖 How to Create Face Swap Videos
              </Link>
              <Link to="/templates" className="resource-link">
                🎬 Browse Templates
              </Link>
              <Link to="/best-face-swap-tool" className="resource-link">
                🔍 Best Face Swap Tools Comparison
              </Link>
            </div>
          </section>

          <section className="still-have-questions">
            <h2>Still Have Questions?</h2>
            <p>
              If you couldn't find the answer you're looking for, feel free to reach out to us. 
              We're here to help!
            </p>
            <Link to="/contact" className="contact-button">
              Contact Support
            </Link>
          </section>
        </div>
      </div>
    </>
  )
}

export default FAQPage

